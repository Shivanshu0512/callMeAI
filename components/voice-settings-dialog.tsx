"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Play, Volume2, Phone } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface VoiceSettingsDialogProps {
  children: React.ReactNode
  currentVoice?: string
  phoneNumber?: string
}

const VOICE_OPTIONS = [
  { value: "alloy", label: "Alloy", description: "Neutral and balanced" },
  { value: "echo", label: "Echo", description: "Warm and friendly" },
  { value: "fable", label: "Fable", description: "Expressive and engaging" },
  { value: "onyx", label: "Onyx", description: "Deep and authoritative" },
  { value: "nova", label: "Nova", description: "Bright and energetic" },
  { value: "shimmer", label: "Shimmer", description: "Gentle and soothing" },
]

export function VoiceSettingsDialog({ children, currentVoice = "alloy", phoneNumber = "" }: VoiceSettingsDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [selectedVoice, setSelectedVoice] = useState(currentVoice)
  const [phone, setPhone] = useState(phoneNumber)
  const router = useRouter()

  useEffect(() => {
    setSelectedVoice(currentVoice)
    setPhone(phoneNumber)
  }, [currentVoice, phoneNumber])

  const playVoiceSample = async (voice: string) => {
    setIsPlaying(true)

    try {
      const response = await fetch("/api/voice/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: "Hello! This is CallMeAI. I'm here to help you stay on track with your daily goals and build lasting habits.",
          voice: voice,
        }),
      })

      const data = await response.json()

      if (data.audioUrl) {
        const audio = new Audio(data.audioUrl)
        audio.onended = () => setIsPlaying(false)
        audio.onerror = () => {
          console.error("Audio playback error")
          alert(`Voice preview: ${data.message || `${voice} voice selected`}`)
          setIsPlaying(false)
        }
        await audio.play()
      } else {
        // Show text preview when audio is not available
        alert(data.message || `Voice preview for ${voice}: Sample text would be spoken in this voice`)
        setIsPlaying(false)
      }
    } catch (error) {
      console.error("Error playing voice sample:", error)
      alert(`Voice preview for ${voice}: This voice would be used for your AI calls`)
      setIsPlaying(false)
    }
  }

  const handleSave = async () => {
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_voice: selectedVoice,
        phone_number: phone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (!error) {
      setOpen(false)
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Voice & Call Settings</DialogTitle>
          <DialogDescription>Customize your AI agent's voice and update your contact information.</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Phone Number */}
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This number will be used for CallMeAI calls
            </p>
          </div>

          {/* Voice Selection */}
          <div className="space-y-4">
            <div>
              <Label>AI Voice</Label>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose the voice for CallMeAI
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {VOICE_OPTIONS.map((voice) => (
                <Card
                  key={voice.value}
                  className={`cursor-pointer transition-colors ${
                    selectedVoice === voice.value
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20"
                      : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                  onClick={() => setSelectedVoice(voice.value)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-3 h-3 rounded-full ${
                              selectedVoice === voice.value ? "bg-blue-500" : "bg-gray-300 dark:bg-gray-600"
                            }`}
                          />
                          <h4 className="font-medium text-gray-900 dark:text-white">{voice.label}</h4>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{voice.description}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          playVoiceSample(voice.value)
                        }}
                        disabled={isPlaying}
                      >
                        {isPlaying ? <Volume2 className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Test Call */}
          <Card className="border-dashed border-2 border-gray-300 dark:border-gray-600">
            <CardHeader className="text-center">
              <CardTitle className="text-lg flex items-center justify-center space-x-2">
                <Phone className="w-5 h-5" />
                <span>Test Your Settings</span>
              </CardTitle>
              <CardDescription>Try a sample call to hear how your AI agent will sound</CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button
                variant="outline"
                onClick={() => {
                  if (phone) {
                    alert(`Test call would be initiated to ${phone} with ${selectedVoice} voice`)
                  } else {
                    alert("Please enter a phone number first")
                  }
                }}
                disabled={!phone}
              >
                <Phone className="w-4 h-4 mr-2" />
                Start Test Call
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
