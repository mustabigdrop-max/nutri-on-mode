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
import { ArrowLeft, Send, Check, Brain, FileText, AlertTriangle, MessageSquare, User, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
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
  const [apexAssessment, setApexAssessment] = useState<any>(null);
  const [apexPain, setApexPain] = useState<any[]>([]);
  const [apexPosture, setApexPosture] = useState<any>(null);
  const [apexFms, setApexFms] = useState<any>(null);

  useEffect(() => {
    if (!profile || !patientId) return;
    loadPatientData();
  }, [profile, patientId]);

  const loadPatientData = async () => {
    if (!profile || !patientId) return;

    const [profileRes, scoresRes, alertsRes, messagesRes, mealsRes, examsRes,
           apexAssessRes, apexPainRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", patientId).maybeSingle(),
      supabase.from("consistency_scores").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(30),
      supabase.from("coach_alerts").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: false }),
      supabase.from("coach_messages").select("*").eq("coach_id", profile.id).eq("patient_user_id", patientId).order("created_at", { ascending: true }),
      supabase.from("meal_logs").select("*").eq("user_id", patientId).order("created_at", { ascending: false }).limit(14),
      supabase.from("blood_tests").select("*").eq("user_id", patientId).order("created_at", { ascending: false }),
      supabase.from("apex_assessments").select("*").eq("user_id", patientId).order("assessment_date", { ascending: false }).limit(1).maybeSingle(),
      supabase.from("apex_pain_entries").select("*").eq("user_id", patientId).is("resolved_at", null).order("created_at", { ascending: false }),
    ]);

    setPatient(profileRes.data);
    setScores(scoresRes.data || []);
    setAlerts(alertsRes.data || []);
    setMessages(messagesRes.data || []);
    setMealLogs(mealsRes.data || []);
    setExams(examsRes.data || []);
    setApexAssessment(apexAssessRes.data || null);
    setApexPain(apexPainRes.data || []);

    if (apexAssessRes.data?.id) {
      const [postRes, fmsRes] = await Promise.all([
        supabase.from("apex_posture_data").select("*").eq("assessment_id", apexAssessRes.data.id).maybeSingle(),
        supabase.from("apex_fms_scores").select("*").eq("assessment_id", apexAssessRes.data.id).maybeSingle(),
      ]);
      setApexPosture(postRes.data || null);
      setApexFms(fmsRes.data || null);
    }

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
          <TabsList className="w-full grid grid-cols-6">
            <TabsTrigger value="overview" className="text-xs"><User className="w-3 h-3 mr-1" />Visão Geral</TabsTrigger>
            <TabsTrigger value="apex" className="text-xs relative">
              <Activity className="w-3 h-3 mr-1" style={{ color: "#7890ff" }} />
              <span style={{ color: "#7890ff" }}>Apex</span>
              {apexPain.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center font-bold">
                  {apexPain.length}
                </span>
              )}
            </TabsTrigger>
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

          {/* APEX */}
          <TabsContent value="apex" className="space-y-4">
            {!apexAssessment ? (
              <Card style={{ border: "1px solid rgba(120,144,255,.2)", background: "#06060e" }}>
                <CardContent className="p-8 text-center">
                  <Activity className="w-10 h-10 mx-auto mb-3" style={{ color: "rgba(120,144,255,.4)" }} />
                  <p className="text-sm font-mono" style={{ color: "rgba(240,237,248,.5)" }}>
                    Paciente ainda não realizou nenhuma avaliação APEX.
                  </p>
                  <p className="text-xs font-mono mt-1" style={{ color: "rgba(120,144,255,.5)" }}>
                    Peça ao paciente acessar APEX Visual Intelligence no app.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Score summary */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { label: "Overall", value: apexAssessment.overall_score, color: "#7890ff" },
                    { label: "Postura", value: apexAssessment.posture_score, color: "#e8a020" },
                    { label: "Mobilidade", value: apexAssessment.mobility_score, color: "#00f0b4" },
                    { label: "Simetria", value: apexAssessment.symmetry_score, color: "#ff4444" },
                  ].map(({ label, value, color }) => (
                    <motion.div
                      key={label}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl p-4 text-center"
                      style={{ background: "#06060e", border: `1px solid ${color}22` }}
                    >
                      <p className="text-[10px] font-mono mb-1" style={{ color: "rgba(240,237,248,.45)" }}>{label}</p>
                      <p className="text-2xl font-bold font-mono" style={{ color: value == null ? "rgba(255,255,255,.2)" : color }}>
                        {value ?? "—"}
                      </p>
                      <div className="mt-2 h-1.5 rounded-full" style={{ background: "rgba(255,255,255,.05)" }}>
                        {value != null && (
                          <motion.div className="h-full rounded-full" style={{ background: color, width: `${value}%` }}
                            initial={{ width: 0 }} animate={{ width: `${value}%` }} transition={{ duration: 1 }} />
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* FMS */}
                {apexFms && (
                  <Card style={{ border: "1px solid rgba(232,160,32,.2)", background: "#06060e" }}>
                    <CardHeader><CardTitle className="text-sm font-mono" style={{ color: "#e8a020" }}>FMS — Score {apexAssessment.fms_total}/21</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          ["Agachamento", apexFms.deep_squat],
                          ["Passo L", apexFms.hurdle_step_l], ["Passo R", apexFms.hurdle_step_r],
                          ["Avanço L", apexFms.inline_lunge_l], ["Avanço R", apexFms.inline_lunge_r],
                          ["Ombro L", apexFms.shoulder_mob_l], ["Ombro R", apexFms.shoulder_mob_r],
                          ["SLR L", apexFms.active_slr_l], ["SLR R", apexFms.active_slr_r],
                          ["Tronco", apexFms.trunk_stability],
                          ["Rotação L", apexFms.rotary_stab_l], ["Rotação R", apexFms.rotary_stab_r],
                        ].map(([k, v]) => (
                          <div key={String(k)} className="rounded-lg p-2 text-center" style={{ background: "rgba(255,255,255,.03)", border: "1px solid rgba(255,255,255,.06)" }}>
                            <p className="text-[9px] font-mono" style={{ color: "rgba(240,237,248,.4)" }}>{k}</p>
                            <p className="text-base font-bold font-mono" style={{ color: v === 3 ? "#00f0b4" : v === 2 ? "#e8a020" : v === 1 ? "#ff8844" : "#ff4444" }}>
                              {v ?? "—"}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Posture */}
                {apexPosture && (
                  <Card style={{ border: "1px solid rgba(120,144,255,.2)", background: "#06060e" }}>
                    <CardHeader><CardTitle className="text-sm font-mono" style={{ color: "#7890ff" }}>Postura — Score {apexAssessment.posture_score}/100</CardTitle></CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                        {[
                          ["Cabeça anteriorizada", apexPosture.forward_head],
                          ["Cifose torácica", apexPosture.thoracic_kyphosis],
                          ["Lordose lombar", apexPosture.lumbar_lordosis],
                          ["Inclinação pélvica", apexPosture.pelvic_tilt],
                          ["Assin. ombros", apexPosture.shoulder_asym],
                          ["Upper Crossed", apexPosture.upper_crossed],
                          ["Lower Crossed", apexPosture.lower_crossed],
                          ["Pronação/distorção", apexPosture.pronation_dist],
                        ].map(([label, val]) => (
                          <div key={String(label)} className="flex justify-between items-center py-1" style={{ borderBottom: "1px solid rgba(255,255,255,.04)" }}>
                            <span style={{ color: "rgba(240,237,248,.45)" }}>{label}</span>
                            <span style={{ color: val === "none" || val === "normal" || val === "neutral" ? "#00f0b4" : val === "mild" || val === "increased" || val === "decreased" ? "#e8a020" : "#ff4444" }}>
                              {val}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Pain entries */}
                {apexPain.length > 0 && (
                  <Card style={{ border: "1px solid rgba(255,68,68,.25)", background: "#06060e" }}>
                    <CardHeader><CardTitle className="text-sm font-mono" style={{ color: "#ff4444" }}>Dores Ativas — {apexPain.length} entrada{apexPain.length > 1 ? "s" : ""}</CardTitle></CardHeader>
                    <CardContent className="space-y-2">
                      {apexPain.map(p => (
                        <div key={p.id} className="rounded-lg p-3" style={{ background: "rgba(255,68,68,.05)", border: "1px solid rgba(255,68,68,.12)" }}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-mono font-bold" style={{ color: "#ff4444" }}>
                              {p.red_flag && "🚨 "}
                              {p.body_region} · {p.side}
                            </span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full" style={{ background: "rgba(255,68,68,.1)", color: "#ff4444" }}>
                              Intensidade {p.intensity}/10
                            </span>
                          </div>
                          <p className="text-[10px] font-mono" style={{ color: "rgba(240,237,248,.45)" }}>
                            {p.pain_type} · {p.behavior} · {p.onset_pattern}
                          </p>
                          {p.notes && <p className="text-[10px] font-mono mt-1" style={{ color: "rgba(240,237,248,.3)" }}>{p.notes}</p>}
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                )}

                <p className="text-[10px] font-mono text-center" style={{ color: "rgba(240,237,248,.25)" }}>
                  Avaliação: {new Date(apexAssessment.assessment_date + "T12:00:00").toLocaleDateString("pt-BR")}
                </p>
              </>
            )}
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
