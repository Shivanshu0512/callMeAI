"use client"

import { useState } from "react"
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
  const [hoveredReportId, setHoveredReportId] = useState<string | null>(null)

  const formatDateRange = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    return `${start.toLocaleDateString("en-US", { month: "short", day: "numeric" })} - ${end.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`
  }

  const getPerformanceBadge = (completionRate: number) => {
    if (completionRate >= 80) {
      return <Badge className="bg-green-500/20 text-green-400 border-green-500/30 border font-semibold text-xs">Excellent</Badge>
    } else if (completionRate >= 60) {
      return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30 border font-semibold text-xs">Good</Badge>
    } else if (completionRate >= 40) {
      return <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 border font-semibold text-xs">Fair</Badge>
    } else {
      return <Badge className="bg-red-500/20 text-red-400 border-red-500/30 border font-semibold text-xs">Needs Work</Badge>
    }
  }

  if (reports.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <FileText className="w-8 h-8 text-cyan-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No reports yet</h3>
        <p className="text-gray-400 text-sm">Generate your first weekly report to track your progress</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {reports.map((report, index) => {
        const metrics = report.report_data?.overallMetrics || {}
        const insights = report.report_data?.insights || []

        return (
          <div
            key={report.id}
            className="group rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/10 overflow-hidden"
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
            }}
            onMouseEnter={() => setHoveredReportId(report.id)}
            onMouseLeave={() => setHoveredReportId(null)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className="p-2 bg-cyan-500/20 rounded-lg group-hover:bg-cyan-500/30 transition-colors">
                      <Calendar className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-cyan-400 group-hover:to-pink-400 group-hover:bg-clip-text transition-all duration-300">
                      {formatDateRange(report.week_start_date, report.week_end_date)}
                    </h3>
                    {getPerformanceBadge(metrics.completionRate || 0)}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <Button
                    size="sm"
                    onClick={() => setSelectedReport(report)}
                    className="bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white border-0 font-semibold transform hover:scale-110 transition-all"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    View
                  </Button>
                  <Button 
                    size="sm"
                    className="bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border-white/10 border transition-all"
                  >
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <Target className="w-4 h-4 text-purple-400" />
                    <p className="text-xs text-gray-500">Completion</p>
                  </div>
                  <p className="text-lg font-black text-white">{metrics.completionRate || 0}%</p>
                </div>

                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <TrendingUp className="w-4 h-4 text-cyan-400" />
                    <p className="text-xs text-gray-500">Tasks</p>
                  </div>
                  <p className="text-lg font-black text-white">
                    {metrics.totalResponses || 0}/{(metrics.totalTasks || 0) * 7}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <Phone className="w-4 h-4 text-pink-400" />
                    <p className="text-xs text-gray-500">Calls</p>
                  </div>
                  <p className="text-lg font-black text-white">
                    {metrics.completedCalls || 0}/{metrics.totalCalls || 0}
                  </p>
                </div>

                <div className="p-3 rounded-lg bg-white/5 group-hover:bg-white/10 transition-colors">
                  <div className="flex items-center space-x-2 mb-1">
                    <FileText className="w-4 h-4 text-yellow-400" />
                    <p className="text-xs text-gray-500">Insights</p>
                  </div>
                  <p className="text-lg font-black text-white">{insights.length}</p>
                </div>
              </div>

              {/* Key Insight */}
              {insights.length > 0 && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-cyan-500/10 border border-white/10 group-hover:border-white/20 transition-colors">
                  <p className="text-xs text-gray-500 mb-1 font-semibold uppercase">Key Insight</p>
                  <p className="text-sm text-gray-300 italic">"{insights[0]?.message}"</p>
                </div>
              )}

              {/* Generated Date */}
              <p className="text-xs text-gray-600 group-hover:text-gray-500 transition-colors">
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
          </div>
        )
      })}

      {selectedReport && (
        <WeeklyReportDialog
          report={selectedReport}
          open={!!selectedReport}
          onOpenChange={(open) => !open && setSelectedReport(null)}
        />
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
