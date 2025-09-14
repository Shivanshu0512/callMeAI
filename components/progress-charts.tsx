"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"

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
  tasks?: {
    title: string
    target_value: number | null
    unit: string | null
  }
}

interface CallLog {
  call_status: string
  scheduled_at: string
  call_duration: number | null
}

interface ProgressChartsProps {
  tasks: Task[]
  responses: TaskResponse[]
  callLogs: CallLog[]
}

export function ProgressCharts({ tasks, responses, callLogs }: ProgressChartsProps) {
  // Prepare daily completion data for the last 14 days
  const getDailyCompletionData = () => {
    const data = []
    const today = new Date()

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayResponses = responses.filter((r) => r.response_date === dateStr)
      const completionRate = tasks.length > 0 ? Math.round((dayResponses.length / tasks.length) * 100) : 0

      data.push({
        date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        completion: completionRate,
        responses: dayResponses.length,
      })
    }

    return data
  }

  // Prepare task performance data
  const getTaskPerformanceData = () => {
    return tasks.map((task) => {
      const taskResponses = responses.filter((r) => r.task_id === task.id)
      const completionRate =
        taskResponses.length > 0
          ? Math.round((taskResponses.length / Math.min(14, responses.length > 0 ? 14 : 1)) * 100)
          : 0

      return {
        name: task.title.length > 15 ? task.title.substring(0, 15) + "..." : task.title,
        completion: completionRate,
        responses: taskResponses.length,
      }
    })
  }

  // Prepare category distribution data
  const getCategoryData = () => {
    const categoryCount = tasks.reduce(
      (acc, task) => {
        acc[task.category] = (acc[task.category] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )

    const colors = {
      health: "#10b981",
      fitness: "#3b82f6",
      productivity: "#8b5cf6",
      learning: "#f59e0b",
      general: "#6b7280",
    }

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: category.charAt(0).toUpperCase() + category.slice(1),
      value: count,
      color: colors[category as keyof typeof colors] || colors.general,
    }))
  }

  // Prepare call engagement data
  const getCallEngagementData = () => {
    const data = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]

      const dayCalls = callLogs.filter((c) => c.scheduled_at.startsWith(dateStr))
      const completedCalls = dayCalls.filter((c) => c.call_status === "completed").length

      data.push({
        date: date.toLocaleDateString("en-US", { weekday: "short" }),
        calls: dayCalls.length,
        completed: completedCalls,
      })
    }

    return data
  }

  const dailyData = getDailyCompletionData()
  const taskData = getTaskPerformanceData()
  const categoryData = getCategoryData()
  const callData = getCallEngagementData()

  return (
    <div className="space-y-6">
      {/* Daily Completion Trend */}
      <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-lg text-gray-900 dark:text-white">Daily Completion Trend</CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-300">
            Your task completion rate over the last 14 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis dataKey="date" className="text-xs text-gray-600 dark:text-gray-400" />
              <YAxis className="text-xs text-gray-600 dark:text-gray-400" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "none",
                  borderRadius: "8px",
                  boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                }}
              />
              <Line
                type="monotone"
                dataKey="completion"
                stroke="#3b82f6"
                strokeWidth={3}
                dot={{ fill: "#3b82f6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3b82f6", strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Performance */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Task Performance</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Completion rates by task</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={taskData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis type="number" domain={[0, 100]} className="text-xs text-gray-600 dark:text-gray-400" />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={100}
                  className="text-xs text-gray-600 dark:text-gray-400"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="completion" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Distribution */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">Task Categories</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">Distribution of your goals</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {categoryData.map((entry, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {entry.name} ({entry.value})
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call Engagement */}
      {callLogs.length > 0 && (
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg text-gray-900 dark:text-white">AI Call Engagement</CardTitle>
            <CardDescription className="text-gray-600 dark:text-gray-300">
              Scheduled vs completed calls this week
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={callData}>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="date" className="text-xs text-gray-600 dark:text-gray-400" />
                <YAxis className="text-xs text-gray-600 dark:text-gray-400" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                  }}
                />
                <Bar dataKey="calls" fill="#8b5cf6" name="Scheduled" radius={[2, 2, 0, 0]} />
                <Bar dataKey="completed" fill="#10b981" name="Completed" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
