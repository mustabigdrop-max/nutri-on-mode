
-- Add slot column to allow multiple workouts per day
ALTER TABLE public.workout_schedule ADD COLUMN IF NOT EXISTS slot integer NOT NULL DEFAULT 1;

-- Drop old unique constraint on (user_id, day_of_week)
DO $$
BEGIN
  -- Try dropping by known constraint names
  BEGIN
    ALTER TABLE public.workout_schedule DROP CONSTRAINT IF EXISTS workout_schedule_user_id_day_of_week_key;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
  BEGIN
    ALTER TABLE public.workout_schedule DROP CONSTRAINT IF EXISTS unique_user_day;
  EXCEPTION WHEN undefined_object THEN NULL;
  END;
END $$;

-- Also drop any unique index that might exist
DROP INDEX IF EXISTS workout_schedule_user_id_day_of_week_key;
DROP INDEX IF EXISTS unique_user_day;
DROP INDEX IF EXISTS idx_workout_schedule_user_day;

-- Create new unique constraint on (user_id, day_of_week, slot)
ALTER TABLE public.workout_schedule ADD CONSTRAINT workout_schedule_user_day_slot_key UNIQUE (user_id, day_of_week, slot);
