"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { MoreHorizontal, Edit, Trash2, Clock, Calendar, Phone } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditCallScheduleDialog } from "@/components/edit-call-schedule-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface CallSchedule {
  id: string
  name: string
  days_of_week: number[]
  time_of_day: string
  timezone: string
  is_active: boolean
  created_at: string
}

interface CallScheduleListProps {
  schedules: CallSchedule[]
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function CallScheduleList({ schedules }: CallScheduleListProps) {
  const [editingSchedule, setEditingSchedule] = useState<CallSchedule | null>(null)
  const [hoveredScheduleId, setHoveredScheduleId] = useState<string | null>(null)
  const router = useRouter()

  const toggleSchedule = async (scheduleId: string, isActive: boolean) => {
    const supabase = createClient()
    const { error } = await supabase.from("call_schedules").update({ is_active: !isActive }).eq("id", scheduleId)

    if (!error) {
      router.refresh()
    }
  }

  const deleteSchedule = async (scheduleId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("call_schedules").update({ is_active: false }).eq("id", scheduleId)

    if (!error) {
      router.refresh()
    }
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
    return days
      .sort()
      .map((d) => DAYS_OF_WEEK[d])
      .join(", ")
  }

  if (schedules.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Phone className="w-8 h-8 text-pink-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No schedules yet</h3>
        <p className="text-gray-400 text-sm">Create your first AI call schedule to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {schedules.map((schedule, index) => (
        <div
          key={schedule.id}
          className="group rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/10"
          style={{
            animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
          }}
          onMouseEnter={() => setHoveredScheduleId(schedule.id)}
          onMouseLeave={() => setHoveredScheduleId(null)}
        >
          <div className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Schedule Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <div className={`p-2 rounded-lg transition-all ${
                    schedule.is_active
                      ? "bg-pink-500/20"
                      : "bg-gray-500/20"
                  }`}>
                    <Phone className="w-5 h-5 text-pink-400" />
                  </div>
                  <h3 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                    {schedule.name}
                  </h3>
                  <Badge className={`text-xs font-medium ${
                    schedule.is_active
                      ? "bg-green-500/20 text-green-400 border-green-500/30"
                      : "bg-gray-500/20 text-gray-400 border-gray-500/30"
                  } border`}>
                    {schedule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                {/* Schedule Details */}
                <div className="ml-11 space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(schedule.time_of_day)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getDaysDisplay(schedule.days_of_week)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">Timezone: {schedule.timezone}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                  className="transition-all"
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-gray-900/95 border-white/10">
                    <DropdownMenuItem 
                      onClick={() => setEditingSchedule(schedule)}
                      className="cursor-pointer hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteSchedule(schedule.id)}
                      className="cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
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

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}
