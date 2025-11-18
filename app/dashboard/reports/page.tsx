import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WeeklyReportsList } from "@/components/weekly-reports-list"
import { GenerateReportDialog } from "@/components/generate-report-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Target, FileText, Calendar, TrendingUp, ChevronRight } from "lucide-react"

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
  currentWeekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6) // End of week (Saturday)

  const totalReports = reports?.length || 0
  const latestReport = reports?.[0]

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-gradient-to-bl from-pink-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
      </div>

      {/* Header */}
      <header className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CallMeAI
              </span>
              <span className="text-gray-400 ml-4">/ Reports</span>
            </div>
            <div className="flex items-center space-x-4">
              <GenerateReportDialog
                currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
              >
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold transform hover:scale-105 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </GenerateReportDialog>
              <span className="text-sm text-gray-300">
                Welcome back, <span className="font-semibold text-white">{profile?.full_name || "User"}</span>!
              </span>
              <form action="/auth/signout" method="post">
                <Button 
                  variant="ghost" 
                  type="submit" 
                  className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="text-white">Weekly</span>
            <span className="block bg-gradient-to-r from-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Reports
            </span>
          </h1>
          <p className="text-xl text-gray-400 mt-4">Deep insights into your habit-building journey</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Total Reports */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Total Reports</p>
                  <h3 className="text-4xl font-black text-white">{totalReports}</h3>
                  <p className="text-xs text-gray-500 mt-1">Generated</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <FileText className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Latest Report */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Latest Report</p>
                  <h3 className="text-4xl font-black text-white">
                    {latestReport
                      ? new Date(latestReport.week_start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })
                      : "None"}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">{latestReport ? "Week starting" : "No reports yet"}</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Avg Performance */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Avg Performance</p>
                  <h3 className="text-4xl font-black text-white">
                    {latestReport?.report_data?.overallMetrics?.completionRate || 0}%
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Latest completion</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-3">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-white">Your Weekly Reports</h2>
              <p className="text-gray-400 text-sm mt-2">Track your progress and insights over time</p>
            </div>
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 overflow-hidden">
              {reports && reports.length > 0 ? (
                <WeeklyReportsList reports={reports} />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-lg font-semibold mb-2">No reports yet</p>
                  <p className="text-gray-500 text-sm">Generate your first report to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8">
              <h3 className="text-xl font-black text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <GenerateReportDialog
                  currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                  currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
                >
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold transform hover:scale-105 transition-all rounded-xl justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Report
                  </Button>
                </GenerateReportDialog>
                <Button variant="ghost" className="w-full justify-start text-gray-300 hover:text-white hover:bg-white/10 transition-colors rounded-xl">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export All
                </Button>
              </div>
            </div>

            {/* Report Tips */}
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm p-8">
              <h3 className="text-lg font-black text-white mb-3">Pro Tips 💡</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Reports are generated every Sunday automatically. Use them to identify patterns and improve your CallMeAI habit-building journey.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
