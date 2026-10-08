import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const C = { cyan: "#00D4FF", gold: "#B8922A", red: "#EF4444", text: "#C8C8D8", white: "#F0F0F8", muted: "#555566", dim: "#333340" };
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace" };
const inp: React.CSSProperties = { background: "#0A0A12", border: `1px solid ${C.dim}`, color: C.white, fontFamily: F.m, fontSize: 11, padding: "6px 8px", borderRadius: 0 };
const small = (c: string): React.CSSProperties => ({ background: "transparent", border: `1px solid ${c}60`, color: c, fontFamily: F.t, fontWeight: 700, fontSize: 11, padding: "5px 10px", cursor: "pointer", borderRadius: 0 });
const lbl: React.CSSProperties = { fontFamily: F.m, fontSize: 9, letterSpacing: 2, color: C.muted, textTransform: "uppercase" };
const TIPO: Record<string, string> = { diario: "DIÁRIO", semanal: "SEMANAL", calibracao: "CALIBRAÇÃO" };
const STATUS: Record<string, string> = { ok: C.cyan, erro: C.red, pulado: C.gold };

function Briefing({ b }: { b: any }) {
  const c = b.conteudo ?? {};
  const line = (k: string, v: any) => v ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.text, lineHeight: 1.5 }}><span style={{ color: C.cyan }}>{k}:</span> {v}</div> : null;
  if (b.tipo === "semanal") return <>
    {line("REELS", `${c.reels_semana ?? 0} gerados · ${c.com_resultado ?? 0} com resultado`)}
    {line("O QUE RETEVE", c.o_que_reteve ? `${c.o_que_reteve.tema} · ${c.o_que_reteve.pct_3s ?? "—"}% nos 3s` : "sem resultado lançado")}
    {line("O QUE CORTAR", c.o_que_cortar?.texto ?? "sem dados suficientes")}
    {line("PLANO 90 DIAS", c.meta ? `${c.meta.atual}/${c.meta.esperado} esperado no dia ${c.meta.dia} · ${c.meta.ajuste_plano}` : "sem meta definida")}
    {c.alerta && <div style={{ fontFamily: F.m, fontSize: 10, color: C.red, marginTop: 4 }}>⚠ {c.alerta.texto} {c.alerta.acao}</div>}
  </>;
  const r = c.revisao_ontem;
  return <>
    {line("ONTEM", r ? `${r.tema} · prevista ${r.nota_prevista ?? "—"} · ${r.pct_3s ?? "—"}% nos 3s${r.pendente ? ` · ${r.pendente}` : ""}` : "nenhum reel ontem")}
    {line("AÇÃO DO DIA", c.acao_do_dia ? `${c.acao_do_dia.texto}${c.acao_do_dia.horario ? ` · ${c.acao_do_dia.horario}` : " · horário não definido no Planner"}` : null)}
    {line("RECICLAGEM", c.reciclagem ? `${c.reciclagem.tema} · ${c.reciclagem.texto}` : "nenhum candidato ainda")}
    {line("TENDÊNCIA", c.tendencia ?? c.tendencia_nota)}
  </>;
}

