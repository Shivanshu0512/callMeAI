"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { CallLiveLogs } from "@/components/call-live-logs"
import { Button } from "@/components/ui/button"

export function CallLogsList() {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    let mounted = true

    const fetchCalls = async () => {
      setLoading(true)
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
          setCalls([])
          setLoading(false)
          return
        }

        const { data } = await supabase
          .from("call_logs")
          .select("*")
          .eq("user_id", user.id)
          .order("scheduled_at", { ascending: false })

        if (mounted && data) {
          setCalls(data)
        }
      } catch (e) {
        console.error("Failed fetching call logs", e)
      } finally {
        setLoading(false)
      }
    }

    fetchCalls()

    const channel = supabase
      .channel("public:call_logs_all")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "call_logs" },
        (payload: any) => {
          setCalls((prev) => [payload.new, ...prev])
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "call_logs" },
        (payload: any) => {
          setCalls((prev) => prev.map((c) => (c.id === payload.new.id ? payload.new : c)))
        }
      )
      .subscribe()

    return () => {
      mounted = false
      try {
        channel.unsubscribe()
      } catch (e) {
        // ignore
      }
    }
  }, [])

  return (
    <div>
      <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 p-6 mb-6">
        <h3 className="text-xl font-black text-white mb-4">All Calls</h3>

        {loading ? (
          <p className="text-gray-400">Loading calls…</p>
        ) : calls.length === 0 ? (
          <p className="text-gray-400">No calls yet</p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto">
            {calls.map((call) => (
              <div
                key={call.id}
                className={`p-3 rounded-lg border ${selectedCallId === call.id ? "border-blue-400 bg-white/5" : "border-white/10"} cursor-pointer flex items-center justify-between`}
                onClick={() => setSelectedCallId(call.id)}
              >
                <div>
                  <div className="text-sm font-semibold">{new Date(call.scheduled_at).toLocaleString()}</div>
                  <div className="text-xs text-gray-400 mt-1">{call.call_status}</div>
                </div>
                <div className={`w-3 h-3 rounded-full ${call.call_status === "completed" ? "bg-green-500" : call.call_status === "failed" ? "bg-red-500" : "bg-yellow-500"}`} />
              </div>
            ))}
          </div>
        )}

        {selectedCallId && (
          <div className="mt-4">
            <h4 className="text-sm text-gray-300 mb-2">Call Details</h4>
            <CallLiveLogs callId={selectedCallId} />
            <div className="mt-3">
              <Button onClick={() => setSelectedCallId(null)} variant="outline">Close</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
