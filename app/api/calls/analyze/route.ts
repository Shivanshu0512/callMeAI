import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import analyzeAndPersist from "@/lib/analyze/analyzeTranscript"

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

		return NextResponse.json({ success: true, results: analysis.results || [] })
	} catch (err) {
		console.error("Analyze error", err)
		return NextResponse.json({ error: "Analysis failed" }, { status: 500 })
	}
}
