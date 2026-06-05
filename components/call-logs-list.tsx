"use client"

import React, { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Phone, CheckCircle, XCircle, Loader2, Clock } from "lucide-react"

export function CallLogsList() {
  const [calls, setCalls] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

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

        // Metadata only — transcripts stay in the backend for weekly analysis
        const { data } = await supabase
          .from("call_logs")
          .select("id, call_status, call_duration, scheduled_at, started_at, ended_at, schedule_id")
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
      try { channel.unsubscribe() } catch (e) { /* ignore */ }
    }
  }, [])

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "completed":
        return { icon: CheckCircle, color: "text-green-400", bg: "bg-green-500/10", label: "Completed" }
      case "failed":
        return { icon: XCircle, color: "text-red-400", bg: "bg-red-500/10", label: "Failed" }
      case "in_progress":
        return { icon: Loader2, color: "text-yellow-400", bg: "bg-yellow-500/10", label: "In Progress", spin: true }
      default:
        return { icon: Clock, color: "text-white/40", bg: "bg-white/[0.04]", label: status || "Unknown" }
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <Loader2 className="w-5 h-5 text-white/20 animate-spin mx-auto" />
      </div>
    )
  }

  if (calls.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-6 h-6 text-[oklch(0.75_0.18_280)]" />
        </div>
        <p className="text-white/50 font-medium mb-1">No calls yet</p>
        <p className="text-white/25 text-sm">Calls will appear here once your schedules trigger</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {calls.map((call) => {
        const config = getStatusConfig(call.call_status)
        const StatusIcon = config.icon
        const duration = call.call_duration ? `${Math.round(call.call_duration / 60)}m` : null

        return (
          <div key={call.id} className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                {/* Status icon */}
                <div className={`w-8 h-8 rounded-lg ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <StatusIcon className={`w-4 h-4 ${config.color} ${config.spin ? "animate-spin" : ""}`} />
                </div>

                {/* Details */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-white truncate">
                      {new Date(call.scheduled_at).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                    </span>
                    <span className="text-xs text-white/20">
                      {new Date(call.scheduled_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[11px] ${config.color}`}>{config.label}</span>
                    {duration && (
                      <>
                        <span className="text-white/10">·</span>
                        <span className="text-[11px] text-white/25">{duration}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
