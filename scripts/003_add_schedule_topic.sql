-- Add topic column to call_schedules for per-schedule call topics
ALTER TABLE public.call_schedules ADD COLUMN IF NOT EXISTS topic TEXT;
