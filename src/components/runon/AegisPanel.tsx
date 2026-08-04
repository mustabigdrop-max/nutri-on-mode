import { useState } from "react";
import { X, Shield, ShieldCheck, Zap, Moon, Flame, Bone, AlertTriangle } from "lucide-react";
import {
  AEGIS, aegisCategories, aegisProtocols, evidenceColors, evidenceLabels,
  relevanceColors, AEGIS_DISCLAIMER, AegisCategory,
} from "@/data/aegisData";
import { HybridProfile, aegisTierFromProfile } from "@/lib/runonProfile";

const ICONS: Record<string, any> = { Shield, Zap, Moon, Flame, Bone };

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
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />

      <aside
        className="relative h-full w-full sm:w-[520px] overflow-y-auto animate-slide-in-right"
        style={{ background: AEGIS.bg, borderLeft: `1px solid ${AEGIS.cyan}33` }}
      >
        {/* header */}
        <div
          className="sticky top-0 z-10 px-5 py-4"
          style={{ background: AEGIS.bg, borderBottom: `1px solid ${AEGIS.border}` }}
        >
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-6 h-6 shrink-0" style={{ color: AEGIS.cyan }} />
            <div className="flex-1">
              <p style={{ fontSize: 18, fontWeight: 900, color: AEGIS.text, letterSpacing: "2px" }}>AEGIS</p>
              <p style={{ fontSize: 10, color: AEGIS.muted, letterSpacing: "2px", fontWeight: 700 }}>
                HYBRID PROTECTION PROTOCOL
              </p>
            </div>
            <button onClick={onClose} aria-label="Fechar" style={{ color: AEGIS.muted }}>
              <X className="w-5 h-5" />
            </button>
          </div>
          <p style={{ fontSize: 11, color: "#777", marginTop: 8 }}>
            Protocolo baseado no seu perfil de atleta híbrido
            {profile?.usoErgogenicos ? ` · ${profile.usoErgogenicos}` : " · perfil não preenchido"}
          </p>

          {/* category tabs */}
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1" style={{ scrollbarWidth: "none" }}>
            {aegisCategories.map((c) => {
              const Icon = ICONS[c.icon] ?? Shield;
              const on = c.id === cat;
              return (
                <button
                  key={c.id}
                  onClick={() => setCat(c.id)}
                  className="flex items-center gap-1.5 shrink-0 px-3 py-1.5"
                  style={{
                    border: `1px solid ${on ? `${c.color}66` : "#333"}`,
                    background: on ? `${c.color}15` : "transparent",
                    color: on ? c.color : "#777",
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.5px", borderRadius: 20, whiteSpace: "nowrap",
                  }}
                >
                  <Icon className="w-3 h-3" /> {c.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="px-5 py-4 space-y-4">
          {/* disclaimer */}
          <div
            className="flex gap-2"
            style={{ background: "#f9731622", border: "1px solid #f9731644", color: "#f97316", fontSize: 11, borderRadius: 8, padding: 12, lineHeight: 1.5 }}
          >
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{AEGIS_DISCLAIMER}</span>
          </div>

          <div>
            <p style={{ fontSize: 13, fontWeight: 800, color: active.color, letterSpacing: "1px" }}>{active.label}</p>
            <p style={{ fontSize: 12, color: AEGIS.muted, marginTop: 2 }}>{active.desc}</p>
          </div>

          {protocols.map((p) => (
            <div
              key={p.id}
              style={{ background: AEGIS.card, border: `1px solid ${AEGIS.border}`, borderLeft: `3px solid ${active.color}`, borderRadius: 8, padding: 16 }}
            >
              <div className="flex items-start justify-between gap-3">
                <h4 style={{ fontSize: 14, fontWeight: 800, color: AEGIS.text }}>{p.title}</h4>
                <span style={{ fontSize: 9, fontWeight: 800, color: relevanceColors[p.hybridRelevance], border: `1px solid ${relevanceColors[p.hybridRelevance]}44`, background: `${relevanceColors[p.hybridRelevance]}18`, borderRadius: 4, padding: "2px 6px", whiteSpace: "nowrap" }}>
                  {p.hybridRelevance.toUpperCase()}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                <span style={{ fontSize: 9, fontWeight: 800, color: evidenceColors[p.evidence], border: `1px solid ${evidenceColors[p.evidence]}44`, background: `${evidenceColors[p.evidence]}18`, borderRadius: 4, padding: "2px 6px" }}>
                  {evidenceLabels[p.evidence]}
                </span>
              </div>

              <p style={{ fontSize: 12, color: "#aaa", lineHeight: 1.55, marginTop: 10 }}>{p.context}</p>

              <div className="space-y-2 mt-3">
                {p.compounds.map((c) => (
                  <div key={c.name} style={{ background: AEGIS.inner, border: `1px solid ${AEGIS.border}`, borderRadius: 6, padding: 12 }}>
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span style={{ fontSize: 12.5, fontWeight: 700, color: AEGIS.cyan }}>{c.name}</span>
                      <span style={{ fontSize: 11, color: AEGIS.purple, fontWeight: 600 }}>{c.dosageRange}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#888", marginTop: 4 }}>
                      <span style={{ color: "#666" }}>Timing · </span>{c.timing}
                    </p>
                    <p style={{ fontSize: 11, color: "#999", marginTop: 4, lineHeight: 1.5 }}>{c.mechanism}</p>
                    {c.interactionWithRunning !== "—" && (
                      <p style={{ fontSize: 11, color: "#bbb", marginTop: 6, lineHeight: 1.5, borderTop: "1px solid #222", paddingTop: 6 }}>
                        <span style={{ color: AEGIS.cyan, fontWeight: 700 }}>Corrida · </span>{c.interactionWithRunning}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {p.warnings.length > 0 && (
                <ul className="mt-3 space-y-1">
                  {p.warnings.map((w) => (
                    <li key={w} style={{ fontSize: 11, color: "#f97316", lineHeight: 1.5 }}>⚠ {w}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}

          {hidden > 0 && (
            <p style={{ fontSize: 11, color: "#666", lineHeight: 1.5, border: "1px dashed #333", borderRadius: 8, padding: 12 }}>
              {hidden} protocolo(s) desta categoria estão fora do seu perfil ergogênico atual
              {profile ? "" : " (perfil não preenchido)"}. Atualize o Step 5 do seu perfil para liberar.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
