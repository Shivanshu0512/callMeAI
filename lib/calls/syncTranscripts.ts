/**
 * Pulls call transcripts directly from the Bland.ai API for call_logs that
 * have a provider_call_id but aren't completed (or lack a transcript).
 *
 * Used by /api/bland/sync, /api/scheduler/tick, and as a recovery path when
 * a Bland webhook delivery is missed (or can't reach localhost in dev).
 */
export async function syncTranscripts(supabase: any): Promise<{ checked: number; synced: any[] }> {
  const blandApiKey = process.env.BLAND_API_KEY
  if (!blandApiKey) {
    return { checked: 0, synced: [] }
  }

  const { data: pending, error } = await supabase
    .from("call_logs")
    .select("id, user_id, provider_call_id")
    .not("provider_call_id", "is", null)
    .or("call_status.neq.completed,has_transcript.eq.false")
    .limit(20)

  if (error) {
    throw new Error(`Failed to query call logs: ${error.message}`)
  }

  const synced: any[] = []
  for (const log of pending || []) {
    const res = await fetch(`https://api.bland.ai/v1/calls/${log.provider_call_id}`, {
      headers: { authorization: blandApiKey },
    })
    if (!res.ok) continue

    const detail = await res.json()
    if (detail.status !== "completed") continue

    const transcript = (detail.concatenated_transcript || "").trim()
    const { error: updateError } = await supabase
      .from("call_logs")
      .update({
        call_status: "completed",
        call_duration: Math.round((detail.call_length || 0) * 60),
        call_transcript: transcript || null,
        has_transcript: !!transcript,
        ended_at: detail.end_at || detail.updated_at || new Date().toISOString(),
        recording_url: detail.recording_url || null,
      })
      .eq("id", log.id)

    if (updateError) {
      console.error("[sync] failed to update call_log", log.id, updateError)
      continue
    }

    // Run the same analysis the webhook would have
    if (transcript && log.user_id) {
      try {
        const { default: analyzeAndPersist } = await import("@/lib/analyze/analyzeTranscript")
        await analyzeAndPersist(supabase, log.user_id, log.id, transcript, detail.started_at)
      } catch (e) {
        console.error("[sync] analysis failed", e)
      }
    }

    synced.push({ id: log.id, provider_call_id: log.provider_call_id, transcript_chars: transcript.length })
  }

  return { checked: pending?.length || 0, synced }
}
