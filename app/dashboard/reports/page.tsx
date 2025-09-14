import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WeeklyReportsList } from "@/components/weekly-reports-list"
import { GenerateReportDialog } from "@/components/generate-report-dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Target, FileText, Calendar, TrendingUp } from "lucide-react"
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
  currentWeekStart.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
  const currentWeekEnd = new Date(currentWeekStart)
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6) // End of week (Saturday)

  const totalReports = reports?.length || 0
  const latestReport = reports?.[0]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-200/50 dark:border-gray-700/50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">CallMeAI</span>
              </Link>
              <nav className="flex space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/calls"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  AI Calls
                </Link>
                <Link
                  href="/dashboard/progress"
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                >
                  Progress
                </Link>
                <span className="text-blue-600 dark:text-blue-400 font-medium">Reports</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <GenerateReportDialog
                currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
              >
                <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </GenerateReportDialog>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Welcome back, {profile?.full_name || "User"}!
              </span>
              <form action="/auth/signout" method="post">
                <Button variant="ghost" type="submit" className="text-gray-600 dark:text-gray-300">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Weekly Reports</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Comprehensive insights into your CallMeAI journey and habit-building progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{totalReports}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Generated reports</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Latest Report</CardTitle>
              <Calendar className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {latestReport
                  ? new Date(latestReport.week_start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })
                  : "None"}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {latestReport ? "Week starting" : "No reports yet"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Avg Performance</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {latestReport?.report_data?.overallMetrics?.completionRate || 0}%
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Latest week completion</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Reports List */}
          <div className="lg:col-span-3">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">Your Weekly Reports</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Track your progress and insights over time
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <WeeklyReportsList reports={reports || []} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <GenerateReportDialog
                  currentWeekStart={currentWeekStart.toISOString().split("T")[0]}
                  currentWeekEnd={currentWeekEnd.toISOString().split("T")[0]}
                >
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <FileText className="w-4 h-4 mr-2" />
                    Generate This Week
                  </Button>
                </GenerateReportDialog>
                <Button variant="outline" className="w-full justify-start bg-transparent">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Export All Reports
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Report Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Weekly reports are generated automatically every Sunday, but you can create them anytime to track your
                  progress. Use insights to identify patterns and improve your CallMeAI habits.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
