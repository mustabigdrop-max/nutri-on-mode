import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, FlaskConical, Search, BookOpen, Newspaper, Pill, ShieldQuestion, Loader2, Send, Bookmark } from "lucide-react";
import { motion } from "framer-motion";
import CitationBadge from "@/components/science/CitationBadge";
import ScienceIndicator from "@/components/science/ScienceIndicator";
import ReactMarkdown from "react-markdown";

const quickQuestions = [
  "Volume ótimo para hipertrofia de peitoral 2024",
  "Frequência de treino por semana — qual a evidência atual?",
  "Creatina — últimos estudos de eficácia",
  "Hip Thrust vs Agachamento para glúteo — evidências",
  "Deload — quando e como a ciência atual recomenda",
  "BFR training — estudos recentes",
  "Proteína por kg — recomendação atual",
  "Sono e hipertrofia — impacto real",
];

const commonMyths = [
  "Agachamento faz mal pro joelho",
  "Cardio queima músculo",
  "Não é possível ganhar músculo e perder gordura ao mesmo tempo",
  "Precisa de proteína logo após o treino (janela anabólica)",
  "Músculo vira gordura se parar de treinar",
  "Treinar em jejum queima mais gordura",
  "Mulher que treina pesado fica masculinizada",
];

const commonSupplements = [
  "Creatina Monohidratada", "Whey Protein", "Cafeína", "Beta-Alanina",
  "Citrulina Malato", "HMB", "Ashwagandha", "Ômega-3",
  "Vitamina D3", "Magnésio", "ZMA", "EAA",
];

const ScienceHubPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("evidence");

  // Dr. Evidence state
  const [question, setQuestion] = useState("");
  const [evidenceLoading, setEvidenceLoading] = useState(false);
  const [evidenceResult, setEvidenceResult] = useState<{ answer: string; rawScience: string; citations: string[] } | null>(null);

  // Supplement state
  const [supplement, setSupplement] = useState("");
  const [suppLoading, setSuppLoading] = useState(false);
  const [suppResult, setSuppResult] = useState<{ analysis: string; citations: string[] } | null>(null);

  // Myth state
  const [myth, setMyth] = useState("");
  const [mythLoading, setMythLoading] = useState(false);
  const [mythResult, setMythResult] = useState<{ analysis: string; citations: string[] } | null>(null);

  // PubMed state
  const [pubmedSearch, setPubmedSearch] = useState("");
  const [pubmedArea, setPubmedArea] = useState("hipertrofia");
  const [pubmedRecency, setPubmedRecency] = useState("ano");
  const [pubmedLoading, setPubmedLoading] = useState(false);
  const [pubmedResult, setPubmedResult] = useState<{ rawStudies: string; analysis: string; citations: string[] } | null>(null);

  const callEdgeFunction = async (fnName: string, body: any) => {
    const { data, error } = await supabase.functions.invoke(fnName, { body });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const askDrEvidence = async (q?: string) => {
    const finalQ = q || question;
    if (!finalQ.trim()) return;
    setEvidenceLoading(true);
    setEvidenceResult(null);
    try {
      const data = await callEdgeFunction("dr-evidence", { question: finalQ });
      setEvidenceResult(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setEvidenceLoading(false);
    }
  };

  const analyzeSupplement = async (name?: string) => {
    const finalName = name || supplement;
    if (!finalName.trim()) return;
    setSuppLoading(true);
    setSuppResult(null);
    try {
      const data = await callEdgeFunction("analyze-supplement", { supplementName: finalName });
      setSuppResult(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setSuppLoading(false);
    }
  };

  const verifyMyth = async (m?: string) => {
    const finalM = m || myth;
    if (!finalM.trim()) return;
    setMythLoading(true);
    setMythResult(null);
    try {
      const data = await callEdgeFunction("verify-myth", { myth: finalM });
      setMythResult(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setMythLoading(false);
    }
  };

  const searchPubmed = async () => {
    if (!pubmedSearch.trim()) return;
    setPubmedLoading(true);
    setPubmedResult(null);
    try {
      const data = await callEdgeFunction("pubmed-live", { searchTerm: pubmedSearch, area: pubmedArea, recency: pubmedRecency });
      setPubmedResult(data);
    } catch (e: any) {
      toast({ title: "Erro", description: e.message, variant: "destructive" });
    } finally {
      setPubmedLoading(false);
    }
  };

  const renderContent = (text: string) => (
    <div className="prose prose-invert prose-sm max-w-none" style={{ color: "#f0fdf4" }}>
      <ReactMarkdown>{text}</ReactMarkdown>
    </div>
  );

  return (
    <div className="min-h-screen" style={{ background: "#0a0f0a", color: "#f0fdf4" }}>
      {/* Header */}
      <header className="border-b px-4 py-4" style={{ borderColor: "rgba(74,222,128,0.12)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <FlaskConical className="w-6 h-6" style={{ color: "#4ade80" }} />
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>ScienceHub</h1>
            <p className="text-xs" style={{ color: "#9ca3af" }}>Motor de evidências científicas em tempo real · nutriON</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-5 mb-6" style={{ background: "rgba(255,255,255,0.03)" }}>
            <TabsTrigger value="evidence" className="text-xs gap-1 data-[state=active]:border-b-2" style={{ borderColor: activeTab === "evidence" ? "#4ade80" : "transparent" }}>
              <Search className="w-3 h-3" /> Dr. Evidence
            </TabsTrigger>
            <TabsTrigger value="pubmed" className="text-xs gap-1 data-[state=active]:border-b-2" style={{ borderColor: activeTab === "pubmed" ? "#4ade80" : "transparent" }}>
              <BookOpen className="w-3 h-3" /> PubMed Live
            </TabsTrigger>
            <TabsTrigger value="feed" className="text-xs gap-1 data-[state=active]:border-b-2" style={{ borderColor: activeTab === "feed" ? "#4ade80" : "transparent" }}>
              <Newspaper className="w-3 h-3" /> Feed
            </TabsTrigger>
            <TabsTrigger value="supplements" className="text-xs gap-1 data-[state=active]:border-b-2" style={{ borderColor: activeTab === "supplements" ? "#4ade80" : "transparent" }}>
              <Pill className="w-3 h-3" /> Suplementos
            </TabsTrigger>
            <TabsTrigger value="myths" className="text-xs gap-1 data-[state=active]:border-b-2" style={{ borderColor: activeTab === "myths" ? "#4ade80" : "transparent" }}>
              <ShieldQuestion className="w-3 h-3" /> Mitos
            </TabsTrigger>
          </TabsList>

          {/* DR. EVIDENCE */}
          <TabsContent value="evidence" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Pergunte qualquer coisa sobre ciência do exercício..."
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && askDrEvidence()}
                className="flex-1"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
              />
              <Button onClick={() => askDrEvidence()} disabled={evidenceLoading} style={{ background: "#4ade80", color: "#0a0f0a" }}>
                {evidenceLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {quickQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => { setQuestion(q); askDrEvidence(q); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", color: "#4ade80" }}
                >
                  {q}
                </button>
              ))}
            </div>

            {evidenceLoading && (
              <div className="space-y-3">
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.1)", width: "70%" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.08)", width: "90%" }} />
                <div className="h-4 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.06)", width: "60%" }} />
              </div>
            )}

            {evidenceResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <ScienceIndicator studyCount={evidenceResult.citations.length} />

                <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>Fontes Consultadas</Badge>
                      <span className="text-xs" style={{ color: "#9ca3af" }}>Perplexity Sonar Pro · Tempo real</span>
                    </div>
                    <CitationBadge citations={evidenceResult.citations} />
                  </CardContent>
                </Card>

                <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge style={{ background: "rgba(74,222,128,0.15)", color: "#4ade80" }}>Análise do Dr. Evidence</Badge>
                    </div>
                    {renderContent(evidenceResult.answer)}
                  </CardContent>
                </Card>

                <div className="flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" className="text-xs gap-1">
                    <Bookmark className="w-3 h-3" /> Salvar Estudo
                  </Button>
                </div>
              </motion.div>
            )}
          </TabsContent>

          {/* PUBMED LIVE */}
          <TabsContent value="pubmed" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                placeholder="Buscar estudos..."
                value={pubmedSearch}
                onChange={(e) => setPubmedSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && searchPubmed()}
                className="sm:col-span-3"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
              />
              <select value={pubmedArea} onChange={(e) => setPubmedArea(e.target.value)} className="rounded-md px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)", color: "#f0fdf4", border: "1px solid rgba(74,222,128,0.15)" }}>
                <option value="hipertrofia">Hipertrofia</option>
                <option value="forca">Força</option>
                <option value="biomecanica">Biomecânica</option>
                <option value="nutricao">Nutrição Esportiva</option>
                <option value="suplementacao">Suplementação</option>
                <option value="recuperacao">Recuperação</option>
                <option value="cardio">Cardio</option>
                <option value="composicao">Composição Corporal</option>
              </select>
              <select value={pubmedRecency} onChange={(e) => setPubmedRecency(e.target.value)} className="rounded-md px-3 py-2 text-sm" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)", color: "#f0fdf4", border: "1px solid rgba(74,222,128,0.15)" }}>
                <option value="mes">Último mês</option>
                <option value="trimestre">Últimos 3 meses</option>
                <option value="ano">Último ano</option>
              </select>
              <Button onClick={searchPubmed} disabled={pubmedLoading} style={{ background: "#4ade80", color: "#0a0f0a" }}>
                {pubmedLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
              </Button>
            </div>

            {pubmedLoading && (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-20 rounded-lg animate-pulse" style={{ background: "rgba(74,222,128,0.06)" }} />)}
              </div>
            )}

            {pubmedResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <CitationBadge citations={pubmedResult.citations} />
                <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <CardContent className="p-4">
                    {renderContent(pubmedResult.analysis)}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* SCIENCE FEED */}
          <TabsContent value="feed" className="space-y-4">
            <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
              <CardContent className="p-8 text-center">
                <Newspaper className="w-12 h-12 mx-auto mb-3" style={{ color: "#4ade80", opacity: 0.5 }} />
                <h3 className="font-bold mb-2">Science Feed Semanal</h3>
                <p className="text-sm" style={{ color: "#9ca3af" }}>
                  O digest automático de novidades científicas será gerado toda segunda-feira às 8h.
                  As últimas descobertas em hipertrofia, biomecânica, suplementação e nutrição esportiva — direto na sua tela.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* SUPLEMENTOS */}
          <TabsContent value="supplements" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o nome do suplemento..."
                value={supplement}
                onChange={(e) => setSupplement(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && analyzeSupplement()}
                className="flex-1"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
              />
              <Button onClick={() => analyzeSupplement()} disabled={suppLoading} style={{ background: "#4ade80", color: "#0a0f0a" }}>
                {suppLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Analisar"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {commonSupplements.map((s, i) => (
                <button
                  key={i}
                  onClick={() => { setSupplement(s); analyzeSupplement(s); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", color: "#4ade80" }}
                >
                  {s}
                </button>
              ))}
            </div>

            {suppLoading && (
              <div className="space-y-3">
                {[1,2,3,4].map(i => <div key={i} className="h-6 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.08)", width: `${90 - i * 10}%` }} />)}
              </div>
            )}

            {suppResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <CitationBadge citations={suppResult.citations} />
                <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <CardContent className="p-4">
                    {renderContent(suppResult.analysis)}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>

          {/* MITOS & VERDADES */}
          <TabsContent value="myths" className="space-y-4">
            <div className="flex gap-2">
              <Input
                placeholder="Digite o mito para verificar..."
                value={myth}
                onChange={(e) => setMyth(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && verifyMyth()}
                className="flex-1"
                style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
              />
              <Button onClick={() => verifyMyth()} disabled={mythLoading} style={{ background: "#4ade80", color: "#0a0f0a" }}>
                {mythLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verificar"}
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {commonMyths.map((m, i) => (
                <button
                  key={i}
                  onClick={() => { setMyth(m); verifyMyth(m); }}
                  className="text-xs px-3 py-1.5 rounded-full transition-colors"
                  style={{ background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.15)", color: "#4ade80" }}
                >
                  {m}
                </button>
              ))}
            </div>

            {mythLoading && (
              <div className="space-y-3">
                {[1,2,3].map(i => <div key={i} className="h-6 rounded animate-pulse" style={{ background: "rgba(74,222,128,0.08)", width: `${85 - i * 12}%` }} />)}
              </div>
            )}

            {mythResult && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
                <CitationBadge citations={mythResult.citations} />
                <Card style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.12)" }}>
                  <CardContent className="p-4">
                    {renderContent(mythResult.analysis)}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default ScienceHubPage;
