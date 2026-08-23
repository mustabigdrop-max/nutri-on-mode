import { useState } from "react";
import { Link } from "react-router-dom";
import { Crown, FileDown, MessageCircle, Camera, FlaskConical, CalendarCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ChallengeHeader } from "@/components/challenge/ChallengeLayout";
import { useChallenge } from "@/hooks/useChallenge";
import { supabase } from "@/integrations/supabase/client";
import { CHALLENGE_DAYS, OBJETIVO_LABEL, challengeDay } from "@/lib/challenge";
import { downloadMyChallengeReport, type MyReportLog } from "@/lib/challengeMyReport";
import { toast } from "sonner";

const CHECKPOINTS = [
  { day: 7, title: "Ajuste 1 · Calibração", desc: "Revisão de aderência e correção de porções." },
  { day: 14, title: "Ajuste 2 · Metabolismo", desc: "Peso real vs projeção — kcal recalculadas na mão." },
  { day: 21, title: "Ajuste 3 · Sprint", desc: "Estratégia de reta final e timing de carboidrato." },
  { day: 30, title: "Fechamento", desc: "Relatório de transformação + próximo ciclo." },
];

export default function ChallengeVipPage() {
  const { participant, challenge } = useChallenge();
  const [busy, setBusy] = useState(false);
  if (!participant) return null;

  const day = challengeDay(challenge?.start_date);
  const isVip = participant.tier === "vip";

  const waLink = (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`;

  async function generateReport() {
    setBusy(true);
    try {
      const { data } = await supabase
        .from("challenge_daily_logs")
        .select("log_date,points,day_completed,mood,training_done,water_ml")
        .eq("user_id", participant!.user_id)
        .order("log_date", { ascending: true });
      downloadMyChallengeReport({
        fullName: participant!.full_name,
        tier: participant!.tier,
        objetivo: OBJETIVO_LABEL[participant!.objetivo] ?? participant!.objetivo,
        mceScore: participant!.mce_score,
        streak: participant!.streak,
        weightStart: participant!.weight_start,
        weightCurrent: participant!.weight_current,
        day,
        challengeName: challenge?.name ?? "Desafio 30 Dias",
        logs: (data ?? []) as unknown as MyReportLog[],
      });
      toast.success("Relatório de transformação gerado");
    } catch {
      toast.error("Não foi possível gerar o relatório agora");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <ChallengeHeader title="🏆 Área VIP" subtitle={`Dia ${day}/${CHALLENGE_DAYS} · acompanhamento direto`} />

      <div className="px-4 space-y-4 pb-6">
        {!isVip ? (
          <Card className="border-primary/40 bg-primary/5">
            <CardContent className="p-5 space-y-3 text-center">
              <Crown className="mx-auto h-8 w-8 text-primary" />
              <p className="text-sm font-black">Acompanhamento direto é VIP</p>
              <p className="text-xs text-muted-foreground">
                Ajuste manual do Coach, leitura de exames, prioridade no WhatsApp e relatório final de transformação.
              </p>
              <Button asChild className="w-full"><Link to="/desafio/planos">Ver o VIP →</Link></Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Card className="border-primary/40 bg-primary/5">
              <CardContent className="p-4 space-y-1">
                <p className="text-sm font-black text-primary">VIP ATIVO</p>
                <p className="text-xs text-muted-foreground">
                  Seu plano é ajustado na mão em cada checkpoint. Nada aqui é automático.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold tracking-wide text-muted-foreground">CANAL DIRETO</p>
                <Button asChild className="w-full gap-2">
                  <a href={waLink(`Coach, sou VIP do desafio (dia ${day}). Preciso de ajuste:`)} target="_blank" rel="noreferrer">
                    <MessageCircle className="h-4 w-4" /> Falar com o Coach agora
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full gap-2">
                  <a href={waLink(`Coach, vou enviar meus exames para leitura (dia ${day} do desafio).`)} target="_blank" rel="noreferrer">
                    <FlaskConical className="h-4 w-4" /> Enviar exames para leitura
                  </a>
                </Button>
                <Button asChild variant="outline" className="w-full gap-2">
                  <Link to="/desafio/evolucao"><Camera className="h-4 w-4" /> Enviar fotos para análise</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="flex items-center gap-1.5 text-xs font-bold tracking-wide text-muted-foreground">
                  <CalendarCheck className="h-3.5 w-3.5 text-primary" /> CHECKPOINTS DE AJUSTE MANUAL
                </p>
                {CHECKPOINTS.map((c) => {
                  const done = day >= c.day;
                  return (
                    <div key={c.day} className="flex gap-3 rounded-lg border p-3" style={{ opacity: done ? 1 : 0.6 }}>
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-black"
                        style={{
                          background: done ? "hsl(var(--primary) / 0.15)" : "hsl(var(--muted))",
                          color: done ? "hsl(var(--primary))" : undefined,
                        }}
                      >
                        D{c.day}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4 space-y-3">
                <p className="text-xs font-bold tracking-wide text-muted-foreground">RELATÓRIO DE TRANSFORMAÇÃO</p>
                <p className="text-xs text-muted-foreground">
                  PDF com MCE Score, aderência, evolução diária de pontos e variação de peso — pronto para guardar ou postar.
                </p>
                <Button onClick={generateReport} disabled={busy} className="w-full gap-2">
                  <FileDown className="h-4 w-4" /> {busy ? "Gerando..." : "Baixar meu relatório (PDF)"}
                </Button>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
