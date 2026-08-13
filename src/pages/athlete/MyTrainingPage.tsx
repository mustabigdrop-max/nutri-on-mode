import { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Dumbbell, Loader2 } from "lucide-react";
import { useAthletePlans } from "@/hooks/useAthletePlans";
import AthleteBottomNav from "@/components/athlete/AthleteBottomNav";
import { MarkdownProtocolView } from "@/components/training/MarkdownProtocolView";
import { parseProtocolText } from "@/lib/parseProtocolText";
import { athleteQuery, useAthleteTarget } from "@/hooks/useAthleteTarget";

const BG = "#020205";
const GREEN = "#00FF88";
const TEXT = "#FFFFFF";
const DIM = "#A0A0A0";

const MyTrainingPage = () => {
  const navigate = useNavigate();
  const targetId = useAthleteTarget();
  const { loading, training } = useAthletePlans(targetId || undefined);

  useEffect(() => {
    document.title = "Meu Treino · NUTRION";
  }, []);

  const content = useMemo(() => {
    if (!training?.protocolText) return null;
    const { json, markdown } = parseProtocolText(training.protocolText);
    return json || markdown || null;
  }, [training]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: BG }}>
        <Loader2 className="w-7 h-7 animate-spin" style={{ color: GREEN }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-28" style={{ background: BG, color: TEXT }}>
      <header className="px-4 pt-6 pb-4 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(`/dashboard${athleteQuery(targetId)}`)}
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "rgba(255,255,255,0.05)" }}
            aria-label="Voltar"
          >
            <ArrowLeft className="w-4 h-4" style={{ color: DIM }} />
          </button>
          <div>
            <h1 className="text-xl font-black flex items-center gap-2">
              <Dumbbell className="w-5 h-5" style={{ color: GREEN }} />
              Meu Treino
            </h1>
            {training && (
              <p className="text-[11px]" style={{ color: DIM }}>
                Atualizado em {new Date(training.updatedAt).toLocaleDateString("pt-BR")}
              </p>
            )}
          </div>
        </div>

        {training && (
          <div className="grid grid-cols-3 gap-2">
            {[
              ["Fase", training.phase || "—"],
              ["Duração", training.weeks ? `${training.weeks} sem` : "—"],
              ["Frequência", training.daysPerWeek ? `${training.daysPerWeek}x` : "—"],
            ].map(([l, v]) => (
              <div
                key={l as string}
                className="rounded-xl p-3 text-center"
                style={{ border: `1px solid ${GREEN}22`, background: `${GREEN}0a` }}
              >
                <p className="text-sm font-bold" style={{ color: GREEN }}>{v}</p>
                <p className="text-[10px] uppercase tracking-wider" style={{ color: DIM }}>{l}</p>
              </div>
            ))}
          </div>
        )}
      </header>

      <main className="px-4 max-w-3xl mx-auto">
        {content ? (
          <MarkdownProtocolView content={content} title={training?.clientName || "Protocolo"} />
        ) : (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ border: `1px solid ${GREEN}22`, background: `${GREEN}08` }}
          >
            <p className="text-sm font-semibold">Nenhum treino enviado ainda</p>
            <p className="text-xs mt-1" style={{ color: DIM }}>
              Assim que seu coach enviar, ele aparece aqui.
            </p>
          </div>
        )}
      </main>

      <AthleteBottomNav />
    </div>
  );
};

export default MyTrainingPage;
