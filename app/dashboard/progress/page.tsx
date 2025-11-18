import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProgressCharts } from "@/components/progress-charts"
import { TaskProgressList } from "@/components/task-progress-list"
import { ProgressStats } from "@/components/progress-stats"
import { Button } from "@/components/ui/button"
import { Target, Download, TrendingUp, Zap, Award } from "lucide-react"

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
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/3 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
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
              <span className="text-gray-400 ml-4">/ Progress</span>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
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
            <span className="text-white">Your Progress</span>
            <span className="block bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-400 mt-4">Track your journey and celebrate your wins</p>
        </div>

        {/* Progress Stats */}
        <div className="mb-12">
          <ProgressStats tasks={tasks || []} responses={responses || []} callLogs={callLogs || []} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8 overflow-hidden">
              <h2 className="text-2xl font-black text-white mb-6">Your Trends</h2>
              <ProgressCharts tasks={tasks || []} responses={responses || []} callLogs={callLogs || []} />
            </div>

            {/* Achievement Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Consistency Streak</p>
                      <h3 className="text-3xl font-black text-white">7 Days</h3>
                      <p className="text-xs text-gray-500 mt-2">Keep it up! 🔥</p>
                    </div>
                    <div className="p-3 bg-pink-500/20 rounded-xl">
                      <Zap className="w-6 h-6 text-pink-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="group relative rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 rounded-2xl">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <p className="text-sm text-gray-400 mb-2">Best Achievement</p>
                      <h3 className="text-3xl font-black text-white">95%</h3>
                      <p className="text-xs text-gray-500 mt-2">Task completion rate 🏆</p>
                    </div>
                    <div className="p-3 bg-cyan-500/20 rounded-xl">
                      <Award className="w-6 h-6 text-cyan-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Task Performance */}
          <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8">
            <h3 className="text-xl font-black text-white mb-6">Task Performance</h3>
            <p className="text-xs text-gray-500 mb-6">Last 7 days completion rates</p>
            <TaskProgressList tasks={tasks || []} responses={responses || []} />
          </div>
        </div>
      </div>
    </div>
  )
}
