import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { CallScheduleList } from "@/components/call-schedule-list"
import { CreateCallScheduleDialog } from "@/components/create-call-schedule-dialog"
import { CallLogsList } from "@/components/call-logs-list"
import { PhoneNumberSettings } from "@/components/phone-number-settings"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Button } from "@/components/ui/button"
import { Plus, Phone, Calendar, Clock, Target, Check, ChevronLeft } from "lucide-react"
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
              <span className="text-white/40 text-sm">AI Calls</span>
            </div>
            <ProfileDropdown initialName={profile?.full_name} initialEmail={data.user.email} />
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
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">AI Calls</h1>
          <p className="text-white/35 mt-2">Schedule and manage your accountability check-ins</p>
        </div>

        {/* Phone Number Settings */}
        <div className="mb-10">
          <PhoneNumberSettings />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Active Schedules</p>
                <h3 className="text-3xl font-semibold text-white">{activeSchedules}</h3>
                <p className="text-xs text-white/25 mt-1">Call schedules</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Completed Calls</p>
                <h3 className="text-3xl font-semibold text-white">{completedCalls}</h3>
                <p className="text-xs text-white/25 mt-1">This week</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Check className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
            <div className="flex items-start justify-between mb-2">
              <div>
                <p className="text-xs font-medium text-white/35 mb-1">Next Call</p>
                <h3 className="text-3xl font-semibold text-white">{schedules && schedules.length > 0 ? "Today" : "None"}</h3>
                <p className="text-xs text-white/25 mt-1">Scheduled</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                <Clock className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {/* Call Schedules */}
        <div className="mb-10">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Your Call Schedules</h2>
            <CreateCallScheduleDialog>
              <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white border-0 font-medium rounded-xl text-sm h-9 px-4 transition-colors">
                <Plus className="w-4 h-4 mr-1.5" />
                Add Schedule
              </Button>
            </CreateCallScheduleDialog>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
            {schedules && schedules.length > 0 ? (
              <CallScheduleList schedules={schedules} />
            ) : (
              <div className="text-center py-14">
                <div className="w-14 h-14 rounded-full bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center mx-auto mb-4">
                  <Phone className="w-6 h-6 text-[oklch(0.75_0.18_280)]" />
                </div>
                <p className="text-white/50 font-medium mb-1">No schedules yet</p>
                <p className="text-white/25 text-sm">Create your first call schedule to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Call History */}
        <div className="mb-10">
          <div className="mb-4">
            <h2 className="text-xl font-semibold text-white">Call History</h2>
            <p className="text-white/25 text-sm mt-0.5">Click a call to view its full transcript</p>
          </div>
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-5">
            <CallLogsList />
          </div>
        </div>
      </div>
    </div>
  )
}
