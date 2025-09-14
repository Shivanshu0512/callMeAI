"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
  const router = useRouter()

  const deleteTask = async (taskId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("tasks").update({ is_active: false }).eq("id", taskId)

    if (!error) {
      router.refresh()
    }
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
      health: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
      fitness: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400",
      productivity: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400",
      learning: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400",
      general: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    }
    return colors[category as keyof typeof colors] || colors.general
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <Target className="w-12 h-12 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks yet</h3>
  <p className="text-gray-600 dark:text-gray-400 mb-4">Create your first CallMeAI task to get started</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const progress = getTaskProgress(task)
        const completed = isTaskCompleted(task)

        return (
          <Card key={task.id} className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    {completed ? (
                      <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 dark:text-gray-600" />
                    )}
                    <h3 className="font-medium text-gray-900 dark:text-white">{task.title}</h3>
                    <Badge className={getCategoryColor(task.category)}>{task.category}</Badge>
                  </div>

                  {task.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 ml-8">{task.description}</p>
                  )}

                  <div className="ml-8 space-y-2">
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
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

                    {task.target_value && (
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">Today's Progress</span>
                          <span className="text-gray-900 dark:text-white font-medium">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <LogTaskDialog task={task} onSuccess={() => router.refresh()}>
                    <Button size="sm" variant="outline">
                      Log Progress
                    </Button>
                  </LogTaskDialog>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setEditingTask(task)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => deleteTask(task.id)} className="text-red-600 dark:text-red-400">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
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
    </div>
  )
}
