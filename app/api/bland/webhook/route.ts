import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Webhook endpoint for Bland.ai to report call completion status and transcript.
 * Bland.ai will POST to this endpoint with call details after the call ends.
 */
export async function POST(request: NextRequest) {
  try {
    // Webhook signature validation (if Bland.ai provides signature header)
    const signature = request.headers.get('x-bland-signature')
    const webhookSecret = process.env.BLAND_WEBHOOK_SECRET
    
    if (webhookSecret && signature) {
      const rawBody = await request.text()
      const crypto = await import('crypto')
      const expectedSignature = crypto.createHmac('sha256', webhookSecret).update(rawBody).digest('hex')
      
      if (signature !== expectedSignature) {
        console.error('Webhook signature validation failed')
        return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
      }
      
      // Parse after validation
      const payload = JSON.parse(rawBody)
      const { call_id, status, transcript, duration, recording_url, events } = payload
      
      if (!call_id) {
        return NextResponse.json({ error: "Missing call_id" }, { status: 400 })
      }
      
      return await processWebhook(payload, await createClient())
    }
    
    // Fallback without signature validation (dev mode)
    const payload = await request.json()
    const { call_id, status, transcript, duration, recording_url, events } = payload

    if (!call_id) {
      return NextResponse.json({ error: "Missing call_id" }, { status: 400 })
    }

    return await processWebhook(payload, await createClient())
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed", details: String(error) }, { status: 500 })
  }
}

async function processWebhook(payload: any, supabase: any) {
  try {
    const { call_id, status, transcript, duration, recording_url, events } = payload

    // Try to match call_log by provider_call_id
    let callLog: any = null
    if (call_id) {
      const { data: rows } = await supabase.from('call_logs').select('id, user_id').eq('provider_call_id', call_id).limit(1)
      if (rows && rows.length > 0) callLog = rows[0]
    }

    // Fallback: try to match by phone number if provided in payload
    if (!callLog && payload.phone_number) {
      const { data: profiles } = await supabase.from('profiles').select('id').eq('phone_number', payload.phone_number).limit(1)
      if (profiles && profiles.length > 0) {
        const userId = profiles[0].id
        const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString()
        const { data: rows } = await supabase
          .from('call_logs')
          .select('id, user_id')
          .eq('user_id', userId)
          .gte('started_at', oneHourAgo)
          .order('started_at', { ascending: false })
          .limit(1)
        if (rows && rows.length > 0) callLog = rows[0]
      }
    }

    // Final fallback: most recent initiated/in_progress call in last hour
    if (!callLog) {
      const oneHourAgo = new Date(Date.now() - 1000 * 60 * 60).toISOString()
      const { data: rows } = await supabase
        .from('call_logs')
        .select('id, user_id')
        .in('call_status', ['initiated', 'in_progress', 'scheduled'])
        .gte('started_at', oneHourAgo)
        .order('started_at', { ascending: false })
        .limit(1)
      if (rows && rows.length > 0) callLog = rows[0]
    }

    if (callLog) {
      // Insert events if present (streaming chunks) with deduplication
      try {
        if (Array.isArray(events) && events.length > 0) {
          for (const ev of events) {
            const text = ev.text || ev.transcript || ev.message || ''
            if (!text) continue
            
            // Deduplication: skip if provider_event_id already exists
            if (ev.id) {
              const { data: existing } = await supabase
                .from('call_log_events')
                .select('id')
                .eq('call_id', callLog.id)
                .eq('provider_event_id', ev.id)
                .limit(1)
              
              if (existing && existing.length > 0) {
                continue // Skip duplicate
              }
            }
            
            await supabase.from('call_log_events').insert({
              call_id: callLog.id,
              speaker: ev.speaker || null,
              text,
              provider_event_id: ev.id || null,
            })
          }
        } else if (transcript) {
          // If no separate events array, treat transcript as a single event chunk
          await supabase.from('call_log_events').insert({
            call_id: callLog.id,
            speaker: null,
            text: transcript,
            provider_event_id: null,
          })
        }
      } catch (e) {
        console.error('Failed to insert call_log_events', e)
      }

      // If the call completed, aggregate events into final transcript and update call_log
      if (status === 'completed') {
        try {
          const { data: evRows } = await supabase
            .from('call_log_events')
            .select('text')
            .eq('call_id', callLog.id)
            .order('created_at', { ascending: true })

          const finalTranscript = (evRows || []).map((r: any) => r.text).join('\n')

          const { error: updateError } = await supabase
            .from('call_logs')
            .update({
              call_status: 'completed',
              ended_at: new Date().toISOString(),
              call_duration: duration || 0,
              call_transcript: finalTranscript || transcript || '',
              recording_url: recording_url || call_id || null,
            })
            .eq('id', callLog.id)

          if (updateError) {
            console.error('Error updating call log on completion:', updateError)
            return NextResponse.json({ error: 'Failed to update call log' }, { status: 500 })
          }

          // Run analysis and persist task responses
          if ((finalTranscript || transcript) && callLog.user_id) {
            try {
              const { default: analyzeAndPersist } = await import('@/lib/analyze/analyzeTranscript')
              await analyzeAndPersist(supabase, callLog.user_id, callLog.id, finalTranscript || transcript, new Date().toISOString())
            } catch (e) {
              console.error('Webhook analysis failed', e)
            }
          }
        } catch (e) {
          console.error('Error finalizing completed call:', e)
        }
      } else {
        // For intermediate updates, mark started/in_progress
        try {
          await supabase.from('call_logs').update({ call_status: 'in_progress', started_at: new Date().toISOString() }).eq('id', callLog.id)
        } catch (e) {
          // ignore
        }
      }
    }

    return NextResponse.json({ success: true, message: "Webhook received and processed" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed", details: String(error) }, { status: 500 })
  }
}

async function parseAndSaveResponses(supabase: any, userId: string, transcript: string) {
  try {
    // Get user's tasks
    const { data: tasks } = await supabase.from("tasks").select("id, title").eq("user_id", userId).eq("is_active", true)

    if (!tasks || tasks.length === 0) return

    // Simple parsing: look for task titles in transcript and mark as completed
    // This is a basic implementation; you can enhance it with NLP/AI for better accuracy
    const today = new Date().toISOString().split("T")[0]

    for (const task of tasks) {
      if (transcript.toLowerCase().includes(task.title.toLowerCase())) {
        // Task was mentioned in the call, assume they provided a response
        await supabase.from("task_responses").insert({
          user_id: userId,
          task_id: task.id,
          response_text: `Responded to during call`,
          response_date: today,
        })
      }
    }
  } catch (error) {
    console.error("Error parsing responses:", error)
  }
}
