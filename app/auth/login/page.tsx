"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Target, ArrowRight, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

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

        {/* Form Card */}
        <div className="rounded-2xl border border-white/[0.06] bg-[oklch(0.13_0.008_270)]/80 backdrop-blur-xl p-8">
          <h1 className="text-2xl font-semibold tracking-tight text-white mb-1">Welcome back</h1>
          <p className="text-white/35 text-sm mb-8">Sign in to your account</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs font-medium text-white/50">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs font-medium text-white/50">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 bg-white/[0.04] border-white/[0.08] text-white placeholder:text-white/20 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all"
              />
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white font-medium rounded-xl border-0 transition-all"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <div className="my-6 flex items-center">
            <div className="flex-1 h-px bg-white/[0.06]" />
            <span className="px-3 text-xs text-white/20">or</span>
            <div className="flex-1 h-px bg-white/[0.06]" />
          </div>

          <Link href="/auth/signup">
            <Button
              type="button"
              variant="ghost"
              className="w-full h-11 border border-white/[0.08] hover:border-white/[0.15] hover:bg-white/[0.03] text-white/60 hover:text-white font-medium rounded-xl transition-all"
            >
              Create an account
            </Button>
          </Link>
        </div>

        <p className="mt-6 text-center text-xs text-white/15">
          By signing in, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  )
}
