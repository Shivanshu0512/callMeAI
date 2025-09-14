"use client"

import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface Task {
  id: string
  title: string
  target_value: number | null
  unit: string | null
  category: string
}

interface TaskResponse {
  task_id: string
  response_value: number | null
  response_date: string
}

interface TaskProgressListProps {
  tasks: Task[]
  responses: TaskResponse[]
}

export function TaskProgressList({ tasks, responses }: TaskProgressListProps) {
  const getTaskProgress = (task: Task) => {
    // Get responses for the last 7 days
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoStr = sevenDaysAgo.toISOString().split("T")[0]

    const recentResponses = responses.filter((r) => r.task_id === task.id && r.response_date >= sevenDaysAgoStr)

    // Calculate completion rate (days with responses out of 7)
    const completionRate = Math.round((recentResponses.length / 7) * 100)

    // Calculate average performance if task has target values
    let performanceRate = 0
    if (task.target_value && recentResponses.length > 0) {
      const avgValue = recentResponses.reduce((sum, r) => sum + (r.response_value || 0), 0) / recentResponses.length
      performanceRate = Math.min(Math.round((avgValue / task.target_value) * 100), 100)
    }

    // Calculate trend (compare to previous week)
    const fourteenDaysAgo = new Date(sevenDaysAgo)
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 7)
    const fourteenDaysAgoStr = fourteenDaysAgo.toISOString().split("T")[0]

    const previousWeekResponses = responses.filter(
      (r) => r.task_id === task.id && r.response_date >= fourteenDaysAgoStr && r.response_date < sevenDaysAgoStr,
    )

    const previousCompletionRate = Math.round((previousWeekResponses.length / 7) * 100)
    const trend = completionRate - previousCompletionRate

    return {
      completionRate,
      performanceRate,
      trend,
      responseCount: recentResponses.length,
    }
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

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="w-3 h-3 text-green-600 dark:text-green-400" />
    if (trend < 0) return <TrendingDown className="w-3 h-3 text-red-600 dark:text-red-400" />
    return <Minus className="w-3 h-3 text-gray-400" />
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm text-gray-600 dark:text-gray-400">No tasks to analyze yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const progress = getTaskProgress(task)

        return (
          <div key={task.id} className="space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 dark:text-white truncate">{task.title}</h4>
                <div className="flex items-center space-x-2 mt-1">
                  <Badge className={getCategoryColor(task.category)} variant="secondary">
                    {task.category}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">{progress.responseCount}/7 days</span>
                </div>
              </div>
              <div className="flex items-center space-x-1 ml-2">
                {getTrendIcon(progress.trend)}
                <span className="text-xs text-gray-600 dark:text-gray-400">
                  {progress.trend > 0 ? "+" : ""}
                  {progress.trend}%
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600 dark:text-gray-400">Consistency</span>
                <span className="text-gray-900 dark:text-white font-medium">{progress.completionRate}%</span>
              </div>
              <Progress value={progress.completionRate} className="h-2" />

              {task.target_value && progress.performanceRate > 0 && (
                <>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600 dark:text-gray-400">Performance</span>
                    <span className="text-gray-900 dark:text-white font-medium">{progress.performanceRate}%</span>
                  </div>
                  <Progress value={progress.performanceRate} className="h-2" />
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
