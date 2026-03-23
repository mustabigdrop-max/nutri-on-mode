import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Shield, Users, BookOpen, Brain,
  ClipboardList, Target, Dumbbell, Pill, BarChart3, Lock, Bot,
  AlertTriangle, Zap, Clock, FileText
} from "lucide-react";
import { usePlanGate } from "@/hooks/usePlanGate";

interface CoachSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section, onAskApex }: { section: CoachSection; onAskApex?: (q: string) => void }) => {
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

const ProtocolTable = ({ rows }: { rows: { name: string; dose: string; timing: string; notes?: string }[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-xs border border-border/40 rounded">
      <thead>
        <tr className="bg-muted/30">
          <th className="text-left p-2 font-semibold text-foreground">Item</th>
          <th className="text-left p-2 font-semibold text-foreground">Recomendação</th>
          <th className="text-left p-2 font-semibold text-foreground">Aplicação</th>
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

interface LabCoachModeProps {
  onAskApex?: (q: string) => void;
}

const QUICK_ACTIONS = [
  { label: "Periodização nutricional para cutting", icon: <Target className="w-3 h-3" /> },
  { label: "Stack recuperação pós-treino", icon: <Pill className="w-3 h-3" /> },
  { label: "Reverter adaptação metabólica", icon: <BarChart3 className="w-3 h-3" /> },
  { label: "Protocolo resistência insulínica", icon: <Brain className="w-3 h-3" /> },
  { label: "Ajuste macro para recomposição", icon: <Dumbbell className="w-3 h-3" /> },
  { label: "Estratégia refeed/diet break", icon: <Zap className="w-3 h-3" /> },
];

const sections: CoachSection[] = [
  {
    id: "visao-geral",
    title: "Visão Geral — Modo Coach",
    icon: <Shield className="w-4 h-4 text-primary" />,
    badge: "Base",
    content: (
      <div className="space-y-3">
        <p className="text-foreground font-semibold">Assistente científico para profissionais de nutrição e coaches.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "Respostas formatadas com referências científicas",
            "Protocolos prontos para enviar ao cliente",
            "Organização por aluno/cliente",
            "Salvamento no caderno para consulta futura",
            "Cobertura de periodização, suplementação e recomposição",
            "Integração com banco de dados APEX",
          ].map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">▸</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Card className="bg-primary/5 border-primary/20 p-3 mt-2">
          <p className="text-xs font-mono text-primary">
            Coach Mode = Respostas B2B | Protocolos formatados | Referências PubMed | Organizado por cliente
          </p>
        </Card>
      </div>
    ),
  },
  {
    id: "periodizacao",
    title: "Periodização Nutricional",
    icon: <Target className="w-4 h-4 text-blue-500" />,
    badge: "Protocolos",
    badgeColor: "text-blue-500 border-blue-500/30",
    content: (
      <div className="space-y-4">
        <p>Modelos de periodização para aplicar com seus clientes em diferentes fases.</p>
        <ProtocolTable rows={[
          { name: "Cutting Linear", dose: "Déficit 20-25%", timing: "8-16 semanas", notes: "Iniciantes/intermediários" },
          { name: "Cutting com Refeeds", dose: "Déficit 25% + refeed 1-2x/sem", timing: "12-20 semanas", notes: "Avançados, alto volume treino" },
          { name: "Diet Break", dose: "2 sem manutenção a cada 6 sem cutting", timing: "Ciclos de 6+2", notes: "Previne adaptação metabólica" },
          { name: "Reverse Diet", dose: "+50-100kcal/semana", timing: "8-16 semanas pós-comp", notes: "Restaurar metabolismo" },
          { name: "Lean Bulk", dose: "Superávit 10-15%", timing: "16-24 semanas", notes: "Ganho controlado, min. gordura" },
          { name: "Recomposição", dose: "Manutenção ±5%", timing: "Contínuo", notes: "Iniciantes, retorno pós-pausa" },
        ]} />
        <Card className="bg-blue-500/5 border-blue-500/20 p-3">
          <p className="text-xs font-semibold text-blue-400 mb-1">Sinais de Adaptação Metabólica:</p>
          <p className="text-xs">Platô > 2 semanas | Fome excessiva | Energia ↓↓ | Sono prejudicado | Libido ↓ | T3/T4 alterados</p>
        </Card>
      </div>
    ),
  },
  {
    id: "avaliacao-inicial",
    title: "Avaliação Inicial do Cliente",
    icon: <ClipboardList className="w-4 h-4 text-yellow-500" />,
    badge: "Anamnese",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-4">
        <p className="text-foreground font-semibold">Checklist de avaliação para novo cliente:</p>
        <div className="space-y-2">
          {[
            { cat: "Composição Corporal", items: ["Peso, altura, BF% (dobras ou DEXA)", "Circunferências (cintura, quadril, braços)", "Fotos padronizadas (frente, lado, costas)"] },
            { cat: "Histórico Alimentar", items: ["Recordatório 24h ou diário 3 dias", "Preferências e aversões", "Alergias e intolerâncias", "Horários de refeição habituais"] },
            { cat: "Treino e Atividade", items: ["Frequência, volume, intensidade", "Tipo (musculação, cardio, esporte)", "Experiência (anos de treino)", "Horário habitual do treino"] },
            { cat: "Saúde e Exames", items: ["Exames recentes (hemograma, hormônios, lipídios)", "Medicações em uso", "Suplementação atual", "Qualidade do sono (horas, qualidade)"] },
          ].map((group, gi) => (
            <div key={gi}>
              <p className="text-foreground font-semibold text-xs mb-1">{group.cat}:</p>
              <ul className="space-y-0.5 ml-2">
                {group.items.map((item, ii) => (
                  <li key={ii} className="flex gap-2"><span className="text-primary">▸</span>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    id: "suplementacao-clientes",
    title: "Suplementação por Perfil de Cliente",
    icon: <Pill className="w-4 h-4 text-green-500" />,
    badge: "Stacks",
    badgeColor: "text-green-500 border-green-500/30",
    content: (
      <div className="space-y-4">
        <p>Stacks recomendados por objetivo e perfil do cliente.</p>
        <div>
          <p className="text-foreground font-semibold mb-2">Cutting / Perda de Gordura:</p>
          <ProtocolTable rows={[
            { name: "Cafeína", dose: "200-400mg", timing: "Pré-treino", notes: "Termogênico + performance" },
            { name: "L-Carnitina", dose: "2-3g", timing: "Com carboidrato", notes: "Oxidação ácidos graxos" },
            { name: "CLA", dose: "3-4g", timing: "Distribuído", notes: "Recomp. moderada" },
            { name: "Cromo", dose: "200-600mcg", timing: "Com refeição", notes: "Sensibilidade insulínica" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Ganho de Massa / Bulking:</p>
          <ProtocolTable rows={[
            { name: "Creatina Mono", dose: "5g/dia", timing: "Qualquer horário", notes: "Base obrigatória" },
            { name: "Whey Protein", dose: "25-40g", timing: "Pós-treino ou entre refeições", notes: "Completar meta proteica" },
            { name: "Maltodextrina/Ciclodextrina", dose: "30-60g", timing: "Intra/Pós-treino", notes: "Alto volume de treino" },
            { name: "HMB", dose: "3g/dia", timing: "Distribuído", notes: "Anti-catabólico" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Saúde Geral / Wellness:</p>
          <ProtocolTable rows={[
            { name: "Vitamina D3", dose: "2000-5000 UI", timing: "Com gordura", notes: "Manter > 40ng/ml" },
            { name: "Ômega-3", dose: "2-3g EPA+DHA", timing: "Com refeição", notes: "Anti-inflamatório" },
            { name: "Magnésio Bisglicinato", dose: "400mg", timing: "Pré-sono", notes: "Sono + recuperação" },
            { name: "Probiótico multi-cepa", dose: "10B+ UFC", timing: "Pré-sono", notes: "Saúde intestinal" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "comunicacao",
    title: "Comunicação com Cliente",
    icon: <Users className="w-4 h-4 text-purple-500" />,
    badge: "Soft Skills",
    badgeColor: "text-purple-500 border-purple-500/30",
    content: (
      <div className="space-y-4">
        <p className="text-foreground font-semibold">Melhores práticas para comunicação eficaz:</p>
        <div className="space-y-3">
          <Card className="bg-purple-500/5 border-purple-500/20 p-3">
            <p className="text-xs font-semibold text-purple-400 mb-1">Frequência de Ajustes</p>
            <p className="text-xs">Macro check semanal (peso + fotos) | Ajuste fino a cada 2 semanas | Revisão de protocolo mensal</p>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20 p-3">
            <p className="text-xs font-semibold text-blue-400 mb-1">Red Flags — Quando Intervir</p>
            <p className="text-xs">Perda > 1% peso/semana | Compulsão recorrente | Humor/sono muito alterados | Amenorreia | Lesão recorrente</p>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20 p-3">
            <p className="text-xs font-semibold text-green-400 mb-1">Modelo de Feedback</p>
            <p className="text-xs">1. Validar esforço → 2. Destacar progresso → 3. Ajuste específico → 4. Motivação contextual</p>
          </Card>
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Alertas de Atenção:</p>
          <ul className="space-y-1">
            {[
              "Cliente sem registrar refeições > 3 dias",
              "Queda abrupta de peso sem justificativa",
              "Relato de compulsão alimentar recorrente",
              "Sinais de overtraining (FC repouso ↑, performance ↓)",
              "Resistência a seguir protocolo por > 2 semanas",
            ].map((s, i) => (
              <li key={i} className="flex gap-2"><AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "templates-resposta",
    title: "Templates de Resposta para Clientes",
    icon: <FileText className="w-4 h-4 text-orange-500" />,
    badge: "Templates",
    badgeColor: "text-orange-500 border-orange-500/30",
    content: (
      <div className="space-y-4">
        <p>Modelos de resposta prontos para copiar e enviar aos seus clientes.</p>
        <Card className="bg-muted/30 border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-1">📋 Ajuste de Macros</p>
          <p className="text-xs font-mono">"Analisando seus dados da semana, vamos ajustar: Proteína → Xg | Carb → Xg | Gordura → Xg. Motivo: [adaptação/progresso/platô]. Mantenha por 7 dias e me envie o próximo check."</p>
        </Card>
        <Card className="bg-muted/30 border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-1">📋 Feedback Semanal Positivo</p>
          <p className="text-xs font-mono">"Excelente semana! Consistência de X%. Destaque: [ponto forte]. Próximo foco: [ajuste específico]. Continue assim — o progresso está claro nos dados."</p>
        </Card>
        <Card className="bg-muted/30 border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-1">📋 Resposta para Dificuldade</p>
          <p className="text-xs font-mono">"Entendo a dificuldade com [X]. Isso é normal na fase [Y]. Vamos ajustar: [ação 1] + [ação 2]. Lembre-se que [dado motivacional]. Estou acompanhando de perto."</p>
        </Card>
      </div>
    ),
  },
  {
    id: "metricas",
    title: "Métricas de Acompanhamento",
    icon: <BarChart3 className="w-4 h-4 text-cyan-500" />,
    badge: "KPIs",
    badgeColor: "text-cyan-500 border-cyan-500/30",
    content: (
      <div className="space-y-4">
        <p>Indicadores-chave para monitorar progresso dos clientes.</p>
        <ProtocolTable rows={[
          { name: "Adesão ao plano", dose: "% refeições registradas", timing: "Semanal", notes: "Meta: acima de 80%" },
          { name: "Variação de peso", dose: "Média móvel 7 dias", timing: "Diário → semanal", notes: "0.5-1% peso/semana cutting" },
          { name: "Consistência Score", dose: "Score 0-100", timing: "Semanal", notes: "Algoritmo NUTRION" },
          { name: "Qualidade alimentar", dose: "Score refeição 1-5", timing: "Por refeição", notes: "Média acima de 3.5" },
          { name: "Hidratação", dose: "ml/kg peso", timing: "Diário", notes: "Meta 35-45ml/kg" },
          { name: "Sono", dose: "Horas + qualidade", timing: "Diário", notes: "Meta: 7h+, qualidade 3+" },
          { name: "Nível de energia", dose: "Score 1-10", timing: "Diário", notes: "Alerta se abaixo de 5 por 3+ dias" },
        ]} />
      </div>
    ),
  },
];

const LabCoachMode = ({ onAskApex }: LabCoachModeProps) => {
  const { role, hasAccess } = usePlanGate();
  const [searchTerm, setSearchTerm] = useState("");

  const isCoachOrPro = role === "coach" || role === "admin" || hasAccess("ON PRO");

  if (!isCoachOrPro) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
          <Lock className="w-8 h-8 text-primary/40" />
        </div>
        <h3 className="text-base font-bold text-foreground">Modo Coach</h3>
        <p className="text-xs text-muted-foreground max-w-xs leading-relaxed">
          Recurso exclusivo para coaches ON PRO. Protocolos e ferramentas para gestão de clientes.
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
          placeholder="Buscar protocolos, templates, métricas..."
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
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded-lg hover:bg-primary/5 hover:text-primary hover:border-primary/30 transition-all"
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
          <SectionCard key={section.id} section={section} onAskApex={onAskApex} />
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

export default LabCoachMode;
