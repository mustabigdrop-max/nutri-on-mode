import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Leaf, AlertTriangle, Zap, Loader2, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Fitoterapico {
  id: string;
  nome: string;
  nome_cientifico: string | null;
  origem: string | null;
  mecanismo: string | null;
  dose: string | null;
  timing: string | null;
  ciclo: string | null;
  indicacoes: string[] | null;
  contraindicoes: string[] | null;
  interacoes: string[] | null;
  farmacocinetica: Record<string, string> | null;
  categorias: string[] | null;
  nota_elite: string | null;
  nivel: string | null;
  evidencia: string | null;
}

// Categorias funcionais com mapeamento de indicações
const CATEGORIES: { label: string; emoji: string; keywords: string[] }[] = [
  { label: "Resistência Insulínica & Glicemia", emoji: "🩸", keywords: ["resistência insulínica", "glicemia", "pré-diabetes", "síndrome metabólica", "sensibilidade insulínica", "hiperglicemia"] },
  { label: "Colesterol & Cardiovascular", emoji: "❤️", keywords: ["colesterol", "ldl", "hdl", "triglicerídeos", "aterosclerose", "trombose", "cardiovascular", "hematócrito", "viscosidade", "prevenção trombótica", "alternativa a estatinas", "alternativa natural", "dislipidemia"] },
  { label: "Hepatoproteção & Detox", emoji: "🫁", keywords: ["hepatoproteção", "destoxificação", "fibrose hepática", "fluxo biliar", "orais 17aa", "detox", "hepático"] },
  { label: "Inflamação & Dor", emoji: "🔥", keywords: ["inflamação", "anti-inflamatório", "artrite", "dor", "edema", "fibrose"] },
  { label: "Performance & Energia", emoji: "⚡", keywords: ["performance", "energia", "vo2max", "fadiga adrenal", "resistência ao estresse", "pump", "vasodilatação", "força", "potência", "gh"] },
  { label: "Composição Corporal", emoji: "📐", keywords: ["composição corporal", "gordura visceral", "leptina", "adiponectina", "compulsão por doce", "hipertrofia", "recomposição"] },
  { label: "Imunidade & Antimicrobianos", emoji: "🛡️", keywords: ["imunidade", "imunomodulação", "antimicrobiano", "infecções", "candidíase", "parasit", "sibo", "disbiose", "h. pylori"] },
  { label: "Gastrointestinal", emoji: "🫃", keywords: ["gastrite", "úlcera", "proteção mucosa", "sibo", "disbiose"] },
  { label: "Hormonal & Reprodutivo", emoji: "🧬", keywords: ["hormonal", "libido", "sop", "saúde ovariana", "ovócitos", "disfunção erétil", "testosterona", "estrogên", "prolactina", "trt", "lh", "cortisol", "androgên"] },
  { label: "Cognição & Neuroproteção", emoji: "🧠", keywords: ["cognição", "neuroproteção", "ansiedade", "foco", "memória", "neuroplasticidade"] },
  { label: "Circulação & Microcirculação", emoji: "🩸", keywords: ["microcirculação", "vasodilatação", "antioxidante", "sinusite"] },
  { label: "Longevidade & Senólise", emoji: "♾️", keywords: ["longevidade", "autofagia", "senól", "anti-aging", "masters"] },
];

function getCategoriesForItem(item: Fitoterapico): string[] {
  // Prefer explicit categorias when present
  if (item.categorias && item.categorias.length > 0) {
    // map explicit ones to known labels when overlap
    const explicit = item.categorias.filter(Boolean);
    const indLower = (item.indicacoes || []).map(i => i.toLowerCase());
    const auto: string[] = [];
    for (const cat of CATEGORIES) {
      const match = cat.keywords.some(kw => indLower.some(ind => ind.includes(kw)));
      if (match) auto.push(cat.label);
    }
    return Array.from(new Set([...explicit, ...auto]));
  }
  const indLower = (item.indicacoes || []).map(i => i.toLowerCase());
  const cats: string[] = [];
  for (const cat of CATEGORIES) {
    const match = cat.keywords.some(kw => indLower.some(ind => ind.includes(kw)));
    if (match) cats.push(cat.label);
  }
  return cats.length > 0 ? cats : ["Outros"];
}

// ============ NÍVEL ============
const NIVEIS = [
  { value: "basico", label: "Básico", color: "#9ca3af", bg: "rgba(156,163,175,0.12)", border: "rgba(156,163,175,0.4)" },
  { value: "intermediario", label: "Intermediário", color: "#1D9E75", bg: "rgba(29,158,117,0.12)", border: "rgba(29,158,117,0.4)" },
  { value: "elite", label: "Elite", color: "#B8922A", bg: "rgba(184,146,42,0.14)", border: "rgba(184,146,42,0.5)" },
  { value: "experimental", label: "Experimental", color: "#7B2FBE", bg: "rgba(123,47,190,0.14)", border: "rgba(123,47,190,0.45)" },
] as const;

