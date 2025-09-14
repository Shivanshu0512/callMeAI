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
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface Task {
  id: string
  title: string
  target_value: number | null
  unit: string | null
}

interface LogTaskDialogProps {
  task: Task
  children: React.ReactNode
  onSuccess: () => void
}

export function LogTaskDialog({ task, children, onSuccess }: LogTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [responseValue, setResponseValue] = useState("")
  const [responseText, setResponseText] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) return

    const today = new Date().toISOString().split("T")[0]

    // Check if there's already a response for today
    const { data: existingResponse } = await supabase
      .from("task_responses")
      .select("id")
      .eq("user_id", user.id)
      .eq("task_id", task.id)
      .eq("response_date", today)
      .single()

    if (existingResponse) {
      // Update existing response
      const { error } = await supabase
        .from("task_responses")
        .update({
          response_value: responseValue ? Number.parseFloat(responseValue) : null,
          response_text: responseText || null,
        })
        .eq("id", existingResponse.id)

      if (!error) {
        setOpen(false)
        setResponseValue("")
        setResponseText("")
        onSuccess()
      }
    } else {
      // Create new response
      const { error } = await supabase.from("task_responses").insert({
        user_id: user.id,
        task_id: task.id,
        response_value: responseValue ? Number.parseFloat(responseValue) : null,
        response_text: responseText || null,
        response_date: today,
      })

      if (!error) {
        setOpen(false)
        setResponseValue("")
        setResponseText("")
        onSuccess()
      }
    }

    setIsLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Progress</DialogTitle>
          <DialogDescription>Record your progress for "{task.title}"</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {task.target_value && (
            <div className="space-y-2">
              <Label htmlFor="response_value">Value {task.unit && `(${task.unit})`}</Label>
              <Input
                id="response_value"
                type="number"
                step="0.1"
                placeholder={`Target: ${task.target_value} ${task.unit || ""}`}
                value={responseValue}
                onChange={(e) => setResponseValue(e.target.value)}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="response_text">Notes (Optional)</Label>
            <Textarea
              id="response_text"
              placeholder="How did it go? Any challenges or wins?"
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Progress"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
