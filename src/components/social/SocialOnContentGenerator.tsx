import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { listBreakdownSessions, type BreakdownSession } from "@/lib/breakdownSessions";

const T = {
  bg: "#020205", s: "#0a0e18", s2: "#111827", cyan: "#00D4FF", gold: "#B8922A",
  green: "#00d4a1", text: "#e8edf5", muted: "#6b7a94", border: "#1e2d45",
};

type CaptionResult = {
  exercicio?: string;
  hooks?: string[];
  legenda_reels?: string;
  legenda_feed?: string;
  texto_na_tela?: string[];
  cta?: string;
  hashtags?: string[];
  stories?: string[];
  frase_impacto?: string;
};

const box: React.CSSProperties = { background: T.s, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 };
const btn: React.CSSProperties = {
  padding: 13, background: T.cyan, color: "#000", border: "none", borderRadius: 8,
  fontSize: 12, fontWeight: 800, letterSpacing: 1, cursor: "pointer", width: "100%",
};

function copy(text: string) {
  navigator.clipboard.writeText(text);
  toast({ title: "Copiado", description: "Texto pronto pra colar no Instagram." });
}

function Block({ title, text }: { title: string; text: string }) {
  return (
    <div style={{ background: T.s2, border: `1px solid ${T.border}`, borderRadius: 10, padding: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: "monospace", fontSize: 9, color: T.cyan, letterSpacing: 1 }}>{title}</span>
        <button onClick={() => copy(text)} style={{ background: "none", border: `1px solid ${T.border}`, color: T.muted, fontSize: 9, fontFamily: "monospace", padding: "3px 8px", borderRadius: 5, cursor: "pointer" }}>COPIAR</button>
      </div>
      <div style={{ fontSize: 12, color: T.text, whiteSpace: "pre-wrap", lineHeight: 1.6 }}>{text}</div>
    </div>
  );
}

export default function SocialOnContentGenerator({ handle }: { handle?: string }) {
  const [sessions, setSessions] = useState<BreakdownSession[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CaptionResult | null>(null);

  useEffect(() => {
    listBreakdownSessions().then(setSessions).catch(() => setSessions([]));
  }, []);

  const session = sessions.find((s) => s.id === selected);

  const generate = async () => {
    if (!session) return;
    setLoading(true); setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: {
          mode: "breakdown_caption",
          handle,
          topic: session.exercise || session.title,
          analysisData: session.analyses.filter(Boolean),
        },
      });
      if (error) throw error;
      setResult((data?.result || {}) as CaptionResult);
    } catch (e) {
      toast({ title: "Não consegui gerar", description: e instanceof Error ? e.message : "Tente de novo.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: T.bg, color: T.text, padding: 16, borderRadius: 16, fontFamily: "system-ui, sans-serif", display: "grid", gap: 12 }}>
      <div>
        <div style={{ fontWeight: 900, fontSize: 14, letterSpacing: 1 }}>GERADOR DE CONTEÚDO</div>
        <div style={{ fontFamily: "monospace", fontSize: 8, color: T.muted, letterSpacing: 2 }}>ANÁLISES DO BREAKDOWN → LEGENDAS PRONTAS</div>
      </div>

      <div style={{ ...box, display: "grid", gap: 10 }}>
        {sessions.length === 0 ? (
          <div style={{ fontSize: 12, color: T.muted, lineHeight: 1.6 }}>
            Nenhuma análise salva ainda. Gere um breakdown no Breakdown Studio — ele fica salvo aqui automaticamente.
          </div>
        ) : (
          <>
            <div style={{ fontFamily: "monospace", fontSize: 10, color: T.cyan, letterSpacing: 1 }}>ESCOLHA UMA ANÁLISE</div>
            <div style={{ display: "grid", gap: 6 }}>
              {sessions.map((s) => (
                <button key={s.id} onClick={() => { setSelected(s.id); setResult(null); }}
                  style={{
                    textAlign: "left", padding: "10px 12px", borderRadius: 8, cursor: "pointer",
                    background: selected === s.id ? "rgba(0,212,255,0.08)" : T.s2,
                    border: `1px solid ${selected === s.id ? T.cyan : T.border}`, color: T.text,
                  }}>
                  <div style={{ fontSize: 12, fontWeight: 700 }}>{s.exercise || s.title}</div>
                  <div style={{ fontFamily: "monospace", fontSize: 9, color: T.muted, marginTop: 2 }}>
                    {s.analyses.length} momento(s) · {new Date(s.created_at).toLocaleDateString("pt-BR")}
                  </div>
                </button>
              ))}
            </div>
            <button onClick={generate} disabled={!selected || loading} style={{ ...btn, opacity: !selected || loading ? 0.5 : 1 }}>
              {loading ? "GERANDO..." : "GERAR LEGENDAS →"}
            </button>
          </>
        )}
      </div>

      {result && (
        <div style={{ ...box, display: "grid", gap: 10 }}>
          {result.frase_impacto && (
            <div style={{ textAlign: "center", fontSize: 14, fontWeight: 800, color: T.cyan }}>"{result.frase_impacto}"</div>
          )}
          {result.hooks?.length ? <Block title="HOOKS" text={result.hooks.map((h, i) => `${i + 1}. ${h}`).join("\n")} /> : null}
          {result.legenda_reels ? <Block title="LEGENDA REELS" text={result.legenda_reels} /> : null}
          {result.legenda_feed ? <Block title="LEGENDA FEED" text={result.legenda_feed} /> : null}
          {result.texto_na_tela?.length ? <Block title="TEXTO NA TELA" text={result.texto_na_tela.join("\n")} /> : null}
          {result.stories?.length ? <Block title="STORIES" text={result.stories.join("\n")} /> : null}
          {result.cta ? <Block title="CTA" text={result.cta} /> : null}
          {result.hashtags?.length ? <Block title="HASHTAGS" text={result.hashtags.join(" ")} /> : null}
          <div style={{ fontFamily: "monospace", fontSize: 8, color: T.gold, letterSpacing: 1, textAlign: "center" }}>
            @diogo.mell0 · nutriON · Método MCE
          </div>
        </div>
      )}
    </div>
  );
}