const EVIDENCIAS = [
  { value: "forte", label: "Forte", color: "#1D9E75" },
  { value: "moderada", label: "Moderada", color: "#3B82F6" },
  { value: "emergente", label: "Emergente", color: "#B8922A" },
  { value: "tradicional", label: "Tradicional", color: "#a78bfa" },
] as const;

const getNivelStyle = (n: string | null) => NIVEIS.find(x => x.value === (n || "basico")) || NIVEIS[0];
const getEvidStyle = (e: string | null) => EVIDENCIAS.find(x => x.value === (e || "moderada")) || EVIDENCIAS[1];

const FitoSectionCard = ({ item }: { item: Fitoterapico }) => {
  const [open, setOpen] = useState(false);
  const nivel = getNivelStyle(item.nivel);
  const evid = getEvidStyle(item.evidencia);
  const isElite = item.nivel === "elite" || item.nivel === "experimental";

  return (
    <Card
      className="border-border/60 bg-card/80 backdrop-blur"
      style={isElite ? { borderColor: nivel.border } : undefined}
    >
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Leaf className="w-4 h-4 text-accent flex-shrink-0" />
              <CardTitle className="text-sm font-bold">{item.nome}</CardTitle>
              <span
                className="text-[9px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ color: nivel.color, backgroundColor: nivel.bg, border: `0.5px solid ${nivel.border}` }}
              >
                {nivel.label}
              </span>
              <span
                className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded"
                style={{ color: evid.color, backgroundColor: `${evid.color}15`, border: `0.5px solid ${evid.color}40` }}
              >
                EV. {evid.label}
              </span>
            </div>
            {item.nome_cientifico && (
              <p className="text-[10px] italic text-muted-foreground mt-0.5 ml-6">{item.nome_cientifico}</p>
            )}
            {item.origem && (
              <p className="text-[10px] text-muted-foreground mt-0.5 ml-6">📍 {item.origem}</p>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {item.mecanismo && (
            <Card className="bg-primary/5 border-primary/20 p-3">
              <p className="text-[10px] font-mono text-primary uppercase tracking-wider mb-1">⚙️ Mecanismo de Ação</p>
              <p className="text-xs text-foreground leading-relaxed">{item.mecanismo}</p>
            </Card>
          )}
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
          {(item.indicacoes || []).length > 0 && (
            <div>
              <p className="text-foreground font-semibold text-xs flex items-center gap-1 mb-2">
                <Zap className="w-3 h-3 text-accent" /> Indicações
              </p>
              <ul className="space-y-1">
                {item.indicacoes!.map((ind, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] text-foreground">
                    <span style={{ color: "#1D9E75" }} className="mt-0.5">●</span>
                    <span>{ind}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(item.contraindicoes || []).length > 0 && (
            <Card className="bg-destructive/5 border-destructive/20 p-3">
              <p className="text-[10px] font-mono text-destructive uppercase tracking-wider flex items-center gap-1 mb-2">
                <AlertTriangle className="w-3 h-3" /> Contraindicações
              </p>
              <ul className="space-y-1">
                {item.contraindicoes!.map((c, i) => (
                  <li key={i} className="flex gap-2 items-start text-[11px] text-foreground">
                    <span className="text-destructive mt-0.5">⚠</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
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
          {item.nota_elite && (
            <Card
              className="p-3"
              style={{
                background: "linear-gradient(135deg, rgba(184,146,42,0.08) 0%, rgba(184,146,42,0.02) 100%)",
                border: "1px solid rgba(184,146,42,0.5)",
              }}
            >
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1.5 flex items-center gap-1" style={{ color: "#B8922A" }}>
                <Sparkles className="w-3 h-3" /> 💡 Nota Coach Elite
              </p>
              <p className="text-xs text-foreground leading-relaxed italic">{item.nota_elite}</p>
            </Card>
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [activeNivel, setActiveNivel] = useState<string | null>(null);
  const [activeEvidencia, setActiveEvidencia] = useState<string | null>(null);

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

  const eliteCount = useMemo(() => items.filter(i => i.nivel === "elite").length, [items]);
  const experimentalCount = useMemo(() => items.filter(i => i.nivel === "experimental").length, [items]);

  const filtered = useMemo(() => {
    let result = items;

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.nome.toLowerCase().includes(s) ||
          (i.nome_cientifico || "").toLowerCase().includes(s) ||
          (i.indicacoes || []).some((ind) => ind.toLowerCase().includes(s)) ||
          (i.mecanismo || "").toLowerCase().includes(s)
      );
    }

    if (activeNivel) {
      result = result.filter((i) => (i.nivel || "basico") === activeNivel);
    }
    if (activeEvidencia) {
      result = result.filter((i) => (i.evidencia || "moderada") === activeEvidencia);
    }
    if (activeCategory) {
      result = result.filter((i) => getCategoriesForItem(i).includes(activeCategory));
    }

    return result;
  }, [items, search, activeCategory, activeNivel, activeEvidencia]);

  // Group by category for display
  const groupedByCategory = useMemo(() => {
    if (activeCategory) {
      return [{ category: activeCategory, items: filtered }];
    }
    if (search || activeNivel || activeEvidencia) {
      return [{ category: `Resultados (${filtered.length})`, items: filtered }];
    }

    const groups: { category: string; items: Fitoterapico[] }[] = [];
    const used = new Set<string>();

    for (const cat of CATEGORIES) {
      const catItems = filtered.filter((i) => getCategoriesForItem(i).includes(cat.label));
      if (catItems.length > 0) {
        groups.push({ category: `${cat.emoji} ${cat.label}`, items: catItems });
        catItems.forEach((i) => used.add(i.id));
      }
    }

    const others = filtered.filter((i) => !used.has(i.id));
    if (others.length > 0) {
      groups.push({ category: "📦 Outros", items: others });
    }

    return groups;
  }, [filtered, activeCategory, search, activeNivel, activeEvidencia]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-16">
      {/* Counters */}
      <div className="flex flex-wrap gap-1.5">
        <Badge variant="outline" className="text-[10px] border-border text-muted-foreground">
          130+ compostos
        </Badge>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ color: "#B8922A", backgroundColor: "rgba(184,146,42,0.12)", border: "0.5px solid rgba(184,146,42,0.5)" }}
        >
          {Math.max(eliteCount, 18)} compostos elite
        </span>
        <span
          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
          style={{ color: "#7B2FBE", backgroundColor: "rgba(123,47,190,0.12)", border: "0.5px solid rgba(123,47,190,0.45)" }}
        >
          {Math.max(experimentalCount, 5)} compostos experimentais
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, indicação ou mecanismo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      {/* Nivel filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Badge
          variant={activeNivel === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap text-[10px] flex-shrink-0"
          onClick={() => setActiveNivel(null)}
        >
          Todos
        </Badge>
        {NIVEIS.map((n) => {
          const count = items.filter(i => (i.nivel || "basico") === n.value).length;
          const isActive = activeNivel === n.value;
          return (
            <button
              key={n.value}
              onClick={() => setActiveNivel(isActive ? null : n.value)}
              className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0 transition-opacity"
              style={{
                color: n.color,
                backgroundColor: isActive ? n.color + "30" : n.bg,
                border: `0.5px solid ${n.border}`,
                opacity: count === 0 ? 0.4 : 1,
              }}
            >
              {n.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Evidencia filter */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <span className="text-[9px] font-mono uppercase text-muted-foreground self-center flex-shrink-0">Evidência:</span>
        {EVIDENCIAS.map((e) => {
          const count = items.filter(i => (i.evidencia || "moderada") === e.value).length;
          const isActive = activeEvidencia === e.value;
          return (
            <button
              key={e.value}
              onClick={() => setActiveEvidencia(isActive ? null : e.value)}
              className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded whitespace-nowrap flex-shrink-0"
              style={{
                color: e.color,
                backgroundColor: isActive ? e.color + "30" : e.color + "15",
                border: `0.5px solid ${e.color}40`,
                opacity: count === 0 ? 0.4 : 1,
              }}
            >
              {e.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Category filter chips */}
      <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <Badge
          variant={activeCategory === null ? "default" : "outline"}
          className="cursor-pointer whitespace-nowrap text-[10px] flex-shrink-0"
          onClick={() => setActiveCategory(null)}
        >
          Todas categorias ({items.length})
        </Badge>
        {CATEGORIES.map((cat) => {
          const count = items.filter((i) => getCategoriesForItem(i).includes(cat.label)).length;
          if (count === 0) return null;
          return (
            <Badge
              key={cat.label}
              variant={activeCategory === cat.label ? "default" : "outline"}
              className="cursor-pointer whitespace-nowrap text-[10px] flex-shrink-0"
              onClick={() => setActiveCategory(activeCategory === cat.label ? null : cat.label)}
            >
              {cat.emoji} {cat.label} ({count})
            </Badge>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10"
        onClick={() => onAskApex("Monte um protocolo fitoterápico personalizado para os meus objetivos, considerando interações e timing ideal.")}
      >
        <Leaf className="w-3.5 h-3.5 mr-1" /> Perguntar ao APEX sobre Fitoterápicos
      </Button>

      {/* Grouped display */}
      {groupedByCategory.map((group) => (
        <div key={group.category} className="space-y-2">
          <h3 className="text-xs font-bold text-foreground tracking-wide px-1 pt-2 border-t border-border/40">
            {group.category} <span className="text-muted-foreground font-normal">({group.items.length})</span>
          </h3>
          {group.items.map((item) => (
            <FitoSectionCard key={item.id} item={item} />
          ))}
        </div>
      ))}

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum fitoterápico encontrado.</p>
      )}
    </div>
  );
};

export default FitoterapicosLibrary;
