import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, ExternalLink, Clock, Brain, FlaskConical, Salad, HeartPulse } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { usePerplexitySearch } from "@/hooks/useMentalPerformance";

const CATEGORIES = [
  { key: "general", label: "Geral", icon: Search },
  { key: "nutrition", label: "Nutrição", icon: Salad },
  { key: "nootropics", label: "Nootrópicos", icon: Brain },
  { key: "health", label: "Saúde", icon: HeartPulse },
  { key: "recipes", label: "Receitas", icon: FlaskConical },
];

const QUICK_SEARCHES = [
  "Benefícios da creatina para cognição",
  "Melhores alimentos para foco e concentração",
  "Ashwagandha KSM-66 dosagem e efeitos",
  "Jejum intermitente e performance mental",
  "Protocolo anti-inflamatório com alimentos",
  "L-Teanina e cafeína sinergismo",
];

const AdvancedSearch = () => {
  const { loading, results, history, search, clearResults } = usePerplexitySearch();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("general");

  const handleSearch = (q?: string) => {
    const searchQuery = q || query;
    if (!searchQuery.trim()) return;
    search(searchQuery, category);
    if (q) setQuery(q);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2">
        <Search className="w-5 h-5 text-[hsl(200,80%,50%)]" /> Pesquisa Avançada
      </h2>
      <p className="text-xs text-muted-foreground">Busca científica com IA — powered by Perplexity</p>

      {/* Category Tabs */}
      <Tabs value={category} onValueChange={setCategory}>
        <TabsList className="w-full grid grid-cols-5 h-auto">
          {CATEGORIES.map(c => (
            <TabsTrigger key={c.key} value={c.key} className="text-xs px-1 py-2 flex flex-col gap-1">
              <c.icon className="w-4 h-4" />{c.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Search Bar */}
      <div className="flex gap-2">
        <Input placeholder="Ex: Efeitos do magnésio no sono..." value={query} onChange={e => setQuery(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSearch()}
          className="flex-1 border-[hsl(200,80%,50%)]/30 focus-visible:ring-[hsl(200,80%,50%)]" />
        <Button onClick={() => handleSearch()} disabled={loading || !query.trim()} className="bg-[hsl(200,80%,50%)]">
          {loading ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {/* Quick Searches */}
      {!results && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">🔍 Pesquisas sugeridas</p>
          <div className="flex flex-wrap gap-2">
            {QUICK_SEARCHES.map(q => (
              <Badge key={q} variant="outline" className="cursor-pointer hover:bg-secondary/80 text-xs" onClick={() => handleSearch(q)}>
                {q}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {results && (
        <Card className="bg-card/80 border-[hsl(200,80%,50%)]/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Resultado</CardTitle>
              <Button variant="ghost" size="sm" onClick={clearResults}>Nova pesquisa</Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="prose prose-invert prose-sm max-w-none">
              <ReactMarkdown>{results.answer}</ReactMarkdown>
            </div>
            {results.citations?.length > 0 && (
              <div className="border-t border-border pt-3 mt-3">
                <p className="text-xs text-muted-foreground mb-2">📚 Fontes ({results.citations.length})</p>
                <div className="space-y-1">
                  {results.citations.map((url: string, i: number) => (
                    <a key={i} href={url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-[hsl(200,80%,50%)] hover:underline flex items-center gap-1 truncate">
                      <ExternalLink className="w-3 h-3 flex-shrink-0" />
                      {url.replace(/https?:\/\/(www\.)?/, "").split("/")[0]}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* History */}
      {history.length > 0 && !results && (
        <div className="space-y-2">
          <h3 className="text-sm font-medium flex items-center gap-2"><Clock className="w-4 h-4" /> Pesquisas recentes</h3>
          {history.slice(0, 5).map((h: any) => (
            <Card key={h.id} className="bg-card/80 cursor-pointer hover:bg-secondary/50 transition-colors" onClick={() => handleSearch(h.query)}>
              <CardContent className="p-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium truncate">{h.query}</p>
                  <p className="text-xs text-muted-foreground">{new Date(h.created_at).toLocaleDateString("pt-BR")} · {h.category}</p>
                </div>
                <Search className="w-4 h-4 text-muted-foreground" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdvancedSearch;
