import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

async function dados() {
  const { data: s } = await supabase.auth.getSession(); const u = s.session?.user?.id;
  if (!u) return { rev: 0, prox: null as string | null };
  const [{ count }, { data: caps }, { data: pr }] = await Promise.all([
    supabase.from("flashcard_state").select("id", { count: "exact", head: true }).eq("user_id", u).lte("due_at", new Date().toISOString()),
    supabase.from("academy_chapters").select("slug,titulo,ordem").eq("status", "publicado").order("ordem"),
    supabase.from("chapter_progress").select("chapter_slug,concluido").eq("user_id", u),
  ]);
  const feitos = new Set((pr ?? []).filter((p: any) => p.concluido).map((p: any) => p.chapter_slug));
  return { rev: count ?? 0, prox: (caps ?? []).find((c: any) => !feitos.has(c.slug))?.titulo ?? null };
}

/** Revisões vencidas (contador da barra SIGNAL). Recarrega quando a Biblioteca fecha. */
export function useRevisoesHoje(dep: unknown) {
  const [n, setN] = useState(0);
  useEffect(() => { void dados().then(d => setN(d.rev)); }, [dep]);
  return n;
}

export function EstudoHojeCard({ onAbrir, dep }: { onAbrir: () => void; dep: unknown }) {
  const [d, setD] = useState<{ rev: number; prox: string | null } | null>(null);
  useEffect(() => { void dados().then(setD); }, [dep]);
  if (!d) return null;
  return <div style={{ border: "1px solid #B8922A66", background: "#07070dcc", padding: 12, marginBottom: 10, display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
    <div style={{ flex: 1, minWidth: 180 }}>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 9, letterSpacing: 2, color: "#B8922A" }}>ESTUDO DE HOJE</div>
      <div style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 16, color: "#F5F0E8" }}>{d.prox ?? "Todos os capítulos publicados concluídos"}</div>
      <div style={{ fontFamily: "'Space Mono',monospace", fontSize: 10, color: d.rev ? "#EF9F27" : "#888" }}>Revisões de hoje: {d.rev}</div>
    </div>
    <button type="button" onClick={onAbrir} style={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1, padding: "8px 12px", cursor: "pointer", border: "1px solid #B8922A", background: "#B8922A", color: "#0A0A0A" }}>ABRIR BIBLIOTECA</button>
  </div>;
}
