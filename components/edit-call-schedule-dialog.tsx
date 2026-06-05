"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Loader2, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CallSchedule {
  id: string
  name: string
  topic?: string
  days_of_week: number[]
  time_of_day: string
  timezone: string
  is_active: boolean
}

interface EditCallScheduleDialogProps {
  schedule: CallSchedule
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const DAYS = [
  { id: 0, label: "S", full: "Sun" },
  { id: 1, label: "M", full: "Mon" },
  { id: 2, label: "T", full: "Tue" },
  { id: 3, label: "W", full: "Wed" },
  { id: 4, label: "T", full: "Thu" },
  { id: 5, label: "F", full: "Fri" },
  { id: 6, label: "S", full: "Sat" },
]

const TIMEZONES = [
  "UTC",
  "Asia/Kolkata",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Asia/Tokyo",
  "Australia/Sydney",
]

export function EditCallScheduleDialog({ schedule, open, onOpenChange, onSuccess }: EditCallScheduleDialogProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    topic: "",
    time_of_day: "",
    timezone: "",
    days_of_week: [] as number[],
  })

  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        topic: schedule.topic || "",
        time_of_day: schedule.time_of_day,
        timezone: schedule.timezone,
        days_of_week: schedule.days_of_week,
      })
      setError(null)
    }
  }, [schedule])

  const toggleDay = (dayId: number) => {
    setFormData(prev => ({
      ...prev,
      days_of_week: prev.days_of_week.includes(dayId)
        ? prev.days_of_week.filter(d => d !== dayId)
        : [...prev.days_of_week, dayId].sort(),
    }))
  }

  const selectPreset = (preset: "weekdays" | "everyday" | "weekends") => {
    const map = {
      weekdays: [1, 2, 3, 4, 5],
      everyday: [0, 1, 2, 3, 4, 5, 6],
      weekends: [0, 6],
    }
    setFormData(prev => ({ ...prev, days_of_week: map[preset] }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (formData.days_of_week.length === 0) {
      setError("Please select at least one day")
      return
    }
    if (!formData.topic.trim()) {
      setError("Please describe what the call should be about")
      return
    }

    setIsLoading(true)

    try {
      const supabase = createClient()

      const { error: updateError } = await supabase
        .from("call_schedules")
        .update({
          name: formData.name || "Accountability Call",
          topic: formData.topic,
          days_of_week: formData.days_of_week,
          time_of_day: formData.time_of_day,
          timezone: formData.timezone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", schedule.id)

      if (updateError) {
        setError(updateError.message)
      } else {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || "Failed to update schedule")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[oklch(0.13_0.008_270)] border-white/[0.08] text-white max-w-md p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-6 pb-2">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold tracking-tight text-white">
              Edit Schedule
            </DialogTitle>
            <DialogDescription className="text-white/35 text-sm">
              Update your accountability check-in
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-5">
          {/* Topic */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-white/50">
              What should this call be about?
            </Label>
            <Textarea
              placeholder="e.g. Track my daily workout — ask how many sets I did, if I hit my protein goal, and whether I stretched"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              className="min-h-[80px] bg-white/[0.04] border-white/[0.08] text-white text-sm placeholder:text-white/15 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl resize-none transition-all"
            />
            <p className="text-[11px] text-white/20">Be specific — the AI will use this to guide the conversation</p>
          </div>

          {/* Schedule name */}
          <div className="space-y-2">
            <Label className="text-xs font-medium text-white/50">
              Schedule name <span className="text-white/20">(optional)</span>
            </Label>
            <Input
              placeholder="e.g. Morning Check-in"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="h-10 bg-white/[0.04] border-white/[0.08] text-white text-sm placeholder:text-white/15 focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all"
            />
          </div>

          {/* Days */}
          <div className="space-y-3">
            <Label className="text-xs font-medium text-white/50">Days</Label>
            <div className="flex justify-between gap-1.5">
              {DAYS.map((day) => {
                const selected = formData.days_of_week.includes(day.id)
                return (
                  <button
                    key={day.id}
                    type="button"
                    onClick={() => toggleDay(day.id)}
                    className={cn(
                      "w-10 h-10 rounded-full text-xs font-medium transition-all flex items-center justify-center",
                      selected
                        ? "bg-[oklch(0.55_0.25_280)] text-white shadow-lg shadow-[oklch(0.55_0.25_280)]/20"
                        : "bg-white/[0.04] text-white/30 border border-white/[0.06] hover:border-white/[0.12] hover:text-white/50"
                    )}
                  >
                    {day.label}
                  </button>
                )
              })}
            </div>
            {/* Quick presets */}
            <div className="flex gap-2">
              {[
                { label: "Weekdays", key: "weekdays" as const },
                { label: "Everyday", key: "everyday" as const },
                { label: "Weekends", key: "weekends" as const },
              ].map((preset) => (
                <button
                  key={preset.key}
                  type="button"
                  onClick={() => selectPreset(preset.key)}
                  className="text-[11px] text-white/25 hover:text-white/50 px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-white/[0.12] transition-all"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Time + Timezone row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-white/50">Time</Label>
              <Input
                type="time"
                value={formData.time_of_day}
                onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
                required
                className="h-10 bg-white/[0.04] border-white/[0.08] text-white text-sm focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 rounded-xl transition-all [color-scheme:dark]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-medium text-white/50">Timezone</Label>
              <Select
                value={formData.timezone}
                onValueChange={(value) => setFormData({ ...formData, timezone: value })}
              >
                <SelectTrigger className="h-10 bg-white/[0.04] border-white/[0.08] text-white text-sm rounded-xl focus:border-[oklch(0.55_0.25_280)] focus:ring-[oklch(0.55_0.25_280)]/20 [&>svg]:text-white/30">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[oklch(0.15_0.008_270)] border-white/[0.08] text-white">
                  {TIMEZONES.map((tz) => (
                    <SelectItem
                      key={tz}
                      value={tz}
                      className="text-sm text-white/70 focus:bg-white/[0.06] focus:text-white"
                    >
                      {tz.replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400 text-xs">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              type="button"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11 bg-white/[0.04] hover:bg-white/[0.08] text-white/60 font-medium rounded-xl border border-white/[0.06] transition-all"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="flex-1 h-11 bg-[oklch(0.55_0.25_280)] hover:bg-[oklch(0.60_0.25_280)] text-white font-medium rounded-xl border-0 transition-all"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
