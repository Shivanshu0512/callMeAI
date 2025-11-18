"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, AlertCircle, X } from "lucide-react"

interface ToastProps {
  message: string
  type: "success" | "error"
  duration?: number
  onClose?: () => void
}

export function Toast({ message, type, duration = 4000, onClose }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-8 right-8 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${
        type === "success"
          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30"
          : "bg-gradient-to-r from-red-500/20 to-pink-500/20 border-red-500/30"
      } border rounded-xl backdrop-blur-sm p-4 flex items-start space-x-3 max-w-sm`}
    >
      {type === "success" ? (
        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
      ) : (
        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      )}
      <div className="flex-1">
        <p className={`text-sm font-medium ${
          type === "success" ? "text-green-400" : "text-red-400"
        }`}>
          {message}
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="text-gray-400 hover:text-white transition-colors"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Animated progress bar */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 ${
          type === "success"
            ? "bg-gradient-to-r from-green-400 to-emerald-400"
            : "bg-gradient-to-r from-red-400 to-pink-400"
        }`}
        style={{
          animation: `shrink ${duration}ms linear forwards`,
        }}
      />

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  )
}

export function useToast() {
  const [toasts, setToasts] = useState<
    Array<{ id: string; message: string; type: "success" | "error" }>
  >([])

  const addToast = (message: string, type: "success" | "error" = "success") => {
    const id = Math.random().toString()
    setToasts((prev) => [...prev, { id, message, type }])
    return id
  }

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return { toasts, addToast, removeToast, Toast }
}
