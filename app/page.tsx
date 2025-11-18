"use client"

import { Button } from "@/components/ui/button"
import { Phone, Target, TrendingUp, Clock, Shield, Zap, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener("scroll", handleScroll)
    setIsVisible(true)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-cyan-900/20" />
        <div
          className="absolute top-0 left-1/4 w-96 h-96 bg-gradient-to-br from-purple-500/20 to-transparent rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${scrollY * 0.1}px)` }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-20"
          style={{ transform: `translateY(${scrollY * -0.1}px)` }}
        />
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-black/30 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3 group cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center transform group-hover:scale-110 transition-transform">
                <Target className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                CallMeAI
              </span>
            </div>
            <div className="flex items-center space-x-3">
              <Link href="/auth/login">
                <Button
                  variant="ghost"
                  className="text-white hover:text-purple-400 hover:bg-white/10 transition-colors"
                >
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 transform hover:scale-105 transition-transform font-semibold">
                  Get Started
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen pt-20 px-4 sm:px-6 lg:px-8 flex items-center z-10">
        <div className="max-w-6xl mx-auto w-full">
          <div
            className="text-center transform transition-all duration-700"
            style={{ opacity: Math.max(0, 1 - scrollY / 300), transform: `translateY(${scrollY * 0.2}px)` }}
          >
            <div className="mb-6 inline-block">
              <div className="inline-block px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 hover:border-purple-400/50 transition-colors">
                <span className="bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent font-semibold text-sm">
                  ✨ Introducing CallMeAI
                </span>
              </div>
            </div>

            <h1 className="text-6xl md:text-7xl lg:text-8xl font-black mb-6 leading-tight">
              <span className="block text-white">Your Personal AI</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
                Accountability Partner
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
              Get personalized AI phone calls that keep you consistent, motivated, and accountable. Build extraordinary
              habits. Achieve extraordinary goals.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
              <Link href="/auth/signup" className="group">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-10 py-6 text-lg font-bold border-0 transform group-hover:scale-105 transition-all shadow-lg shadow-purple-500/50"
                >
                  Start Free
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button
                size="lg"
                className="bg-white/10 hover:bg-white/20 text-white px-10 py-6 text-lg font-bold border border-white/20 backdrop-blur-sm transition-all"
              >
                Learn More
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 max-w-xl mx-auto mb-20">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-purple-400">24/7</div>
                <div className="text-sm text-gray-400">Available</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-cyan-400">AI Powered</div>
                <div className="text-sm text-gray-400">Smart</div>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <div className="text-2xl font-bold text-pink-400">100% Free</div>
                <div className="text-sm text-gray-400">To Start</div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce"
          style={{ opacity: Math.max(0, 1 - scrollY / 200) }}
        >
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex items-start justify-center p-2">
            <div className="w-1 h-2 bg-white/50 rounded-full animate-pulse" />
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl font-black mb-6">
              <span className="text-white">How It</span>
              <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Works Perfectly
              </span>
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Three powerful features that work together to transform your life
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Feature 1 */}
            <div
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105"
              style={{
                transform: scrollY > 800 ? "translateY(0)" : "translateY(50px)",
                opacity: scrollY > 800 ? 1 : 0,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-purple-600/40 transition-all">
                  <Phone className="w-8 h-8 text-purple-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">AI Phone Calls</h3>
              <p className="text-gray-400 leading-relaxed">
                Schedule personalized calls that check in on your goals. Our AI learns your preferences and adapts the
                conversation naturally.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-purple-400 font-semibold group-hover:translate-x-2 transition-transform">
                Learn more <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Feature 2 */}
            <div
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-cyan-400/50 transition-all duration-300 transform hover:scale-105"
              style={{
                transform: scrollY > 1000 ? "translateY(0)" : "translateY(50px)",
                opacity: scrollY > 1000 ? 1 : 0,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.1s",
              }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-cyan-600/20 rounded-xl flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-cyan-600/40 transition-all">
                  <Target className="w-8 h-8 text-cyan-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Custom Goals</h3>
              <p className="text-gray-400 leading-relaxed">
                Define any goal you want to track. From fitness to productivity, our system adapts to your unique
                journey.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-cyan-400 font-semibold group-hover:translate-x-2 transition-transform">
                Explore <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>

            {/* Feature 3 */}
            <div
              className="group relative p-8 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm hover:border-pink-400/50 transition-all duration-300 transform hover:scale-105"
              style={{
                transform: scrollY > 1200 ? "translateY(0)" : "translateY(50px)",
                opacity: scrollY > 1200 ? 1 : 0,
                transition: "all 0.6s cubic-bezier(0.4, 0, 0.2, 1) 0.2s",
              }}
            >
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-xl flex items-center justify-center group-hover:from-pink-500/40 group-hover:to-pink-600/40 transition-all">
                  <TrendingUp className="w-8 h-8 text-pink-400" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-3 text-white">Smart Insights</h3>
              <p className="text-gray-400 leading-relaxed">
                Get AI-powered weekly reports that analyze your progress and provide personalized recommendations to
                level up.
              </p>
              <div className="mt-6 pt-6 border-t border-white/10 flex items-center text-pink-400 font-semibold group-hover:translate-x-2 transition-transform">
                Discover <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </div>

          {/* Why Section */}
          <div className="mt-32 grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
                <span className="text-white">Why People</span>
                <span className="block bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  Love CallMeAI
                </span>
              </h2>

              <div className="space-y-6">
                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-lg">Flexible Scheduling</h3>
                    <p className="text-gray-400">Set calls for any time that fits your lifestyle perfectly</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-lg">Privacy Guaranteed</h3>
                    <p className="text-gray-400">Your data is encrypted and never shared with anyone</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 group">
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white mb-1 text-lg">Instant Results</h3>
                    <p className="text-gray-400">Start seeing progress within your first week</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-96 rounded-2xl overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-2xl" />
              <div className="absolute inset-0 backdrop-blur-md flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-cyan-400 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                    <Phone className="w-10 h-10 text-white" />
                  </div>
                  <p className="text-white font-bold text-lg">AI Call in Progress</p>
                  <p className="text-gray-300 mt-2">2m 34s</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative min-h-screen py-32 px-4 sm:px-6 lg:px-8 z-10 flex items-center">
        <div className="max-w-4xl mx-auto w-full text-center">
          <h2 className="text-5xl md:text-6xl font-black mb-8 leading-tight">
            <span className="block text-white">Ready to Transform</span>
            <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Your Habits?
            </span>
          </h2>

          <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
            Join thousands of people who've already transformed their lives with AI-powered accountability. Your journey
            starts today.
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            <Link href="/auth/signup" className="group">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white px-12 py-8 text-xl font-black border-0 transform group-hover:scale-105 transition-all shadow-2xl shadow-purple-500/50 w-full sm:w-auto"
              >
                Start Your Journey
                <ArrowRight className="w-6 h-6 ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button
              size="lg"
              className="bg-white/10 hover:bg-white/20 text-white px-12 py-8 text-xl font-black border border-white/30 backdrop-blur-sm transition-all w-full sm:w-auto"
            >
              Schedule a Demo
            </Button>
          </div>

          <p className="text-gray-400 text-sm">
            No credit card required • 30-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/10 bg-black/50 backdrop-blur-sm py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-cyan-500 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-white" />
                </div>
                <span className="font-black text-lg bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  CallMeAI
                </span>
              </div>
              <p className="text-gray-400 text-sm">Your AI accountability partner for extraordinary habits.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-400 hover:text-white transition-colors">
                <li><a href="#" className="hover:text-purple-400">Features</a></li>
                <li><a href="#" className="hover:text-purple-400">Pricing</a></li>
                <li><a href="#" className="hover:text-purple-400">How It Works</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-400 hover:text-white transition-colors">
                <li><a href="#" className="hover:text-cyan-400">About</a></li>
                <li><a href="#" className="hover:text-cyan-400">Blog</a></li>
                <li><a href="#" className="hover:text-cyan-400">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400 hover:text-white transition-colors">
                <li><a href="#" className="hover:text-pink-400">Privacy</a></li>
                <li><a href="#" className="hover:text-pink-400">Terms</a></li>
                <li><a href="#" className="hover:text-pink-400">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-400">
            <p>© 2024 CallMeAI. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-purple-400 transition-colors">Twitter</a>
              <a href="#" className="hover:text-cyan-400 transition-colors">LinkedIn</a>
              <a href="#" className="hover:text-pink-400 transition-colors">Instagram</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
