import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WeeklyReportsList } from "@/components/weekly-reports-list"
import { GenerateReportDialog } from "@/components/generate-report-dialog"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Button } from "@/components/ui/button"
import { Plus, Target, FileText, Calendar, TrendingUp, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function ReportsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get weekly reports
  const { data: reports } = await supabase
    .from("weekly_reports")
    .select("*")
    .eq("user_id", data.user.id)
    .order("week_start_date", { ascending: false })
    .limit(10)

  // Get current week dates for quick generation
  const today = new Date()
  const currentWeekStart = new Date(today)
  currentWeekStart.setDate(today.getDate() - today.getDay())
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6)

  const totalReports = reports?.length || 0
  const latestReport = reports?.[0]

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.005_270)] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="animate-orbit absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[oklch(0.45_0.2_280)] rounded-full blur-[180px] opacity-[0.07]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-xl bg-[oklch(0.09_0.005_270)]/80 border-b border-white/[0.06]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3">
            <div className="flex items-center space-x-3">
              <Link href="/dashboard" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[oklch(0.55_0.25_280)] rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">CallMeAI</span>
              </Link>
              <span className="text-white/20">/</span>
              <span className="text-white/40 text-sm">Reports</span>
            </div>
            <div className="flex items-center space-x-4">
              <GenerateReportDialog
                currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
              >
                <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white border-0 font-medium rounded-xl text-sm h-8 px-4 transition-colors">
                  <Plus className="w-3.5 h-3.5 mr-1.5" />
                  Generate Report
                </Button>
              </GenerateReportDialog>
              <ProfileDropdown initialName={profile?.full_name} initialEmail={data.user.email} />
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Back + Title */}
        <div className="mb-10 pt-4">
          <Link href="/dashboard" className="inline-flex items-center text-white/30 hover:text-white/50 text-sm mb-4 transition-colors">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Dashboard
          </Link>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Reports</h1>
          <p className="text-white/35 mt-2">Deep insights into your habit-building journey</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Total Reports</p>
                <h3 className="text-3xl font-semibold text-white">{totalReports}</h3>
                <p className="text-xs text-white/25 mt-1">Generated</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <FileText className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Latest Report</p>
                <h3 className="text-3xl font-semibold text-white">
                  {latestReport
                    ? new Date(latestReport.week_start_date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })
                    : "None"}
                </h3>
                <p className="text-xs text-white/25 mt-1">{latestReport ? "Week starting" : "No reports yet"}</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Avg Performance</p>
                <h3 className="text-3xl font-semibold text-white">
                  {latestReport?.report_data?.overallMetrics?.completionRate || 0}%
                </h3>
                <p className="text-xs text-white/25 mt-1">Latest completion</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Reports List */}
          <div className="lg:col-span-3">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-white">Your Weekly Reports</h2>
              <p className="text-white/25 text-sm mt-1">Track your progress and insights over time</p>
            </div>
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5 overflow-hidden">
              {reports && reports.length > 0 ? (
                <WeeklyReportsList reports={reports} />
              ) : (
                <div className="text-center py-14">
                  <div className="w-14 h-14 rounded-full bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-6 h-6 text-[oklch(0.75_0.18_280)]" />
                  </div>
                  <p className="text-white/50 font-medium mb-1">No reports yet</p>
                  <p className="text-white/25 text-sm">Generate your first report to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-sm font-semibold text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <GenerateReportDialog
                  currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                  currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
                >
                  <Button className="w-full bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white border-0 font-medium rounded-xl text-sm h-9 justify-start transition-colors">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </GenerateReportDialog>
                <Button variant="ghost" className="w-full justify-start text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors rounded-xl text-sm h-9">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>

            <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6">
              <h3 className="text-sm font-medium text-white mb-2">Pro tip</h3>
              <p className="text-white/30 text-sm leading-relaxed">
                Reports are generated every Sunday automatically. Use them to identify patterns and improve your habit-building journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
