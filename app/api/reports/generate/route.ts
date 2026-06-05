import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { analyzeWeekTranscripts } from "@/lib/analyze/weeklyAnalysis"

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

    // Get call logs for the week (incl. transcripts + schedule names for analysis)
    const { data: callLogs } = await supabase
      .from("call_logs")
      .select("*, call_schedules(name, topic)")
      .eq("user_id", user.id)
      .gte("scheduled_at", weekStart)
      .lte("scheduled_at", weekEnd + "T23:59:59")
      .order("scheduled_at", { ascending: true })

    // Generate report data
    const reportData: any = generateWeeklyReport(callLogs || [], weekStart, weekEnd)

    // Analyze the week's transcripts (facts, numbers, commitments, suggestions)
    reportData.conversationAnalysis = await analyzeWeekTranscripts(
      (callLogs || []).map((c: any) => ({
        date: (c.started_at || c.scheduled_at || "").split("T")[0],
        scheduleName: c.call_schedules?.name,
        topic: c.call_schedules?.topic,
        transcript: c.call_transcript || "",
      })),
    )

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

function generateWeeklyReport(callLogs: any[], weekStart: string, weekEnd: string) {
  const totalCalls = callLogs.length
  const completedCalls = callLogs.filter((c) => c.call_status === "completed").length
  const callEngagementRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0
  const totalDuration = callLogs.reduce((sum, c) => sum + (c.call_duration || 0), 0)

  // Daily breakdown
  const dailyBreakdown = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split("T")[0]

    const dayCalls = callLogs.filter((c) => c.scheduled_at.startsWith(dateStr))
    const dayCompleted = dayCalls.filter((c) => c.call_status === "completed").length

    dailyBreakdown.push({
      date: dateStr,
      dayName: date.toLocaleDateString("en-US", { weekday: "long" }),
      totalCalls: dayCalls.length,
      completedCalls: dayCompleted,
    })
  }

  // Generate insights
  const insights = []

  if (callEngagementRate >= 80) {
    insights.push({
      type: "success",
      title: "Great Call Engagement",
      message: `You completed ${Math.round(callEngagementRate)}% of your CallMeAI calls. This consistency is building strong habits!`,
    })
  } else if (callEngagementRate >= 50) {
    insights.push({
      type: "warning",
      title: "Good Progress",
      message: `You completed ${Math.round(callEngagementRate)}% of your calls. Try to pick up more to stay on track.`,
    })
  } else if (totalCalls > 0) {
    insights.push({
      type: "info",
      title: "Room for Improvement",
      message: `Your ${Math.round(callEngagementRate)}% call completion rate shows there's opportunity to build stronger habits. Consistency is key.`,
    })
  }

  const bestDay = dailyBreakdown.reduce((best, current) =>
    current.completedCalls > best.completedCalls ? current : best,
  )
  if (bestDay.completedCalls > 0) {
    insights.push({
      type: "info",
      title: "Peak Performance Day",
      message: `${bestDay.dayName} was your strongest day with ${bestDay.completedCalls} completed call(s).`,
    })
  }

  return {
    weekStart,
    weekEnd,
    overallMetrics: {
      completionRate: Math.round(callEngagementRate),
      callEngagementRate: Math.round(callEngagementRate),
      totalCalls,
      completedCalls,
      totalDurationMinutes: Math.round(totalDuration / 60),
    },
    dailyBreakdown,
    insights,
    generatedAt: new Date().toISOString(),
  }
}
