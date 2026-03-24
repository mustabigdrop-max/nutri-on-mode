import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, BookOpen, Target, MessageSquare, TrendingUp, Dumbbell, ChevronRight, Info, Zap, RotateCcw, Flame, Clock, BarChart3 } from "lucide-react";

// ─── GLOSSARY DATA ───
const GLOSSARY = [
  {
    category: "Tipos de Séries",
    terms: [
      { term: "Warm-up Sets", def: "Séries com carga reduzida para preparar sistema neuromuscular, articulações e tecido conjuntivo. NÃO contam para o volume.", icon: "🔥" },
      { term: "Feeder Sets", def: "Variação de warm-up focada em 'alimentar' o músculo com sangue antes das work sets. 2-3 séries leves com 15-20 reps para congestão prévia.", icon: "💉" },
      { term: "Activation Sets", def: "Séries de ativação pré-exercício com isolamento para 'ligar' o músculo antes do composto. Ex: elevação lateral antes do press.", icon: "⚡" },
      { term: "Work Sets", def: "Séries que geram o estímulo efetivo de hipertrofia ou força. São as que contam para volume semanal e progressão. Realizadas próximo da falha (RIR 0-3).", icon: "💪" },
      { term: "Top Set", def: "A série mais pesada do exercício — geralmente a primeira work set após a pirâmide de aquecimento. Máximo recrutamento neural.", icon: "🏆" },
      { term: "Back-off Sets", def: "Séries após o top set com carga reduzida (10-20%) e mais reps. Volume adicional com menos fadiga neural.", icon: "📉" },
      { term: "Straight Sets", def: "Mesma carga em todas as séries. Usar quando a carga ainda está progredindo. Ex: 4×10 com 80kg.", icon: "➡️" },
      { term: "Pyramid Sets", def: "Aumentar carga a cada série enquanto reps diminuem. Ex: 60×12 → 70×10 → 80×8 → 90×6.", icon: "🔺" },
      { term: "Reverse Pyramid", def: "Iniciar com carga mais pesada (top set) e reduzir nas seguintes. Mais eficaz pois o SN está mais fresco.", icon: "🔻" },
      { term: "Drop Sets", def: "Após falha, reduzir carga 15-30% sem descanso e continuar até nova falha. Último exercício de um grupo, isolamento.", icon: "⬇️" },
      { term: "Rest-Pause", def: "Após falha, descansar 15-20s e realizar mais reps com a MESMA carga. Origem: DC Training (Dante Trudel).", icon: "⏸️" },
      { term: "Myo-Reps", def: "Método Borge Fagerli. Série de ativação até ~5 RIR, descanso 5-10s, clusters de 3-5 reps até não completar. Similar ao volume tradicional em menos tempo.", icon: "🔄" },
      { term: "Giant Sets", def: "3+ exercícios consecutivos sem descanso. Para alta densidade de treino ou pouco tempo.", icon: "🦍" },
      { term: "Supersets", def: "2 exercícios consecutivos sem descanso. Antagonistas (bíceps+tríceps), agonistas (pré-exaustão), ou não relacionados.", icon: "🔗" },
      { term: "Cluster Sets", def: "Séries com micro-pausas internas (10-15s) para mais volume de alta intensidade. Ex: 3 reps, 15s, 3 reps, 15s, 3 reps.", icon: "🧩" },
      { term: "Mechanical Drop Set", def: "Mesma carga, mudar para versão mais fácil do exercício na falha. Ex: puxada pronada → supinada → assistida.", icon: "🔧" },
    ]
  },
  {
    category: "Intensidade",
    terms: [
      { term: "RIR (Reps in Reserve)", def: "Repetições que conseguiria fazer antes da falha. RIR 0 = falha técnica. RIR 1 = mais 1 rep possível. RIR 2 = mais 2 reps.", icon: "🔢" },
      { term: "RPE (Rate of Perceived Exertion)", def: "Escala 1-10. RPE 10 = falha absoluta. RPE 9 = RIR 1. RPE 8 = RIR 2. RPE 7 = RIR 3.", icon: "📊" },
      { term: "Falha Técnica", def: "Ponto onde não é possível completar mais uma rep com técnica correta e segura. PARAR a série aqui.", icon: "🛑" },
      { term: "Falha Muscular Absoluta", def: "Impossibilidade total de continuar mesmo com técnica comprometida. Raramente recomendado — apenas isolamentos com assistência.", icon: "💀" },
      { term: "Tempo de Execução", def: "Formato X-X-X-X. Pos 1: excêntrico (descida). Pos 2: pausa no estiramento. Pos 3: concêntrico (subida). Pos 4: pausa no topo. Ex: 3-1-1-0.", icon: "⏱️" },
    ]
  },
  {
    category: "Volume",
    terms: [
      { term: "MEV (Minimum Effective Volume)", def: "Volume MÍNIMO para estimular adaptação. Ponto de partida de qualquer mesociclo.", icon: "📏" },
      { term: "MAV (Maximum Adaptive Volume)", def: "Volume ÓTIMO — melhor relação estímulo/recuperação. A maioria das semanas deve estar aqui.", icon: "✅" },
      { term: "MRV (Maximum Recoverable Volume)", def: "Volume MÁXIMO que consegue se recuperar. Exceder = overtraining. Atingir ao final do mesociclo.", icon: "⚠️" },
    ]
  },
  {
    category: "Progressão",
    terms: [
      { term: "Progressive Overload", def: "Aumentar sistematicamente o estímulo: carga, volume, frequência, intensidade, tempo sob tensão, ROM ou técnica.", icon: "📈" },
      { term: "Double Progression", def: "Atingir limite superior de reps com mesma carga ANTES de aumentar o peso. Ex: 3×8-12 → quando 3×12: +2.5kg.", icon: "🔄" },
      { term: "Deload", def: "Semana de volume/intensidade reduzidos (40-60%) para supercompensação. A cada 4-8 semanas.", icon: "🧘" },
    ]
  },
  {
    category: "Biomecânica",
    terms: [
      { term: "Mente-Músculo", def: "Capacidade de contrair voluntariamente o músculo alvo. Schoenfeld 2016: melhora EMG em 22% com foco mental.", icon: "🧠" },
      { term: "Line of Pull", def: "Direção da resistência vs orientação das fibras musculares. Melhor quando paralela à direção das fibras.", icon: "↗️" },
      { term: "Peak Contraction", def: "Ponto de máxima contração muscular. Pausar 1-2s para aumentar recrutamento.", icon: "💎" },
      { term: "Stretched Position", def: "Ponto de máximo alongamento sob carga. Evidência 2023: pode ser MAIS importante que a contração para hipertrofia.", icon: "🤸" },
      { term: "Tensão Mecânica", def: "Força aplicada ao tecido muscular. Principal mecanismo de hipertrofia. Maximizar: carga alta + ROM completa + boa técnica.", icon: "⚙️" },
      { term: "Estresse Metabólico", def: "Acúmulo de metabólitos (lactato, H+). Relacionado ao pump. Maximizar: descanso curto, rep range alto.", icon: "🔬" },
    ]
  }
];

