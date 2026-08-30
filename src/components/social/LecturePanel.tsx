// SOCIAL ON — Kit de Palestra: monta um roteiro de slides + fala do
// palestrante pra apresentação ao vivo, cruzando os domínios que o coach
// escolher (treino, nutrição, farmacologia) com achados científicos reais
// (busca real via pubmed-live, não invenção da IA).
import { useState } from "react";
import { Copy, Download, Loader2, Mic2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { ACCENT, ACCENT2, Section, copyText } from "./socialUi";

type Domain = "treino" | "nutricao" | "farmacologia";

const DOMAIN_LABELS: Record<Domain, string> = {
  treino: "🏋️ Treino",
  nutricao: "🥩 Nutrição",
  farmacologia: "💊 Farmacologia",
};

/** Termo de busca + área do pubmed-live por domínio — o tema da palestra entra na frente. */
const DOMAIN_SEARCH: Record<Domain, { area: string; base: string }> = {
  treino: { area: "hipertrofia", base: "progressive overload training volume resistance training hypertrophy" },
  nutricao: { area: "nutricao", base: "protein intake muscle protein synthesis bodybuilding nutrition" },
  farmacologia: { area: "", base: "anabolic androgenic steroids muscle hypertrophy performance systematic review" },
};

interface Slide {
  numero?: number;
  bloco?: string;
  titulo_slide?: string;
  bullets?: string[];
  fala_do_palestrante?: string;
  dado_cientifico?: string;
}

interface LectureKit {
  titulo?: string;
  subtitulo?: string;
  gancho_abertura?: string;
  agenda?: string[];
  slides?: Slide[];
  citacoes_chave?: string[];
  encerramento_cta?: string;
}

const BLOCO_COLOR: Record<string, string> = {
  ABERTURA: ACCENT,
  TREINO: "#F97316",
  NUTRICAO: "#22C55E",
  FARMACOLOGIA: "#A855F7",
  ENCERRAMENTO: ACCENT2,
};

const LecturePanel = ({ ctx }: { ctx: Record<string, any> }) => {
  const [topic, setTopic] = useState("Bodybuilding — treino, nutrição e farmacologia baseados em evidência");
  const [domains, setDomains] = useState<Domain[]>(["treino", "nutricao", "farmacologia"]);
  const [duration, setDuration] = useState(25);
  const [stage, setStage] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [kit, setKit] = useState<LectureKit | null>(null);

  const toggleDomain = (d: Domain) =>
    setDomains((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const gerar = async () => {
    if (!topic.trim() || !domains.length) {
      toast.error("Preencha o tema e escolha pelo menos um domínio.");
      return;
    }
    setKit(null);
    setErro(null);
    try {
      setStage("Buscando evidência científica real por domínio…");
      const scienceParts = await Promise.all(
        domains.map(async (d) => {
          const cfg = DOMAIN_SEARCH[d];
          const { data, error } = await supabase.functions.invoke("pubmed-live", {
            body: {
              searchTerm: `${topic} ${cfg.base}`,
              area: cfg.area || undefined,
              recency: "ano",
            },
          });
          if (error || (data as { error?: string })?.error) return "";
          const d2 = data as { rawStudies?: string; analysis?: string };
          return `--- ${DOMAIN_LABELS[d]} ---\n${d2.rawStudies || ""}\n${d2.analysis || ""}`;
        }),
      );
      const scienceContext = scienceParts.filter(Boolean).join("\n\n");
      if (!scienceContext) {
        toast.warning("Não consegui trazer achados científicos agora — a palestra vai sair em cima de consenso estabelecido, sem citação específica.");
      }

      setStage("Montando o roteiro de slides…");
      const { data, error } = await supabase.functions.invoke("lecture-kit-generate", {
        body: {
          topic,
          domains,
          durationMinutes: duration,
          scienceContext,
          ...ctx,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as { error?: string })?.error) throw new Error((data as { error?: string }).error);
      setKit((data as { result: LectureKit }).result);
      toast.success("Kit de palestra pronto!");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui montar o kit de palestra");
    } finally {
      setStage(null);
    }
  };

  const fullText = () => {
    if (!kit) return "";
    const lines: string[] = [];
    lines.push(kit.titulo || "", kit.subtitulo || "", "");
    if (kit.gancho_abertura) lines.push(`GANCHO DE ABERTURA: ${kit.gancho_abertura}`, "");
    if (kit.agenda?.length) lines.push("AGENDA:", ...kit.agenda.map((a) => `• ${a}`), "");
    (kit.slides || []).forEach((s) => {
      lines.push(`--- SLIDE ${s.numero ?? ""} · ${s.bloco || ""} ---`);
      lines.push(s.titulo_slide || "");
      (s.bullets || []).forEach((b) => lines.push(`• ${b}`));
      if (s.fala_do_palestrante) lines.push("", `Fala: ${s.fala_do_palestrante}`);
      if (s.dado_cientifico) lines.push(`Dado científico: ${s.dado_cientifico}`);
      lines.push("");
    });
    if (kit.encerramento_cta) lines.push(`ENCERRAMENTO: ${kit.encerramento_cta}`, "");
    if (kit.citacoes_chave?.length) lines.push("FONTES CITADAS:", ...kit.citacoes_chave.map((c) => `• ${c}`));
    return lines.join("\n");
  };

  const baixar = () => {
    const blob = new Blob([fullText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `roteiro-palestra-${(kit?.titulo || "kit").toLowerCase().replace(/\s+/g, "-").slice(0, 40)}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <Section title="🎤 Kit de Palestra">
        <p className="text-sm text-muted-foreground">
          Monta o roteiro de slides + fala do palestrante pra uma apresentação ao vivo, cruzando os domínios
          escolhidos com evidência científica real (busca ao vivo, não invenção). Cola o texto direto no
          PowerPoint — cada bloco "SLIDE" já sai separado.
        </p>
        <textarea
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          rows={2}
          placeholder="Tema da palestra — ex: Bodybuilding natural x farmacológico, hipertrofia baseada em evidência…"
          className="w-full rounded-md p-2 text-sm bg-transparent border"
          style={{ borderColor: `${ACCENT}44` }}
        />
        <div className="flex flex-wrap gap-2">
          {(Object.keys(DOMAIN_LABELS) as Domain[]).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => toggleDomain(d)}
              className="px-3 py-1.5 rounded-full text-xs border transition-colors"
              style={{
                borderColor: domains.includes(d) ? ACCENT : "rgba(255,255,255,0.12)",
                background: domains.includes(d) ? `${ACCENT}22` : "transparent",
                color: domains.includes(d) ? ACCENT : undefined,
              }}
            >
              {DOMAIN_LABELS[d]}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Duração alvo:</span>
          <input
            type="number"
            min={5}
            max={90}
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value) || 25)}
            className="w-16 rounded-md p-1.5 text-sm bg-transparent border text-center"
            style={{ borderColor: `${ACCENT}44` }}
          />
          <span className="text-muted-foreground">minutos</span>
        </div>
        <button
          type="button"
          onClick={gerar}
          disabled={!!stage}
          className="w-full py-2.5 rounded-md text-sm font-semibold flex items-center justify-center gap-2"
          style={{ background: ACCENT, color: "#020205", opacity: stage ? 0.7 : 1 }}
        >
          {stage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          {stage || "Gerar kit de palestra"}
        </button>
      </Section>

      {kit && (
        <>
          <Section
            title="📋 Roteiro"
            right={
              <div className="flex gap-1">
                <button type="button" onClick={() => copyText(fullText())} className="h-7 px-2 rounded-md text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Copy className="w-3 h-3" /> Copiar tudo
                </button>
                <button type="button" onClick={baixar} className="h-7 px-2 rounded-md text-[11px] flex items-center gap-1 text-muted-foreground hover:text-foreground">
                  <Download className="w-3 h-3" /> Baixar .txt
                </button>
              </div>
            }
          >
            <p className="text-lg font-bold">{kit.titulo}</p>
            {kit.subtitulo && <p className="text-sm text-muted-foreground">{kit.subtitulo}</p>}
            {kit.gancho_abertura && (
              <div className="rounded-lg p-3 text-sm" style={{ background: `${ACCENT}12`, border: `1px solid ${ACCENT}33` }}>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 flex items-center gap-1">
                  <Mic2 className="w-3 h-3" /> Gancho de abertura
                </p>
                {kit.gancho_abertura}
              </div>
            )}
            {!!kit.agenda?.length && (
              <div className="text-sm space-y-1">
                {kit.agenda.map((a, i) => <p key={i}>• {a}</p>)}
              </div>
            )}
          </Section>

          {(kit.slides || []).map((s, i) => {
            const color = BLOCO_COLOR[s.bloco || ""] || ACCENT;
            return (
              <div key={i} className="rounded-xl border p-4 space-y-2" style={{ borderColor: `${color}44`, background: `${color}08` }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] font-mono uppercase tracking-wider" style={{ color }}>
                    Slide {s.numero ?? i + 1} · {s.bloco}
                  </span>
                  <button type="button" onClick={() => copyText([s.titulo_slide, ...(s.bullets || [])].filter(Boolean).join("\n"))} className="text-muted-foreground hover:text-foreground">
                    <Copy className="w-3 h-3" />
                  </button>
                </div>
                <p className="font-semibold">{s.titulo_slide}</p>
                {!!s.bullets?.length && (
                  <ul className="text-sm space-y-0.5 list-disc pl-4">
                    {s.bullets.map((b, bi) => <li key={bi}>{b}</li>)}
                  </ul>
                )}
                {s.fala_do_palestrante && (
                  <p className="text-xs text-muted-foreground whitespace-pre-wrap border-t pt-2 mt-2" style={{ borderColor: `${color}22` }}>
                    🎙️ {s.fala_do_palestrante}
                  </p>
                )}
                {s.dado_cientifico && (
                  <p className="text-xs" style={{ color: ACCENT2 }}>🔬 {s.dado_cientifico}</p>
                )}
              </div>
            );
          })}

          {kit.encerramento_cta && (
            <Section title="🏁 Encerramento">
              <p className="text-sm">{kit.encerramento_cta}</p>
            </Section>
          )}

          {!!kit.citacoes_chave?.length && (
            <Section title="🔬 Fontes citadas">
              {kit.citacoes_chave.map((c, i) => (
                <p key={i} className="text-xs text-muted-foreground">• {c}</p>
              ))}
            </Section>
          )}
        </>
      )}
    </div>
  );
};

export default LecturePanel;
