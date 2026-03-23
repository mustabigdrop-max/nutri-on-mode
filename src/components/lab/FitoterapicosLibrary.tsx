import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Leaf, Clock, AlertTriangle, Zap, Pill, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

const FitoSectionCard = ({ item }: { item: Fitoterapico }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-accent" />
            <CardTitle className="text-sm font-bold">{item.nome}</CardTitle>
            {item.origem && (
              <Badge variant="outline" className="text-muted-foreground border-border text-[9px]">
                {item.origem}
              </Badge>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {/* Mecanismo */}
          {item.mecanismo && (
            <Card className="bg-primary/5 border-primary/20 p-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">⚙️ Mecanismo de Ação</p>
              <p className="text-xs text-foreground leading-relaxed">{item.mecanismo}</p>
            </Card>
          )}

          {/* Dose + Timing + Ciclo table */}
          {(item.dose || item.timing || item.ciclo) && (
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-border/40 rounded">
                <thead>
                  <tr className="bg-muted/30">
                    {item.dose && <th className="text-left p-2 font-semibold text-foreground">Dose</th>}
                    {item.timing && <th className="text-left p-2 font-semibold text-foreground">Timing</th>}
                    {item.ciclo && <th className="text-left p-2 font-semibold text-foreground">Ciclo</th>}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-t border-border/20">
                    {item.dose && <td className="p-2 text-foreground">{item.dose}</td>}
                    {item.timing && <td className="p-2 text-foreground">{item.timing}</td>}
                    {item.ciclo && <td className="p-2 text-foreground">{item.ciclo}</td>}
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Farmacocinética */}
          {item.farmacocinetica && Object.keys(item.farmacocinetica).length > 0 && (
            <Card className="bg-primary/5 border-primary/20 p-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-2">📊 Farmacocinética</p>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(item.farmacocinetica).map(([key, val]) => (
                  <div key={key} className="space-y-0.5">
                    <p className="text-[9px] font-mono text-muted-foreground capitalize">{key.replace(/_/g, " ")}</p>
                    <p className="text-[11px] text-foreground">{val}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Indicações */}
          {(item.indicacoes || []).length > 0 && (
            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-1 mb-2">
                <Zap className="w-3 h-3 text-accent" /> Indicações
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.indicacoes!.map((ind, i) => (
                  <Badge key={i} variant="secondary" className="text-[10px]">{ind}</Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contraindicações */}
          {(item.contraindicoes || []).length > 0 && (
            <Card className="bg-destructive/5 border-destructive/20 p-3">
              <p className="text-[10px] font-mono text-destructive uppercase tracking-wider flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3" /> Contraindicações
              </p>
              <div className="flex flex-wrap gap-1.5">
                {item.contraindicoes!.map((c, i) => (
                  <Badge key={i} variant="destructive" className="text-[10px]">{c}</Badge>
                ))}
              </div>
            </Card>
          )}

          {/* Interações */}
          {(item.interacoes || []).length > 0 && (
            <div>
              <p className="text-foreground font-semibold text-xs mb-2">🔗 Interações e Sinergias</p>
              <ul className="space-y-1">
                {item.interacoes!.map((int_, i) => (
                  <li key={i} className="flex gap-2 items-start">
                    <span className="text-primary mt-0.5">▸</span>
                    <span className="text-xs text-foreground">{int_}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

interface FitoterapicosLibraryProps {
  onAskApex: (question: string) => void;
}

const FitoterapicosLibrary = ({ onAskApex }: FitoterapicosLibraryProps) => {
  const [items, setItems] = useState<Fitoterapico[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

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
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, indicação ou mecanismo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10"
        onClick={() => onAskApex("Monte um protocolo fitoterápico personalizado para os meus objetivos, considerando interações e timing ideal.")}
      >
        <Leaf className="w-3.5 h-3.5 mr-1" /> Perguntar ao APEX sobre Fitoterápicos
      </Button>

      <div className="space-y-2">
        {filtered.map((item) => (
          <FitoSectionCard key={item.id} item={item} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum fitoterápico encontrado.</p>
      )}
    </div>
  );
};

export default FitoterapicosLibrary;