// ─── EXERCISE CUES DATA ───
const EXERCISE_CUES: Record<string, { mentalidade: string; setup: string[]; excentrico: string[]; concentrico: string[]; diagnostico: { problema: string; solucao: string }[] }> = {
  "Supino Reto": {
    mentalidade: "Não empurre a barra. Empurre o chão com as costas e use o peitoral para fechar os braços. — Joe Bennett",
    setup: [
      "RETRAÇÃO ESCAPULAR: \"Esprema uma laranja nas axilas\" → Retrair E deprimir as escápulas → Protege ombro e ativa peitoral",
      "LEG DRIVE: Pés planos no chão, empurrar o chão → Estabilidade total → NÃO levantar o quadril",
      "PEGADA: Polegar em volta da barra. Pulso neutro. Cotovelo 70-75° (não 90°)"
    ],
    excentrico: [
      "Descida controlada 3-4s: a barra é guiada, não cai",
      "Sentir o peitoral ESTIRAR — imaginar que está abrindo o peito",
      "Barra ao esterno/mamilos (não pescoço)",
      "Pausa 1-2s no estiramento: elimina bounce, mais ativação"
    ],
    concentrico: [
      "Iniciar com PEITORAL: \"Imagine juntar os cotovelos\" → Adução antes de extensão",
      "Trajetória diagonal: sobe em direção aos olhos (não ao teto)",
      "Manter tensão no topo — não travar o cotovelo completamente"
    ],
    diagnostico: [
      { problema: "Sinto mais no ombro que no peitoral", solucao: "Checar retração escapular (provavelmente fraca). Cotovelo muito aberto (>90°). Descer para esterno, não pescoço. Fazer ativação de peitoral antes." },
      { problema: "Sinto mais no tríceps que no peitoral", solucao: "Cotovelo muito fechado (<60°). Barra subindo muito vertical. Cue: \"juntar cotovelos\", não \"empurrar para cima\"." },
      { problema: "Dor no ombro", solucao: "PARAR. Checar cotovelo em 90° (lesão clássica). Alternativa: supino com halteres (ROM controlada). Fisioterapeuta se persistir." }
    ]
  },
  "Puxada Frontal": {
    mentalidade: "Não puxe com as mãos. Puxe com os cotovelos. As mãos são apenas ganchos. — John Meadows",
    setup: [
      "PEGADA: Pronada aberta (1.5x ombros). False grip opcional → Reduz antebraço/bíceps",
      "TRONCO: Leve inclinação posterior (10-15°) → Melhor ângulo para o lat",
      "DEPRESSÃO ESCAPULAR antes de puxar: \"Ombros nos bolsos\" — já ativa o lat inferior"
    ],
    excentrico: [
      "Subida controlada 3s: deixe o lat estirar completamente",
      "Braços completamente estendidos no topo — máximo alongamento",
      "O estiramento é onde o crescimento acontece"
    ],
    concentrico: [
      "\"Empurre os cotovelos para baixo, não puxe a barra\"",
      "\"Tente dobrar a barra ao redor do corpo\" → Tensão de rotação interna",
      "Barra ao queixo/clavícula. Pausa 1-2s. NÃO puxar atrás da cabeça"
    ],
    diagnostico: [
      { problema: "Sinto mais nos braços que nas costas", solucao: "False grip (polegar fora). Cue de cotovelo. Ativação prévia: straight-arm pulldown." },
      { problema: "Ombro sobe junto", solucao: "Depressão escapular insuficiente. Praticar só a depressão sem puxar. Cue: \"ombros longe das orelhas\"." }
    ]
  },
  "Hip Thrust": {
    mentalidade: "O glúteo é a potência. A coluna é apenas o eixo. Nunca confunda os dois. — Dr. Brett Contreras",
    setup: [
      "BANCO: Linha dos omoplatas (não pescoço)",
      "PÉS: Diretamente ABAIXO dos joelhos → No topo: joelho a 90°",
      "BARRA: Nas dobras do quadril com almofada de proteção"
    ],
    excentrico: [
      "Quadril desce quase ao chão (não toca)",
      "Coluna neutra durante todo o movimento"
    ],
    concentrico: [
      "Iniciar com GLÚTEO, não com lombar",
      "RETROVERSÃO PÉLVICA no topo: \"Enfie o rabo para baixo\" → +30-40% ativação EMG",
      "Pausa 2-3s no topo com máxima contração isométrica",
      "Joelhos empurrar para FORA: ativa glúteo médio + máximo"
    ],
    diagnostico: [
      { problema: "Sinto mais na lombar", solucao: "NÃO está fazendo retroversão. Treinar deitado: achatar lombar no chão. Banco pode estar alto demais." },
      { problema: "Sinto mais nas coxas", solucao: "Pés muito longe ou perto. Ajustar 2-3cm de cada vez." },
      { problema: "Câimbra na panturrilha", solucao: "Pés muito longe. Trazer 5cm mais perto do banco." }
    ]
  },
  "Elevação Lateral": {
    mentalidade: "Você não está erguendo o peso. Está empurrando o cotovelo para longe do corpo com o deltóide médio. — Dr. Mike Israetel",
    setup: [
      "Leve inclinação para frente (10-15°) → Reduz trapézio",
      "Cotovelo levemente flexo (15-20°) — FIXO durante todo o movimento",
      "Polegar: neutro ou levemente abaixo (testar qual sente mais)"
    ],
    excentrico: [
      "Descida lenta 4s: resistir ativamente à gravidade",
      "Sentir deltóide estirar. Pausa 1s no estiramento"
    ],
    concentrico: [
      "\"O cotovelo é a liderança, a mão segue\"",
      "Até paralelo (90°) — NÃO passar",
      "\"Ombros distantes das orelhas\" — trapézio INATIVO",
      "SEM balanço de corpo. Preferir cabo (tensão constante)"
    ],
    diagnostico: [
      { problema: "Sinto mais no trapézio", solucao: "Reduzir carga. Cue: \"ombros longe das orelhas\". Fazer deitado de lado. Tempo excêntrico lento." },
      { problema: "Sinto no deltóide anterior", solucao: "Cotovelo indo para frente. Imaginar parede à frente que não pode ultrapassar." }
    ]
  },
  "Rosca Inclinada": {
    mentalidade: "Cada cm extra de estiramento nesta posição é um cm a mais de crescimento na cabeça longa do bíceps. — Dr. Brad Schoenfeld",
    setup: [
      "Banco 45-60° (45° = mais estiramento)",
      "Braços COMPLETAMENTE estendidos — halteres pendendo",
      "Cotovelo: manter ATRÁS do plano do corpo"
    ],
    excentrico: [
      "Descida lenta 3-4s: deixe a cabeça longa se alongar ao máximo",
      "Descer COMPLETAMENTE — pausa 2s na posição de estiramento total"
    ],
    concentrico: [
      "SUPINAÇÃO ATIVA: ao subir, gire polegar para fora",
      "Cotovelo é pino fixo atrás do corpo — NÃO avançar"
    ],
    diagnostico: [
      { problema: "Não sinto estiramento na cabeça longa", solucao: "Ângulo muito alto (>70°). Reduzir ângulo. Verificar se braços realmente pendem (não apoiados no banco)." }
    ]
  },
  "Agachamento Livre": {
    mentalidade: "O agachamento é o rei porque é o mais difícil de fazer corretamente e o que mais benefícios traz. — Mark Rippetoe",
    setup: [
      "HIGH BAR (sobre trapézio): mais vertical, mais quadríceps. LOW BAR (sobre espinhos): mais inclinado, mais força",
      "Pés: largura dos ombros, 15-30° rotação externa",
      "Valsalva: inspirar, prender ar, pressão abdominal → protege coluna"
    ],
    excentrico: [
      "Iniciar com QUADRIL: \"sente no banquinho invisível\"",
      "Joelhos seguir direção dos pés, empurrar para fora",
      "Profundidade: ATG = mais glúteo. Paralelo = padrão hipertrofia"
    ],
    concentrico: [
      "\"Empurre o chão para baixo\" → extensão de pernas",
      "\"Peito para cima\" → evita good morning",
      "Finalizar com retroversão pélvica leve"
    ],
    diagnostico: [
      { problema: "Butt wink (coluna flexiona no fundo)", solucao: "Mobilidade de quadril/tornozelo insuficiente. Calcanhar elevado temporariamente + trabalho de mobilidade." },
      { problema: "Joelhos colapsam para dentro", solucao: "Glúteo médio fraco. Cue: \"empurre joelhos para fora\". Elástico acima dos joelhos." }
    ]
  }
};

