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

  const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', targetUserId).eq('is_active', true)
  const taskList = tasks || []

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

  const conversationScript = generateConversationScript(taskList || [], schedule.name)
  const blandApiKey = process.env.BLAND_API_KEY
  if (!blandApiKey) {
    throw new Error('BLAND_API_KEY not configured')
  }

  const payload = {
    phone_number: profile.phone_number,
    task: conversationScript,
    language: 'en',
    temperature: 0.7,
    max_duration: 300,
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

    // update call log with initiated
    await supabase.from('call_logs').update({ call_status: 'initiated', started_at: new Date().toISOString(), }).eq('id', callLog.id)

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

function generateConversationScript(tasks, scheduleName) {
  const tasksList = (tasks || [])
    .map((task, index) => {
      if (task.target_value && task.unit) {
        return `${index + 1}. "${task.title}": Target is ${task.target_value} ${task.unit}. Ask how many ${task.unit} they completed today.`
      }
      return `${index + 1}. "${task.title}": Ask if they made progress on this goal today.`
    })
    .join('\n')

  return `You are CallMeAI, a supportive accountability partner. The user scheduled a call named "${scheduleName}".\n\nHere are their tasks to ask about:\n${tasksList}\n\nBe warm and encouraging.`
}

module.exports = { initiateBlandCall }
