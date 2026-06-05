"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface CallLog {
  call_status: string
  scheduled_at: string
  call_duration: number | null
}

interface ProgressChartsProps {
  callLogs: CallLog[]
}

export function ProgressCharts({ callLogs }: ProgressChartsProps) {
  // Call engagement data for the last 14 days
  const getCallEngagementData = () => {
    const data = []
    const today = new Date()

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayCalls = callLogs.filter((c) => c.scheduled_at.startsWith(dateStr))
      const completedCalls = dayCalls.filter((c) => c.call_status === "completed").length

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        scheduled: dayCalls.length,
        completed: completedCalls,
      })
    }

    return data
  }

  const callData = getCallEngagementData()

  return (
    <div className="space-y-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={callData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="date" tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
          <YAxis tick={{ fill: "rgba(255,255,255,0.35)", fontSize: 11 }} />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(20, 20, 30, 0.95)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "white",
            }}
          />
          <Bar dataKey="scheduled" fill="rgba(139, 92, 246, 0.4)" name="Scheduled" radius={[2, 2, 0, 0]} />
          <Bar dataKey="completed" fill="#8b5cf6" name="Completed" radius={[2, 2, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
