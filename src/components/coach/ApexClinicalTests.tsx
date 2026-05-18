// APEX Visual — Testes Clínicos do Método Fenner (entrada manual)
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ChevronRight, FlaskConical, Activity, Dumbbell, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import {
  FLEX_TESTS,
  MRC_MUSCLES,
  MRC_OPTIONS,
  DYNAMIC_TESTS,
  EMPTY_CLINICAL,
  classifyFlex,
  mrcSeverity,
  type ClinicalTestsState,
  type FlexTestDef,
  type MrcScore,
  type FlexSeverity,
} from "@/data/fennerTests";

interface Props {
  athleteId?: string | null;
  value: ClinicalTestsState;
  onChange: (next: ClinicalTestsState) => void;
}

const SEV_BADGE: Record<FlexSeverity, { label: string; color: string }> = {
  normal: { label: "Normal", color: "#10B981" },
  reduced: { label: "Reduzido", color: "#F59E0B" },
  severe: { label: "Severo", color: "#EF4444" },
  na: { label: "—", color: "#475569" },
};

function FlexCard({ def, value, onChange }: { def: FlexTestDef; value: any; onChange: (v: any) => void }) {
  const [open, setOpen] = useState(false);

  const renderInput = (side: "D" | "E" | "single") => {
    const cur = value?.[side] ?? "";
    if (def.unit === "bool") {
      return (
        <select
          value={cur || ""}
          onChange={(e) => onChange({ ...value, [side]: e.target.value })}
          className="w-full bg-background border border-border rounded-none text-xs px-2 py-1 focus:border-primary outline-none"
        >
          <option value="">—</option>
          <option value="negativo">Negativo</option>
          <option value="positivo">Positivo</option>
        </select>
      );
    }
    return (
      <input
        type="number"
        step="0.1"
        value={cur}
        onChange={(e) => onChange({ ...value, [side]: e.target.value === "" ? undefined : Number(e.target.value) })}
        placeholder={def.unit}
        className="w-full bg-background border border-border rounded-none text-xs px-2 py-1 font-mono focus:border-primary outline-none"
      />
    );
  };

  const sevD = def.bilateral ? classifyFlex(def, value?.D) : "na";
  const sevE = def.bilateral ? classifyFlex(def, value?.E) : "na";
  const sevS = !def.bilateral ? classifyFlex(def, value?.single) : "na";

  return (
    <div className="border border-border bg-card/30 rounded-none p-3 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-foreground">{def.name}</div>
          <div className="text-[10px] text-muted-foreground">{def.muscle}</div>
          <div className="text-[10px] text-muted-foreground italic mt-0.5">Normal: {def.normal}</div>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="text-[10px] text-primary flex items-center gap-1 hover:underline"
          type="button"
        >
          <Info size={10} /> Como
        </button>
      </div>

      {open && (
        <div className="text-[10px] text-foreground/80 border-l-2 border-primary/40 pl-2">
          {def.instruction}
        </div>
      )}

      {def.bilateral ? (
        <div className="grid grid-cols-2 gap-2">
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Direito</div>
            {renderInput("D")}
            <SevBadge sev={sevD} />
          </div>
          <div>
            <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Esquerdo</div>
            {renderInput("E")}
            <SevBadge sev={sevE} />
          </div>
        </div>
      ) : (
        <div>
          {renderInput("single")}
          <SevBadge sev={sevS} />
        </div>
      )}
    </div>
  );
}

function SevBadge({ sev }: { sev: FlexSeverity }) {
  if (sev === "na") return null;
  const meta = SEV_BADGE[sev];
  return (
    <div
      className="mt-1 inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
      style={{ color: meta.color, borderLeft: `2px solid ${meta.color}` }}
    >
      {meta.label}
    </div>
  );
}

