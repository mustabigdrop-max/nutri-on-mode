import { safeString } from "@/lib/utils";
import { useMemo, useState, useEffect } from "react";
import { validateSubstitution, type SubstitutionValidation } from "@/lib/substitutionValidator";

const C = {
  bg: "#0a0a1a",
  bg2: "#0d1520",
  card: "#11161f",
  border: "#ffffff15",
  border2: "#ffffff25",
  text: "#F5F0E8",
  muted: "#888888",
  muted2: "#555",
  green: "#1D9E75",
  greenSoft: "#1D9E751f",
  amber: "#B8922A",
  amberSoft: "#B8922A1f",
  red: "#ff5555",
  redSoft: "#ff55551f",
  blue: "#00D4FF",
};

export interface DrawerOriginal {
  alimento: string;
  quantidade?: string | null;
  quantidade_g?: string | null;
}

export interface DrawerSub {
  alimento: string;
  quantidade?: string | null;
  quantidade_g?: string | null;
  observacao?: string | null;
  grupo?: string;
}

export interface DrawerConfirmPayload {
  alimento: string;
  quantidade: string;        // medida exibida (ex.: "227g")
  quantidade_g: string;      // gramagem ajustada (ex.: "227g")
  observacao?: string | null;
  validation: SubstitutionValidation;
}

interface Props {
  open: boolean;
  original: DrawerOriginal | null;
  substitutos: DrawerSub[];
  onClose: () => void;
  onConfirm: (payload: DrawerConfirmPayload) => void;
}

type FilterTag = "todos" | "mesmo_grupo" | "mesma_kcal" | "sem_gluten" | "sem_lactose" | "vegano";

const GLUTEN = /\b(p[aã]o|macarr[aã]o|trigo|cuscuz|aveia|tapioca|farinha|biscoito)\b/i;
const LACTOSE = /\b(leite|iogurte|cottage|queijo|whey|caseina|caseína|manteiga|ghee|ricota)\b/i;
const ANIMAL = /\b(frango|peito|coxa|peixe|atum|sardinha|tilapia|salmão|salmao|carne|patinho|alcatra|file|ovo|clara|whey|caseina|caseína|iogurte|leite|queijo|cottage|peru|presunto|merluza|ricota|ghee|manteiga|cottage)\b/i;