// ─── WARMUP PROTOCOLS ───
const WARMUP_PROTOCOLS = {
  upper: {
    title: "Upper Body (Peito/Costas/Ombros)",
    mobilidade: [
      "Foam roll torácico: 10 passagens lentas (T4 a T12) — 2min",
      "Book opener: 8 reps cada lado — 2min",
      "Thread the needle: 8 reps cada lado — 1min",
      "Band pull-apart: 20 reps — 1min",
      "Rotação externa elástico: 15 reps cada — 1min",
      "Dislocações com bastão: 10 reps — 1min",
      "Wall slide: 12 reps — 1min"
    ],
    ativacao: [
      "PEITO: Cable crossover leve 2×20 com pausa 2s na contração",
      "LAT: Straight-arm pulldown leve 2×15 (sentir ao lado do peito)",
      "DELTÓIDE: Elevação lateral elástico 2×20 (ombros para baixo)"
    ]
  },
  lower: {
    title: "Lower Body (Pernas/Glúteos)",
    mobilidade: [
      "90/90 hip stretch: 60s cada posição — 2min",
      "Hip circles: 10 cada direção, cada lado — 2min",
      "World's Greatest Stretch: 5 reps cada lado — 2min",
      "Couch stretch: 60s cada lado — 2min",
      "Ankle circles: 10 cada direção — 30s",
      "Lunge ankle drive: 10 cada lado — 1min"
    ],
    ativacao: [
      "GLÚTEO: Clamshell com elástico 15 reps cada lado",
      "GLÚTEO: Hip thrust peso corporal 15 reps com retroversão",
      "ADUTORES: Monster walk 10 passos cada direção"
    ]
  }
};

