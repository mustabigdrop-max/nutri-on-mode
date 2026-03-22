import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Tag, FileText, Microscope, BookOpen, Loader2, ChevronDown, ChevronUp, ExternalLink, Copy, Search } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface SavedItem {
  id: string;
  tipo: string;
  titulo: string | null;
  conteudo: any;
  tags: string[];
  created_at: string;
}

const TIPO_ICON: Record<string, any> = {
  resposta: Microscope,
  protocolo: BookOpen,
  estudo: FileText,
  pesquisa: Search,
};

const TIPO_LABEL: Record<string, string> = {
  resposta: "Resposta APEX",
  protocolo: "Protocolo",
  estudo: "Estudo",
  pesquisa: "Pesquisa",
};

const LabNotebook = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchItems = async () => {
    if (!user) return;
    let q = supabase
      .from("lab_saved_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (filter) q = q.contains("tags", [filter]);
    const { data } = await q;
    setItems((data as SavedItem[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchItems();
  }, [user, filter]);

  const deleteItem = async (id: string) => {
    await supabase.from("lab_saved_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removido do caderno");
  };

  const copyContent = (item: SavedItem) => {
    const text = item.conteudo?.answer || item.conteudo?.summary || item.conteudo?.question || "";
    navigator.clipboard.writeText(text);
    toast.success("Copiado!");
  };

  const allTags = [...new Set(items.flatMap(i => i.tags || []))];

  const filteredItems = searchQuery
    ? items.filter(i =>
        (i.titulo || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        JSON.stringify(i.conteudo || {}).toLowerCase().includes(searchQuery.toLowerCase())
      )
    : items;

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Search */}
      {items.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar no caderno..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-foreground text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      )}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
              !filter
                ? "bg-primary/20 border-primary/40 text-primary"
                : "border-border text-muted-foreground hover:border-primary/20"
            }`}
          >
            Todos ({items.length})
          </button>
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                filter === tag
                  ? "bg-primary/20 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/20"
              }`}
            >
              <Tag className="w-2.5 h-2.5 inline mr-1" />
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Nenhum resultado encontrado" : "Seu caderno está vazio"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {searchQuery
              ? "Tente outra busca"
              : "Salve respostas do APEX, estudos e protocolos para consultar depois."}
          </p>
        </div>
      ) : (
        filteredItems.map(item => {
          const Icon = TIPO_ICON[item.tipo] || FileText;
          const isExpanded = expandedId === item.id;
          const hasAnswer = !!item.conteudo?.answer;
          const hasSummary = !!item.conteudo?.summary;
          const hasQuestion = !!item.conteudo?.question;
          const hasFontes = item.conteudo?.fontes?.length > 0;
          const hasSource = !!item.conteudo?.source;
          const hasAuthors = !!item.conteudo?.authors;
          const hasJournal = !!item.conteudo?.journal;
          const hasYear = !!item.conteudo?.year;
          const badge = item.conteudo?.badge;

          return (
            <div
              key={item.id}
              className="rounded-xl bg-card border border-border overflow-hidden hover:border-primary/20 transition-colors"
            >
              {/* Header */}
              <div
                className="flex items-start justify-between gap-2 p-4 cursor-pointer"
                onClick={() => setExpandedId(isExpanded ? null : item.id)}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-mono text-primary/60 uppercase">
                        {TIPO_LABEL[item.tipo] || item.tipo}
                      </span>
                      {badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded-full border ${
                            badge === "favorable"
                              ? "bg-accent/10 text-accent border-accent/20"
                              : badge === "refutes"
                              ? "bg-destructive/10 text-destructive border-destructive/20"
                              : "bg-primary/10 text-primary border-primary/20"
                          }`}
                        >
                          {badge === "favorable" ? "✅" : badge === "refutes" ? "❌" : "⚠️"}
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-semibold text-foreground leading-snug mt-0.5">
                      {item.titulo || "Sem título"}
                    </h4>
                    {(hasAuthors || hasJournal || hasYear) && (
                      <p className="text-[10px] text-muted-foreground mt-0.5">
                        {[item.conteudo?.authors, item.conteudo?.journal, item.conteudo?.year]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    )}
                    {!isExpanded && (hasSummary || hasAnswer) && (
                      <p className="text-xs text-muted-foreground/70 mt-1 line-clamp-2">
                        {item.conteudo?.summary || (item.conteudo?.answer || "").slice(0, 150)}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
                  {/* Original question */}
                  {hasQuestion && (
                    <div className="p-3 rounded-lg bg-secondary/50 border border-border">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Pergunta</p>
                      <p className="text-xs text-foreground">{item.conteudo.question}</p>
                    </div>
                  )}

                  {/* Answer with markdown */}
                  {hasAnswer && (
                    <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4">
                      <ReactMarkdown>{item.conteudo.answer}</ReactMarkdown>
                    </div>
                  )}

                  {/* Summary for studies */}
                  {hasSummary && !hasAnswer && (
                    <p className="text-xs text-muted-foreground leading-relaxed">{item.conteudo.summary}</p>
                  )}

                  {/* Sources */}
                  {hasFontes && (
                    <div className="space-y-1 pt-2 border-t border-border">
                      <p className="text-[10px] font-mono text-muted-foreground uppercase">
                        {item.conteudo.fontes.length} fontes
                      </p>
                      {item.conteudo.fontes.slice(0, 5).map((f: string, i: number) => (
                        <a
                          key={i}
                          href={f}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate"
                        >
                          <ExternalLink className="w-3 h-3 flex-shrink-0" /> {f}
                        </a>
                      ))}
                    </div>
                  )}

                  {/* Single source link */}
                  {hasSource && !hasFontes && (
                    <a
                      href={item.conteudo.source}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary"
                    >
                      <ExternalLink className="w-3 h-3" /> Ver estudo original
                    </a>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={() => copyContent(item)}
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Copy className="w-3 h-3" /> Copiar
                    </button>
                    <button
                      onClick={() => deleteItem(item.id)}
                      className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors"
                    >
                      <Trash2 className="w-3 h-3" /> Remover
                    </button>
                  </div>
                </div>
              )}

              {/* Footer tags */}
              <div className="flex items-center gap-2 px-4 pb-3">
                {(item.tags || []).slice(0, 4).map(tag => (
                  <span
                    key={tag}
                    className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-[9px] text-muted-foreground/50 ml-auto">
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default LabNotebook;