export default function SubstitutionDrawer({ open, original, substitutos, onClose, onConfirm }: Props) {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<FilterTag, boolean>>({
    todos: true, mesmo_grupo: false, mesma_kcal: false, sem_gluten: false, sem_lactose: false, vegano: false,
  });

  useEffect(() => {
    if (open) {
      setQuery("");
      setFilters({ todos: true, mesmo_grupo: false, mesma_kcal: false, sem_gluten: false, sem_lactose: false, vegano: false });
    }
  }, [open, original?.alimento]);

  const originalSnap = useMemo(() => {
    if (!original) return null;
    return validateSubstitution(original.alimento, original.quantidade_g || original.quantidade, original.alimento, original.quantidade_g || original.quantidade).original;
  }, [original]);

  const validations = useMemo(() => {
    if (!original) return [];
    return substitutos.map((s) => ({
      sub: s,
      v: validateSubstitution(
        original.alimento,
        original.quantidade_g || original.quantidade,
        s.alimento,
        s.quantidade_g || s.quantidade,
      ),
    }));
  }, [original, substitutos]);

  const filtered = useMemo(() => {
    const q = safeString(query).trim().toLowerCase();
    const grupoOriginal = originalSnap?.densidade?.grupo;
    return validations
      .filter(({ sub, v }) => {
        if (q && !safeString(sub.alimento).toLowerCase().includes(q)) return false;
        if (filters.mesmo_grupo && grupoOriginal && v.proposto.densidade?.grupo !== grupoOriginal) return false;
        if (filters.mesma_kcal && v.status === "fora") return false;
        if (filters.sem_gluten && GLUTEN.test(sub.alimento)) return false;
        if (filters.sem_lactose && LACTOSE.test(sub.alimento)) return false;
        if (filters.vegano && ANIMAL.test(sub.alimento)) return false;
        return true;
      })
      .sort((a, b) => {
        const da = a.v.deltaKcal == null ? 99999 : Math.abs(a.v.deltaKcal);
        const db = b.v.deltaKcal == null ? 99999 : Math.abs(b.v.deltaKcal);
        if (da !== db) return da - db;
        return b.v.compatibilidade - a.v.compatibilidade;
      });
  }, [validations, query, filters, originalSnap]);

  if (!open || !original) return null;

  const colorForStatus = (s: SubstitutionValidation["status"]) =>
    s === "ideal" ? C.green : s === "ok" ? C.amber : C.red;

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClose(); }}
      style={{ position: "fixed", inset: 0, zIndex: 10000, background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: "absolute", top: 0, right: 0, bottom: 0, width: "min(480px, 100vw)",
          background: C.bg, borderLeft: `1px solid ${C.border2}`, padding: 20,
          overflowY: "auto", display: "flex", flexDirection: "column", gap: 16,
          fontFamily: "'Space Mono', monospace", color: C.text,
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
          <div>
            <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 4 }}>SUBSTITUIR</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.text, letterSpacing: "0.05em" }}>{original.alimento}</div>
          </div>
          <button
            type="button"
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onClose(); }}
            style={{ background: "transparent", border: `1px solid ${C.border2}`, color: C.muted, padding: "4px 10px", cursor: "pointer", fontSize: 12 }}
          >✕</button>
        </div>

        {/* Card original */}
        <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 10, padding: 12 }}>
          <div style={{ fontSize: 9, color: C.muted, letterSpacing: "0.2em", textTransform: "uppercase", marginBottom: 6 }}>ORIGINAL</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.text }}>{original.alimento}</div>
          <div style={{ fontSize: 11, color: C.muted, marginTop: 4 }}>
            {originalSnap?.gramas ? `${originalSnap.gramas}g` : (original.quantidade || "—")}
          </div>
          {originalSnap?.kcal != null && (
            <div style={{ fontSize: 12, color: C.text, marginTop: 6 }}>
              <span style={{ color: C.amber, fontWeight: 700 }}>{originalSnap.kcal} kcal</span>
              {" · "}
              P{originalSnap.proteina}g · C{originalSnap.carbo}g · G{originalSnap.gordura}g
            </div>
          )}
          {originalSnap?.kcal == null && (
            <div style={{ fontSize: 10, color: C.muted2, marginTop: 6, fontStyle: "italic" }}>
              Sem densidade nutricional conhecida — validação aproximada.
            </div>
          )}
        </div>

        {/* Busca */}
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar substituto..."
          style={{
            background: C.bg2, border: `1px solid ${C.border2}`, color: C.text,
            padding: "8px 12px", fontSize: 12, outline: "none", borderRadius: 8,
            fontFamily: "inherit",
          }}
        />

        {/* Filtros toggle */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(["mesmo_grupo","mesma_kcal","sem_gluten","sem_lactose","vegano"] as const).map((k) => {
            const active = filters[k];
            const label =
              k === "mesmo_grupo" ? "Mesmo grupo" :
              k === "mesma_kcal" ? "Mesma kcal" :
              k === "sem_gluten" ? "Sem glúten" :
              k === "sem_lactose" ? "Sem lactose" : "Vegano";
            return (
              <button
                key={k}
                type="button"
                onClick={(e) => { e.preventDefault(); e.stopPropagation(); setFilters((f) => ({ ...f, [k]: !f[k] })); }}
                style={{
                  padding: "4px 10px", fontSize: 10, borderRadius: 999,
                  background: active ? C.greenSoft : "transparent",
                  border: `1px solid ${active ? C.green : C.border2}`,
                  color: active ? C.green : C.muted,
                  cursor: "pointer", fontFamily: "inherit",
                }}
              >{label}</button>
            );
          })}
        </div>

        {/* Lista */}
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.length === 0 && (
            <div style={{ fontSize: 11, color: C.muted2, textAlign: "center", padding: 20 }}>
              Nenhum substituto compatível com os filtros.
            </div>
          )}
          {filtered.map(({ sub, v }, idx) => {
            const statusColor = colorForStatus(v.status);
            const isIdentical = v.deltaKcal === 0;
            const grams = v.ajustado.gramas || v.proposto.gramas;
            return (
              <div key={idx} style={{
                background: C.card, border: `1px solid ${C.border2}`,
                borderLeft: `3px solid ${statusColor}`, borderRadius: 10, padding: 12,
                display: "flex", flexDirection: "column", gap: 6,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text }}>{sub.alimento}</div>
                  {isIdentical && (
                    <span style={{ fontSize: 9, fontWeight: 700, color: C.green, background: C.greenSoft, padding: "2px 8px", borderRadius: 999, border: `1px solid ${C.green}55` }}>
                      KCAL IDÊNTICO
                    </span>
                  )}
                </div>

                <div style={{ fontSize: 11, color: C.muted }}>
                  {grams ? `${grams}g` : (sub.quantidade || "—")}
                </div>

                {v.ajustado.kcal != null ? (
                  <div style={{ fontSize: 11, color: C.text, display: "flex", flexWrap: "wrap", gap: 10 }}>
                    <span><span style={{ color: C.amber, fontWeight: 700 }}>{v.ajustado.kcal} kcal</span></span>
                    {v.deltaKcal != null && (
                      <span style={{ color: statusColor, fontWeight: 700 }}>
                        Δ {v.deltaKcal > 0 ? "+" : ""}{v.deltaKcal} kcal
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{ fontSize: 10, color: C.muted2, fontStyle: "italic" }}>Sem dados de kcal</div>
                )}

                {v.ajustado.proteina != null && (
                  <div style={{ fontSize: 10.5, color: C.muted }}>
                    P{v.ajustado.proteina}g · C{v.ajustado.carbo}g · G{v.ajustado.gordura}g
                  </div>
                )}

                {/* Barra de compatibilidade */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ flex: 1, height: 4, background: "#ffffff10", borderRadius: 999, overflow: "hidden" }}>
                    <div style={{
                      width: `${v.compatibilidade}%`, height: "100%",
                      background: v.compatibilidade >= 80 ? C.green : v.compatibilidade >= 60 ? C.amber : C.red,
                    }} />
                  </div>
                  <span style={{ fontSize: 10, color: C.muted, fontWeight: 700, minWidth: 30, textAlign: "right" }}>{v.compatibilidade}%</span>
                </div>

                <div style={{ fontSize: 10, color: C.muted2, fontStyle: "italic" }}>{v.motivo}</div>

                {v.status === "fora" && (
                  <div style={{ fontSize: 10, color: C.red, background: C.redSoft, padding: "4px 8px", borderRadius: 6 }}>
                    ⚠ Fora da tolerância de ±10% kcal
                  </div>
                )}

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const finalG = v.ajustado.gramas || v.proposto.gramas;
                    const qStr = finalG ? `${finalG}g` : (sub.quantidade || "1 porção");
                    onConfirm({
                      alimento: sub.alimento,
                      quantidade: qStr,
                      quantidade_g: finalG ? String(finalG) : (sub.quantidade_g ? String(sub.quantidade_g) : ""),
                      observacao: sub.observacao,
                      validation: v,
                    });
                  }}
                  style={{
                    marginTop: 4, padding: "8px 12px", borderRadius: 8,
                    background: C.greenSoft, border: `1px solid ${C.green}`,
                    color: C.green, fontWeight: 700, fontSize: 11, cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >SUBSTITUIR →</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
