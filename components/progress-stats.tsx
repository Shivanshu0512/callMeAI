"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Phone, Calendar, TrendingUp, Zap } from "lucide-react"

interface CallLog {
  call_status: string
  scheduled_at: string
  call_duration: number | null
}

interface ProgressStatsProps {
  callLogs: CallLog[]
}

export function ProgressStats({ callLogs }: ProgressStatsProps) {
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const recentCalls = callLogs.filter((c) => c.scheduled_at >= sevenDaysAgo.toISOString())

  const completedCalls = recentCalls.filter((c) => c.call_status === "completed").length
  const totalCalls = recentCalls.length
  const callEngagement = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0

  // Total call minutes
  const totalMinutes = Math.round(
    callLogs.reduce((sum, c) => sum + (c.call_duration || 0), 0) / 60
  )

  // Active days (days with at least one call)
  const activeDays = new Set(
    callLogs
      .filter((c) => c.call_status === "completed")
      .map((c) => c.scheduled_at.split("T")[0])
  ).size

  // Streak: consecutive days with completed calls
  const getStreak = () => {
    const today = new Date()
    let streak = 0
    const completedDates = new Set(
      callLogs
        .filter((c) => c.call_status === "completed")
        .map((c) => c.scheduled_at.split("T")[0])
    )

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split("T")[0]

      if (completedDates.has(dateStr)) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return streak
  }

  const stats = [
    {
      title: "Call Engagement",
      value: `${callEngagement}%`,
      description: "Calls completed this week",
      icon: Phone,
    },
    {
      title: "Current Streak",
      value: `${getStreak()}`,
      description: "Consecutive active days",
      icon: Zap,
    },
    {
      title: "Total Call Time",
      value: `${totalMinutes}m`,
      description: "Minutes with your AI coach",
      icon: TrendingUp,
    },
    {
      title: "Active Days",
      value: `${activeDays}`,
      description: "Days with completed calls",
      icon: Calendar,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <div key={index} className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">{stat.title}</p>
                <h3 className="text-3xl font-semibold text-white">{stat.value}</h3>
                <p className="text-xs text-white/25 mt-1">{stat.description}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Icon className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
