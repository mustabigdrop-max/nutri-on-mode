import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, Dumbbell, Flame, Timer, Zap, Moon, Dna, Pill, Syringe, FlaskConical, BookOpen, Clock } from "lucide-react";

interface ProtocolSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: ProtocolSection }) => {
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

const ProtocolTable = ({ rows }: { rows: { name: string; nivel: string; tempo: number; resumo: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          <th className="text-left p-2 font-semibold text-foreground">Protocolo</th>
          <th className="text-left p-2 font-semibold text-foreground">Nível</th>
          <th className="text-left p-2 font-semibold text-foreground">Tempo</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/20">
            <td className="p-2">
              <p className="font-medium text-foreground">{r.name}</p>
              <p className="text-muted-foreground mt-0.5">{r.resumo}</p>
            </td>
            <td className="p-2">
              <Badge variant="outline" className={
                r.nivel === "Iniciante" ? "text-accent border-accent/30" :
                r.nivel === "Intermediário" ? "text-primary border-primary/30" :
                "text-destructive border-destructive/30"
              }>
                {r.nivel}
              </Badge>
            </td>
            <td className="p-2 whitespace-nowrap">📖 {r.tempo} min</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const PROTOCOLS: Record<string, Array<{ name: string; nivel: string; tempo: number; resumo: string }>> = {
  hipertrofia: [
    { name: "Periodização de Carboidratos para Hipertrofia", nivel: "Avançado", tempo: 8, resumo: "Como manipular carboidratos ciclicamente para maximizar síntese proteica e minimizar ganho de gordura." },
    { name: "Protocolo de Proteína Peri-Treino", nivel: "Intermediário", tempo: 5, resumo: "Timing ideal de proteína antes, durante e após o treino baseado em meta-análises recentes." },
    { name: "Creatina: Guia Definitivo 2025", nivel: "Iniciante", tempo: 6, resumo: "Dosagem, timing, tipos e combinações de creatina com evidência atualizada." },
    { name: "Leucina e mTOR: Ativação da Síntese Proteica", nivel: "Avançado", tempo: 7, resumo: "Como otimizar a dose de leucina por refeição para máxima ativação de mTOR e MPS." },
  ],
  emagrecimento: [
    { name: "Deficit Inteligente sem Perda Muscular", nivel: "Intermediário", tempo: 7, resumo: "Como criar um deficit calórico que preserve massa magra usando estratégias de timing e macros." },
    { name: "Refeed e Diet Break Baseados em Ciência", nivel: "Avançado", tempo: 6, resumo: "Quando e como implementar refeeds e pausas na dieta para otimizar metabolismo." },
    { name: "Termogênese Adaptativa e Reversão Metabólica", nivel: "Avançado", tempo: 8, resumo: "Estratégias para combater a adaptação metabólica durante cortes prolongados." },
    { name: "Beta-Oxidação e L-Carnitina no Emagrecimento", nivel: "Intermediário", tempo: 6, resumo: "Como a L-carnitina facilita o transporte de ácidos graxos para beta-oxidação mitocondrial." },
  ],
  endurance: [
    { name: "Carb Loading Científico para Competição", nivel: "Intermediário", tempo: 6, resumo: "Protocolo de supercompensação de glicogênio baseado nos estudos mais recentes." },
    { name: "Hidratação e Eletrólitos em Provas Longas", nivel: "Iniciante", tempo: 5, resumo: "Taxas de reposição hídrica e eletrolítica durante exercícios de longa duração." },
    { name: "Periodização Nutricional para Endurance", nivel: "Avançado", tempo: 9, resumo: "Train-low, compete-high: como a periodização de carboidratos melhora eficiência metabólica." },
    { name: "Cafeína e Performance Aeróbica", nivel: "Intermediário", tempo: 5, resumo: "Dosagem ótima, timing e tolerância à cafeína para esportes de resistência." },
  ],
  performance: [
    { name: "Stack Pré-Treino Baseado em Evidência", nivel: "Intermediário", tempo: 6, resumo: "Combinação sinérgica de cafeína, citrulina, beta-alanina e taurina com doses otimizadas." },
    { name: "Nutrição Intra-Treino para Sessões Intensas", nivel: "Avançado", tempo: 5, resumo: "Quando e o que consumir durante treinos de alta intensidade >60 minutos." },
    { name: "Nitrato Dietético e Vasodilatação", nivel: "Intermediário", tempo: 5, resumo: "Como beterraba e fontes de nitrato melhoram eficiência de O2 e performance." },
    { name: "Adaptógenos: Ashwagandha e Rhodiola", nivel: "Avançado", tempo: 7, resumo: "Evidências clínicas sobre adaptógenos na performance física e recuperação do estresse." },
  ],
  sono: [
    { name: "Magnésio e Qualidade do Sono", nivel: "Iniciante", tempo: 4, resumo: "Formas de magnésio (bisglicinato, treonato), dosagem e timing para otimizar sono profundo." },
    { name: "Melatonina: Uso Correto e Limitações", nivel: "Intermediário", tempo: 5, resumo: "Dosagem cronobiológica de melatonina, quando usar e quando evitar." },
    { name: "Protocolo Nutricional para Insônia", nivel: "Avançado", tempo: 7, resumo: "Combinação de triptofano, glicina, tart cherry e manipulação de carboidratos noturnos." },
    { name: "Recuperação Muscular e Sono", nivel: "Intermediário", tempo: 6, resumo: "Como o sono regula GH, testosterona e cortisol para recuperação muscular ideal." },
  ],
  hormonal: [
    { name: "Nutrição para Otimização de Testosterona", nivel: "Intermediário", tempo: 7, resumo: "Micronutrientes essenciais (zinco, vitamina D, boro) e padrões alimentares que suportam níveis saudáveis." },
    { name: "Tireoide e Metabolismo: Suporte Nutricional", nivel: "Avançado", tempo: 8, resumo: "Selênio, iodo e nutrientes que impactam a conversão T4→T3 e saúde tireoidiana." },
    { name: "Cortisol e Estresse: Manejo Nutricional", nivel: "Intermediário", tempo: 6, resumo: "Estratégias nutricionais para modular cortisol crônico elevado e seus efeitos metabólicos." },
    { name: "Protocolo para Síndrome dos Ovários Policísticos", nivel: "Avançado", tempo: 8, resumo: "Inositol, cromo, dieta anti-inflamatória e estratégias baseadas em evidência para SOP." },
  ],
  suplementacao: [
    { name: "Vitamina D: Dose, Forma e Cofatores", nivel: "Iniciante", tempo: 5, resumo: "Dosagem ideal de vitamina D3 + K2, nível sérico alvo e interações com magnésio." },
    { name: "Ômega-3: EPA vs DHA e Dosagem Ideal", nivel: "Intermediário", tempo: 6, resumo: "Diferenças entre EPA e DHA, doses terapêuticas e qualidade do suplemento." },
    { name: "L-Carnitina e Beta-Oxidação: Guia Completo", nivel: "Intermediário", tempo: 7, resumo: "Mecanismo de ação na oxidação de ácidos graxos, formas (ALCAR, GPLC), dosagem e evidência." },
    { name: "Stack de Longevidade: NMN, Resveratrol e Espermidina", nivel: "Avançado", tempo: 9, resumo: "Protocolos baseados nas pesquisas sobre NAD+ e senescência." },
    { name: "Probióticos: Cepas Específicas por Objetivo", nivel: "Intermediário", tempo: 6, resumo: "Quais cepas probióticas têm evidência para cada objetivo." },
  ],
  peptideos: [
    { name: "BPC-157: Regeneração e Cicatrização", nivel: "Avançado", tempo: 8, resumo: "Mecanismo de ação, estudos sobre cicatrização de tendões, músculos e mucosa gástrica." },
    { name: "TB-500 (Timosina Beta-4): Recuperação Tecidual", nivel: "Avançado", tempo: 7, resumo: "Angiogênese, migração celular e reparo tecidual. Sinergias com BPC-157." },
    { name: "CJC-1295 com e sem DAC: Guia Completo", nivel: "Avançado", tempo: 9, resumo: "Diferenças com/sem DAC, meia-vida, pulsos de GH, dosagem e combinações." },
    { name: "Ipamorelin: Liberação Seletiva de GH", nivel: "Intermediário", tempo: 6, resumo: "GH sem cortisol/prolactina. Combinação com CJC-1295." },
    { name: "GHRP-2 e GHRP-6: Secretagogos de GH", nivel: "Avançado", tempo: 7, resumo: "Comparação, efeitos sobre apetite, liberação de GH e stacks com GHRH." },
    { name: "GLP-1 Agonistas: Semaglutida e Tirzepatida", nivel: "Avançado", tempo: 10, resumo: "Protocolos nutricionais para prevenção de sarcopenia e manejo de efeitos colaterais." },
    { name: "MK-677 (Ibutamoren): GH Oral", nivel: "Intermediário", tempo: 6, resumo: "Secretagogo oral, impacto em sono, composição corporal e insulina." },
    { name: "Colágeno Hidrolisado e Peptídeos Bioativos", nivel: "Iniciante", tempo: 5, resumo: "Tipos de colágeno, dosagem com vitamina C para tendões e articulações." },
    { name: "AOD-9604: Fragmento de GH para Lipólise", nivel: "Avançado", tempo: 6, resumo: "Fragmento 176-191, lipólise sem efeitos hiperglicêmicos." },
    { name: "Epitalon e Telômeros", nivel: "Avançado", tempo: 7, resumo: "Ativação de telomerase, protocolos de ciclo e potencial anti-envelhecimento." },
  ],
  anabolizantes: [
    { name: "Testosterona: Base de Todo Ciclo", nivel: "Avançado", tempo: 10, resumo: "Ésteres, meia-vida, dosagem, frequência de aplicação e monitoramento laboratorial." },
    { name: "Oxandrolona (Anavar): Perfil Completo", nivel: "Intermediário", tempo: 7, resumo: "Perfil anabólico/androgênico, impacto hepático, dosagem e combinações." },
    { name: "Nandrolona (Deca / NPP): Guia Científico", nivel: "Avançado", tempo: 8, resumo: "Decanoato vs Fenilpropionato, efeitos progestagênicos e Deca Dick." },
    { name: "Boldenona (Equipoise)", nivel: "Avançado", tempo: 7, resumo: "Impacto no hematócrito, tempo de detecção e relação risco-benefício." },
    { name: "Trembolona: Potência e Riscos", nivel: "Avançado", tempo: 9, resumo: "Acetato vs enantato, impacto cardíaco/renal, protocolos de mitigação." },
    { name: "Stanozolol (Winstrol): Oral vs Injetável", nivel: "Intermediário", tempo: 6, resumo: "Hepatotoxicidade, impacto em colesterol e articulações." },
    { name: "Primobolan (Metenolona)", nivel: "Avançado", tempo: 7, resumo: "Perfil de segurança, uso em cutting, dosagem oral vs injetável." },
    { name: "TPC: Guia Definitivo", nivel: "Avançado", tempo: 10, resumo: "Tamoxifeno, Clomifeno, HCG. Timing, dosagem e restauração do eixo HPT." },
    { name: "SARMs: Evidência Atual e Riscos", nivel: "Intermediário", tempo: 8, resumo: "Ostarine, Ligandrol, RAD-140. Supressão hormonal e hepatotoxicidade." },
    { name: "Suporte Nutricional em Ciclo", nivel: "Avançado", tempo: 9, resumo: "TUDCA, NAC, CoQ10, ômega-3, citrus bergamot. Proteção hepática, cardíaca e renal." },
    { name: "Insulina e GH: Protocolos Avançados", nivel: "Avançado", tempo: 10, resumo: "Uso combinado para hipertrofia extrema. Riscos de hipoglicemia e timing nutricional." },
    { name: "Exames Laboratoriais para Usuários de AAS", nivel: "Intermediário", tempo: 7, resumo: "Painel completo: hemograma, lipídios, hepático, renal, hormônios e marcadores cardíacos." },
  ],
};

const sections: ProtocolSection[] = [
  {
    id: "hipertrofia",
    title: "Hipertrofia e Força",
    icon: <Dumbbell className="w-4 h-4 text-primary" />,
    badge: `${PROTOCOLS.hipertrofia.length} protocolos`,
    content: <ProtocolTable rows={PROTOCOLS.hipertrofia} />,
  },
  {
    id: "emagrecimento",
    title: "Emagrecimento e Cutting",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    badge: `${PROTOCOLS.emagrecimento.length} protocolos`,
    badgeColor: "text-orange-500 border-orange-500/30",
    content: <ProtocolTable rows={PROTOCOLS.emagrecimento} />,
  },
  {
    id: "endurance",
    title: "Resistência e Endurance",
    icon: <Timer className="w-4 h-4 text-blue-500" />,
    badge: `${PROTOCOLS.endurance.length} protocolos`,
    badgeColor: "text-blue-500 border-blue-500/30",
    content: <ProtocolTable rows={PROTOCOLS.endurance} />,
  },
  {
    id: "performance",
    title: "Performance e Energia",
    icon: <Zap className="w-4 h-4 text-yellow-500" />,
    badge: `${PROTOCOLS.performance.length} protocolos`,
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: <ProtocolTable rows={PROTOCOLS.performance} />,
  },
  {
    id: "sono",
    title: "Sono e Recuperação",
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
    badge: `${PROTOCOLS.sono.length} protocolos`,
    badgeColor: "text-indigo-400 border-indigo-400/30",
    content: <ProtocolTable rows={PROTOCOLS.sono} />,
  },
  {
    id: "hormonal",
    title: "Saúde Hormonal",
    icon: <Dna className="w-4 h-4 text-purple-500" />,
    badge: `${PROTOCOLS.hormonal.length} protocolos`,
    badgeColor: "text-purple-500 border-purple-500/30",
    content: <ProtocolTable rows={PROTOCOLS.hormonal} />,
  },
  {
    id: "suplementacao",
    title: "Suplementação Avançada",
    icon: <Pill className="w-4 h-4 text-accent" />,
    badge: `${PROTOCOLS.suplementacao.length} protocolos`,
    badgeColor: "text-accent border-accent/30",
    content: <ProtocolTable rows={PROTOCOLS.suplementacao} />,
  },
  {
    id: "peptideos",
    title: "Peptídeos",
    icon: <Syringe className="w-4 h-4 text-cyan-500" />,
    badge: `${PROTOCOLS.peptideos.length} protocolos`,
    badgeColor: "text-cyan-500 border-cyan-500/30",
    content: <ProtocolTable rows={PROTOCOLS.peptideos} />,
  },
  {
    id: "anabolizantes",
    title: "Esteroides Anabolizantes",
    icon: <FlaskConical className="w-4 h-4 text-red-500" />,
    badge: `${PROTOCOLS.anabolizantes.length} protocolos`,
    badgeColor: "text-red-500 border-red-500/30",
    content: <ProtocolTable rows={PROTOCOLS.anabolizantes} />,
  },
];

interface ProtocolLibraryProps {
  onAskApex: (question: string) => void;
}

const ProtocolLibrary = ({ onAskApex }: ProtocolLibraryProps) => {
  const [search, setSearch] = useState("");

  const filtered = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.badge && s.badge.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4 pb-16">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar categoria, protocolo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10"
        onClick={() => onAskApex("Crie um protocolo nutricional personalizado baseado nos meus dados e objetivos atuais, com timing, doses e suplementação.")}
      >
        <BookOpen className="w-3.5 h-3.5 mr-1" /> Perguntar ao APEX sobre Protocolos
      </Button>

      <div className="space-y-2">
        {filtered.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-xs text-muted-foreground text-center py-8">Nenhum protocolo encontrado.</p>
      )}
    </div>
  );
};

export default ProtocolLibrary;
