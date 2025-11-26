# Database Migration Guide

This guide will help you apply the database migrations needed for streaming call transcripts and webhook improvements.

## What's Being Added

The migration adds:

1. **`provider_call_id` column** to `call_logs` table
   - Stores the provider's call ID (from Bland.ai) for reliable webhook matching
   
2. **`call_log_events` table** (NEW)
   - Stores streaming transcript chunks as they arrive
   - Enables real-time transcript display in the UI
   - Fields: `id`, `call_id`, `speaker`, `text`, `provider_event_id`, `created_at`
   - Has RLS policies that match parent `call_logs` ownership

## Migration Methods

Choose **ONE** of these methods:

---

### Method 1: PowerShell Script (Recommended for Windows)

Run the automated PowerShell script:

```powershell
.\scripts\apply-migration.ps1
```

The script will:
- Load your `.env.local` file
- Install `pg` package if needed
- Prompt for your Supabase database password
- Apply the migration automatically
- Show success confirmation

---

### Method 2: Supabase Dashboard (Easiest)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Open `scripts/001_create_tables.sql` in your code editor
4. Copy the entire SQL content
5. Paste it into the Supabase SQL Editor
6. Click **Run**

✅ The SQL uses `IF NOT EXISTS`, so it's safe to run multiple times.

---

### Method 3: Command Line (Node.js)

1. Install the PostgreSQL client:
   ```powershell
   npm install pg
   ```

2. Get your database connection string:
   - Go to: Supabase Dashboard → Project Settings → Database
   - Find your database password (or reset it)
   - Format: `postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

3. Set the environment variable:
   ```powershell
   $env:DATABASE_URL = "postgresql://postgres:YOUR_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres"
   ```

4. Run the migration:
   ```powershell
   node scripts/apply_migrations.js
   ```

---

## Verification

After applying the migration, verify it worked:

### Check in Supabase Dashboard

1. Go to **Table Editor**
2. Check `call_logs` table:
   - Should have a `provider_call_id` column (text type)
3. Look for `call_log_events` table:
   - Should exist with columns: `id`, `call_id`, `speaker`, `text`, `provider_event_id`, `created_at`

### Test Realtime Streaming

1. Start your dev server:
   ```powershell
   npm run dev
   ```

2. Navigate to the Calls page in your app
3. Initiate a test call
4. Watch for transcript chunks appearing in real-time

---

## Troubleshooting

### Error: "Missing DATABASE_URL"
- Make sure you set the `DATABASE_URL` environment variable with your Supabase connection string

### Error: "relation already exists"
- This is OK! The migration uses `IF NOT EXISTS` and is idempotent
- It means the table/column already exists

### Error: "password authentication failed"
- Double-check your database password in Supabase Dashboard → Settings → Database
- You may need to reset your database password

### Error: "pg module not found"
- Run: `npm install pg`

---

## Environment Variables Needed

Make sure your `.env.local` has:

```env
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
BLAND_API_KEY=your_bland_api_key
BLAND_WEBHOOK_SECRET=your_webhook_secret (optional but recommended)
```

---

## Next Steps

After migration:

1. ✅ **Test Manual Calls**
   - Use the "Call Me Now" button
   - Verify transcript appears in real-time

2. ✅ **Setup Scheduler**
   - Run: `npm run start:scheduler`
   - Schedule a test call
   - Confirm it executes at the right time

3. ✅ **Configure Webhooks**
   - Set your webhook URL in Bland.ai dashboard
   - Format: `https://your-domain.com/api/bland/webhook`
   - Add `BLAND_WEBHOOK_SECRET` to `.env.local` for signature verification

4. ✅ **Test Weekly Reports**
   - Use the service endpoint or GitHub Action
   - Verify reports are generated correctly

---

## Rollback (if needed)

If you need to remove the migration:

```sql
-- Remove the new table
DROP TABLE IF EXISTS public.call_log_events CASCADE;

-- Remove the new column
ALTER TABLE public.call_logs DROP COLUMN IF EXISTS provider_call_id;
```

**Note:** This will delete all streaming event data.
