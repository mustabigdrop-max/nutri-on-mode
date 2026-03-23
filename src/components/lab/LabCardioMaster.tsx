import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Heart, Activity, Zap, Timer,
  TrendingUp, Flame, Wind, Footprints, Target, Bike, Waves,
  Mountain, Brain, Pill, BarChart3, Clock, Gauge, Dumbbell,
  ArrowUpDown, Shield, ListChecks,
} from "lucide-react";

interface CardioSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: CardioSection }) => {
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

const ZoneTable = ({ rows }: { rows: string[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          {rows[0].map((h, i) => (
            <th key={i} className="text-left p-2 font-semibold text-foreground">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.slice(1).map((row, i) => (
          <tr key={i} className="border-t border-border/20">
            {row.map((cell, j) => (
              <td key={j} className={`p-2 ${j === 0 ? "font-medium text-foreground" : ""}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const SECTIONS: CardioSection[] = [
  {
    id: "fisiologia",
    title: "Fisiologia Cardiorrespiratória Avançada",
    icon: <Heart className="w-4 h-4 text-red-400" />,
    badge: "VO2max",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">VO2max — O Preditor #1 de Longevidade</p>
        <p>Estudo JAMA 2018 (122.000 pessoas): VO2max baixo = fator de risco MAIOR que tabagismo, DM2, HAS e doença coronariana. Cada MET adicional: -12% mortalidade cardiovascular.</p>
        <ZoneTable rows={[
          ["Idade", "Ruim", "Regular", "Bom", "Excelente", "Elite"],
          ["♂ 20-29", "<38", "38-43", "44-50", "51-56", ">57"],
          ["♂ 30-39", "<36", "36-41", "42-47", "48-53", ">54"],
          ["♂ 40-49", "<34", "34-39", "40-45", "46-51", ">52"],
          ["♂ 50-59", "<31", "31-35", "36-41", "42-46", ">47"],
          ["♀ 20-29", "<33", "33-37", "38-43", "44-48", ">49"],
          ["♀ 30-39", "<31", "31-35", "36-40", "41-45", ">46"],
          ["♀ 40-49", "<28", "28-33", "34-38", "39-44", ">45"],
          ["♀ 50-59", "<25", "25-29", "30-34", "35-39", ">40"],
        ]} />
        <p className="font-semibold text-foreground">Meta Peter Attia: Homem 50a → &gt;50 mL/kg/min (top 2%)</p>
        <p className="font-semibold text-foreground mt-2">Como medir VO2max:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Ergoespirometria</strong> — gold standard (laboratório)</li>
          <li><strong>Teste de Cooper</strong> — VO2max ≈ (metros - 504.9) / 44.73</li>
          <li><strong>Wearables</strong> — Garmin/Polar/Apple Watch (±3-5 mL/kg/min)</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Determinantes do VO2max:</p>
        <p><strong>Centrais:</strong> débito cardíaco máximo, difusão pulmonar. <strong>Periféricos:</strong> densidade mitocondrial, capilar, enzimas oxidativas. Genética: 50-70% herdado. Treinamento: +15-30% (sedentário: +40%).</p>
      </div>
    ),
  },
  {
    id: "zonas",
    title: "Zonas de Treinamento Completas",
    icon: <Gauge className="w-4 h-4 text-orange-400" />,
    badge: "San Millán",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Sistema San Millán (6 Zonas)</p>
        <ZoneTable rows={[
          ["Zona", "FC (%max)", "Lactato", "Substrato", "Uso"],
          ["Z1 Recovery", "<55%", "<1 mmol", ">95% gordura", "Recuperação ativa"],
          ["Z2 Aeróbio Base", "60-70%", "1.5-2 mmol", "70-80% gordura", "BASE DE TUDO — biogênese mitocondrial"],
          ["Z3 No Man's Land", "70-80%", "2-4 mmol", "50/50", "⚠️ Evitar — muito intenso p/ aeróbio, fraco p/ VO2max"],
          ["Z4 Threshold", "80-90%", "~4 mmol (LT2)", "80%+ glicose", "Performance competitiva, FTP"],
          ["Z5 VO2max", ">90%", ">6-8 mmol", "100% glicose", "Eleva VO2max diretamente"],
          ["Z6 Anaeróbio", "Máxima", ">10 mmol", "ATP-PCr", "Sprints, potência"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Zona 2 — A mais importante (San Millán):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Maior estímulo para biogênese mitocondrial</li>
          <li>Melhora oxidação de lactato (tipo I)</li>
          <li>Preserva glicogênio — gordura como combustível</li>
          <li><strong>Teste da fala:</strong> frases completas sem dificuldade = Z2</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Outros sistemas:</p>
        <ZoneTable rows={[
          ["Sistema", "Zonas", "Uso principal"],
          ["5 Zonas (%FCmax)", "Z1-Z5 (60/70/80/90%)", "Mais prático para maioria"],
          ["Friel (7 Zonas)", "Z1-Z5c", "Ciclismo/Triathlon"],
          ["FTP (Potência)", "Z1-Z7 (%FTP)", "Ciclistas com potenciômetro"],
        ]} />
      </div>
    ),
  },
  {
    id: "aej",
    title: "AEJ — Aeróbio em Jejum",
    icon: <Flame className="w-4 h-4 text-amber-400" />,
    badge: "Fat Adaptation",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Estado metabólico em jejum:</p>
        <p>Insulina mínima → HSL ativa → FFA elevados → AMPK ativa → GH pico matinal → Catecolaminas elevadas</p>
        <p className="font-semibold text-foreground mt-2">AEJ funciona para emagrecer MAIS?</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>✅ Oxidação de gordura DURANTE: aumentada (fato)</li>
          <li>⚠️ Oxidação total 24h: IGUAL (corpo compensa)</li>
          <li>📊 Perda de peso total: SEM diferença (meta-análise Schoenfeld 2014)</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Quando FAZ sentido:</p>
        <p>Flexibilidade metabólica • Conveniência • GI sensível • Jejum intermitente • Z2 leve</p>
        <p className="font-semibold text-foreground mt-2">Quando NÃO faz sentido:</p>
        <p>Z4/Z5/HIIT • Treino de força pesado • &gt;60-75min • Objetivos de performance • Histórico hipoglicemia</p>
        <ZoneTable rows={[
          ["Protocolo", "Duração", "Intensidade", "Suporte"],
          ["Básico", "20-30min", "Z1-Z2 (55-65%)", "Água + eletrólitos"],
          ["Intermediário", "30-45min", "Z2 (60-70%)", "EAA 5-10g opcional"],
          ["Avançado", "45-75min", "Z2 estrita", "Nada (purista) • Jejum 12-16h"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Suplementação pré-AEJ (sem quebrar jejum):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Cafeína:</strong> 100-200mg — potencializa lipólise</li>
          <li><strong>L-Carnitina:</strong> 1-2g — transporte de FFA</li>
          <li><strong>Yohimbina:</strong> 2-5mg — bloqueia alfa-2 (gordura teimosa). ⚠️ Ansiedade/PA</li>
          <li><strong>Eletrólitos:</strong> 500ml água + sal + magnésio</li>
        </ul>
      </div>
    ),
  },
  {
    id: "corrida",
    title: "Corrida — Biomecânica e Métodos",
    icon: <Footprints className="w-4 h-4 text-green-400" />,
    badge: "Running",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Biomecânica eficiente:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Cadência ideal:</strong> 170-180 SPM (maioria dos iniciantes: 155-165)</li>
          <li><strong>Aterrissagem:</strong> mid-foot sob o centro de massa</li>
          <li><strong>Postura:</strong> cabeça neutra, ombros relaxados, cotovelos 90°, leve inclinação do tornozelo</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Métodos de corrida:</p>
        <ZoneTable rows={[
          ["Método", "Zona", "Duração", "Objetivo"],
          ["Corrida leve (base)", "Z1-Z2", "30-90min", "Base aeróbia, queima de gordura"],
          ["Tempo run", "Z3-Z4", "20-40min", "Melhora limiar anaeróbio"],
          ["Intervalados longos", "Z5 (90-95%)", "4-6× 1000m", "VO2max direto"],
          ["Intervalados curtos", "Z5 (95-100%)", "8-12× 200m", "Velocidade, potência"],
          ["Fartlek", "Variável", "20-45min", "Jogo de velocidade livre"],
          ["Hill repeats", "Z4-Z5", "8-12× subida", "Força + potência - impacto"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Sistemas de treinamento:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Maffetone (MAF):</strong> 180 - idade = FC máxima. Base pura por 3-6 meses.</li>
          <li><strong>Daniels (VDOT):</strong> Easy + Tempo + Interval + Repetition.</li>
          <li><strong>Polarizado (Seiler):</strong> 80% Z1-Z2 + 20% Z4-Z5. MAIS evidência científica.</li>
          <li><strong>Lydiard:</strong> Volume alto → progressão para intensidade.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "ciclismo",
    title: "Ciclismo — FTP e Sweet Spot",
    icon: <Bike className="w-4 h-4 text-blue-400" />,
    badge: "Cycling",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">FTP (Functional Threshold Power):</p>
        <p>Máxima potência sustentável por ~1h. Teste: 20min máximo × 0.95 = FTP.</p>
        <ZoneTable rows={[
          ["Nível", "W/kg"],
          ["Sedentário", "< 2.5"],
          ["Recreativo", "2.5-3.5"],
          ["Competitivo amador", "3.5-4.5"],
          ["Elite amador", "4.5-5.5"],
          ["Profissional", "5.5-7.0"],
          ["World Tour", "6.0-7.5+ (Pogacar ~7.5)"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Treinos específicos:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Sweet Spot (88-94% FTP):</strong> 20-60min. Estímulo alto + fadiga baixa. 2x/semana máx.</li>
          <li><strong>Over-Unders:</strong> 2-3min a 95% FTP + 1min a 110%. Tolerância ao lactato.</li>
          <li><strong>Climbing Repeats:</strong> Subidas longas Z3-Z4. Força + aeróbio.</li>
          <li><strong>Sprint Training:</strong> 10-15s máximo × 5-8 reps. Potência/ATP-PCr.</li>
        </ul>
      </div>
    ),
  },
  {
    id: "natacao",
    title: "Natação — CSS e Métodos",
    icon: <Waves className="w-4 h-4 text-cyan-400" />,
    badge: "Swimming",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">CSS (Critical Swim Speed):</p>
        <p>Teste: (400m time - 200m time) / 200. Ex: 6:00/400m e 2:40/200m → CSS = 1:40/100m</p>
        <ZoneTable rows={[
          ["Zona", "Pace (vs CSS)"],
          ["Z1 Recovery", "CSS + 12-15s/100m"],
          ["Z2 Aeróbio", "CSS + 8-10s/100m"],
          ["Z3 Threshold", "CSS + 4-6s/100m"],
          ["Z4 CSS", "Pace CSS"],
          ["Z5 Velocidade", "CSS - 4-8s/100m"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Técnica:</p>
        <p>Rotação de corpo • Cotovelo alto no pull • Kick do quadril • Respiração rodando corpo (não levantar cabeça)</p>
      </div>
    ),
  },
  {
    id: "hiit",
    title: "HIIT — Protocolos Completos",
    icon: <Zap className="w-4 h-4 text-yellow-400" />,
    badge: "Intervalados",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Por que HIIT funciona:</p>
        <p>EPOC (+50-150kcal extra) • VO2max eficiente • AMPK + PGC-1α • GLUT4 upregulation • GH pico</p>
        <ZoneTable rows={[
          ["Protocolo", "Esforço", "Descanso", "Rounds", "Total"],
          ["Tabata (original)", "20s MÁXIMO (170% VO2)", "10s passivo", "8", "4min"],
          ["30/30 Clássico", "30s sprint", "30s walk", "15-20", "15-20min"],
          ["Norwegian 4×4", "4min 90-95% FC", "3min recovery", "4", "28min"],
          ["SIT (Wingate)", "30s absoluto máximo", "4min recovery", "4-6", "20-25min"],
          ["Lactic Tolerance", "1min máximo", "1min recovery", "8-10", "16-20min"],
          ["Hill Sprints", "20-30s subida", "2-3min descida", "8-12", "25-35min"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Melhores equipamentos para HIIT:</p>
        <p>🥇 Remo (corpo inteiro) • 🥈 Assault Bike (esforço máx instantâneo) • 🥉 SkiErg</p>
        <p className="font-semibold text-foreground mt-2">Frequência: 2x/semana máximo. Recuperação: mínimo 48h entre sessões.</p>
      </div>
    ),
  },
  {
    id: "metodos-avancados",
    title: "Métodos Avançados e Menos Conhecidos",
    icon: <Brain className="w-4 h-4 text-purple-400" />,
    badge: "Avançado",
    badgeColor: "text-purple-500 border-purple-500/30",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Z2 Optimization (San Millán):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Progressive Z2:</strong> Começa no limite inferior → +1bpm a cada 5min → mapeia limites</li>
          <li><strong>Z2 Extended:</strong> 2-3h contínuas (pro cyclists: 20-25h/semana em Z2)</li>
          <li><strong>Z2 Fasted:</strong> AEJ + Z2 = máxima fat adaptation</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Concurrent Training (Força + Cardio):</p>
        <p>Interferência existe mas é pequena (-5-10%). Minimizar: separar 6+h • ciclismo &lt; corrida para interferência • LISS &lt; HIIT para fadiga residual.</p>
        <p className="font-semibold text-foreground mt-2">Breath Training:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>Nasal Breathing (McKeown):</strong> Respirar pelo nariz → mais NO → mais CO2 tolerado → mais O2</li>
          <li><strong>Hypoxic Training:</strong> Live High Train Low → mais hemácias → +VO2max</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Walking — O mais subestimado:</p>
        <p>7.000-8.000 passos/dia = benefício máximo para mortalidade (JAMA 2021). Nordic walking: +20-46% gasto calórico. Colete de peso: +carga óssea + queima.</p>
      </div>
    ),
  },
  {
    id: "periodizacao",
    title: "Periodização do Cardio",
    icon: <BarChart3 className="w-4 h-4 text-emerald-400" />,
    badge: "Programação",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Para Bodybuilder:</p>
        <ZoneTable rows={[
          ["Fase", "Z2", "HIIT", "Total/sem"],
          ["Offseason", "3x 30-45min (bike)", "1-2x 15-20min", "2-4h"],
          ["Cutting (12+ sem)", "4-5x 30-45min", "2x/sem", "4-5h"],
          ["Cutting (8-12 sem)", "5-6x 45-60min", "2-3x/sem", "6-7h"],
          ["Cutting final (<8 sem)", "Diário 30-45min", "2-3x/sem", "5-6h"],
          ["Peak Week", "Z2 leve 15-20min", "Sem HIIT", "Mínimo"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Para Longevidade (Peter Attia):</p>
        <p>Z2: 3h/semana mínimo (4× 45min) + VO2max: 1× Norwegian 4×4/semana + Força: 3×/semana</p>
        <p className="font-semibold text-foreground mt-2">Periodização Anual:</p>
        <ZoneTable rows={[
          ["Fase", "Duração", "Distribuição", "Foco"],
          ["Base", "3-4 meses", "90-95% Z1-Z2", "Volume progressivo"],
          ["Construção", "2-3 meses", "80% Z1-Z2 + 20% Z4-Z5", "Intervalados"],
          ["Pico", "1-2 meses", "70% Z1-Z2 + 25% Z4-Z5 + 5% sprints", "Performance"],
          ["Transição", "1 mês", "Z1 apenas", "Recuperação total"],
        ]} />
      </div>
    ),
  },
  {
    id: "suplementacao",
    title: "Suplementação para Cardio",
    icon: <Pill className="w-4 h-4 text-pink-400" />,
    badge: "Stacks",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Pré-Cardio (30-60min antes):</p>
        <ZoneTable rows={[
          ["Suplemento", "Dose", "Mecanismo", "Benefício"],
          ["Cafeína", "3-6mg/kg", "Bloqueia adenosina, ↑adrenalina", "Endurance +12%, ↑lipólise"],
          ["Citrulina Malato", "6-8g", "Precursor de NO → vasodilatação", "↑Fluxo, ↓fadiga"],
          ["Beta-Alanina", "3.2g/dia (crônico)", "Carnosina → tampona H+", "Exercícios 1-4min"],
          ["Bicarbonato de Sódio", "0.2-0.3g/kg", "Alcaliniza sangue", "Sprints, Z4-Z5"],
          ["Beterraba (Nitrato)", "300-600mg NO₃", "NO₃→NO₂→NO", "Eficiência de O₂, Z3-Z4"],
          ["Rhodiola", "400mg", "Adaptógeno, inibe MAO", "Endurance mental, ↓cortisol"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Intra-Cardio:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong>&lt;60min:</strong> Água + eletrólitos</li>
          <li><strong>60-90min:</strong> Eletrólitos + 30g carb (se &gt;Z2)</li>
          <li><strong>&gt;90min:</strong> 60-90g carb/h (glicose+frutose 2:1) + eletrólitos + cafeína nas últimas horas</li>
        </ul>
        <p className="font-semibold text-foreground mt-2">Suplementação Crônica:</p>
        <ZoneTable rows={[
          ["Suplemento", "Dose", "Benefício para cardio"],
          ["Astaxantina", "12mg/dia", "Antioxidante 500× > vit E, endurance +5%"],
          ["CoQ10 Ubiquinol", "200-400mg", "ATP mitocondrial, cardioprotetor"],
          ["Ômega-3", "3-4g/dia", "↓FC repouso 2-5bpm, ↑VO2max"],
          ["Ashwagandha KSM-66", "600mg 2×/dia", "VO2max +11% (estudo 8 semanas)"],
          ["Cordyceps", "1000-3000mg/dia", "↑ATP, ↑utilização O₂"],
          ["Vitamina D3", "5000UI/dia", "Função muscular, correlação com VO2max"],
        ]} />
        <p className="font-semibold text-foreground mt-2">Para AEJ específico:</p>
        <p><strong>L-Carnitina Tartrato:</strong> 1-2g 30min antes • <strong>Yohimbina:</strong> 2-5mg (bloqueio alfa-2, gordura teimosa) ⚠️ CI: ansiedade, HAS</p>
      </div>
    ),
  },
  {
    id: "modalidades",
    title: "Comparativo de Modalidades",
    icon: <ArrowUpDown className="w-4 h-4 text-teal-400" />,
    badge: "vs",
    content: (
      <div className="space-y-3">
        <ZoneTable rows={[
          ["Modalidade", "Impacto", "Calorias", "Interferência c/ hipertrofia", "Melhor para"],
          ["Corrida", "ALTO", "ALTO", "ALTA", "VO2max + saúde óssea"],
          ["Ciclismo", "ZERO", "MOD-ALTO", "MENOR", "🏆 Bodybuilder (menos interferência)"],
          ["Natação", "ZERO", "MODERADO", "MÍNIMA", "Recovery + corpo inteiro"],
          ["Remo", "MUITO BAIXO", "🏆 MAIS ALTO", "Moderada", "🏆 HIIT (corpo todo)"],
          ["Elíptico", "BAIXO", "MODERADO", "Baixa", "Transição/reabilitação"],
          ["Assault Bike", "ZERO", "EXTREMO (HIIT)", "Moderada", "🏆 Tabata/esforço máximo"],
          ["Escada", "MODERADO", "ALTO", "Moderada", "Glúteos + queima"],
          ["Corda", "MOD-ALTO", "ALTO", "Baixa", "Aquecimento + HIIT curto"],
        ]} />
      </div>
    ),
  },
  {
    id: "objetivos",
    title: "Cardio por Objetivo Específico",
    icon: <Target className="w-4 h-4 text-rose-400" />,
    badge: "Protocolos",
    content: (
      <div className="space-y-3">
        <p className="font-semibold text-foreground">Emagrecimento Máximo:</p>
        <p><strong>Eficiência:</strong> Z2 45-60min 5-6×/sem + HIIT 2×/sem (ciclismo). <strong>Minimalista:</strong> AEJ 30min Z2 4×/sem + HIIT 2×/sem (~2.5h/sem total).</p>
        <p className="font-semibold text-foreground mt-2">Saúde Cardiovascular (AHA + Attia):</p>
        <p>Mínimo: 150min/sem moderada OU 75min vigorosa + 2× força. Otimizado: Z2 4-6h/sem + Z4-Z5 2×/sem.</p>
        <p className="font-semibold text-foreground mt-2">Bodybuilder — Prep progressivo:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Sem 20-12: 3-4× Z2 30-45min</li>
          <li>Sem 12-6: 5× Z2 45-60min + 2× HIIT</li>
          <li>Sem 6-1: Z2 diário + 2× HIIT (reduzir HIIT nas últimas 2 semanas)</li>
        </ul>
      </div>
    ),
  },
];

const QUICK_ACTIONS = [
  { label: "Protocolo Z2 completo", question: "Monte um protocolo completo de treino em Zona 2 para mim, com progressão de 12 semanas, considerando meu nível de condicionamento" },
  { label: "Protocolo AEJ ideal", question: "Qual o melhor protocolo de AEJ para mim? Considere meu objetivo de composição corporal, intensidade ideal, duração e suplementação" },
  { label: "Norwegian 4×4", question: "Explique o protocolo Norwegian 4×4 para VO2max em detalhes: aquecimento, execução, FC alvo, frequência semanal e progressão" },
  { label: "Tabata original", question: "Detalhe o protocolo Tabata original do Dr. Izumi Tabata: execução correta, equipamentos ideais, frequência e por que a maioria faz errado" },
  { label: "Cardio para bodybuilder", question: "Monte um plano de cardio para bodybuilder em cutting: modalidades, zonas, volume progressivo, como minimizar interferência com hipertrofia" },
  { label: "Elevar VO2max rapidamente", question: "Quais os métodos mais eficazes para elevar VO2max? Compare Norwegian 4×4, SIT, Tabata e polarizado. Monte um plano de 8 semanas" },
  { label: "Suplementação pré-cardio", question: "Monte um stack de suplementação pré-cardio completo: cafeína, citrulina, beterraba, beta-alanina. Doses, timing e sinergia" },
  { label: "AEJ vs alimentado", question: "Compare AEJ vs cardio alimentado com base na ciência: oxidação de gordura, EPOC, massa magra, performance. Qual escolher para cada objetivo?" },
  { label: "Polarizado (80/20)", question: "Explique o método polarizado de Seiler: distribuição 80/20, por que funciona, como implementar na prática para corrida ou ciclismo" },
  { label: "Sweet Spot Training", question: "Detalhe o Sweet Spot Training para ciclismo: zona exata, duração, progressão, frequência e por que é tão popular entre amadores" },
  { label: "Concurrent training", question: "Como combinar cardio e musculação sem perder massa muscular? Separação temporal, modalidade ideal, volume máximo e estudos sobre interferência" },
  { label: "Comparar modalidades", question: "Compare corrida, ciclismo, remo, natação e assault bike: impacto, calorias, interferência com hipertrofia, VO2max e qual escolher para cada objetivo" },
];

interface LabCardioMasterProps {
  onAskApex: (q: string) => void;
}

const LabCardioMaster = ({ onAskApex }: LabCardioMasterProps) => {
  const [search, setSearch] = useState("");

  const filtered = search
    ? SECTIONS.filter(s => s.title.toLowerCase().includes(search.toLowerCase()) || s.id.includes(search.toLowerCase()))
    : SECTIONS;

  return (
    <div className="space-y-4 pb-24">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-primary" />
        <h2 className="text-base font-bold text-foreground">Cardio Elite Master</h2>
        <Badge variant="outline" className="text-red-400 border-red-400/30 text-[10px]">12 módulos</Badge>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar módulo..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs bg-card border-border/60"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {QUICK_ACTIONS.map((a, i) => (
          <Button
            key={i}
            variant="outline"
            size="sm"
            className="text-[10px] h-6 px-2 border-primary/20 hover:bg-primary/10 hover:text-primary"
            onClick={() => onAskApex(a.question)}
          >
            {a.label}
          </Button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>
    </div>
  );
};

export default LabCardioMaster;
