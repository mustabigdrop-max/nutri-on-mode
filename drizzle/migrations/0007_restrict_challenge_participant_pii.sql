-- Ranking sem PII: função segura que expõe apenas nome, score, streak e tier
CREATE OR REPLACE FUNCTION public.challenge_leaderboard(_challenge_id uuid)
RETURNS TABLE (
  id uuid,
  user_id uuid,
  full_name text,
  mce_score integer,
  streak integer,
  tier text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT cp.id, cp.user_id, cp.full_name, cp.mce_score, cp.streak, cp.tier
  FROM public.challenge_participants cp
  WHERE cp.challenge_id = _challenge_id
    AND cp.status = 'active'
    AND (
      EXISTS (
        SELECT 1 FROM public.challenge_participants me
        WHERE me.challenge_id = _challenge_id
          AND me.user_id = auth.uid()
      )
      OR public.is_challenge_coach(_challenge_id, auth.uid())
    )
  ORDER BY cp.mce_score DESC NULLS LAST, cp.streak DESC NULLS LAST
  LIMIT 200;
$$;

GRANT EXECUTE ON FUNCTION public.challenge_leaderboard(uuid) TO authenticated;

-- Leitura direta da tabela passa a ser apenas do próprio registro ou do coach do desafio
DROP POLICY IF EXISTS participants_select_own_or_same_challenge ON public.challenge_participants;

CREATE POLICY participants_select_own_or_coach
ON public.challenge_participants
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR public.is_challenge_coach(challenge_id, auth.uid()));

COMMENT ON POLICY participants_select_own_or_coach ON public.challenge_participants IS
  'PII (email/whatsapp/macros) visivel apenas ao proprio participante e ao coach; ranking usa challenge_leaderboard().';
