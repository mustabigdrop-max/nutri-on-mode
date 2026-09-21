// APEX — MAPA MUSCULAR DO ATLETA
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import ApexBodyMap, { type ZonaMapa } from "@/components/apex/ApexBodyMap";
import { useApexArsenal } from "@/hooks/useApexArsenal";

const ApexMapaPage = () => {
  const navigate = useNavigate();
  const { data, loading } = useApexArsenal();

  const zonas: ZonaMapa[] = useMemo(() => {
    if (!data) return [];
    const deltas = new Map(data.deltas.map((d) => [d.grupo, d.anterior === null ? null : d.delta]));
    return data.zonas.map((z) => ({
      grupo: z.grupo,
      score: Math.round(z.score),
      delta: deltas.get(z.grupo) ?? null,
    }));
  }, [data]);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#020205" }}>
      <div className="flex items-center gap-3 px-4 pt-4 pb-3 border-b" style={{ borderColor: "rgba(255,255,255,.08)" }}>
        <button onClick={() => navigate("/gamification")} className="p-2 text-white/60 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-white text-lg tracking-widest" style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700 }}>
            MAPA MUSCULAR
          </h1>
          <p className="text-[11px] text-white/40" style={{ fontFamily: "'Space Mono', monospace" }}>
            {data?.avaliadoEm ? `Última avaliação: ${data.avaliadoEm}` : "Transformação é sistema."}
          </p>
        </div>
      </div>

      <div className="px-4 pt-5">
        {loading ? (
          <div className="flex justify-center py-20 text-white/50"><Loader2 className="w-5 h-5 animate-spin" /></div>
        ) : zonas.length === 0 ? (
          <p className="text-sm text-white/50 leading-relaxed">
            Nenhuma avaliação de grupos musculares registrada ainda. Assim que a primeira avaliação entrar,
            o mapa acende com os scores reais de cada grupo.
          </p>
        ) : (
          <>
            <ApexBodyMap zonas={zonas} />
            <p className="text-[11px] text-white/40 mt-4" style={{ fontFamily: "'Space Mono', monospace" }}>
              Toque em um grupo para ver o score e a variação desde a avaliação anterior.
            </p>
          </>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default ApexMapaPage;
