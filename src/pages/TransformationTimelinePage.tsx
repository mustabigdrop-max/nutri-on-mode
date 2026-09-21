// ARSENAL VIRAL — TRANSFORMATION TIMELINE + LIVE APEX (roteiros)
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useApexArsenal } from "@/hooks/useApexArsenal";
import { gerarTimeline, timelineComoTexto, type TimelineFormato } from "@/lib/transformationTimeline";
import {
  gerarRoteiroLiveApex, roteiroComoTexto, LIVE_APEX_VARIACOES,
  type DeficitGrupo, type LiveApexVariacao,
} from "@/lib/liveApexScript";
import type { MuscleScoreRow } from "@/lib/apexMuscleScore";
import { toast } from "@/hooks/use-toast";

const BG = "#020205";
const CIANO = "#00D4FF";
const DOURADO = "#B8922A";

type Aba = "timeline" | "live";

const TransformationTimelinePage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: arsenal } = useApexArsenal();
  const [aba, setAba] = useState<Aba>("timeline");
  const [rows, setRows] = useState<MuscleScoreRow[]>([]);
  const [grupos, setGrupos] = useState<DeficitGrupo[]>([]);
  const [loading, setLoading] = useState(true);
  const [formato, setFormato] = useState<TimelineFormato>("9:16");
  const [variacao, setVariacao] = useState<LiveApexVariacao>("padrao");
  const [episodio, setEpisodio] = useState(1);

  useEffect(() => {
    if (!user?.id) { setLoading(false); return; }
    let ativo = true;
    (async () => {
      const [scoresRes, diagRes] = await Promise.all([
        supabase.from("apex_muscle_scores").select("*").eq("user_id", user.id).order("assessment_date", { ascending: true }),
        supabase.from("apex_deficit_diagnoses").select("grupos, avaliado_em").eq("athlete_id", user.id).order("avaliado_em", { ascending: false }).limit(1),
      ]);
      if (!ativo) return;
      setRows((scoresRes.data || []) as MuscleScoreRow[]);
      const raw = diagRes.data?.[0]?.grupos;
      const lista = Array.isArray(raw)
        ? (raw as { grupo?: string; deficits?: { tipo?: string; severidade?: string; evidencias?: string[] }[]; protocolos_ativos?: string[] }[])
            .flatMap((g) => (g.deficits || [])
              .filter((d) => d.tipo && d.tipo.toUpperCase() !== "ADEQUADO")
              .map((d) => ({
                grupo: g.grupo || "",
                tipo: String(d.tipo),
                severidade: d.severidade ?? null,
                evidencias: Array.isArray(d.evidencias) ? d.evidencias : [],
                protocolos: Array.isArray(g.protocolos_ativos) ? g.protocolos_ativos : [],
              })))
            .filter((d) => d.grupo)
        : [];
      setGrupos(lista);
      setLoading(false);
    })();
    return () => { ativo = false; };
  }, [user?.id]);

  const timeline = useMemo(
    () => gerarTimeline({ nome: arsenal?.nome || "Atleta", rows, formato }),
    [arsenal?.nome, rows, formato],
  );

  const roteiro = useMemo(
    () => gerarRoteiroLiveApex({
      numeroEpisodio: episodio,
      variacao,
      atleta: (arsenal?.nome || "Atleta").split(" ")[0],
      objetivo: arsenal?.objetivo ?? null,
      grupos,
      scoreAtual: arsenal?.scoreAtual ?? null,
      scoreAnterior: arsenal?.scoreAnterior ?? null,
      semanasDecorridas: null,
    }),
    [episodio, variacao, arsenal?.nome, arsenal?.objetivo, arsenal?.scoreAtual, arsenal?.scoreAnterior, grupos],
  );

  const texto = aba === "timeline"
    ? (timeline ? timelineComoTexto(timeline) : "")
    : (roteiro ? roteiroComoTexto(roteiro) : "");

  const copiar = async () => {
    if (!texto) return;
    await navigator.clipboard.writeText(texto);
    toast({ title: "Roteiro copiado", description: "Cole no CapCut, InShot ou nas notas." });
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: BG }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <button onClick={() => navigate("/dashboard")} className="p-2 text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white text-lg tracking-widest" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
            ROTEIROS DE EVOLUÇÃO
          </h1>
          <p className="text-[11px] text-white/40" style={{ fontFamily: "'Space Mono', monospace" }}>
            Transformação é sistema.
          </p>
        </div>
      </div>

      <div className="flex gap-2 px-4 pt-4">
        {([["timeline", "TIMELINE"], ["live", "APEX DIAGNÓSTICO"]] as [Aba, string][]).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setAba(k)}
            className="px-3 py-2 text-[11px] tracking-widest border"
            style={{
              fontFamily: "'Space Mono', monospace",
              borderColor: aba === k ? CIANO : "rgba(255,255,255,.12)",
              color: aba === k ? CIANO : "rgba(255,255,255,.5)",
              background: aba === k ? "rgba(0,212,255,.08)" : "transparent",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-white/50">
          <Loader2 className="w-5 h-5 animate-spin" />
        </div>
      ) : aba === "timeline" ? (
        <div className="px-4 pt-4 space-y-4">
          <div className="flex gap-2">
            {(["9:16", "4:5"] as TimelineFormato[]).map((f) => (
              <button
                key={f}
                onClick={() => setFormato(f)}
                className="px-3 py-1.5 text-[11px] border"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  borderColor: formato === f ? DOURADO : "rgba(255,255,255,.12)",
                  color: formato === f ? DOURADO : "rgba(255,255,255,.5)",
                }}
              >
                {f === "9:16" ? "STORY / REEL" : "FEED"}
              </button>
            ))}
          </div>

          {!timeline ? (
            <p className="text-sm text-white/50 leading-relaxed">
              Para montar a linha do tempo são necessárias pelo menos duas avaliações registradas.
              Assim que a próxima avaliação entrar, o roteiro aparece aqui com os números reais.
            </p>
          ) : (
            <>
              <div className="border p-4" style={{ borderColor: "rgba(0,212,255,.25)" }}>
                <p className="text-white text-2xl" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
                  {timeline.scoreInicial} → {timeline.scoreFinal}
                  <span style={{ color: timeline.deltaTotal >= 0 ? "#5DCAA5" : "#FF4444" }}>
                    {" "}({timeline.deltaTotal >= 0 ? "+" : ""}{timeline.deltaTotal})
                  </span>
                </p>
                <p className="text-[11px] text-white/50 mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                  {timeline.periodo} · {timeline.pontos.length} avaliações · ~{timeline.duracaoSegundos}s
                </p>
                {timeline.promocoes.length > 0 && (
                  <p className="text-[11px] mt-2" style={{ color: DOURADO, fontFamily: "'Space Mono', monospace" }}>
                    {timeline.promocoes.join(" · ")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                {timeline.frames.map((f) => (
                  <div key={f.ordem} className="border p-3" style={{ borderColor: "rgba(255,255,255,.1)" }}>
                    <p className="text-[10px] tracking-widest" style={{ color: CIANO, fontFamily: "'Space Mono', monospace" }}>
                      FRAME {f.ordem} · {f.segundos}s · {f.titulo}
                    </p>
                    <p className="text-white text-sm mt-1">{f.legenda}</p>
                    {f.dados.map((d) => (
                      <p key={d} className="text-[12px] text-white/60 mt-0.5">• {d}</p>
                    ))}
                    <p className="text-[11px] text-white/40 mt-1.5 italic">{f.direcao}</p>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="px-4 pt-4 space-y-4">
          <div className="flex flex-wrap gap-2">
            {LIVE_APEX_VARIACOES.map((v) => (
              <button
                key={v.key}
                onClick={() => setVariacao(v.key)}
                className="px-3 py-1.5 text-[10px] tracking-widest border text-left"
                style={{
                  fontFamily: "'Space Mono', monospace",
                  borderColor: variacao === v.key ? CIANO : "rgba(255,255,255,.12)",
                  color: variacao === v.key ? CIANO : "rgba(255,255,255,.5)",
                }}
              >
                {v.label}
              </button>
            ))}
          </div>

          <label className="block text-[11px] text-white/50" style={{ fontFamily: "'Space Mono', monospace" }}>
            Número do episódio
            <input
              type="number"
              min={1}
              value={episodio}
              onChange={(e) => setEpisodio(Math.max(1, Number(e.target.value) || 1))}
              className="mt-1 w-24 bg-transparent border px-2 py-1 text-white"
              style={{ borderColor: "rgba(255,255,255,.15)" }}
            />
          </label>

          {!roteiro ? (
            <p className="text-sm text-white/50 leading-relaxed">
              O roteiro sai do diagnóstico registrado no APEX. Sem deficit registrado na última avaliação,
              não há nada para roteirizar — nenhum dado é criado aqui.
            </p>
          ) : (
            <div className="space-y-2">
              <div className="border p-4" style={{ borderColor: "rgba(184,146,42,.3)" }}>
                <p className="text-white text-lg" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
                  {roteiro.titulo}
                </p>
                <p className="text-[11px] text-white/50" style={{ fontFamily: "'Space Mono', monospace" }}>
                  ~{roteiro.duracaoSegundos}s
                </p>
              </div>
              {roteiro.blocos.map((b) => (
                <div key={b.nome} className="border p-3" style={{ borderColor: "rgba(255,255,255,.1)" }}>
                  <p className="text-[10px] tracking-widest" style={{ color: DOURADO, fontFamily: "'Space Mono', monospace" }}>
                    {b.nome} · {b.segundos}s
                  </p>
                  {b.fala.map((f, i) => (
                    <p key={i} className="text-white text-sm mt-1">“{f}”</p>
                  ))}
                  <p className="text-[11px] text-white/40 mt-1.5 italic">{b.direcao}</p>
                </div>
              ))}
              <p className="text-[11px] text-white/40 break-words" style={{ fontFamily: "'Space Mono', monospace" }}>
                {roteiro.hashtags.join(" ")}
              </p>
            </div>
          )}
        </div>
      )}

      {texto && (
        <div className="px-4 pt-5">
          <button
            onClick={copiar}
            className="w-full py-3 flex items-center justify-center gap-2 text-[12px] tracking-widest"
            style={{ background: CIANO, color: BG, fontFamily: "'Space Mono', monospace" }}
          >
            <Copy className="w-4 h-4" /> COPIAR ROTEIRO
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default TransformationTimelinePage;
