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

        <p className="font-semibold text-foreground">Suplementação HAS:</p>
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

        <p className="font-bold text-foreground text-sm mt-4">C. Hipotireoidismo & Hashimoto</p>
        <p>TSH ideal: 0.5-2.0 (não apenas "normal" até 4.5). Levotiroxina: jejum, 30-60min antes do café. NÃO tomar com: cálcio, ferro, soja, fibra (-20-40% absorção).</p>

        <p className="font-bold text-foreground text-sm mt-4">D. Doenças Autoimunes — Protocolo AIP</p>
        <p className="font-semibold text-foreground">Fase eliminação (30-90 dias):</p>
        <p>Eliminar: glúten, laticínios (caseína A1), grãos, leguminosas, ovos, solanáceas (tomate, pimentão, beringela), AINEs, álcool</p>
        <p className="italic">Reintrodução gradual após 30-90 dias, um alimento por vez, avaliando sintomas durante 72h.</p>

        <div className="bg-destructive/10 border border-destructive/30 rounded p-2 mt-2">
          <p className="font-bold text-destructive">⚠️ Encaminhamento urgente:</p>
          <p>HbA1c &gt;9% sem tratamento • Glicemia &gt;300 consistente • Cetoacidose • Hipoglicemia severa &lt;50 com medicação</p>
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
  { label: "Burnout — recuperação com suplementação", icon: <Zap className="w-3.5 h-3.5" /> },
  { label: "Gestação e amamentação — suplementos", icon: <Baby className="w-3.5 h-3.5" /> },
  { label: "Hipertensão — DASH + suplementação", icon: <Thermometer className="w-3.5 h-3.5" /> },
  { label: "Protocolo anti-rebound pós-dieta", icon: <TrendingUp className="w-3.5 h-3.5" /> },
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
