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

    const { scheduleId } = await request.json()
    if (!scheduleId) {
      return NextResponse.json({ error: "Schedule ID is required" }, { status: 400 })
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

    // Get user profile for phone number, timezone and preferred voice
    const { data: profile } = await supabase
      .from("profiles")
      .select("phone_number, timezone, preferred_voice")
      .eq("id", user.id)
      .single()

    if (!profile?.phone_number) {
      return NextResponse.json({ error: "No phone number found in user profile. Please add your mobile number in settings." }, { status: 400 })
    }

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

    // Generate conversation script for Bland.ai
    const conversationScript = generateConversationScript(schedule.name, schedule.topic)

    // Call Bland.ai API to initiate the phone call
    const blandApiKey = process.env.BLAND_API_KEY
    if (!blandApiKey) {
      return NextResponse.json({ error: "Bland.ai API key not configured" }, { status: 500 })
    }

    // Build payload and allow optional BLAND_MODEL and BLAND_VOICE env vars to override
    const payload: any = {
      phone_number: profile.phone_number,
      task: conversationScript,
      language: "en",
      temperature: 0.7,
      max_duration: 180,
      webhook_url: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/api/bland/webhook`,
    }

    // If a BLAND_VOICE env var is provided, prefer that. Otherwise omit voice so Bland.ai picks default.
    const configuredVoice = process.env.BLAND_VOICE
    if (configuredVoice && configuredVoice.trim().length > 0) {
      payload.voice = configuredVoice.trim()
    }

    const configuredModel = process.env.BLAND_MODEL
    if (configuredModel && configuredModel.trim().length > 0) {
      payload.model = configuredModel.trim()
    }

    const blandResponse = await fetch("https://api.bland.ai/v1/calls", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${blandApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })

    const blandData = await blandResponse.json().catch(() => null)

    if (!blandResponse.ok) {
      console.error("Bland.ai error:", blandData)

      // Mark call_log as failed with error details
      await supabase
        .from("call_logs")
        .update({ call_status: "failed", error_message: JSON.stringify(blandData || { status: blandResponse.status }) })
        .eq("id", callLog.id)

      // Determine status code and message to return
      const message = blandData?.message || (blandData?.errors && blandData.errors.join(", ")) || "Failed to initiate call with Bland.ai"
      const isRateLimit = /rate limit|rate-limited|rate limit exceeded|limit exceeded/i.test(message)

      return NextResponse.json(
        { error: "Failed to initiate call with Bland.ai", details: blandData, message },
        { status: isRateLimit ? 429 : 500 }
      )
    }

    // Update call log with Bland.ai call ID (store in provider_call_id for robust matching)
    await supabase
      .from('call_logs')
      .update({
        call_status: 'initiated',
        started_at: new Date().toISOString(),
        provider_call_id: blandData?.call_id || null,
      })
      .eq('id', callLog.id)

    return NextResponse.json({
      success: true,
      callId: callLog.id,
      blandCallId: blandData.call_id,
      message: "Call initiated with Bland.ai",
      phoneNumber: profile.phone_number,
    })
  } catch (error) {
    console.error("Call initiation error:", error)
    return NextResponse.json({ error: "Failed to initiate call", details: String(error) }, { status: 500 })
  }
}

function generateConversationScript(scheduleName: string, topic?: string): string {
  const purpose = topic && topic.trim() ? topic.trim() : scheduleName

  return `You are CallMeAI, a brief accountability check-in agent. The user scheduled this call for: "${purpose}".

Keep the call short and crisp — under 2 minutes. Exactly this flow:
1. Greet briefly: one short sentence introducing yourself as CallMeAI and why you're calling.
2. Ask ONE direct question about their progress on "${purpose}". Listen. One short acknowledgment — do not lecture or give long advice.
3. Ask ONE closing question: "Anything else you'd like to share or discuss?" Listen briefly.
4. Thank them in one sentence and end the call.

Rules: no rambling, no repeated questions, no motivational speeches. Short sentences. If the user is busy or quiet, wrap up immediately and end the call politely.`
}
