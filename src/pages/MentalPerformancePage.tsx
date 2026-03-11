import { useState } from "react";
import { Brain, Zap, Target, FlaskConical, Search, ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";
import NootropicProtocol from "@/components/mental/NootropicProtocol";
import EnergyScoreDashboard from "@/components/mental/EnergyScoreDashboard";
import FocusMode from "@/components/mental/FocusMode";
import AdvancedSearch from "@/components/mental/AdvancedSearch";
import { useMentalPerformance } from "@/hooks/useMentalPerformance";

const MentalPerformancePage = () => {
  const [activeTab, setActiveTab] = useState("home");
  const mp = useMentalPerformance();

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(263,70%,20%)] via-background to-background" />
        <div className="relative px-4 pt-6 pb-4">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Brain className="w-6 h-6 text-[hsl(263,70%,58%)]" />
            <h1 className="text-xl font-bold">Mental Performance</h1>
          </div>

          {activeTab === "home" && (
            <>
              <Badge className="bg-[hsl(263,70%,58%)]/20 text-[hsl(263,70%,70%)] border-[hsl(263,70%,58%)]/30 mb-3">
                <Sparkles className="w-3 h-3 mr-1" />
                Primeiro módulo de nutrição para performance cognitiva do Brasil
              </Badge>
              <h2 className="text-2xl font-bold mb-2">
                Seu corpo treina. Sua mente <span className="text-[hsl(263,70%,58%)]">também precisa</span> de protocolo.
              </h2>
              <p className="text-muted-foreground text-sm">
                Nutrição, nootrópicos e timing certo para quem quer performance física e mental no mesmo dia.
              </p>
            </>
          )}
        </div>
      </div>

      {activeTab === "home" ? (
        <div className="px-4 space-y-3 mt-4">
          {/* Quick Access Cards */}
          <Card className="border-[hsl(263,70%,58%)]/20 bg-card/80 cursor-pointer hover:border-[hsl(263,70%,58%)]/50 transition-colors" onClick={() => setActiveTab("nootropic")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(263,70%,58%)]/20 flex items-center justify-center text-2xl">🧪</div>
              <div className="flex-1">
                <h3 className="font-semibold">Protocolo Nootrópico</h3>
                <p className="text-sm text-muted-foreground">Stack personalizado com IA baseado no seu perfil</p>
              </div>
              <FlaskConical className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-[hsl(38,80%,52%)]/20 bg-card/80 cursor-pointer hover:border-[hsl(38,80%,52%)]/50 transition-colors" onClick={() => setActiveTab("energy")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(38,80%,52%)]/20 flex items-center justify-center text-2xl">⚡</div>
              <div className="flex-1">
                <h3 className="font-semibold">Score de Energia Diária</h3>
                <p className="text-sm text-muted-foreground">Monitore e otimize sua energia com insights de IA</p>
              </div>
              <Zap className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-[hsl(168,100%,50%)]/20 bg-card/80 cursor-pointer hover:border-[hsl(168,100%,50%)]/50 transition-colors" onClick={() => setActiveTab("focus")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(168,100%,50%)]/20 flex items-center justify-center text-2xl">🎯</div>
              <div className="flex-1">
                <h3 className="font-semibold">Modo Foco</h3>
                <p className="text-sm text-muted-foreground">Protocolo nutricional para eventos de alta performance</p>
              </div>
              <Target className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          <Card className="border-[hsl(200,80%,50%)]/20 bg-card/80 cursor-pointer hover:border-[hsl(200,80%,50%)]/50 transition-colors" onClick={() => setActiveTab("search")}>
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[hsl(200,80%,50%)]/20 flex items-center justify-center text-2xl">🔬</div>
              <div className="flex-1">
                <h3 className="font-semibold">Pesquisa Avançada</h3>
                <p className="text-sm text-muted-foreground">Busca científica com IA — powered by Perplexity</p>
              </div>
              <Search className="w-5 h-5 text-muted-foreground" />
            </CardContent>
          </Card>

          {/* Stats Summary */}
          {mp.energyScores.length > 0 && (
            <Card className="bg-card/80">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Resumo Rápido</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(263,70%,58%)]">
                    {(mp.energyScores.reduce((a, b) => a + (b.score || 0), 0) / mp.energyScores.length).toFixed(1)}
                  </p>
                  <p className="text-xs text-muted-foreground">Energia Média</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(38,80%,52%)]">{mp.focusLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Modos Foco</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[hsl(168,100%,50%)]">{mp.dailyLogs.length}</p>
                  <p className="text-xs text-muted-foreground">Dias Nootrópico</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      ) : (
        <div className="px-4 mt-2">
          <Button variant="ghost" size="sm" onClick={() => setActiveTab("home")} className="mb-3">
            <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          {activeTab === "nootropic" && <NootropicProtocol mp={mp} />}
          {activeTab === "energy" && <EnergyScoreDashboard mp={mp} />}
          {activeTab === "focus" && <FocusMode mp={mp} />}
          {activeTab === "search" && <AdvancedSearch />}
        </div>
      )}

      <BottomNav />
    </div>
  );
};

export default MentalPerformancePage;
