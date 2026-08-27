import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Brain, Heart, RefreshCw, Fingerprint, Battery, BookOpen, AlertTriangle, MessageCircle, Lock, Shield, TrendingDown, Sparkles, BarChart3 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { useBehavioral } from "@/hooks/useBehavioral";
import { usePlanGate } from "@/hooks/usePlanGate";
import BehavioralProfileCard from "@/components/behavioral/BehavioralProfileCard";
import BehavioralDiary from "@/components/behavioral/BehavioralDiary";
import BehavioralLoops from "@/components/behavioral/BehavioralLoops";
import IdentityCard from "@/components/behavioral/IdentityCard";
import WillpowerCard from "@/components/behavioral/WillpowerCard";
import EmotionRegulationModal from "@/components/behavioral/EmotionRegulationModal";
import BehavioralAgentChat from "@/components/behavioral/BehavioralAgentChat";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

type FeatureKey = "perfil" | "identidade" | "loops" | "vontade" | "sos" | "coach" | "diario" | "preditiva";

interface FeatureCard {
  key: FeatureKey;
  label: string;
  desc: string;
  icon: typeof Brain;
  iconColor: string;
  bgColor: string;
  plan: "ON" | "ON+" | "ON PRO";
}

const FEATURES: FeatureCard[] = [
  { key: "perfil", label: "Perfil APEX", desc: "7 perfis neuropsicológicos MCE + estágio de mudança", icon: Brain, iconColor: "text-primary", bgColor: "bg-primary/10", plan: "ON" },
  { key: "identidade", label: "Declaração de Identidade", desc: "Sistema de votos + construção de identidade", icon: Fingerprint, iconColor: "text-violet-400", bgColor: "bg-violet-400/10", plan: "ON" },
  { key: "loops", label: "Loops Comportamentais", desc: "Mapeie gatilhos e substitua rotinas negativas", icon: RefreshCw, iconColor: "text-emerald-400", bgColor: "bg-emerald-400/10", plan: "ON" },
  { key: "vontade", label: "Força de Vontade", desc: "Decisões antecipadas + design de ambiente", icon: Battery, iconColor: "text-amber-400", bgColor: "bg-amber-400/10", plan: "ON" },
  { key: "sos", label: "Regulação Emocional SOS", desc: "Protocolo de 90s para momentos de risco", icon: AlertTriangle, iconColor: "text-pink-400", bgColor: "bg-pink-400/10", plan: "ON" },
  { key: "coach", label: "Coach Comportamental", desc: "Agente treinado com MCE + seus dados reais", icon: MessageCircle, iconColor: "text-sky-400", bgColor: "bg-sky-400/10", plan: "ON+" },
  { key: "diario", label: "Diário Comportamental", desc: "Registre emoções, fome e aprendizados detalhados", icon: BookOpen, iconColor: "text-orange-400", bgColor: "bg-orange-400/10", plan: "ON+" },
  { key: "preditiva", label: "Análise Preditiva", desc: "prevê recaídas e sabotagens antes de acontecer", icon: BarChart3, iconColor: "text-red-400", bgColor: "bg-red-400/10", plan: "ON+" },
];

