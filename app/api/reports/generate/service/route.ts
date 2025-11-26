import { NextResponse } from "next/server"
import { createClient as createSupabase } from '@supabase/supabase-js'

export async function POST(request: Request) {
  try {
    const serviceHeader = request.headers.get('x-service-role')
    if (!serviceHeader || serviceHeader !== process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    // default to last 7 days
    const today = new Date()
    const endDate = body.weekEnd ? new Date(body.weekEnd) : new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate() - 1))
    const startDate = body.weekStart ? new Date(body.weekStart) : new Date(endDate.getTime() - 1000 * 60 * 60 * 24 * 6)

    const weekStart = startDate.toISOString().split('T')[0]
    const weekEnd = endDate.toISOString().split('T')[0]

    const supabase = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Get all profiles (users)
    const { data: profiles } = await supabase.from('profiles').select('id')
    if (!profiles || profiles.length === 0) {
      return NextResponse.json({ success: true, message: 'No users found' })
    }

    const results: any[] = []

    for (const p of profiles) {
      try {
        const userId = p.id

        const { data: tasks } = await supabase.from('tasks').select('*').eq('user_id', userId).eq('is_active', true)

        const { data: responses } = await supabase
          .from('task_responses')
          .select('*, tasks(title, target_value, unit, category)')
          .eq('user_id', userId)
          .gte('response_date', weekStart)
          .lte('response_date', weekEnd)

        const { data: callLogs } = await supabase
          .from('call_logs')
          .select('*')
          .eq('user_id', userId)
          .gte('scheduled_at', weekStart)
          .lte('scheduled_at', weekEnd + 'T23:59:59')

        const reportData = generateWeeklyReport(tasks || [], responses || [], callLogs || [], weekStart, weekEnd)

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

function generateWeeklyReport(tasks: any[], responses: any[], callLogs: any[], weekStart: string, weekEnd: string) {
  const totalTasks = tasks.length
  const totalPossibleCompletions = totalTasks * 7
  const actualCompletions = responses.length
  const overallCompletionRate = totalPossibleCompletions > 0 ? (actualCompletions / totalPossibleCompletions) * 100 : 0

  const taskMetrics = tasks.map((task) => {
    const taskResponses = responses.filter((r: any) => r.task_id === task.id)
    const completionRate = (taskResponses.length / 7) * 100

    let averagePerformance = 0
    if (task.target_value && taskResponses.length > 0) {
      const totalValue = taskResponses.reduce((sum: number, r: any) => sum + (r.response_value || 0), 0)
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

  const dailyBreakdown = []
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart)
    date.setDate(date.getDate() + i)
    const dateStr = date.toISOString().split('T')[0]

    const dayResponses = responses.filter((r: any) => r.response_date === dateStr)
    const dayCompletionRate = totalTasks > 0 ? (dayResponses.length / totalTasks) * 100 : 0

    dailyBreakdown.push({
      date: dateStr,
      dayName: date.toLocaleDateString('en-US', { weekday: 'long' }),
      responsesCount: dayResponses.length,
      completionRate: Math.round(dayCompletionRate),
    })
  }

  const categoryPerformance = tasks.reduce((acc: any, task: any) => {
    const taskResponses = responses.filter((r: any) => r.task_id === task.id)
    if (!acc[task.category]) acc[task.category] = { totalTasks: 0, totalResponses: 0 }
    acc[task.category].totalTasks += 1
    acc[task.category].totalResponses += taskResponses.length
    return acc
  }, {})

  const categoryStats = Object.entries(categoryPerformance).map(([category, stats]: any) => {
    return {
      category,
      completionRate: Math.round((stats.totalResponses / (stats.totalTasks * 7)) * 100),
      tasksCount: stats.totalTasks,
    }
  })

  const totalCalls = callLogs.length
  const completedCalls = callLogs.filter((c: any) => c.call_status === 'completed').length
  const callEngagementRate = totalCalls > 0 ? (completedCalls / totalCalls) * 100 : 0

  const insights = []
  const avgCompletionRate = taskMetrics.reduce((sum: any, t: any) => sum + t.completionRate, 0) / (taskMetrics.length || 1)
  if (avgCompletionRate >= 80) {
    insights.push({ type: 'success', title: 'Excellent Consistency', message: `You maintained an ${Math.round(avgCompletionRate)}% completion rate this week.` })
  }

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
