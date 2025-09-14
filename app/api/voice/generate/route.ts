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

    const { text, voice = "alloy" } = await request.json()

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        audioUrl: null,
        message: `Voice preview for ${voice}: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
        voiceType: voice,
        isSimulated: true,
      })
    }

    // Try to generate real audio with OpenAI TTS API
    const response = await fetch("https://api.openai.com/v1/audio/speech", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "tts-1",
        input: text,
        voice: voice,
        response_format: "mp3",
      }),
    })

    if (!response.ok) {
      return NextResponse.json({
        audioUrl: null,
        message: `Voice preview for ${voice}: "${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
        voiceType: voice,
        isSimulated: true,
      })
    }

    const audioBuffer = await response.arrayBuffer()
    const audioBase64 = Buffer.from(audioBuffer).toString("base64")

    return NextResponse.json({
      audioUrl: `data:audio/mp3;base64,${audioBase64}`,
      message: "Voice generated successfully",
      voiceType: voice,
      isSimulated: false,
    })
  } catch (error) {
    console.error("Voice generation error:", error)
    return NextResponse.json({
      audioUrl: null,
      message: "Voice generation temporarily unavailable - showing text preview",
      voiceType: "alloy",
      isSimulated: true,
    })
  }
}
