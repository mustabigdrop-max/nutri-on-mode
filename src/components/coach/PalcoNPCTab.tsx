import { useMemo, useState } from "react";
import { toast } from "sonner";
import { NPC_STANDARDS, mapCategoryKeyToNPC, type NPCCategory } from "@/utils/npcStandards";
import {
  runAestheticAnalysis,
  urlToBase64,
  type AestheticAnalysis,
  type AchadoClinicoLite,
  type AtletaContext,
} from "@/utils/aestheticAnalysis";

interface Props {
  photoUrls: { front?: string; side?: string; back?: string };
  initialCategoryKey: string;
  athlete: AtletaContext;
  achados: AchadoClinicoLite[];
}

const VISTAS = [
  { id: "FRENTE" as const, label: "Frente", photoKey: "front" as const },
  { id: "LATERAL" as const, label: "Lateral", photoKey: "side" as const },
  { id: "COSTAS" as const, label: "Costas", photoKey: "back" as const },
];

export default function PalcoNPCTab({ photoUrls, initialCategoryKey, athlete, achados }: Props) {
  const [categoria, setCategoria] = useState<NPCCategory>(() => mapCategoryKeyToNPC(initialCategoryKey));
  const [vista, setVista] = useState<"FRENTE" | "COSTAS" | "LATERAL">("FRENTE");
  const [analysis, setAnalysis] = useState<AestheticAnalysis | null>(null);
  const [loading, setLoading] = useState(false);

  const standard = NPC_STANDARDS[categoria];
  const currentVista = VISTAS.find((v) => v.id === vista)!;
  const currentPhoto = photoUrls?.[currentVista.photoKey];

  const orderedGrupos = useMemo(
    () => (analysis?.grupos ? [...analysis.grupos].sort((a, b) => a.score - b.score) : []),
    [analysis]
  );

  async function runAnalysis() {
    if (!currentPhoto) {
      toast.error(`Foto da vista ${currentVista.label.toLowerCase()} não disponível.`);
      return;
    }
    setLoading(true);
    try {
      const imageBase64 = await urlToBase64(currentPhoto);
      const result = await runAestheticAnalysis({
        imageBase64,
        categoria,
        vista,
        achados,
        atleta: athlete,
      });
      setAnalysis(result);
      toast.success("Análise NPC concluída.");
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Falha na análise NPC.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "16px 4px" }}>
      {/* Header NPC */}
      <div
        style={{
          padding: "12px 16px",
          marginBottom: 16,
          background: "rgba(184,146,42,0.07)",
          border: "0.5px solid rgba(184,146,42,0.2)",
          borderRadius: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0, flex: 1 }}>
          <p style={{ fontSize: 10, fontWeight: 700, color: "#B8922A", letterSpacing: "0.12em", margin: "0 0 2px" }}>
            NPC / IFBB — PADRÃO OFICIAL 2024
          </p>
          <p style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0 }}>
            {standard.nome}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.45)", margin: "3px 0 0", lineHeight: 1.5 }}>
            {standard.descricao}
          </p>
        </div>
        <select
          value={categoria}
          onChange={(e) => {
            setCategoria(e.target.value as NPCCategory);
            setAnalysis(null);
          }}
          style={{
            padding: "7px 10px",
            background: "rgba(255,255,255,0.05)",
            border: "0.5px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            fontSize: 11,
            color: "rgba(255,255,255,0.75)",
            outline: "none",
          }}
        >
          {(Object.keys(NPC_STANDARDS) as NPCCategory[]).map((key) => (
            <option key={key} value={key} style={{ background: "#0a0a12" }}>
              {NPC_STANDARDS[key].nome}
            </option>
          ))}
        </select>
      </div>

      {/* Seletor de vista */}
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {VISTAS.map((v) => {
          const active = vista === v.id;
          const available = !!photoUrls?.[v.photoKey];
          return (
            <button
              key={v.id}
              disabled={!available}
              onClick={() => {
                setVista(v.id);
                setAnalysis(null);
              }}
              style={{
                flex: 1,
                padding: "8px",
                background: active ? "rgba(184,146,42,0.15)" : "rgba(255,255,255,0.04)",
                border: `0.5px solid ${active ? "rgba(184,146,42,0.4)" : "rgba(255,255,255,0.08)"}`,
                borderRadius: 8,
                cursor: available ? "pointer" : "not-allowed",
                fontSize: 11,
                fontWeight: active ? 600 : 400,
                color: active ? "#B8922A" : "rgba(255,255,255,0.45)",
                opacity: available ? 1 : 0.35,
              }}
            >
              {v.label}
            </button>
          );
        })}
      </div>

      {/* Botão analisar */}
      {!analysis && (
        <button
          onClick={runAnalysis}
          disabled={loading || !currentPhoto}
          style={{
            width: "100%",
            padding: "12px",
            background: "rgba(184,146,42,0.18)",
            border: "0.5px solid rgba(184,146,42,0.4)",
            borderRadius: 10,
            cursor: loading || !currentPhoto ? "not-allowed" : "pointer",
            fontSize: 13,
            fontWeight: 600,
            color: "#B8922A",
            marginBottom: 16,
            opacity: !currentPhoto ? 0.5 : 1,
          }}
        >
          {loading
            ? "Analisando como juiz NPC…"
            : !currentPhoto
            ? `📷 Foto de ${currentVista.label.toLowerCase()} não disponível`
            : "🏆 Analisar com padrão NPC"}
        </button>
      )}

      {analysis && (
        <div>
          {/* Penalizações eliminatórias no topo */}
          {analysis.penalizacoes?.some((p) => /ELIMIN/i.test(p.impacto)) && (
            <div
              style={{
                marginBottom: 14,
                padding: "10px 12px",
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.4)",
                borderRadius: 10,
              }}
            >
              <p style={{ fontSize: 10, fontWeight: 700, color: "#EF4444", margin: "0 0 4px", letterSpacing: "0.08em" }}>
                ⚠ PENALIZAÇÃO ELIMINATÓRIA
              </p>
              {analysis.penalizacoes
                .filter((p) => /ELIMIN/i.test(p.impacto))
                .map((p, i) => (
                  <p key={i} style={{ fontSize: 11, color: "rgba(255,255,255,0.85)", margin: "2px 0 0" }}>
                    {p.descricao}
                  </p>
                ))}
            </div>
          )}

          {/* Scores principais */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
            {[
              { label: "Score Geral", value: analysis.score_geral, cor: "#B8922A" },
              { label: "Simetria", value: analysis.score_simetria, cor: "#38BDF8" },
              { label: "Proporção", value: analysis.score_proporcao, cor: "#A78BFA" },
              { label: "Condicionamento", value: analysis.score_condicionamento, cor: "#34D399" },
            ].map((s, i) => {
              const circum = 2 * Math.PI * 20;
              const dash = (Math.max(0, Math.min(100, s.value)) / 100) * circum;
              return (
                <div
                  key={i}
                  style={{
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.04)",
                    border: `0.5px solid ${s.cor}25`,
                    borderRadius: 10,
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                  }}
                >
                  <svg width="48" height="48" viewBox="0 0 48 48">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="4" />
                    <circle
                      cx="24" cy="24" r="20" fill="none" stroke={s.cor} strokeWidth="4"
                      strokeDasharray={`${dash} ${circum}`} strokeLinecap="round"
                      transform="rotate(-90 24 24)"
                    />
                    <text x="24" y="28" textAnchor="middle" fill={s.cor} fontSize="10" fontWeight="700">
                      {s.value}
                    </text>
                  </svg>
                  <div>
                    <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "0 0 2px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                      {s.label}
                    </p>
                    <p style={{
                      fontSize: 11,
                      color: s.value >= 80 ? "#34D399" : s.value >= 60 ? "#FBBF24" : "#EF4444",
                      margin: 0, fontWeight: 600,
                    }}>
                      {s.value >= 80 ? "Excelente" : s.value >= 60 ? "Bom" : s.value >= 40 ? "Regular" : "Fraco"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mensagem do juiz */}
          {analysis.mensagem_juiz && (
            <div style={{
              padding: "12px 14px", marginBottom: 14,
              background: "rgba(184,146,42,0.08)",
              border: "0.5px solid rgba(184,146,42,0.25)",
              borderRadius: 10,
            }}>
              <p style={{ fontSize: 9, color: "#B8922A", letterSpacing: "0.08em", margin: "0 0 6px", fontWeight: 700 }}>
                💬 AVALIAÇÃO DO JUIZ NPC
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.78)", margin: 0, lineHeight: 1.7, fontStyle: "italic" }}>
                “{analysis.mensagem_juiz}”
              </p>
            </div>
          )}

          {/* Top 3 prioridades */}
          {analysis.top_3_prioridades?.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase", fontWeight: 700 }}>
                TOP 3 PRIORIDADES PARA O PALCO
              </p>
              {analysis.top_3_prioridades.map((p, i) => (
                <div key={i} style={{
                  display: "flex", gap: 10, marginBottom: 8,
                  padding: "8px 12px",
                  background: "rgba(255,255,255,0.04)",
                  borderRadius: 9,
                }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: 7,
                    background: "rgba(184,146,42,0.15)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700, color: "#B8922A", flexShrink: 0,
                  }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.72)", margin: 0, lineHeight: 1.5 }}>
                    {p}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Grupos musculares */}
          {orderedGrupos.length > 0 && (
            <>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase", fontWeight: 700 }}>
                ANÁLISE POR GRUPO MUSCULAR
              </p>
              {orderedGrupos.map((g, i) => {
                const cor = g.score >= 8 ? "#34D399" : g.score >= 6 ? "#FBBF24" : g.score >= 4 ? "#FB923C" : "#EF4444";
                return (
                  <div key={i} style={{
                    marginBottom: 8,
                    padding: "10px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${cor}25`,
                    borderLeft: `2px solid ${cor}`,
                    borderRadius: 10,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 8 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.85)", margin: 0 }}>
                        {g.nome}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {g.assimetria_pct > 5 && g.lado_dominante !== "SIMETRICO" && (
                          <span style={{
                            fontSize: 9, color: "#FBBF24",
                            background: "rgba(251,191,36,0.1)",
                            border: "0.5px solid rgba(251,191,36,0.25)",
                            padding: "1px 6px", borderRadius: 6,
                          }}>
                            {g.lado_dominante} +{Math.round(g.assimetria_pct)}%
                          </span>
                        )}
                        <span style={{ fontSize: 13, fontWeight: 700, color: cor }}>{g.score}/10</span>
                      </div>
                    </div>
                    {g.descricao && (
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", margin: "0 0 5px", lineHeight: 1.5 }}>
                        {g.descricao}
                      </p>
                    )}
                    {g.comparacao_npc && (
                      <p style={{ fontSize: 9, color: "rgba(184,146,42,0.75)", margin: "0 0 4px", fontStyle: "italic" }}>
                        vs NPC: {g.comparacao_npc}
                      </p>
                    )}
                    {g.pontos_fortes?.length > 0 && (
                      <div style={{ marginTop: 4, padding: "5px 8px", background: "rgba(52,211,153,0.06)", borderRadius: 6 }}>
                        {g.pontos_fortes.map((f, j) => (
                          <p key={j} style={{ fontSize: 9, color: "rgba(52,211,153,0.8)", margin: 0 }}>
                            ✓ {f}
                          </p>
                        ))}
                      </div>
                    )}
                    {g.pontos_fracos?.length > 0 && (
                      <div style={{ marginTop: 4, padding: "5px 8px", background: "rgba(239,68,68,0.06)", borderRadius: 6 }}>
                        {g.pontos_fracos.map((f, j) => (
                          <p key={j} style={{ fontSize: 9, color: "rgba(239,68,68,0.78)", margin: 0 }}>
                            · {f}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </>
          )}

          {/* Proporções */}
          {analysis.proporcoes?.length > 0 && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase", fontWeight: 700 }}>
                PROPORÇÕES CALCULADAS
              </p>
              {analysis.proporcoes.map((r, i) => {
                const cor =
                  r.status === "EXCELENTE" ? "#34D399" :
                  r.status === "BOM" ? "#FBBF24" :
                  r.status === "REGULAR" ? "#FB923C" : "#EF4444";
                return (
                  <div key={i} style={{
                    marginBottom: 6, padding: "8px 12px",
                    background: "rgba(255,255,255,0.03)",
                    border: `0.5px solid ${cor}25`,
                    borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.8)", margin: 0 }}>{r.nome}</p>
                      <span style={{ fontSize: 10, fontWeight: 700, color: cor }}>{r.status}</span>
                    </div>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
                      Atual: <strong>{r.valor}</strong> · Ideal: {r.ideal} · {r.diferenca}
                    </p>
                  </div>
                );
              })}
            </div>
          )}

          {/* Penalizações restantes */}
          {analysis.penalizacoes?.some((p) => !/ELIMIN/i.test(p.impacto)) && (
            <div style={{ marginTop: 14 }}>
              <p style={{ fontSize: 9, color: "rgba(239,68,68,0.7)", letterSpacing: "0.08em", margin: "0 0 8px", textTransform: "uppercase", fontWeight: 700 }}>
                ⚠ PENALIZAÇÕES NPC DETECTADAS
              </p>
              {analysis.penalizacoes
                .filter((p) => !/ELIMIN/i.test(p.impacto))
                .map((p, i) => (
                  <div key={i} style={{
                    marginBottom: 6, padding: "8px 12px",
                    background: "rgba(239,68,68,0.07)",
                    border: "0.5px solid rgba(239,68,68,0.2)",
                    borderRadius: 8,
                  }}>
                    <p style={{ fontSize: 10, fontWeight: 600, color: "#EF4444", margin: "0 0 2px" }}>
                      {p.impacto} — {p.urgencia}
                    </p>
                    <p style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", margin: 0 }}>{p.descricao}</p>
                  </div>
                ))}
            </div>
          )}

          {/* Recomendação de categoria */}
          {analysis.categoria_ideal && analysis.categoria_ideal !== analysis.categoria_atual && (
            <div style={{
              marginTop: 14, padding: "12px 14px",
              background: "rgba(56,189,248,0.07)",
              border: "0.5px solid rgba(56,189,248,0.2)",
              borderRadius: 10,
            }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#38BDF8", margin: "0 0 4px" }}>
                💡 RECOMENDAÇÃO DE CATEGORIA → {NPC_STANDARDS[analysis.categoria_ideal as NPCCategory]?.nome ?? analysis.categoria_ideal}
              </p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.65)", margin: 0, lineHeight: 1.5 }}>
                {analysis.motivo_categoria}
              </p>
            </div>
          )}

          {/* Reanalisar */}
          <button
            onClick={() => setAnalysis(null)}
            style={{
              width: "100%", marginTop: 14, padding: "8px",
              background: "transparent",
              border: "0.5px solid rgba(255,255,255,0.1)",
              borderRadius: 8, cursor: "pointer",
              fontSize: 11, color: "rgba(255,255,255,0.45)",
            }}
          >
            ↺ Nova análise
          </button>
        </div>
      )}
    </div>
  );
}
