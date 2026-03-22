import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Trash2, Tag, FileText, Microscope, BookOpen, Loader2 } from "lucide-react";
import { toast } from "sonner";

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
};

const LabNotebook = () => {
  const { user } = useAuth();
  const [items, setItems] = useState<SavedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string | null>(null);

  const fetchItems = async () => {
    if (!user) return;
    let q = supabase.from("lab_saved_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    if (filter) q = q.contains("tags", [filter]);
    const { data } = await q;
    setItems((data as SavedItem[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchItems(); }, [user, filter]);

  const deleteItem = async (id: string) => {
    await supabase.from("lab_saved_items").delete().eq("id", id);
    setItems(prev => prev.filter(i => i.id !== id));
    toast.success("Removido do caderno");
  };

  const allTags = [...new Set(items.flatMap(i => i.tags || []))];

  if (loading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  return (
    <div className="space-y-4">
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setFilter(null)}
            className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${!filter ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
            Todos
          </button>
          {allTags.map(tag => (
            <button key={tag} onClick={() => setFilter(tag)}
              className={`px-3 py-1 rounded-full text-[10px] font-mono border transition-colors ${filter === tag ? "bg-primary/20 border-primary/40 text-primary" : "border-border text-muted-foreground hover:border-primary/20"}`}>
              <Tag className="w-2.5 h-2.5 inline mr-1" />{tag}
            </button>
          ))}
        </div>
      )}

      {items.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <BookOpen className="w-10 h-10 text-muted-foreground/30 mx-auto" />
          <p className="text-sm text-muted-foreground">Seu caderno está vazio</p>
          <p className="text-xs text-muted-foreground/70">Salve respostas, protocolos e estudos para consultar depois.</p>
        </div>
      ) : (
        items.map(item => {
          const Icon = TIPO_ICON[item.tipo] || FileText;
          return (
            <div key={item.id} className="p-4 rounded-xl bg-card border border-border space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-primary flex-shrink-0" />
                  <h4 className="text-sm font-semibold text-foreground">{item.titulo || "Sem título"}</h4>
                </div>
                <button onClick={() => deleteItem(item.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              {item.conteudo?.answer && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.conteudo.answer}</p>
              )}
              {item.conteudo?.summary && (
                <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{item.conteudo.summary}</p>
              )}
              <div className="flex items-center gap-2">
                {(item.tags || []).map(tag => (
                  <span key={tag} className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">{tag}</span>
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
