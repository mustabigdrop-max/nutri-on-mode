import { useEffect, useState } from "react";
import { MessageCircle, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const AMBER = "#EF9F27";
const TEAL = "#5DCAA5";
const TEXT = "#e8f0ff";
const DIM = "#9aa5b8";

interface Row {
  id: string;
  user_id: string;
  exercise_name: string;
  day_label: string | null;
  question: string;
  answer: string | null;
  status: string;
  created_at: string;
}

export function ExerciseQuestionsInbox() {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("exercise_questions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);
    const list = ((data as any[]) || []) as Row[];
    setRows(list);
    const ids = Array.from(new Set(list.map((r) => r.user_id)));
    if (ids.length) {
      const { data: profs } = await supabase.from("profiles").select("id, full_name").in("id", ids);
      const map: Record<string, string> = {};
      ((profs as any[]) || []).forEach((p) => (map[p.id] = p.full_name || "Cliente"));
      setNames(map);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const suggest = async (r: Row) => {
    setBusy(r.id);
    try {
      const { data, error } = await supabase.functions.invoke("exercise-guide", {
        body: {
          mode: "answer",
          exercise_name: r.exercise_name,
          day_label: r.day_label,
          question: r.question,
          client_name: names[r.user_id] || "aluno",
        },
      });
      if (error) throw new Error(error.message);
      setDrafts((d) => ({ ...d, [r.id]: String((data as any)?.answer || "") }));
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível sugerir uma resposta.");
    } finally {
      setBusy(null);
    }
  };

  const send = async (r: Row) => {
    const text = (drafts[r.id] || "").trim();
    if (text.length < 3) return;
    setBusy(r.id);
    const { error } = await supabase
      .from("exercise_questions")
      .update({ answer: text, status: "respondida", answered_at: new Date().toISOString() })
      .eq("id", r.id);
    setBusy(null);
    if (error) {
      toast.error("Não foi possível enviar a resposta.");
      return;
    }
    toast.success("Resposta enviada ao cliente.");
    setDrafts((d) => ({ ...d, [r.id]: "" }));
    load();
  };

  if (loading) {
    return (
      <div style={{ display: "flex", gap: 8, alignItems: "center", color: DIM, fontSize: 13 }}>
        <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} /> Carregando dúvidas...
      </div>
    );
  }

  if (!rows.length) {
    return <div style={{ color: DIM, fontSize: 13 }}>Nenhuma dúvida de exercício recebida ainda.</div>;
  }

  return (
    <div style={{ display: "grid", gap: 10 }}>
      {rows.map((r) => (
        <div
          key={r.id}
          style={{
            background: "rgba(255,255,255,0.03)",
            border: `1px solid ${r.answer ? "rgba(93,202,165,0.25)" : "rgba(239,159,39,0.30)"}`,
            borderRadius: 8,
            padding: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6, color: AMBER, fontSize: 10, fontWeight: 700 }}>
            <MessageCircle style={{ width: 12, height: 12 }} /> DÚVIDA DO CLIENTE
          </div>
          <div style={{ fontSize: 12, color: DIM, marginTop: 4 }}>
            {[names[r.user_id] || "Cliente", r.day_label, r.exercise_name].filter(Boolean).join(" · ")}
          </div>
          <div style={{ fontSize: 14, color: TEXT, marginTop: 6, lineHeight: 1.5 }}>{r.question}</div>

          {r.answer ? (
            <div style={{ marginTop: 8, fontSize: 14, color: TEAL, lineHeight: 1.5 }}>→ {r.answer}</div>
          ) : (
            <>
              <textarea
                value={drafts[r.id] || ""}
                onChange={(e) => setDrafts((d) => ({ ...d, [r.id]: e.target.value }))}
                rows={3}
                placeholder="Escreva a resposta..."
                style={{
                  width: "100%",
                  marginTop: 8,
                  background: "rgba(0,0,0,0.35)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: TEXT,
                  fontSize: 14,
                  padding: 10,
                }}
              />
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => suggest(r)}
                  disabled={busy === r.id}
                  style={{
                    minHeight: 40,
                    padding: "0 14px",
                    borderRadius: 8,
                    border: `1px solid ${TEAL}66`,
                    background: "transparent",
                    color: TEAL,
                    fontSize: 13,
                    fontWeight: 600,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Sparkles style={{ width: 14, height: 14 }} /> Sugerir
                </button>
                <button
                  type="button"
                  onClick={() => send(r)}
                  disabled={busy === r.id || (drafts[r.id] || "").trim().length < 3}
                  style={{
                    minHeight: 40,
                    padding: "0 16px",
                    borderRadius: 8,
                    border: "none",
                    background: AMBER,
                    color: "#0A0A0A",
                    fontWeight: 700,
                    fontSize: 13,
                    opacity: busy === r.id || (drafts[r.id] || "").trim().length < 3 ? 0.5 : 1,
                  }}
                >
                  Enviar
                </button>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
}
