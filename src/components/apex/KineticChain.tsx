import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChevronDown, ChevronUp, AlertTriangle, Zap, CheckCircle2, Link2, Loader2, RefreshCw } from "lucide-react";

export interface KineticElo {
  ordem: number;
  segmento: string;
  compensacao: string;
  musculo_sobrecarregado: string;
  musculo_inibido: string;
  mecanismo: string;
}

export interface KineticChain {
  id: string;
  nome: string;
  tipo: "ascendente" | "descendente" | "cruzada";
  origem: { segmento: string; disfuncao: string; evidencia: string };
  elos: KineticElo[];
  ponto_critico: { segmento: string; motivo: string };
  consequencias_longoprazo: string[];
  intervencao_prioritaria: string;
  confianca: number;
}

interface Props {
  sessionId?: string | null;
  dysfunctions?: any;
  muscleMap?: any;
  measurements?: any;
  analysisRaw?: string;
  athleteProfile?: any;
  autoGenerate?: boolean;
  onChainsReady?: (chains: KineticChain[]) => void;
}

const TIPO_COLOR: Record<string, string> = {
  ascendente: "#EF9F27",
  descendente: "#00D4FF",
  cruzada: "#9C27B0",
};

const SEV_COLOR = (ordem: number, total: number, isCritico: boolean) => {
  if (isCritico) return "#FFD700";
  if (ordem === 1) return "#FF3366";
  if (ordem === total) return "#FF3366";
  return "#FFB300";
};

