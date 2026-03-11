import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCoachProfile } from "@/hooks/useCoachProfile";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Send, Check, Brain, FileText, AlertTriangle, MessageSquare, User, Activity } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const CoachPatientDetailPage = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  const { profile } = useCoachProfile();

  const [patient, setPatient] = useState<any>(null);
  const [scores, setScores] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [mealLogs, setMealLogs] = useState<any[]>([]);
  const [exams, setExams] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!profile || !patientId) return;
    loadPatientData();
  }, [profile, patientId]);

  const loadPatientData = async () => {
    if (!profile || !patientId) return;

    const [profileRes, scoresRes, alertsRes, messagesRes, mealsRes, examsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", patientId).maybeSingle(),
      supabase.from("consistency_scores").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(30),
      supabase.from("coach_alerts").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: false }),
      supabase.from("coach_messages").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: true }),
      supabase.from("meal_logs").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(14),
      supabase.from("blood_tests").select("*").eq("user_id", patientId).order("created_at", { ascending: false }),
    ]);

    setPatient(profileRes.data);
    setScores(scoresRes.data || []);
    setAlerts(alertsRes.data || []);
    setMessages(messagesRes.data || []);
    setMealLogs(mealsRes.data || []);
    setExams(examsRes.data || []);
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !profile || !patientId) return;
    setSending(true);
    await supabase.from("coach_messages").insert({
      coach_id: profile.id,
      patient_user_id: patientId,
      sender: "coach",
      message: newMessage,
    });
    setNewMessage("");
    setSending(false);
    loadPatientData();
  };

  const resolveAlert = async (alertId: string) => {
    await supabase.from("coach_alerts").update({ resolved: true, resolved_at: new Date().toISOString() }).eq("id", alertId);
    setAlerts(prev => prev.filter(a => a.id !== alertId));
    toast({ title: "Alerta resolvido ✅" });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const latestScore = scores[0]?.total_score ?? 0;
  const adherencePct = mealLogs.length > 0 ? Math.round((mealLogs.filter(m => m.confirmed).length / mealLogs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="font-bold text-foreground">{patient?.full_name || "Paciente"}</h1>
            <p className="text-xs text-muted-foreground">
              {patient?.objetivo_principal || patient?.goal || "—"} • {patient?.weight_kg ? `${patient.weight_kg}kg` : "—"}
            </p>
          </div>
          <Badge className={latestScore >= 70 ? "bg-green-500/20 text-green-400" : latestScore >= 40 ? "bg-yellow-500/20 text-yellow-400" : "bg-red-500/20 text-red-400"}>
            Score {latestScore}/100
          </Badge>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="overview" className="text-xs"><User className="w-3 h-3 mr-1" />Visão Geral</TabsTrigger>
            <TabsTrigger value="protocol" className="text-xs"><Brain className="w-3 h-3 mr-1" />Protocolo</TabsTrigger>
            <TabsTrigger value="exams" className="text-xs"><FileText className="w-3 h-3 mr-1" />Exames</TabsTrigger>
            <TabsTrigger value="alerts" className="text-xs"><AlertTriangle className="w-3 h-3 mr-1" />Alertas</TabsTrigger>
            <TabsTrigger value="messages" className="text-xs"><MessageSquare className="w-3 h-3 mr-1" />Mensagens</TabsTrigger>
          </TabsList>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Peso Atual</p>
                  <p className="text-2xl font-bold text-foreground">{patient?.weight_kg || "—"} kg</p>
                  {patient?.meta_peso && <p className="text-xs text-muted-foreground">Meta: {patient.meta_peso} kg</p>}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Score de Execução</p>
                  <p className="text-2xl font-bold text-foreground">{latestScore}/100</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Aderência</p>
                  <p className="text-2xl font-bold text-foreground">{adherencePct}%</p>
                  <p className="text-xs text-muted-foreground">últimos 14 registros</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-sm">Últimos Scores</CardTitle></CardHeader>
              <CardContent>
                <div className="flex gap-1 items-end h-20">
                  {scores.slice(0, 20).reverse().map((s, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-sm"
                      style={{
                        height: `${Math.max(s.total_score, 5)}%`,
                        backgroundColor: s.total_score >= 70 ? "hsl(142, 71%, 45%)" : s.total_score >= 40 ? "hsl(48, 96%, 53%)" : "hsl(0, 84%, 60%)",
                      }}
                      title={`Score: ${s.total_score}`}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Dados do Paciente</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Altura:</span> <span className="text-foreground">{patient?.height_cm || "—"} cm</span></div>
                <div><span className="text-muted-foreground">IMC:</span> <span className="text-foreground">{patient?.weight_kg && patient?.height_cm ? (patient.weight_kg / ((patient.height_cm / 100) ** 2)).toFixed(1) : "—"}</span></div>
                <div><span className="text-muted-foreground">Protocolo:</span> <span className="text-foreground">{patient?.active_protocol || "—"}</span></div>
                <div><span className="text-muted-foreground">VET:</span> <span className="text-foreground">{patient?.vet_kcal || "—"} kcal</span></div>
                <div><span className="text-muted-foreground">Proteína:</span> <span className="text-foreground">{patient?.protein_g || "—"}g</span></div>
                <div><span className="text-muted-foreground">Streak:</span> <span className="text-foreground">{patient?.streak_days || 0} dias</span></div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* PROTOCOL */}
          <TabsContent value="protocol" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Protocolo Ativo</CardTitle>
                  <Button size="sm" onClick={() => toast({ title: "Gerando novo protocolo com IA...", description: "Funcionalidade em ativação" })}>
                    <Brain className="w-4 h-4 mr-1" /> Gerar com IA
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                  <p><strong className="text-foreground">Protocolo:</strong> {patient?.active_protocol || "Não definido"}</p>
                  <p><strong className="text-foreground">VET:</strong> {patient?.vet_kcal || "—"} kcal</p>
                  <p><strong className="text-foreground">Macros:</strong> P {patient?.protein_g || "—"}g / C {patient?.carbs_g || "—"}g / G {patient?.fat_g || "—"}g</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-sm">Últimas Refeições</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {mealLogs.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Nenhuma refeição registrada recentemente.</p>
                ) : (
                  mealLogs.slice(0, 7).map(m => (
                    <div key={m.id} className="flex items-center justify-between text-sm border-b border-border pb-2">
                      <div>
                        <span className="text-foreground font-medium capitalize">{m.meal_type}</span>
                        <span className="text-muted-foreground ml-2">{m.meal_date}</span>
                      </div>
                      <span className="text-muted-foreground">{m.total_kcal || 0} kcal</span>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* EXAMS */}
          <TabsContent value="exams" className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Exames do Paciente</h3>
              <Button size="sm" variant="outline" onClick={() => toast({ title: "Solicitação de exames enviada" })}>
                Solicitar Novos Exames
              </Button>
            </div>
            {exams.length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">Nenhum exame registrado.</CardContent></Card>
            ) : (
              exams.map(e => (
                <Card key={e.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-foreground">{e.test_date}</p>
                      <Badge variant={e.status === "analyzed" ? "default" : "outline"} className="text-xs">
                        {e.status === "analyzed" ? "Analisado" : "Pendente"}
                      </Badge>
                    </div>
                    {e.ai_analysis && typeof e.ai_analysis === "object" && (
                      <div className="text-xs text-muted-foreground">
                        Análise IA disponível
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* ALERTS */}
          <TabsContent value="alerts" className="space-y-4">
            <h3 className="font-semibold text-foreground">Alertas do Paciente</h3>
            {alerts.filter(a => a.patient_user_id === patientId).length === 0 ? (
              <Card><CardContent className="p-8 text-center text-muted-foreground text-sm">✅ Nenhum alerta pendente</CardContent></Card>
            ) : (
              alerts.filter(a => a.patient_user_id === patientId).map(a => (
                <Card key={a.id} className="border-l-4" style={{
                  borderLeftColor: a.severity === "critical" ? "hsl(0, 84%, 60%)" : a.severity === "high" ? "hsl(0, 84%, 60%)" : "hsl(48, 96%, 53%)"
                }}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm text-foreground">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">{new Date(a.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => resolveAlert(a.id)}>
                      <Check className="w-3 h-3 mr-1" /> Resolver
                    </Button>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* MESSAGES */}
          <TabsContent value="messages" className="space-y-4">
            <h3 className="font-semibold text-foreground">Chat com Paciente</h3>
            <Card className="h-[400px] flex flex-col">
              <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-10">Nenhuma mensagem ainda. Envie a primeira!</p>
                ) : (
                  messages.map(m => (
                    <div key={m.id} className={`flex ${m.sender === "coach" ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] p-3 rounded-xl text-sm ${
                        m.sender === "coach"
                          ? "bg-primary text-primary-foreground rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}>
                        {m.message}
                        <p className="text-[10px] opacity-70 mt-1">
                          {new Date(m.created_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
              <div className="border-t border-border p-3 flex gap-2">
                <Input
                  placeholder="Escreva uma mensagem..."
                  value={newMessage}
                  onChange={e => setNewMessage(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && sendMessage()}
                />
                <Button size="icon" onClick={sendMessage} disabled={sending || !newMessage.trim()}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default CoachPatientDetailPage;
