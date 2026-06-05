import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { syncTranscripts } from "@/lib/calls/syncTranscripts"

/**
 * Sync endpoint that pulls call transcripts directly from the Bland.ai API.
 * Needed in local dev where Bland's webhook can't reach localhost; also acts
 * as a recovery path if a webhook delivery was missed in production.
 */
export async function POST() {
  try {
    if (!process.env.BLAND_API_KEY) {
      return NextResponse.json({ error: "BLAND_API_KEY not configured" }, { status: 500 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const result = await syncTranscripts(supabase)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("[sync] error", error)
    return NextResponse.json({ error: "Sync failed", details: String(error) }, { status: 500 })
  }
}
