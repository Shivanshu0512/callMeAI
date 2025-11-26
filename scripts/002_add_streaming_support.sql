-- Migration: Add streaming transcript support
-- This script only adds NEW features (provider_call_id and call_log_events table)
-- Safe to run on existing database

-- Add provider_call_id column to call_logs if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'call_logs' 
    AND column_name = 'provider_call_id'
  ) THEN
    ALTER TABLE public.call_logs ADD COLUMN provider_call_id TEXT;
  END IF;
END $$;

-- Create call_log_events table for streaming transcript chunks
CREATE TABLE IF NOT EXISTS public.call_log_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  call_id UUID NOT NULL REFERENCES public.call_logs(id) ON DELETE CASCADE,
  speaker TEXT, -- e.g., 'agent' or 'user'
  text TEXT NOT NULL,
  provider_event_id TEXT, -- optional provider event id to prevent duplicates
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on call_log_events
ALTER TABLE public.call_log_events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for call_log_events (drop first if they exist to avoid errors)
DROP POLICY IF EXISTS "call_log_events_select_own" ON public.call_log_events;
CREATE POLICY "call_log_events_select_own" ON public.call_log_events FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.call_logs cl WHERE cl.id = call_log_events.call_id AND auth.uid() = cl.user_id
  )
);

DROP POLICY IF EXISTS "call_log_events_insert_own" ON public.call_log_events;
CREATE POLICY "call_log_events_insert_own" ON public.call_log_events FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.call_logs cl WHERE cl.id = call_log_events.call_id AND auth.uid() = cl.user_id
  )
);

DROP POLICY IF EXISTS "call_log_events_delete_own" ON public.call_log_events;
CREATE POLICY "call_log_events_delete_own" ON public.call_log_events FOR DELETE USING (
  EXISTS (
    SELECT 1 FROM public.call_logs cl WHERE cl.id = call_log_events.call_id AND auth.uid() = cl.user_id
  )
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_call_log_events_call_id ON public.call_log_events(call_id);
CREATE INDEX IF NOT EXISTS idx_call_log_events_provider_event_id ON public.call_log_events(provider_event_id);
CREATE INDEX IF NOT EXISTS idx_call_logs_provider_call_id ON public.call_logs(provider_call_id);

-- Success message
DO $$ 
BEGIN
  RAISE NOTICE 'Migration completed successfully!';
  RAISE NOTICE 'Added: provider_call_id column to call_logs';
  RAISE NOTICE 'Added: call_log_events table with RLS policies';
  RAISE NOTICE 'Added: Performance indexes';
END $$;
