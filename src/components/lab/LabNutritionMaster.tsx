import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Apple, Flame, Timer, Droplets,
  Zap, TrendingUp, Target, Beef, Wheat, Clock, Pill, FlaskConical,
  Salad, Scale, AlertTriangle, Utensils,
} from "lucide-react";

interface NutritionSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: NutritionSection }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle className="text-sm font-bold">{section.title}</CardTitle>
            {section.badge && (
              <Badge variant="outline" className={section.badgeColor || "text-primary border-primary/30"}>
                {section.badge}
              </Badge>
            )}
          </div>
          {open ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
        </div>
      </CardHeader>
      {open && (
        <CardContent className="pt-0 px-4 pb-4 text-xs text-muted-foreground leading-relaxed space-y-3">
          {section.content}
        </CardContent>
      )}
    </Card>
  );
};

const NutrientTable = ({ rows }: { rows: { item: string; timing: string; dose: string; notes?: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/50">
          <th className="text-left p-2 font-bold text-foreground">Item</th>
          <th className="text-left p-2 font-bold text-foreground">Timing</th>
          <th className="text-left p-2 font-bold text-foreground">Dose</th>
          {rows.some(r => r.notes) && <th className="text-left p-2 font-bold text-foreground">Notas</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/30">
            <td className="p-2 font-medium text-foreground">{r.item}</td>
            <td className="p-2">{r.timing}</td>
            <td className="p-2">{r.dose}</td>
            {rows.some(rr => rr.notes) && <td className="p-2 italic">{r.notes}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const MacroTable = ({ rows }: { rows: { phase: string; kcal: string; protein: string; carbs: string; fat: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/50">
          <th className="text-left p-2 font-bold text-foreground">Fase</th>
          <th className="text-left p-2 font-bold text-foreground">Kcal</th>
          <th className="text-left p-2 font-bold text-foreground">Proteína</th>
          <th className="text-left p-2 font-bold text-foreground">Carb</th>
          <th className="text-left p-2 font-bold text-foreground">Gordura</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/30">
            <td className="p-2 font-medium text-foreground">{r.phase}</td>
            <td className="p-2">{r.kcal}</td>
            <td className="p-2">{r.protein}</td>
            <td className="p-2">{r.carbs}</td>
            <td className="p-2">{r.fat}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const QUICK_ACTIONS = [
  { label: "Protocolo peri-treino completo — pré, intra e pós", icon: <Timer className="w-3 h-3" /> },
  { label: "Plano nutricional para cutting com preservação muscular", icon: <Scale className="w-3 h-3" /> },
  { label: "Protocolo de bulking limpo — surplus calórico controlado", icon: <TrendingUp className="w-3 h-3" /> },
  { label: "Timing de carboidratos para treino de pernas pesado", icon: <Wheat className="w-3 h-3" /> },
  { label: "Janela anabólica — o que comer pós-treino imediato", icon: <Zap className="w-3 h-3" /> },
  { label: "Protocolo de hidratação para performance e recuperação", icon: <Droplets className="w-3 h-3" /> },
  { label: "Distribuição proteica ótima ao longo do dia", icon: <Beef className="w-3 h-3" /> },
  { label: "Suplementação peri-treino — EAA, creatina, dextrose", icon: <Pill className="w-3 h-3" /> },
  { label: "Refeed e diet break — quando e como implementar", icon: <Utensils className="w-3 h-3" /> },
  { label: "Nutrição para dia de descanso vs dia de treino", icon: <Clock className="w-3 h-3" /> },
];

const SECTIONS: NutritionSection[] = [
  {
    id: "peri-treino",
    title: "Nutrição Peri-Treino — Timing Crítico",
    icon: <Timer className="w-4 h-4 text-primary" />,
    badge: "ESSENCIAL",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">PRÉ-TREINO (2-3h antes) — Refeição Completa</p>
          <p>Proteína + carboidrato complexo + gordura mínima. Quantidade: 600-800kcal para treino intenso.</p>
          <p className="mt-1">Objetivo: estoques de glicogênio cheios, aminoácidos circulantes, insulina estável.</p>
        </div>
        <NutrientTable rows={[
          { item: "Arroz/Batata doce", timing: "2-3h antes", dose: "60-100g carb", notes: "IG moderado" },
          { item: "Frango/Peixe", timing: "2-3h antes", dose: "30-40g proteína", notes: "Magra" },
          { item: "Gordura", timing: "2-3h antes", dose: "5-10g", notes: "Mínima (atrasa digestão)" },
        ]} />
        <div>
          <p className="font-bold text-foreground mb-1">PRÉ-TREINO IMEDIATO (30-60min antes)</p>
          <p>Se fez refeição 2-3h antes: apenas pré-workout (cafeína). Se não comeu: whey 30g + banana + água.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">INTRA-TREINO (durante)</p>
          <p>Apenas se treino &gt; 60min ou em cutting severo.</p>
          <NutrientTable rows={[
            { item: "EAA/BCAA", timing: "Durante treino", dose: "10-15g", notes: "Anti-catabólico" },
            { item: "Dextrose/Maltodextrina", timing: "Durante treino", dose: "20-40g", notes: "Manter glicemia" },
            { item: "Água + eletrólitos", timing: "A cada 15-20min", dose: "200-300ml", notes: "Hidratação" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">PÓS-TREINO IMEDIATO (0-30min)</p>
          <NutrientTable rows={[
            { item: "Whey Protein", timing: "Imediato", dose: "40g", notes: "Absorção rápida" },
            { item: "Dextrose", timing: "Imediato", dose: "60-80g", notes: "Repor glicogênio + spike insulina" },
            { item: "Creatina", timing: "Imediato", dose: "5g", notes: "Absorção otimizada com insulina" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">PÓS-TREINO SÓLIDO (1-2h depois)</p>
          <p>Refeição completa: proteína + carboidrato + vegetal. <strong>Maior refeição do dia no dia de pernas.</strong></p>
        </div>
      </div>
    ),
  },
  {
    id: "proteina",
    title: "Proteína — Distribuição e Timing Ótimo",
    icon: <Beef className="w-4 h-4 text-primary" />,
    badge: "FUNDAMENTAL",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">DOSE DIÁRIA TOTAL</p>
          <NutrientTable rows={[
            { item: "Manutenção", timing: "Diário", dose: "1.6-2.0g/kg", notes: "Mínimo para preservar massa" },
            { item: "Hipertrofia", timing: "Diário", dose: "2.0-2.4g/kg", notes: "Ótimo para crescimento" },
            { item: "Cutting", timing: "Diário", dose: "2.4-3.0g/kg", notes: "Proteger massa em déficit" },
            { item: "Natural avançado", timing: "Diário", dose: "2.2-2.6g/kg", notes: "Referência Schoenfeld" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">DISTRIBUIÇÃO ÓTIMA (Síntese Proteica)</p>
          <p>Meta-análise: 4-5 doses de 0.4-0.55g/kg por refeição = máxima MPS (Muscle Protein Synthesis).</p>
          <p className="mt-1">Exemplo (80kg, 2.2g/kg = 176g/dia):</p>
          <NutrientTable rows={[
            { item: "Café da manhã", timing: "07:00", dose: "35-40g", notes: "Ovos + whey ou iogurte" },
            { item: "Almoço", timing: "12:00", dose: "40-45g", notes: "Frango/peixe/carne" },
            { item: "Pré-treino", timing: "15:00", dose: "35-40g", notes: "Proteína magra + carb" },
            { item: "Pós-treino", timing: "17:30", dose: "40g", notes: "Whey isolado" },
            { item: "Jantar", timing: "20:00", dose: "35-40g", notes: "Proteína + vegetal" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">PROTEÍNA ANTES DE DORMIR</p>
          <p>Caseína ou cottage cheese (30-40g) antes de dormir: sustenta MPS durante o sono (Trommelen et al., 2017). Leucina ≥3g por dose para trigger de mTOR.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">FONTES E LEUCINA</p>
          <NutrientTable rows={[
            { item: "Whey Isolado", timing: "Pós-treino", dose: "30g = 3.2g leucina", notes: "Absorção mais rápida" },
            { item: "Peito de Frango", timing: "Refeição sólida", dose: "150g = 3.0g leucina" },
            { item: "Ovos (3 inteiros)", timing: "Qualquer", dose: "18g = 1.5g leucina", notes: "Adicionar claras" },
            { item: "Caseína", timing: "Noturno", dose: "40g = 3.5g leucina", notes: "Absorção lenta (7h)" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "carboidratos",
    title: "Carboidratos — Estratégias e Periodização",
    icon: <Wheat className="w-4 h-4 text-primary" />,
    badge: "ESTRATÉGICO",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">TIMING DE CARBOIDRATOS</p>
          <p>Concentrar carboidratos ao redor do treino maximiza performance e recuperação:</p>
          <NutrientTable rows={[
            { item: "Pré-treino (2-3h)", timing: "Complexos", dose: "1-2g/kg", notes: "Arroz, aveia, batata" },
            { item: "Intra-treino", timing: "Simples", dose: "20-40g", notes: "Dextrose, maltodextrina" },
            { item: "Pós-treino (imediato)", timing: "Simples/rápidos", dose: "0.8-1.2g/kg", notes: "Repor glicogênio" },
            { item: "Pós-treino (1-2h)", timing: "Complexos", dose: "1-1.5g/kg", notes: "Resíntese completa" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">CARB CYCLING</p>
          <MacroTable rows={[
            { phase: "Dia de treino pesado", kcal: "+200-300", protein: "2.2g/kg", carbs: "4-6g/kg", fat: "0.8g/kg" },
            { phase: "Dia de treino leve", kcal: "Manutenção", protein: "2.2g/kg", carbs: "3-4g/kg", fat: "1.0g/kg" },
            { phase: "Dia de descanso", kcal: "-200-300", protein: "2.4g/kg", carbs: "1.5-2.5g/kg", fat: "1.2g/kg" },
          ]} />
          <p className="mt-2">Princípio: carboidrato serve ao treino. Mais treino = mais carb. Menos treino = menos carb, mais gordura.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">ÍNDICE GLICÊMICO ESTRATÉGICO</p>
          <p><strong>IG Alto (pós-treino):</strong> Dextrose, arroz branco, batata, pão branco — spike de insulina para captação de glicose e aminoácidos.</p>
          <p><strong>IG Moderado (pré-treino):</strong> Arroz integral, aveia, batata doce — energia sustentada.</p>
          <p><strong>IG Baixo (longe do treino):</strong> Legumes, vegetais, grãos integrais — estabilidade glicêmica.</p>
        </div>
      </div>
    ),
  },
  {
    id: "gorduras",
    title: "Gorduras — Papel Hormonal e Seleção",
    icon: <Flame className="w-4 h-4 text-primary" />,
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">DOSE MÍNIMA PARA SAÚDE HORMONAL</p>
          <p>Nunca abaixo de 0.7-0.8g/kg (ou 20-25% das kcal). Gordura abaixo disso: testosterona cai, cortisol sobe, inflamação aumenta.</p>
        </div>
        <NutrientTable rows={[
          { item: "Bulking", timing: "Diário", dose: "1.0-1.5g/kg", notes: "25-30% das kcal" },
          { item: "Manutenção", timing: "Diário", dose: "0.8-1.2g/kg", notes: "25-30% das kcal" },
          { item: "Cutting", timing: "Diário", dose: "0.7-1.0g/kg", notes: "20-25% das kcal (mínimo)" },
        ]} />
        <div>
          <p className="font-bold text-foreground mb-1">FONTES PRIORITÁRIAS</p>
          <p><strong>Monoinsaturadas:</strong> Azeite, abacate, castanhas — anti-inflamatório, saúde cardiovascular.</p>
          <p><strong>Poliinsaturadas (ômega-3):</strong> Salmão, sardinha, linhaça — recuperação muscular, reduz DOMS.</p>
          <p><strong>Saturadas (moderado):</strong> Ovos inteiros, carne vermelha, manteiga — precursor hormonal. Não eliminar.</p>
          <p><strong>Evitar:</strong> Trans (processados), óleos vegetais refinados em excesso.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">TIMING DE GORDURAS</p>
          <p>❌ Não consumir gordura no pré-treino imediato (atrasa esvaziamento gástrico).</p>
          <p>❌ Não consumir gordura no pós-treino imediato (atrasa absorção de proteína/carb).</p>
          <p>✅ Longe do treino: café da manhã, lanches, jantar — ideal para saciedade e hormônios.</p>
        </div>
      </div>
    ),
  },
  {
    id: "cutting-bulking",
    title: "Cutting vs Bulking — Protocolos Completos",
    icon: <Scale className="w-4 h-4 text-primary" />,
    badge: "PRO",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">CUTTING — DÉFICIT CALÓRICO CONTROLADO</p>
          <MacroTable rows={[
            { phase: "Cutting moderado", kcal: "-300 a -500", protein: "2.4-3.0g/kg", carbs: "2-3g/kg", fat: "0.7-1.0g/kg" },
            { phase: "Cutting agressivo", kcal: "-500 a -750", protein: "2.6-3.0g/kg", carbs: "1.5-2.5g/kg", fat: "0.7-0.8g/kg" },
            { phase: "Mini-cut (2-4 sem)", kcal: "-750 a -1000", protein: "3.0g/kg", carbs: "1.0-2.0g/kg", fat: "0.7g/kg" },
          ]} />
          <p className="mt-2">Regras: perder max 0.5-1% do peso/semana. Mais rápido = perda muscular. Proteína alta é inegociável. Refeed a cada 7-14 dias.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">BULKING — SURPLUS CONTROLADO</p>
          <MacroTable rows={[
            { phase: "Lean bulk", kcal: "+200 a +350", protein: "2.0-2.4g/kg", carbs: "4-6g/kg", fat: "1.0-1.2g/kg" },
            { phase: "Bulk moderado", kcal: "+350 a +500", protein: "2.0g/kg", carbs: "5-7g/kg", fat: "1.0-1.5g/kg" },
            { phase: "Bulk agressivo", kcal: "+500 a +750", protein: "2.0g/kg", carbs: "6-8g/kg", fat: "1.2-1.5g/kg" },
          ]} />
          <p className="mt-2">Meta: ganhar 0.25-0.5% do peso/semana (naturais). Mais rápido = gordura desnecessária. Priorizar carb, não gordura no surplus.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">REFEED E DIET BREAK</p>
          <p><strong>Refeed (1-2 dias):</strong> Elevar carb para manutenção ou leve surplus. Proteína e gordura mantidas. Restaura leptina, T3 e performance no treino.</p>
          <p><strong>Diet Break (1-2 semanas):</strong> Calorias de manutenção por 1-2 semanas a cada 6-12 semanas de cutting. Reseta adaptações metabólicas. Superior para aderência (MATADOR study).</p>
        </div>
      </div>
    ),
  },
  {
    id: "hidratacao",
    title: "Hidratação — Performance e Recuperação",
    icon: <Droplets className="w-4 h-4 text-primary" />,
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">PROTOCOLO DE HIDRATAÇÃO DIÁRIA</p>
          <NutrientTable rows={[
            { item: "Base diária", timing: "Ao longo do dia", dose: "35-40ml/kg", notes: "80kg = 2.8-3.2L" },
            { item: "Pré-treino", timing: "2h antes", dose: "500ml", notes: "Iniciar hidratado" },
            { item: "Intra-treino", timing: "A cada 15-20min", dose: "200-300ml", notes: "Não esperar sede" },
            { item: "Pós-treino", timing: "Imediato", dose: "500ml", notes: "Repor perdas" },
            { item: "Fator calor", timing: "Dias quentes", dose: "+500-1000ml", notes: "Compensar suor" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">ELETRÓLITOS</p>
          <p>Desidratação de 2% = queda de 10-20% na performance. Eletrólitos essenciais: sódio, potássio, magnésio.</p>
          <p className="mt-1">Para treinos &gt;60min ou clima quente: adicionar eletrólitos na água intra-treino (0.5-1g sódio/L).</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">SINAIS DE DESIDRATAÇÃO</p>
          <p>Urina escura (amarelo forte), sede constante, câimbras, fadiga precoce no treino, dor de cabeça. Monitorar cor da urina: amarelo claro = bem hidratado.</p>
        </div>
      </div>
    ),
  },
  {
    id: "suplementacao-treino",
    title: "Suplementação Peri-Treino — Evidência",
    icon: <Pill className="w-4 h-4 text-primary" />,
    badge: "CIÊNCIA",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">SUPLEMENTOS COM EVIDÊNCIA FORTE (Nível A)</p>
          <NutrientTable rows={[
            { item: "Creatina Monoidratada", timing: "Pós-treino ou qualquer", dose: "5g/dia", notes: "Sem necessidade de loading" },
            { item: "Whey Protein", timing: "Pós-treino", dose: "30-40g", notes: "Completar meta proteica" },
            { item: "Cafeína", timing: "30-60min pré", dose: "3-6mg/kg", notes: "Performance + foco" },
            { item: "Beta-alanina", timing: "Diário (dividido)", dose: "3.2-6.4g/dia", notes: "Buffer de H+ (parestesia normal)" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">SUPLEMENTOS COM EVIDÊNCIA MODERADA (Nível B)</p>
          <NutrientTable rows={[
            { item: "Citrulina Malato", timing: "Pré-treino", dose: "6-8g", notes: "Pump e performance" },
            { item: "EAA (aminoácidos essenciais)", timing: "Intra-treino", dose: "10-15g", notes: "Anti-catabolismo" },
            { item: "HMB", timing: "Diário", dose: "3g", notes: "Em cutting severo (preserva massa)" },
            { item: "Ômega-3 (EPA/DHA)", timing: "Com refeição", dose: "2-3g EPA+DHA", notes: "Anti-inflamatório" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">TIMING IDEAL PÓS-TREINO</p>
          <p>Whey (40g) + Dextrose (60-80g) + Creatina (5g) — imediato. A combinação proteína + carb rápido eleva insulina, otimizando captação de aminoácidos e resíntese de glicogênio.</p>
        </div>
      </div>
    ),
  },
  {
    id: "dia-treino-vs-descanso",
    title: "Dia de Treino vs Dia de Descanso",
    icon: <Clock className="w-4 h-4 text-primary" />,
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">DIA DE TREINO — PRIORIZAR CARBOIDRATO</p>
          <MacroTable rows={[
            { phase: "Treino pesado (pernas, costas)", kcal: "Manutenção + 200-300", protein: "2.2g/kg", carbs: "5-6g/kg", fat: "0.8g/kg" },
            { phase: "Treino moderado (braços, ombros)", kcal: "Manutenção", protein: "2.2g/kg", carbs: "4-5g/kg", fat: "1.0g/kg" },
          ]} />
          <p className="mt-1">Concentrar 60-70% dos carbs ao redor do treino (pré + pós).</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">DIA DE DESCANSO — PRIORIZAR GORDURA E PROTEÍNA</p>
          <MacroTable rows={[
            { phase: "Descanso (bulk)", kcal: "Manutenção", protein: "2.2g/kg", carbs: "2-3g/kg", fat: "1.2-1.5g/kg" },
            { phase: "Descanso (cutting)", kcal: "Manutenção - 400", protein: "2.6g/kg", carbs: "1.5-2g/kg", fat: "1.0g/kg" },
          ]} />
          <p className="mt-1">Sem treino = menos necessidade de carb. Gordura sobe para saciedade e suporte hormonal. Proteína mantida ou aumentada.</p>
        </div>
      </div>
    ),
  },
  {
    id: "dia-pernas",
    title: "Nutrição Específica — Dia de Pernas",
    icon: <Zap className="w-4 h-4 text-destructive" />,
    badge: "CRÍTICO",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="font-bold text-foreground mb-1">POR QUE PERNAS EXIGE MAIS NUTRIÇÃO</p>
          <p>Maior grupo muscular = maior demanda energética. Glicogênio depleta mais rápido. DOMS mais intenso. Cortisol mais elevado. Necessidade de recuperação amplificada.</p>
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">PROTOCOLO NUTRICIONAL — DIA DE PERNAS</p>
          <NutrientTable rows={[
            { item: "Refeição pré-treino", timing: "2-3h antes", dose: "800kcal", notes: "Carb alto (100g+), proteína 40g" },
            { item: "Pré-treino imediato", timing: "30min antes", dose: "Banana + whey 20g", notes: "Energia imediata" },
            { item: "Intra-treino", timing: "Durante", dose: "EAA 15g + dextrose 30g", notes: "Anti-catabólico" },
            { item: "Pós-treino shake", timing: "0-15min após", dose: "Whey 40g + dextrose 80g + creatina 5g", notes: "Janela anabólica máxima" },
            { item: "Pós-treino refeição", timing: "1-2h após", dose: "Maior refeição do dia", notes: "Carb alto + proteína 40-50g" },
            { item: "Antes de dormir", timing: "Noite", dose: "Caseína 40g + ZMA", notes: "Recuperação noturna" },
          ]} />
        </div>
        <div>
          <p className="font-bold text-foreground mb-1">PROTOCOLO DOMS PREVENTIVO — PÓS-PERNAS</p>
          <p>1. <strong>Caminhada:</strong> 15min recuperação ativa (flush de lactato)</p>
          <p>2. <strong>Foam roll:</strong> quadríceps, isquiotibiais, panturrilha — 2-3 passagens lentas, 10-15s em pontos tensos</p>
          <p>3. <strong>Estático:</strong> quadríceps 60s, isquiotibiais 60s, panturrilha 60s, glúteo (pigeon) 60s cada</p>
          <p>4. <strong>Contraste térmico:</strong> 3min quente → 30s frio × 3 rounds</p>
          <p>5. <strong>Nutrição:</strong> proteína + carb IMEDIATO pós-pernas (janela anabólica mais importante)</p>
          <p>6. <strong>Hidratação:</strong> 500ml água imediato pós-treino</p>
        </div>
      </div>
    ),
  },
  {
    id: "erros-comuns",
    title: "Erros Nutricionais Mais Comuns",
    icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
    content: (
      <div className="space-y-3">
        <p><strong className="text-foreground">1. Proteína insuficiente:</strong> Menor erro mais impactante. Sem proteína suficiente, treinar pesado não resulta em crescimento.</p>
        <p><strong className="text-foreground">2. Cortar gordura demais:</strong> Abaixo de 0.7g/kg = crash hormonal. Testosterona despenca, humor e sono afetados.</p>
        <p><strong className="text-foreground">3. Ignorar timing peri-treino:</strong> Treinar em jejum ou sem carb pré-treino = performance 15-30% menor.</p>
        <p><strong className="text-foreground">4. Déficit muito agressivo:</strong> Perder mais de 1% do peso/semana = perda de massa muscular significativa.</p>
        <p><strong className="text-foreground">5. Sem refeed no cutting:</strong> Cutting linear sem refeed/diet break = adaptação metabólica acelerada e platô.</p>
        <p><strong className="text-foreground">6. Bulk sujo:</strong> Surplus de +1000kcal não acelera ganho muscular — apenas acumula gordura. Natural ganha max 250g músculo/semana.</p>
        <p><strong className="text-foreground">7. Desidratação crônica:</strong> 2% de desidratação = 10-20% queda de performance. Maioria dos atletas bebe menos que o necessário.</p>
        <p><strong className="text-foreground">8. Fibra insuficiente:</strong> 25-35g/dia mínimo para saúde intestinal e absorção de nutrientes. Microbiota saudável = melhor síntese proteica.</p>
      </div>
    ),
  },
];

interface Props {
  onAskApex?: (q: string) => void;
}

const LabNutritionMaster = ({ onAskApex }: Props) => {
  const [search, setSearch] = useState("");

  const filtered = SECTIONS.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar protocolo nutricional..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      {/* Quick Actions */}
      {onAskApex && !search && (
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">⚡ Ações Rápidas — Pergunte ao APEX</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((a, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="text-[10px] h-7 gap-1 border-primary/20 text-primary hover:bg-primary/10"
                onClick={() => onAskApex(a.label)}
              >
                {a.icon} {a.label.length > 45 ? a.label.slice(0, 45) + "…" : a.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        {filtered.map(s => <SectionCard key={s.id} section={s} />)}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhum protocolo encontrado.</p>
        )}
      </div>
    </div>
  );
};

export default LabNutritionMaster;
