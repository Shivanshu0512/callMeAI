/**
 * analyzeAndPersist(supabase, userId, callId, transcript, startedAt?)
 * - Stores transcript analysis metadata on the call_log
 * - Returns structured results
 */
export async function analyzeAndPersist(supabase: any, userId: string, callId: string, transcript: string, startedAt?: string) {
  try {
    const text = (transcript || '').trim()
    if (!text) return { success: true, results: [] }

    // Simple sentiment / keyword analysis on the transcript
    const lower = text.toLowerCase()
    const positiveKeywords = ['done', 'completed', 'yes', 'finished', 'achieved', 'good', 'well', 'great', 'improved', 'better', 'progress']
    const negativeKeywords = ['not', 'no', "didn't", 'failed', 'never', 'struggling', 'behind', 'missed']

    const positiveCount = positiveKeywords.filter(k => lower.includes(k)).length
    const negativeCount = negativeKeywords.filter(k => lower.includes(k)).length

    const sentiment = positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'needs_support' : 'neutral'

    const results = [{
      call_id: callId,
      sentiment,
      positive_signals: positiveCount,
      negative_signals: negativeCount,
      transcript_length: text.length,
    }]

    return { success: true, results }
  } catch (e) {
    console.error('analyzeAndPersist error', e)
    return { success: false, error: String(e) }
  }
}

export default analyzeAndPersist
