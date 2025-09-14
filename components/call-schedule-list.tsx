"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
        <Phone className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No call schedules yet</h3>
        <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first AI call schedule to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {schedules.map((schedule) => (
        <Card key={schedule.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <div className="flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-medium text-gray-900 dark:text-white">{schedule.name}</h3>
                  </div>
                  <Badge variant={schedule.is_active ? "default" : "secondary"}>
                    {schedule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="ml-7 space-y-2">
                  <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-4 h-4" />
                      <span>{formatTime(schedule.time_of_day)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{getDaysDisplay(schedule.days_of_week)}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500">Timezone: {schedule.timezone}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Switch
                  checked={schedule.is_active}
                  onCheckedChange={() => toggleSchedule(schedule.id, schedule.is_active)}
                />

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setEditingSchedule(schedule)}>
                      <Edit className="w-4 h-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteSchedule(schedule.id)}
                      className="text-red-600 dark:text-red-400"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
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
