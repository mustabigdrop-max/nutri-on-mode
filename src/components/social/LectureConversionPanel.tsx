// Kit de Palestra — estratégia de conversão, conteúdo pós-palestra e checklist.
import { useEffect, useState } from "react";
import { CheckSquare, Copy, Square } from "lucide-react";
import { ACCENT, ACCENT2, Section, copyText } from "./socialUi";
import {
  CHECKLIST, ContentKit, ConversionStrategy, checklistText, contentKitText, funnelText, strategyText,
} from "@/lib/lectureConversion";

const GREEN = "#22C55E";
const PURPLE = "#A855F7";
const CHECK_KEY = "nutrion.lecture.checklist";

const Copiar = ({ text, label = "Copiar" }: { text: string; label?: string }) => (
  <button
    type="button"
    onClick={() => copyText(text)}
    className="h-7 px-2 rounded-md text-[11px] flex items-center gap-1 border"
    style={{ borderColor: "rgba(255,255,255,0.14)", color: "rgba(255,255,255,0.7)" }}
  >
    <Copy className="w-3 h-3" /> {label}
  </button>
);

export const LectureConversionSection = ({ strategy }: { strategy: ConversionStrategy }) => (
  <Section
    title="💰 Estratégia de conversão"
    right={<Copiar text={strategyText(strategy)} label="Copiar tudo" />}
  >
    <div className="rounded-lg p-3 space-y-2" style={{ border: `1px solid ${GREEN}44`, background: `${GREEN}0D`, borderLeft: `4px solid ${GREEN}` }}>
      <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: GREEN, background: `${GREEN}1A` }}>Conversão</span>
      <p className="text-xs text-muted-foreground">Palavra-gatilho de DM</p>
      <p className="text-2xl font-black" style={{ color: GREEN }}>{strategy.gatilho}</p>
      <p className="text-sm italic">"{strategy.scriptGatilho}"</p>
      <p className="text-[11px] text-muted-foreground">{strategy.ondeFalar}</p>
    </div>

    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold">Funil pós-palestra</p>
        <Copiar text={funnelText(strategy)} label="Copiar funil de DMs" />
      </div>
      {strategy.funil.map((m, i) => (
        <div key={i} className="rounded-lg p-3 text-sm space-y-1" style={{ border: `1px solid ${GREEN}33`, background: "rgba(255,255,255,0.02)" }}>
          <p className="text-[10px] uppercase tracking-wider" style={{ color: GREEN }}>Mensagem {i + 1} · {m.quando}</p>
          <p className="whitespace-pre-wrap">{m.texto}</p>
        </div>
      ))}
    </div>

    <div className="space-y-2">
      <p className="text-xs font-semibold">Ofertas para este público</p>
      {strategy.ofertas.map((o, i) => (
        <div key={i} className="rounded-lg p-3 text-sm" style={{ border: `1px solid ${ACCENT}33` }}>
          <p className="font-semibold" style={{ color: ACCENT }}>{o.nome}</p>
          <p className="text-muted-foreground text-xs">{o.descricao}</p>
          <p className="text-[11px] italic mt-1" style={{ color: ACCENT2 }}>{o.ancora}</p>
        </div>
      ))}
    </div>
  </Section>
);

export const LectureContentSection = ({ content }: { content: ContentKit }) => (
  <Section
    title="📲 Kit de conteúdo pós-palestra"
    right={<Copiar text={contentKitText(content)} label="Copiar scripts" />}
  >
    <div className="space-y-2">
      {content.reels.map((r, i) => (
        <div key={i} className="rounded-lg p-3 text-sm space-y-1" style={{ border: `1px solid ${PURPLE}44`, background: `${PURPLE}0D`, borderLeft: `4px solid ${PURPLE}` }}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ color: PURPLE, background: `${PURPLE}1A` }}>Pós-palestra</span>
            <span className="text-[11px] text-muted-foreground">{r.duracao}</span>
          </div>
          <p className="font-semibold">{r.titulo}</p>
          <p><span className="text-muted-foreground text-xs">Hook: </span>{r.hook}</p>
          <p><span className="text-muted-foreground text-xs">Corpo: </span>{r.corpo}</p>
          <p><span className="text-muted-foreground text-xs">CTA: </span>{r.cta}</p>
        </div>
      ))}
    </div>

    <div className="rounded-lg p-3 text-sm space-y-1" style={{ border: `1px solid ${PURPLE}44` }}>
      <p className="font-semibold">Carrossel resumo (6 slides)</p>
      <ol className="list-decimal pl-4 text-xs space-y-0.5">
        {content.carrossel.slides.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
      <p className="text-xs text-muted-foreground pt-1">{content.carrossel.copy}</p>
      <p className="text-[11px]" style={{ color: ACCENT2 }}>{content.carrossel.hashtags.join(" ")}</p>
    </div>

    <div className="rounded-lg p-3 text-sm space-y-1" style={{ border: `1px solid ${PURPLE}44` }}>
      <p className="font-semibold">Stories</p>
      {content.stories.map((s, i) => <p key={i} className="text-xs text-muted-foreground">{s}</p>)}
    </div>

    <div className="rounded-lg p-3 text-sm space-y-1" style={{ border: `1px solid ${PURPLE}44` }}>
      <div className="flex items-center justify-between">
        <p className="font-semibold">Post de agradecimento</p>
        <Copiar text={content.postAgradecimento} />
      </div>
      <p className="text-xs whitespace-pre-wrap text-muted-foreground">{content.postAgradecimento}</p>
    </div>
  </Section>
);

export const LectureChecklistSection = () => {
  const [done, setDone] = useState<Record<string, boolean>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CHECK_KEY);
      if (raw) setDone(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const toggle = (key: string) =>
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      try { localStorage.setItem(CHECK_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });

  const total = CHECKLIST.reduce((a, g) => a + g.itens.length, 0);
  const marcados = Object.values(done).filter(Boolean).length;

  return (
    <Section
      title="✅ Checklist do palestrante"
      right={<Copiar text={checklistText()} />}
    >
      <p className="text-xs text-muted-foreground">{marcados}/{total} concluídos</p>
      {CHECKLIST.map((grupo) => (
        <div key={grupo.fase} className="space-y-1">
          <p className="text-[11px] uppercase tracking-wider" style={{ color: ACCENT }}>{grupo.fase}</p>
          {grupo.itens.map((item) => {
            const key = `${grupo.fase}:${item}`;
            const on = !!done[key];
            return (
              <button
                key={key}
                type="button"
                onClick={() => toggle(key)}
                className="w-full flex items-start gap-2 text-left text-sm py-1"
                style={{ color: on ? "rgba(255,255,255,0.45)" : undefined }}
              >
                {on ? <CheckSquare className="w-4 h-4 mt-0.5 shrink-0" style={{ color: GREEN }} /> : <Square className="w-4 h-4 mt-0.5 shrink-0 opacity-50" />}
                <span className={on ? "line-through" : ""}>{item}</span>
              </button>
            );
          })}
        </div>
      ))}
    </Section>
  );
};
