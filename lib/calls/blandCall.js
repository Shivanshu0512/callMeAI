// Resolve fetch lazily: prefer global `fetch` (Node 18+), otherwise dynamic-import `node-fetch`.
let _fetch
async function getFetch() {
  if (typeof fetch !== 'undefined') return fetch
  if (_fetch) return _fetch
  try {
    const mod = await import('node-fetch')
    _fetch = mod.default || mod
    return _fetch
  } catch (e) {
    throw new Error('Fetch is not available in this Node runtime. Install `node-fetch` or use Node 18+.')
  }
}

/**
 * initiateBlandCall(supabase, schedule)
 * - Reads profile/tasks for schedule.user_id
 * - Inserts a call_logs row
 * - Calls Bland.ai API to place the outbound call
 * - Updates call_logs with status and provider id or failure
 */
async function initiateBlandCall(supabase, schedule) {
  const targetUserId = schedule.user_id

  const { data: profile } = await supabase
    .from('profiles')
    .select('phone_number, timezone, preferred_voice, full_name')
    .eq('id', targetUserId)
    .single()

  if (!profile?.phone_number) {
    throw new Error('No phone number found for user')
  }

  // create call log with status scheduled -> will update to initiated
  const { data: callLog, error: callLogError } = await supabase
    .from('call_logs')
    .insert({
      user_id: targetUserId,
      schedule_id: schedule.id,
      call_status: 'scheduled',
      scheduled_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (callLogError) {
    console.error('[bland] failed to create call_log', callLogError)
    throw callLogError
  }

  const conversationScript = generateConversationScript(schedule.name, schedule.topic)
  const blandApiKey = process.env.BLAND_API_KEY
  if (!blandApiKey) {
    throw new Error('BLAND_API_KEY not configured')
  }

  const payload = {
    phone_number: profile.phone_number,
    task: conversationScript,
    language: 'en',
    temperature: 0.7,
    max_duration: 180,
    webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/bland/webhook`,
  }

  const configuredVoice = process.env.BLAND_VOICE
  if (configuredVoice && configuredVoice.trim().length > 0) payload.voice = configuredVoice.trim()
  const configuredModel = process.env.BLAND_MODEL
  if (configuredModel && configuredModel.trim().length > 0) payload.model = configuredModel.trim()

  try {
    const fetch = await getFetch()
    const res = await fetch('https://api.bland.ai/v1/calls', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${blandApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    })

    const data = await res.json().catch(() => null)
    if (!res.ok) {
      console.error('[bland] API error', data)
      await supabase.from('call_logs').update({ call_status: 'failed', error_message: JSON.stringify(data || { status: res.status }) }).eq('id', callLog.id)
      throw new Error('Bland.ai call failed')
    }

    // update call log with initiated + provider call id so webhook/sync can match it later
    await supabase.from('call_logs').update({ call_status: 'initiated', started_at: new Date().toISOString(), provider_call_id: data?.call_id || null }).eq('id', callLog.id)

    return { callLog, blandData: data }
  } catch (e) {
    console.error('[bland] failed to call Bland.ai', e)
    // ensure call_log marked failed
    try {
      await supabase.from('call_logs').update({ call_status: 'failed', error_message: String(e) }).eq('id', callLog.id)
    } catch (ee) {
      console.error('[bland] failed to mark call_log failed', ee)
    }
    throw e
  }
}

function generateConversationScript(scheduleName, topic) {
  const purpose = topic && topic.trim() ? topic.trim() : scheduleName

  return `You are CallMeAI, a brief accountability check-in agent. The user scheduled this call for: "${purpose}".

Keep the call short and crisp — under 2 minutes. Exactly this flow:
1. Greet briefly: one short sentence introducing yourself as CallMeAI and why you're calling.
2. Ask ONE direct question about their progress on "${purpose}". Listen. One short acknowledgment — do not lecture or give long advice.
3. Ask ONE closing question: "Anything else you'd like to share or discuss?" Listen briefly.
4. Thank them in one sentence and end the call.

Rules: no rambling, no repeated questions, no motivational speeches. Short sentences. If the user is busy or quiet, wrap up immediately and end the call politely.`
}

module.exports = { initiateBlandCall }