export default function CommandCenterAutomation({ onChanged }: { onChanged?: () => void }) {
  const [cfg, setCfg] = useState<any>(null);
  const [form, setForm] = useState({ hora: 7, pausado: false, limite_diario: 1 });
  const [runs, setRuns] = useState<any[]>([]);
  const [briefs, setBriefs] = useState<any[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const [s, r, b] = await Promise.all([
      supabase.from("cc_automation_settings").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("cc_automation_runs").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      supabase.from("cc_briefings").select("*").eq("user_id", user.id).eq("status", "pronto_para_revisar").order("data", { ascending: false }).limit(5),
    ]);
    setCfg(s.data); if (s.data) setForm({ hora: s.data.hora, pausado: s.data.pausado, limite_diario: s.data.limite_diario });
    setRuns(r.data ?? []); setBriefs(b.data ?? []);
  };
  useEffect(() => { load(); }, []);

  const salvar = async () => {
    const { data: { user } } = await supabase.auth.getUser(); if (!user) return;
    const { error } = await supabase.from("cc_automation_settings").upsert({ user_id: user.id, ...form, updated_at: new Date().toISOString() });
    if (error) return toast.error(error.message);
    toast.success(cfg ? "Automação atualizada" : "Automação ativada"); load();
  };
  const revisar = async (id: string, status: "aprovado" | "descartado") => {
    const { error } = await supabase.from("cc_briefings").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load(); onChanged?.();
  };

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ ...lbl, color: C.cyan }}>AUTOMAÇÃO DIÁRIA</div>
        <span style={{ fontFamily: F.m, fontSize: 9, color: !cfg ? C.muted : cfg.pausado ? C.gold : C.cyan }}>
          {!cfg ? "DESLIGADA" : cfg.pausado ? "PAUSADA" : `ATIVA · ${String(cfg.hora).padStart(2, "0")}:00 BRASÍLIA`}
        </span>
      </div>

      {briefs.map(b => (
        <div key={b.id} style={{ marginTop: 10, borderLeft: `2px solid ${C.gold}`, padding: "8px 10px", background: `${C.gold}0a` }}>
          <div style={{ ...lbl, color: C.gold }}>{b.tipo === "semanal" ? "REVISÃO DA SEMANA" : "BRIEFING SIGNAL"} · {new Date(`${b.data}T12:00:00`).toLocaleDateString("pt-BR")} · PRONTO PARA REVISAR</div>
          <div style={{ marginTop: 6, display: "flex", flexDirection: "column", gap: 3 }}><Briefing b={b} /></div>
          <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
            <button type="button" onClick={() => revisar(b.id, "aprovado")} style={small(C.cyan)}>APROVAR</button>
            <button type="button" onClick={() => revisar(b.id, "descartado")} style={small(C.muted)}>DESCARTAR</button>
          </div>
        </div>
      ))}

      <button type="button" onClick={() => setOpen(!open)} style={{ ...small(C.cyan), marginTop: 10 }}>{open ? "FECHAR CONFIGURAÇÃO" : "CONFIGURAR"}</button>
      {open && (
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, lineHeight: 1.5 }}>
            Todo dia, no horário escolhido, o reel é gerado a partir do tema do Planner e fica pronto para revisar. Aos domingos sai a revisão da semana. Nada é publicado sozinho.
          </div>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...lbl }}>HORÁRIO (BRASÍLIA)
            <select style={inp} value={form.hora} onChange={e => setForm(f => ({ ...f, hora: Number(e.target.value) }))}>
              {Array.from({ length: 24 }, (_, h) => <option key={h} value={h}>{String(h).padStart(2, "0")}:00</option>)}
            </select>
          </label>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...lbl }}>GERAÇÕES POR DIA (MÁX.)
            <select style={inp} value={form.limite_diario} onChange={e => setForm(f => ({ ...f, limite_diario: Number(e.target.value) }))}>
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", ...lbl }}>PAUSAR AUTOMAÇÃO
            <input type="checkbox" checked={form.pausado} onChange={e => setForm(f => ({ ...f, pausado: e.target.checked }))} />
          </label>
          <button type="button" onClick={salvar} style={{ background: C.gold, color: "#0A0A0A", border: "none", fontFamily: F.t, fontWeight: 700, fontSize: 13, padding: "10px 0", cursor: "pointer", borderRadius: 0 }}>
            {cfg ? "SALVAR" : "ATIVAR AUTOMAÇÃO"}
          </button>

          <div style={{ ...lbl, marginTop: 6 }}>HISTÓRICO DE EXECUÇÕES</div>
          {!runs.length ? <div style={{ fontFamily: F.m, fontSize: 10, color: C.muted }}>Nenhuma execução ainda.</div> : runs.map(r => (
            <div key={r.id} style={{ display: "grid", gridTemplateColumns: "92px 84px 1fr", gap: 6, fontFamily: F.m, fontSize: 9, color: C.text, borderBottom: `1px solid ${C.dim}`, padding: "4px 0" }}>
              <span>{new Date(r.created_at).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</span>
              <span style={{ color: STATUS[r.status] ?? C.text }}>{TIPO[r.tipo] ?? r.tipo} · {r.status.toUpperCase()}</span>
              <span style={{ color: C.muted }}>{r.erro ?? (r.tentativas > 1 ? `ok na 2ª tentativa` : "—")}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
