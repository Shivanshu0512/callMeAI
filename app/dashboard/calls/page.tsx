import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CallScheduleList } from "@/components/call-schedule-list"
import { CreateCallScheduleDialog } from "@/components/create-call-schedule-dialog"
import { VoiceSettingsDialog } from "@/components/voice-settings-dialog"
import { CallSimulator } from "@/components/call-simulator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Calendar, Clock, Target, Settings } from "lucide-react"
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
                <span className="text-blue-600 dark:text-blue-400 font-medium">AI Calls</span>
              </nav>
            </div>
            <div className="flex items-center space-x-4">
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Active Schedules</CardTitle>
              <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeSchedules}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Call schedules configured</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Completed Calls</CardTitle>
              <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{completedCalls}</div>
              <p className="text-xs text-gray-600 dark:text-gray-400">This week</p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-300">Next Call</CardTitle>
              <Clock className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {schedules && schedules.length > 0 ? "Today" : "None"}
              </div>
              <p className="text-xs text-gray-600 dark:text-gray-400">Scheduled call</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Call Schedules Section */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl text-gray-900 dark:text-white">AI Call Schedules</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-300">
                      Manage when CallMeAI calls you
                    </CardDescription>
                  </div>
                  <CreateCallScheduleDialog>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Schedule
                    </Button>
                  </CreateCallScheduleDialog>
                </div>
              </CardHeader>
              <CardContent>
                <CallScheduleList schedules={schedules || []} />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Call Simulator */}
            {schedules && schedules.length > 0 && (
              <CallSimulator scheduleId={schedules[0].id} scheduleName={schedules[0].name} />
            )}

            {/* Voice Settings */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Voice Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300">Current Voice</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400 capitalize">
                    {profile?.preferred_voice || "alloy"}
                  </p>
                </div>
                <VoiceSettingsDialog currentVoice={profile?.preferred_voice} phoneNumber={profile?.phone_number}>
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    <Settings className="w-4 h-4 mr-2" />
                    Update Voice Settings
                  </Button>
                </VoiceSettingsDialog>
              </CardContent>
            </Card>

            {/* Recent Calls */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Recent Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {recentCalls && recentCalls.length > 0 ? (
                  <div className="space-y-3">
                    {recentCalls.slice(0, 3).map((call) => (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {new Date(call.scheduled_at).toLocaleDateString()}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400 capitalize">{call.call_status}</p>
                        </div>
                        <div
                          className={`w-2 h-2 rounded-full ${
                            call.call_status === "completed"
                              ? "bg-green-500"
                              : call.call_status === "failed"
                                ? "bg-red-500"
                                : "bg-yellow-500"
                          }`}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600 dark:text-gray-400">No calls yet</p>
                )}
              </CardContent>
            </Card>

            {/* Call Tips */}
            <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 dark:text-white">Call Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  Your AI agent will ask about your daily tasks and log your responses. Be honest about your progress -
                  it helps build better habits!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
