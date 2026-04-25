import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, ChevronRight, Check, AlertTriangle, Zap, Target } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { INTENSITY_TECHNIQUES, TECHNIQUE_CATEGORIES, type IntensityTechnique } from "@/data/intensityTechniques";

const CATEGORY_COLORS: Record<string, string> = {
  red: "bg-red-500/10 border-red-500/30 text-red-400",
  blue: "bg-blue-500/10 border-blue-500/30 text-blue-400",
  green: "bg-green-500/10 border-green-500/30 text-green-400",
  yellow: "bg-yellow-500/10 border-yellow-500/30 text-yellow-400",
  purple: "bg-purple-500/10 border-purple-500/30 text-purple-400",
};

function IntensityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= level ? "bg-orange-400" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function getCategoryColor(categoria: string): string {
  const cat = TECHNIQUE_CATEGORIES.find(c => c.id === categoria);
  return cat ? CATEGORY_COLORS[cat.color] : "bg-muted text-muted-foreground";
}

function TechniqueDetail({ tech, onBack }: { tech: IntensityTechnique; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{tech.emoji} {tech.nome}</p>
          <p className="text-[10px] text-muted-foreground">{tech.categoria}</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3 pb-6">
          {/* Resumo */}
          <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
            <p className="text-xs text-foreground leading-relaxed">{tech.resumo}</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground uppercase">Intensidade SNC:</span>
                <IntensityDots level={tech.intensidade} />
              </div>
              <Badge variant="outline" className={`text-[9px] ${getCategoryColor(tech.categoria)}`}>
                {tech.categoria}
              </Badge>
            </div>
          </Card>

          {/* Alerta */}
          {tech.alerta && (
            <Card className="p-3 bg-yellow-500/5 border-yellow-500/30">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300 leading-relaxed">{tech.alerta}</p>
              </div>
            </Card>
          )}

          {/* Como Fazer */}
          <div>
            <p className="text-[10px] font-bold text-primary uppercase mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Como Executar
            </p>
            <ul className="space-y-1">
              {tech.comoFazer.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary font-bold">{i + 1}.</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Exemplos práticos */}
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> Exemplos Práticos
            </p>
            <div className="space-y-1.5">
              {tech.exemplos.map((ex, i) => (
                <div key={i} className="rounded-lg p-2.5 bg-blue-500/5 border border-blue-500/10">
                  <p className="text-xs font-semibold text-foreground mb-0.5">{ex.exercicio}</p>
                  <p className="text-[10px] text-blue-300 font-mono leading-relaxed">{ex.protocolo}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Benefícios */}
          <div>
            <p className="text-[10px] font-bold text-green-400 uppercase mb-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Benefícios
            </p>
            <ul className="space-y-0.5">
              {tech.beneficios.map((b, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-green-400">✓</span>{b}
                </li>
              ))}
            </ul>
          </div>

          {/* Limites */}
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase mb-1.5 flex items-center gap-1">
              <AlertTriangle className="w-3 h-3" /> Limites de Uso
            </p>
            <ul className="space-y-0.5">
              {tech.limites.map((l, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-red-400">!</span>{l}
                </li>
              ))}
            </ul>
          </div>

          {/* Ideal para */}
          <Card className="p-3 bg-card border-border">
            <p className="text-[10px] font-bold text-foreground uppercase mb-1">🎯 Ideal Para</p>
            <p className="text-xs text-muted-foreground leading-relaxed">{tech.idealPara}</p>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function IntensityTechniquesSelector() {
  const [selected, setSelected] = useState<IntensityTechnique | null>(null);
  const [filter, setFilter] = useState<string>("Todas");

  if (selected) {
    return <TechniqueDetail tech={selected} onBack={() => setSelected(null)} />;
  }

  const categories = ["Todas", ...TECHNIQUE_CATEGORIES.map(c => c.id)];
  const filtered = filter === "Todas"
    ? INTENSITY_TECHNIQUES
    : INTENSITY_TECHNIQUES.filter(t => t.categoria === filter);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-border space-y-2">
        <div>
          <p className="text-sm font-bold text-foreground">Técnicas de Intensidade</p>
          <p className="text-[10px] text-muted-foreground">11 técnicas aplicáveis a qualquer programa para destravar platôs.</p>
        </div>
        {/* Category filter */}
        <ScrollArea className="w-full">
          <div className="flex gap-1.5 pb-1">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold whitespace-nowrap border transition-colors ${
                  filter === cat
                    ? "bg-primary/15 border-primary/40 text-primary"
                    : "bg-card border-border text-muted-foreground"
                }`}
              >
                {cat === "Todas" ? "🌟 Todas" : `${TECHNIQUE_CATEGORIES.find(c => c.id === cat)?.emoji} ${cat}`}
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-2 pb-4">
          {filtered.map((tech) => (
            <motion.button
              key={tech.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(tech)}
              className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl flex-shrink-0">{tech.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">{tech.nome}</p>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{tech.resumo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <IntensityDots level={tech.intensidade} />
                  <Badge variant="outline" className={`text-[8px] ${getCategoryColor(tech.categoria)}`}>
                    {tech.categoria}
                  </Badge>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
