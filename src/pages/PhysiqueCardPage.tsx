// ARSENAL VIRAL — PHYSIQUE CARD (tela do aluno)
import { useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, Loader2, Share2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import PhysiqueCard, { CARD_HEIGHTS, CARD_WIDTH, type CardFormat, type CardVariant, type PhysiqueCardData } from "@/components/arsenal/PhysiqueCard";
import RankBadge from "@/components/arsenal/RankBadge";
import { useApexArsenal } from "@/hooks/useApexArsenal";
import { STREAK_MILESTONES } from "@/lib/apexStreaks";
import { toast } from "@/hooks/use-toast";

const VARIANTES: { key: CardVariant; label: string; desc: string }[] = [
  { key: "standard", label: "STANDARD", desc: "Todos os dados da avaliação" },
  { key: "evolution", label: "EVOLUTION", desc: "Score anterior vs atual" },
  { key: "achievement", label: "ACHIEVEMENT", desc: "Foco na conquista" },
  { key: "season", label: "SEASON", desc: "Resumo do ciclo" },
  { key: "minimal", label: "MINIMAL", desc: "Compacto para stories" },
];

const PhysiqueCardPage = () => {
  const navigate = useNavigate();
  const { data, loading } = useApexArsenal();
  const [variant, setVariant] = useState<CardVariant>("standard");
  const [format, setFormat] = useState<CardFormat>("4:5");
  const [conquistaIdx, setConquistaIdx] = useState(0);
  const [exportando, setExportando] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const previewScale = format === "4:5" ? 0.34 : 0.26;

  const cardData: PhysiqueCardData | null = useMemo(() => {
    if (!data || data.scoreAtual === null || !data.rank) return null;
    const destaque = data.conquistas[conquistaIdx] || data.conquistas[0] || null;
    return {
      nome: data.nome,
      fotoUrl: data.fotoUrl,
      objetivo: data.objetivo,
      fase: data.avaliadoEm ? `Avaliação de ${new Date(`${data.avaliadoEm.slice(0, 10)}T12:00:00`).toLocaleDateString("pt-BR")}` : null,
      scoreAtual: data.scoreAtual,
      scoreAnterior: data.scoreAnterior,
      delta: data.delta,
      rank: data.rank,
      pesoKg: data.pesoKg,
      bfPercent: data.bfPercent,
      alturaCm: data.alturaCm,
      streakDias: data.streak.atual,
      totalTreinos: data.streak.totalTreinos,
      destaques: variant === "minimal" ? [] : data.destaques,
      conquistas: data.conquistas.map((c) => ({ badge: c.badge, titulo: c.titulo })),
      conquistaDestaque: destaque ? { badge: destaque.badge, titulo: destaque.titulo, mensagem: "Conquista registrada pelo APEX." } : null,
    };
  }, [data, variant, conquistaIdx]);

  const exportar = async (compartilhar: boolean) => {
    if (!cardRef.current) return;
    setExportando(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const canvas = await html2canvas(cardRef.current, { backgroundColor: "#020205", scale: 1, useCORS: true, width: CARD_WIDTH, height: CARD_HEIGHTS[format] });
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (!blob) throw new Error("falha ao gerar imagem");
      const file = new File([blob], `physique-card-${Date.now()}.png`, { type: "image/png" });

      const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
      if (compartilhar && nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: "Physique Card nutriON", text: "Transformação é sistema. nutrion.app.br" });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        URL.revokeObjectURL(url);
        toast({ title: "Card salvo", description: "Imagem baixada. Suba no story pelo Instagram." });
      }
    } catch {
      toast({ title: "Não foi possível gerar o card", description: "Tente novamente em instantes.", variant: "destructive" });
    } finally {
      setExportando(false);
    }
  };

  const milestone = data?.streak.milestone;
  const proximo = data?.streak.proximoMilestone ?? STREAK_MILESTONES[0];

  return (
    <div className="min-h-screen pb-24" style={{ background: "#020205" }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <button onClick={() => navigate("/dashboard")} className="p-2 text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-sm font-bold text-white" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: ".06em" }}>PHYSIQUE CARD</h1>
          <p className="text-[10px] text-white/40" style={{ fontFamily: "'Space Mono', monospace" }}>Patente, streak e conquistas do seu APEX</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 mt-5 space-y-5">
        {loading && (
          <div className="flex items-center gap-2 text-white/50 text-sm py-10 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" /> Carregando seus dados
          </div>
        )}

        {!loading && (!data || data.scoreAtual === null || !data.rank) && (
          <div className="border p-5 text-sm text-white/60" style={{ borderColor: "rgba(255,255,255,.1)", fontFamily: "'Space Mono', monospace" }}>
            Nenhuma avaliação APEX registrada ainda. Seu card, sua patente e o delta de score aparecem aqui depois da primeira avaliação com o coach.
          </div>
        )}

        {!loading && data && cardData && (
          <>
            <div className="flex items-center gap-4">
              <RankBadge rank={cardData.rank} size={104} />
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{cardData.rank.descricao}</p>
                {data.proximaPatente && (
                  <p className="text-[11px] text-white/45 mt-1" style={{ fontFamily: "'Space Mono', monospace" }}>
                    Próxima: {data.proximaPatente.nome} (score {data.proximaPatente.min}+)
                  </p>
                )}
                <p className="text-[11px] mt-1" style={{ color: "#EF9F27", fontFamily: "'Space Mono', monospace" }}>
                  🔥 {data.streak.atual} dias {milestone ? `• ${milestone.titulo}` : proximo ? `• faltam ${proximo.dias - data.streak.atual} para ${proximo.titulo}` : ""}
                </p>
              </div>
            </div>

            {data.mensagemPatente && (
              <div className="border p-4 text-[12px] text-white/75 whitespace-pre-line" style={{ borderColor: "rgba(0,212,255,.35)", fontFamily: "'Space Mono', monospace" }}>
                {data.mensagemPatente}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {VARIANTES.map((v) => (
                <button
                  key={v.key}
                  onClick={() => setVariant(v.key)}
                  className="px-3 py-2 text-[10px] font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace", letterSpacing: ".08em",
                    border: `1px solid ${variant === v.key ? "#00D4FF" : "rgba(255,255,255,.14)"}`,
                    color: variant === v.key ? "#00D4FF" : "rgba(255,255,255,.55)",
                    background: variant === v.key ? "rgba(0,212,255,.08)" : "transparent",
                  }}
                >
                  {v.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40" style={{ fontFamily: "'Space Mono', monospace" }}>
              {VARIANTES.find((v) => v.key === variant)?.desc}
            </p>

            {variant === "achievement" && data.conquistas.length > 1 && (
              <select
                value={conquistaIdx}
                onChange={(e) => setConquistaIdx(Number(e.target.value))}
                className="w-full px-3 py-2 text-[11px] bg-transparent text-white"
                style={{ border: "1px solid rgba(255,255,255,.14)", fontFamily: "'Space Mono', monospace" }}
              >
                {data.conquistas.map((c, i) => (
                  <option key={c.id} value={i} style={{ background: "#020205" }}>{c.badge} {c.titulo}</option>
                ))}
              </select>
            )}

            <div className="flex gap-2">
              {(["4:5", "9:16"] as CardFormat[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFormat(f)}
                  className="flex-1 py-2 text-[10px] font-bold"
                  style={{
                    fontFamily: "'Space Mono', monospace",
                    border: `1px solid ${format === f ? "#B8922A" : "rgba(255,255,255,.14)"}`,
                    color: format === f ? "#B8922A" : "rgba(255,255,255,.55)",
                  }}
                >
                  {f === "4:5" ? "FEED 4:5" : "STORY 9:16"}
                </button>
              ))}
            </div>

            {/* Preview escalado do card real */}
            <div
              className="mx-auto overflow-hidden"
              style={{ width: CARD_WIDTH * previewScale, height: CARD_HEIGHTS[format] * previewScale }}
            >
              <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left" }}>
                <PhysiqueCard ref={cardRef} data={cardData} variant={variant} format={format} />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => exportar(true)}
                disabled={exportando}
                className="flex-1 flex items-center justify-center gap-2 py-3 text-[11px] font-bold disabled:opacity-50"
                style={{ fontFamily: "'Space Mono', monospace", background: "#00D4FF", color: "#020205" }}
              >
                {exportando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Share2 className="w-4 h-4" />}
                COMPARTILHAR NOS STORIES
              </button>
              <button
                onClick={() => exportar(false)}
                disabled={exportando}
                className="px-4 flex items-center justify-center disabled:opacity-50"
                style={{ border: "1px solid rgba(255,255,255,.18)", color: "rgba(255,255,255,.7)" }}
              >
                <Download className="w-4 h-4" />
              </button>
            </div>

            {data.conquistas.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] text-white/40" style={{ fontFamily: "'Space Mono', monospace", letterSpacing: ".16em" }}>CONQUISTAS</p>
                <div className="flex flex-wrap gap-2">
                  {data.conquistas.map((c) => (
                    <span key={c.id} className="px-3 py-2 text-[10px]" style={{ border: "1px solid rgba(184,146,42,.4)", color: "#B8922A", fontFamily: "'Space Mono', monospace" }}>
                      {c.badge} {c.titulo}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default PhysiqueCardPage;
