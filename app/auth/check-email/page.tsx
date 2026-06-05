"use client"

import { Button } from "@/components/ui/button"
import { Mail, Target, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"

export default function CheckEmailPage() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.005_270)] text-white overflow-hidden flex items-center justify-center relative">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="animate-orbit absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[oklch(0.45_0.2_280)] rounded-full blur-[180px] opacity-[0.07]" />
      </div>

      <div
        className={cn(
          "relative z-10 w-full max-w-sm px-4 transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        )}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2.5 mb-12">
          <div className="w-8 h-8 bg-[oklch(0.55_0.25_280)] rounded-lg flex items-center justify-center">
            <Target className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-semibold text-white">CallMeAI</span>
        </Link>

        {/* Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.13_0.008_270)]/80 backdrop-blur-xl p-8 text-center">
          <div className="w-14 h-14 mx-auto mb-5 rounded-full bg-[oklch(0.55_0.25_280)]/15 border border-[oklch(0.55_0.25_280)]/20 flex items-center justify-center">
            <Mail className="w-6 h-6 text-[oklch(0.75_0.18_280)]" />
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-white mb-2">Check your email</h1>
          <p className="text-white/35 text-sm mb-6">
            We&apos;ve sent you a confirmation link. Click it to activate your account and start setting up your goals.
          </p>

          <Link href="/auth/login">
            <Button
              variant="ghost"
              className="h-11 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] text-white/60 hover:text-white font-medium rounded-xl transition-all px-6"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to sign in
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
