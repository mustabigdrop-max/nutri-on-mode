import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

// Número de WhatsApp do Diogo (só dígitos, com DDI 55). Substituir pelo número real.
export const DIOGO_WHATSAPP = "5500000000000";

const T = { bg: "#020205", s1: "#0A0A0F", s2: "#111118", cyan: "#00D4FF", gold: "#B8922A", amber: "#EF9F27", green: "#5DCAA5", red: "#EF4444", purple: "#AFA9EC", muted: "#888", text: "#F5F0E8",
  ft: "'Rajdhani',sans-serif", fm: "'Space Mono',monospace" };
const label: React.CSSProperties = { fontFamily: T.fm, fontSize: 10, letterSpacing: 1, color: T.muted, margin: "14px 0 6px", display: "block" };
const input: React.CSSProperties = { width: "100%", background: T.s2, border: "1px solid #ffffff14", color: T.text, padding: 12, fontSize: 14, borderRadius: 0, boxSizing: "border-box" };
const color = (n: number) => n >= 8 ? T.green : n >= 4 ? T.amber : T.red;
const REDES = [["instagram", "Instagram"], ["tiktok", "TikTok"], ["youtube", "YouTube"], ["outra", "Outra"]];

export default function AnaliseGratuitaPage() {
  const [f, setF] = useState({ nome: "", arroba: "", rede: "instagram", nicho: "", seguidores: "", desafio: "" });
  const [aceite, setAceite] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState(""); const [res, setRes] = useState<any>(null);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF(x => ({ ...x, [k]: e.target.value }));
  const ok = f.nome.trim() && f.arroba.trim() && f.nicho.trim() && f.seguidores !== "" && f.desafio.trim() && aceite;

  const enviar = async () => {
    setBusy(true); setErr("");
    const { data, error } = await supabase.functions.invoke("analise-perfil", { body: { ...f, seguidores: Number(f.seguidores), aceite } });
    setBusy(false);
    const msg = (data as any)?.error ?? (error ? (await (error as any).context?.json?.().catch(() => null))?.error ?? "Falha na análise. Tente de novo." : null);
    if (msg) return setErr(msg);
    setRes(data); window.scrollTo({ top: 0 });
  };

  const whatsapp = () => {
    const linhas = [`Olá, Diogo! Fiz a Análise Gratuita de Perfil e quero o plano completo.`, ``, `Nome: ${f.nome}`, `Perfil: @${f.arroba.replace(/^@/, "")} (${f.rede})`, `Nicho: ${f.nicho}`, `Seguidores: ${f.seguidores}`, `Maior desafio: ${f.desafio}`, ``,
      `Nota geral: ${res.nota}/10`, ...res.pilares.map((p: any) => `${p.pilar}: ${p.nota}/10`)];
    window.open(`https://wa.me/${DIOGO_WHATSAPP}?text=${encodeURIComponent(linhas.join("\n"))}`, "_blank", "noopener");
  };

  return <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "32px 16px" }}>
    <div style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ fontFamily: T.fm, fontSize: 10, color: T.cyan, letterSpacing: 2 }}>SOCIAL ON · COACH DIOGO MELLO</div>
      <h1 style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 36, margin: "6px 0 4px", letterSpacing: 1 }}>ANÁLISE GRATUITA DE PERFIL</h1>
      <p style={{ color: T.muted, fontSize: 13, margin: 0 }}>6 perguntas. Nota de 0 a 10 em Atenção, Conteúdo e CTA. Transformação é sistema.</p>

      {!res ? <div style={{ background: T.s1, border: "1px solid #ffffff10", padding: 20, marginTop: 20 }}>
        <label style={label}>1. SEU NOME</label><input style={input} maxLength={100} value={f.nome} onChange={set("nome")} />
        <label style={label}>2. SEU @ NA REDE</label><input style={input} maxLength={60} value={f.arroba} onChange={set("arroba")} placeholder="@seuperfil" />
        <label style={label}>3. REDE PRINCIPAL</label>
        <select style={input} value={f.rede} onChange={set("rede")}>{REDES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
        <label style={label}>4. NICHO</label><input style={input} maxLength={120} value={f.nicho} onChange={set("nicho")} placeholder="Ex: emagrecimento feminino" />
        <label style={label}>5. SEGUIDORES ATUAIS</label><input style={input} type="number" min={0} value={f.seguidores} onChange={set("seguidores")} />
        <label style={label}>6. MAIOR DESAFIO HOJE</label><textarea style={{ ...input, minHeight: 90 }} maxLength={600} value={f.desafio} onChange={set("desafio")} />
        <label style={{ display: "flex", gap: 8, alignItems: "flex-start", fontSize: 12, color: T.muted, marginTop: 16, cursor: "pointer" }}>
          <input type="checkbox" checked={aceite} onChange={e => setAceite(e.target.checked)} style={{ accentColor: T.cyan, marginTop: 2 }} />
          Aceito que meus dados sejam usados para gerar esta análise e para o Diogo entrar em contato comigo.
        </label>
        {err && <p role="alert" style={{ color: T.red, fontSize: 13, marginTop: 12 }}>{err}</p>}
        <button onClick={enviar} disabled={!ok || busy} style={{ marginTop: 18, width: "100%", padding: 16, border: "none", borderRadius: 0, fontFamily: T.ft, fontWeight: 700, fontSize: 18, letterSpacing: 1,
          background: ok ? T.cyan : T.s2, color: ok ? T.bg : T.muted, cursor: ok && !busy ? "pointer" : "not-allowed" }}>{busy ? "ANALISANDO SEU PERFIL..." : "VER MINHA NOTA"}</button>
      </div> : <>
        <div style={{ background: T.s1, border: "1px solid #ffffff10", padding: 20, marginTop: 20, textAlign: "center" }}>
          <div style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>NOTA GERAL · @{f.arroba.replace(/^@/, "")}</div>
          <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 64, color: color(res.nota), filter: `drop-shadow(0 0 12px ${color(res.nota)}66)` }}>{res.nota}</div>
          <p style={{ fontSize: 11, color: T.muted, margin: 0 }}>Estimativa a partir das suas respostas, sem acesso ao seu perfil.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6, marginTop: 16 }}>
            {res.pilares.map((p: any) => <div key={p.pilar} style={{ background: T.s2, padding: 10, borderTop: `3px solid ${color(p.nota)}` }}>
              <div style={{ fontFamily: T.fm, fontSize: 10, color: T.muted }}>{p.pilar.toUpperCase()}</div>
              <div style={{ fontFamily: T.ft, fontSize: 26, fontWeight: 700, color: color(p.nota) }}>{p.nota}</div></div>)}
          </div>
        </div>
        {res.pilares.map((p: any) => <div key={p.pilar} style={{ background: T.s1, border: `1px solid ${p.liberado ? T.cyan + "55" : "#ffffff10"}`, padding: 16, marginTop: 10 }}>
          <div style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 18 }}>{p.pilar} <span style={{ color: color(p.nota) }}>{p.nota}/10</span>
            <span style={{ fontFamily: T.fm, fontSize: 9, marginLeft: 8, color: p.liberado ? T.cyan : T.muted }}>{p.liberado ? "CORREÇÃO LIBERADA" : "🔒 BLOQUEADO"}</span></div>
          {p.diagnostico && <p style={{ fontSize: 13, color: T.muted, margin: "6px 0" }}>{p.diagnostico}</p>}
          {p.liberado ? <ol style={{ margin: "8px 0 0", paddingLeft: 18, fontSize: 14, lineHeight: 1.5 }}>{p.correcao.map((c: string, i: number) => <li key={i}>{c}</li>)}</ol>
            : <p style={{ fontFamily: T.ft, fontWeight: 700, fontSize: 15, color: T.gold, margin: "8px 0 0" }}>Quer o plano completo? Fale com o Diogo</p>}
        </div>)}
        <button onClick={whatsapp} style={{ marginTop: 16, width: "100%", padding: 16, border: "none", borderRadius: 0, background: T.green, color: T.bg, fontFamily: T.ft, fontWeight: 700, fontSize: 18, letterSpacing: 1, cursor: "pointer" }}>
          FALAR COM O DIOGO NO WHATSAPP</button>
      </>}
    </div>
  </div>;
}
