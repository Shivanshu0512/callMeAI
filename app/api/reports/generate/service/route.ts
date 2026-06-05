import { NextResponse } from "next/server"
import { createClient as createSupabase } from '@supabase/supabase-js'
import { analyzeWeekTranscripts } from '@/lib/analyze/weeklyAnalysis'

export async function POST(request: Request) {
  try {
    const serviceHeader = request.headers.get('x-service-role')
    if (!serviceHeader || serviceHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const today = new Date()
    const endDate = body.weekEnd ? new Date(body.weekEnd) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1))
    const startDate = body.weekStart ? new Date(body.weekStart) : new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 6)

    const weekStart = startDate.toISOString().split('T')[0]
    const weekEnd = endDate.toISOString().split('T')[0]

    const supabase = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: profiles } = await supabase.from('profiles').select('id')
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No users found' })
    }

    const results: any[] = []

    for (const p of profiles) {
      try {
        const userId = p.id

        const { data: callLogs } = await supabase
          .from('call_logs')
          .select('*, call_schedules(name, topic)')
          .eq('user_id', userId)
          .gte('scheduled_at', weekStart)
          .lte('scheduled_at', weekEnd + 'T23:59:59')
          .order('scheduled_at', { ascending: true })

        const reportData: any = generateWeeklyReport(callLogs || [], weekStart, weekEnd)

        reportData.conversationAnalysis = await analyzeWeekTranscripts(
          (callLogs || []).map((c: any) => ({
            date: (c.started_at || c.scheduled_at || '').split('T')[0],
            scheduleName: c.call_schedules?.name,
            topic: c.call_schedules?.topic,
            transcript: c.call_transcript || '',
          })),
        )

        const { data: savedReport, error: saveError } = await supabase
          .from('weekly_reports')
          .insert({
            user_id: userId,
            week_start_date: weekStart,
            week_end_date: weekEnd,
            report_data: reportData,
          })
          .select()
          .single()

        if (saveError) {
          console.error('Failed saving report for', userId, saveError)
        } else {
          results.push({ userId, report: savedReport })
        }
      } catch (e) {
        console.error('Error generating report for user', p.id, e)
      }
    }

    return NextResponse.json({ success: true, generated: results.length, results })
  } catch (error) {
    console.error('Service report generation failed', error)
    return NextResponse.json({ error: 'Failed to generate reports' }, { status: 500 })
  }
}

function generateWeeklyReport(callLogs: any[], weekStart: string, weekEnd: string) {
  const totalCalls = callLogs.length
  const completedCalls = callLogs.filter((c: any) => c.call_status === 'completed').length
  const callEngagementRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0
  const totalDuration = callLogs.reduce((sum: number, c: any) => sum + (c.call_duration || 0), 0)

  const dailyBreakdown = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const dayCalls = callLogs.filter((c: any) => c.scheduled_at.startsWith(dateStr))
    const dayCompleted = dayCalls.filter((c: any) => c.call_status === 'completed').length

    dailyBreakdown.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      totalCalls: dayCalls.length,
      completedCalls: dayCompleted,
    })
  }

  const insights = []
  if (callEngagementRate >= 80) {
    insights.push({ type: 'success', title: 'Excellent Consistency', message: `You completed ${Math.round(callEngagementRate)}% of your calls this week.` })
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
