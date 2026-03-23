import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Heart, Scale, Brain, Activity,
  Users, Baby, Pill, AlertTriangle, Flame, Salad, Utensils,
  Moon, Shield, Zap, Target, TrendingUp, FlaskConical, Droplets,
  Clock, Eye, Smile, HeartPulse, Thermometer, Sparkles, ShoppingCart, GraduationCap,
} from "lucide-react";

interface HealthSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: HealthSection }) => {
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

const InfoTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/50">
          {headers.map((h, i) => (
            <th key={i} className="text-left p-2 font-bold text-foreground">{h}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, i) => (
          <tr key={i} className="border-t border-border/30">
            {row.map((cell, j) => (
              <td key={j} className={`p-2 ${j === 0 ? "font-medium text-foreground" : ""}`}>{cell}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const HEALTH_SECTIONS: HealthSection[] = [
  {
    id: "emagrecimento",
    title: "Emagrecimento Sustentável",
    icon: <Scale className="w-4 h-4 text-primary" />,
    badge: "Módulo 1",
    content: (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground mb-1">Filosofia</p>
          <p className="italic">"O problema nunca foi falta de informação. Quase todo mundo sabe que deve comer menos e se mover mais. O problema é comportamental, hormonal e ambiental." — Dr. Jason Fung</p>
        </div>

        <p className="font-bold text-foreground">Por que dietas falham — a ciência:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Modelo calorias in/out incompleto:</strong> qualidade afeta hormônios, microbiota, inflamação, metabolismo basal</li>
          <li><strong className="text-foreground">Adaptive thermogenesis:</strong> 500kcal de deficit → apenas 300-400kcal de perda real após semanas</li>
          <li><strong className="text-foreground">Resistência hormonal:</strong> leptina resistente, grelina elevada, insulina crônica</li>
          <li><strong className="text-foreground">Microbiota:</strong> disbiose → mais extração calórica (Firmicutes vs Bacteroidetes)</li>
          <li><strong className="text-foreground">Psicologia:</strong> 60-70% do overeating é emocional; privação → obsessão → binge</li>
          <li><strong className="text-foreground">Ambiente obesogênico:</strong> ultra-processados engenheirados, porções 3x maiores que 1970</li>
        </ul>

        <p className="font-bold text-foreground">Comparativo de abordagens:</p>
        <InfoTable
          headers={["Abordagem", "Eficácia", "Aderência", "Para quem"]}
          rows={[
            ["Contagem de calorias", "Alta (quando seguida)", "Baixa a médio prazo", "Analíticos, atletas"],
            ["Alimentação intuitiva", "Moderada", "Alta", "Dietas yoyo, TA em recuperação"],
            ["IIFYM", "Alta", "Moderada-alta", "Flexibilidade + controle"],
            ["Low Carb / Ceto", "Alta curto prazo", "Moderada", "RI severa, DM2, epilepsia"],
            ["Jejum Intermitente", "Similar à contínua", "Moderada", "Sem fome matinal, agendas caóticas"],
            ["Mediterrânea", "Moderada (perda)", "Mais alta de todas", "Todos — especialmente longo prazo"],
          ]}
        />

        <p className="font-bold text-foreground">Protocolo de Emagrecimento Sustentável:</p>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">FASE 1 — Diagnóstico (semanas 1-2)</p>
          <p>Anamnese completa: histórico de peso, tentativas anteriores, gatilhos emocionais, padrão alimentar, sono, estresse, hormônios, medicações, genética, orçamento, suporte social.</p>
          <p className="font-semibold text-foreground mt-2">Exames obrigatórios:</p>
          <p>Glicemia + insulina (HOMA-IR) • HbA1c • TSH + T3 livre • Cortisol matinal • Testosterona (H) / Estradiol + Progesterona (M) • Leptina • Lipidograma • PCR-us • Vitamina D • Ferritina</p>
        </div>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">FASE 2 — Fundação (semanas 1-4)</p>
          <p>Prioridades nessa ordem:</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li><strong className="text-foreground">Sono 7-9h:</strong> privação = grelina +15%, leptina -15%, GH reduzido</li>
            <li><strong className="text-foreground">Hidratação 35ml/kg:</strong> 500ml antes das refeições = -13% ingestão</li>
            <li><strong className="text-foreground">Proteína 1.6-2g/kg:</strong> efeito termogênico 25-30% vs 6-8% carb</li>
            <li><strong className="text-foreground">Fibra 25-35g/dia:</strong> 10 porções vegetais/frutas</li>
            <li><strong className="text-foreground">Remover ultra-processados</strong> gradualmente — substituição progressiva</li>
          </ol>
        </div>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">FASE 3 — Déficit Inteligente (semanas 5-12)</p>
          <InfoTable
            headers={["Perfil", "Déficit", "Ritmo/semana"]}
            rows={[
              ["Nunca fez dieta", "300-500kcal/dia", "0.5-0.75% do peso"],
              ["Muitas dietas (adaptado)", "200-300kcal (após reverse)", "0.25-0.5% do peso"],
              ["Obesidade severa (IMC>35)", "Até 750kcal", "Com acompanhamento médico"],
            ]}
          />
        </div>

        <p className="font-bold text-foreground">Estratégias de aderência:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Regra 80/20:</strong> 80% protocolo, 20% flexibilidade sem culpa</li>
          <li><strong className="text-foreground">Refeição planejada:</strong> semanal, programada, sem culpa (não "cheat meal")</li>
          <li><strong className="text-foreground">Não existe alimento proibido:</strong> proibir → obsessão → binge</li>
          <li><strong className="text-foreground">Ambiente first:</strong> geladeira organizada, sem junk em casa, marmita</li>
          <li><strong className="text-foreground">Habit stacking:</strong> empilhar nos hábitos existentes</li>
        </ul>

        <p className="font-bold text-foreground">Abordagem por perfil psicológico:</p>
        <InfoTable
          headers={["Perfil", "Protocolo", "Evitar"]}
          rows={[
            ["Racional (analítico)", "IIFYM + app tracking", "—"],
            ["Emocional", "Alimentação intuitiva + psicólogo", "Contagem (piora obsessão)"],
            ["Social", "Regras simples, não contagem", "Restrição total"],
            ["Ocupado", "Meal prep semanal + delivery mapeado", "Múltiplas refeições elaboradas"],
          ]}
        />

        <p className="font-bold text-foreground">Protocolo anti-rebound:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Reverse diet após meta: +50-100kcal/semana até TDEE</li>
          <li>Manter proteína alta 1.6-2g/kg na manutenção</li>
          <li>Treino de força: preserva metabolismo</li>
          <li>Intervalo de peso: 2-3kg ("se passar de X+3kg: voltar")</li>
          <li>Identidade: "Sou saudável" vs "Estou de dieta"</li>
        </ol>
      </div>
    ),
  },
  {
    id: "sindrome-metabolica",
    title: "Síndrome Metabólica & Resistência Insulínica",
    icon: <Activity className="w-4 h-4 text-destructive" />,
    badge: "Módulo 2",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground">Critérios IDF (3 de 5):</p>
        <ul className="list-disc pl-4 space-y-1">
          <li>Obesidade abdominal: H &gt; 94cm / M &gt; 80cm</li>
          <li>Triglicerídeos &gt; 150mg/dL</li>
          <li>HDL baixo: H &lt; 40 / M &lt; 50</li>
          <li>PA ≥ 130/85 mmHg</li>
          <li>Glicemia jejum ≥ 100mg/dL</li>
        </ul>
        <p>Prevalência BR: 30-35% adultos. Risco DM2: 5x. Risco CV: 2-3x.</p>

        <p className="font-bold text-foreground">HOMA-IR — Classificação:</p>
        <InfoTable
          headers={["HOMA-IR", "Classificação"]}
          rows={[
            ["< 2.5", "Normal"],
            ["2.5 – 3.5", "Resistência leve"],
            ["3.5 – 5.0", "Resistência moderada"],
            ["> 5.0", "Resistência severa"],
          ]}
        />

        <p className="font-bold text-foreground">Estratégias para reduzir insulina:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li><strong className="text-foreground">Low glycemic index:</strong> não eliminar carb, escolher melhor</li>
          <li><strong className="text-foreground">Jejum 16:8:</strong> janela sem comida = insulina baixa por mais tempo</li>
          <li><strong className="text-foreground">Ordem das refeições:</strong> fibra/proteína/gordura ANTES do carb = -40-60% pico glicêmico</li>
          <li><strong className="text-foreground">Vinagre de maçã:</strong> 1-2 colheres antes de refeições = -20-35% pico</li>
          <li><strong className="text-foreground">Caminhada pós-refeição:</strong> 10-15min = -30-50% pico glicêmico</li>
        </ol>

        <p className="font-bold text-foreground">Suplementação — Stack Base:</p>
        <InfoTable
          headers={["Suplemento", "Dose", "Efeito"]}
          rows={[
            ["Berberina", "500mg 3x/dia", "HOMA-IR -30-50% em 12sem"],
            ["Ômega-3", "4g EPA+DHA/dia", "TG -25-35%, anti-inflamatório"],
            ["Magnésio glicinato", "400mg/dia", "Cofator 300 reações"],
            ["Vitamina D3", "5000UI/dia", "Receptor VDR em cél. beta"],
            ["Zinco", "30mg/dia", "Síntese insulina"],
            ["Cromo Picolinato", "400-1000mcg/dia", "Receptor insulínico"],
          ]}
        />

        <p className="font-bold text-foreground">Stack avançado (casos resistentes):</p>
        <p>Inositol (Myo + D-Chiro 40:1) • Banaba 48mg 2x • Gymnema 400mg 2x • ALA 300-600mg • CoQ10 200mg • NAC 600mg 2x</p>

        <p className="font-bold text-foreground">Exercício para SM:</p>
        <InfoTable
          headers={["Tipo", "Frequência", "Por quê"]}
          rows={[
            ["Treino de força", "3x/sem", "Músculo = maior captação de glicose (GLUT4)"],
            ["Caminhada", "7-10k passos/dia", "NEAT + -11% mortalidade/1000 passos"],
            ["HIIT", "2x/sem máx", "GLUT4 upregulation potente"],
          ]}
        />
      </div>
    ),
  },
  {
    id: "nutricao-comportamental",
    title: "Nutrição Comportamental",
    icon: <Brain className="w-4 h-4 text-primary" />,
    badge: "Módulo 3",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground">Tipos de Fome:</p>
        <InfoTable
          headers={["Tipo", "Aparece", "Característica", "Comer resolve?"]}
          rows={[
            ["Física", "Gradualmente", "Qualquer comida satisfaz", "Sim"],
            ["Emocional", "Subitamente", "Específica (chocolate, etc)", "Não (+ culpa)"],
            ["Ocular/olfativa", "Ao ver/sentir", "Visual ou olfativa", "Parcialmente"],
            ["Social", "Em grupo", "Grupo comendo", "Temporário"],
            ["Tédio", "Sem atividade", "Nada para fazer", "Não"],
          ]}
        />

        <p className="font-bold text-foreground">Mindful Eating — 5 Regras:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li><strong className="text-foreground">Sentar sempre:</strong> cérebro não registra calorias "de pé" — saciedade -30-40%</li>
          <li><strong className="text-foreground">Sem telas:</strong> distração = +30-50% calorias (Higgs 2012)</li>
          <li><strong className="text-foreground">Pausar no meio:</strong> avaliar saciedade 0-10 após metade do prato</li>
          <li><strong className="text-foreground">Mastigar 20-30x:</strong> grelina cai mais com mastigação adequada</li>
          <li><strong className="text-foreground">Mesa:</strong> contexto = saciedade (não no sofá/cama)</li>
        </ol>

        <p className="font-bold text-foreground">Estratégias comportamentais avançadas:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Implementation intention:</strong> "Quando X acontecer, farei Y" — mais eficaz que força de vontade</li>
          <li><strong className="text-foreground">Temptation bundling:</strong> podcast favorito só durante caminhada</li>
          <li><strong className="text-foreground">Friction aumentada:</strong> junk food em armário difícil de alcançar</li>
          <li><strong className="text-foreground">Friction reduzida:</strong> frutas visíveis, snacks pré-cortados</li>
          <li><strong className="text-foreground">Decisões antecipadas:</strong> decidir quando não está com fome</li>
        </ul>

        <p className="font-bold text-foreground">Alimentação Intuitiva — 10 Princípios (Tribole & Resch):</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Rejeitar mentalidade de dieta</li>
          <li>Honrar a fome</li>
          <li>Fazer as pazes com a comida</li>
          <li>Desafiar o policial alimentar</li>
          <li>Sentir a saciedade</li>
          <li>Descobrir o fator satisfação</li>
          <li>Lidar com emoções sem comida</li>
          <li>Respeitar o corpo</li>
          <li>Exercício — sentir a diferença</li>
          <li>Nutrição gentil</li>
        </ol>

        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-destructive">⚠️ Compulsão alimentar — quando encaminhar:</p>
          <p>BED diagnosticado → psicólogo/psiquiatra. Purga → encaminhamento urgente. Restrição &lt;1000kcal → encaminhamento. Não prescrever dieta restritiva (piora).</p>
          <p className="mt-1">Suplementação: 5-HTP 100-200mg noite • NAC 600mg 2x • Zinco 30mg • Magnésio 400mg • Ashwagandha 600mg</p>
        </div>
      </div>
    ),
  },
  {
    id: "saude-masculina",
    title: "Saúde Masculina Completa (35-65 anos)",
    icon: <Shield className="w-4 h-4 text-blue-500" />,
    badge: "Módulo 4",
    badgeColor: "text-blue-500 border-blue-500/30",
    content: (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-foreground">Crise silenciosa:</p>
          <p>Testosterona média: queda 1%/ano após 30. Homens de 40 em 2020 têm T 20-25% menor que em 1980. Causas: obesidade, estresse, disruptores endócrinos, sedentarismo, sono ruim.</p>
        </div>

        <p className="font-bold text-foreground">Sintomas de deficiência de T:</p>
        <p><strong className="text-foreground">Físicos:</strong> fadiga, perda muscular, gordura abdominal, ginecomastia</p>
        <p><strong className="text-foreground">Sexuais:</strong> libido reduzida, DE, ejaculação reduzida</p>
        <p><strong className="text-foreground">Psicológicos:</strong> depressão, brain fog, irritabilidade, baixa motivação</p>

        <p className="font-bold text-foreground">Protocolo natural para otimizar T:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li><strong className="text-foreground">Sono 7-9h:</strong> T produzida no REM; cada hora perdida = -15% T</li>
          <li><strong className="text-foreground">Perder gordura:</strong> -10% BF = T eleva 15-25% (gordura = aromatase)</li>
          <li><strong className="text-foreground">Treino de força:</strong> compostos pesados elevam T basal</li>
          <li><strong className="text-foreground">Alimentação:</strong> gordura saturada moderada, zinco, vitamina D, magnésio</li>
          <li><strong className="text-foreground">Estresse:</strong> cortisol e T = relação inversa</li>
        </ol>

        <p className="font-bold text-foreground">Stack suplementar natural para T:</p>
        <InfoTable
          headers={["Suplemento", "Dose", "Timing"]}
          rows={[
            ["Vitamina D3", "5000UI", "Manhã c/ gordura"],
            ["Zinco Picolinato", "30mg", "Manhã"],
            ["Ashwagandha KSM-66", "600mg", "Manhã"],
            ["Tongkat Ali", "400mg", "Manhã"],
            ["Fadogia Agrestis", "600mg", "Manhã"],
            ["Boro", "10mg", "Tarde (reduz SHBG)"],
            ["Magnésio", "400mg", "Noite"],
          ]}
        />
        <p>Resultado esperado: T pode elevar 150-300 ng/dL em 3-6 meses com protocolo completo.</p>

        <p className="font-bold text-foreground">TRT — quando indicar:</p>
        <p>T total &lt; 300 ng/dL COM sintomas • T livre &lt; 9 pg/mL • Falha protocolo natural 6 meses • Protocolo: Cipionato 100-200mg/sem dividido 2x + HCG 500-1000UI 2x/sem</p>

        <p className="font-bold text-foreground">Disfunção Erétil — Stack suplementar:</p>
        <p>L-Citrulina 6g + Pycnogenol 120mg + Zinco 30mg + Vitamina D 5000UI + Ashwagandha 600mg + Maca preta 3g</p>

        <p className="font-bold text-foreground">Saúde prostática preventiva:</p>
        <p>Saw Palmetto 320mg • Licopeno 10-15mg • Beta-sitosterol 60-130mg • Selênio 200mcg • Pygeum 100mg</p>
        <p className="italic">Ejaculação frequente (21x/mês): -20% risco câncer próstata (Harvard 2004/2016)</p>
      </div>
    ),
  },
  {
    id: "saude-feminina",
    title: "Saúde Feminina Completa (25-55 anos)",
    icon: <Heart className="w-4 h-4 text-pink-500" />,
    badge: "Módulo 5",
    badgeColor: "text-pink-500 border-pink-500/30",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground">Perimenopausa — O período mais esquecido (35-50 anos):</p>
        <p>Duração 4-10 anos. Frequentemente diagnosticada erroneamente como depressão, ansiedade ou burnout.</p>
        <p className="font-semibold text-foreground">Sintomas:</p>
        <p>Ciclos irregulares • Insônia (3-4h da manhã) • Ansiedade nova • Brain fog • Ganho abdominal • Palpitações • Libido reduzida • Fogachos • Dores articulares</p>
        <p className="italic">Progesterona declina primeiro (35-40); estrogênio fica errático — a flutuação causa os sintomas.</p>

        <p className="font-bold text-foreground">Protocolo Perimenopausa:</p>
        <InfoTable
          headers={["Intervenção", "Dose", "Efeito"]}
          rows={[
            ["Isoflavonas de soja", "40-80mg/dia", "Fogachos -40-50%"],
            ["Black Cohosh", "40-80mg/dia", "Fogachos, suores noturnos"],
            ["Ashwagandha", "600mg 2x/dia", "Ansiedade, cortisol, tireoide"],
            ["Rhodiola", "400mg manhã", "Energia e humor"],
            ["Proteína", "2-2.5g/kg", "Preservar massa magra"],
            ["Cálcio + D3 + K2", "1200mg + 5000UI + 200mcg", "Ossos"],
            ["Magnésio", "400-600mg/dia", "Sono, humor, dores"],
            ["Ômega-3", "3-4g/dia", "Anti-inflamatório, humor"],
          ]}
        />

        <p className="font-bold text-foreground">TRH bioidêntica ideal:</p>
        <p>Estradiol gel transdérmico 1-2mg/dia (não oral) • Progesterona micronizada 100-200mg/noite (não progestina) • Testosterona gel 0.5-1mg/dia</p>
        <div className="bg-primary/5 border border-primary/20 rounded p-2">
          <p className="text-foreground font-semibold">Mito derrubado:</p>
          <p>Estrogênio bioidêntico + progesterona micronizada: risco de câncer de mama NÃO aumentado. O risco do WHI era com progestina sintética + estrogênio de égua.</p>
        </div>

        <p className="font-bold text-foreground">Menopausa — Adaptações obrigatórias:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Metabolismo:</strong> TMB -10-15%, gordura redistribui ao abdômen → proteína alta + força + menos carb refinado</li>
          <li><strong className="text-foreground">Ossos:</strong> -3-5% massa/ano nos primeiros 5 anos → DEXA anual, exercício de impacto, Ca+D3+K2</li>
          <li><strong className="text-foreground">Cardiovascular:</strong> pós-menopausa = risco iguala homem → Mediterrânea + Ômega-3</li>
          <li><strong className="text-foreground">Cerebral:</strong> TRH antes de 10 anos pós-menopausa = neuroprotetor</li>
        </ul>

        <p className="font-bold text-foreground">Gestação — Suplementação essencial:</p>
        <p>L-Metilfolato 400-800mcg (3 meses ANTES) • Ferro bisglicinato 27-60mg • Cálcio 1000mg • D3 2000-4000UI • DHA 200-300mg • Iodo 220mcg • Zinco 15mg • B12 1000mcg (vegetarianas) • Probióticos</p>

        <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
          <p className="font-bold text-destructive">⚠️ Evitar na gestação:</p>
          <p>Vitamina A &gt;10.000UI (teratogênica) • Valeriana, cohosh, dong quai • Peixes com mercúrio alto • Queijos não pasteurizados • Álcool zero • Cafeína &lt;200mg</p>
        </div>
      </div>
    ),
  },
  {
    id: "idoso-sarcopenia",
    title: "Saúde do Idoso & Sarcopenia",
    icon: <Users className="w-4 h-4 text-amber-500" />,
    badge: "Módulo 6",
    badgeColor: "text-amber-500 border-amber-500/30",
    content: (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-foreground">Sarcopenia — A epidemia silenciosa</p>
          <p>Prevalência: 10% aos 60 → 50% aos 80. Consequências: quedas, fraturas, perda de independência, morte prematura.</p>
        </div>

        <p className="font-bold text-foreground">Diagnóstico (EWGSOP2):</p>
        <p>Força preensão: H &lt; 27kg, M &lt; 16kg • Marcha &lt; 0.8m/s • Sentar-levantar &gt; 15s (5x)</p>

        <p className="font-bold text-foreground">Proteína no idoso — Resistência Anabólica:</p>
        <InfoTable
          headers={["Perfil", "Proteína g/kg/dia", "Leucina"]}
          rows={[
            ["Saudável", "1.2-1.6", "2.5g/refeição"],
            ["Com sarcopenia", "1.8-2.2", "3g/refeição"],
            ["Hospitalizado", "2.0-2.5", "3g/refeição"],
          ]}
        />
        <p className="italic">Distribuição: 4-5 refeições com 30-40g proteína CADA (não concentrar no almoço)</p>

        <p className="font-bold text-foreground">Suplementação — deficiências quase universais:</p>
        <InfoTable
          headers={["Suplemento", "Dose", "Por quê"]}
          rows={[
            ["Vitamina D3", "5000-10000UI", "Síntese cutânea reduzida"],
            ["B12 metilcobalamina", "1000mcg sublingual", "Absorção reduz com idade"],
            ["Creatina", "5g/dia", "MAIS importante que para atletas"],
            ["Magnésio", "400-600mg", "Cofator universal"],
            ["Ômega-3", "3-4g EPA+DHA", "Anti-inflamatório (inflammaging)"],
            ["Colágeno hidrolisado", "15-20g", "Articulações, ossos, pele"],
            ["CoQ10 Ubiquinol", "200-400mg", "Absorção de ubiquinona reduz"],
            ["Zinco", "30mg", "Imunidade, cognição"],
          ]}
        />

        <p className="font-bold text-foreground">Protocolo de reversão — 12 semanas:</p>
        <div className="bg-primary/5 border border-primary/20 rounded p-3">
          <p><strong className="text-foreground">Treino:</strong> Força 3x/sem (progressivo!) + caminhada 30min/dia + equilíbrio 10min/dia</p>
          <p><strong className="text-foreground">Nutrição:</strong> Proteína 2g/kg + leucina + creatina 5g + D3 5000UI + Ômega-3 4g</p>
          <p className="font-semibold text-foreground mt-2">Resultado: +20-40% força, +1-2kg massa muscular, funcionalidade recuperada</p>
          <p className="italic">É possível reverter sarcopenia até 95% — inclusive após 90 anos (Fiatarone, Harvard 1994)</p>
        </div>

        <p className="font-bold text-foreground">Hidratação no idoso:</p>
        <p>Percepção de sede REDUZIDA → beber de hora em hora independente da sede • 30ml/kg mínimo • Monitorar cor da urina</p>
      </div>
    ),
  },
  {
    id: "saude-mental",
    title: "Saúde Mental & Psiconutrição",
    icon: <Smile className="w-4 h-4 text-violet-500" />,
    badge: "Módulo 7",
    badgeColor: "text-violet-500 border-violet-500/30",
    content: (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded p-3">
          <p className="italic">"O que você come afeta como pensa. Como pensa afeta o que come." — Dr. Uma Naidoo (Harvard)</p>
          <p className="mt-1">SMILES Trial 2017: dieta Mediterrânea reduziu depressão 30% vs 8% controle social.</p>
        </div>

        <p className="font-bold text-foreground">Depressão — Mecanismos e nutrientes:</p>
        <InfoTable
          headers={["Nutriente", "Dose", "Evidência"]}
          rows={[
            ["Ômega-3 (EPA)", "≥1g EPA/dia", "Meta-análise positiva; EPA > DHA para depressão"],
            ["Zinco", "25-30mg", "Deficiente em 40% dos deprimidos"],
            ["Magnésio", "248mg/dia", "Efeito similar SSRI (estudo pequeno)"],
            ["Vitamina D", "5000UI", "Deficiência severa = +65% risco"],
            ["B12 + Folato", "Adequar", "Cofatores de SAMe → neurotransmissores"],
            ["Probióticos", "L. helveticus + B. longum", "Ansiedade e depressão reduzidas"],
          ]}
        />

        <p className="font-bold text-foreground">Ansiedade — Protocolo suplementar:</p>
        <p>Ashwagandha 600mg 2x (reduz ansiedade 40-56%) • L-Teanina 200-400mg 2x • Magnésio 400-600mg • Lavanda oral (Silexan 80mg — comparável ao lorazepam) • GABA PharmaGABA 100-200mg</p>
        <p className="italic">Eliminar: cafeína excessiva (&lt;100mg), álcool, açúcar, jejum prolongado</p>

        <p className="font-bold text-foreground">Burnout — Protocolo de recuperação:</p>
        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p><strong className="text-foreground">Imediato (sem 1-4):</strong> Parar/reduzir carga, sono 8-9h, remover cafeína/álcool</p>
          <p><strong className="text-foreground">Suporte (sem 1-12):</strong> Ashwagandha Sensoril 500mg 2x • Rhodiola 400mg • Fosfatidilserina 400mg • Magnésio 600mg • Ômega-3 4g • NAC 600mg 2x</p>
          <p><strong className="text-foreground">Exercício:</strong> NÃO HIIT. SIM: caminhada na natureza, yoga restaurativo, natação leve, tai chi</p>
          <p className="italic">Natureza: cortisol -12% após 20min em floresta (shinrin-yoku)</p>
        </div>

        <p className="font-bold text-foreground">TDAH & Nutrição:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Eliminar:</strong> corantes artificiais (vermelho 40, amarelo 5/6), açúcar em excesso, ultra-processados</li>
          <li><strong className="text-foreground">Proteína no café:</strong> tirosina → dopamina (estabiliza foco matinal)</li>
          <li><strong className="text-foreground">Ferro:</strong> se ferritina &lt;30 → bisglicinato 30-60mg</li>
          <li><strong className="text-foreground">Ômega-3 EPA+DHA:</strong> 2-4g/dia (meta-análise: reduz sintomas)</li>
          <li><strong className="text-foreground">Phosphatidylserine:</strong> 200-400mg/dia</li>
        </ul>

        <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
          <p className="font-bold text-destructive">⚠️ Encaminhar psicólogo/psiquiatra:</p>
          <p>Ideação suicida • Incapacidade total &gt;2 semanas • Dependência substâncias • Sem melhora 6-8 semanas</p>
        </div>
      </div>
    ),
  },
  {
    id: "doencas-cronicas",
    title: "Nutrição para Doenças Crônicas",
    icon: <HeartPulse className="w-4 h-4 text-red-500" />,
    badge: "Módulo 8",
    badgeColor: "text-red-500 border-red-500/30",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground text-sm">A. Diabetes Tipo 2</p>
        <div className="bg-primary/5 border border-primary/20 rounded p-2">
          <p className="italic">"DM2 é doença de excesso de glicose na dieta. A solução é óbvia." — Dr. Jason Fung</p>
        </div>
        <p className="font-semibold text-foreground">Metas ótimas:</p>
        <p>Glicemia jejum &lt;90 • HbA1c &lt;5.7% • Pós-prandial 2h &lt;120 • HOMA-IR &lt;2.0</p>
        <InfoTable
          headers={["Estratégia", "Eficácia", "Observação"]}
          rows={[
            ["Low Carb (<130g/dia)", "HbA1c -1-2%", "Superior à dieta low-fat tradicional"],
            ["Cetogênica (<50g/dia)", "Remissão 30-50%", "Virta Health: 50% reversão em 1 ano"],
            ["Jejum terapêutico", "Reset insulínico", "Supervisão médica obrigatória"],
          ]}
        />
        <p className="font-semibold text-foreground">Suplementação DM2:</p>
        <p>Berberina 500mg 3x • Inositol Myo+D-Chiro • Banaba 48mg 2x • Cromo 400-1000mcg • ALA 600mg • Magnésio 400-600mg • Cúrcuma BCM-95 1g 2x</p>

        <p className="font-bold text-foreground text-sm mt-4">B. Hipertensão</p>
        <p className="font-semibold text-foreground">DASH modificada:</p>
        <p>Sódio &lt;1500-2000mg • Potássio 4-5g • Magnésio 400-600mg • Nitrato (beterraba, rúcula) • Ômega-3 4g/dia</p>
        <InfoTable
          headers={["Suplemento", "Dose", "Efeito na PA"]}
          rows={[
            ["Extrato de oliveira", "500mg 2x", "Sistólica -11mmHg"],
            ["CoQ10", "200-400mg", "Sistólica -17mmHg (meta-análise)"],
            ["Alho envelhecido", "1200mg", "Sistólica -5-8mmHg"],
            ["Pycnogenol", "200mg", "Vasodilatação (NO)"],
            ["Vitamina K2", "200mcg", "Flexibilidade vascular"],
          ]}
        />
        <p className="text-[10px] italic">Medicações que causam ganho de peso: Beta-bloqueadores (+2-5kg), Amlodipino (retenção hídrica), alguns diuréticos (RI)</p>

        <p className="font-bold text-foreground text-sm mt-4">C. Hipotireoidismo & Hashimoto</p>
        <p>TSH ideal: 0.5-2.0 (não apenas "normal" até 4.5). Levotiroxina: jejum, 30-60min antes do café. NÃO tomar com: cálcio, ferro, soja, fibra (-20-40% absorção).</p>

        <p className="font-bold text-foreground text-sm mt-4">D. Doenças Autoimunes — Protocolo AIP</p>
        <p className="font-semibold text-foreground">Fase eliminação (30-90 dias):</p>
        <p><strong className="text-foreground">Eliminar:</strong> glúten, laticínios (caseína A1), grãos, leguminosas, ovos, solanáceas</p>
        <p><strong className="text-foreground">Manter:</strong> carnes/peixes, vegetais (exceto sombras), frutas, gorduras saudáveis, osso/cartilagem, fermentados</p>
        <p className="font-semibold text-foreground">Suplementação autoimune:</p>
        <p>D3 10000UI • Ômega-3 6g • Vitamina A 10000UI • Selênio 200mcg • Zinco 30-50mg • Curcumina BCM-95 1g 3x • Boswellia AKBA 250mg 2x • Glutamina 15g/dia</p>
        <p className="italic">Reintrodução: um alimento por vez, 3 dias, monitorar sintomas.</p>

        <p className="font-bold text-foreground text-sm mt-4">E. Esteatose Hepática (Fígado Gorduroso)</p>
        <p>Prevalência: 25-30% adultos. Frequentemente silenciosa. Diagnóstico: ALT/AST elevadas + US abdominal + FibroScan.</p>
        <div className="bg-muted/30 rounded p-3 space-y-1">
          <p className="font-semibold text-foreground">Protocolo de reversão:</p>
          <p>• Perda de 7-10% peso: reverte em 90% dos casos</p>
          <p>• Frutose: ELIMINAR (metabolizada 100% no fígado → lipogênese)</p>
          <p>• Álcool: ZERO (mesmo doses leves pioram)</p>
          <p>• Cafeína: 2-4 xícaras café/dia = hepatoprotetor (evidência forte)</p>
        </div>
        <p className="font-semibold text-foreground">Suplementação esteatose:</p>
        <p>TUDCA 500-1000mg • NAC 600mg 2x • Siliphos 240mg 2x • Vitamina E 800UI (AASLD guideline) • Betaína TMG 3g • Colina 1-2g • Berberina 500mg 3x</p>

        <p className="font-bold text-foreground text-sm mt-4">F. Doença Renal Crônica (DRC)</p>
        <div className="bg-destructive/10 border border-destructive/30 rounded p-2">
          <p className="font-bold text-destructive">⚠️ CRÍTICO: Proteína na DRC é completamente diferente</p>
        </div>
        <InfoTable
          headers={["Estágio DRC", "TFG", "Proteína g/kg/dia"]}
          rows={[
            ["1-2", "> 60", "Sem restrição"],
            ["3", "30-59", "0.8"],
            ["4", "15-29", "0.6-0.8"],
            ["5 / Diálise", "< 15", "1.2-1.4 (diálise remove proteína)"],
          ]}
        />
        <p className="italic">NUNCA prescrever alta proteína sem saber estágio. Solicitar: creatinina + TFG + albumina. Restringir potássio e fósforo conforme estágio.</p>

        <div className="bg-destructive/10 border border-destructive/30 rounded p-2 mt-2">
          <p className="font-bold text-destructive">⚠️ Encaminhamento urgente:</p>
          <p>HbA1c &gt;9% sem tratamento • Glicemia &gt;300 • Cetoacidose • Hipoglicemia severa &lt;50</p>
        </div>
      </div>
    ),
  },
  {
    id: "longevidade",
    title: "Longevidade para Pessoas Comuns",
    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
    badge: "Módulo 9",
    badgeColor: "text-emerald-500 border-emerald-500/30",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground">5 Pilares da Longevidade (Peter Attia):</p>
        <InfoTable
          headers={["Pilar", "Por quê", "Prioridade"]}
          rows={[
            ["Exercício", "VO2max = melhor preditor de longevidade", "Mais importante isoladamente"],
            ["Sono", "Crônico < 6h = +50% risco mortalidade", "7-9h mínimo"],
            ["Nutrição", "Mediterrânea = mais estudada positivamente", "Sem ultra-processados"],
            ["Saúde mental", "Solidão = +50% mortalidade (= 15 cigarros/dia)", "Conexão social"],
            ["Suplementos", "D3, Ômega-3, Mg = evidência forte", "NMN/NR/Rapamicina = emergente"],
          ]}
        />

        <p className="font-bold text-foreground">Dieta Mediterrânea — Padrão Ouro:</p>
        <p>PREDIMED study: -30% eventos CV. Reduz: DCV, DM2, câncer, demência, depressão. MAIOR aderência de todas as dietas.</p>
        <div className="bg-muted/30 rounded p-3 space-y-1">
          <p className="font-semibold text-foreground">Componentes chave:</p>
          <p>• Azeite AOVE: 4+ colheres/dia (gordura principal)</p>
          <p>• Vegetais 5-7 porções • Frutas 2-4 porções</p>
          <p>• Leguminosas 4-7x/sem • Peixe 2-3x/sem</p>
          <p>• Nozes: punhado/dia • Carne vermelha: &lt;1x/sem</p>
          <p>• Álcool: "não existe dose saudável" (AHA 2023)</p>
        </div>

        <p className="font-bold text-foreground">Zonas Azuis — Lições Práticas:</p>
        <p className="text-[10px]">Sardegna • Okinawa • Nicoya • Icária • Loma Linda</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li><strong className="text-foreground">Movimento natural:</strong> não academia, vida ativa (jardinar, caminhar)</li>
          <li><strong className="text-foreground">Propósito (Ikigai):</strong> pessoas com propósito vivem 7 anos mais</li>
          <li><strong className="text-foreground">Baixo estresse:</strong> sesta, oração, natureza</li>
          <li><strong className="text-foreground">Hara Hachi Bu:</strong> parar quando 80% satisfeito</li>
          <li><strong className="text-foreground">Plant-forward:</strong> feijão como base proteica</li>
          <li><strong className="text-foreground">Tribo:</strong> pertencer a comunidade com saúde positiva</li>
          <li><strong className="text-foreground">Família:</strong> avós na casa (anti-solidão)</li>
        </ol>

        <p className="font-bold text-foreground">Medicina Preventiva — Exames por Faixa Etária:</p>
        <InfoTable
          headers={["Idade", "Exames essenciais"]}
          rows={[
            ["20-30", "Hemograma, lipidograma, glicemia+insulina, TSH, Vit D, ferritina, PA"],
            ["30-40", "+ HOMA-IR, PCR-us, homocisteína, testosterona(H), hormônios(M)"],
            ["40-50", "+ Colonoscopia, cálcio coronário, PSA(H), mamografia(M), DEXA(M)"],
            ["50-60+", "+ Colonoscopia 5-10a, doppler carotídeo, avaliação cognitiva, oftalmologia"],
          ]}
        />
      </div>
    ),
  },
  {
    id: "nutricao-pratica",
    title: "Nutrição Prática para Vida Real",
    icon: <ShoppingCart className="w-4 h-4 text-primary" />,
    badge: "Módulo 10",
    content: (
      <div className="space-y-4">
        <p className="font-bold text-foreground">Meal Prep — Sistema de 3 Etapas (2h no domingo):</p>
        <InfoTable
          headers={["Etapa", "Tempo", "O que preparar"]}
          rows={[
            ["1. Proteínas", "40min", "Frango 1kg assado • 12 ovos cozidos • Patinho grelhado"],
            ["2. Carboidratos", "30min", "Arroz integral 500g • Batata doce 1kg assada • Aveia porcionada"],
            ["3. Vegetais", "30min", "Legumes assados mix • Salada lavada/seca • Crus cortados"],
          ]}
        />
        <p className="italic">Resultado: 4-5 refeições/dia por 4-5 dias. Montagem diária: 10-15min.</p>

        <p className="font-bold text-foreground">Comer Fora — Protocolo:</p>
        <div className="bg-muted/30 rounded p-3 space-y-1">
          <p className="font-semibold text-foreground">No restaurante:</p>
          <p>1. Água (não suco) • 2. Salada primeiro (fibra = pico menor)</p>
          <p>3. Proteína como centro • 4. Carb: metade da porção</p>
          <p>5. Molho à parte (200-400kcal ocultas) • 6. Sem pão da cesta</p>
          <p className="font-semibold text-foreground mt-2">Fast food (inevitável):</p>
          <p>Sem molho especial • Grelhado &gt; frito • Salada &gt; batata frita • Tamanho médio</p>
        </div>

        <p className="font-bold text-foreground">Rotulagem — Como Ler:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Ingredientes:</strong> ordem = maior para menor; açúcar nos top 3 = muito açucarado</li>
          <li><strong className="text-foreground">Açúcar disfarçado:</strong> xarope de milho, maltose, dextrose, concentrado de suco, agave</li>
          <li><strong className="text-foreground">Gordura trans:</strong> "0g" mas "parcialmente hidrogenada" nos ingredientes = mentira (&lt;0.5g/porção)</li>
          <li><strong className="text-foreground">Semáforo:</strong> 🟢 ingredientes reconhecíveis | 🟡 alguns artificiais | 🔴 açúcar top 3 + trans + &gt;5 artificiais</li>
        </ul>

        <p className="font-bold text-foreground">Orçamento — Alimentação Saudável Barata:</p>
        <InfoTable
          headers={["Categoria", "Melhores opções custo-benefício"]}
          rows={[
            ["Proteína", "Ovos (mais barata/g), sardinha/atum lata, frango c/ osso, feijão/lentilha"],
            ["Carboidrato", "Arroz integral, aveia, batata doce, mandioca, banana"],
            ["Vegetais", "Couve/espinafre/agrião, cenoura, beterraba, tomate, cebola/alho"],
            ["Gordura", "Ovo inteiro, amendoim/pasta, sardinha, leite integral"],
            ["Suplementos", "D3 (mais barata+importante), Mg óxido, creatina genérica, whey concentrado"],
          ]}
        />
      </div>
    ),
  },
  {
    id: "criancas-adolescentes-atletas",
    title: "Crianças & Adolescentes Atletas",
    icon: <GraduationCap className="w-4 h-4 text-sky-500" />,
    badge: "Módulo 11",
    badgeColor: "text-sky-500 border-sky-500/30",
    content: (
      <div className="space-y-4">
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-destructive">⚠️ AVISO CRÍTICO — Erros nesta fase são frequentemente irreversíveis:</p>
          <p>Fechamento precoce de epífise (AAS) = altura permanentemente reduzida • Transtorno alimentar = sequelas por décadas • Burnout precoce = abandono definitivo • Lesão por overuse = dano permanente • Pressão excessiva = trauma psicológico duradouro</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground mb-1">Filosofia APEX</p>
          <p className="italic">"A criança não é um adulto em miniatura. Cada fase do desenvolvimento tem necessidades únicas que, se respeitadas, constroem o atleta mais durável e saudável possível. Se ignoradas, destroem antes de florescer."</p>
          <p className="text-[10px] mt-1">Referências: AAP • NSCA • ACSM • Dr. Avery Faigenbaum • Dr. Jean Côté (DMSP) • Dr. Lyle Micheli • Dr. Timothy Hewett</p>
        </div>

        {/* MÓDULO 1 — Desenvolvimento por Fase */}
        <p className="font-bold text-foreground text-sm">📊 Desenvolvimento Atlético por Fase (DMSP)</p>
        <InfoTable
          headers={["Fase", "Idade", "Esportes", "Ênfase", "Objetivo"]}
          rows={[
            ["1 — Amostragem", "6-12 anos", "3-5 diferentes", "DIVERSÃO e participação", "Desenvolvimento motor amplo"],
            ["2 — Especialização", "13-15 anos", "2-3 esportes", "Desenvolvimento + competição", "Identificar primário"],
            ["3 — Investimento", "16+ anos", "1 primário", "Periodização avançada", "Objetivos competitivos"],
          ]}
        />
        <p className="font-semibold text-foreground">Janelas de desenvolvimento:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">6-8 anos:</strong> velocidade, agilidade, equilíbrio (SNC altamente plástico)</li>
          <li><strong className="text-foreground">8-12 anos:</strong> coordenação motora — "Golden Age" (aprender técnica agora = mais fácil que qualquer outra fase)</li>
          <li><strong className="text-foreground">10-12 anos:</strong> início de potência e resistência</li>
        </ul>

        {/* MÓDULO 2 — Fisiologia */}
        <p className="font-bold text-foreground text-sm">🧬 Fisiologia do Jovem Atleta</p>
        <p className="font-semibold text-foreground">Diferenças fundamentais vs adulto:</p>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">Placa Epifisária (cartilagem de crescimento):</p>
          <p>Ponto mais fraco do esqueleto (mais fraco que ligamentos/tendões). Fecha: meninas ~14-15 / meninos ~16-18 anos. Sobrecarga excessiva → Lesão de Salter-Harris (fratura de crescimento) → crescimento assimétrico ou interrompido.</p>
          <p className="mt-1"><strong className="text-foreground">Implicações:</strong> evitar impacto excessivo repetitivo • proibir 1RM até fechamento • Osgood-Schlatter muito comum 10-15 anos</p>
        </div>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">Densidade Óssea na Adolescência:</p>
          <p>40-60% da massa óssea adulta formada nessa fase. Pico de massa óssea: 25-30 anos. O que constrói: impacto, carga, vitamina D, cálcio. O que destrói: Tríade da Atleta Feminina.</p>
        </div>

        <InfoTable
          headers={["Sistema", "Característica", "Implicação"]}
          rows={[
            ["Cardiovascular", "FC max similar, VO2max menor por kg até puberdade", "Recuperação SUPERIOR — mais rápido entre esforços"],
            ["Nervoso", "Plasticidade neural MÁXIMA até 12-13 anos", "Priorizar TÉCNICA — 'Golden Age of Motor Learning'"],
            ["Endócrino pré-puberal", "T e E2 muito baixos — ganho de força via neural", "Não forçar hipertrofia — benefício: coordenação, técnica, osso"],
            ["Endócrino puberdade", "Explosão GH, IGF-1, T(M), E2(F) — 8-12cm/ano", "Maior vulnerabilidade a lesões (osso cresce mais rápido que músculo)"],
          ]}
        />

        {/* MÓDULO 3 — Nutrição */}
        <p className="font-bold text-foreground text-sm">🍎 Nutrição para o Jovem Atleta</p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="italic">"A nutrição serve 3 objetivos SIMULTÂNEOS: 1) Crescimento normal 2) Performance 3) Recuperação. Sacrificar qualquer um é erro com consequências permanentes."</p>
        </div>

        <p className="font-bold text-foreground">Necessidades calóricas:</p>
        <InfoTable
          headers={["Faixa", "Meninos", "Meninas"]}
          rows={[
            ["6-9 anos ativos", "2200-2600 kcal", "2000-2400 kcal"],
            ["10-13 anos ativos", "2600-3200 kcal", "2200-2800 kcal"],
            ["14-17 anos atletas", "3200-5000+ kcal", "2600-4000 kcal"],
          ]}
        />

        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-destructive">⚠️ Sinais de ingestão insuficiente:</p>
          <p>Fadiga crônica • Crescimento abaixo do esperado • Atraso puberal • Performance em declínio • Humor irritável • Lesões frequentes • Amenorreia (meninas) = alarme máximo • Doença frequente</p>
        </div>

        <p className="font-bold text-foreground">Proteína:</p>
        <InfoTable
          headers={["Nível", "Necessidade (g/kg)"]}
          rows={[
            ["Sedentário", "0.85-1.0 (RDA)"],
            ["Atleta moderado", "1.2-1.6"],
            ["Atleta intenso", "1.6-2.0"],
            ["Atleta elite", "1.8-2.2"],
          ]}
        />
        <p>4-5 refeições com proteína • Mín 20g por refeição principal • Fontes ideais: leite integral, chocolate milk pós-treino, ovos, frango, peixe, leguminosas</p>

        <p className="font-bold text-foreground">Carboidrato — O combustível do crescimento:</p>
        <p className="text-destructive font-semibold">NÃO fazer low carb ou cetogênica em jovens atletas!</p>
        <InfoTable
          headers={["Nível", "Carb (g/kg/dia)"]}
          rows={[
            ["Moderado", "4-6"],
            ["Intenso", "6-8"],
            ["Competição", "8-10"],
          ]}
        />
        <p>Nunca treinar em jejum (hipoglicemia + catabolismo). Pós-treino: chocolate milk funciona muito bem.</p>

        <p className="font-bold text-foreground">Gordura: 30-35% das calorias</p>
        <p>Não restringir! Hormônios sexuais, desenvolvimento cerebral (DHA), vitaminas lipossolúveis. Fontes: peixes gordurosos, ovos inteiros, leite integral, abacate, oleaginosas.</p>

        {/* Micronutrientes */}
        <p className="font-bold text-foreground">Micronutrientes CRÍTICOS:</p>
        <InfoTable
          headers={["Nutriente", "Meta/dia", "Por quê"]}
          rows={[
            ["Cálcio", "1300mg (mais que adulto!)", "Pico de massa óssea em formação"],
            ["Vitamina D", "1000-4000UI", "80%+ deficientes no Brasil"],
            ["Ferro", "Ferritina > 30", "Crítico pós-menarca em meninas"],
            ["Zinco", "9-11mg", "Crescimento, imunidade, cofator GH/IGF-1"],
            ["Magnésio", "360-410mg", "Sono, crescimento, função muscular"],
            ["Ômega-3 (DHA)", "500-1000mg EPA+DHA", "Desenvolvimento cerebral até 25 anos"],
          ]}
        />

        <p className="font-bold text-foreground">Hidratação em jovens (mais vulneráveis):</p>
        <p>Antes: 400-600ml 1-2h antes • Durante: 150-250ml a cada 15-20min • Depois: 450-675ml para cada 0.5kg perdido. Eletrólitos em treinos &gt;60min.</p>

        {/* Tríade */}
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3 space-y-2">
          <p className="font-bold text-destructive text-sm">🚨 TRÍADE DA ATLETA FEMININA (RED-S) — Protocolo Mais Crítico</p>
          <p>Déficit energético + disfunção menstrual + baixa densidade óssea. Prevalência: 15-60% de atletas femininas jovens.</p>
          <p><strong className="text-foreground">Esportes de ALTO RISCO:</strong> Ginástica artística/rítmica • Natação • Atletismo fundo • Dança/ballet • Patinação • Lutas</p>
          <p className="font-bold text-destructive">Sinais de alarme — agir IMEDIATAMENTE:</p>
          <p>Menarca &gt;16 anos • Ciclos irregulares • Amenorreia 3+ meses • Fraturas de estresse • Crescimento abaixo da curva • Comportamento restritivo • Exercício compulsivo</p>
          <p><strong className="text-foreground">Protocolo:</strong> Aumentar disponibilidade energética IMEDIATAMENTE • Equipe multidisciplinar • NÃO apenas reposição hormonal • Psicólogo + DEXA + hormônios a cada 3 meses</p>
        </div>

        {/* MÓDULO 4 — Treino de Força */}
        <p className="font-bold text-foreground text-sm">🏋️ Treinamento de Força em Jovens</p>
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">Mito REFUTADO: "Treino de força interrompe crescimento"</p>
          <p>NSCA, AAP, ACSM: posição oficial = SEGURO E RECOMENDADO. Risco de lesão supervisionado: MENOR que futebol ou basquete.</p>
        </div>

        <p className="font-bold text-foreground">Diretrizes por faixa etária:</p>
        <InfoTable
          headers={["Idade", "Modalidade", "Intensidade", "Ênfase"]}
          rows={[
            ["6-9 anos", "Peso corporal, lúdico", "Muito leve", "Divertido, coordenação"],
            ["10-12 anos", "Pesos livres LEVES + supervisão", "15-20 reps fáceis, 1-2 séries", "TÉCNICA perfeita (Golden Age)"],
            ["12-14 anos", "Progressão gradual de carga", "50-70% 1RM, 8-15 reps", "Técnica + volume crescente"],
            ["15-17 anos", "Próximo ao adulto", "Até 75-80% 1RM", "Periodização intermediária"],
            ["18+", "Protocolo adulto", "Completo", "Creatina OK, volume alto OK"],
          ]}
        />

        <p className="font-bold text-foreground">Padrões de movimento prioritários:</p>
        <ul className="list-disc pl-4 space-y-1">
          <li><strong className="text-foreground">Agachamento:</strong> air → goblet → barra frontal → barra traseira</li>
          <li><strong className="text-foreground">Empurrar:</strong> push-up (inclinado → completo → declive) → press halteres</li>
          <li><strong className="text-foreground">Puxar:</strong> inverted row → pull-up assistido → pull-up completo</li>
          <li><strong className="text-foreground">Hinge:</strong> hip hinge com bastão → kettlebell swing → RDL → terra</li>
          <li><strong className="text-foreground">Core:</strong> McGill Big 3 (bird-dog, dead bug, side plank) + hollow body + farmer's carry</li>
        </ul>

        <div className="bg-muted/30 rounded p-3 space-y-2">
          <p className="font-bold text-foreground">Exemplo treino 12-15 anos (3x/sem):</p>
          <p>Aquecimento 10min (corda, mobilidade, ativação) → A1 Agachamento goblet 3×10 + A2 Push-up 3×10-15 → B1 RDL halteres 3×10 + B2 Puxada assistida 3×8-10 → C1 Press halteres 2×10 + C2 Remada 2×10 → D Core + Sprint 4-6×20m → Alongamento</p>
        </div>

        {/* MÓDULO 5 — Suplementação */}
        <p className="font-bold text-foreground text-sm">💊 Suplementação — Semáforo</p>
        <p className="font-semibold text-foreground">Princípio: FOOD FIRST — 90% vem da alimentação</p>

        <div className="space-y-2">
          <div className="bg-green-500/10 border border-green-500/30 rounded p-3">
            <p className="font-bold text-green-600 dark:text-green-400">🟢 SEGURO e frequentemente necessário:</p>
            <InfoTable
              headers={["Suplemento", "Dose", "Observação"]}
              rows={[
                ["Vitamina D3", "1000-4000UI/dia", "Universalmente deficiente no BR"],
                ["Cálcio (se < 3 porções laticínio)", "500mg 2x citrato", "Não exceder 2500mg total"],
                ["Magnésio", "200-300mg glicinato", "Sono, crescimento, músculo"],
                ["Ferro (se ferritina < 20)", "30-60mg bisglicinato", "Com vitamina C, reavaliar 3 meses"],
                ["Ômega-3", "500-1000mg EPA+DHA", "Desenvolvimento cerebral"],
                ["Probióticos", "L. rhamnosus GG 10bi UFC", "Seguro desde recém-nascido"],
                ["Proteína em pó (> 10 anos)", "Whey concentrado", "Apenas se dieta insuficiente"],
              ]}
            />
          </div>

          <div className="bg-amber-500/10 border border-amber-500/30 rounded p-3">
            <p className="font-bold text-amber-600 dark:text-amber-400">🟡 Com critério e supervisão:</p>
            <p>Creatina: provavelmente segura pós-puberal (15-16+), 3-5g/dia sem loading, decisão médico + pais • Beta-alanina: 15+ anos, 2-3g/dia • Cafeína: &lt;12 NÃO, 13-17 máx 100mg/dia • B12: obrigatório se vegetariano</p>
          </div>

          <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
            <p className="font-bold text-destructive">🔴 NUNCA para jovens:</p>
            <InfoTable
              headers={["Substância", "Consequência"]}
              rows={[
                ["❌ AAS (esteroides)", "Fechamento epífise = altura reduzida PERMANENTE + infertilidade + ginecomastia irreversível"],
                ["❌ SARMs", "Mesma supressão hormonal que AAS — sem dados de segurança"],
                ["❌ Pré-treinos adultos", "Arritmia e parada cardíaca relatados — SNC vulnerável"],
                ["❌ GH (sem indicação)", "Acromegalia, diabetes, tumores"],
                ["❌ Diuréticos", "Risco renal grave + arritmia + colapso + morte"],
                ["❌ Termogênicos", "Estresse cardiovascular inaceitável"],
                ["❌ Peptídeos", "Sem dados de segurança pediátrica"],
              ]}
            />
          </div>
        </div>

        {/* MÓDULO 6 — Esportes Específicos */}
        <p className="font-bold text-foreground text-sm">⚽ Esportes Específicos</p>
        <InfoTable
          headers={["Esporte", "Demandas", "Nutrição chave", "Alerta"]}
          rows={[
            ["Futebol", "8-13km/jogo, 150-250 sprints", "Carb alto, pós-jogo: chocolate milk", "Nordics: -50% lesão isquiotibiais (FIFA 11+)"],
            ["Ginástica", "Força relativa máxima", "LEA > 45kcal/kg massa magra", "MAIOR risco de TA e Tríade — nunca comentar peso"],
            ["Natação", "10-20km/sem, temp. água ↑ gasto", "3500-5000kcal, ferro + Vit D", "Não sentem suar — hidratação subestimada"],
            ["Basquete/Vôlei", "Saltos repetitivos", "Cálcio 1300mg + Vit D 4000UI", "Osgood-Schlatter muito comum 10-15 anos"],
            ["Atletismo fundo", "Alto risco de Tríade", "Ferro mensal, cálcio + D", "NÃO monitorar peso < 16 anos"],
            ["Lutas (Judô, etc.)", "Corte de peso = PERIGOSO", "Competir no peso natural", "Sem cortes > 3% do peso corporal"],
          ]}
        />

        {/* MÓDULO 7 — Psicologia */}
        <p className="font-bold text-foreground text-sm">🧠 Psicologia do Jovem Atleta</p>
        <div className="bg-destructive/10 border border-destructive/30 rounded p-3">
          <p className="font-bold text-destructive">Burnout Precoce — 70% abandonam o esporte antes dos 13 anos</p>
          <p>Principal razão: "não é mais divertido". Sinais: resistência em treinar, lesões frequentes sem causa, queda de performance, perda do prazer, desempenho escolar caindo.</p>
        </div>

        <p className="font-bold text-foreground">Prevenção de burnout:</p>
        <ol className="list-decimal pl-4 space-y-1">
          <li>Múltiplos esportes até 12-13 anos</li>
          <li>Tempo livre sem estrutura (jogo livre = criatividade + resiliência)</li>
          <li>Férias do esporte: 3 meses/ano mínimo</li>
          <li>Escola em primeiro lugar</li>
          <li>Criança deve poder expressar desejo de mudar de esporte</li>
          <li>Sucesso ≠ vitória — trabalho e caráter &gt; troféus</li>
        </ol>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-destructive/5 border border-destructive/20 rounded p-2">
            <p className="font-bold text-destructive text-[10px]">❌ Pais que PREJUDICAM</p>
            <p className="text-[10px]">Gritar durante jogos • Comparar com outros • Viver sonhos pelo filho • Pressionar resultado • Não dar descanso</p>
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded p-2">
            <p className="font-bold text-primary text-[10px]">✅ Pais que AJUDAM</p>
            <p className="text-[10px]">Presença positiva • "Você se esforçou?" (não "ganhou?") • Pais ativos = inspiram • Alimentação em casa • Proteger sono • Escutar</p>
          </div>
        </div>

        {/* MÓDULO 8 — Lesões */}
        <p className="font-bold text-foreground text-sm">🩹 Lesões Comuns em Jovens Atletas</p>
        <InfoTable
          headers={["Lesão", "Local", "Pico", "Manejo"]}
          rows={[
            ["Osgood-Schlatter", "Apófise tibial", "M 12-15 / F 10-13", "Reduzir quadríceps, alongar, gelo, cálcio + D"],
            ["Síndrome de Sever", "Calcanhar", "8-13 anos", "Reduzir impacto, palmilha, alongar panturrilha"],
            ["Scheuermann", "Vértebras (cifose)", "Adolescentes", "Extensão torácica, fortalecer eretores"],
            ["Salter-Harris", "Placa de crescimento", "Qualquer idade", "EMERGÊNCIA — imobilizar e PS imediatamente"],
          ]}
        />
        <p className="font-semibold text-foreground">Prevenção de overuse:</p>
        <p>Regra dos 10% (nunca ↑ volume &gt;10%/sem) • 1-2 dias descanso/sem • Variação de esportes • Dor &gt;48h = investigar (NÃO é normal em jovens)</p>

        {/* MÓDULO 9 — Sono */}
        <p className="font-bold text-foreground text-sm">😴 Sono em Jovens Atletas</p>
        <InfoTable
          headers={["Idade", "Sono necessário", "Durante sono"]}
          rows={[
            ["6-12 anos", "9-12h (obrigatório)", "70-80% do GH, consolidação motora e memória"],
            ["13-18 anos", "8-10h (obrigatório)", "Reparação tecidual, regulação imune, desenvolvimento cerebral"],
          ]}
        />
        <p className="font-semibold text-foreground">Protocolo:</p>
        <p>Temperatura 18-20°C • Escuridão total • Sem eletrônicos no quarto • Sem telas 60-90min antes • Horário consistente (±1h fim de semana) • Sem cafeína após 14h • Jantar 2-3h antes</p>

        {/* MÓDULO 10 — Exames */}
        <p className="font-bold text-foreground text-sm">🔬 Exames e Monitoramento</p>
        <p className="font-semibold text-foreground">Exames anuais para todo jovem atleta:</p>
        <p>Hemograma • Ferritina (meninas: semestral) • Vitamina D • Zinco • Cálcio e fósforo • TSH, T3 • Glicemia • PA • ECG • Antropometria (curvas WHO/CDC)</p>
        <p className="font-semibold text-foreground mt-1">Adicionar para meninas:</p>
        <p>Histórico menstrual • Estrogênio + progesterona se amenorreia • DEXA se fraturas de estresse</p>

        <p className="font-bold text-foreground">Estatura estimada:</p>
        <p>Menino: (pai + mãe + 13cm) / 2 ± 8.5cm • Menina: (pai + mãe - 13cm) / 2 ± 8.5cm. Se muito abaixo: investigar.</p>

        {/* Regras Finais */}
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 space-y-1">
          <p className="font-bold text-foreground text-sm">📋 10 Regras Finais APEX</p>
          <ol className="list-decimal pl-4 space-y-1">
            <li><strong className="text-foreground">Primum non nocere:</strong> crescimento e saúde &gt; performance SEMPRE</li>
            <li><strong className="text-foreground">Diversão = KPI até 12 anos</strong></li>
            <li><strong className="text-foreground">Alimentar crescimento ANTES da performance</strong></li>
            <li><strong className="text-foreground">Técnica antes de carga</strong> — janela técnica não espera</li>
            <li><strong className="text-foreground">Sono inegociável:</strong> 9-10h crianças, 8-9h adolescentes</li>
            <li><strong className="text-foreground">Tríade em meninas = EMERGÊNCIA</strong></li>
            <li><strong className="text-foreground">NUNCA AAS ou farmacológicos</strong> — nenhuma exceção</li>
            <li><strong className="text-foreground">Envolver família sempre</strong></li>
            <li><strong className="text-foreground">Equipe multidisciplinar</strong></li>
            <li><strong className="text-foreground">Longo prazo:</strong> "Atleta saudável aos 30, não campeão lesionado aos 20" — Dr. Lyle Micheli</li>
          </ol>
        </div>
      </div>
    ),
  },
];

const QUICK_ACTIONS = [
  { label: "Protocolo emagrecimento sustentável", icon: <Scale className="w-3.5 h-3.5" /> },
  { label: "Resistência insulínica — como reverter", icon: <Activity className="w-3.5 h-3.5" /> },
  { label: "Mindful eating e gatilhos emocionais", icon: <Brain className="w-3.5 h-3.5" /> },
  { label: "Otimizar testosterona naturalmente", icon: <Shield className="w-3.5 h-3.5" /> },
  { label: "Perimenopausa — protocolo completo", icon: <Heart className="w-3.5 h-3.5" /> },
  { label: "Reverter sarcopenia no idoso", icon: <Users className="w-3.5 h-3.5" /> },
  { label: "Nutrição para depressão e ansiedade", icon: <Smile className="w-3.5 h-3.5" /> },
  { label: "Diabetes tipo 2 — remissão nutricional", icon: <HeartPulse className="w-3.5 h-3.5" /> },
  { label: "Esteatose hepática — protocolo reversão", icon: <Pill className="w-3.5 h-3.5" /> },
  { label: "Dieta Mediterrânea e longevidade", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { label: "Zonas Azuis — hábitos de longevidade", icon: <Target className="w-3.5 h-3.5" /> },
  { label: "Meal prep e comer fora — protocolo", icon: <ShoppingCart className="w-3.5 h-3.5" /> },
  { label: "Burnout — recuperação com suplementação", icon: <Zap className="w-3.5 h-3.5" /> },
  { label: "Gestação e amamentação — suplementos", icon: <Baby className="w-3.5 h-3.5" /> },
  { label: "Protocolo anti-rebound pós-dieta", icon: <TrendingUp className="w-3.5 h-3.5" /> },
  { label: "Nutrição para jovem atleta — macros e micros", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { label: "Treino de força seguro para adolescentes", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { label: "Tríade da atleta feminina — protocolo de emergência", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  { label: "Suplementação segura para menores de 18", icon: <GraduationCap className="w-3.5 h-3.5" /> },
  { label: "Prevenção de burnout em jovens atletas", icon: <GraduationCap className="w-3.5 h-3.5" /> },
];

interface LabHealthMasterProps {
  onAskApex?: (q: string) => void;
}

const LabHealthMaster = ({ onAskApex }: LabHealthMasterProps) => {
  const [search, setSearch] = useState("");

  const filtered = HEALTH_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar módulo de saúde..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border/60"
        />
      </div>

      {onAskApex && (
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action, i) => (
            <Button
              key={i}
              size="sm"
              variant="outline"
              className="h-7 text-[10px] gap-1 border-border/50 hover:bg-primary/10 hover:text-primary"
              onClick={() => onAskApex(action.label)}
            >
              {action.icon}
              {action.label}
            </Button>
          ))}
        </div>
      )}

      <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 text-xs">
        <p className="font-bold text-foreground mb-1">🩺 APEX LAB — Saúde Completa</p>
        <p className="text-muted-foreground italic">"O atleta é 10% da população. Os outros 90% também merecem o melhor conhecimento disponível no mundo."</p>
        <p className="text-muted-foreground mt-1 text-[10px]">Referências: Dr. Peter Attia • Dr. Andrew Huberman • Dr. Jason Fung • Dr. David Ludwig • Dr. Valter Longo • Dr. David Sinclair • Blue Zones Research</p>
      </div>

      {filtered.map((section) => (
        <SectionCard key={section.id} section={section} />
      ))}
    </div>
  );
};

export default LabHealthMaster;
