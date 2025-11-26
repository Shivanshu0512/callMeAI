"use client"

import { useEffect, useRef, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Badge } from "@/components/ui/badge"

interface CallLiveLogsProps {
	callId: string
}

export function CallLiveLogs({ callId }: CallLiveLogsProps) {
	const [callLog, setCallLog] = useState<any | null>(null)
	const [lines, setLines] = useState<string[]>([])
	const analyzedRef = useRef<Record<string, boolean>>({})

	useEffect(() => {
		const supabase = createClient()

		// Fetch initial call log and call events
		;(async () => {
			const [{ data: callData }, { data: eventsData }] = await Promise.all([
				supabase.from("call_logs").select("*").eq("id", callId).single(),
				supabase.from("call_log_events").select("*").eq("call_id", callId).order("created_at", { ascending: true }),
			])
			if (callData?.data) {
				setCallLog(callData.data)
			}
			if (eventsData) {
				setLines((eventsData || []).map((e: any) => e.text).filter(Boolean))
			}
		})()

		// Subscribe to call_logs updates (status changes)
		const logChannel = supabase
			.channel("public:call_logs")
			.on(
				"postgres_changes",
				{ event: "UPDATE", schema: "public", table: "call_logs", filter: `id=eq.${callId}` },
				(payload: any) => {
					const newRow = payload.new
					setCallLog(newRow)
				}
			)
			.subscribe()

		// Subscribe to new call_log_events for streaming transcript
		const eventsChannel = supabase
			.channel("public:call_log_events")
			.on(
				"postgres_changes",
				{ event: "INSERT", schema: "public", table: "call_log_events", filter: `call_id=eq.${callId}` },
				(payload: any) => {
					const newRow = payload.new
					setLines((prev) => [...prev, newRow.text])
				}
			)
			.subscribe()

		return () => {
			try {
				logChannel.unsubscribe()
				eventsChannel.unsubscribe()
			} catch (e) {
				// ignore
			}
		}
	}, [callId])

	// Auto-run analysis once when call completes (background only)
	useEffect(() => {
		if (!callLog) return
		if (callLog.call_status === "completed" && !analyzedRef.current[callLog.id]) {
			analyzedRef.current[callLog.id] = true
			// fire-and-forget analysis endpoint to persist task_responses
			;(async () => {
				try {
					await fetch('/api/calls/analyze', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ callId: callLog.id }),
					})
				} catch (e) {
					// ignore
				}
			})()
		}
	}, [callLog])

	// analysis now runs automatically in background when call completes

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

				{/* Analysis is now automatic on call completion; manual button removed */}
			</div>

		</div>
	)
}

