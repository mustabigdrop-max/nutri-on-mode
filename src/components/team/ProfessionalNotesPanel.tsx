import { useCallback, useEffect, useState } from "react";
import { Loader2, Send } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  ROLE_META, VISIBILITY_OPTIONS, isProfessionalRole, type ProfessionalRole,
} from "@/lib/professionalScopes";

const CYAN = "#00D4FF";

interface Note {
  id: string;
  author_id: string;
  author_role: string;
  content: string;
  visibility: string;
  created_at: string;
  author_name?: string;
}

interface Props {
  patientId: string;
  myRole: ProfessionalRole | null;
  readOnly?: boolean;
}

const ProfessionalNotesPanel = ({ patientId, myRole, readOnly }: Props) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [visibility, setVisibility] = useState("all");
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("professional_notes")
      .select("*")
      .eq("patient_id", patientId)
      .order("created_at", { ascending: false })
      .limit(80);
    const rows = (data || []) as any as Note[];
    const ids = Array.from(new Set(rows.map((r) => r.author_id)));
    const { data: profs } = ids.length
      ? await supabase.from("profiles").select("user_id, full_name, email").in("user_id", ids)
      : { data: [] as any[] };
    const byId = new Map((profs || []).map((p: any) => [p.user_id, p]));
    setNotes(rows.map((r) => ({ ...r, author_name: byId.get(r.author_id)?.full_name || byId.get(r.author_id)?.email || "Profissional" })));
    setLoading(false);
  }, [patientId]);

  useEffect(() => { load(); }, [load]);

  const submit = async () => {
    if (!content.trim() || !user || !myRole) return;
    setSending(true);
    const { error } = await supabase.from("professional_notes").insert({
      patient_id: patientId,
      author_id: user.id,
      author_role: myRole,
      content: content.trim(),
      visibility,
    } as any);
    setSending(false);
    if (error) { toast.error("Não foi possível salvar a nota"); return; }
    setContent("");
    toast.success("Nota registrada");
    load();
  };

  return (
    <div className="space-y-3">
      {loading && <p className="text-muted-foreground" style={{ fontSize: 13 }}>Carregando notas…</p>}

      {notes.map((n) => {
        const meta = isProfessionalRole(n.author_role) ? ROLE_META[n.author_role] : null;
        const color = meta?.color || "#8892a6";
        return (
          <div key={n.id} className="p-3" style={{ border: `1px solid ${color}33`, background: `${color}08` }}>
            <div className="flex flex-wrap items-center gap-2" style={{ fontSize: 11, color }}>
              <span>{meta?.emoji} {n.author_name}</span>
              {meta && <span style={{ opacity: 0.75 }}>({meta.short})</span>}
              <span className="text-muted-foreground">
                · {new Date(n.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}
              </span>
            </div>
            <div className="text-muted-foreground italic" style={{ fontSize: 11 }}>
              Visível para: {VISIBILITY_OPTIONS.find((v) => v.value === n.visibility)?.label ?? n.visibility}
            </div>
            <p className="text-foreground mt-2 whitespace-pre-wrap" style={{ fontSize: 13, lineHeight: 1.5 }}>{n.content}</p>
          </div>
        );
      })}

      {!notes.length && !loading && (
        <p className="text-muted-foreground" style={{ fontSize: 13 }}>Nenhuma nota compartilhada ainda.</p>
      )}

      {!readOnly && myRole && (
        <div className="p-3 space-y-2" style={{ border: `1px solid ${CYAN}33` }}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={3}
            placeholder="Escrever nota para a equipe…"
            className="w-full bg-transparent text-foreground"
            style={{ fontSize: 13, outline: "none", resize: "vertical" }}
          />
          <div className="flex items-center gap-2">
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="bg-transparent text-foreground px-2 py-1"
              style={{ border: `1px solid ${CYAN}33`, fontSize: 12 }}
            >
              {VISIBILITY_OPTIONS.map((v) => (
                <option key={v.value} value={v.value} style={{ background: "#07070f" }}>Visível: {v.label}</option>
              ))}
            </select>
            <button
              onClick={submit}
              disabled={sending || !content.trim()}
              className="ml-auto flex items-center gap-2 px-4 py-2 disabled:opacity-50"
              style={{ background: CYAN, color: "#020205", fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 13 }}
            >
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              ENVIAR
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfessionalNotesPanel;
