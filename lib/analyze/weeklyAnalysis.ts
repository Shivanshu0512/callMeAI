/**
 * Weekly conversation analysis for reports.
 *
 * Analyzes a week's call transcripts: extracts facts and numbers mentioned,
 * commitments made (and whether later calls show they were fulfilled), and
 * habit-building suggestions.
 *
 * Uses any OpenAI-compatible chat API, configured via env:
 *   LLM_API_KEY   - required for LLM analysis (free key: console.groq.com)
 *   LLM_BASE_URL  - default https://api.groq.com/openai/v1
 *   LLM_MODEL     - default llama-3.3-70b-versatile
 * Falls back to keyword/regex heuristics when no key is set or the API fails.
 */

export interface WeekCall {
  date: string // ISO date of the call
  scheduleName?: string | null
  topic?: string | null
  transcript: string
}

export interface ConversationAnalysis {
  engine: "llm" | "heuristic"
  summary: string
  facts: { text: string; date: string }[]
  numbers: { value: string; context: string; date: string }[]
  commitments: {
    text: string
    madeOn: string
    status: "fulfilled" | "partially_fulfilled" | "not_fulfilled" | "pending"
    evidence: string
  }[]
  suggestions: string[]
}

export async function analyzeWeekTranscripts(calls: WeekCall[]): Promise<ConversationAnalysis | null> {
  const withTranscripts = calls.filter((c) => c.transcript && c.transcript.trim().length > 0)
  if (withTranscripts.length === 0) return null

  if (process.env.LLM_API_KEY) {
    try {
      return await llmAnalysis(withTranscripts)
    } catch (e) {
      console.error("[weeklyAnalysis] LLM analysis failed, falling back to heuristics", e)
    }
  }

  return heuristicAnalysis(withTranscripts)
}

async function llmAnalysis(calls: WeekCall[]): Promise<ConversationAnalysis> {
  const baseUrl = process.env.LLM_BASE_URL || "https://api.groq.com/openai/v1"
  const model = process.env.LLM_MODEL || "llama-3.3-70b-versatile"

  const transcriptBlock = calls
    .map((c, i) => {
      const label = c.topic || c.scheduleName || "check-in"
      return `--- Call ${i + 1} | ${c.date} | purpose: ${label} ---\n${c.transcript.trim()}`
    })
    .join("\n\n")

  const prompt = `You are analyzing one week of accountability check-in phone calls between a user and their AI habit-tracking assistant (CallMeAI). The "user" lines are what matters most.

Transcripts (chronological):

${transcriptBlock}

Analyze the week and return STRICT JSON (no markdown, no commentary) with exactly this shape:
{
  "summary": "2-3 sentence overview of the user's week based on what they said",
  "facts": [{ "text": "concrete fact the user stated", "date": "YYYY-MM-DD" }],
  "numbers": [{ "value": "the number/quantity as said", "context": "what it refers to", "date": "YYYY-MM-DD" }],
  "commitments": [{
    "text": "what the user committed to do",
    "madeOn": "YYYY-MM-DD",
    "status": "fulfilled" | "partially_fulfilled" | "not_fulfilled" | "pending",
    "evidence": "quote or reasoning from a later call showing fulfillment, or 'no later call to verify' for pending"
  }],
  "suggestions": ["actionable habit-building suggestion based on the week's patterns"]
}

Rules:
- Only include facts/numbers/commitments the USER actually said — not the assistant.
- A commitment is anything the user said they would do (e.g. "I'll use it every day", "I'll make sure to...").
- Judge fulfillment by cross-referencing LATER calls in the week; if there is no later call mentioning it, status is "pending".
- 2-4 suggestions, specific to this user's patterns, habit-tracker tone.
- Empty arrays are fine when nothing qualifies.`

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LLM_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  })

  if (!res.ok) {
    throw new Error(`LLM API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const parsed = JSON.parse(data.choices?.[0]?.message?.content || "{}")

  return {
    engine: "llm",
    summary: parsed.summary || "",
    facts: Array.isArray(parsed.facts) ? parsed.facts : [],
    numbers: Array.isArray(parsed.numbers) ? parsed.numbers : [],
    commitments: Array.isArray(parsed.commitments) ? parsed.commitments : [],
    suggestions: Array.isArray(parsed.suggestions) ? parsed.suggestions : [],
  }
}

function heuristicAnalysis(calls: WeekCall[]): ConversationAnalysis {
  const facts: ConversationAnalysis["facts"] = []
  const numbers: ConversationAnalysis["numbers"] = []
  const commitments: ConversationAnalysis["commitments"] = []

  const commitmentPatterns = /\b(i('| wi)ll|i will|i am going to|i'm going to|i plan to|make sure (that )?i)\b/i
  const numberPattern = /\b(\d+(?:[.,]\d+)?|one|two|three|four|five|six|seven|eight|nine|ten|twenty|thirty|forty|fifty|sixty|ninety|hundred)\b/i

  for (const call of calls) {
    // Only look at user lines
    const userLines = call.transcript
      .split("\n")
      .filter((l) => l.trim().toLowerCase().startsWith("user:"))
      .map((l) => l.replace(/^\s*user:\s*/i, "").trim())
      .filter(Boolean)

    for (const line of userLines) {
      if (commitmentPatterns.test(line)) {
        commitments.push({ text: line, madeOn: call.date, status: "pending", evidence: "heuristic extraction — verify manually" })
      }
      if (numberPattern.test(line)) {
        const match = line.match(numberPattern)
        numbers.push({ value: match![0], context: line, date: call.date })
      }
      if (line.split(" ").length >= 5) {
        facts.push({ text: line, date: call.date })
      }
    }
  }

  return {
    engine: "heuristic",
    summary: `Analyzed ${calls.length} call(s) this week using basic keyword extraction. Add a free LLM_API_KEY (console.groq.com) to .env for full AI analysis of facts, commitments, and fulfillment.`,
    facts: facts.slice(0, 10),
    numbers: numbers.slice(0, 10),
    commitments: commitments.slice(0, 10),
    suggestions: [
      "Add an LLM_API_KEY to enable AI-powered suggestions based on your call patterns.",
      commitments.length > 0
        ? `You made ${commitments.length} commitment(s) this week — mention them in your next call so fulfillment can be tracked.`
        : "Try stating concrete commitments during calls (e.g. \"I'll do X every day\") so progress can be tracked week over week.",
    ],
  }
}
