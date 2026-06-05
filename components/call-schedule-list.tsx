"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Edit, Trash2, Clock, Calendar, Phone, MessageSquare } from "lucide-react"
import { EditCallScheduleDialog } from "@/components/edit-call-schedule-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CallSchedule {
  id: string
  name: string
  topic?: string
  days_of_week: number[]
  time_of_day: string
  timezone: string
  is_active: boolean
  created_at: string
}

interface CallScheduleListProps {
  schedules: CallSchedule[]
}

const DAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const DAYS_LETTER = ["S", "M", "T", "W", "T", "F", "S"]

export function CallScheduleList({ schedules }: CallScheduleListProps) {
  const [editingSchedule, setEditingSchedule] = useState<CallSchedule | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const router = useRouter()

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("call_schedules").update({ is_active: !isActive }).eq("id", scheduleId)
    if (!error) router.refresh()
  }

  const deleteSchedule = async (scheduleId: string) => {
    setDeletingId(scheduleId)
    const supabase = createClient()
    const { error } = await supabase.from("call_schedules").delete().eq("id", scheduleId)
    if (!error) router.refresh()
    setDeletingId(null)
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(":")
    const hour = Number.parseInt(hours)
    const ampm = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const getDaysDisplay = (days: number[]) => {
    if (days.length === 7) return "Every day"
    if (days.length === 5 && days.every((d) => d >= 1 && d <= 5)) return "Weekdays"
    if (days.length === 2 && days.includes(0) && days.includes(6)) return "Weekends"
    return days.sort().map((d) => DAYS_SHORT[d]).join(", ")
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-14 h-14 rounded-full bg-[oklch(0.55_0.25_280)]/10 border border-[oklch(0.55_0.25_280)]/15 flex items-center justify-center mx-auto mb-4">
          <Phone className="w-6 h-6 text-[oklch(0.75_0.18_280)]" />
        </div>
        <p className="text-white/50 font-medium mb-1">No schedules yet</p>
        <p className="text-white/25 text-sm">Create your first call schedule to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule) => (
        <div
          key={schedule.id}
          className="rounded-xl border border-white/[0.06] bg-white/[0.02] hover:border-white/[0.1] transition-all p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Name + status */}
              <div className="flex items-center gap-2.5 mb-1">
                <h3 className="text-sm font-medium text-white truncate">{schedule.name}</h3>
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${schedule.is_active ? "bg-green-400" : "bg-white/20"}`} />
              </div>

              {/* Topic */}
              {schedule.topic && (
                <div className="flex items-start gap-1.5 mb-2.5">
                  <MessageSquare className="w-3 h-3 text-white/20 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-white/35 leading-relaxed line-clamp-2">{schedule.topic}</p>
                </div>
              )}

              {/* Time + Days */}
              <div className="flex items-center gap-3 text-xs text-white/30">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{formatTime(schedule.time_of_day)}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{getDaysDisplay(schedule.days_of_week)}</span>
                </div>
              </div>

              {/* Day dots */}
              <div className="flex gap-1 mt-2.5">
                {DAYS_LETTER.map((letter, i) => {
                  const active = schedule.days_of_week.includes(i)
                  return (
                    <div
                      key={i}
                      className={`w-6 h-6 rounded-full text-[10px] font-medium flex items-center justify-center ${
                        active
                          ? "bg-[oklch(0.55_0.25_280)]/20 text-[oklch(0.75_0.18_280)]"
                          : "bg-white/[0.03] text-white/15"
                      }`}
                    >
                      {letter}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Switch
                checked={schedule.is_active}
                onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                className="scale-90 data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500/60"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setEditingSchedule(schedule)}
                className="text-white/20 hover:text-white hover:bg-white/[0.06] h-8 w-8 p-0 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteSchedule(schedule.id)}
                disabled={deletingId === schedule.id}
                className="text-white/20 hover:text-red-400 hover:bg-red-500/[0.06] h-8 w-8 p-0 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ))}

      {editingSchedule && (
        <EditCallScheduleDialog
          schedule={editingSchedule}
          open={!!editingSchedule}
          onOpenChange={(open) => !open && setEditingSchedule(null)}
          onSuccess={() => {
            setEditingSchedule(null)
            router.refresh()
          }}
        />
      )}
    </div>
  )
}
