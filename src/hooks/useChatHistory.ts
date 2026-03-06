import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Msg = { role: "user" | "assistant"; content: string };

export const useChatHistory = () => {
  const { user } = useAuth();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  // Load or create conversation
  useEffect(() => {
    if (!user) return;
    const init = async () => {
      setLoadingHistory(true);
      // Get most recent conversation
      const { data: convs } = await supabase
        .from("conversations")
        .select("id")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1);

      let convId: string;
      if (convs && convs.length > 0) {
        convId = convs[0].id;
      } else {
        const { data: newConv } = await supabase
          .from("conversations")
          .insert({ user_id: user.id, title: "NutriCoach" })
          .select("id")
          .single();
        convId = newConv!.id;
      }
      setConversationId(convId);

      // Load messages
      const { data: msgs } = await supabase
        .from("chat_messages")
        .select("role, content")
        .eq("conversation_id", convId)
        .order("created_at", { ascending: true });

      if (msgs) setMessages(msgs as Msg[]);
      setLoadingHistory(false);
    };
    init();
  }, [user]);

  const saveMessage = useCallback(async (msg: Msg) => {
    if (!user || !conversationId) return;
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      user_id: user.id,
      role: msg.role,
      content: msg.content,
    });
    await supabase
      .from("conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversationId);
  }, [user, conversationId]);

  const startNewConversation = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("conversations")
      .insert({ user_id: user.id, title: "NutriCoach" })
      .select("id")
      .single();
    if (data) {
      setConversationId(data.id);
      setMessages([]);
    }
  }, [user]);

  return { messages, setMessages, conversationId, saveMessage, startNewConversation, loadingHistory };
};
