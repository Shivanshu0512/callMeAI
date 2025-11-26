import { createClient as createServerClient } from '@/lib/supabase/server'

/**
 * analyzeAndPersist(supabase, userId, callId, transcript, startedAt?)
 * - Runs lightweight heuristics to infer task responses from transcript
 * - Inserts `task_responses` rows
 * - Returns structured results
 */
export async function analyzeAndPersist(supabase: any, userId: string, callId: string, transcript: string, startedAt?: string) {
  try {
    const text = (transcript || '').trim()
    if (!text) return { success: true, results: [] }

    const lower = text.toLowerCase()
    const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('is_active', true)
    const results: any[] = []

    for (const task of tasks || []) {
      const title = (task.title || '').toLowerCase()
      const found = title && lower.includes(title)
      let inferredText: string | null = null
      let responseValue: number | null = null
      let completed = false

      if (found) {
        const idx = lower.indexOf(title)
        const snippet = text.substring(Math.max(0, idx - 120), Math.min(text.length, idx + title.length + 120))
        inferredText = snippet

        const numMatch = snippet.match(/(\d+(?:[\.,]\d+)?)/)
        if (numMatch) {
          const raw = numMatch[1].replace(',', '.')
          responseValue = parseFloat(raw)
          if (task.target_value && responseValue >= Number(task.target_value)) completed = true
        }

        if (/\b(done|completed|yes|finished|achieved|met)\b/i.test(snippet)) completed = true
        if (/\b(not|no|didn't|did not|failed|never)\b/i.test(snippet)) completed = false
        if (!completed && /\b(good|well|great|improved|better)\b/i.test(snippet)) completed = true

        // persist
        try {
          const today = (startedAt ? new Date(startedAt) : new Date()).toISOString().split('T')[0]
          await supabase.from('task_responses').insert({
            user_id: userId,
            task_id: task.id,
            call_id: callId,
            response_value: responseValue,
            response_text: inferredText,
            response_date: today,
            created_at: new Date().toISOString(),
          })
        } catch (e) {
          console.error('analyzeAndPersist: failed to insert task_response', e)
        }
      }

      results.push({
        task_id: task.id,
        task_title: task.title,
        inferred_text: inferredText,
        response_value: responseValue,
        completed,
      })
    }

    return { success: true, results }
  } catch (e) {
    console.error('analyzeAndPersist error', e)
    return { success: false, error: String(e) }
  }
}

export default analyzeAndPersist
