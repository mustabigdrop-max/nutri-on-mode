import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, ExternalLink, MessageSquare, Bookmark, Filter, Globe2, FlaskConical, GraduationCap, Dna, Brain, Pill, Dumbbell, Clock, ChevronDown, ChevronUp } from "lucide-react";
import VoiceRecorderButton from "@/components/ui/VoiceRecorderButton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface StudyResult {
  title: string;
  authors?: string;
  year?: string;
  journal?: string;
  summary: string;
  badge: "favorable" | "inconclusive" | "refutes";
  relevance?: number;
  source?: string;
}

interface StudySearchProps {
  onAskApex: (question: string) => void;
}

const BADGE_MAP = {
  favorable: { label: "✅ Favorável", cls: "text-accent border-accent/30" },
  inconclusive: { label: "⚠️ Inconclusivo", cls: "text-primary border-primary/30" },
  refutes: { label: "❌ Refuta", cls: "text-destructive border-destructive/30" },
};

const CATEGORIES = [
  { id: "general", label: "Geral", icon: Globe2 },
  { id: "nutrition", label: "Nutrição", icon: FlaskConical },
  { id: "supplements", label: "Suplementos", icon: Pill },
  { id: "performance", label: "Performance", icon: Dumbbell },
  { id: "longevity", label: "Longevidade", icon: Clock },
  { id: "microbiome", label: "Microbioma", icon: Dna },
];

const STUDY_TYPES = [
  { id: "all", label: "Todos" },
  { id: "meta-analysis", label: "Meta-análises" },
  { id: "rct", label: "RCTs" },
];

const RECENCY_OPTIONS = [
  { id: "year", label: "Último ano" },
  { id: "month", label: "Último mês" },
  { id: "week", label: "Última semana" },
];

