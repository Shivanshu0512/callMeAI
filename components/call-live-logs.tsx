"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

interface CallLiveLogsProps {
	callId: string
}

export function CallLiveLogs({ callId }: CallLiveLogsProps) {
	const [callLog, setCallLog] = useState<any | null>(null)
	const [lines, setLines] = useState<string[]>([])
	const [analysis, setAnalysis] = useState<any | null>(null)
	const [loadingAnalysis, setLoadingAnalysis] = useState(false)

	useEffect(() => {
		const supabase = createClient()

		// Fetch initial call log
		;(async () => {
			const { data } = await supabase.from("call_logs").select("*").eq("id", callId).single()
			if (data) {
				setCallLog(data)
				setLines((data.call_transcript || "").split(/\n+/).filter(Boolean))
			}
		})()

		// Subscribe to updates for this call
		const channel = supabase
			.channel("public:call_logs")
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "call_logs", filter: `id=eq.${callId}` },
				(payload: any) => {
					const newRow = payload.new
					setCallLog(newRow)
					setLines((newRow.call_transcript || "").split(/\n+/).filter(Boolean))
				}
			)
			.subscribe()

		return () => {
			try {
				channel.unsubscribe()
			} catch (e) {
				// ignore
			}
		}
	}, [callId])

	const runAnalysis = async () => {
		if (!callLog) return
		setLoadingAnalysis(true)
		setAnalysis(null)
		try {
			const res = await fetch("/api/calls/analyze", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ callId }),
			})
			const data = await res.json()
			setAnalysis(data)
		} catch (err) {
			setAnalysis({ error: "Analysis failed" })
		} finally {
			setLoadingAnalysis(false)
		}
	}

	return (
		<div className="space-y-4">
			<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/3 p-4">
				<div className="flex items-center justify-between mb-3">
					<h4 className="font-semibold text-white">Live Call Log</h4>
					<Badge className={`text-xs ${callLog?.call_status === "in_progress" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : callLog?.call_status === "completed" ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-gray-500/20 text-gray-400 border-gray-500/30"}`}>{callLog?.call_status || "unknown"}</Badge>
				</div>

				<div className="h-48 overflow-y-auto bg-black/30 p-3 rounded-md text-sm text-gray-200">
					{lines.length === 0 ? (
						<p className="text-gray-400">No transcript yet...</p>
					) : (
						lines.map((line, i) => (
							<p key={i} className="mb-2 leading-relaxed">
								<span className="text-gray-300 mr-2">{i + 1}.</span>
								<span>{line}</span>
							</p>
						))
					)}
				</div>

				<div className="mt-3 flex items-center justify-end space-x-2">
					<Button onClick={runAnalysis} disabled={loadingAnalysis || !callLog} size="sm">
						{loadingAnalysis ? "Analyzing…" : "Analyze Transcript"}
					</Button>
				</div>
			</div>

			{analysis && (
				<div className="rounded-xl border border-white/10 bg-gradient-to-br from-white/5 to-white/3 p-4">
					<h4 className="font-semibold text-white mb-2">Analysis</h4>
					{analysis.error ? (
						<p className="text-red-400">{analysis.error}</p>
					) : (
						<div className="space-y-2 text-sm text-gray-200">
							<p className="text-gray-300">Detected task responses:</p>
							{analysis.results && analysis.results.length > 0 ? (
								<ul className="list-disc list-inside">
									{analysis.results.map((r: any) => (
										<li key={r.task_id} className="flex items-center justify-between">
											<div>
												<div className="font-medium">{r.task_title}</div>
												<div className="text-xs text-gray-400">Inferred: {r.inferred_text}</div>
											</div>
											<div className="text-right">
												<div className={`font-semibold ${r.completed ? "text-green-400" : "text-yellow-300"}`}>{r.completed ? "Completed" : "Not completed"}</div>
												{typeof r.response_value === "number" && <div className="text-xs text-gray-400">Value: {r.response_value}</div>}
											</div>
										</li>
									))}
								</ul>
							) : (
								<p className="text-gray-400">No actionable responses detected.</p>
							)}
						</div>
					)}
				</div>
			)}
		</div>
	)
}

