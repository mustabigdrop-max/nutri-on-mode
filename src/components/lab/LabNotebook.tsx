import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
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
  coach_resposta: Microscope,
  elite_protocolo: Microscope,
};

const TIPO_LABEL: Record<string, string> = {
  resposta: "Resposta APEX",
  protocolo: "Protocolo",
  estudo: "Estudo",
  pesquisa: "Pesquisa",
  coach_resposta: "Coach Mode",
  elite_protocolo: "APEX Elite",
};

const NotebookCard = ({ item, onDelete, onCopy }: { item: SavedItem; onDelete: (id: string) => void; onCopy: (item: SavedItem) => void }) => {
  const [open, setOpen] = useState(false);
  const Icon = TIPO_ICON[item.tipo] || FileText;
  const hasAnswer = !!item.conteudo?.answer;
  const hasSummary = !!item.conteudo?.summary;
  const hasQuestion = !!item.conteudo?.question;
  const hasFontes = item.conteudo?.fontes?.length > 0;
  const hasSource = !!item.conteudo?.source;
  const badge = item.conteudo?.badge;

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Icon className="w-4 h-4 text-primary flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-sm font-bold truncate">{item.titulo || "Sem título"}</CardTitle>
                <Badge variant="outline" className="text-primary border-primary/30 text-[9px] flex-shrink-0">
                  {TIPO_LABEL[item.tipo] || item.tipo}
                </Badge>
                {badge && (
                  <Badge variant="outline" className={`text-[9px] flex-shrink-0 ${
                    badge === "favorable" ? "text-accent border-accent/30" :
                    badge === "refutes" ? "text-destructive border-destructive/30" :
                    "text-primary border-primary/30"
                  }`}>
                    {badge === "favorable" ? "✅" : badge === "refutes" ? "❌" : "⚠️"}
                  </Badge>
                )}
              </div>
              {!open && (hasSummary || hasAnswer) && (
                <p className="text-[10px] text-muted-foreground mt-0.5 line-clamp-1">
                  {item.conteudo?.summary || (item.conteudo?.answer || "").slice(0, 100)}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-[9px] text-muted-foreground/50">
              {new Date(item.created_at).toLocaleDateString("pt-BR")}
            </span>
            {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
          </div>
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {hasQuestion && (
            <Card className="bg-secondary/30 border-border p-3">
              <p className="text-[10px] font-mono text-muted-foreground uppercase mb-1">Pergunta</p>
              <p className="text-xs text-foreground">{item.conteudo.question}</p>
            </Card>
          )}

          {hasAnswer && (
            <div className="prose prose-sm prose-invert max-w-none text-xs leading-relaxed [&_strong]:text-primary [&_h3]:text-primary [&_h3]:text-xs [&_h3]:font-bold [&_ul]:list-disc [&_ul]:pl-4">
              <ReactMarkdown>{item.conteudo.answer}</ReactMarkdown>
            </div>
          )}

          {hasSummary && !hasAnswer && (
            <p className="text-xs text-foreground leading-relaxed">{item.conteudo.summary}</p>
          )}

          {hasFontes && (
            <div className="space-y-1 pt-2 border-t border-border">
              <p className="text-[10px] font-mono text-muted-foreground uppercase">{item.conteudo.fontes.length} fontes</p>
              {item.conteudo.fontes.slice(0, 5).map((f: string, i: number) => (
                <a key={i} href={f} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary truncate">
                  <ExternalLink className="w-3 h-3 flex-shrink-0" /> {f}
                </a>
              ))}
            </div>
          )}

          {hasSource && !hasFontes && (
            <a href={item.conteudo.source} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-primary/70 hover:text-primary">
              <ExternalLink className="w-3 h-3" /> Ver estudo original
            </a>
          )}

          {/* Tags */}
          {(item.tags || []).length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {item.tags.slice(0, 5).map(tag => (
                <Badge key={tag} variant="secondary" className="text-[9px]">
                  <Tag className="w-2.5 h-2.5 mr-0.5" /> {tag}
                </Badge>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button onClick={() => onCopy(item)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-primary transition-colors">
              <Copy className="w-3 h-3" /> Copiar
            </button>
            <button onClick={() => onDelete(item.id)}
              className="flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-destructive transition-colors">
              <Trash2 className="w-3 h-3" /> Remover
            </button>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const LabNotebook = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);
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
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Buscar no caderno..."
            className="pl-9 h-9 text-xs bg-card border-border"
          />
        </div>
      )}

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
              !filter ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
            }`}>
            Todos ({items.length})
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${
                filter === tag ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"
              }`}>
              <Tag className="w-2.5 h-2.5 inline mr-1" /> {tag}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? "Nenhum resultado encontrado" : "Seu caderno está vazio"}
          </p>
          <p className="text-xs text-muted-foreground/70">
            {searchQuery ? "Tente outra busca" : "Salve respostas do APEX, estudos e protocolos para consultar depois."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filteredItems.map(item => (
            <NotebookCard key={item.id} item={item} onDelete={deleteItem} onCopy={copyContent} />
          ))}
        </div>
      )}
    </div>
  );
};

export default LabNotebook;
