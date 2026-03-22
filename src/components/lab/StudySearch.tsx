import { useState } from "react";
import { Search, Loader2, ExternalLink, MessageSquare, Bookmark, Filter, Globe2, FlaskConical, GraduationCap, Dna, Brain, Pill, Dumbbell, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  favorable: { label: "✅ Favorável", cls: "bg-accent/10 text-accent border-accent/20" },
  inconclusive: { label: "⚠️ Inconclusivo", cls: "bg-primary/10 text-primary border-primary/20" },
  refutes: { label: "❌ Refuta", cls: "bg-destructive/10 text-destructive border-destructive/20" },
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

      // Use structured studies from backend if available
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
        // Fallback: create cards from citations
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
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Buscar estudos: creatina, jejum intermitente, whey..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setShowFilters(!showFilters)}
          className={`h-12 w-12 flex-shrink-0 ${showFilters ? "bg-primary/10 border-primary/30 text-primary" : ""}`}
        >
          <Filter className="w-4 h-4" />
        </Button>
        <Button data-search-btn onClick={search} disabled={loading || !query.trim()} className="h-12 px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {/* Filters panel */}
      {showFilters && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Categories */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Categoria</p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map(cat => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setCategory(cat.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      category === cat.id
                        ? "bg-primary/15 text-primary border border-primary/30"
                        : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Study type */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Tipo de estudo</p>
            <div className="flex flex-wrap gap-2">
              {STUDY_TYPES.map(st => (
                <button
                  key={st.id}
                  onClick={() => setStudyType(st.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    studyType === st.id
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Recency */}
          <div>
            <p className="text-[10px] font-mono text-muted-foreground uppercase mb-2">Período</p>
            <div className="flex flex-wrap gap-2">
              {RECENCY_OPTIONS.map(r => (
                <button
                  key={r.id}
                  onClick={() => setRecency(r.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    recency === r.id
                      ? "bg-primary/15 text-primary border border-primary/30"
                      : "bg-secondary/50 text-muted-foreground border border-transparent hover:border-border"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <GraduationCap className="w-3.5 h-3.5 text-primary/60" />
            <span className="text-[10px] text-muted-foreground font-mono">Modo acadêmico ativo — PubMed, Cochrane, Nature, Lancet, NEJM</span>
          </div>
        </div>
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

      {/* Full text summary */}
      {fullText && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            <h4 className="text-sm font-bold text-foreground">Síntese da pesquisa</h4>
          </div>
          <div className="text-xs text-muted-foreground leading-relaxed prose prose-sm prose-invert max-w-none [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs">
            <ReactMarkdown>{fullText.slice(0, 1200)}</ReactMarkdown>
          </div>
          {citations.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              <p className="text-[10px] font-mono text-muted-foreground uppercase">
                {citations.length} fontes encontradas
              </p>
              {citations.slice(0, 8).map((c, i) => (
                <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" /> {c}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center py-12 gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground font-mono">Pesquisando bases científicas globais...</p>
          <p className="text-[10px] text-muted-foreground/60">PubMed · Cochrane · Nature · Lancet · JISSN</p>
        </div>
      )}

      {/* Study cards */}
      {results.map((study, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-2 hover:border-primary/20 transition-colors">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-foreground leading-snug">{study.title}</h4>
              {(study.authors || study.journal || study.year) && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {[study.authors, study.journal, study.year].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border flex-shrink-0 ${BADGE_MAP[study.badge]?.cls || BADGE_MAP.favorable.cls}`}>
              {BADGE_MAP[study.badge]?.label || BADGE_MAP.favorable.label}
            </span>
          </div>

          {study.summary && (
            <p className="text-xs text-muted-foreground leading-relaxed">{study.summary}</p>
          )}

          {study.relevance && (
            <div className="flex items-center gap-1.5">
              <div className="flex gap-0.5">
                {Array.from({ length: 10 }).map((_, j) => (
                  <div
                    key={j}
                    className={`w-1.5 h-1.5 rounded-full ${j < study.relevance! ? "bg-primary" : "bg-border"}`}
                  />
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
              onClick={() => saveStudy(study)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary"
            >
              <Bookmark className="w-3 h-3" /> Salvar
            </button>
          </div>
        </div>
      ))}

      {/* Empty state */}
      {!loading && results.length === 0 && !fullText && (
        <div className="text-center py-12 space-y-3">
          <GraduationCap className="w-12 h-12 text-primary/20 mx-auto" />
          <p className="text-sm text-muted-foreground">Pesquise estudos científicos de todo o mundo</p>
          <p className="text-[10px] text-muted-foreground/60">Meta-análises · RCTs · Revisões Sistemáticas</p>
          <div className="flex flex-wrap gap-2 justify-center pt-2">
            {["creatina dosagem", "jejum intermitente", "proteína pós-treino", "vitamina D imunidade", "microbioma e humor"].map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="px-3 py-1.5 rounded-lg text-[10px] bg-card border border-border text-muted-foreground hover:text-primary hover:border-primary/30 transition-all"
              >
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
