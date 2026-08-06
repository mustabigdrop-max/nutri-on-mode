import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  HybridProfile,
  loadProfile as loadLocalProfile,
  saveProfile as saveLocalProfile,
} from "@/lib/runonProfile";
import {
  RunOnProtocol,
  loadGeneratedProtocol,
  saveGeneratedProtocol,
} from "@/lib/runonProtocol";

const db = () => (supabase as any).from("runon_profiles");

/** Perfil/protocolo RunON por usuário (Supabase + cache local). */
export function useRunonProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<HybridProfile | null>(() => loadLocalProfile());
  const [protocol, setProtocol] = useState<RunOnProtocol | null>(() => loadGeneratedProtocol());
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    let active = true;
    if (!user) {
      setLoading(false);
      return;
    }
    (async () => {
      const { data, error } = await db()
        .select("profile, protocol")
        .eq("user_id", user.id)
        .maybeSingle();
      if (!active) return;
      if (!error && data) {
        if (data.profile && Object.keys(data.profile).length) {
          setProfile(data.profile as HybridProfile);
          saveLocalProfile(data.profile as HybridProfile);
        }
        if (data.protocol) {
          setProtocol(data.protocol as RunOnProtocol);
          saveGeneratedProtocol(data.protocol as RunOnProtocol);
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [user]);

  const persist = useCallback(
    async (next: { profile?: HybridProfile | null; protocol?: RunOnProtocol | null }) => {
      if (!user) return;
      setSyncing(true);
      try {
        await db().upsert(
          {
            user_id: user.id,
            ...(next.profile !== undefined ? { profile: next.profile ?? {} } : {}),
            ...(next.protocol !== undefined ? { protocol: next.protocol } : {}),
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id" },
        );
      } catch {
        /* mantém apenas cache local */
      } finally {
        setSyncing(false);
      }
    },
    [user],
  );

  const saveProfile = useCallback(
    (p: HybridProfile) => {
      setProfile(p);
      saveLocalProfile(p);
      void persist({ profile: p });
    },
    [persist],
  );

  const saveProtocol = useCallback(
    (pr: RunOnProtocol) => {
      setProtocol(pr);
      saveGeneratedProtocol(pr);
      void persist({ protocol: pr });
    },
    [persist],
  );

  return { profile, protocol, loading, syncing, saveProfile, saveProtocol, isSignedIn: !!user };
}
