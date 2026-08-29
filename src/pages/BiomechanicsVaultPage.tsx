import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, Bone, Loader2, Search, Zap, Target, BookOpen, Crosshair } from "lucide-react";
import { motion } from "framer-motion";
import CitationBadge from "@/components/science/CitationBadge";
import ScienceIndicator from "@/components/science/ScienceIndicator";
import ReactMarkdown from "react-markdown";

const muscleGroups = [
  "Peitoral", "Costas (Lat)", "Deltoides", "Bíceps", "Tríceps",
  "Quadríceps", "Posterior de Coxa", "Glúteos", "Panturrilha",
  "Core/Abdômen", "Trapézio", "Antebraço", "Romboides", "Eretores da Espinha"
];

const popularExercises: Record<string, string[]> = {
  "Peitoral": ["Supino Reto", "Supino Inclinado", "Crucifixo", "Crossover", "Flexão", "Supino Declinado"],
  "Costas (Lat)": ["Puxada Frontal", "Remada Curvada", "Pulldown", "Remada Unilateral", "Pull-up"],
  "Deltoides": ["Desenvolvimento Militar", "Elevação Lateral", "Elevação Frontal", "Face Pull", "Arnold Press"],
  "Bíceps": ["Rosca Direta", "Rosca Alternada", "Rosca Martelo", "Rosca Scott", "Rosca Concentrada"],
  "Tríceps": ["Tríceps Testa", "Tríceps Pulley", "Mergulho", "Tríceps Francês", "Kickback"],
  "Quadríceps": ["Agachamento Livre", "Leg Press", "Hack Squat", "Extensora", "Agachamento Búlgaro"],
  "Posterior de Coxa": ["Stiff", "Mesa Flexora", "Good Morning", "Nordic Curl", "Leg Curl"],
  "Glúteos": ["Hip Thrust", "Elevação Pélvica", "Abdução", "Kickback", "Agachamento Sumô"],
  "Panturrilha": ["Panturrilha em Pé", "Panturrilha Sentado", "Panturrilha no Leg Press", "Donkey Calf"],
  "Core/Abdômen": ["Prancha", "Crunch", "Leg Raise", "Ab Wheel", "Pallof Press"],
  "Trapézio": ["Encolhimento", "Face Pull", "Remada Alta", "Farmer Walk"],
  "Antebraço": ["Rosca de Punho", "Rosca Inversa", "Farmer Walk", "Dead Hang"],
  "Romboides": ["Remada Cavaleiro", "Face Pull", "Retração Escapular", "Band Pull Apart"],
  "Eretores da Espinha": ["Hiperextensão", "Good Morning", "Stiff", "Superman"],
};

