import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, ChevronRight, Check, X, AlertTriangle, Zap, Target, Lightbulb } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PERIODIZATION_MODELS, type PeriodizationModel } from "@/data/periodizationModels";

function ComplexityDots({ level }: { level: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={`w-1.5 h-1.5 rounded-full ${i <= level ? "bg-primary" : "bg-muted"}`} />
      ))}
    </div>
  );
}

function ModelDetail({ model, onBack }: { model: PeriodizationModel; onBack: () => void }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border flex-shrink-0">
        <Button variant="ghost" size="icon" onClick={onBack} className="h-8 w-8"><ArrowLeft className="w-4 h-4" /></Button>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{model.emoji} {model.nome}</p>
          <p className="text-[10px] text-muted-foreground">{model.publico}</p>
        </div>
      </div>
      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-3 pb-6">
          {/* Resumo */}
          <Card className="p-3 bg-primary/5 border-primary/20 space-y-2">
            <p className="text-xs text-foreground leading-relaxed">{model.resumo}</p>
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-1.5">
                <span className="text-[9px] text-muted-foreground uppercase">Complexidade:</span>
                <ComplexityDots level={model.complexidade} />
              </div>
              <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{model.publico}</Badge>
            </div>
            {model.origem && <p className="text-[10px] text-muted-foreground italic">📚 {model.origem}</p>}
          </Card>

          {/* Alerta especial (DUP atual / APRE superioridade / Westside avançado) */}
          {model.alerta && (
            <Card className="p-3 bg-yellow-500/5 border-yellow-500/30">
              <div className="flex items-start gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-yellow-300 leading-relaxed">{model.alerta}</p>
              </div>
            </Card>
          )}

          {/* Como funciona */}
          <div>
            <p className="text-[10px] font-bold text-primary uppercase mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3" /> Como Funciona
            </p>
            <ul className="space-y-1">
              {model.comoFunciona.map((item, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-primary">•</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* Estrutura */}
          <div>
            <p className="text-[10px] font-bold text-blue-400 uppercase mb-1.5 flex items-center gap-1">
              <Target className="w-3 h-3" /> Estrutura / Protocolo
            </p>
            <div className="space-y-1.5">
              {model.estrutura.map((wk, i) => (
                <div key={i} className="rounded-lg p-2.5 bg-blue-500/5 border border-blue-500/10">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-xs font-semibold text-foreground">{wk.semana}</p>
                  </div>
                  <p className="text-[11px] text-blue-300 font-mono">{wk.protocolo}</p>
                  {wk.detalhe && <p className="text-[10px] text-muted-foreground mt-0.5">{wk.detalhe}</p>}
                </div>
              ))}
            </div>
          </div>

          {/* Vantagens */}
          <div>
            <p className="text-[10px] font-bold text-green-400 uppercase mb-1.5 flex items-center gap-1">
              <Check className="w-3 h-3" /> Vantagens
            </p>
            <ul className="space-y-0.5">
              {model.vantagens.map((v, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-green-400">✓</span>{v}
                </li>
              ))}
            </ul>
          </div>

          {/* Desvantagens */}
          <div>
            <p className="text-[10px] font-bold text-red-400 uppercase mb-1.5 flex items-center gap-1">
              <X className="w-3 h-3" /> Desvantagens
            </p>
            <ul className="space-y-0.5">
              {model.desvantagens.map((d, i) => (
                <li key={i} className="text-xs text-muted-foreground flex gap-1.5">
                  <span className="text-red-400">✗</span>{d}
                </li>
              ))}
            </ul>
          </div>

          {/* Quando usar */}
          <Card className="p-3 bg-card border-border space-y-2">
            <div>
              <p className="text-[10px] font-bold text-foreground uppercase mb-1">🎯 Quando Usar</p>
              <p className="text-xs text-muted-foreground leading-relaxed">{model.quandoUsar}</p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-[10px] font-bold text-foreground uppercase mb-1">💡 Exemplo Prático</p>
              <p className="text-xs text-muted-foreground leading-relaxed font-mono">{model.exemploPratico}</p>
            </div>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
}

export default function PeriodizationSelector() {
  const [selected, setSelected] = useState<PeriodizationModel | null>(null);

  if (selected) {
    return <ModelDetail model={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header info */}
      <div className="flex-shrink-0 px-4 pt-3 pb-2 border-b border-border space-y-1">
        <p className="text-sm font-bold text-foreground">Modelos de Periodização</p>
        <p className="text-[10px] text-muted-foreground">6 modelos científicos — do iniciante ao elite. Toque para ver detalhes.</p>
      </div>

      <ScrollArea className="flex-1 px-4 py-3">
        <div className="space-y-2 pb-4">
          {PERIODIZATION_MODELS.map((model) => (
            <motion.button
              key={model.id}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelected(model)}
              className="w-full text-left p-3 rounded-xl bg-card border border-border hover:border-primary/40 transition-colors flex items-center gap-3"
            >
              <span className="text-2xl flex-shrink-0">{model.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5">
                  <p className="text-sm font-semibold text-foreground truncate">{model.nome}</p>
                  {model.alerta?.includes("usando este modelo") && (
                    <Badge className="text-[8px] bg-green-500/15 text-green-400 border-green-500/30">Atual</Badge>
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2">{model.resumo}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ComplexityDots level={model.complexidade} />
                  <span className="text-[9px] text-muted-foreground">• {model.publico}</span>
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