const StudyCard = ({ study, onAskApex, onSave }: { study: StudyResult; onAskApex: (q: string) => void; onSave: (s: StudyResult) => void }) => {
  const [open, setOpen] = useState(false);
  const badgeInfo = BADGE_MAP[study.badge] || BADGE_MAP.favorable;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <GraduationCap className="w-4 h-4 text-primary flex-shrink-0" />
            <CardTitle className="text-sm font-bold truncate">{study.title}</CardTitle>
            <Badge variant="outline" className={`${badgeInfo.cls} flex-shrink-0`}>
              {badgeInfo.label}
            </Badge>
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
        {(study.authors || study.journal || study.year) && (
          <p className="text-[10px] text-muted-foreground mt-1 ml-6">
            {[study.authors, study.journal, study.year].filter(Boolean).join(" · ")}
          </p>
        )}
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {study.summary && <p className="text-xs text-foreground">{study.summary}</p>}

          {study.relevance && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div key={j} className={`w-1.5 h-1.5 rounded-full ${j < study.relevance! ? "bg-primary" : "bg-border"}`} />
                ))}
              </div>
              <span className="text-[9px] font-mono text-muted-foreground">Relevância {study.relevance}/10</span>
            </div>
          )}

          {study.source && (
            <a href={study.source} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary">
              <ExternalLink className="w-3 h-3" /> Ver estudo original
            </a>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={() => onAskApex(`Analise este estudo: "${study.title}" ${study.summary ? `— ${study.summary}` : ""}. Como posso aplicar no meu caso?`)}
              className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
            >
              <MessageSquare className="w-3 h-3" /> Perguntar ao APEX
            </button>
            <button
              onClick={() => onSave(study)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary"
            >
              <Bookmark className="w-3 h-3" /> Salvar
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const StudySearch = ({ onAskApex }: StudySearchProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullText, setFullText] = useState("");
  const [citations, setCitations] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [category, setCategory] = useState("general");
  const [studyType, setStudyType] = useState("all");
  const [recency, setRecency] = useState("year");
  const [searchInfo, setSearchInfo] = useState<{ model?: string; searchMode?: string }>({});
  const [synthOpen, setSynthOpen] = useState(false);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    setFullText("");
    setCitations([]);
    try {
      const { data, error } = await supabase.functions.invoke("perplexity-search", {
        body: {
          query: query.trim(),
          category,
          filters: {
            searchMode: "academic",
            recency,
            studyType: studyType !== "all" ? studyType : undefined,
            lang: "pt-BR",
          },
        },
      });
      if (error) throw error;

      setFullText(data.answer || "");
      setCitations(data.citations || []);
      setSearchInfo({ model: data.model, searchMode: data.searchMode });
      setSynthOpen(true);

      if (data.studies && data.studies.length > 0) {
        setResults(data.studies.map((s: any) => ({
          title: s.title || "Estudo",
          authors: s.authors || "",
          year: s.year || "",
          journal: s.journal || "",
          summary: s.summary || "",
          badge: (s.badge as StudyResult["badge"]) || "favorable",
          relevance: s.relevance || 5,
          source: s.source || undefined,
        })));
      } else {
        const studies: StudyResult[] = (data.citations || []).slice(0, 5).map((url: string, i: number) => ({
          title: `Estudo ${i + 1} — ${query}`,
          summary: "",
          badge: "favorable" as const,
          source: url,
        }));
        if (studies.length === 0 && data.answer) {
          studies.push({
            title: `Resultados para "${query}"`,
            summary: (data.answer || "").slice(0, 200),
            badge: "favorable",
          });
        }
        setResults(studies);
      }
    } catch (e) {
      console.error(e);
      toast.error("Erro na busca de estudos");
    }
    setLoading(false);
  };

  const saveStudy = async (study: StudyResult) => {
    if (!user) return;
    await supabase.from("lab_saved_items").insert({
      user_id: user.id,
      tipo: "estudo",
      titulo: study.title,
      conteudo: { summary: study.summary, source: study.source, badge: study.badge, authors: study.authors, year: study.year, journal: study.journal },
      tags: ["estudo", category, query],
    });
    toast.success("Estudo salvo no caderno!");
  };

  return (
    <div className="space-y-4 pb-16">
      {/* Search bar */}
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Buscar estudos: creatina, jejum intermitente, whey..."
            className="pl-9 h-10 text-xs bg-card border-border"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-10 w-10 flex-shrink-0 ${showFilters ? "bg-primary/10 border-primary/30 text-primary" : ""}`}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <VoiceRecorderButton onTranscript={(t) => setQuery(prev => prev ? prev + " " + t : t)} disabled={loading} size="sm" />
        <Button data-search-btn onClick={search} disabled={loading || !query.trim()} className="h-10 px-5 text-xs">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {/* Filters panel as SectionCard */}
      {showFilters && (
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardContent className="p-4 space-y-4">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Categoria</p>
              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon;
                  return (
                    <button key={cat.id} onClick={() => setCategory(cat.id)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                        category === cat.id
                          ? "bg-primary/15 text-primary border border-primary/30"
                          : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                      }`}>
                      <Icon className="w-3.5 h-3.5" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tipo de estudo</p>
              <div className="flex flex-wrap gap-2">
                {STUDY_TYPES.map(st => (
                  <button key={st.id} onClick={() => setStudyType(st.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      studyType === st.id
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                    }`}>
                    {st.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Período</p>
              <div className="flex flex-wrap gap-2">
                {RECENCY_OPTIONS.map(r => (
                  <button key={r.id} onClick={() => setRecency(r.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      recency === r.id
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                    }`}>
                    {r.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
              <span className="text-[10px] text-muted-foreground font-mono">Modo acadêmico ativo — PubMed, Cochrane, Nature, Lancet, NEJM</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search info */}
      {searchInfo.model && results.length > 0 && (
        <div className="flex items-center gap-2">
          <Globe2 className="w-3.5 h-3.5 text-primary/50" />
          <span className="text-[10px] font-mono text-muted-foreground">
            Pesquisa acadêmica global via {searchInfo.model} · {results.length} estudos encontrados
          </span>
        </div>
      )}

      {/* Full text synthesis as SectionCard */}
      {fullText && (
        <Card className="border-border/60 bg-card/80 backdrop-blur">
          <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setSynthOpen(!synthOpen)}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-primary" />
                <CardTitle className="text-sm font-bold">Síntese da Pesquisa</CardTitle>
                <Badge variant="outline" className="text-primary border-primary/30">
                  {citations.length} fontes
                </Badge>
              </div>
              {synthOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </div>
          </CardHeader>
          {synthOpen && (
            <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
              <div className="prose prose-sm prose-invert max-w-none [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs">
                <ReactMarkdown>{fullText.slice(0, 1200)}</ReactMarkdown>
              </div>
              {citations.length > 0 && (
                <div className="space-y-1 pt-2 border-t border-border">
                  <p className="text-[10px] font-mono text-muted-foreground uppercase">{citations.length} fontes encontradas</p>
                  {citations.slice(0, 8).map((c, i) => (
                    <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" /> {c}
                    </a>
                  ))}
                </div>
              )}
            </CardContent>
          )}
        </Card>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Pesquisando bases científicas globais...</p>
          <p className="text-[10px] text-muted-foreground/60">PubMed · Cochrane · Nature · Lancet · JISSN</p>
        </div>
      )}

      {/* Study cards */}
      <div className="space-y-2">
        {results.map((study, i) => (
          <StudyCard key={i} study={study} onAskApex={onAskApex} onSave={saveStudy} />
        ))}
      </div>

      {/* Empty state */}
      {!loading && results.length === 0 && !fullText && (
        <div className="text-center py-12 space-y-3">
          <GraduationCap className="w-12 h-12 text-primary/20 mx-auto" />
          <p className="text-sm text-muted-foreground">Pesquise estudos científicos de todo o mundo</p>
          <p className="text-[10px] text-muted-foreground/60">Meta-análises · RCTs · Revisões Sistemáticas</p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {["beta oxidação l-carnitina", "creatina dosagem", "jejum intermitente", "proteína pós-treino", "vitamina D imunidade", "microbioma e humor"].map(s => (
              <button key={s} onClick={() => setQuery(s)}
                className="px-3 py-1.5 rounded-lg text-[10px] bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all">
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StudySearch;