export default function KineticChain({
  sessionId,
  dysfunctions,
  muscleMap,
  measurements,
  analysisRaw,
  athleteProfile,
  autoGenerate = true,
  onChainsReady,
}: Props) {
  const [chains, setChains] = useState<KineticChain[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tried, setTried] = useState(false);

  const hasInput = useMemo(() => {
    const d = Array.isArray(dysfunctions) ? dysfunctions.length : (dysfunctions ? 1 : 0);
    const m = Array.isArray(muscleMap) ? muscleMap.length : (muscleMap ? 1 : 0);
    return Boolean(d || m || (analysisRaw && analysisRaw.length > 200));
  }, [dysfunctions, muscleMap, analysisRaw]);

  const generate = async () => {
    if (loading) return;
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.functions.invoke("apex-kinetic-chain", {
        body: { dysfunctions, muscleMap, measurements, analysisRaw, athleteProfile },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      const list: KineticChain[] = (data as any)?.cadeias_cineticas || [];
      setChains(list);
      onChainsReady?.(list);
      if (sessionId && list.length) {
        try {
          await supabase
            .from("apex_guided_sessions")
            .update({ kinetic_chains: list as any } as any)
            .eq("id", sessionId);
        } catch {/* coluna opcional */}
      }
    } catch (e: any) {
      setError(e?.message || "Falha ao gerar cadeia cinética");
    } finally {
      setLoading(false);
      setTried(true);
    }
  };

  // Tenta carregar cadeias salvas
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!sessionId) return;
      try {
        const { data } = await supabase
          .from("apex_guided_sessions")
          .select("kinetic_chains" as any)
          .eq("id", sessionId)
          .maybeSingle();
        const saved = (data as any)?.kinetic_chains;
        if (alive && Array.isArray(saved) && saved.length) {
          setChains(saved);
          onChainsReady?.(saved);
          setTried(true);
        }
      } catch {/* coluna pode não existir ainda */}
    })();
    return () => { alive = false; };
  }, [sessionId]);

  useEffect(() => {
    if (autoGenerate && !tried && !loading && hasInput && chains.length === 0) {
      generate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoGenerate, tried, loading, hasInput]);

  return (
    <section
      className="rounded-xl border p-4 mt-4"
      style={{ background: "#0A0D16", borderColor: "#161D2E" }}
    >
      <header className="flex items-center justify-between gap-3 flex-wrap mb-3">
        <h3
          className="flex items-center gap-2"
          style={{
            color: "#EF9F27",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: "0.12em",
          }}
        >
          <Link2 size={14} /> ⛓ CADEIAS DE COMPENSAÇÃO DETECTADAS
        </h3>
        <button
          onClick={generate}
          disabled={loading || !hasInput}
          className="text-[10px] px-2.5 py-1 rounded border flex items-center gap-1.5 disabled:opacity-40"
          style={{ borderColor: "#1E2A42", color: "#7A8AAA" }}
        >
          {loading ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
          {chains.length ? "Reanalisar" : "Gerar análise"}
        </button>
      </header>

      {!hasInput && (
        <div className="text-[11px] text-muted-foreground">
          Aguardando achados posturais para mapear cadeias cinéticas.
        </div>
      )}

      {error && (
        <div className="text-[11px] mb-3 px-2 py-1.5 rounded border" style={{ borderColor: "#FF336640", color: "#FF6688", background: "#FF336612" }}>
          {error}
        </div>
      )}

      {loading && chains.length === 0 && (
        <div className="flex items-center gap-2 text-[11px] text-muted-foreground py-6">
          <Loader2 size={12} className="animate-spin" /> Mapeando cadeias de compensação…
        </div>
      )}

      {!loading && tried && chains.length === 0 && !error && (
        <div className="text-[11px] text-muted-foreground py-4">
          Nenhuma cadeia cinética significativa detectada com os achados atuais.
        </div>
      )}

      <div className="space-y-3">
        {chains.map((c) => {
          const isOpen = expanded[c.id] ?? false;
          const tipoColor = TIPO_COLOR[c.tipo] || "#EF9F27";
          const total = c.elos?.length || 0;
          return (
            <article
              key={c.id}
              className="rounded-lg border overflow-hidden"
              style={{ borderColor: "#1E2A42", background: "#0E1220" }}
            >
              <button
                onClick={() => setExpanded((s) => ({ ...s, [c.id]: !isOpen }))}
                className="w-full flex items-center justify-between gap-3 px-3 py-2.5 text-left"
                style={{ background: "#0d0d1f" }}
              >
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className="text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-widest"
                    style={{ background: `${tipoColor}22`, color: tipoColor, border: `1px solid ${tipoColor}55` }}
                  >
                    {c.tipo}
                  </span>
                  <span className="text-[13px] font-semibold text-white">{c.nome}</span>
                  <span className="text-[10px] text-muted-foreground font-mono">
                    {Math.round(c.confianca || 0)}% confiança
                  </span>
                </div>
                {isOpen ? <ChevronUp size={14} className="text-muted-foreground" /> : <ChevronDown size={14} className="text-muted-foreground" />}
              </button>

              {isOpen && (
                <div className="p-3 space-y-3">
                  {/* Origem */}
                  <div
                    className="rounded p-2.5 text-[11px]"
                    style={{ background: "#3a0d12", border: "1px solid #FF336655", color: "#FFD0D8" }}
                  >
                    <div className="font-bold mb-0.5" style={{ color: "#FF6688" }}>
                      Origem: {c.origem?.segmento} — {c.origem?.disfuncao}
                    </div>
                    <div style={{ color: "#FFD0D880" }}>Evidência: {c.origem?.evidencia}</div>
                  </div>

                  {/* Cascata */}
                  <div className="flex flex-col items-stretch gap-0">
                    {c.elos?.sort((a, b) => a.ordem - b.ordem).map((elo, idx) => {
                      const isCrit = c.ponto_critico?.segmento?.toLowerCase() === elo.segmento?.toLowerCase();
                      const color = SEV_COLOR(elo.ordem, total, isCrit);
                      const emoji = isCrit ? "🟡" : (elo.ordem === 1 || elo.ordem === total ? "🔴" : "🟡");
                      return (
                        <div key={`${c.id}-${elo.ordem}`}>
                          <div
                            className="rounded p-2.5"
                            style={{
                              background: "#0d0d1f",
                              borderLeft: `2px solid ${color}`,
                              boxShadow: isCrit ? `0 0 0 1px ${color}40` : undefined,
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <span
                                className="inline-flex items-center justify-center text-[10px] font-bold text-white rounded-full"
                                style={{ background: color, width: 18, height: 18 }}
                              >
                                {elo.ordem}
                              </span>
                              <span className="text-[12px] font-bold text-white">{emoji} {elo.segmento?.toUpperCase()}</span>
                            </div>
                            <div className="text-[11px] text-muted-foreground mb-0.5">{elo.compensacao}</div>
                            {elo.musculo_sobrecarregado && (
                              <div className="text-[11px]" style={{ color: "#FF6688" }}>
                                ↑ Sobrecarregado: {elo.musculo_sobrecarregado}
                              </div>
                            )}
                            {elo.musculo_inibido && (
                              <div className="text-[11px]" style={{ color: "#00E676" }}>
                                ↓ Inibido: {elo.musculo_inibido}
                              </div>
                            )}
                            {elo.mecanismo && (
                              <div className="text-[10px] mt-1 font-mono" style={{ color: "#7A8AAA" }}>
                                {elo.mecanismo}
                              </div>
                            )}
                          </div>
                          {idx < (c.elos.length - 1) && (
                            <div className="flex flex-col items-center" style={{ height: 28 }}>
                              <div style={{ width: 1, flex: 1, background: "#ffffff20" }} />
                              <div
                                className="text-[9px]"
                                style={{
                                  color: "#ffffff30",
                                  fontFamily: "'JetBrains Mono', monospace",
                                  position: "relative",
                                  top: -14,
                                  background: "#0E1220",
                                  padding: "0 6px",
                                }}
                              >
                                gera compensação
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Ponto crítico */}
                  {c.ponto_critico?.segmento && (
                    <div
                      className="rounded p-2.5 text-[11px] flex items-start gap-2"
                      style={{ background: "#FFB30015", border: "1px solid #FFB30060", color: "#FFE7A8" }}
                    >
                      <Zap size={14} style={{ color: "#FFD700", flexShrink: 0, marginTop: 1 }} className="animate-pulse" />
                      <div>
                        <div className="font-bold" style={{ color: "#FFD700" }}>
                          PONTO CRÍTICO: {c.ponto_critico.segmento}
                        </div>
                        <div style={{ color: "#FFE7A8CC" }}>{c.ponto_critico.motivo}</div>
                      </div>
                    </div>
                  )}

                  {/* Consequências */}
                  {Array.isArray(c.consequencias_longoprazo) && c.consequencias_longoprazo.length > 0 && (
                    <div className="space-y-1">
                      {c.consequencias_longoprazo.map((cons, i) => (
                        <div key={i} className="flex items-start gap-2 text-[11px]" style={{ color: "#FF9F66" }}>
                          <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
                          <span>{cons}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Intervenção prioritária */}
                  {c.intervencao_prioritaria && (
                    <div
                      className="rounded p-2.5 text-[11px] flex items-start gap-2"
                      style={{ background: "#00E67615", border: "1px solid #00E67660", color: "#B6F5C9" }}
                    >
                      <CheckCircle2 size={14} style={{ color: "#00E676", flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div className="font-bold" style={{ color: "#00E676" }}>TRATAR PRIMEIRO</div>
                        <div>{c.intervencao_prioritaria}</div>
                        <div className="mt-1 text-[10px]" style={{ color: "#B6F5C9AA" }}>
                          Tratar a origem resolve os elos em cascata.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
