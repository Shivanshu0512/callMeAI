# Testing & Troubleshooting Guide

This guide will help you test all CallMeAI features and troubleshoot common issues.

## 🧪 Testing Checklist

### Prerequisites
- [ ] Database migration applied (`call_log_events` table exists)
- [ ] Environment variables set in `.env.local`
- [ ] Dev server running (`npm run dev`)
- [ ] User account created and phone number added to profile

---

## 1. Manual Call Testing

### Test Steps
1. Navigate to Dashboard
2. Click "Call Me Now" button
3. Observe the call dialog opening

### Expected Results
✅ Dialog shows "Initiating call..."
✅ Status updates to "In Progress" or "Completed"
✅ Transcript appears in real-time (if streaming is working)
✅ Call log entry created in database

### Troubleshooting

**Issue: "Failed to initiate call"**
- Check `BLAND_API_KEY` is set correctly
- Verify phone number format in profile (E.164 format: +1234567890)
- Check browser console for errors
- Verify Bland.ai API key is valid

**Issue: No transcript showing**
- Check if `call_log_events` table exists (run migration)
- Open browser DevTools → Network tab
- Look for Supabase realtime connection
- Verify RLS policies allow reading `call_log_events`

**Issue: Call initiated but webhook never received**
- Check Bland.ai dashboard for webhook configuration
- Verify webhook URL is publicly accessible (use ngrok for local testing)
- Check webhook endpoint logs: `app/api/bland/webhook/route.ts`

---

## 2. Scheduled Call Testing

### Test Steps
1. Go to "Call Schedules" page
2. Create schedule for 2-3 minutes from now
3. Start scheduler: `npm run start:scheduler`
4. Wait for scheduled time
5. Check logs in scheduler terminal

### Expected Results
✅ Scheduler shows "Matched schedule [name]"
✅ Call initiates at correct time
✅ Call log created with `schedule_id` reference
✅ No duplicate calls for same schedule

### Troubleshooting

**Issue: Scheduler exits immediately**
- Check `SUPABASE_SERVICE_ROLE_KEY` is set
- Verify `NEXT_PUBLIC_SUPABASE_URL` is correct
- Run: `npm install luxon @supabase/supabase-js` if missing

**Issue: Scheduler doesn't trigger calls**
- Verify timezone matches (check schedule timezone vs system time)
- Ensure `is_active` is true on schedule
- Check scheduler logs for "Matched schedule" message
- Verify phone number exists in user profile

**Issue: Duplicate calls**
- Scheduler creates duplicate tracking entries in `call_logs`
- Check `last_triggered_at` is being updated correctly
- Verify only one scheduler instance is running

---

## 3. Webhook Testing

### Test Steps (Local with ngrok)
1. Install ngrok: `https://ngrok.com/download`
2. Start ngrok: `ngrok http 3000`
3. Copy the ngrok URL (e.g., `https://abc123.ngrok.io`)
4. Set Bland.ai webhook URL to: `https://abc123.ngrok.io/api/bland/webhook`
5. Initiate a test call
6. Watch ngrok logs and application logs

### Expected Results
✅ Webhook POST received
✅ Signature validated (if `BLAND_WEBHOOK_SECRET` set)
✅ `call_log_events` rows inserted for streaming chunks
✅ Final transcript aggregated on completion
✅ Automatic analysis runs and creates `task_responses`

### Troubleshooting

**Issue: Webhook 401 Unauthorized**
- Signature validation failing
- Option 1: Remove `BLAND_WEBHOOK_SECRET` from `.env.local` for testing
- Option 2: Get correct secret from Bland.ai and update env

**Issue: Webhook 400 Bad Request**
- Check payload structure from Bland.ai
- Add console.log in webhook handler to inspect payload
- Verify `call_id` field exists in payload

**Issue: Events not inserting**
- Check `call_log_events` table exists (migration applied?)
- Verify RLS policies allow service-role to insert
- Check for errors in webhook logs

**Issue: Webhook received but no call_log match found**
- Verify `provider_call_id` was saved during call creation
- Check fallback matching logic (phone number match)
- Look for recent "initiated" or "in_progress" calls in database

---

## 4. Real-Time Transcript Testing

### Test Steps
1. Open two browser windows
2. Window 1: Dashboard with call dialog open
3. Window 2: Browser DevTools → Network → WS (WebSocket tab)
4. Initiate call
5. Observe transcript appearing in real-time

### Expected Results
✅ WebSocket connection to Supabase established
✅ Transcript lines appear as events arrive
✅ No full page refresh needed
✅ Call status updates without polling

### Troubleshooting

**Issue: No real-time updates**
- Check Supabase realtime is enabled for your project
- Verify subscription code in `components/call-live-logs.tsx`
- Look for WebSocket errors in DevTools Console
- Check RLS policies allow reading `call_log_events`

**Issue: Updates delayed or batched**
- Normal behavior - slight delay expected
- Check network latency
- Verify events are being inserted (check database directly)

---

## 5. Transcript Analysis Testing

