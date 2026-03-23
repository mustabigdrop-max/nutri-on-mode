import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, ChevronDown, ChevronUp, Zap, Flame, Brain, Heart,
  Shield, Moon, Eye, Dna, Pill, Activity, Droplets, Bone,
  Bug, Sparkles, FlaskConical, Syringe, AlertTriangle, Target,
  TrendingUp, HeartPulse, Clock, Leaf,
} from "lucide-react";

interface PeptideSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: PeptideSection }) => {
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

const PeptideTable = ({ headers, rows }: { headers: string[]; rows: string[][] }) => (
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

const PEPTIDE_SECTIONS: PeptideSection[] = [
  // ── SEÇÃO 1: SECRETAGOGOS DE GH ──
  {
    id: "secretagogos-gh",
    title: "Secretagogos de GH (GHRPs & GHRHs)",
    icon: <Zap className="w-4 h-4 text-primary" />,
    badge: "Seção 1",
    content: (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">GHRPs — Agonistas do Receptor de Ghrelina</p>
          <p>Estimulam a hipófise a liberar GH. Cada variante tem perfil único de colaterais e potência.</p>
        </div>

        <PeptideTable
          headers={["Peptídeo", "Dose", "Meia-vida", "Fome", "Cortisol/PRL", "Melhor Uso"]}
          rows={[
            ["GHRP-2", "100-300mcg SC 2-3x/dia", "15-60 min", "Alta", "Leve elevação", "Offseason"],
            ["GHRP-6", "100-300mcg SC 2-3x/dia", "15-60 min", "EXTREMA", "Elevação moderada", "Hardgainers (offseason)"],
            ["Ipamorelin", "200-300mcg SC 2-3x/dia", "~2h", "Mínima", "SEM elevação", "⭐ Mais seguro — cutting/bulking"],
            ["Hexarelin", "100-200mcg SC 2x/dia", "70 min", "Moderada", "Elevação significativa", "GH máximo + cardioprotecão"],
            ["MK-677 (oral)", "10-25mg oral 1x/dia", "24h", "Moderada", "Sem cortisol/PRL", "Conveniência (oral)"],
          ]}
        />

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">⭐ Ipamorelin — O Mais Recomendado</p>
          <p>Único GHRP sem elevação de cortisol, prolactina ou fome intensa. Pulso limpo de GH. Versátil para cutting e bulking.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">MK-677 (Ibutamoren) — O Oral</p>
          <p>Único secretagogo de GH oral. Dose diária única antes de dormir. Eleva GH e IGF-1 cronicamente. Monitorar glicemia (resistência insulínica com uso prolongado). Ciclo: 4-6 meses on / 2 meses off.</p>
        </div>

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mt-4">
          <p className="font-bold text-foreground">GHRHs — Análogos do Hormônio Liberador de GH</p>
          <p>Estimulam via receptor GHRH. Mais fisiológicos que GH exógeno.</p>
        </div>

        <PeptideTable
          headers={["Peptídeo", "Dose", "Meia-vida", "Diferencial", "Melhor Uso"]}
          rows={[
            ["Sermorelin (GRF 1-29)", "200-500mcg SC 1-2x/dia", "10-20 min", "Mais fisiológico, não suprime eixo", "Longevidade (>40 anos)"],
            ["MOD GRF 1-29 (CJC sem DAC)", "100-200mcg SC (com GHRP)", "30 min", "Amplifica GHRPs 2-10x", "⭐ Protocolo mais popular"],
            ["CJC-1295 COM DAC", "1-2mg SC 1-2x/semana", "6-8 DIAS", "Conveniência semanal, GH contínuo", "Praticidade"],
            ["Tesamorelin", "1-2mg SC 1x/dia", "26-38 min", "APROVADO FDA — gordura visceral", "Gordura visceral + cognição"],
          ]}
        />

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">🏆 Combinação Clássica: MOD GRF 1-29 + Ipamorelin</p>
          <p>200mcg + 200mcg SC, 3x/dia em jejum (acordar + pós-treino + pré-sono). O protocolo de peptídeo mais popular e mais estudado do mundo. Sinergia: GHRH + GHRP = pulso de GH 2-10x maior que isolado.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">⚠️ Timing obrigatório para todos os secretagogos:</p>
          <p>Jejum de 2h antes e 30min depois. Insulina elevada bloqueia o pulso de GH. Gordura na refeição anterior também reduz o pulso.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 2: GLP-1 E ANÁLOGOS METABÓLICOS ──
  {
    id: "glp1-analogos",
    title: "GLP-1 e Análogos Metabólicos",
    icon: <Flame className="w-4 h-4 text-orange-500" />,
    badge: "Seção 2",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Fármaco", "Dose", "Via/Freq", "Mecanismo", "Perda de Peso", "Status"]}
          rows={[
            ["Semaglutida", "0.25→2.4mg", "SC semanal", "GLP-1R", "~15%", "✅ FDA (Wegovy/Ozempic)"],
            ["Liraglutida", "0.6→3mg", "SC diário", "GLP-1R", "~8%", "✅ FDA (Saxenda/Victoza)"],
            ["Dulaglutida", "0.75→4.5mg", "SC semanal", "GLP-1R", "~4-6kg", "✅ FDA (Trulicity)"],
            ["Tirzepatida", "2.5→15mg", "SC semanal", "GLP-1R + GIPR", "~20-22%", "✅ FDA (Mounjaro/Zepbound)"],
            ["Retatrutida", "Titulação até 12mg", "SC semanal", "GLP-1R + GIPR + GcgR", "~24%", "🔬 Fase 3"],
            ["CagriSema", "Semaglutida + Cagrilintide", "SC semanal", "GLP-1R + Amilina", "~25%", "🔬 Fase 3"],
            ["Orforglipron", "3-45mg", "ORAL diário", "GLP-1R (não-peptídico)", "~15%", "🔬 Fase 3 (2025-26)"],
            ["Survodutide", "Titulação", "SC semanal", "GLP-1R + GcgR", "~19%", "🔬 Fase 3 (NASH)"],
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">Titulação da Semaglutida</p>
          <p>0.25 → 0.5 → 1.0 → 1.7 → 2.4mg, a cada 4 semanas. Mesmo dia da semana, rotacionar local de injeção. Colaterais GI melhoram com titulação gradual.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">Orforglipron — O Futuro Oral</p>
          <p>Primeiro GLP-1R agonista não-peptídico oral da Eli Lilly. Sem necessidade de injeção. Estimativa de disponibilidade: 2025-2026. Pode democratizar o acesso.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 3: RECUPERAÇÃO E REPARO ──
  {
    id: "recuperacao-reparo",
    title: "Peptídeos de Recuperação e Reparo",
    icon: <Shield className="w-4 h-4 text-green-500" />,
    badge: "Seção 3",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Via", "Alvo Principal", "Diferencial"]}
          rows={[
            ["BPC-157", "250-500mcg/dia", "SC ou oral", "Universal (tendão, GI, SNC)", "⭐ Mais seguro, mais versátil"],
            ["TB-500", "2-2.5mg 2x/sem", "SC", "Tecido conjuntivo, flexibilidade", "Migração celular + angiogênese"],
            ["Thymosin Alpha-1", "1.6mg 2x/sem", "SC", "Imunidade (T-cells, NK)", "Aprovado 35+ países (Hepatite)"],
            ["LL-37", "100-200mcg", "SC/tópico", "Antimicrobiano, feridas", "Imunidade inata, anti-biofilm"],
            ["KPV", "500mcg-1mg/dia", "SC", "Anti-inflamatório intestinal", "IBD, Crohn — inibe NF-κB"],
            ["Larazotide", "0.25-1mg 3x/dia", "Oral", "Tight junctions (leaky gut)", "Fase 3 para doença celíaca"],
          ]}
        />

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">🐺 WOLVERINE STACK — Recuperação Máxima</p>
          <p><strong>BPC-157:</strong> 250mcg SC manhã + <strong>TB-500:</strong> 2mg SC 2x/semana. Duração: 4-8 semanas. Indicado para lesão aguda/crônica, pós-cirurgia, tendinopatia e desgaste articular.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">BPC-157 — Via Oral vs SC</p>
          <p><strong>Oral:</strong> efeito GI + sistêmico (menor concentração). Ideal para úlceras, leaky gut, IBD.</p>
          <p><strong>SC:</strong> efeito sistêmico maior. Ideal para lesões distantes do trato GI (tendão, músculo, articulação).</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">KPV + BPC-157 — Protocolo GI</p>
          <p>Sinergia para IBD/Crohn: KPV inibe NF-κB e citocinas enquanto BPC-157 repara mucosa via prostaglandinas e fatores de crescimento.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 4: PEPTÍDEOS SEXUAIS ──
  {
    id: "sexuais-funcao",
    title: "Peptídeos Sexuais e Função Erétil",
    icon: <HeartPulse className="w-4 h-4 text-pink-500" />,
    badge: "Seção 4",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Para Quem", "Status"]}
          rows={[
            ["PT-141 (Bremelanotide)", "0.5-2mg SC 2-4h antes", "MC3R/MC4R — SNC (dopaminérgico)", "DE psicogênica, disfunção sexual feminina", "✅ FDA (Vyleesi)"],
            ["Melanotan II", "0.25-1mg SC", "MC1-4R (não seletivo)", "Bronzeamento + libido + apetite↓", "⚠️ Monitorar pintas/melanoma"],
            ["Melanotan I", "16mg implante SC", "MC1R seletivo (melanina)", "Fotoproteção real, sem efeitos sexuais", "✅ FDA (Scenesse)"],
            ["Kisspeptin-10", "1-10mcg/kg SC", "GnRH → LH → Testosterona", "Infertilidade masc., hipogonadismo", "Clínico/off-label"],
            ["Gonadorelin (GnRH)", "100mcg SC 2x/dia", "Análogo GnRH pulsátil", "Preservação testicular em TRT", "Aprovado"],
            ["HCG", "250-1500UI SC 2-3x/sem", "Mimetiza LH → Leydig", "TRT (preservar testículo), TPC", "Aprovado"],
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">PT-141 — Quando PDE5i Falham</p>
          <p>Age no SNC (dopamina) — não vascular. Ideal para DE psicogênica ou resistente a Cialis/Viagra. Tomar ondansetrona 4mg antes para prevenir náusea. Máximo 1x/72h.</p>
        </div>

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">⚠️ Melanotan II — CONTRAINDICADO em histórico de melanoma</p>
          <p>Estimula melanina em pintas existentes. Monitoramento dermatológico obrigatório. Não confundir com MT-I (mais seguro, seletivo).</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 5: NEUROLÓGICOS E COGNITIVOS ──
  {
    id: "neurologicos-cognitivos",
    title: "Peptídeos Neurológicos e Cognitivos",
    icon: <Brain className="w-4 h-4 text-purple-500" />,
    badge: "Seção 5",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Via", "Mecanismo", "Melhor Para"]}
          rows={[
            ["Semax", "300-600mcg", "Intranasal/SC", "ACTH(4-7) → BDNF/NGF, dopamina", "Foco extremo, neuroproteção"],
            ["N-Acetil Semax Amidate", "100-300mcg", "Intranasal", "Versão potente do Semax", "Maior potência, menor dose"],
            ["Selank", "250-500mcg", "Intranasal/SC", "Tuftsin → GABA-A, BDNF, serotonina", "Ansiedade sem sedação"],
            ["Noopept (GVS-111)", "10-30mg 2x/dia", "Oral/sublingual", "AMPA/NMDA, BDNF/NGF, ACh", "Memória, cognição"],
            ["Dihexa", "10-30mcg/dia", "Oral/intranasal", "HGF/Met — 7x mais potente que BDNF", "⚠️ Experimental — supervisão"],
            ["Cerebrolysin", "5-20mL IV/IM 10-20 dias", "IV/IM", "Peptídeos neurotróficos mistos", "AVC, Alzheimer, TCE (50+ países)"],
            ["P21", "200-300mcg SC/dia", "SC", "CNTF → neurogênese, BDNF", "🔬 Emergente"],
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">🧠 Selank + Semax — Combinação Clássica</p>
          <p>Selank (ansiolítico + imuno) + Semax (foco + neuro) = foco sem ansiedade. Protocolo: Selank intranasal manhã → Semax 30min depois. Aprovados na Rússia para uso clínico.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">Noopept — Combinar com Alpha-GPC</p>
          <p>Alpha-GPC 300mg previne cefaleia (efeito colinérgico). Não usar à noite (estimulante). Aprovado na Rússia como nootrópico.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 6: LONGEVIDADE ──
  {
    id: "longevidade",
    title: "Peptídeos de Longevidade",
    icon: <Dna className="w-4 h-4 text-emerald-500" />,
    badge: "Seção 6",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Ciclo", "Mecanismo", "Benefício Principal"]}
          rows={[
            ["Epithalon", "5-10mg SC/dia × 10-20 dias", "2x/ano", "Telomerase → alonga telômeros", "⭐ Longevidade + melatonina"],
            ["SS-31 (Elamipretide)", "5-10mg SC/dia", "Contínuo ou ciclos", "Cardiolipina mitocondrial", "Mitocôndria + energia celular"],
            ["MOTS-c", "10mg SC 5x/sem", "Contínuo ou ciclos", "Peptídeo mitocondrial → AMPK", "Reset metabólico + exercício-mimético"],
            ["Humanin", "1-2mg SC/dia", "Ciclos 10-20 dias", "Anti-apoptótico mitocondrial", "Neuroproteção + cardioproteção"],
            ["Thymalin", "10mg SC/dia × 10 dias", "2x/ano", "Restaura timo → T-cells, NK", "Imunidade anti-aging"],
            ["Pinealon", "5-10mg SC/dia × 10 dias", "2x/ano", "Tripeptídeo pineal → neuroproteção", "Sono + anti-aging cerebral"],
          ]}
        />

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">🏆 Protocolo Khavinson de Longevidade</p>
          <p>2x por ano (Janeiro + Julho), 10 dias cada ciclo:</p>
          <ul className="list-disc pl-4 mt-1 space-y-0.5">
            <li><strong>Epithalon:</strong> 10mg SC/dia (telômeros + pineal)</li>
            <li><strong>Thymalin:</strong> 10mg SC/dia (imunidade + timo)</li>
            <li><strong>Cortagen:</strong> 10mg SC/dia (neuroproteção)</li>
            <li>+ peptídeo do órgão-alvo com problema (ver tabela Khavinson)</li>
          </ul>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">Epithalon — Dr. Vladimir Khavinson</p>
          <p>Tetrapeptídeo (Ala-Glu-Asp-Gly). 40+ anos de pesquisa. Ativa telomerase, regula glândula pineal, aumenta melatonina endógena. Perfil de segurança excelente.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 7: CARDIOVASCULARES ──
  {
    id: "cardiovasculares",
    title: "Peptídeos Cardiovasculares",
    icon: <Heart className="w-4 h-4 text-red-500" />,
    badge: "Seção 7",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Status"]}
          rows={[
            ["SS-31", "5-10mg SC/dia", "Protege cardiolipina mitocondrial", "Fase 3 (IC, Barth)"],
            ["Hexarelin", "100-200mcg SC 2x/dia", "GHS-R1a no coração — cardioprotetor direto", "Off-label"],
            ["Cardiogen (Khavinson)", "10mg SC × 10 dias", "Peptídeo cardíaco — cardiomiócitos", "Khavinson protocol"],
            ["Carnosina", "500mg-2g oral 2x/dia", "Antioxidante, anti-glicação, tampão H+", "Suplemento oral seguro"],
            ["Acetil-Carnosina", "Similar", "Penetra BHE — neuroproteção + catarata", "Tópico oftálmico + oral"],
            ["BPC-157", "250-500mcg SC", "Proteção vascular, NO, angiogênese", "Off-label"],
          ]}
        />

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">Emergentes Cardiovasculares</p>
          <p><strong>Apelin:</strong> inotropia positiva + vasodilatação (receptores APJ). <strong>Cortistatin:</strong> anti-inflamatório cardíaco. <strong>Urocortin:</strong> Fase 2 para IC. <strong>TB-4 Sulfóxido:</strong> regeneração de cardiomiócitos.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 8: GASTROINTESTINAIS ──
  {
    id: "gastrointestinais",
    title: "Peptídeos Gastrointestinais",
    icon: <Droplets className="w-4 h-4 text-amber-500" />,
    badge: "Seção 8",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Via", "Indicação Principal"]}
          rows={[
            ["BPC-157", "250-500mcg", "SC ou oral", "⭐ Universal GI — úlceras, IBD, leaky gut"],
            ["KPV", "500mcg-1mg/dia", "SC", "IBD, Crohn — anti-inflamatório via MC receptors"],
            ["VIP", "50-200mcg", "IM/nasal", "SIBO, CIRS, Crohn — vasoativo + anti-inflamatório"],
            ["Larazotide", "0.25-1mg 3x/dia", "Oral", "Leaky gut, doença celíaca (Fase 3)"],
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">VIP — Protocolo Dr. Shoemaker (CIRS)</p>
          <p>Vasoactive Intestinal Peptide: broncodilatador, anti-inflamatório, regulação circadiana, imunidade intestinal. Usado para SIBO crônico e síndrome de inflamação crônica por mold/bolores. Colateral: hipotensão transitória.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 9: MUSCULARES ESPECÍFICOS ──
  {
    id: "musculares",
    title: "Peptídeos Musculares Específicos",
    icon: <Activity className="w-4 h-4 text-blue-500" />,
    badge: "Seção 9",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Risco", "Uso"]}
          rows={[
            ["IGF-1 LR3", "20-50mcg SC/dia", "IGF-1 longa ação — hiperplasia", "Hipoglicemia, órgãos", "Avançado"],
            ["DES-IGF-1", "1mcg/kg IM (local)", "10x mais potente que IGF-1 nativo", "Hipoglicemia, órgãos", "Avançado — local"],
            ["PEGylated MGF", "100-200mcg SC 2x/sem", "Ativa células satélite musculares", "Moderado", "Reparo + hiperplasia"],
            ["Follistatin-344", "100mcg IM 1x/sem", "Inibe miostatina (sem freio muscular)", "⚠️ ALTO — dados insuficientes", "Experimental"],
          ]}
        />

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">⚠️ Follistatin-344 — Alto Risco</p>
          <p>Inibe miostatina (o "freio" do crescimento muscular). Estudos em animais: crescimento dramático. Humanos: muito poucos dados. Crescimento de estruturas não desejadas (órgãos). Impacto cardíaco desconhecido. NÃO recomendar sem supervisão especializada.</p>
        </div>

        <div className="bg-muted/30 p-3 rounded-lg">
          <p className="font-bold text-foreground mb-1">PEGylated MGF + IGF-1 LR3 = Hiperplasia Máxima</p>
          <p>MGF ativa células satélite (novas células musculares) → IGF-1 LR3 as amadurece. Combinação sinérgica para crescimento muscular avançado. Supervisão médica obrigatória.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 10: QUEIMA DE GORDURA ──
  {
    id: "queima-gordura",
    title: "Peptídeos de Queima de Gordura",
    icon: <Flame className="w-4 h-4 text-red-400" />,
    badge: "Seção 10",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Segurança"]}
          rows={[
            ["AOD-9604", "300mcg SC/dia (manhã jejum)", "Fragmento GH (176-191) — lipólise seletiva", "⭐ Mais seguro dos lipolíticos"],
            ["5-Amino-1MQ", "50-100mg oral/dia", "Inibidor NNMT → NAD+ → SIRT1/AMPK", "🔬 Emergente"],
            ["CJC-1295 + Ipamorelin", "200mcg cada SC 3x/dia", "GH → lipólise via receptor β3", "Bem estabelecido"],
            ["MOTS-c", "10mg SC 5x/sem", "Mitocondrial → AMPK → metabolismo", "Emergente — dados promissores"],
          ]}
        />

        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">AOD-9604 — O Mais Seguro</p>
          <p>Fragmento C-terminal do GH que ativa APENAS o receptor de lipólise. SEM efeitos anabólicos, SEM impacto na glicemia, SEM elevação de IGF-1. Aprovado na Austrália (Metabolase). Ideal para cutting sem perda muscular ou gordura localizada resistente.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 11: PELE, CABELO E COLÁGENO ──
  {
    id: "pele-cabelo",
    title: "Peptídeos de Pele, Cabelo e Colágeno",
    icon: <Sparkles className="w-4 h-4 text-pink-400" />,
    badge: "Seção 11",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose/Via", "Mecanismo", "Indicação"]}
          rows={[
            ["GHK-Cu (tópico)", "Creme 1-5%", "Colágeno, DNA repair, antioxidante", "⭐ Anti-aging pele + cabelo"],
            ["GHK-Cu (SC)", "1-2mg SC/dia", "Sistêmico: anti-inflamatório + reparo", "Anti-aging sistêmico"],
            ["Matrixyl", "Tópico", "Colágeno tipo I e IV + fibronectina", "Rugas, firmeza"],
            ["Argireline", "Tópico", "Inibe ACh → relaxamento facial (botox-like)", "Rugas de expressão"],
            ["SNAP-8", "Tópico", "Similar Argireline (8 AA, mais potente)", "Anti-aging facial"],
            ["EGF", "Tópico ou SC 10-20mcg", "Proliferação epitelial, EGFR", "Cicatrizes, pós-procedimento"],
            ["TB-500 tópico", "Tópico local", "Reparo de feridas + folículos", "Cicatrização + cabelo"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 12: SONO ──
  {
    id: "sono",
    title: "Peptídeos de Sono",
    icon: <Moon className="w-4 h-4 text-indigo-400" />,
    badge: "Seção 12",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Benefício"]}
          rows={[
            ["DSIP", "100-200mcg SC/IV 30-60min antes", "Induz sono delta (N3 profundo)", "Insônia, cortisol↓, antioxidante"],
            ["Ipamorelin (pré-sono)", "200mcg SC", "GH noturno amplificado", "Sono + recovery + GH"],
            ["MK-677 (pré-sono)", "10-25mg oral", "GH contínuo noturno", "Sono profundo + recovery"],
            ["Epithalon", "Ciclos 10 dias", "Regulação pineal → melatonina↑", "Ciclo circadiano + melatonina"],
            ["Pinealon", "5-10mg SC × 10 dias", "Peptídeo pineal (Khavinson)", "Sono + neuroproteção"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 13: IMUNOLÓGICOS ──
  {
    id: "imunologicos",
    title: "Peptídeos Imunológicos",
    icon: <Shield className="w-4 h-4 text-cyan-500" />,
    badge: "Seção 13",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Indicação"]}
          rows={[
            ["Thymosin Alpha-1", "1.6mg SC 2x/sem", "T-helper, NK cells, Th1", "⭐ Imunidade, Hepatite, adjuvante oncológico"],
            ["Thymalin", "10mg SC × 10 dias", "Restaura timo → T-cells completas", "Anti-aging imunológico"],
            ["Vilon", "10mcg SC × 10 dias", "Dipeptídeo Lys-Glu → imunomodulação", "Longevidade + imunidade"],
            ["LL-37", "100-200mcg SC/tópico", "Antimicrobiano inato, anti-biofilm", "Infecções resistentes, feridas"],
            ["Lactoferrina bovina", "200-300mg oral 2x/dia", "Quelante de ferro, antimicrobiano", "Imunidade, respiratório, H. pylori"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 14: ÓSSEOS ──
  {
    id: "osseos",
    title: "Peptídeos Ósseos",
    icon: <Bone className="w-4 h-4 text-stone-400" />,
    badge: "Seção 14",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Mecanismo", "Status"]}
          rows={[
            ["PTH 1-34 (Teriparatida)", "20mcg SC/dia", "Estimula osteoblastos → CONSTRÓI osso", "✅ FDA (Forteo) — max 2 anos"],
            ["Abaloparatida", "20-50mcg SC/dia", "Similar à teriparatida", "✅ FDA (Tymlos)"],
            ["Sigumir (Khavinson)", "SC/oral × 10 dias", "Peptídeo cartilaginoso", "Artrose, desgaste articular"],
          ]}
        />

        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <p className="font-bold text-destructive">⚠️ Teriparatida — Máximo 2 anos de uso</p>
          <p>Risco teórico de osteossarcoma em uso prolongado (dados em ratos). Único agente que CONSTRÓI osso (bifosfonatos apenas conservam). Monitorar cálcio sérico.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 15: ANTIVIRAIS E ANTIMICROBIANOS ──
  {
    id: "antivirais",
    title: "Peptídeos Antivirais e Antimicrobianos",
    icon: <Bug className="w-4 h-4 text-lime-500" />,
    badge: "Seção 15",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Dose", "Espectro", "Status"]}
          rows={[
            ["Thymosin Alpha-1", "1.6mg SC 2x/sem", "Viral (Hepatite B/C, HIV adj.)", "Aprovado 35+ países"],
            ["LL-37", "100-200mcg", "Amplo espectro: bactérias, vírus", "Off-label"],
            ["Lactoferrina bovina", "200-300mg oral 2x/dia", "Anti-H. pylori, respiratório", "Suplemento seguro"],
            ["Defensinas (HNP-1)", "—", "HIV, HSV, RSV (endógeno)", "🔬 Pesquisa ativa"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 16: CRESCIMENTO CAPILAR ──
  {
    id: "capilar",
    title: "Peptídeos de Crescimento Capilar",
    icon: <Sparkles className="w-4 h-4 text-amber-400" />,
    badge: "Seção 16",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Peptídeo", "Via", "Mecanismo", "Evidência"]}
          rows={[
            ["GHK-Cu", "Tópico", "Estimula folículos, anti-fibrótico", "⭐ Mais estudado"],
            ["PTD-DBM", "Tópico", "Inibe DKK1 → via Wnt (crescimento)", "Estudos coreanos promissores"],
            ["TB-500 tópico", "Tópico", "Reparo folicular + migração celular", "Moderada"],
            ["Follistatin tópico", "Tópico", "Inibe miostatina folicular", "Teórica — dados limitados"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 17: KHAVINSON — SISTEMA COMPLETO ──
  {
    id: "khavinson",
    title: "Protocolo Khavinson — Peptídeos por Órgão",
    icon: <FlaskConical className="w-4 h-4 text-teal-500" />,
    badge: "Seção 17",
    content: (
      <div className="space-y-4">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="font-bold text-foreground">Dr. Vladimir Khavinson (São Petersburgo)</p>
          <p>50+ anos de pesquisa. 200+ peptídeos desenvolvidos. Foco: longevidade e anti-aging órgão-específico. Protocolo: 10 dias de uso, 2x por ano.</p>
        </div>

        <PeptideTable
          headers={["Órgão/Sistema", "Peptídeo", "Dose", "Indicação"]}
          rows={[
            ["Timo (imunidade)", "Thymalin", "10mg SC × 10d", "Imunidade, anti-aging"],
            ["Gl. Pineal (sono)", "Epithalon / Endoluten", "10mg SC × 10d", "Telômeros, melatonina"],
            ["Cérebro", "Cortagen / Cerebramin", "10mg SC × 10d", "Neuroproteção, cognição"],
            ["Retina", "Retinalamin", "5-10mg SC × 10d", "Degeneração macular, glaucoma"],
            ["Coração", "Cardiogen", "10mg SC × 10d", "Cardioproteção, pós-AAS"],
            ["Fígado", "Ovagen / Svetinorm", "10mg SC × 10d", "Hepatoproteção, regeneração"],
            ["Pulmões", "Chonluten / Taxorest", "10mg SC × 10d", "Função respiratória"],
            ["Rins", "Pielotax", "10mg SC × 10d", "Saúde renal"],
            ["Próstata", "Libidon", "Oral × 10d", "Homens > 40 preventivo"],
            ["Cartilagem", "Sigumir", "SC/oral × 10d", "Artrose, articulações"],
            ["Vasos", "Ventfort / Vesugen", "10mg SC × 10d", "Saúde vascular"],
            ["Pâncreas", "Suprefort", "10mg SC × 10d", "Pré-diabetes, DM2"],
            ["Estômago", "Stamakort", "10mg SC × 10d", "Saúde gástrica"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 18: PROTOCOLOS MASTER ──
  {
    id: "protocolos-master",
    title: "Protocolos Master — Combinações",
    icon: <Target className="w-4 h-4 text-primary" />,
    badge: "Seção 18",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-4">
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-3">
          <p className="font-bold text-green-700 dark:text-green-400">🟢 INICIANTE — Primeiro Peptídeo</p>
          <p>BPC-157: 500mcg SC diariamente × 4 semanas. Custo-benefício máximo, risco mínimo. Recuperação + GI + sistêmico.</p>
        </div>

        <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
          <p className="font-bold text-blue-700 dark:text-blue-400">🔵 INTERMEDIÁRIO — GH Pulsátil</p>
          <p>Ipamorelin 200mcg + MOD GRF 1-29 200mcg SC, juntos 3x/dia (acordar + pós-treino + pré-sono, jejum 2h). Duração: 3-6 meses com 1 mês off.</p>
        </div>

        <div className="bg-purple-500/5 border border-purple-500/20 rounded-lg p-3">
          <p className="font-bold text-purple-700 dark:text-purple-400">🟣 AVANÇADO — Performance Completa</p>
          <ul className="list-disc pl-4 space-y-1 mt-1">
            <li><strong>Manhã:</strong> Ipamorelin + MOD GRF 200mcg cada + MOTS-c 10mg + BPC-157 250mcg</li>
            <li><strong>Pós-treino:</strong> Ipamorelin + MOD GRF 200mcg cada + SS-31 5mg + IGF-1 LR3 20-30mcg IM</li>
            <li><strong>Pré-sono:</strong> Ipamorelin + CJC-1295 DAC 200mcg + 1mg</li>
          </ul>
        </div>

        <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
          <p className="font-bold text-amber-700 dark:text-amber-400">🟡 LONGEVIDADE ELITE (2x/ano, 10-20 dias)</p>
          <p>Epithalon 10mg + SS-31 10mg + MOTS-c 10mg + Humanin 2mg + Thymalin 10mg + Pinealon 5mg — todos SC diariamente.</p>
          <p className="mt-1"><strong>Contínuo:</strong> BPC-157 250mcg 5x/sem + Sermorelin 200mcg pré-sono + GHK-Cu tópico.</p>
        </div>

        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-3">
          <p className="font-bold text-red-700 dark:text-red-400">🔴 RECUPERAÇÃO DE LESÃO</p>
          <p>BPC-157 500mcg SC local/dia + TB-500 2.5mg SC 2x/sem + GHK-Cu tópico 2x/dia + Colágeno + Vit C oral. Duração: 6-8 semanas.</p>
        </div>

        <div className="bg-orange-500/5 border border-orange-500/20 rounded-lg p-3">
          <p className="font-bold text-orange-700 dark:text-orange-400">🟠 RESET METABÓLICO</p>
          <p>Retatrutida titulação até 4mg semanal + MOTS-c 10mg 5x/sem + SS-31 5mg 5x/sem + Berberina + Ômega-3 + Vitamina D + Treino de força 3x/sem OBRIGATÓRIO.</p>
        </div>
      </div>
    ),
  },

  // ── SEÇÃO 19: REFERÊNCIA RÁPIDA POR OBJETIVO ──
  {
    id: "referencia-rapida",
    title: "Referência Rápida — Por Objetivo",
    icon: <TrendingUp className="w-4 h-4 text-primary" />,
    badge: "Guia",
    badgeColor: "text-primary border-primary/30",
    content: (
      <div className="space-y-4">
        <PeptideTable
          headers={["Objetivo", "Primeira Escolha", "Segunda Escolha", "Avançado"]}
          rows={[
            ["Força & Músculo", "Ipamorelin + CJC-1295", "BPC-157 + TB-500", "IGF-1 LR3 + PEG-MGF"],
            ["Queima de Gordura", "AOD-9604", "CJC-1295 + Ipamorelin", "Retatrutida / Tirzepatida"],
            ["Recuperação", "BPC-157", "BPC-157 + TB-500 (Wolverine)", "SS-31 + GHK-Cu"],
            ["Sono", "Ipamorelin pré-sono", "MK-677", "DSIP + Epithalon"],
            ["Longevidade", "Epithalon 2x/ano", "SS-31 + MOTS-c", "Protocolo Khavinson completo"],
            ["Cognição & Foco", "Semax", "Selank + Semax", "Dihexa / Cerebrolysin"],
            ["Sexual & Libido", "PT-141", "Kisspeptin-10", "Gonadorelin + HCG"],
            ["Imunidade", "Thymosin Alpha-1", "Thymalin", "LL-37 + Lactoferrina"],
            ["Cardiovascular", "SS-31", "BPC-157", "Cardiogen + Hexarelin"],
            ["GI & Intestinal", "BPC-157 oral", "KPV + BPC-157", "VIP + Larazotide"],
            ["Pele & Cabelo", "GHK-Cu tópico", "TB-500 tópico", "EGF + GH secretagogos"],
            ["Ósseo", "Teriparatida", "Abaloparatida", "Sigumir (Khavinson)"],
          ]}
        />
      </div>
    ),
  },

  // ── SEÇÃO 20: REGRAS FINAIS ──
  {
    id: "regras-finais",
    title: "Regras Finais — Segurança e Qualidade",
    icon: <AlertTriangle className="w-4 h-4 text-destructive" />,
    badge: "CRÍTICO",
    badgeColor: "text-destructive border-destructive/30",
    content: (
      <div className="space-y-3">
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-3">
          <ol className="list-decimal pl-4 space-y-2 text-foreground">
            <li><strong>Conhecer ≠ prescrever irresponsavelmente.</strong> Todo peptídeo potente: acompanhamento médico. Especialmente: IGF-1, Follistatin, GH secretagogos.</li>
            <li><strong>Começar sempre pelo mais seguro:</strong> BPC-157 → Ipamorelin → outros. Nunca começar por IGF-1 ou Follistatin.</li>
            <li><strong>Qualidade é TUDO.</strong> Exigir Certificate of Analysis (CoA). Pureza {">"} 98% por HPLC. Endotoxina: {"<"} 2 EU/mg.</li>
            <li><strong>Ciclar SEMPRE.</strong> Dessensibilização de receptores. On/off = mais eficácia a longo prazo.</li>
            <li><strong>Monitorar biomarcadores</strong> antes e depois: IGF-1, glicemia, hormônios conforme o peptídeo.</li>
            <li><strong>Integrar com estilo de vida.</strong> Sem base (sono, exercício, nutrição): 20% do potencial. Com base: 100%.</li>
            <li><strong>Emergentes com humildade.</strong> Follistatin, Adipotide, Dihexa: poucos dados. Pré-clínico ≠ segurança humana.</li>
            <li><strong>Documentar TUDO.</strong> Protocolo, doses, resultados, colaterais.</li>
            <li><strong>NUNCA em menores de 18</strong> (exceto indicação médica documentada).</li>
            <li><strong>Combinação supera o individual.</strong> Protocolos sinérgicos {">"} doses máximas únicas. BPC-157 + TB-500 {">"} cada um dobrado.</li>
          </ol>
        </div>
      </div>
    ),
  },
];

const QUICK_ACTIONS = [
  { label: "Wolverine Stack completo", q: "Monte o protocolo Wolverine Stack (BPC-157 + TB-500) detalhado com doses, timing, duração e indicações" },
  { label: "GH sem injeção (MK-677)", q: "Protocolo completo de MK-677 oral para GH: dose, timing, ciclo, monitoramento de glicemia e colaterais" },
  { label: "Ipamorelin + CJC-1295", q: "Protocolo detalhado de Ipamorelin + MOD GRF 1-29 (CJC-1295 sem DAC): dose, timing, jejum, duração e resultados esperados" },
  { label: "Protocolo Longevidade Khavinson", q: "Monte o protocolo completo de Khavinson para longevidade: Epithalon + Thymalin + Cortagen com ciclos, doses e timing anual" },
  { label: "Peptídeos para cognição", q: "Compare Semax vs Selank vs Noopept vs Dihexa: mecanismos, doses, combinações e perfil de segurança para otimização cognitiva" },
  { label: "PT-141 para disfunção sexual", q: "Protocolo completo de PT-141 (Bremelanotide): dose, timing, prevenção de náusea, frequência máxima e comparação com PDE5i" },
  { label: "AOD-9604 para gordura", q: "Protocolo de AOD-9604 para lipólise seletiva: dose, timing em jejum, duração do ciclo e o que esperar de resultados" },
  { label: "Peptídeos para intestino (IBD)", q: "Monte protocolo completo para IBD/Crohn usando BPC-157 + KPV + VIP + Larazotide: doses, vias e sinergia" },
  { label: "Comparativo GLP-1 agonistas", q: "Compare Semaglutida vs Tirzepatida vs Retatrutida vs Orforglipron: mecanismo, perda de peso, colaterais, disponibilidade e custo" },
  { label: "Secretagogos de GH — qual escolher?", q: "Compare GHRP-2 vs GHRP-6 vs Ipamorelin vs Hexarelin vs MK-677: potência, colaterais, fome, cortisol e melhor perfil para cada objetivo" },
  { label: "Peptídeos para recuperação pós-cirurgia", q: "Protocolo completo de peptídeos para recuperação pós-cirúrgica: BPC-157, TB-500, GHK-Cu com doses, timing e duração" },
  { label: "SS-31 mitocondrial", q: "Explique o SS-31 (Elamipretide): mecanismo na cardiolipina, doses, benefícios mitocondriais, status FDA e como integrar no protocolo de longevidade" },
];

interface LabPeptideLibraryProps {
  onAskApex: (q: string) => void;
}

const LabPeptideLibrary = ({ onAskApex }: LabPeptideLibraryProps) => {
  const [search, setSearch] = useState("");

  const filtered = PEPTIDE_SECTIONS.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary/10 to-purple-500/10 border border-primary/20 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-1">
          <Syringe className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-black text-foreground tracking-tight">BIBLIOTECA UNIVERSAL DE PEPTÍDEOS</h2>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          O guia mais completo em língua portuguesa. 20 seções • 100+ peptídeos • Protocolos master.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
        <Input
          placeholder="Buscar seção (ex: longevidade, BPC, cognitivo...)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <p className="text-[10px] font-bold text-muted-foreground mb-2 uppercase tracking-wider">⚡ Perguntar ao APEX</p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_ACTIONS.map((a) => (
            <Button
              key={a.label}
              variant="outline"
              size="sm"
              className="text-[10px] h-7 px-2 border-primary/20 hover:bg-primary/10"
              onClick={() => onAskApex(a.q)}
            >
              {a.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-2">
        {filtered.map((section) => (
          <SectionCard key={section.id} section={section} />
        ))}
      </div>

      {/* Philosophy footer */}
      <div className="bg-muted/30 border border-border/40 rounded-lg p-3 text-center">
        <p className="text-[10px] text-muted-foreground italic">
          "Peptídeos são a fronteira entre suplementação e farmacologia. Mais específicos que hormônios, mais seguros que AAS, mais inteligentes que qualquer outro recurso disponível."
        </p>
        <p className="text-[9px] text-muted-foreground mt-1">— Síntese APEX</p>
      </div>
    </div>
  );
};

export default LabPeptideLibrary;
