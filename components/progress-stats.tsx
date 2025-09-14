"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, Target, Phone, Calendar, Award, Zap } from "lucide-react"

interface Task {
  id: string
  title: string
  target_value: number | null
  unit: string | null
}

interface TaskResponse {
  task_id: string
  response_value: number | null
  response_date: string
  tasks?: {
    title: string
    target_value: number | null
    unit: string | null
  }
}

interface CallLog {
  call_status: string
  scheduled_at: string
  call_duration: number | null
}

interface ProgressStatsProps {
  tasks: Task[]
  responses: TaskResponse[]
  callLogs: CallLog[]
}

export function ProgressStats({ tasks, responses, callLogs }: ProgressStatsProps) {
  // Calculate stats for the last 7 days
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

  const recentResponses = responses.filter((r) => r.response_date >= sevenDaysAgoStr)
  const recentCalls = callLogs.filter((c) => c.scheduled_at >= sevenDaysAgo.toISOString())

  // Calculate completion rate
  const totalPossibleCompletions = tasks.length * 7 // 7 days
  const actualCompletions = recentResponses.length
  const completionRate =
    totalPossibleCompletions > 0 ? Math.round((actualCompletions / totalPossibleCompletions) * 100) : 0

  // Calculate streak (consecutive days with at least one task completed)
  const getStreak = () => {
    const today = new Date()
    let streak = 0

    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(checkDate.getDate() - i)
      const dateStr = checkDate.toISOString().split("T")[0]

      const hasResponse = responses.some((r) => r.response_date === dateStr)
      if (hasResponse) {
        streak++
      } else if (i > 0) {
        // If we hit a day with no responses (and it's not today), break the streak
        break
      }
    }

    return streak
  }

  const currentStreak = getStreak()

  // Calculate average completion percentage
  const getAverageCompletion = () => {
    const taskCompletions = tasks.map((task) => {
      const taskResponses = recentResponses.filter((r) => r.task_id === task.id)
      if (!task.target_value || taskResponses.length === 0) return 0

      const avgValue = taskResponses.reduce((sum, r) => sum + (r.response_value || 0), 0) / taskResponses.length
      return Math.min((avgValue / task.target_value) * 100, 100)
    })

    return taskCompletions.length > 0
      ? Math.round(taskCompletions.reduce((sum, comp) => sum + comp, 0) / taskCompletions.length)
      : 0
  }

  const avgCompletion = getAverageCompletion()

  // Calculate call engagement
  const completedCalls = recentCalls.filter((c) => c.call_status === "completed").length
  const totalCalls = recentCalls.length
  const callEngagement = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0

  // Calculate total active days
  const activeDays = new Set(responses.map((r) => r.response_date)).size

  // Calculate improvement trend (comparing last 7 days to previous 7 days)
  const previousWeekStart = new Date(sevenDaysAgo)
  previousWeekStart.setDate(previousWeekStart.getDate() - 7)
  const previousWeekStr = previousWeekStart.toISOString().split("T")[0]

  const previousWeekResponses = responses.filter(
    (r) => r.response_date >= previousWeekStr && r.response_date < sevenDaysAgoStr,
  )

  const previousWeekCompletions = previousWeekResponses.length
  const currentWeekCompletions = recentResponses.length
  const improvement =
    previousWeekCompletions > 0
      ? Math.round(((currentWeekCompletions - previousWeekCompletions) / previousWeekCompletions) * 100)
      : currentWeekCompletions > 0
        ? 100
        : 0

  const stats = [
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      description: "Tasks completed this week",
      icon: Target,
      color: "text-blue-600 dark:text-blue-400",
      bgColor: "bg-blue-100 dark:bg-blue-900/30",
    },
    {
      title: "Current Streak",
      value: `${currentStreak}`,
      description: "Consecutive active days",
      icon: Zap,
      color: "text-orange-600 dark:text-orange-400",
      bgColor: "bg-orange-100 dark:bg-orange-900/30",
    },
    {
      title: "Average Performance",
      value: `${avgCompletion}%`,
      description: "Goal achievement rate",
      icon: TrendingUp,
      color: "text-green-600 dark:text-green-400",
      bgColor: "bg-green-100 dark:bg-green-900/30",
    },
    {
      title: "Call Engagement",
      value: `${callEngagement}%`,
      description: "AI calls completed",
      icon: Phone,
      color: "text-purple-600 dark:text-purple-400",
      bgColor: "bg-purple-100 dark:bg-purple-900/30",
    },
    {
      title: "Active Days",
      value: `${activeDays}`,
      description: "Days with logged progress",
      icon: Calendar,
      color: "text-indigo-600 dark:text-indigo-400",
      bgColor: "bg-indigo-100 dark:bg-indigo-900/30",
    },
    {
      title: "Weekly Trend",
      value: `${improvement >= 0 ? "+" : ""}${improvement}%`,
      description: "Change from last week",
      icon: Award,
      color: improvement >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400",
      bgColor: improvement >= 0 ? "bg-green-100 dark:bg-green-900/30" : "bg-red-100 dark:bg-red-900/30",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index} className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">{stat.title}</CardTitle>
              <div className={`w-8 h-8 ${stat.bgColor} rounded-lg flex items-center justify-center`}>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">{stat.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
