import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
}

export interface SupportMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  sender_type: string;
  content: string;
  created_at: string;
}

export const useSupport = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [activeTicket, setActiveTicket] = useState<string | null>(null);
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTickets = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setTickets((data as SupportTicket[]) ?? []);
    setLoading(false);
  };

  const fetchMessages = async (ticketId: string) => {
    const { data } = await supabase
      .from("support_messages")
      .select("*")
      .eq("ticket_id", ticketId)
      .order("created_at");
    setMessages((data as SupportMessage[]) ?? []);
  };

  useEffect(() => { fetchTickets(); }, [user]);

  useEffect(() => {
    if (activeTicket) {
      fetchMessages(activeTicket);
      const channel = supabase
        .channel(`ticket-${activeTicket}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "support_messages",
            filter: `ticket_id=eq.${activeTicket}`,
          },
          (payload) => {
            setMessages((prev) => [...prev, payload.new as SupportMessage]);
          }
        )
        .subscribe();
      return () => { supabase.removeChannel(channel); };
    }
  }, [activeTicket]);

  const createTicket = async (subject: string, firstMessage: string) => {
    if (!user) return null;
    const { data: ticket, error } = await supabase
      .from("support_tickets")
      .insert({ user_id: user.id, subject })
      .select()
      .single();
    if (error || !ticket) return null;

    await supabase.from("support_messages").insert({
      ticket_id: (ticket as SupportTicket).id,
      user_id: user.id,
      sender_type: "user",
      content: firstMessage,
    });

    await fetchTickets();
    return (ticket as SupportTicket).id;
  };

  const sendMessage = async (ticketId: string, content: string) => {
    if (!user) return;
    await supabase.from("support_messages").insert({
      ticket_id: ticketId,
      user_id: user.id,
      sender_type: "user",
      content,
    });
  };

  return {
    tickets,
    activeTicket,
    setActiveTicket,
    messages,
    loading,
    createTicket,
    sendMessage,
    refetch: fetchTickets,
  };
};
