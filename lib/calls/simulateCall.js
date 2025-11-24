const { DateTime } = require('luxon')

/**
 * initiateSimulatedCall(supabase, targetUserId, scheduleId)
 * - Creates a call_logs row using the provided Supabase client
 * - Streams simulated transcript chunks to the call_logs row
 * - Finalizes the call row after the simulated duration
 * Returns the created call log row
 */
async function initiateSimulatedCall(supabase, targetUserId, scheduleId) {
  // fetch tasks and profile
  console.log('[simulator] initiating simulated call', { targetUserId, scheduleId, supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL })
  const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', targetUserId).eq('is_active', true)
  const taskList = tasks || []

  const { data: profile } = await supabase
    .from('profiles')
    .select('preferred_voice, phone_number, timezone, full_name')
    .eq('id', targetUserId)
    .single()

  if (!profile?.phone_number) {
    throw new Error('No phone number found for user')
  }

  // create call log
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
    console.error('[simulator] callLog insert error', callLogError)
    throw callLogError
  }
  console.log('[simulator] callLog inserted', callLog)

  const simulatedChunks = [
    `Hi ${profile.full_name || 'there'}, this is CallMeAI checking in about your tasks.`,
    `First task: ${taskList[0]?.title || '(no task)'}. How did you get on today?`,
    `Second task: ${taskList[1]?.title || '(no task)'}.`,
    `Thanks for sharing — that's helpful. Keep it up!`,
    `Call complete. Logged your responses.`,
  ]

  // write partial transcripts at intervals to simulate streaming
  simulatedChunks.forEach((chunk, idx) => {
    setTimeout(async () => {
      try {
        const { data: fresh } = await supabase.from('call_logs').select('call_transcript').eq('id', callLog.id).single()
        const existing = fresh?.call_transcript || ''
        const updated = existing ? `${existing}\n${chunk}` : chunk
        const { error: updateErr } = await supabase.from('call_logs').update({ call_transcript: updated }).eq('id', callLog.id)
        if (updateErr) {
          console.error('[simulator] failed to write partial transcript', { callLogId: callLog.id, idx, updateErr })
        } else {
          console.log('[simulator] wrote partial transcript', { callLogId: callLog.id, idx, snippet: chunk.slice(0, 60) })
        }
      } catch (e) {
        console.error('Failed to update partial transcript (simulator)', e)
      }
    }, 1000 * (idx + 1))
  })

  // finalize after last chunk
  setTimeout(async () => {
    try {
      const endedAt = new Date().toISOString()
      const duration = 60 * 3
      const { data: finalRow } = await supabase.from('call_logs').select('call_transcript').eq('id', callLog.id).single()
      const finalTranscript = finalRow?.call_transcript || ''
      const { error: finalErr } = await supabase.from('call_logs').update({
        call_status: 'completed',
        ended_at: endedAt,
        call_duration: duration,
        call_transcript: finalTranscript,
      }).eq('id', callLog.id)
      if (finalErr) {
        console.error('[simulator] failed to finalize call log', { callLogId: callLog.id, finalErr })
      } else {
        console.log('[simulator] finalized call log', { callLogId: callLog.id })
      }
    } catch (e) {
      console.error('Failed to finalize simulated call', e)
    }
  }, 1000 * (simulatedChunks.length + 2))

  return callLog
}

module.exports = { initiateSimulatedCall }