export default function BehavioralTriggersPage() {
  const navigate = useNavigate();
  const { profile, diary, loops, loading, saveProfile, addDiaryEntry, addLoop, addEmotionLog, incrementVoto } = useBehavioral();
  const { plan, role } = usePlanGate();
  const [activeFeature, setActiveFeature] = useState<FeatureKey | null>(null);
  const [showRegulation, setShowRegulation] = useState(false);

  const planLevel = plan === "ON PRO" || plan === "ON +" ? 2 : plan === "ON" ? 1 : 0;
  const isAdmin = role === "admin";

  const canAccess = (requiredPlan: string) => {
    if (isAdmin) return true;
    if (requiredPlan === "ON") return planLevel >= 1;
    if (requiredPlan === "ON+") return planLevel >= 2;
    if (requiredPlan === "ON PRO") return planLevel >= 3;
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const renderFeatureContent = (key: FeatureKey) => {
    switch (key) {
      case "perfil":
        return <BehavioralProfileCard profile={profile} onSave={saveProfile} />;
      case "identidade":
        return <IdentityCard profile={profile} onSave={saveProfile} onVote={incrementVoto} />;
      case "loops":
        return <BehavioralLoops loops={loops} onAdd={addLoop} />;
      case "vontade":
        return <WillpowerCard profile={profile} onSave={saveProfile} />;
      case "sos":
        return (
          <Card className="border-pink-500/20 bg-card">
            <CardContent className="py-6 text-center space-y-3">
              <AlertTriangle className="w-10 h-10 text-pink-400 mx-auto" />
              <div>
                <p className="text-sm font-bold">Regulação Emocional SOS</p>
                <p className="text-[10px] text-muted-foreground mt-1">Protocolo baseado na neurociência dos 90 segundos</p>
              </div>
              <Button onClick={() => { setActiveFeature(null); setShowRegulation(true); }} className="gap-2 bg-pink-500 hover:bg-pink-600">
                <Heart className="w-4 h-4" /> Ativar Protocolo SOS
              </Button>
            </CardContent>
          </Card>
        );
      case "coach":
        return <BehavioralAgentChat />;
      case "diario":
        return <BehavioralDiary entries={diary} onAdd={addDiaryEntry} />;
      case "preditiva":
        return (
          <Card className="border-red-500/20 bg-card">
            <CardContent className="py-6 space-y-4">
              <div className="flex items-center gap-3">
                <BarChart3 className="w-6 h-6 text-red-400" />
                <div>
                  <p className="text-sm font-bold">Análise Preditiva</p>
                  <p className="text-[10px] text-muted-foreground">Baseada em 4+ semanas de dados comportamentais</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xl font-bold text-primary">{profile?.risco_abandono || 0}%</p>
                  <p className="text-[9px] text-muted-foreground">Risco de Abandono</p>
                </div>
                <div className="p-3 rounded-xl bg-muted/50 text-center">
                  <p className="text-xl font-bold text-amber-400">{profile?.ponto_sabotagem_percent || 0}%</p>
                  <p className="text-[9px] text-muted-foreground">Zona de Sabotagem</p>
                </div>
              </div>
              {(profile?.horarios_criticos?.length ?? 0) > 0 && (
                <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/10">
                  <p className="text-[10px] font-semibold text-red-400 mb-1">⚠️ Horários Críticos Detectados</p>
                  <div className="flex flex-wrap gap-1">
                    {profile?.horarios_criticos?.map(h => (
                      <Badge key={h} variant="outline" className="text-[9px] border-red-500/20 text-red-400">{h}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {(profile?.dias_criticos?.length ?? 0) > 0 && (
                <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/10">
                  <p className="text-[10px] font-semibold text-amber-400 mb-1">📅 Dias Críticos</p>
                  <div className="flex flex-wrap gap-1">
                    {profile?.dias_criticos?.map(d => (
                      <Badge key={d} variant="outline" className="text-[9px] border-amber-500/20 text-amber-400">{d}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {profile?.padrao_recaida && (
                <div className="p-3 rounded-xl bg-muted/50 border border-border">
                  <p className="text-[10px] font-semibold mb-1">🔄 Padrão de Recaída Detectado</p>
                  <p className="text-[10px] text-muted-foreground">{profile.padrao_recaida}</p>
                </div>
              )}
              {!profile?.risco_abandono && !profile?.ponto_sabotagem_percent && (
                <p className="text-[10px] text-muted-foreground text-center py-2">Continue registrando seus dados por mais algumas semanas para análises preditivas mais precisas.</p>
              )}
            </CardContent>
          </Card>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="flex items-center gap-3 px-4 pt-6 pb-4 border-b border-border">
        <button onClick={() => activeFeature ? setActiveFeature(null) : navigate("/coach/dashboard")} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold">APEX Behavioral Engine</h1>
          <p className="text-[10px] text-muted-foreground">
            {activeFeature ? FEATURES.find(f => f.key === activeFeature)?.label : "Análise e transformação comportamental avançada"}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowRegulation(true)} className="text-[10px] h-8 gap-1 border-pink-500/30 text-pink-400 hover:bg-pink-500/10">
          <AlertTriangle className="w-3.5 h-3.5" /> SOS
        </Button>
      </div>

      <div className="px-4 mt-4">
        <AnimatePresence mode="wait">
          {activeFeature ? (
            <motion.div
              key={activeFeature}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {renderFeatureContent(activeFeature)}
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {/* Quick Stats */}
              {profile?.perfil_primario && (
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-3 rounded-xl bg-card border border-border">
                    <p className="text-lg font-bold text-primary">{profile?.streak_atual || 0}</p>
                    <p className="text-[8px] text-muted-foreground">Streak</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-card border border-border">
                    <p className="text-lg font-bold text-emerald-400">{profile?.votos_identidade || 0}</p>
                    <p className="text-[8px] text-muted-foreground">Votos Identidade</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-card border border-border">
                    <p className="text-lg font-bold text-amber-400">{Math.round(profile?.taxa_aderencia_geral || 0)}%</p>
                    <p className="text-[8px] text-muted-foreground">Aderência</p>
                  </div>
                </div>
              )}

              {/* Plan Sections */}
              {["ON", "ON+", "ON PRO"].map(planGroup => {
                const features = FEATURES.filter(f => f.plan === planGroup);
                if (features.length === 0) return null;
                const groupAccessible = canAccess(planGroup);

                return (
                  <div key={planGroup}>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge
                        variant={groupAccessible ? "default" : "outline"}
                        className={`text-[9px] ${!groupAccessible ? "border-amber-500/30 text-amber-400" : ""}`}
                      >
                        {planGroup}
                      </Badge>
                      {!groupAccessible && (
                        <span className="text-[9px] text-muted-foreground flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Upgrade necessário
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {features.map(feature => {
                        const Icon = feature.icon;
                        const accessible = canAccess(feature.plan);

                        return (
                          <motion.button
                            key={feature.key}
                            whileTap={accessible ? { scale: 0.97 } : undefined}
                            onClick={() => {
                              if (accessible) {
                                if (feature.key === "sos") {
                                  setShowRegulation(true);
                                } else {
                                  setActiveFeature(feature.key);
                                }
                              }
                            }}
                            className={`relative text-left p-4 rounded-2xl border transition-all ${
                              accessible
                                ? "border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 active:bg-muted/50"
                                : "border-border/50 bg-card/50 opacity-60 cursor-not-allowed"
                            }`}
                          >
                            {!accessible && (
                              <div className="absolute top-2 right-2">
                                <Lock className="w-3.5 h-3.5 text-amber-400" />
                              </div>
                            )}
                            <div className={`w-10 h-10 rounded-xl ${feature.bgColor} flex items-center justify-center mb-3`}>
                              <Icon className={`w-5 h-5 ${feature.iconColor}`} />
                            </div>
                            <p className="text-xs font-bold leading-tight">{feature.label}</p>
                            <p className="text-[9px] text-muted-foreground mt-1 leading-snug">{feature.desc}</p>

                            {feature.key === "perfil" && profile?.perfil_primario && (
                              <Badge variant="secondary" className="mt-2 text-[8px]">
                                {profile.perfil_primario.replace(/_/g, " ")}
                              </Badge>
                            )}
                            {feature.key === "loops" && loops.length > 0 && (
                              <Badge variant="secondary" className="mt-2 text-[8px]">
                                {loops.filter(l => l.ativo).length} ativos
                              </Badge>
                            )}
                            {feature.key === "diario" && diary.length > 0 && accessible && (
                              <Badge variant="secondary" className="mt-2 text-[8px]">
                                {diary.length} registros
                              </Badge>
                            )}
                            {feature.key === "preditiva" && (profile?.risco_abandono ?? 0) > 0 && accessible && (
                              <Badge variant="outline" className="mt-2 text-[8px] border-red-500/20 text-red-400">
                                Risco: {profile?.risco_abandono}%
                              </Badge>
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}

              {/* Upgrade CTA for locked features */}
              {planLevel < 2 && (
                <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-primary/5">
                  <CardContent className="py-5 text-center space-y-2">
                    <Sparkles className="w-7 h-7 text-amber-400 mx-auto" />
                    <p className="text-xs font-bold">Desbloqueie o Coach Comportamental</p>
                    <p className="text-[10px] text-muted-foreground">Agente personalizado que conhece seus padrões, gatilhos e perfil neuropsicológico.</p>
                    <Button onClick={() => navigate("/settings")} size="sm" className="text-[10px] mt-2">
                      Ver Planos →
                    </Button>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <EmotionRegulationModal open={showRegulation} onClose={() => setShowRegulation(false)} onSave={addEmotionLog} />
      <BottomNav />
    </div>
  );
}
