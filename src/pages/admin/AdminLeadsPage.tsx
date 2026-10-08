import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { DIOGO_WHATSAPP } from "@/pages/AnaliseGratuitaPage";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", amber: "#EF9F27", green: "#5DCAA5", red: "#EF4444", muted: "#888", text: "#F5F0E8",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const STATUS = [["novo", "Novo", T.cyan], ["chamado", "Chamado", T.amber], ["fechado", "Fechado", T.green]] as const;
const input: React.CSSProperties = { background: T.s2, border: "1px solid #ffffff14", color: T.text, padding: 10, fontSize: 13, borderRadius: 0 };

export default function AdminLeadsPage() {
  const [allowed, setAllowed] = useState<boolean | null>(null); const [leads, setLeads] = useState<any[]>([]);
  const [q, setQ] = useState(""); const [filtro, setFiltro] = useState("todos");

  useEffect(() => { (async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return setAllowed(false);
    const { data } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    setAllowed(!!data);
    if (data) { const { data: l } = await supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(500); setLeads(l ?? []); }
  })(); }, []);

  if (allowed === false) return <Navigate to="/dashboard" replace />;
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("leads").update({ status }).eq("id", id);
    if (error) return toast.error("Não foi possível mudar o status");
    setLeads(ls => ls.map(l => l.id === id ? { ...l, status } : l));
  };
  const term = q.trim().toLowerCase();
  const shown = leads.filter(l => (filtro === "todos" || l.status === filtro) && (!term || [l.nome, l.arroba, l.nicho, l.desafio, l.rede].some(v => String(v).toLowerCase().includes(term))));

  return <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: 24 }}>
    <div style={{ maxWidth: 1100, margin: "0 auto" }}>
      <div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan, letterSpacing: 2 }}>SOCIAL ON · ADMIN</div>
      <h1 style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 30, margin: "4px 0 16px" }}>LEADS · ANÁLISE GRATUITA</h1>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
        <input style={{ ...input, flex: 1, minWidth: 220 }} placeholder="Buscar por nome, @, nicho, desafio..." value={q} onChange={e => setQ(e.target.value)} />
        {[["todos", "Todos", T.text] as const, ...STATUS].map(([v, l, c]) => <button key={v} onClick={() => setFiltro(v)} style={{ ...input, cursor: "pointer", fontFamily: T.fm, fontSize: 11,
          color: filtro === v ? c : T.muted, border: `1px solid ${filtro === v ? c : "#ffffff14"}` }}>{l} ({v === "todos" ? leads.length : leads.filter(x => x.status === v).length})</button>)}
      </div>
      {allowed === null ? <p style={{ color: T.muted }}>Carregando...</p> : shown.length === 0 ? <p style={{ color: T.muted }}>Nenhum lead encontrado.</p> :
        shown.map(l => { const st = STATUS.find(s => s[0] === l.status)!;
          return <div key={l.id} style={{ background: T.s1, border: "1px solid #ffffff10", borderLeft: `3px solid ${st[2]}`, padding: 14, marginBottom: 8, display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
            <div>
              <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 18 }}>{l.nome} <span style={{ color: T.cyan, fontSize: 14 }}>@{l.arroba}</span>
                <span style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, marginLeft: 8 }}>{l.rede} · {Number(l.seguidores).toLocaleString("pt-BR")} seguidores · {new Date(l.created_at).toLocaleString("pt-BR")}</span></div>
              <p style={{ fontSize: 12, margin: "4px 0", color: T.muted }}>Nicho: {l.nicho}</p>
              <p style={{ fontSize: 13, margin: "4px 0" }}>Desafio: {l.desafio}</p>
              <p style={{ fontFamily: T.fm, fontSize: 11, margin: "4px 0 0" }}>Nota {l.nota ?? "—"}/10 {(l.pilares ?? []).map((p: any) => ` · ${p.pilar} ${p.nota}`).join("")}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
              <select value={l.status} onChange={e => setStatus(l.id, e.target.value)} style={{ ...input, color: st[2] }}>{STATUS.map(([v, lb]) => <option key={v} value={v}>{lb}</option>)}</select>
              <a href={`https://www.instagram.com/${encodeURIComponent(l.arroba)}`} target="_blank" rel="noopener noreferrer" style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan }}>VER PERFIL</a>
            </div>
          </div>; })}
      <p style={{ fontFamily: T.fm, fontSize: 10, color: T.muted, marginTop: 16 }}>Página pública: /analise-gratuita{DIOGO_WHATSAPP.includes("00000") ? " · WhatsApp ainda sem número real" : ""}</p>
    </div>
  </div>;
}
