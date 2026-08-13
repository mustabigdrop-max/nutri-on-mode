import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileBarChart, Send, ArrowRight, FileText } from "lucide-react";
import { toast } from "sonner";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";

interface ReportRow {
  id: string;
  athlete_id: string;
  semana: number | null;
  conteudo: string | null;
  enviado_ao_atleta: boolean | null;
  created_at: string;
}

export default function CoachReportsPage() {
  const navigate = useNavigate();
  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [selected, setSelected] = useState<ReportRow | null>(null);

  useEffect(() => {
    if (!athlete) { setReports([]); setSelected(null); return; }
    (async () => {
      const { data } = await supabase
        .from("athlete_weekly_reports" as any)
        .select("*")
        .eq("athlete_id", athlete.id)
        .order("created_at", { ascending: false })
        .limit(20);
      const list = ((data as any) || []) as ReportRow[];
      setReports(list);
      setSelected(list[0] ?? null);
    })();
  }, [athlete]);

  const enviar = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("athlete_weekly_reports" as any)
      .update({ enviado_ao_atleta: true })
      .eq("id", selected.id);
    if (error) {
      toast.error("Falha ao marcar como enviado");
      return;
    }
    toast.success("Relatório marcado como enviado ao atleta");
    setSelected({ ...selected, enviado_ao_atleta: true });
    setReports((rs) => rs.map((r) => r.id === selected.id ? { ...r, enviado_ao_atleta: true } : r));
  };

  return (
    <div className="space-y-4 max-w-6xl">
      <Card className="border-amber-500/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileBarChart className="h-5 w-5 text-amber-500" /> Relatórios Semanais
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Histórico de relatórios gerados por atleta. Para criar novo, use o tracker do atleta.
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />

          {athlete && reports.length === 0 && (
            <div className="text-sm text-muted-foreground">
              Nenhum relatório ainda.{" "}
              <button className="underline text-amber-500" onClick={() => navigate(`/coach/atletas/${athlete.id}`)}>
                Gerar primeiro relatório →
              </button>
            </div>
          )}

          {reports.length > 0 && (
            <div className="grid md:grid-cols-[260px_1fr] gap-4">
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1">
                {reports.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setSelected(r)}
                    className={`w-full text-left p-3 rounded-md border transition-colors ${
                      selected?.id === r.id ? "border-amber-500/60 bg-amber-500/10" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Semana {r.semana ?? "—"}</span>
                      {r.enviado_ao_atleta && <Badge variant="outline" className="text-xs">enviado</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </button>
                ))}
              </div>

              <Card className="bg-card border-border">
                <CardHeader className="flex-row items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Conteúdo
                  </CardTitle>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={enviar} disabled={!selected || selected.enviado_ao_atleta || false}>
                      <Send className="h-4 w-4 mr-2" />
                      {selected?.enviado_ao_atleta ? "Enviado" : "Enviar ao atleta"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <pre className="text-sm whitespace-pre-wrap font-sans leading-relaxed">
                    {selected?.conteudo || "—"}
                  </pre>
                </CardContent>
              </Card>
            </div>
          )}

          {athlete && (
            <Button variant="outline" onClick={() => navigate(`/coach/atletas/${athlete.id}`)}>
              <ArrowRight className="h-4 w-4 mr-2" /> Gerar novo relatório no tracker
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
