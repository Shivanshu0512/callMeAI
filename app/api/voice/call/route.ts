import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // Allow an internal worker to trigger calls by passing the SUPABASE_SERVICE_ROLE_KEY
    // in the `x-service-role` header. This lets the scheduler trigger calls without a
    // user session. If the header is not present, fall back to standard auth.
    const serviceRoleHeader = request.headers.get('x-service-role') || ''
    const isInternal = !!(serviceRoleHeader && serviceRoleHeader === process.env.SUPABASE_SERVICE_ROLE_KEY)

    const { scheduleId } = await request.json()
    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 })
    }

    // Get the call schedule. For internal triggers, don't require matching user session.
    let schedule: any = null
    if (isInternal) {
      const { data: sched, error: scheduleError } = await supabase
        .from('call_schedules')
        .select('*')
        .eq('id', scheduleId)
        .single()
      if (scheduleError || !sched) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
      }
      schedule = sched
    } else {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      const { data: sched, error: scheduleError } = await supabase
        .from('call_schedules')
        .select('*')
        .eq('id', scheduleId)
        .eq('user_id', user.id)
        .single()

      if (scheduleError || !sched) {
        return NextResponse.json({ error: 'Schedule not found' }, { status: 404 })
      }
      schedule = sched
    }

    // Determine the user id to operate on
    const targetUserId = schedule.user_id

    // Get user's tasks for the call
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', targetUserId).eq('is_active', true)
    const taskList = tasks || []

    // Get user profile for voice preference and phone number
    const { data: profile } = await supabase
      .from('profiles')
      .select('preferred_voice, phone_number, timezone, full_name')
      .eq('id', targetUserId)
      .single()

    if (!profile?.phone_number) {
      return NextResponse.json({ error: "No phone number found in user profile. Please add your mobile number in settings." }, { status: 400 })
    }

    // Create call log entry (mark in_progress immediately for live logging)
    const { data: callLog, error: callLogError } = await supabase
      .from('call_logs')
      .insert({
        user_id: targetUserId,
        schedule_id: scheduleId,
        call_status: 'in_progress',
        scheduled_at: new Date().toISOString(),
        started_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (callLogError) {
      return NextResponse.json({ error: "Failed to create call log" }, { status: 500 })
    }


    // In a real implementation, you would integrate with a voice calling service
    // like Twilio, Vapi, or similar to make the actual phone call
    // For now, we'll simulate the call initiation

    const callScript = generateCallScript(taskList, profile?.preferred_voice || "alloy")

    // Simulate call initiation with streaming partial transcripts.
    // In a real implementation, your voice provider webhook would write partial transcripts
    // and final transcripts to the `call_logs` row or a `call_log_events` table.
    const simulatedChunks = [
      `Hi ${profile.full_name || "there"}, this is CallMeAI checking in about your tasks.`,
      `First task: ${taskList[0]?.title || "(no task)"}. How did you get on today?`,
      `Second task: ${taskList[1]?.title || "(no task)"}.`,
      `Thanks for sharing — that's helpful. Keep it up!`,
      `Call complete. Logged your responses.`,
    ]

    // write partial transcripts at intervals to simulate streaming
    simulatedChunks.forEach((chunk, idx) => {
      setTimeout(async () => {
        try {
          // append to existing transcript
          const { data: fresh } = await supabase.from('call_logs').select('call_transcript').eq('id', callLog.id).single()
          const existing = fresh?.call_transcript || ""
          const updated = existing ? `${existing}\n${chunk}` : chunk
          await supabase.from("call_logs").update({ call_transcript: updated }).eq("id", callLog.id)
        } catch (e) {
          console.error("Failed to update partial transcript", e)
        }
      }, 1000 * (idx + 1))
    })

    // finalize the call after the last chunk
    setTimeout(async () => {
      try {
        const endedAt = new Date().toISOString()
        const duration = 60 * 3 // simulated 3 minutes
        const { data: finalRow } = await supabase.from('call_logs').select('call_transcript').eq('id', callLog.id).single()
        const finalTranscript = finalRow?.call_transcript || ''
        await supabase.from('call_logs').update({
          call_status: 'completed',
          ended_at: endedAt,
          call_duration: duration,
          call_transcript: finalTranscript,
        }).eq('id', callLog.id)
      } catch (e) {
        console.error("Failed to finalize call log", e)
      }
    }, 1000 * (simulatedChunks.length + 2))

    return NextResponse.json({
      success: true,
      callId: callLog.id,
      message: "Call initiated successfully",
      script: callScript,
    })
  } catch (error) {
    console.error("Call initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate call" }, { status: 500 })
  }
}

function generateCallScript(tasks: any[], voice: string) {
  const greeting = `Hello! This is CallMeAI. I hope you're having a great day! I'm calling to check in on your daily goals and see how you're progressing.`

  const taskQuestions = tasks
    .map((task, index) => {
      if (task.target_value && task.unit) {
        return `Question ${index + 1}: For your goal "${task.title}", how many ${task.unit} have you completed today? Your target is ${task.target_value} ${task.unit}.`
      } else {
        return `Question ${index + 1}: How are you doing with "${task.title}" today? Have you made progress on this goal?`
      }
    })
    .join("\n\n")

  const closing = `Thank you for sharing your progress with me! Remember, consistency is key to building lasting habits. Keep up the great work, and I'll check in with you again soon. Have a wonderful rest of your day!`

  return `${greeting}\n\n${taskQuestions}\n\n${closing}`
}
