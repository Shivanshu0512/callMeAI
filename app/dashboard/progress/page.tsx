import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProgressCharts } from "@/components/progress-charts"
import { ProgressStats } from "@/components/progress-stats"
import { ProfileDropdown } from "@/components/profile-dropdown"
import { Button } from "@/components/ui/button"
import { Target, Download, TrendingUp, Zap, Award, ChevronLeft } from "lucide-react"
import Link from "next/link"

export default async function ProgressPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Get call logs for engagement tracking
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: callLogs } = await supabase
    .from("call_logs")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("scheduled_at", thirtyDaysAgo.toISOString())
    .order("scheduled_at", { ascending: true })

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
              <span className="text-white/40 text-sm">Progress</span>
            </div>
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-white/40 hover:text-white hover:bg-white/[0.04] transition-colors text-sm h-8 px-3"
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                Export
              </Button>
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
          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight text-white">Progress</h1>
          <p className="text-white/35 mt-2">Track your journey and celebrate your wins</p>
        </div>

        {/* Progress Stats */}
        <div className="mb-10">
          <ProgressStats callLogs={callLogs || []} />
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Charts */}
          <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] backdrop-blur-sm p-6 overflow-hidden">
            <h2 className="text-xl font-semibold text-white mb-5">Your Trends</h2>
            <ProgressCharts callLogs={callLogs || []} />
          </div>

          {/* Achievement Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-white/35 mb-1">Consistency Streak</p>
                  <h3 className="text-3xl font-semibold text-white">7 Days</h3>
                  <p className="text-xs text-white/25 mt-1">Keep it up</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.1] transition-all">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <p className="text-xs font-medium text-white/35 mb-1">Call Engagement</p>
                  <h3 className="text-3xl font-semibold text-white">
                    {callLogs ? Math.round((callLogs.filter((c: any) => c.call_status === "completed").length / Math.max(callLogs.length, 1)) * 100) : 0}%
                  </h3>
                  <p className="text-xs text-white/25 mt-1">Calls completed</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center">
                  <Award className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
