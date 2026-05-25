import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp, Clock, FileText } from "lucide-react";
import { parseProtocolToDays, type ParsedDay } from "@/lib/parseProtocolMarkdown";

// Paleta TrainingON (espelha tokens usados em TrainingPage.tsx)
const GREEN = "#00e888";
const GREEN_DIM = "rgba(0,232,136,0.12)";
const GREEN_BORDER = "rgba(0,232,136,0.30)";
const GREEN_PILL_BG = "rgba(0,232,136,0.08)";
const GREEN_PILL_BORDER = "rgba(0,232,136,0.20)";
const CARD_BG = "rgba(8,18,12,0.80)";
const CARD_BORDER = "rgba(0,232,136,0.15)";
const TEXT = "#e8f0ff";
const TEXT_DIM = "#9aa5b8";
const TEXT_MUTED = "#606080";
const CHEVRON = "#3a4860";
const GOLD = "#E8A020";
const GOLD_DIM = "rgba(232,160,32,0.12)";
const GOLD_BORDER = "rgba(232,160,32,0.30)";

/** Renderiza markdown leve dentro do conteúdo expandido (sem mostrar #/*/- crus) */
function MarkdownBlock({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="space-y-1">
      {lines.map((raw, i) => {
        const t = raw.trim();
        if (!t) return <div key={i} className="h-2" />;
        // heading
        if (/^#{1,4}\s/.test(t)) {
          return (
            <h4
              key={i}
              className="text-[12px] font-bold mt-3 mb-1"
              style={{ color: GREEN }}
            >
              {t.replace(/^#+\s*/, "")}
            </h4>
          );
        }
        // bullet
        if (/^[-•*]\s/.test(t)) {
          return (
            <p key={i} className="text-[11px] ml-3" style={{ color: TEXT_DIM }}>
              • {t.replace(/^[-•*]\s+/, "")}
            </p>
          );
        }
        // numbered list
        if (/^\d+[.)]\s/.test(t)) {
          return (
            <p key={i} className="text-[11px] ml-3" style={{ color: TEXT_DIM }}>
              {t}
            </p>
          );
        }
        // bold-only line (**...**)
        if (/^\*\*.+\*\*:?$/.test(t)) {
          return (
            <p
              key={i}
              className="text-[11px] font-semibold mt-2"
              style={{ color: TEXT }}
            >
              {t.replace(/\*\*/g, "")}
            </p>
          );
        }
        // tabela markdown simples
        if (t.includes("|")) {
          const cells = t.split("|").map((c) => c.trim()).filter(Boolean);
          if (cells.every((c) => /^[-:]+$/.test(c))) return null;
          return (
            <div
              key={i}
              className="grid gap-1 text-[10px]"
              style={{
                gridTemplateColumns: `repeat(${cells.length}, 1fr)`,
                color: TEXT_DIM,
              }}
            >
              {cells.map((c, ci) => (
                <div
                  key={ci}
                  className="px-1 py-0.5"
                  style={{ borderBottom: "1px solid rgba(0,232,136,0.08)" }}
                >
                  {c.replace(/\*\*/g, "")}
                </div>
              ))}
            </div>
          );
        }
        return (
          <p
            key={i}
            className="text-[11px] leading-relaxed"
            style={{ color: TEXT_DIM }}
          >
            {t.replace(/\*\*/g, "")}
          </p>
        );
      })}
    </div>
  );
}

function DayCard({ day, defaultOpen }: { day: ParsedDay; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div
      style={{
        background: CARD_BG,
        border: `0.5px solid ${open ? GREEN_BORDER : CARD_BORDER}`,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
        boxShadow: open ? `0 0 0 1px ${GREEN_PILL_BORDER} inset` : undefined,
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          cursor: "pointer",
          background: "transparent",
          border: "none",
        }}
      >
        {/* Badge D1/D2 */}
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: GREEN_DIM,
            border: `0.5px solid ${GREEN_BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 12,
            fontWeight: 700,
            color: GREEN,
            flexShrink: 0,
          }}
        >
          D{day.day_number}
        </div>

        {/* Conteúdo central */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: TEXT,
              marginBottom: 8,
              lineHeight: 1.3,
            }}
          >
            {day.session_title}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{
                fontSize: 10,
                color: TEXT_MUTED,
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Clock style={{ width: 10, height: 10 }} />
              {day.estimated_duration}
            </span>
            {day.muscle_tags.map((m, i) => (
              <span
                key={i}
                style={{
                  padding: "2px 7px",
                  background: GREEN_PILL_BG,
                  border: `0.5px solid ${GREEN_PILL_BORDER}`,
                  borderRadius: 3,
                  fontSize: 9,
                  color: GREEN,
                  fontWeight: 500,
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>

        {/* Chevron */}
        <div
          style={{
            fontSize: 12,
            color: CHEVRON,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
            flexShrink: 0,
          }}
        >
          <ChevronDown style={{ width: 14, height: 14 }} />
        </div>
      </button>

      <AnimatePresence initial={false}>
        {open && day.body && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                padding: "0 16px 14px 66px",
                borderTop: `1px solid ${CARD_BORDER}`,
                paddingTop: 12,
              }}
            >
              <MarkdownBlock text={day.body} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function IntroCard({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  if (!text || text.trim().length < 4) return null;
  return (
    <div
      style={{
        background: CARD_BG,
        border: `0.5px solid rgba(45,212,168,0.20)`,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        style={{
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <span
          style={{
            fontSize: 9,
            padding: "3px 8px",
            borderRadius: 4,
            background: "rgba(45,212,168,0.10)",
            border: "0.5px solid rgba(45,212,168,0.30)",
            color: "#2dd4a8",
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          ATIVAÇÃO
        </span>
        <span style={{ fontSize: 12, color: TEXT, fontWeight: 600, flex: 1 }}>
          Notas gerais & warm-up
        </span>
        <ChevronDown
          style={{
            width: 14,
            height: 14,
            color: CHEVRON,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div style={{ padding: "0 16px 14px 16px" }}>
              <MarkdownBlock text={text} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FallbackCard({
  title,
  content,
}: {
  title: string;
  content: string;
}) {
  const [open, setOpen] = useState(true);
  return (
    <div
      style={{
        background: CARD_BG,
        border: `0.5px solid ${GOLD_BORDER}`,
        borderRadius: 8,
        marginBottom: 8,
        overflow: "hidden",
      }}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full text-left"
        style={{
          padding: "14px 16px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 6,
            background: GOLD_DIM,
            border: `0.5px solid ${GOLD_BORDER}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: GOLD,
            flexShrink: 0,
          }}
        >
          <FileText style={{ width: 14, height: 14 }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: TEXT,
              marginBottom: 4,
            }}
          >
            {title || "Protocolo"}
          </div>
          <div style={{ fontSize: 10, color: TEXT_MUTED }}>
            Conteúdo completo
          </div>
        </div>
        <div
          style={{
            color: CHEVRON,
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform .2s",
          }}
        >
          <ChevronDown style={{ width: 14, height: 14 }} />
        </div>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              style={{
                padding: "0 16px 14px 16px",
                borderTop: `1px solid ${CARD_BORDER}`,
                paddingTop: 12,
              }}
            >
              <MarkdownBlock text={content} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/**
 * Renderiza qualquer conteúdo de protocolo (markdown/texto)
 * no mesmo padrão visual dos cards D1/D2/D3 do Corretivo I.
 */
export function MarkdownProtocolView({
  content,
  title,
}: {
  content: any;
  title?: string;
}) {
  const parsed = parseProtocolToDays(content);

  if (parsed.isFallback) {
    const txt =
      typeof content === "string"
        ? content
        : JSON.stringify(content, null, 2);
    return <FallbackCard title={title || "Protocolo"} content={txt} />;
  }

  return (
    <div>
      {parsed.intro && <IntroCard text={parsed.intro} />}
      {parsed.days.map((day, i) => (
        <DayCard key={i} day={day} defaultOpen={i === 0} />
      ))}
    </div>
  );
}
