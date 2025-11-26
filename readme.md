# CallMeAI

A comprehensive AI-powered accountability system that helps users stay consistent with their daily routines and goals through personalized AI phone calls, progress tracking, and detailed weekly reports.

## 🚀 Features

### Core Features
- **AI Phone Calls**: Schedule customizable AI phone calls via Bland.ai at specific times and intervals
- **Voice Customization**: Choose from 6 different AI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- **Custom Tasks**: Define your own accountability tasks (water intake, exercise, study time, etc.)
- **Progress Tracking**: Visual dashboards with charts and analytics
- **Weekly Reports**: Automated AI-generated insights and recommendations
- **User Authentication**: Secure login and user management with Supabase
- **Responsive Design**: Modern, mobile-first interface

### Advanced Features
- **📞 Real-Time Call Transcripts**: Watch live transcripts as calls happen
- **🔄 Automatic Call Scheduling**: Background worker triggers scheduled calls automatically
- **📊 Live Call Logs**: View all call history with detailed transcripts and analysis
- **🤖 Automatic Transcript Analysis**: AI automatically extracts task responses from call transcripts
- **📅 Weekly Report Generation**: Automated service endpoint with GitHub Actions support
- **🔒 Webhook Security**: Signature verification for secure provider integrations
- **⚡ Streaming Events**: Real-time transcript chunks via Supabase Realtime
- **🎯 Task Management**: Enable/disable tasks with confirmation dialogs

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **AI Integration**: OpenAI API for voice generation and insights
- **Charts**: Recharts for data visualization
- **Deployment**: Vercel

## 📋 Prerequisites

Before running this project locally, make sure you have:

- Node.js 18+ installed
- npm or yarn package manager
- A Supabase account and project
- An OpenAI API key (optional, for voice features)

## 🚀 Getting Started

### 1. Clone the Repository

\`\`\`bash
git clone <your-repo-url>
cd callMeAI
\`\`\`

### 2. Install Dependencies

\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Variables

Create a `.env.local` file in the root directory and add the following variables:

\`\`\`env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Bland.ai Configuration
BLAND_API_KEY=your_bland_api_key
BLAND_WEBHOOK_SECRET=your_webhook_secret_for_signature_verification

# OpenAI API (optional - for advanced analysis)
OPENAI_API_KEY=your_openai_api_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Database URL (for migrations)
DATABASE_URL=postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres
\`\`\`

### 4. Database Setup

**Important**: Run the database migration to add required tables and columns.

#### Option A: Automated PowerShell Script (Windows - Recommended)
\`\`\`powershell
.\scripts\apply-migration.ps1
\`\`\`

The script will guide you through:
- Installing dependencies
- Connecting to your database
- Applying migrations automatically

#### Option B: Supabase Dashboard (All Platforms)
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy the contents of `scripts/001_create_tables.sql`
4. Paste and run in the SQL Editor

#### Option C: Command Line
\`\`\`powershell
npm install pg
$env:DATABASE_URL = "postgresql://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres"
node scripts/apply_migrations.js
\`\`\`

📖 For detailed migration instructions, see [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md)

### 5. Supabase Configuration

1. **Enable Row Level Security (RLS)**:
   - Go to Authentication > Settings in your Supabase dashboard
   - Enable Row Level Security for all tables

2. **Configure Auth Settings**:
   - Go to Authentication > Settings
   - Add your site URL: `http://localhost:3000`
   - Add redirect URLs: `http://localhost:3000/dashboard`

3. **Email Templates** (optional):
   - Customize email templates in Authentication > Templates

### 5. Run the Development Server

\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser.

### 6. Start the Scheduler Worker (Optional)

To enable automatic scheduled calls:

\`\`\`powershell
npm run start:scheduler
\`\`\`

Keep this running in a separate terminal. In production, deploy this as a background service.

### 7. Configure Bland.ai Webhooks

1. Go to your Bland.ai dashboard
2. Set webhook URL to: `https://your-domain.com/api/bland/webhook`
3. Save the webhook secret to `.env.local` as `BLAND_WEBHOOK_SECRET`

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account on the homepage
2. **Complete Profile**: Add your phone number and preferred voice
3. **Dashboard**: Access your dashboard to start setting up tasks

### Setting Up Tasks
1. Navigate to the Dashboard
2. Click "Add Task" to create accountability tasks
3. Define task name, category, target value, and frequency
4. Toggle tasks on/off as needed

### Scheduling Calls
1. Go to "Call Schedules" page
2. Click "Add Schedule"
3. Choose days of week and time
4. Select timezone
5. Activate the schedule

### Managing Calls
1. **Manual Calls**: Click "Call Me Now" button for immediate calls
2. **Call History**: View all past calls with transcripts in the Calls page
3. **Live Transcripts**: Watch real-time transcripts during active calls
4. **Analysis**: Task responses are automatically extracted from transcripts

### Viewing Progress & Reports
1. Check the "Progress" section for detailed analytics
2. View completion rates, streaks, and performance metrics
3. Analyze trends with interactive charts
4. Weekly reports are generated automatically (configure in GitHub Actions)

## 🏗️ Architecture

### Backend Services

#### Scheduler Worker (`scripts/scheduler-worker.js`)
- Polls `call_schedules` table every minute
- Matches current time with scheduled call times (timezone-aware)
- Triggers calls via Bland.ai or simulator fallback
- Uses service-role key for privileged operations

