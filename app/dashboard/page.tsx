import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { TaskList } from "@/components/task-list"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Target, TrendingUp, Phone, FileText, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
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

  // Get recent task responses for today
  const today = new Date().toISOString().split("T")[0]
  const { data: todayResponses } = await supabase
    .from("task_responses")
    .select("task_id, response_value")
    .eq("user_id", data.user.id)
    .eq("response_date", today)

  const completedToday = todayResponses?.length || 0
  const totalTasks = tasks?.length || 0

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
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
            </div>
            <div className="flex items-center space-x-4">
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
        <div className="mb-16">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="text-white">Your AI Accountability</span>
            <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Dashboard
            </span>
          </h1>
          <p className="text-xl text-gray-400 mt-4">Track progress, manage goals, and stay motivated</p>
        </div>

        {/* Main Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1: Today's Progress */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Today's Progress</p>
                  <h3 className="text-4xl font-black text-white">
                    {completedToday}/{totalTasks}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">Tasks completed</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <TrendingUp className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${totalTasks > 0 ? (completedToday / totalTasks) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Active Goals */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Goals</p>
                  <h3 className="text-4xl font-black text-white">{totalTasks}</h3>
                  <p className="text-xs text-gray-500 mt-1">CallMeAI tasks</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Target className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
              <Link href="/dashboard/tasks" className="flex items-center text-cyan-400 text-sm font-semibold hover:translate-x-1 transition-transform">
                Manage Goals <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>

          {/* Card 3: AI Calls Scheduled */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-400 mb-1">AI Calls</p>
                  <h3 className="text-4xl font-black text-white">0</h3>
                  <p className="text-xs text-gray-500 mt-1">This week</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Phone className="w-6 h-6 text-pink-400" />
                </div>
              </div>
              <Link href="/dashboard/calls" className="flex items-center text-pink-400 text-sm font-semibold hover:translate-x-1 transition-transform">
                Schedule Call <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Tasks and Navigation Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Tasks List - 2 columns */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Your Tasks</h2>
              <CreateTaskDialog>
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold transform hover:scale-105 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Task
                </Button>
              </CreateTaskDialog>
            </div>
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 overflow-hidden">
              {tasks && tasks.length > 0 ? (
                <TaskList tasks={tasks} todayResponses={todayResponses || []} />
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-lg font-semibold mb-2">No tasks yet</p>
                  <p className="text-gray-500 text-sm">Create your first goal to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Navigation */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8">
              <h3 className="text-xl font-black text-white mb-6">Quick Access</h3>
              <div className="space-y-3">
                <Link href="/dashboard/calls">
                  <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-purple-400/50 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/20 rounded-lg">
                          <Phone className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="font-semibold text-white">AI Calls</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/progress">
                  <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/50 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-cyan-500/20 rounded-lg">
                          <TrendingUp className="w-5 h-5 text-cyan-400" />
                        </div>
                        <span className="font-semibold text-white">Progress</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>

                <Link href="/dashboard/reports">
                  <div className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-pink-400/50 transition-all group cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-pink-500/20 rounded-lg">
                          <FileText className="w-5 h-5 text-pink-400" />
                        </div>
                        <span className="font-semibold text-white">Reports</span>
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-pink-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>

            {/* Motivational Card */}
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-purple-500/10 to-cyan-500/10 backdrop-blur-sm p-8">
              <h3 className="text-lg font-black text-white mb-3">Keep Going! 🚀</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                You're building amazing habits. Every task completed brings you closer to your goals. Stay consistent!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
