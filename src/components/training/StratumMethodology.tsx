import { useState } from "react";
import { Microscope, TrendingUp, BookOpen, ChevronDown, ChevronRight, FlaskConical } from "lucide-react";
import { STRATUM_PILLARS, STRATUM_PROGRESSION_RULES, STRATUM_FULL_REFERENCES } from "@/data/stratumData";

const SURFACE = "#0c120c";
const SURFACE2 = "#111a11";
const BORDER = "rgba(74,222,128,0.1)";
const BORDER_ACTIVE = "rgba(74,222,128,0.35)";
const GREEN = "#4ade80";
const GREEN_DIM = "rgba(74,222,128,0.08)";
const TEXT = "#f0fdf4";
const TEXT_DIM = "#94a3b8";
const TEXT_MUTED = "#64748b";
const FONT = "'Space Grotesk', sans-serif";

function Collapsible({ title, icon: Icon, children, defaultOpen }: any) {
  const [open, setOpen] = useState(!!defaultOpen);
  return (
    <div className="rounded-2xl p-3" style={{ background: SURFACE, border: `1px solid ${BORDER}` }}>
      <button onClick={() => setOpen((v: boolean) => !v)} className="w-full flex items-center justify-between text-[11px] font-semibold" style={{ color: TEXT_DIM }}>
        <span className="flex items-center gap-2"><Icon className="w-3.5 h-3.5" style={{ color: GREEN }} />{title}</span>
        {open ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
}

export default function StratumMethodology({ embedded }: { embedded?: boolean }) {
  return (
    <div className={embedded ? "space-y-2" : "space-y-3 mt-3"} style={{ fontFamily: FONT }}>
      {!embedded && (
        <div className="rounded-2xl p-4" style={{ background: `linear-gradient(135deg, ${SURFACE} 0%, ${SURFACE2} 100%)`, border: `1px solid ${BORDER_ACTIVE}` }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: GREEN_DIM, border: `1px solid ${BORDER_ACTIVE}` }}>
              <FlaskConical className="w-5 h-5" style={{ color: GREEN }} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-black tracking-tight mb-1" style={{ color: TEXT }}>Metodologia STRATUM</h2>
              <p className="text-[11px] leading-relaxed" style={{ color: TEXT_DIM }}>
                O motor roda automaticamente em toda prescrição — <span style={{ color: GREEN }}>EMG validado</span>, MEV/MAV/MRV e progressão são aplicados sem configuração. Esta aba explica a ciência por trás das decisões.
              </p>
            </div>
          </div>
        </div>
      )}

      <Collapsible title="5 Pilares Científicos" icon={Microscope} defaultOpen={embedded}>
        <div className="space-y-2">
          {STRATUM_PILLARS.map((p, i) => (
            <div key={p.id} className="p-3 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
              <div className="flex items-start gap-2">
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded" style={{ background: GREEN_DIM, color: GREEN }}>0{i + 1}</span>
                <div className="flex-1">
                  <div className="text-[12px] font-bold mb-1" style={{ color: TEXT }}>{p.title}</div>
                  <p className="text-[10px] leading-relaxed mb-1" style={{ color: TEXT_DIM }}>{p.summary}</p>
                  <p className="text-[9px] italic" style={{ color: TEXT_MUTED }}>{p.ref}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Collapsible>

      <Collapsible title="Regras de Progressão" icon={TrendingUp}>
        <div className="space-y-2">
          <div className="p-2.5 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div className="text-[10px] font-black mb-1.5" style={{ color: GREEN }}>PROGRESSÃO DE CARGA</div>
            {STRATUM_PROGRESSION_RULES.loadProgression.map((p, i) => (
              <div key={i} className="text-[10px] mb-1">
                <div className="font-bold" style={{ color: TEXT }}>{p.type}</div>
                <div style={{ color: TEXT_DIM }}>→ {p.rule}</div>
              </div>
            ))}
          </div>
          <div className="p-2.5 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER_ACTIVE}` }}>
            <div className="text-[10px] font-black mb-1.5" style={{ color: GREEN }}>{STRATUM_PROGRESSION_RULES.deload.title.toUpperCase()}</div>
            <ul className="text-[10px] space-y-0.5" style={{ color: TEXT_DIM }}>
              {STRATUM_PROGRESSION_RULES.deload.rules.map((r, i) => <li key={i}>• {r}</li>)}
            </ul>
            <p className="text-[9px] italic mt-1" style={{ color: TEXT_MUTED }}>📚 {STRATUM_PROGRESSION_RULES.deload.ref}</p>
          </div>
          <div className="p-2.5 rounded-lg" style={{ background: SURFACE2, border: `1px solid ${BORDER}` }}>
            <div className="text-[10px] font-black mb-1.5" style={{ color: GREEN }}>ESCALA RPE / RIR</div>
            {STRATUM_PROGRESSION_RULES.rpeScale.map((r, i) => (
              <div key={i} className="flex justify-between text-[10px]">
                <span className="font-bold" style={{ color: TEXT }}>{r.rpe}</span>
                <span style={{ color: TEXT_DIM }}>{r.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </Collapsible>

      <Collapsible title="Referências científicas" icon={BookOpen}>
        <ul className="space-y-1">
          {STRATUM_FULL_REFERENCES.map((r, i) => (
            <li key={i} className="text-[10px] leading-relaxed" style={{ color: TEXT_DIM }}>• {r}</li>
          ))}
        </ul>
      </Collapsible>
    </div>
  );
}
