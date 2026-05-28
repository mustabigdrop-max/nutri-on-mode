/**
 * FinalizadoresSection — renderiza os exercícios finalizadores no final
 * de cada dia de treino. Cards expansíveis em teal, com checkbox de conclusão.
 *
 * Persistência: salva no localStorage por (protocolId, dayNumber, numero).
 * Se onToggleDone for fornecido, delega a persistência ao componente pai.
 */
import { useState } from "react";
import { ChevronDown, ChevronUp, Check } from "lucide-react";
import type { FinalizadorItem } from "@/lib/parseFinalizadores";

const TEAL = "#00D4AA";
const GOLD = "#B8922A";
const PURPLE = "#A78BFA";

interface Props {
  items: FinalizadorItem[];
  objetivo?: string;
  duracaoMin?: number;
  storageKey?: string; // para checkboxes persistirem
}

export default function FinalizadoresSection({
  items,
  objetivo,
  duracaoMin = 10,
  storageKey,
}: Props) {
  if (!items || items.length === 0) return null;

  return (
    <div
      className="mt-3"
      style={{
        background: "rgba(0,212,170,0.04)",
        border: "0.5px solid rgba(0,212,170,0.15)",
        borderLeft: "2px solid rgba(0,212,170,0.5)",
        borderRadius: 4,
        padding: "10px 14px",
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div>
          <div
            style={{
              fontSize: 8,
              color: TEAL,
              letterSpacing: ".16em",
              fontWeight: 700,
              textTransform: "uppercase",
            }}
          >
            🔻 Finalizadores
          </div>
          <div style={{ fontSize: 9, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
            Realizar após cada sessão de treino
          </div>
        </div>
        <span
          className="px-2 py-0.5 rounded-full"
          style={{
            background: "rgba(0,212,170,0.12)",
            color: TEAL,
            fontSize: 9,
            fontWeight: 700,
            border: "0.5px solid rgba(0,212,170,0.3)",
          }}
        >
          {duracaoMin} min
        </span>
      </div>

      {/* Objetivo */}
      {objetivo && (
        <div
          style={{
            background: "rgba(0,212,170,0.03)",
            borderRadius: 3,
            padding: "8px 10px",
            fontSize: 10,
            color: "rgba(255,255,255,0.7)",
            marginBottom: 8,
            lineHeight: 1.5,
          }}
        >
          <span style={{ color: TEAL, fontWeight: 700, fontSize: 9, letterSpacing: ".1em" }}>
            OBJETIVO:{" "}
          </span>
          {objetivo}
        </div>
      )}

      {/* Lista */}
      <div className="space-y-1">
        {items.map((item, i) => (
          <FinalizadorCard
            key={`${item.numero}-${i}`}
            item={item}
            storageKey={storageKey ? `${storageKey}:${item.numero}-${i}` : undefined}
          />
        ))}
      </div>
    </div>
  );
}

function FinalizadorCard({ item, storageKey }: { item: FinalizadorItem; storageKey?: string }) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState<boolean>(() => {
    if (!storageKey || typeof window === "undefined") return false;
    try {
      return localStorage.getItem(`finalizador:${storageKey}`) === "1";
    } catch {
      return false;
    }
  });

  const toggleDone = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = !done;
    setDone(next);
    if (storageKey && typeof window !== "undefined") {
      try {
        if (next) localStorage.setItem(`finalizador:${storageKey}`, "1");
        else localStorage.removeItem(`finalizador:${storageKey}`);
      } catch {
        /* noop */
      }
    }
  };

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2"
        style={{
          background: "rgba(6,12,20,0.9)",
          border: "0.5px solid rgba(0,212,170,0.08)",
          borderRadius: 3,
          padding: "8px 10px",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        {/* Checkbox */}
        <span
          onClick={toggleDone}
          role="checkbox"
          aria-checked={done}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === " " || e.key === "Enter") {
              e.preventDefault();
              e.stopPropagation();
              toggleDone(e as any);
            }
          }}
          className="flex items-center justify-center shrink-0"
          style={{
            width: 14,
            height: 14,
            borderRadius: 3,
            border: `1px solid ${done ? "#4ade80" : TEAL}`,
            background: done ? "#4ade80" : "transparent",
            transition: "all .15s",
          }}
        >
          {done && <Check className="w-2.5 h-2.5" style={{ color: "#000" }} />}
        </span>

        <span style={{ color: TEAL, fontSize: 11, fontWeight: 700, minWidth: 14 }}>
          {item.numero}
        </span>

        <span
          className="flex-1"
          style={{
            color: done ? "rgba(255,255,255,0.4)" : "rgba(255,255,255,0.92)",
            fontSize: 11,
            fontWeight: 600,
            textDecoration: done ? "line-through" : "none",
          }}
        >
          {item.nome}
        </span>

        {item.series_duracao && (
          <span style={{ color: "rgba(255,255,255,0.45)", fontSize: 9 }}>
            {item.series_duracao}
          </span>
        )}

        {open ? (
          <ChevronUp className="w-3 h-3" style={{ color: TEAL }} />
        ) : (
          <ChevronDown className="w-3 h-3" style={{ color: TEAL }} />
        )}
      </button>

      {open && (
        <div
          style={{
            background: "rgba(6,12,20,0.6)",
            border: "0.5px solid rgba(0,212,170,0.08)",
            borderTop: "none",
            borderRadius: "0 0 3px 3px",
            padding: "10px 12px",
            marginTop: -1,
          }}
          className="space-y-2"
        >
          {item.execucao && (
            <Field
              label="EXECUÇÃO"
              labelColor={GOLD}
              value={item.execucao}
            />
          )}
          {item.series_duracao && (
            <Field
              label="SÉRIES / DURAÇÃO"
              labelColor={TEAL}
              value={item.series_duracao}
            />
          )}
          {item.foco_corretivo && (
            <div>
              <div
                style={{
                  fontSize: 8,
                  color: PURPLE,
                  letterSpacing: ".14em",
                  fontWeight: 700,
                  marginBottom: 3,
                }}
              >
                FOCO CORRETIVO
              </div>
              <span
                className="inline-block"
                style={{
                  background: "rgba(167,139,250,0.12)",
                  border: "0.5px solid rgba(167,139,250,0.3)",
                  color: PURPLE,
                  fontSize: 10,
                  fontWeight: 600,
                  padding: "2px 8px",
                  borderRadius: 99,
                }}
              >
                {item.foco_corretivo}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, labelColor, value }: { label: string; labelColor: string; value: string }) {
  return (
    <div>
      <div
        style={{
          fontSize: 8,
          color: labelColor,
          letterSpacing: ".14em",
          fontWeight: 700,
          marginBottom: 3,
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.75)", lineHeight: 1.5 }}>
        {value}
      </div>
    </div>
  );
}