const BiomechanicsVaultPage = () => {
  const navigate = useNavigate();
  const [selectedMuscle, setSelectedMuscle] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [activeTab, setActiveTab] = useState("anatomia");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ content: string; citations: string[] } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const exercises = selectedMuscle ? (popularExercises[selectedMuscle] || []) : [];
  const filteredMuscles = muscleGroups.filter(m => m.toLowerCase().includes(searchQuery.toLowerCase()));

  const analyze = async (tab?: string) => {
    if (!selectedExercise || !selectedMuscle) {
      toast({ title: "Selecione músculo e exercício", variant: "destructive" });
      return;
    }
    const t = tab || activeTab;
    setLoading(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-biomechanics", {
        body: { exerciseName: selectedExercise, muscleGroup: selectedMuscle, tab: t }
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (selectedExercise && selectedMuscle) {
      analyze(tab);
    }
  };

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0a", color: "#f0fdf4" }}>
      <header className="border-b px-4 py-4" style={{ borderColor: "rgba(74,222,128,0.12)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Bone className="w-6 h-6" style={{ color: "#4ade80" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>BiomechanicsVault</h1>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Análise biomecânica com Dual-AI · Perplexity + Dr. BioMech</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-6">
        {/* Muscle selector */}
        <div>
          <h2 className="text-sm font-semibold mb-3" style={{ color: "#9ca3af" }}>SELECIONAR GRUPO MUSCULAR</h2>
          <Input
            placeholder="Buscar músculo..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mb-3"
            style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
          />
          <div className="flex flex-wrap gap-2">
            {filteredMuscles.map(m => (
              <button
                key={m}
                onClick={() => { setSelectedMuscle(m); setSelectedExercise(""); setResult(null); }}
                className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                style={{
                  background: selectedMuscle === m ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
                  border: `1px solid ${selectedMuscle === m ? "#4ade80" : "rgba(74,222,128,0.12)"}`,
                  color: selectedMuscle === m ? "#4ade80" : "#9ca3af",
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Exercise selector */}
        {selectedMuscle && exercises.length > 0 && (
          <div>
            <h2 className="text-sm font-semibold mb-3" style={{ color: "#9ca3af" }}>SELECIONAR EXERCÍCIO — {selectedMuscle}</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {exercises.map(ex => (
                <button
                  key={ex}
                  onClick={() => { setSelectedExercise(ex); setResult(null); }}
                  className="px-4 py-3 rounded-lg text-sm font-medium text-left transition-all"
                  style={{
                    background: selectedExercise === ex ? "rgba(74,222,128,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedExercise === ex ? "#4ade80" : "rgba(74,222,128,0.08)"}`,
                    color: selectedExercise === ex ? "#4ade80" : "#f0fdf4",
                  }}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Analysis tabs */}
        {selectedExercise && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold" style={{ color: "#4ade80" }}>
                {selectedExercise} — {selectedMuscle}
              </h2>
              <Button onClick={() => analyze()} disabled={loading} size="sm" style={{ background: "#4ade80", color: "#0a0f0a" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar com Dual-AI"}
              </Button>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange}>
              <TabsList className="w-full grid grid-cols-5" style={{ background: "rgba(255,255,255,0.03)" }}>
                <TabsTrigger value="anatomia" className="text-xs gap-1">
                  <Bone className="w-3 h-3" /> Anatomia
                </TabsTrigger>
                <TabsTrigger value="biomecanica" className="text-xs gap-1">
                  <Zap className="w-3 h-3" /> Biomecânica
                </TabsTrigger>
                <TabsTrigger value="recrutamento" className="text-xs gap-1">
                  <Target className="w-3 h-3" /> Recrutamento
                </TabsTrigger>
                <TabsTrigger value="execucao" className="text-xs gap-1">
                  <Crosshair className="w-3 h-3" /> Execução
                </TabsTrigger>
                <TabsTrigger value="ciencia" className="text-xs gap-1">
                  <BookOpen className="w-3 h-3" /> Ciência
                </TabsTrigger>
              </TabsList>

              {["anatomia", "biomecanica", "recrutamento", "execucao", "ciencia"].map(tab => (
                <TabsContent key={tab} value={tab}>
                  {loading && (
                    <div className="space-y-3 py-8">
                      {[1,2,3,4].map(i => (
                        <div key={i} className="h-4 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.08)", width: `${95 - i * 10}%` }} />
                      ))}
                    </div>
                  )}

                  {result && !loading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                      <ScienceIndicator studyCount={result.citations.length} />
                      <CitationBadge citations={result.citations} />
                      <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                        <CardContent className="p-4">
                          <div className="prose prose-invert prose-sm max-w-none" style={{ color: "#f0fdf4" }}>
                            <ReactMarkdown>{result.content}</ReactMarkdown>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}

                  {!result && !loading && (
                    <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                      <CardContent className="p-8 text-center">
                        <p className="text-sm" style={{ color: "#9ca3af" }}>
                          Clique em "Analisar com Dual-AI" para gerar análise científica em tempo real
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default BiomechanicsVaultPage;
