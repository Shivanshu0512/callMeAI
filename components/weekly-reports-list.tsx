"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Eye, Download, Calendar, TrendingUp, Target, Phone } from "lucide-react"
import { WeeklyReportDialog } from "@/components/weekly-report-dialog"

interface WeeklyReport {
  id: string
  week_start_date: string
  week_end_date: string
  report_data: any
  generated_at: string
}

interface WeeklyReportsListProps {
  reports: WeeklyReport[]
}

export function WeeklyReportsList({ reports }: WeeklyReportsListProps) {
  const [selectedReport, setSelectedReport] = useState<WeeklyReport | null>(null)

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 80) {
      return <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">Excellent</Badge>
    } else if (completionRate >= 60) {
      return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400">Good</Badge>
    } else if (completionRate >= 40) {
      return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">Fair</Badge>
    } else {
      return <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">Needs Work</Badge>
    }
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <FileText className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No reports yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          Generate your first weekly report to track your progress
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {reports.map((report) => {
        const metrics = report.report_data?.overallMetrics || {}
        const insights = report.report_data?.insights || []

        return (
          <Card key={report.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {formatDateRange(report.week_start_date, report.week_end_date)}
                    </h3>
                    {getPerformanceBadge(metrics.completionRate || 0)}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center space-x-2">
                      <Target className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Completion</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {metrics.completionRate || 0}%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Tasks</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {metrics.totalResponses || 0}/{(metrics.totalTasks || 0) * 7}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Calls</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {metrics.completedCalls || 0}/{metrics.totalCalls || 0}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Insights</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{insights.length}</p>
                      </div>
                    </div>
                  </div>

                  {insights.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Key Insight:</p>
                      <p className="text-sm text-gray-700 dark:text-gray-300 italic">"{insights[0]?.message}"</p>
                    </div>
                  )}

                  <p className="text-xs text-gray-500 dark:text-gray-500">
                    Generated on{" "}
                    {new Date(report.generated_at).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                    className="bg-transparent"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="bg-transparent">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}

      {selectedReport && (
        <WeeklyReportDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
        />
      )}
    </div>
  )
}
