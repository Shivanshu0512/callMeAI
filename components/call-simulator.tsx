"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Phone, PhoneCall, PhoneOff, Mic, MicOff, Volume2 } from "lucide-react"

interface CallSimulatorProps {
  scheduleId: string
  scheduleName: string
  onCallComplete?: () => void
}

export function CallSimulator({ scheduleId, scheduleName, onCallComplete }: CallSimulatorProps) {
  const [callState, setCallState] = useState<"idle" | "calling" | "connected" | "ended">("idle")
  const [isMuted, setIsMuted] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [callError, setCallError] = useState<string | null>(null)

  const initiateCall = async () => {
    setCallState("calling")
    setCallError(null)

    try {
      const response = await fetch("/api/voice/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scheduleId: scheduleId,
          phoneNumber: "+1234567890", // This would come from user profile
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Simulate call connection after 3 seconds
        setTimeout(() => {
          setCallState("connected")
          startCallTimer()
        }, 3000)
      } else {
        setCallState("idle")
        setCallError(data.error || "Failed to initiate call")
      }
    } catch (error) {
      console.error("Call error:", error)
      setCallState("idle")
      setCallError("Network error - please try again")
    }
  }

  const startCallTimer = () => {
    const interval = setInterval(() => {
      setCallDuration((prev) => {
        if (prev >= 300) {
          // 5 minutes max
          endCall()
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1000)
  }

  const endCall = () => {
    setCallState("ended")
    setTimeout(() => {
      setCallState("idle")
      setCallDuration(0)
      setCallError(null)
      onCallComplete?.()
    }, 2000)
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getCallStateInfo = () => {
    switch (callState) {
      case "calling":
        return { text: "Calling...", color: "bg-yellow-500", icon: PhoneCall }
      case "connected":
        return { text: "Connected", color: "bg-green-500", icon: Phone }
      case "ended":
        return { text: "Call Ended", color: "bg-gray-500", icon: PhoneOff }
      default:
        return { text: "Ready", color: "bg-blue-500", icon: Phone }
    }
  }

  const stateInfo = getCallStateInfo()
  const StateIcon = stateInfo.icon

  return (
    <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center space-x-2">
          <StateIcon className="w-5 h-5" />
          <span>CallMeAI Call Simulator</span>
        </CardTitle>
        <CardDescription>Test your CallMeAI call experience</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Call Status */}
        <div className="text-center space-y-3">
          <div className={`w-16 h-16 ${stateInfo.color} rounded-full flex items-center justify-center mx-auto`}>
            <StateIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <p className="font-medium text-gray-900 dark:text-white">{scheduleName}</p>
            <Badge variant="secondary" className="mt-1">
              {stateInfo.text}
            </Badge>
          </div>
          {callState === "connected" && (
            <p className="text-lg font-mono text-gray-600 dark:text-gray-400">{formatDuration(callDuration)}</p>
          )}
          {callError && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-3">
              <p className="text-sm text-red-700 dark:text-red-400">{callError}</p>
            </div>
          )}
        </div>

        {/* Call Controls */}
        <div className="flex justify-center space-x-4">
          {callState === "idle" && (
            <Button onClick={initiateCall} className="bg-green-600 hover:bg-green-700 text-white px-8">
              <Phone className="w-4 h-4 mr-2" />
              Start Call
            </Button>
          )}

          {callState === "calling" && (
            <Button onClick={() => setCallState("idle")} variant="destructive" className="px-8">
              <PhoneOff className="w-4 h-4 mr-2" />
              Cancel
            </Button>
          )}

          {callState === "connected" && (
            <>
              <Button onClick={() => setIsMuted(!isMuted)} variant="outline" size="sm">
                {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Button onClick={endCall} variant="destructive" className="px-6">
                <PhoneOff className="w-4 h-4 mr-2" />
                End Call
              </Button>
              <Button variant="outline" size="sm">
                <Volume2 className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

        {/* Call Script Preview */}
        {callState === "connected" && (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 dark:text-white mb-2">AI Agent:</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              "Hello! This is CallMeAI. I hope you're having a great day! I'm calling to check in on
              your daily goals and see how you're progressing. Let's start with your first task..."
            </p>
          </div>
        )}

        {callState === "ended" && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 text-center">
            <p className="text-sm text-green-700 dark:text-green-400">
              Call completed successfully! Your responses have been recorded.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
