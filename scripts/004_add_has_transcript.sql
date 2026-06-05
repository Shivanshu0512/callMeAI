-- Add has_transcript flag to call_logs for quick UI filtering
ALTER TABLE public.call_logs ADD COLUMN IF NOT EXISTS has_transcript BOOLEAN DEFAULT false;

-- Backfill: mark existing calls that have a transcript
UPDATE public.call_logs SET has_transcript = true WHERE call_transcript IS NOT NULL AND call_transcript != '';
