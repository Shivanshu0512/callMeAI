# CallMeAI

A comprehensive AI-powered accountability system that helps users stay consistent with their daily routines and goals through personalized AI phone calls, progress tracking, and detailed weekly reports.

## 🚀 Features

- **AI Phone Calls**: Schedule customizable AI phone calls at specific times and intervals
- **Voice Customization**: Choose from 6 different AI voices (Alloy, Echo, Fable, Onyx, Nova, Shimmer)
- **Custom Tasks**: Define your own accountability tasks (water intake, exercise, study time, etc.)
- **Progress Tracking**: Visual dashboards with charts and analytics
- **Weekly Reports**: AI-generated insights and recommendations
- **User Authentication**: Secure login and user management with Supabase
- **Responsive Design**: Modern, mobile-first interface

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

# Database URLs (provided by Supabase)
POSTGRES_URL=your_postgres_url
POSTGRES_PRISMA_URL=your_postgres_prisma_url
POSTGRES_URL_NON_POOLING=your_postgres_url_non_pooling
POSTGRES_USER=your_postgres_user
POSTGRES_PASSWORD=your_postgres_password
POSTGRES_DATABASE=your_postgres_database
POSTGRES_HOST=your_postgres_host

# OpenAI API (optional - for voice features)
OPENAI_API_KEY=your_openai_api_key

# Development redirect URL for Supabase auth
NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL=http://localhost:3000/dashboard
\`\`\`

### 4. Database Setup

#### Option A: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to the SQL Editor
3. Run the SQL scripts from the `scripts/` folder in order:
   - `001_create_tables.sql`
   - `002_profile_trigger.sql`

#### Option B: Using the Project Scripts
If you're using v0 or have the script execution capability:
1. Run `scripts/001_create_tables.sql`
2. Run `scripts/002_profile_trigger.sql`

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

### 6. Run the Development Server

\`\`\`bash
npm run dev
# or
yarn dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) in your browser to see CallMeAI.

## 📱 Usage

### Getting Started
1. **Sign Up**: Create an account on the homepage
2. **Verify Email**: Check your email and verify your account
3. **Dashboard**: Access your dashboard to start setting up tasks

### Setting Up Tasks
1. Navigate to the Dashboard
2. Click "Add Task" to create accountability tasks
3. Define task name, category, target value, and frequency
4. Save and start tracking your progress

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
