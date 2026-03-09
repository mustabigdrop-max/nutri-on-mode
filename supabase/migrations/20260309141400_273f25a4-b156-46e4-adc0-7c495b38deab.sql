
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, trial_ends_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN (NEW.raw_user_meta_data->>'is_trial')::boolean = true
      THEN now() + interval '7 days'
      ELSE NULL
    END
  );
  RETURN NEW;
END;
$function$;
