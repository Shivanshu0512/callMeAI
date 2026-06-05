import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { DateTime } from "luxon"
import { syncTranscripts } from "@/lib/calls/syncTranscripts"

/**
 * Stateless scheduler tick — serverless replacement for scripts/scheduler-worker.js.
 * An external cron (cron-job.org) POSTs here every minute in production:
 *   1. Triggers any call_schedules due right now (timezone + day-of-week aware)
 *   2. Syncs completed-call transcripts from Bland.ai (fallback to the webhook)
 *
 * Duplicate-safety is DB-backed (recent call_logs lookback), so overlapping or
 * retried ticks won't double-call a user.
 *
 * Auth: requires `x-cron-secret` header matching CRON_SECRET env.
 */

const TRIGGER_WINDOW_MINUTES = 1 // minutes tolerance to trigger
const DUPLICATE_LOOKBACK_MINUTES = 10 // don't re-trigger if a call started in this window

export async function POST(request: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret || request.headers.get("x-cron-secret") !== secret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
    )

    const nowUtc = DateTime.utc()
    const triggered: any[] = []
    const errors: any[] = []

    const { data: schedules, error } = await supabase
      .from("call_schedules")
      .select("*")
      .eq("is_active", true)

    if (error) {
      return NextResponse.json({ error: "Failed to fetch schedules", details: error.message }, { status: 500 })
    }

    for (const schedule of schedules || []) {
      if (!shouldTriggerSchedule(schedule, nowUtc)) continue

      if (await wasRecentlyTriggered(supabase, schedule.id, nowUtc)) continue

      try {
        // CommonJS module shared with the local dev worker
        const { initiateBlandCall } = await import("@/lib/calls/blandCall")
        const res = await initiateBlandCall(supabase, schedule)
        triggered.push({ scheduleId: schedule.id, callLogId: res.callLog?.id })
      } catch (e) {
        console.error("[tick] failed to trigger schedule", schedule.id, e)
        errors.push({ scheduleId: schedule.id, error: String(e) })
      }
    }

    // Transcript sync fallback (webhook handles the happy path in production)
    let sync: { checked: number; synced: any[] } = { checked: 0, synced: [] }
    try {
      sync = await syncTranscripts(supabase)
    } catch (e) {
      console.error("[tick] transcript sync failed", e)
      errors.push({ sync: String(e) })
    }

    return NextResponse.json({
      success: true,
      now: nowUtc.toISO(),
      activeSchedules: schedules?.length || 0,
      triggered,
      synced: sync.synced,
      errors,
    })
  } catch (error) {
    console.error("[tick] error", error)
    return NextResponse.json({ error: "Tick failed", details: String(error) }, { status: 500 })
  }
}

// Mirrors scripts/scheduler-worker.js scheduleDayMatches/shouldTriggerSchedule
function scheduleDayMatches(scheduleDays: number[], dt: DateTime): boolean {
  // scheduleDays: 0=Sun..6=Sat; luxon weekday: 1=Mon..7=Sun
  const luxonDay = dt.weekday === 7 ? 0 : dt.weekday
  return scheduleDays.includes(luxonDay)
}

function shouldTriggerSchedule(schedule: any, nowUtc: DateTime): boolean {
  try {
    if (!schedule.time_of_day) return false
    const tz = schedule.timezone || "UTC"
    const [hourStr, minuteStr] = (schedule.time_of_day || "00:00").split(":")
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)

    const nowInTz = nowUtc.setZone(tz)
    const scheduledToday = nowInTz.set({ hour, minute, second: 0, millisecond: 0 })

    const days = schedule.days_of_week || []
    if (!scheduleDayMatches(days, scheduledToday)) return false

    const diff = Math.abs(nowUtc.diff(scheduledToday.toUTC(), "minutes").minutes)
    return diff <= TRIGGER_WINDOW_MINUTES
  } catch (e) {
    console.error("[tick] shouldTriggerSchedule error", e)
    return false
  }
}

async function wasRecentlyTriggered(supabase: any, scheduleId: string, nowUtc: DateTime): Promise<boolean> {
  const lookback = nowUtc.minus({ minutes: DUPLICATE_LOOKBACK_MINUTES }).toISO()
  const { data, error } = await supabase
    .from("call_logs")
    .select("id, started_at")
    .eq("schedule_id", scheduleId)
    .gte("started_at", lookback)
    .limit(1)

  if (error) {
    console.error("[tick] error checking recent call_logs", error)
    // Fail safe: claim recently-triggered so we never double-call on DB errors
    return true
  }
  return !!(data && data.length > 0)
}
