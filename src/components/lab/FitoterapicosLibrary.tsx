import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Search, Leaf, Clock, AlertTriangle, Zap, ChevronRight, ArrowLeft, Pill } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Fitoterapico {
  id: string;
  nome: string;
  origem: string | null;
  mecanismo: string | null;
  dose: string | null;
  timing: string | null;
  ciclo: string | null;
  indicacoes: string[] | null;
  contraindicoes: string[] | null;
  interacoes: string[] | null;
  farmacocinetica: Record<string, string> | null;
}

interface FitoterapicosLibraryProps {
  onAskApex: (question: string) => void;
}

const FitoterapicosLibrary = ({ onAskApex }: FitoterapicosLibraryProps) => {
  const [items, setItems] = useState<Fitoterapico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Fitoterapico | null>(null);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("fitoterapicos_lib")
        .select("*")
        .order("nome");
      setItems((data as Fitoterapico[]) || []);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = items.filter(
    (i) =>
      i.nome.toLowerCase().includes(search.toLowerCase()) ||
      (i.indicacoes || []).some((ind) => ind.toLowerCase().includes(search.toLowerCase())) ||
      (i.mecanismo || "").toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (selected) {
    return (
      <div className="space-y-4 pb-16">
        <button onClick={() => setSelected(null)} className="flex items-center gap-1 text-xs text-primary font-mono hover:underline">
          <ArrowLeft className="w-3 h-3" /> Voltar à biblioteca
        </button>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground">{selected.nome}</h3>
          {selected.origem && <p className="text-xs text-muted-foreground font-mono">{selected.origem}</p>}
        </div>

        {/* Mecanismo */}
        {selected.mecanismo && (
          <div className="p-3 rounded-xl bg-card border border-border space-y-1">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">⚙️ Mecanismo de Ação</p>
            <p className="text-xs text-foreground leading-relaxed">{selected.mecanismo}</p>
          </div>
        )}

        {/* Dose + Timing + Ciclo */}
        <div className="grid grid-cols-1 gap-2">
          {selected.dose && (
            <div className="p-3 rounded-xl bg-card border border-border space-y-1">
              <p className="text-[10px] font-mono text-accent uppercase tracking-wider flex items-center gap-1"><Pill className="w-3 h-3" /> Dose</p>
              <p className="text-xs text-foreground">{selected.dose}</p>
            </div>
          )}
          {selected.timing && (
            <div className="p-3 rounded-xl bg-card border border-border space-y-1">
              <p className="text-[10px] font-mono text-accent uppercase tracking-wider flex items-center gap-1"><Clock className="w-3 h-3" /> Timing</p>
              <p className="text-xs text-foreground">{selected.timing}</p>
            </div>
          )}
          {selected.ciclo && (
            <div className="p-3 rounded-xl bg-card border border-border space-y-1">
              <p className="text-[10px] font-mono text-accent uppercase tracking-wider">🔄 Ciclo</p>
              <p className="text-xs text-foreground">{selected.ciclo}</p>
            </div>
          )}
        </div>

        {/* Farmacocinética */}
        {selected.farmacocinetica && Object.keys(selected.farmacocinetica).length > 0 && (
          <div className="p-3 rounded-xl bg-card border border-primary/20 space-y-2">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">📊 Farmacocinética</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(selected.farmacocinetica).map(([key, val]) => (
                <div key={key} className="space-y-0.5">
                  <p className="text-[9px] font-mono text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                  <p className="text-[11px] text-foreground">{val}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Indicações */}
        {(selected.indicacoes || []).length > 0 && (
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <p className="text-[10px] font-mono text-accent uppercase tracking-wider flex items-center gap-1"><Zap className="w-3 h-3" /> Indicações</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.indicacoes!.map((ind, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{ind}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Contraindicações */}
        {(selected.contraindicoes || []).length > 0 && (
          <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20 space-y-2">
            <p className="text-[10px] font-mono text-destructive uppercase tracking-wider flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Contraindicações</p>
            <div className="flex flex-wrap gap-1.5">
              {selected.contraindicoes!.map((c, i) => (
                <Badge key={i} variant="destructive" className="text-[10px]">{c}</Badge>
              ))}
            </div>
          </div>
        )}

        {/* Interações */}
        {(selected.interacoes || []).length > 0 && (
          <div className="p-3 rounded-xl bg-card border border-border space-y-2">
            <p className="text-[10px] font-mono text-primary uppercase tracking-wider">🔗 Interações e Sinergias</p>
            <ul className="space-y-1">
              {selected.interacoes!.map((int_, i) => (
                <li key={i} className="text-xs text-foreground">• {int_}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ask APEX */}
        <button
          onClick={() => onAskApex(`Analise o fitoterápico "${selected.nome}" para o meu perfil. Considere meus exames, objetivos e possíveis interações com meu protocolo atual.`)}
          className="w-full p-3 rounded-xl bg-primary/10 border border-primary/20 text-primary text-xs font-mono hover:bg-primary/20 transition-colors"
        >
          🤖 Perguntar ao APEX sobre {selected.nome} →
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
          <Leaf className="w-4 h-4 text-accent" /> Biblioteca de Fitoterápicos
        </h3>
        <p className="text-[10px] text-muted-foreground font-mono">{items.length} compostos • Farmacocinética completa</p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, indicação ou mecanismo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      <div className="space-y-2">
        {filtered.map((item, i) => (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            onClick={() => setSelected(item)}
            className="w-full p-3 rounded-xl bg-card border border-border hover:border-primary/30 text-left transition-all space-y-1.5"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-semibold text-foreground flex-1">{item.nome}</h4>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </div>
            {item.origem && (
              <p className="text-[10px] text-muted-foreground font-mono">{item.origem}</p>
            )}
            {(item.indicacoes || []).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {item.indicacoes!.slice(0, 3).map((ind, j) => (
                  <Badge key={j} variant="outline" className="text-[9px] h-4 px-1.5">{ind}</Badge>
                ))}
                {item.indicacoes!.length > 3 && (
                  <Badge variant="outline" className="text-[9px] h-4 px-1.5">+{item.indicacoes!.length - 3}</Badge>
                )}
              </div>
            )}
          </motion.button>
        ))}

        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhum fitoterápico encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default FitoterapicosLibrary;