### Test Steps
1. Create some tasks (e.g., "water", "exercise")
2. Initiate a call
3. During call, mention task names and numbers
4. After call completes, check `task_responses` table

### Expected Results
✅ Analysis runs automatically on call completion
✅ `task_responses` rows created for mentioned tasks
✅ `response_value` extracted if numbers mentioned

### Troubleshooting

**Issue: No task responses created**
- Check analysis logs in webhook handler
- Verify `analyzeAndPersist` function ran
- Look for task mentions in transcript (case-insensitive match)
- Check if tasks are active (`is_active: true`)

**Issue: Wrong values extracted**
- Current analyzer is heuristic-based (simple pattern matching)
- Upgrade to LLM-based analysis for better accuracy
- See `lib/analyze/analyzeTranscript.ts` for improvements

---

## 6. Weekly Report Testing

### Test Manual Generation
```powershell
# Using curl or similar
curl -X POST http://localhost:3000/api/reports/generate/service \
  -H "x-service-role: YOUR_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"weekStart": "2024-01-01", "weekEnd": "2024-01-07"}'
```

### Expected Results
✅ Reports created for all users
✅ `weekly_reports` table has new entries
✅ Report data includes metrics, insights, daily breakdown

### Troubleshooting

**Issue: 401 Unauthorized**
- `x-service-role` header missing or incorrect
- Verify value matches `SUPABASE_SERVICE_ROLE_KEY`

**Issue: No reports generated**
- Check if users have any tasks or responses
- Verify date range includes activity
- Look for errors in route handler logs

---

## 7. Task Management Testing

### Test Steps
1. Create several tasks
2. Hover over tasks to see action buttons
3. Click disable/enable toggle
4. Verify confirmation dialog appears
5. Confirm and check task opacity changes

### Expected Results
✅ Disabled tasks appear dimmed (50% opacity)
✅ Confirmation dialog before disable/enable
✅ Quick toggle button shows trash or checkmark icon
✅ Dropdown menu shows "Disable" or "Enable" label

### Troubleshooting

**Issue: Task still appears after disable**
- Check query filters `is_active: true`
- Verify database update succeeded
- Try refreshing page

---

## 🔍 Common Issues & Solutions

### Database Connection Issues
```powershell
# Test connection
$env:DATABASE_URL = "postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"
node -e "const {Client}=require('pg');const c=new Client({connectionString:process.env.DATABASE_URL});c.connect().then(()=>console.log('Connected!')).catch(e=>console.error(e)).finally(()=>c.end())"
```

### Missing Environment Variables
```powershell
# Check all required vars
Get-Content .env.local | Select-String "SUPABASE|BLAND|APP_URL"
```

### Reset Migration (If needed)
```sql
-- In Supabase SQL Editor
DROP TABLE IF EXISTS public.call_log_events CASCADE;
ALTER TABLE public.call_logs DROP COLUMN IF EXISTS provider_call_id;
-- Then re-run migration
```

### Clear Supabase Cache
```powershell
# Clear browser storage
# DevTools → Application → Storage → Clear Site Data
```

### Check Supabase Service Status
Visit: https://status.supabase.com/

---

## 📊 Monitoring & Logs

### Application Logs
```powershell
# Dev server logs
npm run dev

# Scheduler logs
npm run start:scheduler

# Check specific route
# Add console.log statements in route handlers
```

### Database Logs
- Supabase Dashboard → Logs → Database
- Filter by severity (Error, Warning)
- Search for specific table names

### Realtime Logs
- Supabase Dashboard → Logs → Realtime
- Check subscription status
- Verify channel connections

---

## ✅ Production Readiness Checklist

Before deploying to production:

- [ ] Database migration applied to production DB
- [ ] All environment variables set in hosting platform
- [ ] Webhook URL updated in Bland.ai to production URL
- [ ] `BLAND_WEBHOOK_SECRET` configured for signature validation
- [ ] Scheduler deployed as separate service or cron job
- [ ] GitHub Actions configured for weekly reports (optional)
- [ ] RLS policies tested and verified
- [ ] Error monitoring setup (Sentry, LogRocket, etc.)
- [ ] Backup strategy for database
- [ ] Rate limiting on webhook endpoints (optional)
- [ ] Domain configured and SSL enabled
- [ ] Test manual call in production
- [ ] Test scheduled call in production
- [ ] Verify webhook delivery in production
- [ ] Monitor logs for 24-48 hours after launch

---

## 🆘 Getting Help

If you're stuck:

1. Check this guide first
2. Review error messages in:
   - Browser console
   - Terminal logs
   - Supabase dashboard logs
3. Search GitHub issues (if open source)
4. Check Bland.ai documentation: https://docs.bland.ai/
5. Check Supabase docs: https://supabase.com/docs

---

## 📝 Logging Best Practices

Add comprehensive logging in critical paths:

```typescript
// Example: Enhanced webhook logging
console.log('[WEBHOOK] Received:', {
  callId: call_id,
  status,
  hasEvents: Array.isArray(events),
  eventCount: events?.length,
  timestamp: new Date().toISOString()
})
```

This helps diagnose issues quickly in production.
