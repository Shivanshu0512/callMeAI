import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

/**
 * Webhook endpoint for Bland.ai to report call completion status and transcript.
 * Bland.ai will POST to this endpoint with call details after the call ends.
 */
export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    const { call_id, status, transcript, duration, recording_url } = payload

    if (!call_id) {
      return NextResponse.json({ error: "Missing call_id" }, { status: 400 })
    }

    const supabase = await createClient()

    // Find the call log by Bland.ai call ID and update it with the result
    const { data: callLogs } = await supabase
      .from("call_logs")
      .select("id, user_id")
      .eq("call_status", "initiated")
      .limit(1)

    if (callLogs && callLogs.length > 0) {
      const callLog = callLogs[0]

      // Update the call log with call completion details
      const { error: updateError } = await supabase
        .from("call_logs")
        .update({
          call_status: status === "completed" ? "completed" : "failed",
          ended_at: new Date().toISOString(),
          call_duration: duration || 0,
          call_transcript: transcript || "",
          recording_url: recording_url || null,
        })
        .eq("id", callLog.id)

      if (updateError) {
        console.error("Error updating call log:", updateError)
        return NextResponse.json({ error: "Failed to update call log" }, { status: 500 })
      }

      // Parse transcript and save task responses if available
      if (transcript && callLog.user_id) {
        await parseAndSaveResponses(supabase, callLog.user_id, transcript)
      }
    }

    return NextResponse.json({ success: true, message: "Webhook received and processed" })
  } catch (error) {
    console.error("Webhook processing error:", error)
    return NextResponse.json({ error: "Webhook processing failed", details: String(error) }, { status: 500 })
  }
}

async function parseAndSaveResponses(supabase: any, userId: string, transcript: string) {
  try {
    // Get user's tasks
    const { data: tasks } = await supabase.from("tasks").select("id, title").eq("user_id", userId).eq("is_active", true)

    if (!tasks || tasks.length === 0) return

    // Simple parsing: look for task titles in transcript and mark as completed
    // This is a basic implementation; you can enhance it with NLP/AI for better accuracy
    const today = new Date().toISOString().split("T")[0]

    for (const task of tasks) {
      if (transcript.toLowerCase().includes(task.title.toLowerCase())) {
        // Task was mentioned in the call, assume they provided a response
        await supabase.from("task_responses").insert({
          user_id: userId,
          task_id: task.id,
          response_text: `Responded to during call`,
          response_date: today,
        })
      }
    }
  } catch (error) {
    console.error("Error parsing responses:", error)
  }
}
