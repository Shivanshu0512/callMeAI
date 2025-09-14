"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, FileText, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

interface GenerateReportDialogProps {
  children: React.ReactNode
  currentWeekStart: string
  currentWeekEnd: string
}

export function GenerateReportDialog({ children, currentWeekStart, currentWeekEnd }: GenerateReportDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [weekStart, setWeekStart] = useState(currentWeekStart)
  const [weekEnd, setWeekEnd] = useState(currentWeekEnd)
  const router = useRouter()

  const handleGenerate = async () => {
    setIsLoading(true)

    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weekStart,
          weekEnd,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setOpen(false)
        router.refresh()
      } else {
        alert("Failed to generate report: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      console.error("Error generating report:", error)
      alert("Failed to generate report")
    } finally {
      setIsLoading(false)
    }
  }

  const setCurrentWeek = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay()) // Start of week (Sunday)
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)

    setWeekStart(startOfWeek.toISOString().split("T")[0])
    setWeekEnd(endOfWeek.toISOString().split("T")[0])
  }

  const setPreviousWeek = () => {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay() - 7) // Start of previous week
    const endOfWeek = new Date(startOfWeek)
    endOfWeek.setDate(startOfWeek.getDate() + 6) // End of previous week

    setWeekStart(startOfWeek.toISOString().split("T")[0])
    setWeekEnd(endOfWeek.toISOString().split("T")[0])
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FileText className="w-5 h-5" />
            <span>Generate Weekly Report</span>
          </DialogTitle>
          <DialogDescription>
            Create a comprehensive report analyzing your CallMeAI progress for a specific week.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="weekStart">Week Start</Label>
              <Input id="weekStart" type="date" value={weekStart} onChange={(e) => setWeekStart(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="weekEnd">Week End</Label>
              <Input id="weekEnd" type="date" value={weekEnd} onChange={(e) => setWeekEnd(e.target.value)} />
            </div>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={setCurrentWeek} className="flex-1 bg-transparent">
              <Calendar className="w-4 h-4 mr-1" />
              This Week
            </Button>
            <Button variant="outline" size="sm" onClick={setPreviousWeek} className="flex-1 bg-transparent">
              <Calendar className="w-4 h-4 mr-1" />
              Last Week
            </Button>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">What's included:</h4>
            <ul className="text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <li>• Overall completion rates and performance metrics</li>
              <li>• Daily breakdown of task completion</li>
              <li>• Category-wise performance analysis</li>
              <li>• AI call engagement statistics</li>
              <li>• Personalized insights and recommendations</li>
            </ul>
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerate} disabled={isLoading || !weekStart || !weekEnd}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
