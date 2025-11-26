"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { MoreHorizontal, Edit, Trash2, CheckCircle2, Circle, Target, Clock, TrendingUp } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { EditTaskDialog } from "@/components/edit-task-dialog"
import { LogTaskDialog } from "@/components/log-task-dialog"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Task {
  id: string
  title: string
  description: string | null
  category: string
  target_frequency: string
  target_value: number | null
  unit: string | null
  is_active: boolean
  created_at: string
}

interface TaskResponse {
  task_id: string
  response_value: number | null
}

interface TaskListProps {
  tasks: Task[]
  todayResponses: TaskResponse[]
}

export function TaskList({ tasks, todayResponses }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [loggingTask, setLoggingTask] = useState<Task | null>(null)
  const [hoveredTaskId, setHoveredTaskId] = useState<string | null>(null)
  const router = useRouter()

  const deleteTask = async (taskId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("tasks").update({ is_active: false }).eq("id", taskId)

    if (!error) {
      router.refresh()
    }
  }

  const toggleTaskActive = async (taskId: string, currentState: boolean) => {
    const supabase = createClient()
    const action = currentState ? false : true

    const confirmMsg = currentState
      ? "Are you sure you want to disable this task? You can re-enable it later."
      : "Are you sure you want to enable this task?"

    if (!window.confirm(confirmMsg)) return

    const { error } = await supabase.from("tasks").update({ is_active: action }).eq("id", taskId)

    if (!error) router.refresh()
  }

  const getTaskProgress = (task: Task) => {
    const response = todayResponses.find((r) => r.task_id === task.id)
    if (!response || !task.target_value) return 0
    return Math.min(((response.response_value || 0) / task.target_value) * 100, 100)
  }

  const isTaskCompleted = (task: Task) => {
    const response = todayResponses.find((r) => r.task_id === task.id)
    if (!response || !task.target_value) return false
    return (response.response_value || 0) >= task.target_value
  }

  const getCategoryColor = (category: string) => {
    const colors = {
      health: "bg-green-500/20 text-green-400 border-green-500/30",
      fitness: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      productivity: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      learning: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      general: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500/20 to-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <Target className="w-8 h-8 text-purple-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">No tasks yet</h3>
        <p className="text-gray-400 text-sm">Create your first CallMeAI task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => {
        const progress = getTaskProgress(task)
        const completed = isTaskCompleted(task)

        return (
          <div
            key={task.id}
            className={`group rounded-xl border border-white/10 bg-gradient-to-r from-white/5 to-white/[0.02] backdrop-blur-sm hover:border-white/20 transition-all duration-300 overflow-hidden hover:shadow-lg hover:shadow-purple-500/10 ${
              !task.is_active ? "opacity-50" : ""
            }`}
            style={{
              animation: `fadeIn 0.5s ease-out ${index * 0.05}s both`,
            }}
            onMouseEnter={() => setHoveredTaskId(task.id)}
            onMouseLeave={() => setHoveredTaskId(null)}
          >
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  {/* Task Header */}
                  <div className="flex items-center space-x-3 mb-2">
                    <div className="relative">
                      {completed ? (
                        <div className="relative">
                          <CheckCircle2 className="w-5 h-5 text-green-400 animate-pulse" />
                          <div className="absolute inset-0 bg-green-400/20 rounded-full blur-md" />
                        </div>
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 group-hover:text-purple-400 transition-colors" />
                      )}
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-purple-400 group-hover:to-cyan-400 group-hover:bg-clip-text transition-all duration-300">
                      {task.title}
                    </h3>
                    <Badge className={`${getCategoryColor(task.category)} border text-xs font-medium`}>
                      {task.category}
                    </Badge>
                  </div>

                  {/* Description */}
                  {task.description && (
                    <p className="text-sm text-gray-400 mb-3 ml-8 group-hover:text-gray-300 transition-colors">{task.description}</p>
                  )}

                  {/* Task Details */}
                  <div className="ml-8 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-500 group-hover:text-gray-400 transition-colors">
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{task.target_frequency}</span>
                      </div>
                      {task.target_value && (
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="w-4 h-4" />
                          <span>
                            Target: {task.target_value} {task.unit}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Progress Bar */}
                    {task.target_value && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Today's Progress</span>
                          <span className="text-white font-semibold">{Math.round(progress)}%</span>
                        </div>
                        <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              progress >= 100
                                ? "bg-gradient-to-r from-green-400 to-emerald-400"
                                : "bg-gradient-to-r from-purple-400 to-cyan-400"
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                  <LogTaskDialog task={task} onSuccess={() => router.refresh()}>
                    <Button 
                      size="sm" 
                      className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white border-0 font-semibold transform hover:scale-110 transition-all"
                    >
                      Log
                    </Button>
                  </LogTaskDialog>

                  {/* Enable/Disable quick toggle */}
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleTaskActive(task.id, task.is_active)}
                    className="text-gray-300 hover:text-white hover:bg-white/5 transition-all"
                  >
                    {task.is_active ? (
                      <Trash2 className="w-4 h-4" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                    )}
                  </Button>

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
                        onClick={() => setEditingTask(task)}
                        className="cursor-pointer hover:bg-white/10 text-gray-300 hover:text-white transition-colors"
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => toggleTaskActive(task.id, task.is_active)}
                        className="cursor-pointer hover:bg-red-500/10 text-red-400 hover:text-red-300 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        {task.is_active ? "Disable" : "Enable"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {editingTask && (
        <EditTaskDialog
          task={editingTask}
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          onSuccess={() => {
            setEditingTask(null)
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
