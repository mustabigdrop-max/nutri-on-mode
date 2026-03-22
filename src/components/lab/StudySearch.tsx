import { useState } from "react";
import { Search, Loader2, ExternalLink, MessageSquare, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface StudyResult {
  title: string;
  summary: string;
  badge: "favorable" | "inconclusive" | "refutes";
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

const StudySearch = ({ onAskApex }: StudySearchProps) => {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<StudyResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [fullText, setFullText] = useState("");
  const [citations, setCitations] = useState<string[]>([]);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("perplexity-search", {
        body: {
          query: `${query} site:pubmed.gov OR site:examine.com OR site:jissn.com 2023 2024 2025`,
          category: "nutrition",
        },
      });
      if (error) throw error;
      
      setFullText(data.answer || "");
      setCitations(data.citations || []);
      
      // Parse into study cards from the response
      const studies: StudyResult[] = (data.citations || []).slice(0, 5).map((url: string, i: number) => ({
        title: `Estudo ${i + 1} — ${query}`,
        summary: "",
        badge: "favorable" as const,
        source: url,
      }));
      
      if (studies.length === 0) {
        studies.push({
          title: `Resultados para "${query}"`,
          summary: (data.answer || "").slice(0, 200),
          badge: "favorable",
        });
      }
      
      setResults(studies);
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
      conteudo: { summary: study.summary, source: study.source, badge: study.badge },
      tags: ["estudo", query],
    });
    toast.success("Estudo salvo no caderno!");
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === "Enter" && search()}
            placeholder="Buscar estudos sobre creatina, whey, jejum..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" />
        </div>
        <Button onClick={search} disabled={loading || !query.trim()} className="h-12 px-6">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buscar"}
        </Button>
      </div>

      {fullText && (
        <div className="p-4 rounded-xl bg-card border border-border space-y-3">
          <h4 className="text-sm font-bold text-foreground">Resumo dos resultados</h4>
          <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">{fullText.slice(0, 600)}...</p>
          {citations.length > 0 && (
            <div className="space-y-1 pt-2 border-t border-border">
              <p className="text-[10px] font-mono text-muted-foreground uppercase">Fontes</p>
              {citations.slice(0, 5).map((c, i) => (
                <a key={i} href={c} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" /> {c}
                </a>
              ))}
            </div>
          )}
        </div>
      )}

      {results.map((study, i) => (
        <div key={i} className="p-4 rounded-xl bg-card border border-border space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-sm font-semibold text-foreground flex-1">{study.title}</h4>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border ${BADGE_MAP[study.badge].cls}`}>
              {BADGE_MAP[study.badge].label}
            </span>
          </div>
          {study.summary && <p className="text-xs text-muted-foreground">{study.summary}</p>}
          {study.source && (
            <a href={study.source} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[10px] text-primary/60 hover:text-primary">
              <ExternalLink className="w-3 h-3" /> Estudo original
            </a>
          )}
          <div className="flex gap-3 pt-1">
            <button onClick={() => onAskApex(`Analise este estudo sobre "${study.title}" e me diga como aplicar no meu caso.`)}
              className="flex items-center gap-1 text-[10px] font-mono text-primary hover:underline">
              <MessageSquare className="w-3 h-3" /> Perguntar ao APEX
            </button>
            <button onClick={() => saveStudy(study)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary">
              <Bookmark className="w-3 h-3" /> Salvar
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StudySearch;
