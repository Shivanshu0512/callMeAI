import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

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

    const { weekStart, weekEnd } = await request.json()

    if (!weekStart || !weekEnd) {
      return NextResponse.json({ error: "Week start and end dates are required" }, { status: 400 })
    }

    // Get user tasks
    const { data: tasks } = await supabase.from("tasks").select("*").eq("user_id", user.id).eq("is_active", true)

    // Get task responses for the week
    const { data: responses } = await supabase
      .from("task_responses")
      .select("*, tasks(title, target_value, unit, category)")
      .eq("user_id", user.id)
      .gte("response_date", weekStart)
      .lte("response_date", weekEnd)

    // Get call logs for the week
    const { data: callLogs } = await supabase
      .from("call_logs")
      .select("*")
      .eq("user_id", user.id)
      .gte("scheduled_at", weekStart)
      .lte("scheduled_at", weekEnd + "T23:59:59")

    // Generate report data
    const reportData = generateWeeklyReport(tasks || [], responses || [], callLogs || [], weekStart, weekEnd)

    // Save the report to the database
    const { data: savedReport, error: saveError } = await supabase
      .from("weekly_reports")
      .insert({
        user_id: user.id,
        week_start_date: weekStart,
        week_end_date: weekEnd,
        report_data: reportData,
      })
      .select()
      .single()

    if (saveError) {
      console.error("Error saving report:", saveError)
      return NextResponse.json({ error: "Failed to save report" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      report: savedReport,
      data: reportData,
    })
  } catch (error) {
    console.error("Report generation error:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}

function generateWeeklyReport(tasks: any[], responses: any[], callLogs: any[], weekStart: string, weekEnd: string) {
  // Calculate overall metrics
  const totalTasks = tasks.length
  const totalPossibleCompletions = totalTasks * 7 // 7 days
  const actualCompletions = responses.length
  const overallCompletionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0

  // Calculate task-specific metrics
  const taskMetrics = tasks.map((task) => {
    const taskResponses = responses.filter((r) => r.task_id === task.id)
    const completionRate = (taskResponses.length / 7) * 100

    let averagePerformance = 0
    if (task.target_value && taskResponses.length > 0) {
      const totalValue = taskResponses.reduce((sum, r) => sum + (r.response_value || 0), 0)
      averagePerformance = (totalValue / (task.target_value * taskResponses.length)) * 100
    }

    return {
      taskId: task.id,
      title: task.title,
      category: task.category,
      completionRate: Math.round(completionRate),
      averagePerformance: Math.round(averagePerformance),
      responsesCount: taskResponses.length,
      targetValue: task.target_value,
      unit: task.unit,
    }
  })

  // Calculate daily breakdown
  const dailyBreakdown = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    const dayResponses = responses.filter((r) => r.response_date === dateStr)
    const dayCompletionRate = totalTasks > 0 ? (dayResponses.length / totalTasks) * 100 : 0

    dailyBreakdown.push({
      date: dateStr,
      dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      responsesCount: dayResponses.length,
      completionRate: Math.round(dayCompletionRate),
    })
  }

  // Calculate category performance
  const categoryPerformance = tasks.reduce(
    (acc, task) => {
      const taskResponses = responses.filter((r) => r.task_id === task.id)
      if (!acc[task.category]) {
        acc[task.category] = { totalTasks: 0, totalResponses: 0 }
      }
      acc[task.category].totalTasks += 1
      acc[task.category].totalResponses += taskResponses.length
      return acc
    },
    {} as Record<string, { totalTasks: number; totalResponses: number }>,
  )

  const categoryStats = Object.entries(categoryPerformance).map(
    ([category, stats]) => {
      const s = stats as { totalTasks: number; totalResponses: number }
      return {
        category,
        completionRate: Math.round((s.totalResponses / (s.totalTasks * 7)) * 100),
        tasksCount: s.totalTasks,
      }
    }
  )

  // Calculate call engagement
  const totalCalls = callLogs.length
  const completedCalls = callLogs.filter((c) => c.call_status === "completed").length
  const callEngagementRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0

  // Generate insights and recommendations
  const insights = generateInsights(taskMetrics, dailyBreakdown, categoryStats, callEngagementRate)

  return {
    weekStart,
    weekEnd,
    overallMetrics: {
      totalTasks,
      completionRate: Math.round(overallCompletionRate),
      totalResponses: actualCompletions,
      callEngagementRate: Math.round(callEngagementRate),
      totalCalls,
      completedCalls,
    },
    taskMetrics,
    dailyBreakdown,
    categoryStats,
    insights,
    generatedAt: new Date().toISOString(),
  }
}

function generateInsights(taskMetrics: any[], dailyBreakdown: any[], categoryStats: any[], callEngagementRate: number) {
  const insights = []

  // Overall performance insight
  const avgCompletionRate = taskMetrics.reduce((sum, t) => sum + t.completionRate, 0) / taskMetrics.length || 0
  if (avgCompletionRate >= 80) {
    insights.push({
      type: "success",
      title: "Excellent Consistency",
      message: `You maintained an ${Math.round(avgCompletionRate)}% completion rate this week. Keep up the fantastic work!`,
    })
  } else if (avgCompletionRate >= 60) {
    insights.push({
      type: "warning",
      title: "Good Progress",
      message: `You achieved a ${Math.round(avgCompletionRate)}% completion rate. Try to be more consistent to reach your full potential.`,
    })
  } else {
    insights.push({
      type: "info",
      title: "Room for Improvement",
      message: `Your ${Math.round(avgCompletionRate)}% completion rate shows there's opportunity to build stronger habits. Focus on small, consistent actions.`,
    })
  }

  // Best performing task
  const bestTask = taskMetrics.reduce((best, current) =>
    current.completionRate > best.completionRate ? current : best,
  )
  if (bestTask.completionRate > 0) {
    insights.push({
      type: "success",
      title: "Top Performer",
      message: `"${bestTask.title}" was your most consistent task with ${bestTask.completionRate}% completion. Use this momentum for other goals!`,
    })
  }

  // Struggling task
  const strugglingTask = taskMetrics.reduce((worst, current) =>
    current.completionRate < worst.completionRate ? current : worst,
  )
  if (strugglingTask.completionRate < 50 && taskMetrics.length > 1) {
    insights.push({
      type: "warning",
      title: "Needs Attention",
      message: `"${strugglingTask.title}" needs more focus. Consider breaking it into smaller steps or adjusting your approach.`,
    })
  }

  // Best day
  const bestDay = dailyBreakdown.reduce((best, current) =>
    current.completionRate > best.completionRate ? current : best,
  )
  if (bestDay.completionRate > 0) {
    insights.push({
      type: "info",
      title: "Peak Performance Day",
      message: `${bestDay.dayName} was your strongest day with ${bestDay.completionRate}% task completion. What made this day successful?`,
    })
  }

  // Call engagement insight
  if (callEngagementRate >= 80) {
    insights.push({
      type: "success",
      title: "Great Call Engagement",
  message: `You completed ${Math.round(callEngagementRate)}% of your CallMeAI calls. This consistency is building strong habits!`,
    })
  } else if (callEngagementRate > 0) {
    insights.push({
      type: "info",
      title: "Improve Call Consistency",
  message: `Consider adjusting your call schedule to improve your ${Math.round(callEngagementRate)}% engagement rate. Regular check-ins boost your CallMeAI experience.`,
    })
  }

  return insights
}
