"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Calendar, Target, TrendingUp, CheckCircle2, AlertTriangle, Info, Award, MessageSquare, Hash, ListChecks, Lightbulb, CircleDashed, CircleSlash, CircleDot } from "lucide-react"

interface WeeklyReport {
  id: string
  week_start_date: string
  week_end_date: string
  report_data: any
  generated_at: string
}

interface WeeklyReportDialogProps {
  report: WeeklyReport
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WeeklyReportDialog({ report, open, onOpenChange }: WeeklyReportDialogProps) {
  const data = report.report_data
  const metrics = data?.overallMetrics || {}
  const taskMetrics = data?.taskMetrics || []
  const dailyBreakdown = data?.dailyBreakdown || []
  const categoryStats = data?.categoryStats || []
  const insights = data?.insights || []
  const analysis = data?.conversationAnalysis

  const commitmentStatusConfig: Record<string, { label: string; className: string; icon: any }> = {
    fulfilled: { label: "Fulfilled", className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400", icon: CheckCircle2 },
    partially_fulfilled: { label: "Partial", className: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400", icon: CircleDot },
    not_fulfilled: { label: "Not fulfilled", className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400", icon: CircleSlash },
    pending: { label: "Pending", className: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300", icon: CircleDashed },
  }

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("en-US", { month: "long", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
      case "warning":
        return <AlertTriangle className="w-4 h-4 text-yellow-600 dark:text-yellow-400" />
      case "info":
        return <Info className="w-4 h-4 text-blue-600 dark:text-blue-400" />
      default:
        return <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
    }
  }

  const getInsightBgColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      case "warning":
        return "bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800"
      case "info":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      default:
        return "bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl flex items-center space-x-2">
                <Calendar className="w-5 h-5" />
                <span>Weekly Report</span>
              </DialogTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {formatDateRange(report.week_start_date, report.week_end_date)}
              </p>
            </div>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Overall Metrics */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center space-x-2">
                <Award className="w-5 h-5" />
                <span>Overall Performance</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {metrics.completionRate || 0}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Completion Rate</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {metrics.totalResponses || 0}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tasks Completed</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {metrics.completedCalls || 0}
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">AI Calls</p>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {metrics.callEngagementRate || 0}%
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Call Engagement</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Insights */}
          {insights.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Key Insights & Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {insights.map((insight: any, index: number) => (
                    <div key={index} className={`p-4 rounded-lg border ${getInsightBgColor(insight.type)}`}>
                      <div className="flex items-start space-x-3">
                        {getInsightIcon(insight.type)}
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900 dark:text-white mb-1">{insight.title}</h4>
                          <p className="text-sm text-gray-700 dark:text-gray-300">{insight.message}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Performance */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <Target className="w-5 h-5" />
                  <span>Task Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {taskMetrics.map((task: any, index: number) => (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</span>
                        <Badge
                          variant="secondary"
                          className={
                            task.completionRate >= 80
                              ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                              : task.completionRate >= 60
                                ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
                                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
                          }
                        >
                          {task.completionRate}%
                        </Badge>
                      </div>
                      <Progress value={task.completionRate} className="h-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400">{task.responsesCount}/7 days completed</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Daily Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5" />
                  <span>Daily Breakdown</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {dailyBreakdown.map((day: any, index: number) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm text-gray-900 dark:text-white">{day.dayName}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-20">
                          <Progress value={day.completionRate} className="h-2" />
                        </div>
                        <span className="text-xs text-gray-600 dark:text-gray-400 w-12 text-right">
                          {day.completionRate}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Conversation Analysis */}
          {analysis && (
            <>
              {/* Week Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MessageSquare className="w-5 h-5" />
                    <span>Week in Review</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{analysis.summary}</p>
                </CardContent>
              </Card>

              {/* Facts & Numbers */}
              {(analysis.facts?.length > 0 || analysis.numbers?.length > 0) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Hash className="w-5 h-5" />
                      <span>Facts & Numbers From Your Calls</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {(analysis.numbers || []).map((n: any, i: number) => (
                        <div key={`n-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 flex-shrink-0">{n.value}</Badge>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{n.context}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.date}</p>
                          </div>
                        </div>
                      ))}
                      {(analysis.facts || []).map((f: any, i: number) => (
                        <div key={`f-${i}`} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800">
                          <Info className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-700 dark:text-gray-300">{f.text}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{f.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Commitments */}
              {analysis.commitments?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <ListChecks className="w-5 h-5" />
                      <span>Commitments Tracker</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analysis.commitments.map((c: any, i: number) => {
                        const status = commitmentStatusConfig[c.status] || commitmentStatusConfig.pending
                        const StatusIcon = status.icon
                        return (
                          <div key={i} className="p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                            <div className="flex items-start justify-between gap-3">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">"{c.text}"</p>
                              <Badge variant="secondary" className={`${status.className} flex-shrink-0 flex items-center gap-1`}>
                                <StatusIcon className="w-3 h-3" />
                                {status.label}
                              </Badge>
                            </div>
                            <p className="text-xs text-gray-500 mt-2">Made on {c.madeOn}{c.evidence ? ` — ${c.evidence}` : ""}</p>
                          </div>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Suggestions */}
              {analysis.suggestions?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center space-x-2">
                      <Lightbulb className="w-5 h-5" />
                      <span>Suggestions For Next Week</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {analysis.suggestions.map((s: string, i: number) => (
                        <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                          <Lightbulb className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-gray-700 dark:text-gray-300">{s}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {/* Category Performance */}
          {categoryStats.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Category Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {categoryStats.map((category: any, index: number) => (
                    <div key={index} className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <h4 className="font-medium text-gray-900 dark:text-white capitalize">{category.category}</h4>
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-2">
                        {category.completionRate}%
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{category.tasksCount} tasks</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
