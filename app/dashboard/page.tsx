import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CreateCallScheduleDialog } from "@/components/create-call-schedule-dialog"
import { PhoneNumberPrompt } from "@/components/phone-number-prompt"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Button } from "@/components/ui/button"
import { Plus, Target, TrendingUp, Phone, FileText, ChevronRight, Calendar } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
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
  const today = new Date().toISOString().split("T")[0]
  const { data: todayCalls } = await supabase
    .from("call_logs")
    .select("id")
    .eq("user_id", data.user.id)
    .eq("call_status", "completed")
    .gte("scheduled_at", today)

  const completedToday = todayCalls?.length || 0
  const activeSchedules = schedules?.length || 0

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.005_270)] text-white overflow-hidden">
      {/* Phone number prompt - shows if no phone saved */}
      <PhoneNumberPrompt />

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
              <Link href="/" className="flex items-center gap-2.5">
                <div className="w-8 h-8 bg-[oklch(0.55_0.25_280)] rounded-lg flex items-center justify-center">
                  <Target className="w-4 h-4 text-white" />
                </div>
                <span className="text-lg font-semibold text-white">CallMeAI</span>
              </Link>
            </div>
            <ProfileDropdown initialName={profile?.full_name} initialEmail={data.user.email} />
          </div>
        </div>
      </header>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        {/* Welcome Section */}
        <div className="mb-12 pt-4">
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight mb-2">
            <span className="text-white">Dashboard</span>
          </h1>
          <p className="text-white/35 mt-2">Track progress, manage goals, and stay motivated</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {/* Today's Calls */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Today&apos;s Check-ins</p>
                <h3 className="text-3xl font-semibold text-white">{completedToday}</h3>
                <p className="text-xs text-white/25 mt-1">Calls completed today</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
            <Link href="/dashboard/calls" className="flex items-center text-[oklch(0.75_0.18_280)] text-xs font-medium hover:translate-x-0.5 transition-transform">
              View Call History <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>

          {/* Scheduled Calls */}
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Scheduled Calls</p>
                <h3 className="text-3xl font-semibold text-white">{activeSchedules}</h3>
                <p className="text-xs text-white/25 mt-1">Active schedules</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Phone className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
            <Link href="/dashboard/calls" className="flex items-center text-[oklch(0.75_0.18_280)] text-xs font-medium hover:translate-x-0.5 transition-transform">
              Manage Calls <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Schedule Your Calls */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Schedule Your Calls</h2>
              <p className="text-white/25 text-sm mt-0.5">Set up recurring accountability check-ins</p>
            </div>
            <CreateCallScheduleDialog>
              <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white border-0 font-medium rounded-xl text-sm h-9 px-4 transition-colors">
                <Plus className="w-4 h-4 mr-1.5" />
                New Schedule
              </Button>
            </CreateCallScheduleDialog>
          </div>

          {activeSchedules > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {schedules!.slice(0, 4).map((schedule: any) => (
                <div key={schedule.id} className="p-4 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Calendar className="w-4 h-4 text-[oklch(0.75_0.18_280)]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h3 className="text-sm font-medium text-white truncate">{schedule.name}</h3>
                      {schedule.topic && (
                        <p className="text-xs text-white/30 mt-0.5 line-clamp-1">{schedule.topic}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-white/25">
                        <span>
                          {(() => {
                            const [h, m] = schedule.time_of_day.split(":")
                            const hour = parseInt(h)
                            return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`
                          })()}
                        </span>
                        <span>·</span>
                        <span>
                          {schedule.days_of_week.length === 7
                            ? "Every day"
                            : schedule.days_of_week.length === 5 && schedule.days_of_week.every((d: number) => d >= 1 && d <= 5)
                            ? "Weekdays"
                            : `${schedule.days_of_week.length} days/week`}
                        </span>
                      </div>
                    </div>
                    <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2 ${schedule.is_active ? "bg-green-400" : "bg-white/20"}`} />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-white/[0.08] bg-white/[0.01] p-8 text-center">
              <div className="w-12 h-12 rounded-full bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center mx-auto mb-3">
                <Phone className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
              <p className="text-white/40 text-sm font-medium mb-1">No calls scheduled yet</p>
              <p className="text-white/20 text-xs mb-4">Schedule your first accountability call to get started</p>
              <CreateCallScheduleDialog>
                <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white border-0 font-medium rounded-xl text-sm h-9 px-4 transition-colors">
                  <Plus className="w-4 h-4 mr-1.5" />
                  Schedule a Call
                </Button>
              </CreateCallScheduleDialog>
            </div>
          )}

          {activeSchedules > 4 && (
            <Link href="/dashboard/calls" className="flex items-center justify-center text-[oklch(0.75_0.18_280)] text-xs font-medium mt-3 hover:underline">
              View all {activeSchedules} schedules <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </Link>
          )}
        </div>

        {/* Quick Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <Link href="/dashboard/calls">
            <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 flex items-center justify-center">
                    <Phone className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">AI Calls</span>
                    <p className="text-xs text-white/25">View call history & logs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/progress">
            <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">Progress</span>
                    <p className="text-xs text-white/25">Track your journey</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>

          <Link href="/dashboard/reports">
            <div className="p-4 rounded-2xl bg-white/[0.02] hover:bg-white/[0.04] border border-white/[0.06] hover:border-white/[0.1] transition-all group cursor-pointer">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-white">Reports</span>
                    <p className="text-xs text-white/25">Weekly insights</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-white/40 group-hover:translate-x-0.5 transition-all" />
              </div>
            </div>
          </Link>
        </div>

        {/* Motivational Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 mb-10">
          <h3 className="text-sm font-medium text-white mb-2">Keep going</h3>
          <p className="text-white/30 text-sm leading-relaxed">
            Your AI coach handles the tracking — just pick up the phone and be honest. Stay consistent and the results will follow.
          </p>
        </div>
      </div>
    </div>
  )
}