export function ApexClinicalTests({ athleteId, value, onChange }: Props) {
  const [openFlex, setOpenFlex] = useState(true);
  const [openMrc, setOpenMrc] = useState(false);
  const [openDyn, setOpenDyn] = useState(false);

  // Persistência local por atleta
  const storageKey = useMemo(() => `apex-clinical-${athleteId || "no-athlete"}`, [athleteId]);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as ClinicalTestsState;
        if (parsed && typeof parsed === "object") onChange({ ...EMPTY_CLINICAL, ...parsed });
      }
    } catch {/* ignore */}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  useEffect(() => {
    try { localStorage.setItem(storageKey, JSON.stringify(value)); } catch {/* ignore */}
  }, [storageKey, value]);

  const setFlex = (id: string, v: any) => onChange({ ...value, flex: { ...value.flex, [id]: v } });
  const setMrc = (id: string, v: any) => onChange({ ...value, mrc: { ...value.mrc, [id]: v } });
  const setDyn = (id: string, v: any) => onChange({ ...value, dynamic: { ...value.dynamic, [id]: v } });

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <FlaskConical size={14} className="text-primary" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Testes Clínicos · Método Fenner
        </span>
      </div>

      <div>
        <label className="text-[10px] uppercase tracking-wider text-muted-foreground">Altura do atleta (cm) — para grade simetrográfica</label>
        <input
          type="number"
          value={value.athleteHeightCm ?? ""}
          onChange={(e) => onChange({ ...value, athleteHeightCm: e.target.value === "" ? null : Number(e.target.value) })}
          placeholder="ex.: 175"
          className="mt-1 w-32 bg-background border border-border rounded-none text-xs px-2 py-1 font-mono focus:border-primary outline-none"
        />
      </div>

      {/* FLEXIBILIDADE */}
      <Accordion
        open={openFlex} onToggle={() => setOpenFlex((o) => !o)}
        icon={<Activity size={13} className="text-primary" />}
        title="Bateria de Flexibilidade (12 testes)"
      >
        <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {FLEX_TESTS.map((def) => (
            <FlexCard key={def.id} def={def} value={value.flex[def.id] ?? {}} onChange={(v) => setFlex(def.id, v)} />
          ))}
        </div>
      </Accordion>

      {/* MRC */}
      <Accordion
        open={openMrc} onToggle={() => setOpenMrc((o) => !o)}
        icon={<Dumbbell size={13} className="text-primary" />}
        title="Testes de Força (escala MRC 0-5)"
      >
        <div className="grid gap-2 md:grid-cols-2">
          {MRC_MUSCLES.map((m) => {
            const v = value.mrc[m.id] ?? {};
            const renderSel = (side: "D" | "E" | "single") => {
              const cur = (v as any)[side];
              return (
                <select
                  value={cur ?? ""}
                  onChange={(e) => {
                    const val = e.target.value === "" ? undefined : (Number(e.target.value) as MrcScore);
                    setMrc(m.id, { ...v, [side]: val });
                  }}
                  className="w-full bg-background border border-border rounded-none text-xs px-2 py-1 focus:border-primary outline-none"
                >
                  <option value="">—</option>
                  {MRC_OPTIONS.map((o) => <option key={String(o.value)} value={o.value}>{o.label}</option>)}
                </select>
              );
            };
            const sev = (s?: MrcScore) => {
              const sv = mrcSeverity(s);
              if (sv === "ok" || sv === "na") return null;
              const col = sv === "inhibited" ? "#EF4444" : "#F59E0B";
              const lbl = sv === "inhibited" ? "INIBIDO CONFIRMADO" : "FRAQUEZA RELATIVA";
              return (
                <div className="mt-1 inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                  style={{ color: col, borderLeft: `2px solid ${col}` }}>
                  {lbl}
                </div>
              );
            };
            return (
              <div key={m.id} className="border border-border bg-card/30 rounded-none p-3 space-y-2">
                <div className="text-xs font-semibold text-foreground">{m.name}</div>
                {m.bilateral ? (
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Direito</div>
                      {renderSel("D")}
                      {sev(v.D)}
                    </div>
                    <div>
                      <div className="text-[9px] text-muted-foreground uppercase tracking-wider mb-0.5">Esquerdo</div>
                      {renderSel("E")}
                      {sev(v.E)}
                    </div>
                  </div>
                ) : (
                  <div>{renderSel("single")}{sev(v.single)}</div>
                )}
              </div>
            );
          })}
        </div>
      </Accordion>

      {/* DINÂMICA */}
      <Accordion
        open={openDyn} onToggle={() => setOpenDyn((o) => !o)}
        icon={<CheckCircle2 size={13} className="text-primary" />}
        title="Análise Dinâmica (7 testes de movimento)"
      >
        <div className="grid gap-2 md:grid-cols-2">
          {DYNAMIC_TESTS.map((d) => {
            const v = value.dynamic[d.id] ?? { failed: {}, note: "" };
            const anyFail = Object.values(v.failed || {}).some(Boolean);
            const passed = !anyFail && Object.keys(v.failed || {}).length === 0 ? null : !anyFail;
            return (
              <div key={d.id} className="border border-border bg-card/30 rounded-none p-3 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="text-xs font-semibold text-foreground">{d.name}</div>
                  {passed === true && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-500">PASSOU</span>
                  )}
                  {passed === false && (
                    <span className="text-[9px] font-bold uppercase tracking-wider text-red-500 flex items-center gap-1">
                      <AlertTriangle size={10} /> FALHOU
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 gap-0.5">
                  {d.failures.map((f) => (
                    <label key={f.id} className="flex items-center gap-1.5 text-[11px] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={!!v.failed?.[f.id]}
                        onChange={(e) => setDyn(d.id, { ...v, failed: { ...v.failed, [f.id]: e.target.checked } })}
                        className="accent-primary"
                      />
                      <span>{f.label}</span>
                    </label>
                  ))}
                </div>
                <input
                  value={v.note ?? ""}
                  onChange={(e) => setDyn(d.id, { ...v, note: e.target.value })}
                  placeholder="Observação (opcional)"
                  className="w-full bg-background border border-border rounded-none text-[11px] px-2 py-1 focus:border-primary outline-none"
                />
              </div>
            );
          })}
        </div>
      </Accordion>
    </div>
  );
}

function Accordion({ open, onToggle, icon, title, children }: {
  open: boolean; onToggle: () => void; icon: React.ReactNode; title: string; children: React.ReactNode;
}) {
  return (
    <div className="border border-border bg-card/20 rounded-none">
      <button onClick={onToggle} type="button" className="w-full flex items-center gap-2 p-2.5 hover:bg-card/40 transition-colors text-left">
        {open ? <ChevronDown size={14} className="text-primary" /> : <ChevronRight size={14} className="text-muted-foreground" />}
        {icon}
        <span className="text-xs font-bold uppercase tracking-wide text-foreground">{title}</span>
      </button>
      {open && <div className="p-3 border-t border-border">{children}</div>}
    </div>
  );
}

export default ApexClinicalTests;
