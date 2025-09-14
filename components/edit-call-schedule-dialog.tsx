"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"

interface CallSchedule {
  id: string
  name: string
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

const DAYS_OF_WEEK = [
  { id: 0, label: "Sunday", short: "Sun" },
  { id: 1, label: "Monday", short: "Mon" },
  { id: 2, label: "Tuesday", short: "Tue" },
  { id: 3, label: "Wednesday", short: "Wed" },
  { id: 4, label: "Thursday", short: "Thu" },
  { id: 5, label: "Friday", short: "Fri" },
  { id: 6, label: "Saturday", short: "Sat" },
]

const TIMEZONES = [
  "UTC",
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
  const [formData, setFormData] = useState({
    name: "",
    time_of_day: "",
    timezone: "",
    days_of_week: [] as number[],
  })

  useEffect(() => {
    if (schedule) {
      setFormData({
        name: schedule.name,
        time_of_day: schedule.time_of_day,
        timezone: schedule.timezone,
        days_of_week: schedule.days_of_week,
      })
    }
  }, [schedule])

  const handleDayToggle = (dayId: number, checked: boolean) => {
    if (checked) {
      setFormData({
        ...formData,
        days_of_week: [...formData.days_of_week, dayId].sort(),
      })
    } else {
      setFormData({
        ...formData,
        days_of_week: formData.days_of_week.filter((id) => id !== dayId),
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    const { error } = await supabase
      .from("call_schedules")
      .update({
        name: formData.name,
        days_of_week: formData.days_of_week,
        time_of_day: formData.time_of_day,
        timezone: formData.timezone,
        updated_at: new Date().toISOString(),
      })
      .eq("id", schedule.id)

    if (!error) {
      onSuccess()
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Call Schedule</DialogTitle>
          <DialogDescription>Update your AI call schedule settings.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="name">Schedule Name</Label>
            <Input
              id="name"
              placeholder="e.g., Morning Check-in, Evening Review"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Call Time</Label>
            <Input
              id="time"
              type="time"
              value={formData.time_of_day}
              onChange={(e) => setFormData({ ...formData, time_of_day: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Timezone</Label>
            <Select value={formData.timezone} onValueChange={(value) => setFormData({ ...formData, timezone: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz} value={tz}>
                    {tz}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label>Days of the Week</Label>
            <div className="grid grid-cols-2 gap-3">
              {DAYS_OF_WEEK.map((day) => (
                <div key={day.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`day-${day.id}`}
                    checked={formData.days_of_week.includes(day.id)}
                    onCheckedChange={(checked) => handleDayToggle(day.id, checked as boolean)}
                  />
                  <Label htmlFor={`day-${day.id}`} className="text-sm font-normal">
                    {day.label}
                  </Label>
                </div>
              ))}
            </div>
            {formData.days_of_week.length === 0 && (
              <p className="text-sm text-red-600 dark:text-red-400">Please select at least one day</p>
            )}
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || formData.days_of_week.length === 0}>
              {isLoading ? "Updating..." : "Update Schedule"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