// ─── COMPONENT ───
interface LabProTrainingProps {
  onAskApex?: (q: string) => void;
}

const LabProTraining = ({ onAskApex }: LabProTrainingProps) => {
  const [subTab, setSubTab] = useState("glossario");
  const [topSetWeight, setTopSetWeight] = useState("");
  const [topSetReps, setTopSetReps] = useState("8");
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [feedbackMode, setFeedbackMode] = useState(false);

  const feederSets = topSetWeight ? [
    { pct: 40, reps: 15, weight: Math.round(Number(topSetWeight) * 0.4), rest: 60 },
    { pct: 55, reps: 10, weight: Math.round(Number(topSetWeight) * 0.55), rest: 60 },
    { pct: 70, reps: 6, weight: Math.round(Number(topSetWeight) * 0.7), rest: 90 },
    { pct: 85, reps: 3, weight: Math.round(Number(topSetWeight) * 0.85), rest: 150 },
  ] : [];

  return (
    <div className="space-y-4 pb-8">
      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-2">
        {[
          { icon: BookOpen, label: "Glossário", tab: "glossario", color: "text-blue-400" },
          { icon: Calculator, label: "Feeder Sets", tab: "feeder", color: "text-green-400" },
          { icon: Target, label: "Cues de Ativação", tab: "cues", color: "text-amber-400" },
          { icon: Dumbbell, label: "Aquecimento Pro", tab: "warmup", color: "text-purple-400" },
          { icon: MessageSquare, label: "Feedback Série", tab: "feedback", color: "text-rose-400" },
          { icon: TrendingUp, label: "Progressão", tab: "progressao", color: "text-cyan-400" },
        ].map(item => (
          <Button
            key={item.tab}
            variant={subTab === item.tab ? "default" : "outline"}
            className="h-auto py-3 flex flex-col items-center gap-1.5 text-xs"
            onClick={() => setSubTab(item.tab)}
          >
            <item.icon className={`w-4 h-4 ${subTab === item.tab ? "text-primary-foreground" : item.color}`} />
            {item.label}
          </Button>
        ))}
      </div>

      {/* ─── GLOSSÁRIO ─── */}
      {subTab === "glossario" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              Glossário Profissional de Treino
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {GLOSSARY.map(cat => (
              <div key={cat.category}>
                <Badge variant="outline" className="mb-2 text-[10px]">{cat.category}</Badge>
                <Accordion type="multiple" className="space-y-1">
                  {cat.terms.map(t => (
                    <AccordionItem key={t.term} value={t.term} className="border border-border/50 rounded-lg px-3">
                      <AccordionTrigger className="py-2 text-xs hover:no-underline">
                        <span className="flex items-center gap-2">
                          <span>{t.icon}</span>
                          <span className="font-semibold">{t.term}</span>
                        </span>
                      </AccordionTrigger>
                      <AccordionContent className="text-[11px] text-muted-foreground pb-2">
                        {t.def}
                        {onAskApex && (
                          <Button variant="ghost" size="sm" className="mt-1 h-6 text-[10px] text-primary" onClick={() => onAskApex(`Explique detalhadamente sobre ${t.term} no treino de musculação`)}>
                            Perguntar ao APEX →
                          </Button>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* ─── FEEDER SET CALCULATOR ─── */}
      {subTab === "feeder" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Calculator className="w-4 h-4 text-green-400" />
              Calculadora de Feeder Sets
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">Gera automaticamente as séries de aquecimento para qualquer exercício</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Carga do Top Set (kg)</label>
                <Input type="number" placeholder="Ex: 100" value={topSetWeight} onChange={e => setTopSetWeight(e.target.value)} className="h-9 text-sm" />
              </div>
              <div>
                <label className="text-[10px] text-muted-foreground mb-1 block">Reps do Top Set</label>
                <Input type="number" placeholder="Ex: 8" value={topSetReps} onChange={e => setTopSetReps(e.target.value)} className="h-9 text-sm" />
              </div>
            </div>

            {feederSets.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Feeders (Aquecimento)</p>
                {feederSets.map((f, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 border border-border/50">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[9px] bg-muted/50">F{i + 1}</Badge>
                      <span className="text-xs font-semibold">{f.weight}kg × {f.reps} reps</span>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                      <span>{f.pct}%</span>
                      <Clock className="w-3 h-3" />
                      <span>{f.rest}s</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-dashed border-primary/30 my-2" />
                <p className="text-[10px] font-mono text-primary uppercase tracking-wider">Work Sets (Trabalho)</p>
                
                <div className="p-2.5 rounded-lg bg-primary/10 border border-primary/30">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className="text-[9px] bg-primary">🏆 TOP</Badge>
                      <span className="text-xs font-bold">{topSetWeight}kg × {topSetReps} reps</span>
                    </div>
                    <span className="text-[10px] text-primary">RIR 2</span>
                  </div>
                </div>

                {[2, 3].map(n => (
                  <div key={n} className="p-2.5 rounded-lg bg-muted/20 border border-border/50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[9px]">WS{n}</Badge>
                        <span className="text-xs font-semibold">{topSetWeight}kg × {topSetReps} reps</span>
                      </div>
                      <span className="text-[10px] text-muted-foreground">RIR {3 - n}</span>
                    </div>
                  </div>
                ))}

                <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 mt-3">
                  <p className="text-[10px] text-amber-300 flex items-center gap-1"><Info className="w-3 h-3" /> Regra dos Feeders</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Quanto mais pesado o top set: mais feeders. Compostos pesados: 3-5 feeders. Isolados: 1-2 feeders apenas.</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── CUES DE ATIVAÇÃO ─── */}
      {subTab === "cues" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              Cues de Direcionamento Muscular
            </CardTitle>
            <p className="text-[10px] text-muted-foreground">Como direcionar cada exercício para o músculo alvo</p>
          </CardHeader>
          <CardContent>
            {!selectedExercise ? (
              <div className="grid grid-cols-2 gap-2">
                {Object.keys(EXERCISE_CUES).map(ex => (
                  <Button key={ex} variant="outline" className="h-auto py-3 text-xs justify-start" onClick={() => setSelectedExercise(ex)}>
                    <Dumbbell className="w-3.5 h-3.5 mr-2 text-primary" />
                    {ex}
                    <ChevronRight className="w-3 h-3 ml-auto" />
                  </Button>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                <Button variant="ghost" size="sm" className="text-[10px] h-6" onClick={() => setSelectedExercise(null)}>
                  ← Voltar
                </Button>
                <h3 className="text-sm font-bold text-primary">{selectedExercise}</h3>

                {/* Mentalidade */}
                <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-[10px] font-mono text-primary mb-1">🧠 MENTALIDADE</p>
                  <p className="text-[11px] text-foreground italic">"{EXERCISE_CUES[selectedExercise].mentalidade}"</p>
                </div>

                <Accordion type="multiple" defaultValue={["setup", "excentrico", "concentrico", "diagnostico"]}>
                  <AccordionItem value="setup" className="border border-border/50 rounded-lg px-3 mb-2">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      <span className="flex items-center gap-2">⚙️ Setup (Configuração)</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-3">
                      {EXERCISE_CUES[selectedExercise].setup.map((s, i) => (
                        <div key={i} className="text-[11px] text-muted-foreground p-2 bg-muted/20 rounded">{s}</div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="excentrico" className="border border-border/50 rounded-lg px-3 mb-2">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      <span className="flex items-center gap-2">⬇️ Fase Excêntrica (Descida)</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-3">
                      {EXERCISE_CUES[selectedExercise].excentrico.map((s, i) => (
                        <div key={i} className="text-[11px] text-muted-foreground p-2 bg-muted/20 rounded">{s}</div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="concentrico" className="border border-border/50 rounded-lg px-3 mb-2">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      <span className="flex items-center gap-2">⬆️ Fase Concêntrica (Subida)</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-3">
                      {EXERCISE_CUES[selectedExercise].concentrico.map((s, i) => (
                        <div key={i} className="text-[11px] text-muted-foreground p-2 bg-muted/20 rounded">{s}</div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="diagnostico" className="border border-border/50 rounded-lg px-3">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">
                      <span className="flex items-center gap-2">🔍 Diagnóstico de Problemas</span>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-2 pb-3">
                      {EXERCISE_CUES[selectedExercise].diagnostico.map((d, i) => (
                        <div key={i} className="p-2 bg-destructive/5 border border-destructive/20 rounded">
                          <p className="text-[11px] font-semibold text-destructive">❌ {d.problema}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">✅ {d.solucao}</p>
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

                {onAskApex && (
                  <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => onAskApex(`Dê cues detalhados de ativação muscular para ${selectedExercise} com foco em biomecânica e conexão mente-músculo`)}>
                    <Zap className="w-3 h-3 mr-1" /> Perguntar ao APEX sobre {selectedExercise}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ─── AQUECIMENTO PRO ─── */}
      {subTab === "warmup" && (
        <div className="space-y-3">
          {Object.entries(WARMUP_PROTOCOLS).map(([key, protocol]) => (
            <Card key={key} className="bg-card border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs flex items-center gap-2">
                  <Flame className="w-4 h-4 text-orange-400" />
                  {protocol.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <Badge variant="outline" className="mb-2 text-[9px]">Mobilidade (5-10min)</Badge>
                  {protocol.mobilidade.map((m, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground py-1.5 border-b border-border/30 last:border-0 flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span> {m}
                    </div>
                  ))}
                </div>
                <div>
                  <Badge variant="outline" className="mb-2 text-[9px] border-primary/30 text-primary">Ativação (5min)</Badge>
                  {protocol.ativacao.map((a, i) => (
                    <div key={i} className="text-[11px] text-muted-foreground py-1.5 border-b border-border/30 last:border-0 flex items-start gap-2">
                      <Zap className="w-3 h-3 text-amber-400 mt-0.5 shrink-0" /> {a}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <p className="text-[10px] text-muted-foreground italic">
                "O aquecimento é parte do treino, não preparação para o treino. Atletas de elite passam 20-30% do tempo total em preparação." — Charles Poliquin
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ─── FEEDBACK PÓS-SÉRIE ─── */}
      {subTab === "feedback" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-rose-400" />
              Sistema de Feedback Pós-Série
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] font-mono text-primary mb-2">🎯 ONDE SENTIU O MÚSCULO?</p>
              <div className="flex gap-2">
                {[
                  { label: "Músculo alvo ✅", color: "bg-green-500/10 border-green-500/30 text-green-300" },
                  { label: "Secundário ⚠️", color: "bg-amber-500/10 border-amber-500/30 text-amber-300" },
                  { label: "Lugar errado ❌", color: "bg-destructive/10 border-destructive/30 text-destructive" },
                ].map(opt => (
                  <Button key={opt.label} variant="outline" size="sm" className={`text-[10px] h-7 flex-1 border ${opt.color}`}>
                    {opt.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] font-mono text-primary mb-2">💪 QUALIDADE DA CONTRAÇÃO?</p>
              <div className="flex gap-2">
                {["Excelente 🔥", "Boa 👍", "Fraca 😕"].map(q => (
                  <Button key={q} variant="outline" size="sm" className="text-[10px] h-7 flex-1">{q}</Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] font-mono text-primary mb-2">🔢 RIR REAL</p>
              <div className="flex gap-2">
                {[0, 1, 2, 3, "4+"].map(r => (
                  <Button key={r} variant="outline" size="sm" className="text-[10px] h-8 flex-1">{r}</Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-muted/30 border border-border">
              <p className="text-[10px] font-mono text-primary mb-2">📝 NOTAS RÁPIDAS</p>
              <div className="grid grid-cols-2 gap-1.5">
                {[
                  "Sentiu mais no lado esquerdo",
                  "Mais nos braços que no alvo",
                  "Falta de mente-músculo",
                  "Técnica precisou ajuste",
                  "Ótima conexão — repetir!",
                  "Câimbra muscular",
                  "Desconforto articular",
                  "Peso muito pesado",
                ].map(note => (
                  <Button key={note} variant="outline" size="sm" className="text-[9px] h-auto py-1.5 justify-start whitespace-normal text-left">
                    {note}
                  </Button>
                ))}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-[10px] text-primary"><Info className="w-3 h-3 inline mr-1" />Se marcar "Lugar errado ❌", o app abre automaticamente os cues de ativação do exercício com dicas específicas.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ─── PROGRESSÃO ─── */}
      {subTab === "progressao" && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Sistema de Progressão Automática
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              {
                titulo: "AUMENTAR CARGA 💪",
                condicao: "Completou TODAS as reps com RIR ≥ 2",
                acao: "+2.5kg (isolamentos) ou +5kg (compostos)",
                cor: "bg-green-500/10 border-green-500/30"
              },
              {
                titulo: "MANTER CARGA — no limite",
                condicao: "Completou TODAS as reps com RIR 0-1",
                acao: "Tente completar mais reps mantendo a carga",
                cor: "bg-amber-500/10 border-amber-500/30"
              },
              {
                titulo: "MANTER — foco na técnica",
                condicao: "NÃO completou todas as reps (falha precoce)",
                acao: "Verificar: sono, nutrição, fadiga. Se 2 sessões sem progresso → DELOAD",
                cor: "bg-red-500/10 border-red-500/30"
              }
            ].map(p => (
              <div key={p.titulo} className={`p-3 rounded-lg border ${p.cor}`}>
                <p className="text-xs font-bold">{p.titulo}</p>
                <p className="text-[10px] text-muted-foreground mt-1">Condição: {p.condicao}</p>
                <p className="text-[10px] text-foreground mt-0.5">→ {p.acao}</p>
              </div>
            ))}

            <div className="border-t border-border/50 pt-3">
              <p className="text-xs font-semibold mb-2 flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> Estruturas de Work Sets por Objetivo</p>
              <Accordion type="multiple">
                {[
                  { val: "forca", title: "💪 Força Máxima (1-5 reps)", content: "5×5 ou Top Set + Back-offs. 80-92% 1RM. RIR 2-4. Descanso 3-5min. Progressão linear (+2.5-5kg/sessão)." },
                  { val: "hipertrofia", title: "🏗️ Hipertrofia (6-20 reps)", content: "Straight Sets ou Reverse Pyramid. 60-80% 1RM. RIR 0-3. Descanso 60-180s. Double progression preferencial." },
                  { val: "endurance", title: "🏃 Endurance Muscular (20+ reps)", content: "Straight Sets ou Myo-Reps. 40-60% 1RM. RIR 0-2. Descanso 30-60s. Mais reps antes de adicionar carga." },
                ].map(item => (
                  <AccordionItem key={item.val} value={item.val} className="border border-border/50 rounded-lg px-3 mb-2">
                    <AccordionTrigger className="py-2 text-xs hover:no-underline">{item.title}</AccordionTrigger>
                    <AccordionContent className="text-[11px] text-muted-foreground pb-2">{item.content}</AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>

            <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
              <p className="text-[10px] text-muted-foreground italic">
                "Sem progressão = sem crescimento. Anotar TUDO: carga, reps, séries, RIR. Bater recorde = crescimento."
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LabProTraining;
