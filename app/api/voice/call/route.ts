import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { scheduleId, phoneNumber } = await request.json()

    if (!scheduleId || !phoneNumber) {
      return NextResponse.json({ error: "Schedule ID and phone number are required" }, { status: 400 })
    }

    // Get the call schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from("call_schedules")
      .select("*")
      .eq("id", scheduleId)
      .eq("user_id", user.id)
      .single()

    if (scheduleError || !schedule) {
      return NextResponse.json({ error: "Schedule not found" }, { status: 404 })
    }

    // Get user's tasks for the call
    const { data: tasks } = await supabase.from("tasks").select("*").eq("user_id", user.id).eq("is_active", true)

    // Get user profile for voice preference
    const { data: profile } = await supabase.from("profiles").select("preferred_voice").eq("id", user.id).single()

    // Create call log entry
    const { data: callLog, error: callLogError } = await supabase
      .from("call_logs")
      .insert({
        user_id: user.id,
        schedule_id: scheduleId,
        call_status: "scheduled",
        scheduled_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (callLogError) {
      return NextResponse.json({ error: "Failed to create call log" }, { status: 500 })
    }

    // In a real implementation, you would integrate with a voice calling service
    // like Twilio, Vapi, or similar to make the actual phone call
    // For now, we'll simulate the call initiation

    const callScript = generateCallScript(tasks || [], profile?.preferred_voice || "alloy")

    // Simulate call initiation
    setTimeout(async () => {
      // Update call status to completed (in real implementation, this would be done by webhook)
      await supabase
        .from("call_logs")
        .update({
          call_status: "completed",
          started_at: new Date().toISOString(),
          ended_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes later
          call_duration: 300, // 5 minutes in seconds
          call_transcript: "Simulated call completed successfully",
        })
        .eq("id", callLog.id)
    }, 1000)

    return NextResponse.json({
      success: true,
      callId: callLog.id,
      message: "Call initiated successfully",
      script: callScript,
    })
  } catch (error) {
    console.error("Call initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate call" }, { status: 500 })
  }
}

function generateCallScript(tasks: any[], voice: string) {
  const greeting = `Hello! This is CallMeAI. I hope you're having a great day! I'm calling to check in on your daily goals and see how you're progressing.`

  const taskQuestions = tasks
    .map((task, index) => {
      if (task.target_value && task.unit) {
        return `Question ${index + 1}: For your goal "${task.title}", how many ${task.unit} have you completed today? Your target is ${task.target_value} ${task.unit}.`
      } else {
        return `Question ${index + 1}: How are you doing with "${task.title}" today? Have you made progress on this goal?`
      }
    })
    .join("\n\n")

  const closing = `Thank you for sharing your progress with me! Remember, consistency is key to building lasting habits. Keep up the great work, and I'll check in with you again soon. Have a wonderful rest of your day!`

  return `${greeting}\n\n${taskQuestions}\n\n${closing}`
}
