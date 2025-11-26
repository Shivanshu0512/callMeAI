import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import analyzeAndPersist from "@/lib/analyze/analyzeTranscript"

type AnalysisResult = {
	task_id: string
	task_title: string
	inferred_text: string | null
	response_value?: number | null
	completed: boolean
}

export async function POST(request: NextRequest) {
	try {
		const supabase = await createClient()
		const {
			data: { user },
			error: authError,
		} = await supabase.auth.getUser()

		if (authError || !user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
		}

		const { callId } = await request.json()
		if (!callId) {
			return NextResponse.json({ error: "callId is required" }, { status: 400 })
		}

		// fetch call log and transcript
		const { data: callRow, error: callError } = await supabase.from('call_logs').select('*').eq('id', callId).single()
		if (callError || !callRow) return NextResponse.json({ error: 'Call not found' }, { status: 404 })

		const transcript = (callRow.call_transcript || '').trim()

		// delegate to shared analyzer
		const analysis = await analyzeAndPersist(supabase, user.id, callId, transcript, callRow.started_at)

		// Derive recommendations from results
		const results = analysis.results || []
		const notCompleted = results.filter((r: any) => !r.completed)
		const recommendations = notCompleted.map((r: any) => ({ task_id: r.task_id, title: r.task_title, suggestion: `Try breaking "${r.task_title}" into smaller steps or schedule it on easier days.` }))

		return NextResponse.json({ success: true, results, recommendations })
	} catch (err) {
		console.error("Analyze error", err)
		return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
	}
}

