import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProgressCharts } from "@/components/progress-charts"
import { TaskProgressList } from "@/components/task-progress-list"
import { ProgressStats } from "@/components/progress-stats"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Target, Download } from "lucide-react"
import Link from "next/link"

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get user tasks
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Get task responses for the last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: responses } = await supabase
    .from("task_responses")
    .select("*, tasks(title, target_value, unit)")
    .eq("user_id", data.user.id)
    .gte("response_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("response_date", { ascending: true })

  // Get call logs for engagement tracking
  const { data: callLogs } = await supabase
    .from("call_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("scheduled_at", thirtyDaysAgo.toISOString())
    .order("scheduled_at", { ascending: true })

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
                <span className="text-blue-600 dark:text-blue-400 font-medium">Progress</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Progress Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-300">
            Track your CallMeAI journey and see how you're building lasting habits
          </p>
        </div>

        {/* Progress Stats */}
        <ProgressStats tasks={tasks || []} responses={responses || []} callLogs={callLogs || []} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <ProgressCharts tasks={tasks || []} responses={responses || []} callLogs={callLogs || []} />
          </div>

          {/* Task Progress List */}
          <div>
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Task Performance</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Last 7 days completion rates
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TaskProgressList tasks={tasks || []} responses={responses || []} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
