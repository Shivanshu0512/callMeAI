import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CallScheduleList } from "@/components/call-schedule-list"
import { CreateCallScheduleDialog } from "@/components/create-call-schedule-dialog"
import { BlandCallDialog } from "@/components/bland-call-dialog"
import { PhoneNumberSettings } from "@/components/phone-number-settings"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Calendar, Clock, Target, Settings, Check, AlertCircle, ChevronRight } from "lucide-react"
import Link from "next/link"

export default async function CallsPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get call schedules
  const { data: schedules } = await supabase
    .from("call_schedules")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  // Get recent call logs
  const { data: recentCalls } = await supabase
    .from("call_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .order("scheduled_at", { ascending: false })
    .limit(5)

  const activeSchedules = schedules?.length || 0
  const completedCalls = recentCalls?.filter((call) => call.call_status === "completed").length || 0

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div className="absolute top-1/3 -left-1/4 w-96 h-96 bg-gradient-to-br from-pink-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
        <div className="absolute bottom-1/3 -right-1/4 w-96 h-96 bg-gradient-to-bl from-cyan-500/10 to-transparent rounded-full blur-3xl opacity-30 animate-pulse" />
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
              <span className="text-gray-400 ml-4">/ AI Calls</span>
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
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-black mb-2">
            <span className="text-white">Schedule Your</span>
            <span className="block bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
              AI Calls
            </span>
          </h1>
          <p className="text-xl text-gray-400 mt-4">Get personalized accountability check-ins from your AI coach</p>
        </div>

        {/* Phone Number Settings */}
        <div className="mb-12">
          <PhoneNumberSettings />
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Active Schedules */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Active Schedules</p>
                  <h3 className="text-4xl font-black text-white">{activeSchedules}</h3>
                  <p className="text-xs text-gray-500 mt-1">Call schedules</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Completed Calls */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Completed Calls</p>
                  <h3 className="text-4xl font-black text-white">{completedCalls}</h3>
                  <p className="text-xs text-gray-500 mt-1">This week</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Check className="w-6 h-6 text-cyan-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Next Call */}
          <div className="group relative rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-8 bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 rounded-2xl">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Next Call</p>
                  <h3 className="text-4xl font-black text-white">{schedules && schedules.length > 0 ? "Today" : "None"}</h3>
                  <p className="text-xs text-gray-500 mt-1">Scheduled</p>
                </div>
                <div className="p-3 bg-pink-500/20 rounded-xl">
                  <Clock className="w-6 h-6 text-pink-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Call Schedules Section */}
          <div className="lg:col-span-2">
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-2xl font-black text-white">Your Call Schedules</h2>
              <CreateCallScheduleDialog>
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold transform hover:scale-105 transition-all">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Schedule
                </Button>
              </CreateCallScheduleDialog>
            </div>
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-6 overflow-hidden">
              {schedules && schedules.length > 0 ? (
                <CallScheduleList schedules={schedules} />
              ) : (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Phone className="w-8 h-8 text-purple-400" />
                  </div>
                  <p className="text-gray-400 text-lg font-semibold mb-2">No schedules yet</p>
                  <p className="text-gray-500 text-sm">Create your first call schedule to get started</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Call Me Now */}
            {schedules && schedules.length > 0 && (
              <BlandCallDialog scheduleId={schedules[0].id} scheduleName={schedules[0].name}>
                <Button className="w-full bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 text-white border-0 font-semibold py-6 transform hover:scale-105 transition-all rounded-2xl text-lg">
                  <Phone className="w-5 h-5 mr-2" />
                  Call Me Now
                </Button>
              </BlandCallDialog>
            )}

            {/* Integration Info */}
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8">
              <h3 className="text-xl font-black text-white mb-6">Bland.ai</h3>
              <div className="space-y-3">
                <p className="text-gray-300 text-sm leading-relaxed">
                  Powered by Bland.ai for natural, AI-driven phone calls that feel like talking to a real person.
                </p>
                <div className="flex items-center space-x-2 text-cyan-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Natural voice conversations</span>
                </div>
                <div className="flex items-center space-x-2 text-cyan-400 text-sm">
                  <Check className="w-4 h-4" />
                  <span>Automatic task logging</span>
                </div>
              </div>
            </div>

            {/* Recent Calls */}
            {recentCalls && recentCalls.length > 0 && (
              <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm p-8">
                <h3 className="text-xl font-black text-white mb-6">Recent Calls</h3>
                <div className="space-y-4">
                  {recentCalls.slice(0, 3).map((call) => (
                    <div
                      key={call.id}
                      className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">
                            {new Date(call.scheduled_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-500 capitalize mt-1">{call.call_status}</p>
                        </div>
                        <div
                          className={`w-3 h-3 rounded-full ${
                            call.call_status === "completed"
                              ? "bg-green-500"
                              : call.call_status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call Tips */}
            <div className="rounded-2xl border border-white/20 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 backdrop-blur-sm p-8">
              <h3 className="text-lg font-black text-white mb-3">Pro Tips 💡</h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                Be honest about your progress. Your AI coach learns from your responses to provide better support and accountability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
