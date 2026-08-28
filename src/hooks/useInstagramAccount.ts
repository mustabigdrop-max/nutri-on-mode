import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type InstagramMedia = {
  id: string;
  caption: string | null;
  media_type: string | null;
  media_url: string | null;
  permalink: string | null;
  timestamp: string | null;
  like_count: number | null;
  comments_count: number | null;
};

export type InstagramAccount = {
  ig_user_id: string;
  username: string | null;
  full_name: string | null;
  biography: string | null;
  profile_picture_url: string | null;
  followers_count: number | null;
  follows_count: number | null;
  media_count: number | null;
  recent_media: InstagramMedia[] | null;
  synced_at: string | null;
  token_expires_at: string | null;
  connected_at: string | null;
  source?: string | null;
};

export type InstagramExtracted = {
  full_name: string | null;
  username: string | null;
  biography: string | null;
  followers_count: number | null;
  follows_count: number | null;
  media_count: number | null;
};

const callIg = async <T,>(payload: Record<string, unknown>): Promise<T> => {
  const { data, error } = await supabase.functions.invoke("instagram-publish", { body: payload });
  if (error) throw new Error(error.message);
  if ((data as { error?: string })?.error) throw new Error((data as { error: string }).error);
  return (data as { result: T }).result;
};

export const useInstagramAccount = (enabled = true) => {
  const [account, setAccount] = useState<InstagramAccount | null>(null);
  const [loading, setLoading] = useState(enabled);

  const refresh = useCallback(async () => {
    try {
      const st = await callIg<{ connected: boolean; account: InstagramAccount | null }>({ action: "status" });
      setAccount(st.connected ? st.account : null);
    } catch {
      setAccount(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    refresh();
  }, [enabled, refresh]);

  const connect = useCallback(async (accessToken: string) => {
    const res = await callIg<{ account: InstagramAccount }>({ action: "connect", access_token: accessToken.trim() });
    setAccount(res.account);
    return res.account;
  }, []);

  /** Lê um print do perfil e devolve os dados extraídos (sem salvar). */
  const analyzeScreenshot = useCallback(async (imageDataUrl: string) => {
    const res = await callIg<{ extracted: InstagramExtracted }>({ action: "analyze_screenshot", image: imageDataUrl });
    return res.extracted;
  }, []);

  /** Salva o perfil confirmado pelo usuário (conexão por screenshot). */
  const connectManual = useCallback(async (data: InstagramExtracted) => {
    const res = await callIg<{ account: InstagramAccount }>({ action: "connect_manual", ...data });
    setAccount(res.account);
    return res.account;
  }, []);



  const sync = useCallback(async () => {
    const res = await callIg<{ account: InstagramAccount }>({ action: "sync_profile" });
    setAccount(res.account);
    return res.account;
  }, []);

  const disconnect = useCallback(async () => {
    await callIg({ action: "disconnect" });
    setAccount(null);
  }, []);

  return { account, loading, refresh, connect, sync, disconnect };
};

export default useInstagramAccount;
