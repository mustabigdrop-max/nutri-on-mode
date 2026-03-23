import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Dumbbell, Target, Shield,
  Activity, Zap, Heart, Footprints, ArrowUpDown, RotateCcw,
  Flame, Wind, Bone, Brain, Move, Timer, Repeat, TrendingUp,
} from "lucide-react";

interface TrainingSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: TrainingSection }) => {
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

const ExerciseTable = ({ rows }: { rows: { exercise: string; target: string; sets: string; notes?: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          <th className="text-left p-2 font-semibold text-foreground">Exercício</th>
          <th className="text-left p-2 font-semibold text-foreground">Alvo</th>
          <th className="text-left p-2 font-semibold text-foreground">Séries×Reps</th>
          {rows.some(r => r.notes) && <th className="text-left p-2 font-semibold text-foreground">Notas</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/20">
            <td className="p-2 font-medium text-foreground">{r.exercise}</td>
            <td className="p-2">{r.target}</td>
            <td className="p-2">{r.sets}</td>
            {rows.some(rr => rr.notes) && <td className="p-2">{r.notes || "—"}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const EMGTable = ({ rows }: { rows: { position: string; activation: string; notes?: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          <th className="text-left p-2 font-semibold text-foreground">Posição/Exercício</th>
          <th className="text-left p-2 font-semibold text-foreground">Ativação EMG</th>
          {rows.some(r => r.notes) && <th className="text-left p-2 font-semibold text-foreground">Notas</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/20">
            <td className="p-2 font-medium text-foreground">{r.position}</td>
            <td className="p-2">{r.activation}</td>
            {rows.some(rr => rr.notes) && <td className="p-2">{r.notes || "—"}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const BulletList = ({ items }: { items: string[] }) => (
  <div className="space-y-1">
    {items.map((item, i) => (
      <div key={i} className="flex gap-2 items-start">
        <span className="text-primary mt-0.5">▸</span>
        <span>{item}</span>
      </div>
    ))}
  </div>
);

// ─── SECTIONS ──────────────────────────────────────────────

const sections: TrainingSection[] = [
  // ══ MÓDULO 1 — CINESIOLOGIA POR GRUPO MUSCULAR ══
  {
    id: "peito",
    title: "Peito — Cinesiologia Completa",
    icon: <Dumbbell className="w-4 h-4 text-primary" />,
    badge: "Peitoral",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia — Pectoralis Major</p>
          <BulletList items={[
            "Clavicular (superior): origem clavícula medial → flexão e adução horizontal. Melhor: inclinado 30-45°",
            "Esternocostal (média/inferior): origem esterno + costelas 2-6 → adução e rotação interna. Melhor: plano e declinado",
            "Abdominal (inferior): origem bainha do reto → adução e depressão do ombro. Melhor: declinado, pull-over, cabo baixo→cima",
            "Pectoralis Minor: costelas 3-5 → coracoide. Protração/depressão escapular. Tensão excessiva = cifose",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">EMG por Ângulo de Inclinação</p>
          <EMGTable rows={[
            { position: "Declinado 15°", activation: "Esternocostal inferior >100%", notes: "Mais carga total" },
            { position: "Plano 0°", activation: "Esternocostal médio 100% (ref)", notes: "Equilíbrio geral" },
            { position: "Inclinado 30°", activation: "Clavicular 130%, esternocostal 80%", notes: "Melhor p/ superior" },
            { position: "Inclinado 45°", activation: "Clavicular 150%, deltóide anterior sobe", notes: "Superior + deltóide" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Biomecânica do Supino</p>
          <BulletList items={[
            "Pegada ideal: cotovelos a 70-75° do tronco (não 90° — risco de impingement)",
            "Retração escapular OBRIGATÓRIA: retrair e deprimir antes de iniciar",
            "Bar path: diagonal — descida ao esterno inferior, subida em direção aos olhos",
            "ROM completa > parcial (meta-análise Schoenfeld) — barra ao peito SE mobilidade permite",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Crucifixo — Cabo vs Halter</p>
          <BulletList items={[
            "Cabo: tensão constante durante TODO o arco → SUPERIOR para hipertrofia",
            "Halter: tensão máxima no início, mínima no topo",
            "Cabo alto→baixo: porção inferior | Médio: porção média | Baixo→cima: clavicular",
            "Cotovelo: leve flexão fixa (~15-20°). Parar 30-40° antes do topo (manter tensão)",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Exercícios por Porção</p>
          <ExerciseTable rows={[
            { exercise: "Supino inclinado 30°", target: "Clavicular", sets: "4×8-12", notes: "Barra ou halter" },
            { exercise: "Crucifixo inclinado", target: "Clavicular", sets: "3×12-15" },
            { exercise: "Cabo baixo→cima", target: "Clavicular", sets: "3×15" },
            { exercise: "Supino plano", target: "Esternocostal", sets: "4×6-10", notes: "Barra ou halter" },
            { exercise: "Peck deck", target: "Esternocostal", sets: "3×15-20", notes: "Final de treino" },
            { exercise: "Supino declinado", target: "Inferior", sets: "3×8-12" },
            { exercise: "Dip (tronco inclinado)", target: "Inferior", sets: "3×10-15" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "costas",
    title: "Costas — Mapa Muscular Completo",
    icon: <ArrowUpDown className="w-4 h-4 text-blue-500" />,
    badge: "Dorsal",
    badgeColor: "text-blue-500 border-blue-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia — Mapa Completo</p>
          <BulletList items={[
            "Latíssimo: T6-L5 + crista ilíaca → úmero. Extensão/adução/rotação interna. Largura: puxadas abertas. Espessura: remadas",
            "Trapézio Superior: elevação/rotação da escápula — geralmente hiperativo. Inibir em exercícios de costas",
            "Trapézio Médio: retração escapular — essencial para postura. Remadas com cotovelo a 90°",
            "Trapézio Inferior: depressão/rotação da escápula — frequentemente fraco. Puxadas com depressão escapular",
            "Romboides: retração e elevação. Remadas com cotovelo próximo ao corpo",
            "Redondo Maior: sinergista do lat ('lat pequeno'). Puxadas com rotação externa",
            "Infra-espinhal + Redondo Menor: manguito rotador — face pull, rotação externa",
            "Eretores da Espinha: extensão/estabilização da coluna. Terra, hiperextensões",
          ]} />
        </div>
        <Card className="bg-blue-500/5 border-blue-500/20 p-3">
          <p className="text-xs font-semibold text-blue-400 mb-1">Regra Fundamental das Remadas</p>
          <p className="text-xs">"Cotovelo determina o músculo"</p>
          <p className="text-xs mt-1">Cotovelo aduzido → Lat | Cotovelo 45° → Lat + Trap Médio + Romboides | Cotovelo 90° → Trap Médio + Romboides</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Puxadas — Pegada e Ativação</p>
          <EMGTable rows={[
            { position: "Pronada aberta (>1.5x ombros)", activation: "Lat prioritário, bíceps secundário" },
            { position: "Supinada fechada", activation: "Bíceps prioritário, lat secundário" },
            { position: "Neutra (V-bar)", activation: "Equilíbrio, maior ROM" },
            { position: "Unilateral", activation: "Correção de assimetrias, maior ROM" },
          ]} />
          <p className="text-xs mt-2 text-primary">Execução: depressão escapular ANTES de puxar → cotovelos para baixo e para trás → puxar até queixo/clavícula</p>
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Remadas — Exercícios Chave</p>
          <ExerciseTable rows={[
            { exercise: "Remada curvada barra", target: "Lat + trap + romboides", sets: "4×6-8", notes: "Tronco 45°, coluna neutra" },
            { exercise: "Remada halter 1 braço", target: "Lat unilateral", sets: "3×10-12", notes: "Puxar até quadril, não peito" },
            { exercise: "Remada cabo sentado", target: "Lat (polia baixa) / Trap (polia alta)", sets: "4×12", notes: "Tensão constante" },
            { exercise: "Remada máquina (chest pad)", target: "Volume seguro", sets: "3×15", notes: "Final de treino, foco contração" },
            { exercise: "Pull-up com carga", target: "Lat + bíceps", sets: "4×5-8", notes: "Avançado" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "ombros",
    title: "Ombros — Deltoides & Manguito Rotador",
    icon: <Target className="w-4 h-4 text-orange-500" />,
    badge: "Deltoides",
    badgeColor: "text-orange-500 border-orange-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">3 Porções do Deltóide</p>
          <BulletList items={[
            "Anterior: clavícula lateral → flexão/rotação interna. GERALMENTE SOBREATIVO (supino já ativa). Isolado raramente necessário",
            "Médio: acrômio → abdução (15-100°). DÁ LARGURA. Frequentemente subativo — precisa de trabalho direto",
            "Posterior: espinha da escápula → extensão/abdução horizontal/rotação externa. FREQUENTEMENTE FRACO — essencial para postura",
          ]} />
        </div>
        <Card className="bg-orange-500/5 border-orange-500/20 p-3">
          <p className="text-xs font-semibold text-orange-400 mb-1">Elevação Lateral — O Exercício Mais Importante e Mais Mal Executado</p>
          <BulletList items={[
            "Cotovelo ligeiramente flexo (15-20°) — fixo durante todo o movimento",
            "Polegar levemente para baixo — 'despejar um copo d'água'",
            "Levantar o COTOVELO — não a mão. Atingir paralelo (90°) — não acima",
            "Excêntrico controlado 3-4s. Sem balanço de quadril",
            "Cabo lateral > halter para hipertrofia (tensão na posição de alongamento)",
          ]} />
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Face Pull — O Exercício Mais Subestimado</p>
          <BulletList items={[
            "Saúde do ombro + deltóide posterior + retração escapular + contrabalança supino",
            "Polia altura dos olhos. Puxar para o rosto (não pescoço)",
            "Cotovelos SEMPRE acima da corda. Posição final: 'W' com os braços",
            "Frequência: 3-4x/semana em qualquer treino que inclua ombro",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Press Militar — Biomecânica</p>
          <BulletList items={[
            "Halteres: mais ROM, convergência natural | Barra: mais carga, mais estável",
            "Bar path: cabeça recua → barra sobe vertical → cabeça avança",
            "Core ativado: 'costelas para baixo'. Extensão lombar excessiva = dor/lesão",
            "Behind the neck press: EVITAR (risco de impingement)",
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "biceps",
    title: "Bíceps — Cabeça Longa vs Curta vs Braquial",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    badge: "Flexores",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia</p>
          <BulletList items={[
            "Cabeça Longa: tubérculo supraglenoidal. Mais ativada: cotovelo ATRÁS do corpo (curl inclinado)",
            "Cabeça Curta: processo coracoide. Mais ativada: cotovelo À FRENTE (curl concentrado, scott)",
            "Braquial: úmero → ulna. Sempre ativo. 'Levanta o bíceps' — mais pico visual. Melhor: curl pronado/martelo",
            "Braquiorradial: flexão em posição neutra. Curl martelo. 'Braço de fora'",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Ativação EMG por Exercício</p>
          <EMGTable rows={[
            { position: "Curl concentrado", activation: "Cabeça curta (pico)" },
            { position: "Curl Scott/Preacher", activation: "Cabeça curta" },
            { position: "Curl inclinado 45-60°", activation: "Cabeça longa (pré-estiramento)" },
            { position: "Curl em pé livre", activation: "Equilíbrio das duas cabeças" },
            { position: "Curl martelo", activation: "Braquial + braquiorradial" },
            { position: "Curl cabo (atrás da cabeça)", activation: "Cabeça longa, tensão constante" },
            { position: "Chin-up", activation: "Bíceps + lat integrado" },
          ]} />
        </div>
        <Card className="bg-yellow-500/5 border-yellow-500/20 p-3">
          <p className="text-xs font-semibold text-yellow-400 mb-1">Protocolo para Pico de Bíceps</p>
          <p className="text-xs">Cabeça longa (pico): Curl inclinado 45-60° + Curl cabo unilateral (polia atrás)</p>
          <p className="text-xs">Cabeça curta (largura): Curl concentrado + Scott/Preacher</p>
          <p className="text-xs">Braquial (espessura): Curl martelo + Curl pronado (barra ou cabo)</p>
        </Card>
      </div>
    ),
  },
  {
    id: "triceps",
    title: "Tríceps — 3 Cabeças & Programação",
    icon: <Zap className="w-4 h-4 text-red-400" />,
    badge: "Extensores",
    badgeColor: "text-red-400 border-red-400/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia</p>
          <BulletList items={[
            "Cabeça Longa: único cruzador do ombro. Braço elevado = pré-estiramento. Francês, overhead extension",
            "Cabeça Lateral: 'ferradura' visual. Cotovelo ao lado. Pushdown pronado, mergulho",
            "Cabeça Medial: sempre ativa, base e espessura. Todos os exercícios de extensão",
          ]} />
        </div>
        <Card className="bg-red-400/5 border-red-400/20 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">Regra Fundamental</p>
          <p className="text-xs">Para cabeça LONGA: elevar o braço (overhead). Para LATERAL e MEDIAL: cotovelo ao lado.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Exercícios por Cabeça</p>
          <ExerciseTable rows={[
            { exercise: "Francês com halteres", target: "Cabeça longa", sets: "3×10-12", notes: "EMG superior" },
            { exercise: "Overhead cable extension", target: "Cabeça longa", sets: "3×12-15" },
            { exercise: "Skullcrusher", target: "Cabeça longa", sets: "3×10", notes: "Cotovelo para trás" },
            { exercise: "Pushdown pronado (barra)", target: "Lateral + medial", sets: "3×12" },
            { exercise: "Pushdown corda", target: "Lateral + medial", sets: "3×12-15", notes: "Mais ROM + separação" },
            { exercise: "Close-grip bench press", target: "Global (carga máxima)", sets: "4×6-8" },
            { exercise: "Dip (tronco vertical)", target: "Lateral + medial", sets: "3×10-15", notes: "Cotovelos fechados" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "quadriceps",
    title: "Quadríceps — 4 Cabeças & Agachamento",
    icon: <Footprints className="w-4 h-4 text-emerald-500" />,
    badge: "Anterior",
    badgeColor: "text-emerald-500 border-emerald-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia — 4 Cabeças</p>
          <BulletList items={[
            "Reto Femoral: BIARTICULAR (quadril + joelho). Melhor ativado com quadril estendido (leg press, hack squat)",
            "Vasto Lateral: 'sweep' lateral (genética). Agachamento com pés próximos",
            "Vasto Medial (VMO): 'gota d'água'. Estabiliza patela. Extensão terminal (últimos 30°). Leg extension ROM completa",
            "Vasto Intermediário: profundo, sempre ativo em extensão do joelho",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Biomecânica do Agachamento — Variáveis</p>
          <EMGTable rows={[
            { position: "Pés estreitos", activation: "Mais quad, menos glúteos/adutores", notes: "Maior demanda tornozelo" },
            { position: "Pés médios (largura quadris)", activation: "Equilíbrio quad/glúteos", notes: "Padrão recomendado" },
            { position: "Pés largos (sumo)", activation: "Mais adutores e glúteos", notes: "Menos mobilidade tornozelo" },
            { position: "ATG (profundo)", activation: "Máxima ativação glúteo + quad", notes: "Requer mobilidade" },
            { position: "Paralelo", activation: "Mínimo aceitável", notes: "Padrão intermediário" },
            { position: "Tronco vertical", activation: "Joelho dominante (mais quad)", notes: "Frontal, hack squat" },
            { position: "Tronco inclinado", activation: "Quadril dominante (mais glúteo)", notes: "Fêmur longo" },
          ]} />
        </div>
        <Card className="bg-emerald-500/5 border-emerald-500/20 p-3">
          <p className="text-xs font-semibold text-emerald-400 mb-1">Mito Desmentido</p>
          <p className="text-xs">"Joelho não pode passar a ponta do pé" — FALSO. O joelho PODE e DEVE passar para ROM completa. O importante é seguir a direção dos dedos (sem valgo/varo).</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Máquinas — Posição e Alvo</p>
          <ExerciseTable rows={[
            { exercise: "Hack Squat", target: "Quadríceps (mais que livre)", sets: "4×10-12", notes: "Joelho mais à frente = mais quad" },
            { exercise: "Leg Press (pés baixo/estreito)", target: "Quadríceps puro", sets: "3×12-15" },
            { exercise: "Leg Press (pés alto/largo)", target: "Glúteos + isquios", sets: "3×12-15" },
            { exercise: "Leg Extension", target: "Reto femoral + VMO", sets: "3×15", notes: "Seguro em saudáveis com ROM controlada" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "isquiotibiais",
    title: "Isquiotibiais — Bíceps Femoral & RDL",
    icon: <Activity className="w-4 h-4 text-violet-500" />,
    badge: "Posterior",
    badgeColor: "text-violet-500 border-violet-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia</p>
          <BulletList items={[
            "Bíceps Femoral (cabeça longa): biarticular — flexão joelho + extensão quadril. Melhor: RDL",
            "Bíceps Femoral (cabeça curta): monoarticular — apenas flexão joelho. Melhor: leg curl",
            "Semitendíneo e Semimembranáceo: flexão joelho + extensão quadril. RDL e leg curl",
          ]} />
        </div>
        <Card className="bg-violet-500/5 border-violet-500/20 p-3">
          <p className="text-xs font-semibold text-violet-400 mb-1">Desenvolvimento COMPLETO requer AMBAS as funções</p>
          <p className="text-xs">1. Extensão do quadril (cabeça longa): RDL, Stiff, Good Morning, Nordic, GHR</p>
          <p className="text-xs">2. Flexão do joelho (cabeça curta): Leg curl sentado, deitado, em pé</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">RDL — Biomecânica Detalhada</p>
          <BulletList items={[
            "Joelhos levemente flexos (15-20°) — FIXOS durante todo o movimento",
            "Quadril: move para trás (hinge — dobradiça). Não é agachamento!",
            "Coluna: NEUTRA. Descida até sentir alongamento isquiotibial — não forçar",
            "Subida: empurrar o chão e avançar o quadril",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Leg Curl — Sentado vs Deitado</p>
          <EMGTable rows={[
            { position: "Sentado", activation: "Maior ROM (quadril flexionado = pré-estiramento)", notes: "SUPERIOR para hipertrofia" },
            { position: "Deitado", activation: "Menos ROM, mais carga geralmente", notes: "Padrão clássico" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Nordic Hamstring Curl</p>
          <BulletList items={[
            "Excêntrico de altíssima intensidade — maior ativação que qualquer máquina",
            "Proteção contra lesão — fundamental para atletas de corrida",
            "Progressão: assistido → parcial → completo",
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "gluteos",
    title: "Glúteos — Hip Thrust & Ativação",
    icon: <Flame className="w-4 h-4 text-pink-500" />,
    badge: "Glúteo",
    badgeColor: "text-pink-500 border-pink-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Anatomia</p>
          <BulletList items={[
            "Glúteo Máximo: MAIOR músculo do corpo. Extensão do quadril + rotação externa. Hip thrust, bridge, step-up",
            "Glúteo Médio: abdução + rotação interna. Estabilizador do quadril. Fraco = valgo de joelho. Abdução cabo, clamshell, lateral band walk",
            "Glúteo Mínimo: abdução + rotação interna. Trabalha com o médio",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">EMG Comparativo (Brett Contreras)</p>
          <EMGTable rows={[
            { position: "Hip Thrust", activation: "119% glúteo máximo", notes: "Tensão máxima na extensão" },
            { position: "Levantamento Terra", activation: "88% glúteo máximo" },
            { position: "Agachamento", activation: "56% glúteo máximo", notes: "Curva de força inferior" },
          ]} />
        </div>
        <Card className="bg-pink-500/5 border-pink-500/20 p-3">
          <p className="text-xs font-semibold text-pink-400 mb-1">Hip Thrust — Execução Correta</p>
          <BulletList items={[
            "Banco na altura dos omoplatas (não pescoço). Pés sob os joelhos (90° no topo)",
            "Quadril neutro no topo — NÃO hiperextensão lombar",
            "'Enfiar o rabo' no topo = retroversão pélvica = contração máxima",
            "Pausa 1-2s no topo maximiza ativação",
            "Pés à frente = mais glúteo máximo (padrão recomendado)",
          ]} />
        </Card>
      </div>
    ),
  },
  {
    id: "panturrilha",
    title: "Panturrilha — Gastrocnêmio & Sóleo",
    icon: <Footprints className="w-4 h-4 text-teal-500" />,
    badge: "Perna Inferior",
    badgeColor: "text-teal-500 border-teal-500/30",
    content: (
      <div className="space-y-4">
        <BulletList items={[
          "Gastrocnêmio: biarticular. Mais ativado com joelho estendido (em pé). Fibras tipo 2 (rápidas)",
          "Sóleo: monoarticular. Mais ativado com joelho flexionado (sentado). Fibras tipo 1 — altas reps (20-30+)",
          "ROM completa obrigatória: estiramento → contração. Pausa no estiramento 'acorda' mais fibras",
          "Frequência alta: 4-6x/semana. Sóleo recupera mais rápido",
          "Tibial Anterior: dorsiflexão — importante para equilibrar. Caminhada em calcanhar",
        ]} />
      </div>
    ),
  },

  // ══ MÓDULO 2 — SPLITS E PROGRAMAS ══
  {
    id: "splits",
    title: "Splits de Treino — Upper/Lower, PPL, Bro",
    icon: <Repeat className="w-4 h-4 text-cyan-500" />,
    badge: "Programação",
    badgeColor: "text-cyan-500 border-cyan-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Upper/Lower (4 dias — frequência 2x/semana)</p>
          <ExerciseTable rows={[
            { exercise: "Upper A (Força)", target: "Supino 4×5, Remada 4×6, Press 3×8, Puxada 3×8", sets: "60-75min" },
            { exercise: "Upper B (Hipertrofia)", target: "Inc Halter 4×10-12, Cabo 4×12, Elev Lateral 4×15, Curl 3×12", sets: "70-80min" },
            { exercise: "Lower A (Força)", target: "Agachamento 4×5, RDL 4×6, Leg Press 3×10, Panturrilha 4×12", sets: "60-70min" },
            { exercise: "Lower B (Hipertrofia)", target: "Hack 4×10-12, Leg Curl 4×12, Hip Thrust 4×12, Afundo 3×12", sets: "65-75min" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">PPL (Push/Pull/Legs — 6 dias)</p>
          <BulletList items={[
            "Push A (Força): Supino 4×5, Press 4×6, Inc Halter 3×10, Elev Lateral 4×12, Pushdown + Skull 3×10-12",
            "Push B (Hipertrofia): Inc Halter 4×12, Arnold 3×12, Crucifixo cabo 4×15, Overhead ext 3×15",
            "Pull A (Força): Barra fixa 4×5, Remada barra 4×6, Puxada 3×10, Curl barra 4×8",
            "Pull B (Hipertrofia): Puxada neutra 4×12, Cabo baixo 4×12, Pull-over 3×15, Curl inclinado 3×12",
            "Legs A (Força): Agachamento 5×5, RDL 4×6, Leg Press 3×12, Panturrilha pé 4×12",
            "Legs B (Hipertrofia): Hack 4×12, Leg Curl sentado 4×12, Hip Thrust 4×15, Búlgaro 3×12",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Bro Split (5-6 dias — 1 grupo/dia)</p>
          <BulletList items={[
            "Seg: Peito | Ter: Costas | Qua: Ombros | Qui: Braços | Sex: Pernas | Sáb: Ponto fraco",
            "Vantagem: volume máximo por sessão, recuperação completa entre grupos",
            "Desvantagem: frequência baixa — inferior para naturais. Melhor para: enhanced, avançados",
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "metodos",
    title: "Métodos Avançados — DC, Mountain Dog, HIT",
    icon: <TrendingUp className="w-4 h-4 text-red-500" />,
    badge: "Elite",
    badgeColor: "text-red-500 border-red-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-red-500/5 border-red-500/20 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">DC Training (Dante Trudel)</p>
          <BulletList items={[
            "Rest-Pause: 15-20 reps → 10-15 respirações → +6-8 reps → 10-15 respirações → +4-6 reps. Anotar total. Bater recorde.",
            "Stretching extremo 60-90s pós-exercício na posição de máximo estiramento (expansão de fáscia)",
            "1-2 séries VERDADEIRAMENTE ao fracasso. Progressão de carga = lei máxima",
          ]} />
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20 p-3">
          <p className="text-xs font-semibold text-orange-400 mb-1">Mountain Dog Training (John Meadows)</p>
          <BulletList items={[
            "Estrutura: 1. Base (força 3-4×6-8) → 2. Intensidade (3×10-12 c/ técnicas) → 3. Isolamento (3-4×12-15) → 4. Pump (2-3×15-20)",
            "Meadows Row: remada landmine unilateral, puxar para quadril, cotovelo alto — enorme ROM",
            "Pré-exaustão: isolar ANTES do composto (crucifixo → supino)",
            "Pausa 1-3s na posição de máximo estiramento: elimina momentum, superior para hipertrofia",
          ]} />
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Outros Métodos de Elite</p>
          <BulletList items={[
            "Dorian Yates HIT — Blood & Guts: 1 série de trabalho até fracasso absoluto. Volume mínimo, intensidade máxima",
            "Mike Mentzer Heavy Duty — falha muscular verdadeira + negativas forçadas",
            "Poliquin — Tempo sob tensão (4-0-1-0), corpo alemão (GVT 10×10), especialização de braços",
            "Cal Dietz — Triphasic Training: excêntrico → isométrico → concêntrico por blocos",
            "Louie Simmons — Conjugate/Westside: max effort + dynamic effort + repetition",
          ]} />
        </div>
      </div>
    ),
  },

  // ══ MÓDULO 3 — AQUECIMENTO ══
  {
    id: "aquecimento",
    title: "Aquecimento Completo — Protocolo",
    icon: <Timer className="w-4 h-4 text-amber-500" />,
    badge: "Prep",
    badgeColor: "text-amber-500 border-amber-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-amber-500/5 border-amber-500/20 p-3">
          <p className="text-xs font-semibold text-amber-400 mb-1">❌ NÃO use cardio prolongado pré-treino de força</p>
          <p className="text-xs">20-30min cardio antes: depleta glicogênio, fadiga neural 5-15%, cortisol ↑. USE aquecimento específico.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Etapa 1 — Ativação Geral (5min)</p>
          <BulletList items={[
            "Bicicleta ou caminhada inclinada ou elíptico: 5min, nível baixo",
            "Objetivo: elevar temperatura central 1-2°C, lubrificar articulações",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Etapa 2 — Mobilidade Upper (5-10min)</p>
          <BulletList items={[
            "Foam roll torácico: 10 passagens | Book opener: 10 reps/lado | Cat-Cow: 10 reps",
            "Band pull-apart: 20 reps | Face pull elástico: 15 reps | Rotação externa elástico: 15/lado",
            "Dislocações com bastão: 10 reps | Pendulum (Codman): 30s/braço",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Etapa 2 — Mobilidade Lower (5-10min)</p>
          <BulletList items={[
            "90/90 hip stretch: 60s/lado | Hip circles: 10/direção | Pigeon: 60s/lado",
            "Couch stretch: 60s/lado (essencial para agachamento) | Deep squat hold: 30-60s",
            "Ankle circles + Lunge ankle drive: 10/lado | Calf raises + stretch: 10 reps",
            "Clamshell elástico: 15/lado | Monster walk: 10 passos | Hip thrust corporal: 15 reps",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Etapa 3 — Séries de Aquecimento (OBRIGATÓRIO)</p>
          <ExerciseTable rows={[
            { exercise: "Série 0 (50%)", target: "Técnica e sensação", sets: "10 reps" },
            { exercise: "Série 1 (60%)", target: "Progressão", sets: "6 reps" },
            { exercise: "Série 2 (70%)", target: "Progressão", sets: "4 reps" },
            { exercise: "Série 3 (80%)", target: "Progressão", sets: "3 reps" },
            { exercise: "Série 4 (90%)", target: "Pré-ativação", sets: "2 reps" },
            { exercise: "Trabalho (100%)", target: "Séries programadas", sets: "Conforme split" },
          ]} />
        </div>
      </div>
    ),
  },

  // ══ MÓDULO 4 — MOBILIDADE ══
  {
    id: "mobilidade",
    title: "Mobilidade — Avaliação & Protocolos Diários",
    icon: <Move className="w-4 h-4 text-indigo-500" />,
    badge: "Mobilidade",
    badgeColor: "text-indigo-500 border-indigo-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-indigo-500/5 border-indigo-500/20 p-3">
          <p className="text-xs font-semibold text-indigo-400 mb-1">Mobilidade ≠ Flexibilidade</p>
          <p className="text-xs">Flexibilidade: ROM passiva. Mobilidade: ROM ativa COM CONTROLE. Para bodybuilding: MOBILIDADE é o objetivo.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Testes de Avaliação</p>
          <BulletList items={[
            "Overhead Squat: calcanhar levanta → tornozelo | tronco inclina → torácica | valgo → glúteo médio",
            "Thomas Test: coxa oposta sobe → iliopsoas/reto femoral encurtado → couch stretch",
            "Shoulder Flexion: braços não tocam orelhas → serrátil fraco, peitoral menor encurtado",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Protocolo Manhã (10min — diário)</p>
          <BulletList items={[
            "Coluna: Dead bug 10/lado + Bird-dog 10/lado + Cat-Cow 10 + Child's pose rotação 10/lado",
            "Quadril: 90/90 60s/lado + World's Greatest Stretch 5/lado + Hip flexor stretch 60s/lado",
            "Ombros: Band pull-apart 20 + External rotation elástico 15/lado",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Sessão Dedicada (1-2x/semana — 30min)</p>
          <BulletList items={[
            "Inferior: Couch stretch 2min/lado + Pigeon 2min/lado + Borboleta 2min + Deep squat 3×30s + WGS 5/lado",
            "Superior: Pec stretch porta 2min/lado + Lats stretch 2min + Dislocações bastão 10 + Thread needle 10/lado + Foam roll torácico 3min",
          ]} />
        </div>
      </div>
    ),
  },

  // ══ MÓDULO 5 — CARDIO ESTRATÉGICO ══
  {
    id: "cardio",
    title: "Cardio Estratégico — Timing & Protocolos",
    icon: <Heart className="w-4 h-4 text-rose-500" />,
    badge: "Cardio",
    badgeColor: "text-rose-500 border-rose-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Cardio Pós-Treino</p>
          <BulletList items={[
            "LISS leve (caminhada, bike leve): NÃO prejudica hipertrofia, MELHORA recuperação ativa",
            "15-20min bike nível 2-4 OU caminhada 5-6km/h: flush de metabólitos, gordura como combustível",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Cardio no Dia de Pernas</p>
          <EMGTable rows={[
            { position: "Caminhada pós-pernas 10-20min", activation: "✅ ÓTIMO — remove lactato, reduz DOMS" },
            { position: "Bike leve pós-pernas", activation: "✅ Aceitável — flush sanguíneo" },
            { position: "Natação pós-pernas", activation: "✅ EXCELENTE — zero impacto" },
            { position: "Escada/Stairs pós-pernas", activation: "❌ NÃO — mesmo padrão de movimento" },
            { position: "Corrida pós-pernas", activation: "❌ NÃO — impacto + fadiga" },
            { position: "HIIT pós-pernas", activation: "❌ NUNCA — pior dos mundos" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">HIIT para Bodybuilding</p>
          <BulletList items={[
            "Frequência: máximo 2x/semana. Duração: 20min total — não mais",
            "Formato: 20s sprint / 40s rec ×15 rounds OU 30s sprint / 90s rec ×10 rounds",
            "Modalidade: bike assault, remo, sprints (NÃO corrida)",
            "Timing: dia separado do treino de força OU +6h de intervalo",
          ]} />
        </div>
        <Card className="bg-rose-500/5 border-rose-500/20 p-3">
          <p className="text-xs font-semibold text-rose-400 mb-1">Separação Temporal (Mesmo Dia)</p>
          <p className="text-xs">Pernas DE MANHÃ + cardio À TARDE = melhor opção (6-8h de janela)</p>
          <p className="text-xs">Cardio primeiro + pernas depois = PIOR opção</p>
        </Card>
      </div>
    ),
  },

  // ══ MÓDULO 6 — CORREÇÃO POSTURAL ══
  {
    id: "postura",
    title: "Correção Postural — Síndromes Cruzadas",
    icon: <Bone className="w-4 h-4 text-slate-400" />,
    badge: "Postural",
    badgeColor: "text-slate-400 border-slate-400/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Síndrome Cruzada Superior (Upper Crossed)</p>
          <BulletList items={[
            "TENSOS: trapézio superior, levantador escápula, ECM, peitoral maior/menor",
            "FRACOS: trapézio inferior, serrátil anterior, flexores profundos pescoço, romboides",
            "RESULTADO: cabeça protraída, cifose torácica, ombros internamente rotados, impingement crônico",
          ]} />
          <p className="text-foreground font-semibold mb-2 mt-3">Protocolo de Correção UCS</p>
          <BulletList items={[
            "Alongar: pec menor (porta 2-3min), trap superior (inclinação lateral 60s), levantador (olhar axila 60s)",
            "Fortalecer: Face Pull 3×20 (4x/sem), Band pull-apart 3×20 diário, Prone Y/YTW 3×12, Wall slide 3×12, Chin tuck 3×15",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Síndrome Cruzada Inferior (Lower Crossed)</p>
          <BulletList items={[
            "TENSOS: iliopsoas, reto femoral, eretores lombares",
            "FRACOS: glúteo máximo, glúteo médio, transverso abdominal",
            "RESULTADO: anteversão pélvica, hiperlordose, glúteo 'plano' (inibido)",
          ]} />
          <p className="text-foreground font-semibold mb-2 mt-3">Protocolo de Correção LCS</p>
          <BulletList items={[
            "Alongar: Couch stretch 2min/lado, Pigeon 2min/lado, Reto femoral 60s/lado",
            "McGill Big 3 OBRIGATÓRIO: Dead Bug 3×10/lado + Bird-Dog 3×10/lado + Modified Side Plank 3×30s",
            "Hip Thrust, Clamshell 3×20, Monster walk 3×15, Vacuum 3×30s",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Valgo de Joelho</p>
          <BulletList items={[
            "Causa: glúteo médio fraco + adutores dominantes + pé plano",
            "Correção: Clamshell 3×20, Monster walk, Agachamento c/ elástico nos joelhos, Single-leg exercises",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Prevenção de Dor Lombar</p>
          <BulletList items={[
            "McGill Big 3: 3-4x/semana | Hip hinge pattern correto | Hiperextensão controlada 3×15",
            "Alongar: psoas (couch stretch) + piriforme",
            "NÃO: sit-up tradicional (compressão discal), leg raises sem core ativado",
          ]} />
        </div>
      </div>
    ),
  },

  // ══ MÓDULO 7 — PÓS-TREINO DE PERNAS ══
  {
    id: "pos-pernas",
    title: "Pós-Treino de Pernas — Protocolo Recuperação",
    icon: <Wind className="w-4 h-4 text-sky-500" />,
    badge: "Recovery",
    badgeColor: "text-sky-500 border-sky-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-sky-500/5 border-sky-500/20 p-3">
          <p className="text-xs font-semibold text-sky-400 mb-1">DOMS: pico 24-72h. Movimento leve REDUZ. Movimento intenso AUMENTA.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Imediato (0-10min após pernas)</p>
          <BulletList items={[
            "Caminhada na esteira: 4-5km/h, inclinação 0-2%, 10-15min",
            "Propósito: flush de lactato e H+, recuperação muscular acelerada",
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Opcional (15-30min após)</p>
          <BulletList items={[
            "Bicicleta ergométrica horizontal: nível 1-3, 70-90 RPM, 15-20min. Sem impacto",
            "Natação: MELHOR opção. Pernada leve + braçada trabalha upper enquanto pernas recuperam",
          ]} />
        </div>
        <Card className="bg-destructive/5 border-destructive/20 p-3">
          <p className="text-xs font-semibold text-destructive mb-1">EVITAR ABSOLUTAMENTE PÓS-PERNAS</p>
          <BulletList items={[
            "❌ Corrida (impacto + músculos fadigados)",
            "❌ Escada/Stairs (mesmo padrão de agachamento)",
            "❌ Leg press leve 'para bombear' (catabolismo local)",
            "❌ HIIT em qualquer modalidade de perna",
            "❌ Bicicleta nível alto / Elíptico velocidade alta",
          ]} />
        </Card>
      </div>
    ),
  },
];

const QUICK_ACTIONS = [
  { label: "Montar treino Upper/Lower personalizado para cutting", icon: <Repeat className="w-3 h-3" /> },
  { label: "Protocolo completo de aquecimento para dia de pernas", icon: <Timer className="w-3 h-3" /> },
  { label: "Análise biomecânica do agachamento — correções individuais", icon: <Footprints className="w-3 h-3" /> },
  { label: "Protocolo Mountain Dog para peito com pré-exaustão", icon: <TrendingUp className="w-3 h-3" /> },
  { label: "Correção de síndrome cruzada superior — rotina diária", icon: <Bone className="w-3 h-3" /> },
  { label: "Cardio estratégico para bodybuilding em cutting", icon: <Heart className="w-3 h-3" /> },
  { label: "Protocolo de mobilidade para agachamento ATG", icon: <Move className="w-3 h-3" /> },
  { label: "Split PPL 6 dias com periodização de força e hipertrofia", icon: <Dumbbell className="w-3 h-3" /> },
];

interface LabTrainingMasterProps {
  onAskApex?: (q: string) => void;
}

const LabTrainingMaster = ({ onAskApex }: LabTrainingMasterProps) => {
  const [search, setSearch] = useState("");

  const filtered = search
    ? sections.filter(
        (s) =>
          s.title.toLowerCase().includes(search.toLowerCase()) ||
          s.badge?.toLowerCase().includes(search.toLowerCase()) ||
          s.id.toLowerCase().includes(search.toLowerCase())
      )
    : sections;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="bg-gradient-to-r from-primary/10 via-destructive/5 to-orange-500/10 border-primary/20">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-1">
            <Dumbbell className="w-5 h-5 text-primary" />
            <h2 className="text-sm font-black text-foreground tracking-tight">APEX TRAINING MASTER</h2>
          </div>
          <p className="text-[10px] text-muted-foreground font-mono">
            Biomecânica · Cinesiologia · Periodização de Elite Mundial — Stuart McGill, Schoenfeld, Contreras, Meadows, Poliquin
          </p>
        </CardContent>
      </Card>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar módulo (peito, costas, cardio, mobilidade...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border/60"
        />
      </div>

      {/* Quick Actions */}
      {!search && (
        <div className="space-y-2">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">⚡ Quick Actions — Pergunte ao APEX</p>
          <div className="flex flex-wrap gap-1.5">
            {QUICK_ACTIONS.map((action, i) => (
              <Button
                key={i}
                variant="outline"
                size="sm"
                className="h-auto py-1.5 px-2.5 text-[10px] gap-1 border-border/60 hover:bg-primary/10 hover:border-primary/30 whitespace-normal text-left"
                onClick={() => onAskApex?.(action.label)}
              >
                {action.icon}
                {action.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Sections */}
      <div className="space-y-2">
        {filtered.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-8">Nenhum módulo encontrado para "{search}"</p>
        )}
      </div>
    </div>
  );
};

export default LabTrainingMaster;
