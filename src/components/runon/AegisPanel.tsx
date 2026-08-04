import { useState } from "react";
import { X, ShieldPlus, TrendingUp, Moon, Scale, Bone, Shield, AlertTriangle, ShieldCheck } from "lucide-react";
import {
  aegisCategories, aegisProtocols, evidenceLabels, AEGIS_DISCLAIMER, AegisCategory,
} from "@/data/aegisData";
import { HybridProfile, aegisTierFromProfile } from "@/lib/runonProfile";
import { RC, mono, raj, RBadge } from "@/components/runon/runonUi";

const ICONS: Record<string, any> = {
  preservation: ShieldPlus,
  performance: TrendingUp,
  recovery: Moon,
  composition: Scale,
  protection: Bone,
};

const EVIDENCE_COLORS: Record<string, string> = {
  scientific: RC.green,
  clinical: RC.cyan,
  empirical: RC.orange,
  "bro-science": RC.red,
  controversial: RC.purple,
};

const RELEVANCE_COLORS: Record<string, string> = {
  critical: RC.red,
  high: RC.orange,
  moderate: RC.gold,
};

const TIER_RANK = { natural: 0, trt: 1, cycle: 2 } as const;

export default function AegisPanel({
  profile, onClose,
}: { profile: HybridProfile | null; onClose: () => void }) {
  const [cat, setCat] = useState<AegisCategory>("preservation");
  const tier = aegisTierFromProfile(profile);
  const active = aegisCategories.find((c) => c.id === cat)!;

  const protocols = aegisProtocols.filter(
    (p) => p.category === cat && TIER_RANK[p.tier] <= TIER_RANK[tier]
  );
  const hidden = aegisProtocols.filter(
    (p) => p.category === cat && TIER_RANK[p.tier] > TIER_RANK[tier]
  ).length;

  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />

      <aside
        className="relative h-full w-full sm:w-[540px] overflow-y-auto animate-slide-in-right"
        style={{ background: RC.bg, borderLeft: `1px solid ${RC.purple}22`, boxShadow: "-20px 0 60px rgba(0,0,0,0.8)" }}
      >
        {/* header */}
        <div
          className="sticky top-0 z-10 px-4 sm:px-5 pt-4 pb-4"
          style={{ background: "rgba(2,2,5,0.95)", backdropFilter: "blur(16px)", borderBottom: `1px solid #a855f718` }}
        >
          <div className="flex items-start gap-3">
            <div
              className="flex items-center justify-center shrink-0"
              style={{ width: 44, height: 44, background: RC.purpleDim, border: `1px solid ${RC.purpleBorder}`, borderRadius: 8 }}
            >
              <ShieldCheck style={{ width: 26, height: 26, color: RC.purple }} />
            </div>
            <div className="flex-1 min-w-0">
              <p style={raj(22, 700)}>AEGIS</p>
              <p style={mono(7, "#a855f766", 3)}>HYBRID PROTECTION PROTOCOL</p>
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{ color: "#444" }}>
              <X style={{ width: 20, height: 20 }} />
            </button>
          </div>

          <p style={{ ...mono(7, RC.mutedDark, 1), marginTop: 10 }}>
            PERFIL {profile?.usoErgogenicos ? `· ${profile.usoErgogenicos}` : "· NÃO PREENCHIDO"}
          </p>

          {/* tabs */}
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: "none" }}>
            {aegisCategories.map((c) => {
              const Icon = ICONS[c.id] ?? Shield;
              const on = c.id === cat;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className="flex items-center gap-1.5 shrink-0"
                  style={{
                    ...mono(7, on ? RC.purple : "#444", 2),
                    padding: "10px 16px",
                    borderRadius: 6,
                    background: on ? "#a855f70a" : "transparent",
                    border: `1px solid ${on ? RC.purpleBorder : "transparent"}`,
                    boxShadow: on ? "0 0 12px #a855f708" : "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <Icon style={{ width: 13, height: 13 }} /> {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-4 sm:px-5 py-4 space-y-4">
          {/* warning */}
          <div
            className="flex gap-2"
            style={{ background: "#f9731608", border: "1px solid #f9731622", borderRadius: 8, padding: "12px 16px" }}
          >
            <AlertTriangle style={{ width: 14, height: 14, color: RC.orange, flexShrink: 0, marginTop: 2 }} />
            <span style={{ ...mono(8, RC.orange, 0), textTransform: "none", lineHeight: 1.5 }}>{AEGIS_DISCLAIMER}</span>
          </div>

          <div>
            <p style={raj(16, 700, RC.purple)}>{active.label}</p>
            <p style={{ fontSize: 12, color: "#555", marginTop: 3, lineHeight: 1.5 }}>{active.desc}</p>
          </div>

          {protocols.map((p) => (
            <div
              key={p.id}
              style={{
                background: RC.card,
                border: `1px solid ${RC.border}`,
                borderLeft: `3px solid ${RC.purple}`,
                borderRadius: 8,
                padding: 16,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 style={raj(14, 600)}>{p.title}</h4>
                <RBadge color={RELEVANCE_COLORS[p.hybridRelevance] ?? RC.gold}>{p.hybridRelevance.toUpperCase()}</RBadge>
              </div>

              <div className="mt-2">
                <RBadge color={EVIDENCE_COLORS[p.evidence] ?? RC.cyan}>{evidenceLabels[p.evidence]}</RBadge>
              </div>

              <p style={{ fontSize: 12, color: "#666", lineHeight: 1.6, marginTop: 10 }}>{p.context}</p>

              <div className="space-y-2 mt-3">
                {p.compounds.map((c) => (
                  <div key={c.name} style={{ background: RC.bg2, border: `1px solid ${RC.border}`, borderRadius: 6, padding: 12 }}>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span style={{ fontSize: 13, fontWeight: 600, color: RC.purple }}>{c.name}</span>
                      <span style={{ fontSize: 12, color: RC.muted }}>{c.dosageRange}</span>
                    </div>
                    <p style={{ fontSize: 12, color: "#555", marginTop: 4 }}>
                      <span style={mono(7, RC.mutedDark, 2)}>TIMING · </span>{c.timing}
                    </p>
                    <p style={{ fontSize: 12, color: "#555", marginTop: 4, lineHeight: 1.5 }}>{c.mechanism}</p>
                    {c.interactionWithRunning !== "—" && (
                      <p style={{ fontSize: 12, color: "#666", marginTop: 6, lineHeight: 1.5, borderTop: `1px solid ${RC.border}`, paddingTop: 6 }}>
                        <span style={mono(7, RC.cyan, 2)}>CORRIDA · </span>{c.interactionWithRunning}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {p.warnings.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {p.warnings.map((w) => (
                    <li key={w} style={{ fontSize: 11, color: RC.orange, lineHeight: 1.5 }}>⚠ {w}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {hidden > 0 && (
            <p style={{ fontSize: 12, color: "#555", lineHeight: 1.5, border: `1px dashed ${RC.border}`, borderRadius: 8, padding: 12 }}>
              {hidden} protocolo(s) desta categoria estão fora do seu perfil ergogênico atual
              {profile ? "" : " (perfil não preenchido)"}. Atualize o Step 5 do seu perfil para liberar.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
