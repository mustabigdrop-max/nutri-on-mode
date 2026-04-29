import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Upload, Camera, Sparkles, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Assessment {
  id: string;
  athlete_id: string;
  data_avaliacao: string;
  semana: number | null;
  peso_kg: number | null;
  bf_estimado: number | null;
  score_geral: number | null;
  foto_frente_url: string | null;
  foto_costas_url: string | null;
  foto_lateral_url: string | null;
  observacoes_coach: string | null;
  meta_semana: string | null;
  scores_grupos: any;
}

export default function AthleteProgressTracker() {
  const { id: athleteId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [athlete, setAthlete] = useState<any>(null);
  const [assessments, setAssessments] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [compareA, setCompareA] = useState<string | null>(null);
  const [compareB, setCompareB] = useState<string | null>(null);
  const [reportA, setReportA] = useState<string | null>(null);
  const [reportB, setReportB] = useState<string | null>(null);
  const [reportFocus, setReportFocus] = useState<string>("");
  const [report, setReport] = useState<string>("");

  // novo check-in
  const [novoPeso, setNovoPeso] = useState("");
  const [novoBf, setNovoBf] = useState("");
  const [novoScore, setNovoScore] = useState("");
  const [novaMeta, setNovaMeta] = useState("");
  const [novaObs, setNovaObs] = useState("");
  const [novaFoto, setNovaFoto] = useState<File | null>(null);

  useEffect(() => {
    if (!athleteId) return;
    (async () => {
      const { data: at } = await supabase.from("competition_athletes" as any).select("*").eq("id", athleteId).maybeSingle();
      setAthlete(at);
      const { data: avs } = await supabase
        .from("athlete_visual_assessments" as any)
        .select("*")
        .eq("athlete_id", athleteId)
        .order("data_avaliacao", { ascending: false });
      setAssessments((avs as any) || []);
      setLoading(false);
    })();
  }, [athleteId]);

  const uploadFoto = async (file: File): Promise<string | null> => {
    if (!user || !athleteId) return null;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${athleteId}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("athlete-photos").upload(path, file);
    if (error) {
      toast.error("Falha no upload: " + error.message);
      return null;
    }
    return path;
  };

  const salvarCheckIn = async () => {
    if (!user || !athleteId) return;
    setUploading(true);
    try {
      let fotoPath: string | null = null;
      if (novaFoto) fotoPath = await uploadFoto(novaFoto);

      const { error } = await supabase.from("athlete_visual_assessments" as any).insert({
        athlete_id: athleteId,
        coach_id: user.id,
        data_avaliacao: new Date().toISOString().slice(0, 10),
        semana: assessments.length + 1,
        peso_kg: novoPeso ? parseFloat(novoPeso) : null,
        bf_estimado: novoBf ? parseFloat(novoBf) : null,
        score_geral: novoScore ? parseInt(novoScore) : null,
        meta_semana: novaMeta || null,
        observacoes_coach: novaObs || null,
        foto_frente_url: fotoPath,
      });
      if (error) throw error;
      toast.success("Check-in salvo");
      setNovoPeso(""); setNovoBf(""); setNovoScore(""); setNovaMeta(""); setNovaObs(""); setNovaFoto(null);
      window.location.reload();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const gerarRelatorio = async () => {
    if (!athlete || assessments.length === 0) {
      toast.error("Sem dados suficientes");
      return;
    }
    if (!reportA || !reportB) {
      toast.error("Selecione as duas semanas para o relatório");
      return;
    }
    if (reportA === reportB) {
      toast.error("Selecione semanas diferentes");
      return;
    }
    const semA = assessments.find((a) => a.id === reportA);
    const semB = assessments.find((a) => a.id === reportB);
    if (!semA || !semB) {
      toast.error("Semanas inválidas");
      return;
    }
    // ordena: anterior → mais recente
    const [ant, rec] = new Date(semA.data_avaliacao) <= new Date(semB.data_avaliacao)
      ? [semA, semB]
      : [semB, semA];

    setGeneratingReport(true);
    try {
      const deltaPeso = ((rec.peso_kg || 0) - (ant.peso_kg || 0)).toFixed(1);
      const deltaBf = ((rec.bf_estimado || 0) - (ant.bf_estimado || 0)).toFixed(1);
      const deltaScore = (rec.score_geral || 0) - (ant.score_geral || 0);

      const prompt = `Você é um coach de competição elite. Gere um relatório semanal completo comparando DUAS semanas específicas do atleta:

Atleta: ${athlete.nome}
Categoria: ${athlete.categoria || "—"}
Data competição: ${athlete.data_competicao || "—"}
Fase: ${athlete.fase_atual || "—"}
${reportFocus ? `Foco solicitado pelo coach: ${reportFocus}` : ""}

📅 Semana ANTERIOR (${ant.data_avaliacao} • Sem ${ant.semana ?? "?"}):
- Peso: ${ant.peso_kg ?? "—"}kg | BF: ${ant.bf_estimado ?? "—"}% | Score: ${ant.score_geral ?? "—"}
- Meta: ${ant.meta_semana || "—"}
- Observações: ${ant.observacoes_coach || "—"}

📅 Semana ATUAL (${rec.data_avaliacao} • Sem ${rec.semana ?? "?"}):
- Peso: ${rec.peso_kg ?? "—"}kg | BF: ${rec.bf_estimado ?? "—"}% | Score: ${rec.score_geral ?? "—"}
- Meta: ${rec.meta_semana || "—"}
- Observações: ${rec.observacoes_coach || "—"}

Δ DELTA: Peso ${deltaPeso}kg • BF ${deltaBf}% • Score ${deltaScore}

Gere relatório em markdown com:
1. ✅ Pontos positivos (com base no delta)
2. ⚠️ Pontos de atenção
3. 🏋️ Ajustes de treino sugeridos
4. 🍽️ Ajustes nutricionais
5. 🎯 Meta da próxima semana
6. 💪 Mensagem motivacional
7. 📊 Projeção para o palco`;

      const { data, error } = await supabase.functions.invoke("ai-chat", {
        body: { messages: [{ role: "user", content: prompt }] },
      });
      if (error) throw error;
      const texto = data?.message || data?.content || JSON.stringify(data);
      setReport(texto);

      await supabase.from("athlete_weekly_reports" as any).insert({
        athlete_id: athleteId,
        coach_id: user!.id,
        semana_referencia: rec.semana ?? assessments.length,
        relatorio_completo: texto,
      });
      toast.success("Relatório gerado e salvo no histórico");
    } catch (e: any) {
      toast.error("Falha ao gerar: " + e.message);
    } finally {
      setGeneratingReport(false);
    }
  };

  const fotoUrl = (path: string | null) => {
    if (!path) return null;
    const { data } = supabase.storage.from("athlete-photos").getPublicUrl(path);
    return data.publicUrl;
  };

  if (loading) return <div className="p-6 text-muted-foreground">Carregando...</div>;
  if (!athlete) return <div className="p-6">Atleta não encontrado</div>;

  const aA = assessments.find((a) => a.id === compareA);
  const aB = assessments.find((a) => a.id === compareB);

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/coach/atletas")}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{athlete.nome}</h1>
            <p className="text-muted-foreground">
              {athlete.categoria} • Fase: {athlete.fase_atual || "—"}
            </p>
          </div>
          {athlete.data_competicao && <Badge className="text-lg">Palco: {athlete.data_competicao}</Badge>}
        </div>

        <Tabs defaultValue="timeline">
          <TabsList>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
            <TabsTrigger value="comparar">Comparar Semanas</TabsTrigger>
            <TabsTrigger value="relatorio">Relatório IA</TabsTrigger>
          </TabsList>

          <TabsContent value="timeline" className="space-y-4">
            <Card className="p-5">
              <h3 className="font-bold mb-4 flex items-center gap-2">
                <Camera className="w-4 h-4" /> Novo check-in
              </h3>
              <div className="grid md:grid-cols-3 gap-3">
                <div><Label>Peso (kg)</Label><Input type="number" step="0.1" value={novoPeso} onChange={(e) => setNovoPeso(e.target.value)} /></div>
                <div><Label>BF (%)</Label><Input type="number" step="0.1" value={novoBf} onChange={(e) => setNovoBf(e.target.value)} /></div>
                <div><Label>Score (0-100)</Label><Input type="number" value={novoScore} onChange={(e) => setNovoScore(e.target.value)} /></div>
                <div className="md:col-span-3"><Label>Meta da semana</Label><Input value={novaMeta} onChange={(e) => setNovaMeta(e.target.value)} /></div>
                <div className="md:col-span-3"><Label>Observações</Label><Textarea value={novaObs} onChange={(e) => setNovaObs(e.target.value)} /></div>
                <div className="md:col-span-3">
                  <Label>Foto (frente)</Label>
                  <Input type="file" accept="image/*" onChange={(e) => setNovaFoto(e.target.files?.[0] || null)} />
                </div>
              </div>
              <Button onClick={salvarCheckIn} disabled={uploading} className="mt-4">
                {uploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                Salvar check-in
              </Button>
            </Card>

            <div className="grid md:grid-cols-2 gap-4">
              {assessments.map((a) => (
                <Card key={a.id} className="p-4">
                  <div className="flex justify-between mb-2">
                    <strong>Semana {a.semana} • {a.data_avaliacao}</strong>
                    {a.score_geral != null && <Badge>{a.score_geral}</Badge>}
                  </div>
                  {a.foto_frente_url && (
                    <img src={fotoUrl(a.foto_frente_url) || ""} alt="" className="w-full rounded-lg mb-3 max-h-80 object-contain bg-muted" />
                  )}
                  <div className="text-sm space-y-1">
                    {a.peso_kg && <div>Peso: <strong>{a.peso_kg}kg</strong></div>}
                    {a.bf_estimado && <div>BF: <strong>{a.bf_estimado}%</strong></div>}
                    {a.meta_semana && <div className="text-primary">🎯 {a.meta_semana}</div>}
                    {a.observacoes_coach && <p className="text-muted-foreground italic">"{a.observacoes_coach}"</p>}
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="comparar" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <select className="bg-background border border-border rounded px-3 py-2" value={compareA || ""} onChange={(e) => setCompareA(e.target.value)}>
                <option value="">Selecione semana A</option>
                {assessments.map((a) => <option key={a.id} value={a.id}>Sem {a.semana} - {a.data_avaliacao}</option>)}
              </select>
              <select className="bg-background border border-border rounded px-3 py-2" value={compareB || ""} onChange={(e) => setCompareB(e.target.value)}>
                <option value="">Selecione semana B</option>
                {assessments.map((a) => <option key={a.id} value={a.id}>Sem {a.semana} - {a.data_avaliacao}</option>)}
              </select>
            </div>

            {aA && aB && (
              <div className="grid grid-cols-2 gap-4">
                {[aA, aB].map((a, i) => (
                  <Card key={i} className="p-4">
                    <h4 className="font-bold mb-2">Semana {a.semana}</h4>
                    {a.foto_frente_url && <img src={fotoUrl(a.foto_frente_url) || ""} className="w-full rounded mb-3 max-h-96 object-contain bg-muted" />}
                    <div className="text-sm">
                      <div>Peso: {a.peso_kg}kg</div>
                      <div>BF: {a.bf_estimado}%</div>
                      <div>Score: {a.score_geral}</div>
                    </div>
                  </Card>
                ))}
                <Card className="p-4 col-span-2 bg-primary/10">
                  <h4 className="font-bold mb-2">Δ Delta</h4>
                  <div className="grid grid-cols-3 gap-3 text-sm">
                    <div>Peso: <strong>{((aB.peso_kg || 0) - (aA.peso_kg || 0)).toFixed(1)}kg</strong></div>
                    <div>BF: <strong>{((aB.bf_estimado || 0) - (aA.bf_estimado || 0)).toFixed(1)}%</strong></div>
                    <div>Score: <strong>{(aB.score_geral || 0) - (aA.score_geral || 0)}</strong></div>
                  </div>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="relatorio" className="space-y-4">
            <Button onClick={gerarRelatorio} disabled={generatingReport} className="bg-primary">
              {generatingReport ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              Gerar relatório semanal IA
            </Button>
            {report && (
              <Card className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-5 h-5 text-primary" />
                  <h3 className="font-bold">Relatório semanal</h3>
                </div>
                <pre className="whitespace-pre-wrap font-sans text-sm">{report}</pre>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
