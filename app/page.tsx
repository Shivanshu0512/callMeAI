"use client"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  Phone,
  Target,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  PhoneCall,
  PhoneOff,
  BarChart3,
  Calendar,
  Users,
  CheckCircle2,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsInView(true)
      },
      { threshold }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isInView }
}

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [mounted, setMounted] = useState(false)
  const isScrolled = scrollY > 50

  const howItWorks = useInView(0.1)
  const features = useInView(0.1)
  const ctaSection = useInView(0.1)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll, { passive: true })
    setMounted(true)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const steps = [
    {
      num: "01",
      title: "Set your goals",
      desc: "Tell us what you want to achieve. Fitness, learning, productivity — anything that matters to you.",
      icon: Target,
    },
    {
      num: "02",
      title: "We call you",
      desc: "Get AI-powered phone calls at your preferred schedule. Natural conversation, real accountability.",
      icon: Phone,
    },
    {
      num: "03",
      title: "Track progress",
      desc: "See insights and patterns in weekly reports. Our AI adapts to what works for you.",
      icon: BarChart3,
    },
  ]

  const featureItems = [
    { icon: Calendar, title: "Flexible Scheduling", desc: "Set calls for any time that fits your lifestyle" },
    { icon: Shield, title: "Privacy First", desc: "Your data is encrypted and never shared" },
    { icon: Zap, title: "Instant Setup", desc: "Start getting calls within minutes" },
    { icon: TrendingUp, title: "Smart Reports", desc: "AI-generated weekly progress insights" },
    { icon: Users, title: "Natural Conversations", desc: "Feels like talking to a real accountability partner" },
    { icon: CheckCircle2, title: "Goal Tracking", desc: "Monitor completion rates and streaks" },
  ]

  return (
    <div className="min-h-screen bg-[oklch(0.09_0.005_270)] text-white overflow-hidden">
      {/* Background */}
      <div className="fixed inset-0 z-0">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div
          className="animate-orbit absolute top-1/4 left-1/3 w-[600px] h-[600px] bg-[oklch(0.45_0.2_280)] rounded-full blur-[180px] opacity-[0.07]"
        />
      </div>

      {/* Navigation */}
      <nav
        className={cn(
          "fixed top-0 w-full z-50 transition-all duration-300",
          isScrolled
            ? "backdrop-blur-xl bg-[oklch(0.09_0.005_270)]/80 border-b border-white/5 py-2"
            : "bg-transparent py-4"
        )}
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-[oklch(0.55_0.25_280)] rounded-lg flex items-center justify-center">
                <Target className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-semibold text-white">
                CallMeAI
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <span className="text-sm text-white/50 hover:text-white transition-colors cursor-pointer">
                  Sign in
                </span>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white rounded-full px-5 h-9 text-sm font-medium border-0 transition-colors">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center z-10">
        <div className="max-w-5xl mx-auto w-full text-center">
          {/* Headline */}
          <h1
            className={cn(
              "text-5xl md:text-6xl lg:text-7xl font-semibold tracking-tight leading-[1.1] mb-6 transition-all duration-700",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <span className="block text-white">Your AI accountability</span>
            <span className="block text-[oklch(0.75_0.18_280)]">
              partner that calls you.
            </span>
          </h1>

          {/* Subtitle */}
          <p
            className={cn(
              "text-lg md:text-xl text-white/40 max-w-xl mx-auto mb-10 transition-all duration-700 delay-150",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            Personalized AI phone calls that keep you consistent, motivated, and on track with your goals.
          </p>

          {/* CTA */}
          <div
            className={cn(
              "transition-all duration-700 delay-300",
              mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <Link href="/auth/signup">
              <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white rounded-full px-8 h-12 text-base font-medium border-0 transition-all hover:shadow-lg hover:shadow-[oklch(0.55_0.25_280)]/20">
                Get started — it&apos;s free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>

          {/* Incoming Call Visual */}
          <div
            className={cn(
              "mt-20 flex justify-center transition-all duration-1000 delay-500",
              mounted ? "opacity-100 scale-100" : "opacity-0 scale-90"
            )}
          >
            <div className="relative">
              {/* Outer rotating ring */}
              <div className="animate-spin-slow absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-72 h-72 md:w-80 md:h-80 rounded-full border border-dashed border-white/[0.06]" />
              </div>

              {/* Counter-rotating ring with dots */}
              <div className="animate-spin-reverse absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="relative w-60 h-60 md:w-64 md:h-64 rounded-full border border-white/[0.04]">
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[oklch(0.55_0.25_280)]" />
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-[oklch(0.55_0.25_280)]/50" />
                  <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[oklch(0.55_0.25_280)]/30" />
                  <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-2 h-2 rounded-full bg-[oklch(0.55_0.25_280)]/70" />
                </div>
              </div>

              {/* Expanding pulse rings */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-pulse-ring absolute w-32 h-32 rounded-full border-2 border-[oklch(0.55_0.25_280)]/40" />
                <div className="animate-pulse-ring absolute w-32 h-32 rounded-full border border-[oklch(0.55_0.25_280)]/25" style={{ animationDelay: "0.7s" }} />
                <div className="animate-pulse-ring-lg absolute w-32 h-32 rounded-full border border-[oklch(0.55_0.25_280)]/15" style={{ animationDelay: "1.4s" }} />
              </div>

              {/* Glow behind card */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="animate-glow-pulse w-48 h-48 rounded-full bg-[oklch(0.55_0.25_280)]" />
              </div>

              {/* Center card */}
              <div className="relative w-72 h-72 md:w-80 md:h-80 flex items-center justify-center">
                <div className="animate-float animate-call-breathe relative w-52 md:w-56 bg-[oklch(0.11_0.01_270)]/90 backdrop-blur-xl border border-white/[0.08] rounded-3xl p-7 z-10">
                  {/* Avatar */}
                  <div className="relative mx-auto w-18 h-18 mb-5">
                    <div className="w-full h-full rounded-full bg-gradient-to-br from-[oklch(0.55_0.25_280)] to-[oklch(0.45_0.2_300)] flex items-center justify-center">
                      <Phone className="w-8 h-8 text-white" />
                    </div>
                    {/* Online indicator */}
                    <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-[oklch(0.11_0.01_270)]" />
                  </div>

                  {/* Caller info */}
                  <div className="text-center">
                    <p className="text-white font-semibold text-lg tracking-tight">CallMeAI</p>
                    <p className="text-[oklch(0.75_0.18_280)] text-xs font-medium mt-0.5">Incoming call</p>

                    {/* Waveform visualizer */}
                    <div className="flex items-center justify-center gap-[3px] mt-4 h-6">
                      {[0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1.05, 1.2].map((delay, i) => (
                        <div
                          key={i}
                          className="w-[3px] rounded-full bg-gradient-to-t from-[oklch(0.55_0.25_280)] to-[oklch(0.75_0.18_280)]"
                          style={{
                            animation: `waveform 1.2s ease-in-out ${delay}s infinite`,
                            height: "4px",
                          }}
                        />
                      ))}
                    </div>

                    {/* Action buttons */}
                    <div className="mt-5 flex justify-center gap-5">
                      <button className="group w-11 h-11 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center hover:bg-red-500/30 hover:border-red-500/40 hover:scale-110 transition-all">
                        <PhoneOff className="w-4.5 h-4.5 text-red-400 group-hover:text-red-300" />
                      </button>
                      <button className="group w-11 h-11 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center hover:bg-green-500/40 hover:border-green-500/50 hover:scale-110 transition-all">
                        <PhoneCall className="w-4.5 h-4.5 text-green-400 group-hover:text-green-300" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto">
          <div
            ref={howItWorks.ref}
            className={cn(
              "transition-all duration-700",
              howItWorks.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
            )}
          >
            <p className="text-xs font-medium tracking-widest uppercase text-[oklch(0.55_0.25_280)] mb-4">
              How it works
            </p>
            <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-16">
              Three steps to better habits.
            </h2>
          </div>

          <div className="space-y-16 md:space-y-20">
            {steps.map((step, i) => {
              const stepView = useInView(0.2)
              return (
                <div
                  key={step.num}
                  ref={stepView.ref}
                  className={cn(
                    "flex flex-col md:flex-row items-start gap-6 md:gap-12 transition-all duration-700",
                    stepView.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
                  )}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-6">
                    <span className="text-6xl md:text-7xl font-bold text-white/[0.04] select-none leading-none">
                      {step.num}
                    </span>
                    <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center md:hidden">
                      <step.icon className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                    </div>
                  </div>
                  <div className="hidden md:flex w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] items-center justify-center flex-shrink-0 mt-2">
                    <step.icon className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-medium text-white mb-2">{step.title}</h3>
                    <p className="text-white/40 leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto bg-white/[0.04]" />

      {/* Features Grid */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div
          ref={features.ref}
          className={cn(
            "max-w-5xl mx-auto transition-all duration-700",
            features.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <p className="text-xs font-medium tracking-widest uppercase text-[oklch(0.55_0.25_280)] mb-4">
            Features
          </p>
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-16">
            Everything you need to<br className="hidden md:block" /> stay on track.
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
            {featureItems.map((f, i) => (
              <div
                key={i}
                className={cn(
                  "group transition-all duration-500",
                  features.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6",
                )}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 group-hover:border-white/[0.12] transition-colors">
                  <f.icon className="w-5 h-5 text-[oklch(0.75_0.18_280)]" />
                </div>
                <h3 className="text-white font-medium mb-1">{f.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-5xl mx-auto bg-white/[0.04]" />

      {/* CTA Section */}
      <section className="relative py-24 md:py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div
          ref={ctaSection.ref}
          className={cn(
            "max-w-3xl mx-auto text-center transition-all duration-700",
            ctaSection.isInView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <h2 className="text-4xl md:text-5xl font-medium tracking-tight text-white mb-6">
            Start building better habits today.
          </h2>
          <p className="text-white/35 text-lg mb-10 max-w-lg mx-auto">
            Join thousands who&apos;ve transformed their daily routines with AI-powered accountability calls.
          </p>
          <Link href="/auth/signup">
            <Button className="bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white rounded-full px-8 h-12 text-base font-medium border-0 transition-all hover:shadow-lg hover:shadow-[oklch(0.55_0.25_280)]/20">
              Get started — it&apos;s free
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
          <p className="text-white/20 text-sm mt-6">No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.04] py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-8">
            <div className="flex items-center space-x-3">
              <div className="w-7 h-7 bg-[oklch(0.55_0.25_280)] rounded-lg flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-semibold text-white">CallMeAI</span>
            </div>
            <div className="flex flex-wrap gap-6 text-sm text-white/25">
              <a href="#" className="hover:text-white/60 transition-colors">Features</a>
              <a href="#" className="hover:text-white/60 transition-colors">Pricing</a>
              <a href="#" className="hover:text-white/60 transition-colors">About</a>
              <a href="#" className="hover:text-white/60 transition-colors">Privacy</a>
              <a href="#" className="hover:text-white/60 transition-colors">Terms</a>
            </div>
          </div>
          <div className="flex flex-col md:flex-row justify-between items-center text-xs text-white/15 border-t border-white/[0.04] pt-6">
            <p>&copy; 2026 CallMeAI. All rights reserved.</p>
            <div className="flex gap-6 mt-3 md:mt-0">
              <a href="#" className="hover:text-white/40 transition-colors">Twitter</a>
              <a href="#" className="hover:text-white/40 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-white/40 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
