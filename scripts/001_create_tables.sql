-- Create profiles table for user management
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone_number TEXT,
  preferred_voice TEXT DEFAULT 'alloy',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles FOR DELETE USING (auth.uid() = id);

-- Create tasks table for user-defined CallMeAI tasks
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  target_frequency TEXT NOT NULL, -- 'daily', 'weekly', 'custom'
  target_value NUMERIC,
  unit TEXT, -- 'glasses', 'hours', 'minutes', 'times', etc.
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for tasks
CREATE POLICY "tasks_select_own" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- Create call_schedules table for AI call scheduling
CREATE TABLE IF NOT EXISTS public.call_schedules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  days_of_week INTEGER[] NOT NULL, -- 0=Sunday, 1=Monday, etc.
  time_of_day TIME NOT NULL,
  timezone TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on call_schedules
ALTER TABLE public.call_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_schedules
CREATE POLICY "call_schedules_select_own" ON public.call_schedules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "call_schedules_insert_own" ON public.call_schedules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "call_schedules_update_own" ON public.call_schedules FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "call_schedules_delete_own" ON public.call_schedules FOR DELETE USING (auth.uid() = user_id);

-- Create task_responses table for tracking daily responses
CREATE TABLE IF NOT EXISTS public.task_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  call_id UUID, -- Reference to the call that generated this response
  response_value NUMERIC,
  response_text TEXT,
  response_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on task_responses
ALTER TABLE public.task_responses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for task_responses
CREATE POLICY "task_responses_select_own" ON public.task_responses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "task_responses_insert_own" ON public.task_responses FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "task_responses_update_own" ON public.task_responses FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "task_responses_delete_own" ON public.task_responses FOR DELETE USING (auth.uid() = user_id);

-- Create call_logs table for tracking AI calls
CREATE TABLE IF NOT EXISTS public.call_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  schedule_id UUID REFERENCES public.call_schedules(id) ON DELETE SET NULL,
  call_status TEXT NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'completed', 'failed', 'missed'
  call_duration INTEGER, -- in seconds
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE,
  call_transcript TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on call_logs
ALTER TABLE public.call_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_logs
CREATE POLICY "call_logs_select_own" ON public.call_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "call_logs_insert_own" ON public.call_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "call_logs_update_own" ON public.call_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "call_logs_delete_own" ON public.call_logs FOR DELETE USING (auth.uid() = user_id);

-- Create weekly_reports table for progress summaries
CREATE TABLE IF NOT EXISTS public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  week_end_date DATE NOT NULL,
  report_data JSONB NOT NULL, -- Structured report data
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on weekly_reports
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for weekly_reports
CREATE POLICY "weekly_reports_select_own" ON public.weekly_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "weekly_reports_insert_own" ON public.weekly_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "weekly_reports_update_own" ON public.weekly_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "weekly_reports_delete_own" ON public.weekly_reports FOR DELETE USING (auth.uid() = user_id);
