# CallMeAI Quick Start Guide

## ⚡ 5-Minute Setup

### 1. Install & Configure
```powershell
# Clone and install
git clone <repo-url>
cd callMeAI
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with your credentials
```

### 2. Database Migration
```powershell
# Method 1: PowerShell Script (Easiest)
.\scripts\apply-migration.ps1

# Method 2: Supabase Dashboard
# Copy scripts/001_create_tables.sql → SQL Editor → Run
```

### 3. Start Services
```powershell
# Terminal 1: Web server
npm run dev

# Terminal 2: Scheduler (optional)
npm run start:scheduler
```

### 4. Test
1. Sign up at `http://localhost:3000`
2. Add phone number in profile
3. Click "Call Me Now"
4. Watch real-time transcript! 🎉

---

## 📋 Environment Variables

### Required
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...
BLAND_API_KEY=sk-xxx...
```

### Optional
```env
BLAND_WEBHOOK_SECRET=webhook_secret_here
OPENAI_API_KEY=sk-xxx... (for advanced analysis)
NEXT_PUBLIC_APP_URL=http://localhost:3000
DATABASE_URL=postgresql://postgres:xxx@db.xxx.supabase.co:5432/postgres
```

---

## 🛠️ Common Commands

```powershell
# Development
npm run dev                    # Start dev server
npm run start:scheduler        # Start call scheduler
npm run build                  # Production build
npm run start                  # Production server

# Migration
.\scripts\apply-migration.ps1  # Apply DB migration
node scripts/apply_migrations.js  # Manual migration

# Testing
npm run lint                   # Check code quality
```

---

## 📁 Key Files

### Configuration
- `.env.local` - Environment variables
- `package.json` - Dependencies & scripts
- `tailwind.config.ts` - Styling config

### Database
- `scripts/001_create_tables.sql` - Schema migration
- `scripts/apply_migrations.js` - Migration runner
- `MIGRATION_GUIDE.md` - Detailed migration docs

### Backend Services
- `scripts/scheduler-worker.js` - Automated call scheduler
- `app/api/bland/webhook/route.ts` - Webhook handler
- `app/api/bland/call/route.ts` - Manual call trigger
- `lib/analyze/analyzeTranscript.ts` - Transcript analyzer
- `app/api/reports/generate/service/route.ts` - Report generator

### Frontend Components
- `components/task-list.tsx` - Task display & management
- `components/call-live-logs.tsx` - Real-time transcripts
- `components/bland-call-dialog.tsx` - Call initiation modal
- `components/call-logs-list.tsx` - Call history view

### Documentation
- `README.md` - Full project documentation
- `MIGRATION_GUIDE.md` - Database setup guide
- `TESTING_GUIDE.md` - Testing & troubleshooting
- `QUICK_START.md` - This file!

---

## 🎯 Feature Checklist

### Basic Features
- [x] User authentication & profiles
- [x] Task creation & management
- [x] Task enable/disable with confirmation
- [x] Manual "Call Me Now" button
- [x] Call history viewing

### Advanced Features  
- [x] Scheduled calls (time + day-of-week)
- [x] Real-time transcript streaming
- [x] Automatic transcript analysis
- [x] Task response extraction
- [x] Weekly report generation
- [x] Webhook signature verification
- [x] Event deduplication
- [x] Timezone-aware scheduling

---

## 🔗 Important URLs

### Local Development
- **Web App**: http://localhost:3000
- **Webhook**: http://localhost:3000/api/bland/webhook
- **Reports API**: http://localhost:3000/api/reports/generate/service

### External Services
- **Supabase Dashboard**: https://supabase.com/dashboard
- **Bland.ai Dashboard**: https://app.bland.ai/
- **Bland.ai Docs**: https://docs.bland.ai/
- **Supabase Docs**: https://supabase.com/docs

---

## 🚨 Troubleshooting Quick Fixes

### "Call failed to initiate"
→ Check `BLAND_API_KEY` and phone number format (+1234567890)

### "No transcript showing"
→ Run migration: `.\scripts\apply-migration.ps1`

### "Scheduler exited with error"
→ Set `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

### "Webhook 401 Unauthorized"
→ Remove `BLAND_WEBHOOK_SECRET` or set correct value

### "Task won't disable"
→ Check browser console, refresh page

### "Real-time not working"
→ Enable Realtime in Supabase Dashboard → Database → Replication

See **TESTING_GUIDE.md** for detailed troubleshooting.

---

## 📞 Webhook Setup

### Local Testing (ngrok)
```powershell
# Install ngrok: https://ngrok.com/download
ngrok http 3000

# Copy ngrok URL, then:
# Bland.ai Dashboard → Webhooks → Add URL
# URL: https://abc123.ngrok.io/api/bland/webhook
```

### Production
1. Deploy app to Vercel/similar
2. Get production URL
3. Set webhook in Bland.ai: `https://your-domain.com/api/bland/webhook`
4. Add `BLAND_WEBHOOK_SECRET` to env vars

---

## 🎓 Learning Path

1. **Day 1**: Setup, migration, manual calls
2. **Day 2**: Scheduled calls, webhook testing
3. **Day 3**: Real-time features, transcript analysis
4. **Day 4**: Reports, deployment planning
5. **Day 5**: Production deployment, monitoring

---

## 💡 Pro Tips

1. **Test locally first** with ngrok before production
2. **Keep scheduler running** in separate terminal/service
3. **Monitor logs** during first few calls
4. **Use confirmation dialogs** before deleting/disabling
5. **Set up weekly reports** with GitHub Actions
6. **Back up database** before major changes
7. **Version control** `.env.local.example` (not `.env.local`)
8. **Document custom changes** for your team

---

## 🎉 You're Ready!

Your CallMeAI system is now ready to use. Start by:

1. Creating a few tasks
2. Scheduling a call for tomorrow morning
3. Testing a manual call to see transcripts
4. Checking the progress dashboard

**Need help?** See:
- TESTING_GUIDE.md - Full testing procedures
- MIGRATION_GUIDE.md - Database setup details  
- README.md - Complete documentation

Happy tracking! 📈✨
