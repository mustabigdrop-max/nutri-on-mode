import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface CommunityGroup {
  id: string;
  name: string;
  description: string | null;
  goal_type: string;
  emoji: string;
  member_count: number;
}

export interface CommunityMessage {
  id: string;
  group_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

export const useCommunity = () => {
  const { user } = useAuth();
  const [groups, setGroups] = useState<CommunityGroup[]>([]);
  const [myGroupIds, setMyGroupIds] = useState<string[]>([]);
  const [messages, setMessages] = useState<CommunityMessage[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchGroups = async () => {
    const { data } = await supabase
      .from("community_groups")
      .select("*")
      .order("created_at");
    setGroups((data as CommunityGroup[]) ?? []);
  };

  const fetchMemberships = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("community_memberships")
      .select("group_id")
      .eq("user_id", user.id);
    setMyGroupIds((data ?? []).map((d: any) => d.group_id));
    setLoading(false);
  };

  const fetchMessages = async (groupId: string) => {
    const { data } = await supabase
      .from("community_messages")
      .select("*")
      .eq("group_id", groupId)
      .order("created_at", { ascending: true })
      .limit(50);
    setMessages((data as CommunityMessage[]) ?? []);
  };

  useEffect(() => {
    fetchGroups();
    fetchMemberships();
  }, [user]);

  useEffect(() => {
    if (activeGroupId) {
      fetchMessages(activeGroupId);
      // Realtime subscription
      const channel = supabase
        .channel(`group-${activeGroupId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "community_messages",
            filter: `group_id=eq.${activeGroupId}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as CommunityMessage]);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeGroupId]);

  const joinGroup = async (groupId: string) => {
    if (!user) return;
    const { error } = await supabase
      .from("community_memberships")
      .insert({ user_id: user.id, group_id: groupId });
    if (!error) {
      setMyGroupIds((prev) => [...prev, groupId]);
      // Update member count
      await supabase
        .from("community_groups")
        .update({ member_count: (groups.find((g) => g.id === groupId)?.member_count ?? 0) + 1 })
        .eq("id", groupId);
      await fetchGroups();
    }
  };

  const leaveGroup = async (groupId: string) => {
    if (!user) return;
    await supabase
      .from("community_memberships")
      .delete()
      .eq("user_id", user.id)
      .eq("group_id", groupId);
    setMyGroupIds((prev) => prev.filter((id) => id !== groupId));
    await fetchGroups();
  };

  const sendMessage = async (groupId: string, content: string) => {
    if (!user) return;
    await supabase.from("community_messages").insert({
      group_id: groupId,
      user_id: user.id,
      content,
    });
  };

  return {
    groups,
    myGroupIds,
    messages,
    activeGroupId,
    setActiveGroupId,
    loading,
    joinGroup,
    leaveGroup,
    sendMessage,
  };
};
