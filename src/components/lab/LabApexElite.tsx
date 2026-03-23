import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Zap, Lock, Trophy, Droplets,
  Dumbbell, Pill, FlaskConical, Brain, Shield, Target, Clock,
  AlertTriangle, Flame, Syringe, HeartPulse, BarChart3
} from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";

interface EliteSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: EliteSection }) => {
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="cursor-pointer py-3 px-4" onClick={() => setOpen(!open)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {section.icon}
            <CardTitle className="text-sm font-bold">{section.title}</CardTitle>
            {section.badge && (
              <Badge variant="outline" className={section.badgeColor || "text-destructive border-destructive/30"}>
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

const ProtocolTable = ({ rows }: { rows: { name: string; dose: string; timing: string; notes?: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          <th className="text-left p-2 font-semibold text-foreground">Composto</th>
          <th className="text-left p-2 font-semibold text-foreground">Dose</th>
          <th className="text-left p-2 font-semibold text-foreground">Timing</th>
          {rows.some(r => r.notes) && <th className="text-left p-2 font-semibold text-foreground">Notas</th>}
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t border-border/20">
            <td className="p-2 font-medium text-foreground">{r.name}</td>
            <td className="p-2">{r.dose}</td>
            <td className="p-2">{r.timing}</td>
            {rows.some(rr => rr.notes) && <td className="p-2">{r.notes || "—"}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

interface LabApexEliteProps {
  onAskApex?: (q: string) => void;
}

const QUICK_ACTIONS = [
  { label: "Peak week completo — água, sódio, carb load", icon: <Trophy className="w-3 h-3" /> },
  { label: "Intra-treino avançado para hipertrofia máxima", icon: <Dumbbell className="w-3 h-3" /> },
  { label: "Refeeding pós-competição sem rebote", icon: <Flame className="w-3 h-3" /> },
  { label: "Manipulação carb + glicerina pré-palco", icon: <Droplets className="w-3 h-3" /> },
  { label: "Suporte hepático e cardiovascular durante prep", icon: <HeartPulse className="w-3 h-3" /> },
  { label: "Periodização offseason → prep 16 semanas", icon: <Target className="w-3 h-3" /> },
];

const sections: EliteSection[] = [
  {
    id: "overview",
    title: "APEX ELITE — Visão Geral",
    icon: <Zap className="w-4 h-4 text-destructive" />,
    badge: "Elite",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-3">
        <p className="text-foreground font-semibold">Modo Atleta & Competição — protocolos avançados para o palco.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Peak week com manipulação de água e sódio",
            "Protocolos de carb load por categoria",
            "Farmacologia esportiva aplicada",
            "TPC (Terapia Pós-Ciclo) baseada em evidências",
            "Suporte hepático, renal e cardiovascular",
            "Estratégias de rebote controlado pós-competição",
            "Intra-treino para diferentes fases de prep",
            "Manipulação de insulina e GH",
            "Protocolos por categoria (Open, Classic, Bikini, Physique)",
          ].map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-destructive mt-0.5">▸</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Card className="bg-destructive/5 border-destructive/20 p-3 mt-2">
          <p className="text-xs font-mono text-destructive">
            ⚠️ Conteúdo exclusivo para profissionais. Uso sob supervisão médica obrigatória.
          </p>
        </Card>
      </div>
    ),
  },
  {
    id: "peak-week",
    title: "Peak Week — Protocolo Completo",
    icon: <Trophy className="w-4 h-4 text-yellow-500" />,
    badge: "Competição",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-4">
        <p>Protocolo de finalização para 7 dias pré-competição.</p>
        <ProtocolTable rows={[
          { name: "D-7 a D-5", dose: "Carb 0.5g/kg | Proteína 2.5g/kg | Gordura 0.8g/kg", timing: "Depleção", notes: "Treino full body alto volume" },
          { name: "D-4 a D-3", dose: "Carb 3-5g/kg (início load)", timing: "Carb Load fase 1", notes: "Treino leve, muscular" },
          { name: "D-2", dose: "Carb 6-8g/kg", timing: "Carb Load fase 2", notes: "Sem treino, repouso" },
          { name: "D-1", dose: "Carb 4-5g/kg | Gordura mínima", timing: "Ajuste fino", notes: "Posing practice" },
          { name: "D-Day", dose: "Carb simples entre categorias", timing: "Backstage", notes: "Mel, arroz branco, doces secos" },
        ]} />
        <Card className="bg-yellow-500/5 border-yellow-500/20 p-3">
          <p className="text-xs font-semibold text-yellow-400 mb-1">Fontes de Carb Ideais para Load:</p>
          <p className="text-xs">Arroz branco | Batata inglesa | Cream of Rice | Pão branco | Macarrão | Evitar fibras e vegetais crucíferos</p>
        </Card>
      </div>
    ),
  },
  {
    id: "agua-sodio",
    title: "Manipulação de Água e Sódio",
    icon: <Droplets className="w-4 h-4 text-blue-500" />,
    badge: "Finalização",
    badgeColor: "text-blue-500 border-blue-500/30",
    content: (
      <div className="space-y-4">
        <p>Protocolos de manipulação hídrica e eletrolítica para definição máxima.</p>
        <ProtocolTable rows={[
          { name: "D-7 a D-5", dose: "Água 8-10L | Sódio 5-8g", timing: "Loading hídrico", notes: "Estimula ADH downregulation" },
          { name: "D-4 a D-3", dose: "Água 6-8L | Sódio 4-5g", timing: "Redução gradual", notes: "Manter potássio 4.7g" },
          { name: "D-2", dose: "Água 3-4L | Sódio 2-3g", timing: "Cut moderado", notes: "Monitorar câimbras" },
          { name: "D-1", dose: "Água 1-2L (goles) | Sódio mínimo", timing: "Cut final", notes: "Vinho tinto opcional (taninos)" },
          { name: "D-Day", dose: "Goles conforme necessário", timing: "Backstage", notes: "Bombar com carb + pouca água" },
        ]} />
        <Card className="bg-red-500/5 border-red-500/20 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">⚠️ Alertas de Segurança:</p>
          <p className="text-xs">Nunca zerar água completamente | Monitorar pressão arterial | Ter eletrólitos de emergência | Sinais de perigo: confusão mental, taquicardia, câimbras severas</p>
        </Card>
      </div>
    ),
  },
  {
    id: "farmacologia",
    title: "Farmacologia Esportiva Aplicada",
    icon: <Syringe className="w-4 h-4 text-red-500" />,
    badge: "Avançado",
    badgeColor: "text-red-500 border-red-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-red-500/5 border-red-500/20 p-3">
          <p className="text-xs font-mono text-red-400">⚠️ Informação educacional. Supervisão médica obrigatória. Não constitui prescrição.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Categorias de Compostos:</p>
          <ProtocolTable rows={[
            { name: "Testosterona Base", dose: "Variável por fase", timing: "Offseason → Prep", notes: "Base de qualquer protocolo" },
            { name: "Anabolizantes Injetáveis", dose: "Fase-dependente", timing: "Ciclos de 8-16 sem", notes: "Nandrolona, Boldenona, Primobolan" },
            { name: "Anabolizantes Orais (17AA)", dose: "Curto prazo", timing: "4-6 semanas máx", notes: "Hepatotoxicidade — monitorar TGO/TGP" },
            { name: "Compostos de Finalização", dose: "Últimas 2-4 sem", timing: "Pré-competição", notes: "Winstrol, Masteron, Halotestin" },
            { name: "Peptídeos", dose: "Variável", timing: "Suporte", notes: "GH, IGF-1, BPC-157, TB-500" },
            { name: "Moduladores", dose: "Variável", timing: "On/Off cycle", notes: "SARMs, AI, SERMs" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Exames Obrigatórios Durante Uso:</p>
          <ul className="space-y-1">
            {[
              "Hemograma completo (hematócrito, hemoglobina)",
              "Perfil hepático (TGO, TGP, GGT, bilirrubinas)",
              "Perfil lipídico (CT, HDL, LDL, TG)",
              "Hormônios (Testosterona, Estradiol, Prolactina, FSH, LH)",
              "Função renal (Creatinina, Uréia, TFG)",
              "Ecocardiograma anual (hipertrofia ventricular)",
              "PSA (homens > 35 anos)",
            ].map((e, i) => (
              <li key={i} className="flex gap-2"><AlertTriangle className="w-3 h-3 text-red-500 mt-0.5 shrink-0" />{e}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "tpc",
    title: "TPC — Terapia Pós-Ciclo",
    icon: <Shield className="w-4 h-4 text-green-500" />,
    badge: "Recuperação",
    badgeColor: "text-green-500 border-green-500/30",
    content: (
      <div className="space-y-4">
        <p>Protocolos de recuperação do eixo hormonal pós-ciclo.</p>
        <ProtocolTable rows={[
          { name: "HCG", dose: "1000-2000 UI 2x/sem", timing: "Últimas 2 sem do ciclo + 2 sem", notes: "Estimula Leydig → testosterona" },
          { name: "Clomifeno (Clomid)", dose: "50mg/dia (4 sem)", timing: "Após washout", notes: "Estimula FSH/LH" },
          { name: "Tamoxifeno (Nolvadex)", dose: "20mg/dia (4-6 sem)", timing: "Após washout", notes: "Anti-estrogênico + LH" },
          { name: "Anastrozol (se necessário)", dose: "0.5mg EOD", timing: "Durante HCG", notes: "Controle E2 durante HCG" },
        ]} />
        <div>
          <p className="text-foreground font-semibold mb-2">Stack de Suporte durante TPC:</p>
          <ProtocolTable rows={[
            { name: "Ashwagandha KSM-66", dose: "600mg/dia", timing: "Manhã", notes: "Cortisol ↓, testosterona ↑" },
            { name: "Tongkat Ali", dose: "400mg/dia", timing: "Manhã", notes: "SHBG ↓, T livre ↑" },
            { name: "Zinco Quelato", dose: "30-50mg/dia", timing: "Noite", notes: "Cofator aromatase/5AR" },
            { name: "Vitamina D3", dose: "5000 UI/dia", timing: "Com gordura", notes: "Precursor hormonal" },
            { name: "DHEA", dose: "25-50mg/dia", timing: "Manhã", notes: "Precursor direto" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "suporte-orgaos",
    title: "Suporte de Órgãos",
    icon: <HeartPulse className="w-4 h-4 text-pink-500" />,
    badge: "Proteção",
    badgeColor: "text-pink-500 border-pink-500/30",
    content: (
      <div className="space-y-4">
        <p>Protocolos de proteção hepática, cardiovascular e renal.</p>
        <div>
          <p className="text-foreground font-semibold mb-2">Suporte Hepático:</p>
          <ProtocolTable rows={[
            { name: "TUDCA", dose: "500-1000mg/dia", timing: "Com orais 17AA", notes: "Gold standard hepatoprotetor" },
            { name: "NAC", dose: "600-1200mg/dia", timing: "Longe de treino", notes: "Glutationa ↑" },
            { name: "Silimarina", dose: "420mg/dia", timing: "Distribuído", notes: "Cardo-mariano" },
            { name: "Liv.52", dose: "2 tabs 2x/dia", timing: "Com refeições", notes: "Fórmula ayurvédica" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Suporte Cardiovascular:</p>
          <ProtocolTable rows={[
            { name: "Citrus Bergamot", dose: "1000mg/dia", timing: "Com refeição", notes: "LDL ↓, HDL ↑ (melhor que estatina natural)" },
            { name: "Coenzima Q10 (Ubiquinol)", dose: "200-400mg/dia", timing: "Com gordura", notes: "Energia mitocondrial cardíaca" },
            { name: "Ômega-3 (EPA+DHA)", dose: "4-6g/dia", timing: "Distribuído", notes: "Triglicerídeos ↓↓" },
            { name: "Taurina", dose: "3-5g/dia", timing: "Distribuído", notes: "Osmoprotetor cardíaco" },
            { name: "Nebivolol (Rx)", dose: "2.5-5mg/dia", timing: "Se PA > 140/90", notes: "Beta-bloqueador + NO" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Suporte Renal:</p>
          <ProtocolTable rows={[
            { name: "Astragalus", dose: "500mg 2x/dia", timing: "Com refeição", notes: "Nefroprotetor" },
            { name: "Cranberry Extract", dose: "500mg/dia", timing: "—", notes: "Anti-inflamatório renal" },
            { name: "Hidratação", dose: "40-50ml/kg/dia", timing: "Distribuído", notes: "Base da proteção renal" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "intra-treino",
    title: "Intra-Treino Avançado",
    icon: <Dumbbell className="w-4 h-4 text-orange-500" />,
    badge: "Performance",
    badgeColor: "text-orange-500 border-orange-500/30",
    content: (
      <div className="space-y-4">
        <p>Protocolos intra-treino por fase de preparação.</p>
        <div>
          <p className="text-foreground font-semibold mb-2">Offseason (Hipertrofia):</p>
          <ProtocolTable rows={[
            { name: "Ciclodextrina (HBCD)", dose: "40-80g", timing: "Sipping durante treino", notes: "Esvaziamento gástrico rápido" },
            { name: "EAA/BCAA", dose: "10-15g", timing: "Com ciclodextrina", notes: "Pool de aminoácidos" },
            { name: "Creatina", dose: "5g", timing: "Intra", notes: "Absorção facilitada" },
            { name: "Sódio", dose: "1-2g", timing: "Na bebida", notes: "Volumização + pump" },
            { name: "Citrulina", dose: "8-10g", timing: "30min antes ou intra", notes: "NO ↑, pump vascular" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Prep/Cutting:</p>
          <ProtocolTable rows={[
            { name: "EAA", dose: "15-20g", timing: "Sipping durante treino", notes: "Anti-catabólico" },
            { name: "Citrulina", dose: "8g", timing: "Pré ou intra", notes: "Manter pump apesar do déficit" },
            { name: "Eletrólitos", dose: "Sódio 500mg + K 200mg + Mg 100mg", timing: "Na água de treino", notes: "Prevenir câimbras em low carb" },
            { name: "Cafeína", dose: "200-400mg", timing: "30min pré", notes: "Força e foco em déficit" },
          ]} />
        </div>
        <Card className="bg-orange-500/5 border-orange-500/20 p-3">
          <p className="text-xs font-semibold text-orange-400 mb-1">Dica Elite:</p>
          <p className="text-xs">Em prep final (últimas 4 sem), substituir ciclodextrina por EAA puro + eletrólitos para manter performance sem carb extra.</p>
        </Card>
      </div>
    ),
  },
  {
    id: "categorias",
    title: "Protocolos por Categoria",
    icon: <BarChart3 className="w-4 h-4 text-purple-500" />,
    badge: "Categorias",
    badgeColor: "text-purple-500 border-purple-500/30",
    content: (
      <div className="space-y-4">
        <p>Diferenças de abordagem nutricional por categoria competitiva.</p>
        <div className="space-y-3">
          <Card className="bg-purple-500/5 border-purple-500/20 p-3">
            <p className="text-xs font-semibold text-purple-400 mb-1">Men's Physique</p>
            <p className="text-xs">BF alvo: 5-7% | Foco: delts, braços, V-taper | Carb load moderado (5-6g/kg) | Água: cut suave | Bronzeamento médio</p>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20 p-3">
            <p className="text-xs font-semibold text-blue-400 mb-1">Classic Physique</p>
            <p className="text-xs">BF alvo: 4-6% | Foco: proporção, estética, poses clássicas | Carb load agressivo (7-8g/kg) | Manipulação de água mais intensa</p>
          </Card>
          <Card className="bg-pink-500/5 border-pink-500/20 p-3">
            <p className="text-xs font-semibold text-pink-400 mb-1">Bikini / Wellness</p>
            <p className="text-xs">BF alvo: 12-16% | Foco: glúteos, pernas | Carb load suave (4-5g/kg) | Evitar depleção severa | Sem cut de água agressivo</p>
          </Card>
          <Card className="bg-red-500/5 border-red-500/20 p-3">
            <p className="text-xs font-semibold text-red-400 mb-1">Bodybuilding Open</p>
            <p className="text-xs">BF alvo: 3-5% | Volume e density máximos | Carb load agressivo (8-10g/kg) | Manipulação completa de água/sódio | Protocolos farmacológicos mais complexos</p>
          </Card>
        </div>
      </div>
    ),
  },
  {
    id: "rebote",
    title: "Pós-Competição — Controle de Rebote",
    icon: <Flame className="w-4 h-4 text-amber-500" />,
    badge: "Recovery",
    badgeColor: "text-amber-500 border-amber-500/30",
    content: (
      <div className="space-y-4">
        <p>Estratégia para evitar rebote de gordura e edema pós-competição.</p>
        <ProtocolTable rows={[
          { name: "D+1 a D+3", dose: "Manutenção +10% | Proteína 2g/kg", timing: "Reintroduzir água normal", notes: "Evitar binge — comida limpa" },
          { name: "Semana 1", dose: "+200kcal/semana sobre manutenção", timing: "Reverse gradual", notes: "Priorizar carbs complexos" },
          { name: "Semana 2-4", dose: "+100-150kcal/semana", timing: "Aumentar carbs", notes: "Monitorar peso diário" },
          { name: "Semana 5-8", dose: "Chegar a superávit leve (10%)", timing: "Início offseason", notes: "Aceitável ganho 3-5kg" },
        ]} />
        <Card className="bg-amber-500/5 border-amber-500/20 p-3">
          <p className="text-xs font-semibold text-amber-400 mb-1">Regra de Ouro:</p>
          <p className="text-xs">Máximo aceitável: recuperar 50% do peso perdido no prep em 2 meses. Acima disso = rebote descontrolado.</p>
        </Card>
        <div>
          <p className="text-foreground font-semibold mb-2">Suporte Pós-Comp:</p>
          <ul className="space-y-1">
            {[
              "Probióticos em dose alta (50B+ UFC) — restaurar intestino",
              "Enzimas digestivas — re-adaptar ao volume alimentar",
              "Suporte psicológico — dismorfismo pós-palco é real",
              "Reduzir cardio gradualmente — não zerar de uma vez",
              "Monitorar tireoide — T3/T4 pode estar suprimido",
            ].map((s, i) => (
              <li key={i} className="flex gap-2"><span className="text-amber-500">▸</span>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
];

const LabApexElite = ({ onAskApex }: LabApexEliteProps) => {
  const { hasAccess } = usePlanGate();
  const [searchTerm, setSearchTerm] = useState("");

  const canAccess = hasAccess("ON PRO");

  if (!canAccess) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-destructive/40" />
        </div>
        <h3 className="text-base font-bold text-foreground">APEX ELITE</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Modo Atleta & Competição — exclusivo ON PRO. Protocolos avançados de peak week, manipulação hídrica e farmacologia aplicada.
        </p>
      </div>
    );
  }

  const filtered = searchTerm
    ? sections.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.badge?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : sections;

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar peak week, farmacologia, TPC, intra-treino..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          className="pl-10 h-9 text-xs"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-2">⚡ Quick Actions — Pergunte ao APEX</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((action, i) => (
            <button
              key={i}
              onClick={() => onAskApex?.(action.label)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono text-destructive/60 border border-destructive/20 rounded-lg hover:bg-destructive/5 hover:text-destructive hover:border-destructive/40 transition-all"
            >
              {action.icon}
              {action.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filtered.map(section => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-8">
          <p className="text-xs text-muted-foreground">Nenhum resultado para "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
};

export default LabApexElite;
