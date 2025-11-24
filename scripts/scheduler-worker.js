#!/usr/bin/env node
/**
 * Scheduler worker
 * - Polls `call_schedules` for active schedules
 * - Matches schedules to current time (respecting timezone & days_of_week)
 * - Avoids duplicate triggers by checking recent call_logs
 * - Initiates call via the app's call API endpoint
 *
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - NEXTAUTH_URL (optional, defaults to http://localhost:3000)
 */

// Load .env.local for standalone script runs (so node ./scripts/scheduler-worker.js works)
try {
  const path = require('path')
  const dotenvPath = path.resolve(process.cwd(), '.env.local')
  require('dotenv').config({ path: dotenvPath })
} catch (e) {
  // ignore if dotenv not available
}

const { createClient } = require('@supabase/supabase-js')
const { DateTime } = require('luxon')

const POLL_INTERVAL_MS = 60 * 1000 // 1 minute
const TRIGGER_WINDOW_MINUTES = 1 // minutes tolerance to trigger
const DUPLICATE_LOOKBACK_MINUTES = 10 // don't re-trigger if a call started in this window

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const APP_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000'

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env. Exiting.')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

function scheduleDayMatches(scheduleDays, dt) {
  // scheduleDays: array of numbers 0=Sun..6=Sat
  // luxon dt.weekday: 1=Mon..7=Sun
  const luxonDay = dt.weekday === 7 ? 0 : dt.weekday // map 7->0, 1->1..6->6
  return scheduleDays.includes(luxonDay)
}

async function shouldTriggerSchedule(schedule, nowUtc) {
  try {
    if (!schedule.time_of_day) return false
    const tz = schedule.timezone || 'UTC'
    const [hourStr, minuteStr] = (schedule.time_of_day || '00:00').split(':')
    const hour = parseInt(hourStr, 10)
    const minute = parseInt(minuteStr, 10)

    // current time in schedule timezone
    const nowInTz = DateTime.fromJSDate(new Date(), { zone: 'utc' }).setZone(tz)
    const scheduledToday = nowInTz.set({ hour, minute, second: 0, millisecond: 0 })

    // check day of week
    const days = schedule.days_of_week || []
    if (!scheduleDayMatches(days, scheduledToday)) return false

    // convert scheduled time to UTC and compare with nowUtc
    const scheduledUtc = scheduledToday.toUTC()
    const diff = Math.abs(nowUtc.diff(scheduledUtc, 'minutes').minutes)
    return diff <= TRIGGER_WINDOW_MINUTES
  } catch (e) {
    console.error('shouldTriggerSchedule error', e)
    return false
  }
}

async function wasRecentlyTriggered(scheduleId, nowUtc) {
  const lookback = nowUtc.minus({ minutes: DUPLICATE_LOOKBACK_MINUTES }).toISO()
  const { data, error } = await supabase
    .from('call_logs')
    .select('id, started_at')
    .eq('schedule_id', scheduleId)
    .gte('started_at', lookback)
    .limit(1)

  if (error) {
    console.error('Error checking recent call_logs', error)
    return false
  }
  return (data && data.length > 0)
}

async function triggerCall(schedule) {
  try {
    // Prefer to place a real Bland.ai call when BLAND_API_KEY is configured.
    if (process.env.BLAND_API_KEY) {
      const { initiateBlandCall } = require('../lib/calls/blandCall')
      const res = await initiateBlandCall(supabase, schedule)
      console.log(`Bland.ai call triggered for schedule ${schedule.id} -> call id ${res.callLog.id}`, res.blandData)
      return
    }

    // Fallback to simulator when no Bland API key is present
    const { initiateSimulatedCall } = require('../lib/calls/simulateCall')
    const callLog = await initiateSimulatedCall(supabase, schedule.user_id, schedule.id)
    console.log(`Simulated call created for schedule ${schedule.id} -> call id ${callLog.id}`, callLog)
  } catch (e) {
    console.error('Failed to trigger call via simulator', e)
  }
}

async function poll() {
  const nowUtc = DateTime.utc()
  try {
    const { data: schedules, error } = await supabase
      .from('call_schedules')
      .select('*')
      .eq('is_active', true)

    if (error) {
      console.error('Failed to fetch schedules', error)
      return
    }

    console.log(`Fetched ${schedules?.length || 0} active schedules`)

    for (const s of schedules || []) {
      if (await shouldTriggerSchedule(s, nowUtc)) {
        const recent = await wasRecentlyTriggered(s.id, nowUtc)
        if (recent) {
          console.log(`Skipping schedule ${s.id} because it was recently triggered.`)
          continue
        }
        console.log(`Triggering schedule ${s.id} (${s.name}) at ${nowUtc.toISO()}`)
        await triggerCall(s)
      }
    }
  } catch (e) {
    console.error('Poll error', e)
  }
}

async function run() {
  console.log('Scheduler worker started. Poll interval:', POLL_INTERVAL_MS, 'ms')
  await poll()
  setInterval(poll, POLL_INTERVAL_MS)

  process.on('SIGINT', () => {
    console.log('Scheduler worker stopping (SIGINT)')
    process.exit(0)
  })
  process.on('SIGTERM', () => {
    console.log('Scheduler worker stopping (SIGTERM)')
    process.exit(0)
  })
}

run()