#### Webhook Handler (`app/api/bland/webhook/route.ts`)
- Receives call events from Bland.ai
- Validates webhook signatures (if `BLAND_WEBHOOK_SECRET` set)
- Streams transcript chunks to `call_log_events` table
- Deduplicates events using `provider_event_id`
- Aggregates final transcript on call completion
- Triggers automatic analysis

#### Transcript Analyzer (`lib/analyze/analyzeTranscript.ts`)
- Heuristic-based analysis of call transcripts
- Extracts task mentions and numeric responses
- Persists to `task_responses` table
- Can be upgraded to LLM-based analysis

#### Report Generator (`app/api/reports/generate/service/route.ts`)
- Service endpoint protected by service-role key
- Generates weekly reports for all users
- Calculates metrics, completion rates, insights
- Can be triggered by GitHub Actions or cron

### Database Schema

**Key Tables:**
- `profiles`: User information and preferences
- `tasks`: User-defined accountability tasks
- `call_schedules`: Scheduled call configurations
- `call_logs`: Call records with status and metadata
- `call_log_events`: Streaming transcript chunks (NEW)
- `task_responses`: Daily task completion data
- `weekly_reports`: Generated weekly summaries

### Real-Time Features

Uses Supabase Realtime channels:
- `call_logs` updates → status changes, transcript finalization
- `call_log_events` inserts → streaming transcript chunks

Frontend components subscribe to these channels for live UI updates.

## 🔒 Security

### Webhook Security
- Signature verification using `BLAND_WEBHOOK_SECRET`
- HMAC SHA-256 validation of incoming payloads
- Rejects unauthorized requests

### Database Security
- Row Level Security (RLS) on all tables
- Users can only access their own data
- Service-role operations use dedicated key

### API Security
- Service endpoints protected by service-role header validation
- Authentication required for all user-facing endpoints
- Secure token handling via Supabase Auth

## 📦 Deployment

### Vercel Deployment (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Scheduler Deployment

The scheduler worker needs to run continuously. Options:

**Option 1: Separate Service (Recommended)**
- Deploy to Railway, Render, or similar
- Set environment variables
- Run: `node scripts/scheduler-worker.js`

**Option 2: Vercel Cron**
- Use Vercel cron jobs
- Create endpoint that triggers call checks
- Configure in `vercel.json`

**Option 3: GitHub Actions**
- Run scheduler on GitHub Actions
- Use scheduled workflows
- See `.github/workflows/` for examples

### Weekly Reports Automation

See `.github/workflows/generate-weekly-report.yml` for automated report generation:
- Runs every Monday at 6 AM UTC
- Calls service endpoint with service-role authentication
- Configure secrets: `APP_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## 🧪 Testing

### Test Manual Calls
1. Start dev server: `npm run dev`
2. Click "Call Me Now" button
3. Verify call initiated and transcript appears

### Test Scheduler
1. Create a schedule for 2 minutes from now
2. Start scheduler: `npm run start:scheduler`
3. Wait and verify call triggers

### Test Webhooks (Local)
Use ngrok or similar to expose local server:
\`\`\`powershell
ngrok http 3000
# Set webhook URL in Bland.ai to: https://[ngrok-url]/api/bland/webhook
\`\`\`

### Scheduling AI Calls
1. Go to the "Calls" section in your dashboard
2. Click "Schedule New Call"
3. Set your preferred days, times, and timezone
4. Choose your AI voice preference
5. Enable the schedule to start receiving calls

### Viewing Progress
1. Check the "Progress" section for detailed analytics
2. View completion rates, streaks, and performance metrics
3. Analyze trends with interactive charts

### Weekly Reports
1. Navigate to the "Reports" section
2. Generate weekly reports for any time period
3. Review AI-generated insights and recommendations

## 🔧 Development

### Project Structure

\`\`\`
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── dashboard/         # Dashboard pages
│   └── page.tsx           # Homepage
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   └── *.tsx             # Custom components
├── lib/                  # Utility functions
│   └── supabase/         # Supabase client configuration
├── scripts/              # Database scripts
└── hooks/                # Custom React hooks
\`\`\`

### Key Components

- **Task Management**: `components/task-list.tsx`, `components/create-task-dialog.tsx`
- **Call Scheduling**: `components/call-schedule-list.tsx`, `components/create-call-schedule-dialog.tsx`
- **Progress Tracking**: `components/progress-charts.tsx`, `components/progress-stats.tsx`
  
Note: Voice/call implementation was migrated to Bland.ai integration. Old internal voice-generation components have been removed.

### API Routes

- `/api/bland/call` - Initiate phone calls via Bland.ai
- `/api/bland/webhook` - Bland.ai webhook receiver for call results
- `/api/reports/generate` - Generate weekly reports

## 🚀 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

### Environment Variables for Production

Make sure to add all the environment variables from your `.env.local` file to your Vercel project settings, replacing localhost URLs with your production domain.

## 🔒 Security

- All database operations use Row Level Security (RLS)
- User authentication handled by Supabase Auth
- API routes protected with middleware
- Environment variables for sensitive data

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues:

1. Check the console for error messages
2. Verify all environment variables are set correctly
3. Ensure Supabase database is properly configured
4. Check that RLS policies are enabled

For additional help, please open an issue in the repository.

## 🎯 Roadmap

- [ ] Real phone call integration (Twilio/Vonage)
- [ ] Mobile app development
- [ ] Advanced AI conversation flows
- [ ] Integration with fitness trackers
- [ ] Team accountability features
- [ ] Advanced analytics and insights
