// MERIDIAN — Bridge cross-módulo. Mostra recomendações por fase para NutriPlan,
// TrainingON, Dr. VERTEX, MCE e APEX, com persistência de handoffs.
import { useMemo, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ALL_HANDOFF_MODULES, buildHandoff, type HandoffModule } from "@/lib/meridian/handoffs";
import { useMeridianHandoffs } from "@/hooks/useMeridianHandoffs";
import { getCurrentPhase } from "@/lib/meridian/calculator";
import { trackMeridianEvent } from "@/lib/meridian/telemetry";
import type { MeridianCompetition, MeridianPlan } from "@/lib/meridian/types";

interface Props {
  plan: MeridianPlan;
  competition: MeridianCompetition;
}

const ACCENT = "#B8922A";

const MODULE_ROUTES: Record<HandoffModule, string> = {
  nutriplan: "/dashboard?module=nutriplan",
  trainingon: "/training-on",
  dr_vertex: "/dr-vertex",
  mce: "/mce",
  apex: "/apex",
};

export default function MeridianCrossModuleBridge({ plan, competition }: Props) {
  const phase = getCurrentPhase(plan);
  const { rows, createHandoff, updateStatus } = useMeridianHandoffs(plan.id);
  const [sending, setSending] = useState<HandoffModule | null>(null);

  const handoffs = useMemo(
    () => ALL_HANDOFF_MODULES.map((m) => ({ module: m, payload: buildHandoff(m, plan, competition) })),
    [plan, competition],
  );

  const latestFor = (m: HandoffModule) => rows.find((r) => r.target_module === m);

  async function send(module: HandoffModule) {
    setSending(module);
    const payload = buildHandoff(module, plan, competition);
    const r = await createHandoff({
      plan_id: plan.id,
      competition_id: competition.id,
      target_module: module,
      phase,
      payload,
    });
    setSending(null);
    if (r) {
      trackMeridianEvent("handoff_sent", {
        planId: plan.id,
        data: { module, phase, headline: payload.headline },
      });
      toast({
        title: `Handoff enviado → ${payload.module_label}`,
        description: payload.headline,
      });
    } else {
      toast({ title: "Erro ao enviar handoff", variant: "destructive" });
    }
  }

  async function handleStatus(id: string, status: "applied" | "discarded", module: HandoffModule) {
    await updateStatus(id, status);
    trackMeridianEvent(status === "applied" ? "handoff_applied" : "handoff_discarded", {
      planId: plan.id,
      data: { module, phase },
    });
  }

  return (
    <div
      style={{
        background: "rgba(184,146,42,0.04)",
        border: "1px solid rgba(184,146,42,0.3)",
        borderLeft: `4px solid ${ACCENT}`,
        padding: 20,
        borderRadius: 4,
        fontFamily: "'Space Grotesk', sans-serif",
        color: "#e8e8e8",
      }}
    >
      <div style={{ fontSize: 10, letterSpacing: 3, color: "#7a7a7a", marginBottom: 4 }}>
        INTEGRAÇÕES CROSS-MÓDULO
      </div>
      <div style={{ fontSize: 18, fontWeight: 700, color: ACCENT, marginBottom: 14 }}>
        Handoff Tático
      </div>
      <p style={{ fontSize: 12, color: "#9a9a9a", marginBottom: 16 }}>
        MERIDIAN propaga o contexto da fase ativa ({phase}) para os módulos operacionais. Envie um handoff
        e abra o módulo para aplicar.
      </p>

      <div style={{ display: "grid", gap: 10 }}>
        {handoffs.map(({ module, payload }) => {
          const latest = latestFor(module);
          return (
            <div
              key={module}
              style={{
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: 14,
                borderRadius: 4,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#e8e8e8", letterSpacing: 0.5 }}>
                    {payload.module_label}
                  </div>
                  <div style={{ fontSize: 11, color: "#9a9a9a", marginTop: 2 }}>{payload.headline}</div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  {latest && (
                    <span
                      style={{
                        fontSize: 9,
                        letterSpacing: 1,
                        padding: "3px 7px",
                        borderRadius: 2,
                        background:
                          latest.status === "applied"
                            ? "rgba(74,222,128,0.15)"
                            : latest.status === "discarded"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(250,204,21,0.15)",
                        color:
                          latest.status === "applied"
                            ? "#4ade80"
                            : latest.status === "discarded"
                            ? "#ef4444"
                            : "#facc15",
                        textTransform: "uppercase",
                      }}
                    >
                      {latest.status}
                    </span>
                  )}
                  <button
                    onClick={() => send(module)}
                    disabled={sending === module}
                    style={{
                      fontSize: 10,
                      letterSpacing: 1.5,
                      padding: "5px 10px",
                      background: ACCENT,
                      color: "#000",
                      border: "none",
                      borderRadius: 2,
                      cursor: sending === module ? "wait" : "pointer",
                      textTransform: "uppercase",
                      fontWeight: 700,
                    }}
                  >
                    {sending === module ? "..." : "Enviar"}
                  </button>
                  <a
                    href={MODULE_ROUTES[module]}
                    onClick={() =>
                      trackMeridianEvent("bridge_module_opened", {
                        planId: plan.id,
                        data: { module, phase },
                      })
                    }
                    style={{
                      fontSize: 10,
                      letterSpacing: 1.5,
                      padding: "5px 10px",
                      background: "transparent",
                      color: "#e8e8e8",
                      border: "1px solid rgba(255,255,255,0.15)",
                      borderRadius: 2,
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    Abrir
                  </a>
                </div>
              </div>
              <ul style={{ margin: "10px 0 0", padding: 0, listStyle: "none", display: "grid", gap: 4 }}>
                {payload.bullets.map((b, i) => (
                  <li key={i} style={{ fontSize: 11, color: "#c8c8c8" }}>
                    · {b}
                  </li>
                ))}
              </ul>
              {latest && latest.status === "pending" && (
                <div style={{ marginTop: 8, display: "flex", gap: 6 }}>
                  <button
                    onClick={() => handleStatus(latest.id, "applied", module)}
                    style={{
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "3px 8px",
                      background: "rgba(74,222,128,0.15)",
                      color: "#4ade80",
                      border: "1px solid rgba(74,222,128,0.3)",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Marcar aplicado
                  </button>
                  <button
                    onClick={() => handleStatus(latest.id, "discarded", module)}
                    style={{
                      fontSize: 9,
                      letterSpacing: 1,
                      padding: "3px 8px",
                      background: "rgba(239,68,68,0.1)",
                      color: "#ef4444",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 2,
                      cursor: "pointer",
                    }}
                  >
                    Descartar
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
