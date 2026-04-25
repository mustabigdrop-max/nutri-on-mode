import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ChevronDown, ChevronUp, AlertTriangle, Shield, Brain, Dumbbell, Syringe, Pill, FlaskConical, Leaf, Clock, Bug, ShieldAlert, HeartPulse } from "lucide-react";
import MicrobiomeScoreCalculator from "./MicrobiomeScoreCalculator";

interface MicrobiotaSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  badge?: string;
  badgeColor?: string;
  content: React.ReactNode;
}

const SectionCard = ({ section }: { section: MicrobiotaSection }) => {
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

const sections: MicrobiotaSection[] = [
  {
    id: "conceito",
    title: "Conceito Fundamental",
    icon: <FlaskConical className="w-4 h-4 text-primary" />,
    badge: "Base",
    content: (
      <div className="space-y-3">
        <p className="text-foreground font-semibold">A microbiota intestinal é o fator mais subestimado no bodybuilding.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {[
            "70-80% do sistema imune está no intestino (GALT)",
            "Produz vitaminas (K2, B12, B9, B7)",
            "Converte compostos em formas bioativas",
            "Regula inflamação sistêmica (eixo intestino-imune)",
            "Produz neurotransmissores (90% serotonina é intestinal)",
            "Regula permeabilidade intestinal (barreira mucosa)",
            "Metaboliza e recircula hormônios (eixo entero-hepático)",
            "Determina absorção real de nutrientes e suplementos",
            "Produz SCFAs — combustível dos colonócitos",
          ].map((item, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span className="text-primary mt-0.5">▸</span>
              <span>{item}</span>
            </div>
          ))}
        </div>
        <Card className="bg-primary/5 border-primary/20 p-3 mt-2">
          <p className="text-xs font-mono text-primary">
            Microbiota saudável = absorção proteína +40% | creatina +30% | B12 endógena | inflamação ↓ | recuperação ↑ | testosterona ↑
          </p>
        </Card>

        <div className="pt-2">
          <p className="text-foreground font-semibold mb-2">🧬 Microbiota e compostos anabólicos</p>
          <ProtocolTable rows={[
            { name: "Testosterona exógena", dose: "Reduz diversidade -20%", timing: "—", notes: "Rotação de cepas obrigatória" },
            { name: "Nandrolona (NPP)", dose: "Altera motilidade", timing: "—", notes: "Probiótico pró-cinético" },
            { name: "Hemogenin (17AA)", dose: "Altera bile acids", timing: "—", notes: "Kefir dose dupla + butirato" },
            { name: "Metformina", dose: "✅ Aumenta Akkermansia", timing: "—", notes: "Potencializar com FOS" },
            { name: "IGF-1 Des", dose: "✅ Repara epitélio", timing: "—", notes: "Sinergia com glutamina" },
            { name: "SLU-PP-332", dose: "✅ Ativa ERRα intestinal", timing: "—", notes: "Sinergia com urolitina A" },
            { name: "CJC/Ipamorelin", dose: "Neutro", timing: "—", notes: "Manter protocolo base" },
          ]} />
        </div>

        <Card className="bg-green-500/5 border-green-500/20 p-3">
          <p className="text-xs font-semibold text-green-400 mb-1">📈 Microbiota otimizada vs degradada (atleta):</p>
          <ul className="text-xs space-y-0.5">
            <li>▸ Absorção de proteína: <span className="text-green-400">+18%</span> (Nature Metabolism 2023)</li>
            <li>▸ Absorção de creatina: <span className="text-green-400">+30%</span> (via transportador)</li>
            <li>▸ Síntese proteica muscular: <span className="text-green-400">+18%</span></li>
            <li>▸ Recuperação pós-treino: <span className="text-green-400">-23% de tempo</span></li>
            <li>▸ Testosterona endógena: <span className="text-green-400">+15%</span> via L. reuteri</li>
            <li>▸ Cortisol crônico: <span className="text-green-400">-25%</span> via B. longum R0175</li>
          </ul>
        </Card>
      </div>
    ),
  },
  {
    id: "avaliacao",
    title: "Avaliação da Microbiota",
    icon: <Search className="w-4 h-4 text-yellow-500" />,
    badge: "Diagnóstico",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Sintomas Digestivos:</p>
          <ul className="space-y-1">
            {["Gases excessivos após refeições proteicas", "Distensão abdominal crônica", "Alternância diarreia/constipação", "Fezes mal formadas (Bristol < 3 ou > 5)", "Digestão lenta (peso pós-refeição)", "Refluxo frequente", "Intolerâncias alimentares progressivas"].map((s, i) => (
              <li key={i} className="flex gap-2"><AlertTriangle className="w-3 h-3 text-yellow-500 mt-0.5 shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Sintomas Sistêmicos:</p>
          <ul className="space-y-1">
            {["Recuperação muscular lenta sem razão aparente", "Inflamação crônica (PCR elevada sem causa)", "Candida recorrente", "Acne que não responde a tópicos", "Fadiga mental após refeições", "Humor instável", "Alergias novas na fase adulta", "Imunidade baixa", "Absorção ruim de suplementos"].map((s, i) => (
              <li key={i} className="flex gap-2"><AlertTriangle className="w-3 h-3 text-orange-500 mt-0.5 shrink-0" />{s}</li>
            ))}
          </ul>
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">10 Fatores que Destroem a Microbiota:</p>
          <ol className="space-y-1 list-decimal list-inside">
            {["Antibióticos (recuperação 2-3 anos sem intervenção)", "Anabolizantes orais 17AA (alteração pH intestinal)", "IBPs crônicos (Omeprazol)", "AINEs crônicos (Ibuprofeno, Diclofenaco)", "Dieta hiperproteica sem fibra", "Álcool em offseason", "Estresse crônico (cortisol → disbiose)", "Sono inadequado", "Água clorada em excesso", "Adoçantes artificiais (Sucralose, Aspartame, Sacarina)"].map((f, i) => (
              <li key={i}>{f}</li>
            ))}
          </ol>
        </div>

        <MicrobiomeScoreCalculator />
      </div>
    ),
  },
  {
    id: "exames",
    title: "Exames — Diagnóstico",
    icon: <HeartPulse className="w-4 h-4 text-red-400" />,
    badge: "Laboratorial",
    badgeColor: "text-red-400 border-red-400/30",
    content: (
      <div className="space-y-4">
        <div>
          <p className="text-foreground font-semibold mb-2">Básico (qualquer laboratório):</p>
          <ProtocolTable rows={[
            { name: "Parasitológico de fezes", dose: "3 amostras", timing: "—" },
            { name: "Coprocultura + antibiograma", dose: "—", timing: "—" },
            { name: "H. pylori", dose: "Fezes ou respiratório", timing: "—" },
            { name: "Calprotectina fecal", dose: "Inflamação intestinal", timing: "—" },
            { name: "Zonulina sérica", dose: "Permeabilidade intestinal", timing: "—" },
            { name: "sIgA fecal", dose: "Imunidade mucosa", timing: "—" },
            { name: "Lactulose/Manitol", dose: "Leaky gut", timing: "Urinário" },
          ]} />
        </div>
        <div>
          <p className="text-foreground font-semibold mb-2">Avançado (especializado):</p>
          <ProtocolTable rows={[
            { name: "Microbiome mapping", dose: "16S rRNA", timing: "Viomics/Genova" },
            { name: "SIBO breath test", dose: "H2 + Metano", timing: "—" },
            { name: "Ácidos orgânicos urinários", dose: "Great Plains Lab", timing: "Candida, B vitamins" },
            { name: "SCFA fecais", dose: "Butirato/Propionato/Acetato", timing: "—" },
          ]} />
        </div>

        <Card className="bg-red-500/5 border-red-500/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-red-400">📋 Interpretação dos valores — atletas com protocolo anabólico</p>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-foreground font-medium">Calprotectina fecal:</p>
              <p>▸ Normal população: &lt; 50 mcg/g</p>
              <p>▸ Atleta com EAA: aceitar até <span className="text-yellow-500">80 mcg/g</span> (inflamação leve esperada)</p>
              <p>▸ Alerta: <span className="text-red-400">&gt; 150 mcg/g</span> = investigar</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Zonulina sérica:</p>
              <p>▸ Normal: &lt; 50 ng/ml | Atleta com EAA: &gt; 70 ng/ml comum | Reparo se &gt; 100 ng/ml</p>
            </div>
            <div>
              <p className="text-foreground font-medium">sIgA fecal:</p>
              <p>▸ Normal: 510-2040 mcg/ml | &lt; 300 = imunidade mucosa comprometida (overtraining)</p>
              <p>▸ Solução: colostro + glutamina + reduzir volume</p>
            </div>
            <div>
              <p className="text-foreground font-medium">SCFA fecais (proporção ideal):</p>
              <p>▸ Butirato &gt; 30% | Propionato 20-25% | Acetato 50-60%</p>
              <p>▸ Aumentar butirato: amido resistente + arabinogalactana</p>
            </div>
          </div>
        </Card>

        <Card className="bg-card border-border/40 p-3 space-y-2">
          <p className="text-xs font-semibold text-foreground">Adicionais para atletas com protocolo:</p>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-foreground font-medium">Ácidos orgânicos urinários:</p>
              <p>▸ D-arabinitol = marcador de Candida sistêmica (comum com Hemogenin — pH alterado)</p>
            </div>
            <div>
              <p className="text-foreground font-medium">TMAO sérico:</p>
              <p>▸ Marcador metabolismo de colina/carnitina pela microbiota</p>
              <p>▸ Alto TMAO = risco cardiovascular (importante com testosterona)</p>
              <p>▸ Reduzir: DMB (extrato de balsâmico) + Akkermansia + menos carnitina</p>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: "fase1",
    title: "Fase 1 — REMOVER (semanas 1-4)",
    icon: <Bug className="w-4 h-4 text-red-500" />,
    badge: "Antimicrobianos",
    badgeColor: "text-red-500 border-red-500/30",
    content: (
      <div className="space-y-4">
        <p>Eliminar patógenos e reduzir disbiose com antimicrobianos naturais.</p>
        <ProtocolTable rows={[
          { name: "Óleo de Orégano (carvacrol>80%)", dose: "200mg 3x/dia", timing: "Entre refeições, 2h longe de probiótico", notes: "Máx 4 semanas" },
          { name: "Berberina", dose: "500mg 3x/dia", timing: "Com refeição", notes: "Dupla função: antimicrobiana + insulina" },
          { name: "Alicina (alho)", dose: "180-360mg/dia", timing: "Com refeição", notes: "Antimicrobiana, antifúngica, antiparasitária" },
          { name: "Ácido Caprílico (C8)", dose: "500-1000mg 3x/dia", timing: "Com refeição gordurosa", notes: "Anti-Candida específico" },
          { name: "Neem", dose: "500mg 2x/dia", timing: "30min antes refeições", notes: "Antiparasitário, antifúngico" },
          { name: "Pau D'Arco", dose: "500mg 3x/dia ou chá 10g/L", timing: "Entre refeições", notes: "Antifúngico, imunomodulador" },
          { name: "GSE (semente toranja)", dose: "250mg 3x/dia", timing: "30min antes refeições", notes: "Amplo espectro" },
        ]} />
        <div className="mt-3">
          <p className="text-foreground font-semibold mb-2">Para H. pylori (protocolo natural):</p>
          <ProtocolTable rows={[
            { name: "Mástique (Pistacia lentiscus)", dose: "1g 2x/dia", timing: "Jejum + antes de dormir", notes: "Ciclo: 8-12 semanas" },
            { name: "Lactoferrina bovina", dose: "200mg 2x/dia", timing: "Quela ferro do H.pylori" },
            { name: "Brócolis germinado (sulforafano)", dose: "100mg/dia", timing: "Bactericida direto" },
            { name: "Vitamina C", dose: "1000mg 3x/dia", timing: "Durante protocolo" },
          ]} />
        </div>

        <Card className="bg-red-500/5 border-red-500/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-red-400">⚠️ Protocolo específico para 17-alfa alquilados (Hemogenin/Dianabol)</p>
          <p className="text-xs">17AA alteram pH intestinal e perfil de ácidos biliares — ambiente favorável para Candida e gram-negativas patogênicas.</p>
          <ProtocolTable rows={[
            { name: "Saccharomyces boulardii", dose: "500mg 2x/dia", timing: "Entre refeições", notes: "Sobrevive ao H. pylori e antibióticos. Florastor" },
            { name: "Ácido Caprílico C8", dose: "500mg 3x/dia", timing: "Com refeição gordurosa", notes: "Anti-Candida específico" },
            { name: "Cálcio D-Glucarato", dose: "500mg 2x/dia", timing: "Com refeições", notes: "Inibe beta-glucuronidase (hormônios)" },
            { name: "Probiótico de levedura", dose: "Rotacionar c/ bacteriano", timing: "—", notes: "Não competem — agem diferente" },
          ]} />
          <div className="text-xs space-y-1">
            <p className="text-foreground font-medium">Sinais de Candida intestinal em atletas:</p>
            <p>→ Desejo intenso de doce após treino</p>
            <p>→ Gases excessivos com proteína alta</p>
            <p>→ Fadiga após refeições ricas em carbo</p>
            <p>→ Língua com saburra branca</p>
            <p>→ Candidíase recorrente</p>
          </div>
          <div className="text-xs space-y-1">
            <p className="text-foreground font-medium">Protocolo anti-Candida específico:</p>
            <p>▸ <span className="text-foreground">Fase 1 (sem 1-2):</span> dieta anti-Candida (sem açúcar, álcool, leveduras)</p>
            <p>▸ <span className="text-foreground">Fase 2 (sem 2-4):</span> óleo de orégano + ácido caprílico + GSE</p>
            <p>▸ <span className="text-foreground">Fase 3 (sem 3-8):</span> repovoar com S. boulardii + L. acidophilus NCFM</p>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: "fase2",
    title: "Fase 2 — REPOVOAR (semanas 3-8)",
    icon: <Pill className="w-4 h-4 text-green-500" />,
    badge: "Probióticos",
    badgeColor: "text-green-500 border-green-500/30",
    content: (
      <div className="space-y-4">
        <p>Introduzir cepas específicas e evidenciadas.</p>
        <ProtocolTable rows={[
          { name: "L. acidophilus NCFM", dose: "10B UFC/dia", timing: "Antes de dormir", notes: "Imunidade mucosa, URTI" },
          { name: "L. rhamnosus GG (LGG)", dose: "10-20B UFC/dia", timing: "Com refeição leve ou pré-sono", notes: "600+ estudos, barreira intestinal" },
          { name: "L. plantarum 299v", dose: "10B UFC/dia", timing: "Com refeição", notes: "Absorção ferro +50%, anti-IBS" },
          { name: "L. reuteri DSM 17938", dose: "100M UFC/dia", timing: "Com refeição", notes: "Testosterona ↑, B12 local" },
          { name: "L. reuteri ATCC PTA 6475", dose: "100M UFC/dia", timing: "Com refeição", notes: "Cálcio, ossos. Bio-Gaia Gastrus" },
          { name: "B. longum BB536", dose: "10-20B UFC/dia", timing: "Antes de dormir", notes: "Imunidade, humor" },
          { name: "B. infantis 35624", dose: "1B UFC", timing: "1x/dia consistente", notes: "IBS, TNF-alfa ↓, PCR ↓" },
          { name: "L. helveticus R0052 + B. longum R0175", dose: "3B UFC cada", timing: "Manhã em jejum", notes: "Psychobiotic — cortisol ↓" },
          { name: "S. boulardii CNCM I-745", dose: "500-1000mg/dia", timing: "Entre refeições", notes: "Sobrevive a antibióticos. Florastor" },
          { name: "L. gasseri SBT2055", dose: "10B UFC/dia", timing: "Almoço", notes: "Gordura visceral ↓ (12 sem)" },
          { name: "Akkermansia muciniphila (pasteurizada)", dose: "100mg/dia", timing: "Pré-sono em jejum", notes: "Barreira muco, insulina. Pasteurizada > viva" },
        ]} />
        <Card className="bg-green-500/5 border-green-500/20 p-3 mt-2">
          <p className="text-xs font-semibold text-green-400 mb-1">Stack Mínimo (3 cepas essenciais):</p>
          <p className="text-xs">1. L. rhamnosus GG 20B · 2. B. longum BB536 15B · 3. S. boulardii 10B → antes de dormir</p>
        </Card>
        <Card className="bg-primary/5 border-primary/20 p-3">
          <p className="text-xs font-semibold text-primary mb-1">Stack Completo Elite:</p>
          <p className="text-xs">Manhã: L. plantarum 299v + L. reuteri DSM 17938</p>
          <p className="text-xs">Almoço: L. gasseri SBT2055 + Akkermansia</p>
          <p className="text-xs">Noite: L. rhamnosus GG + B. longum BB536 + L. acidophilus NCFM + S. boulardii</p>
        </Card>

        <Card className="bg-purple-500/5 border-purple-500/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-purple-400">🔄 Protocolo de rotação de cepas</p>
          <p className="text-xs">Uso contínuo da mesma cepa = tolerância em 8-12 semanas. Rotação = mais diversidade = melhor resultado.</p>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-foreground font-medium">Meses 1-3 (Força/Off-season):</p>
              <p>▸ Foco: síntese proteica + testosterona</p>
              <p>▸ Manhã: L. plantarum TWK10 + L. reuteri DSM 17938</p>
              <p>▸ Noite: B. longum BB536 + S. boulardii</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Meses 4-6 (Definição/Cutting):</p>
              <p>▸ Foco: gordura visceral + cortisol</p>
              <p>▸ Manhã: L. gasseri SBT2055 + Akkermansia</p>
              <p>▸ Noite: L. helveticus R0052 + B. longum R0175</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Meses 7-9 (Competição/Pré-prep):</p>
              <p>▸ Foco: imunidade + barreira intestinal</p>
              <p>▸ Manhã: L. acidophilus NCFM + L. rhamnosus GG</p>
              <p>▸ Noite: B. infantis 35624 + S. boulardii</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Meses 10-12 (Recuperação/Pós-comp):</p>
              <p>▸ Foco: reparo + diversidade</p>
              <p>▸ Manhã: Mix completo elite (todas as cepas)</p>
              <p>▸ Noite: Akkermansia + B. longum BB536</p>
            </div>
          </div>
        </Card>

        <div>
          <p className="text-foreground font-semibold mb-2">🆕 Novas cepas — Pesquisa 2024-2025:</p>
          <ProtocolTable rows={[
            { name: "Veillonella atypica", dose: "Via alimentos", timing: "Pós-treino", notes: "Converte lactato em propionato. Harvard 2019" },
            { name: "Faecalibacterium prausnitzii", dose: "Via prebióticos", timing: "—", notes: "Maior produtor de butirato. Estimular com AR" },
            { name: "Prevotella copri", dose: "Via dieta mediterrânea", timing: "—", notes: "Performance atlética. Vegetais" },
            { name: "Christensenellaceae", dose: "Via genética + dieta", timing: "—", notes: "Lean phenotype. Jejum + fibra" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "fase3",
    title: "Fase 3 — NUTRIR (semanas 1-12)",
    icon: <Leaf className="w-4 h-4 text-emerald-500" />,
    badge: "Prebióticos",
    badgeColor: "text-emerald-500 border-emerald-500/30",
    content: (
      <div className="space-y-4">
        <p>Alimentar as bactérias benéficas com prebióticos e fermentados.</p>
        <ProtocolTable rows={[
          { name: "FOS (Fruto-oligossacarídeos)", dose: "5-8g/dia", timing: "Distribuído nas refeições", notes: "Alimenta Bifidobacterium. Iniciar 2g" },
          { name: "Inulina (chicória)", dose: "5-10g/dia", timing: "Com refeições", notes: "Espectro mais amplo que FOS" },
          { name: "GOS (Galacto-oligossacarídeos)", dose: "5.5g/dia", timing: "Com refeição", notes: "Bifido + Lacto, reduz patogênicos" },
          { name: "XOS (Xilo-oligossacarídeos)", dose: "1-4g/dia", timing: "Com refeição", notes: "Mais potente por grama" },
          { name: "Amido Resistente tipo 2/3", dose: "15-30g/dia (alimentos)", timing: "2+ refeições/dia", notes: "Banana verde, batata resfriada, arroz resfriado" },
          { name: "Psyllium", dose: "10-15g/dia (2 doses)", timing: "30min antes refeições", notes: "Separar 2h de medicamentos" },
          { name: "Lactulose", dose: "5-10g/dia", timing: "Manhã com água", notes: "Estimulador de Bifidobacterium" },
          { name: "Pectina (maçã)", dose: "6-12g/dia", timing: "Via alimento", notes: "Alimenta Akkermansia" },
          { name: "Beta-glucana (aveia/cogumelos)", dose: "3-5g/dia", timing: "Café da manhã", notes: "Imunomodulador + prebiótico" },
          { name: "Arabinogalactana", dose: "4-6g/dia", timing: "Com refeições", notes: "Butirato + propionato ↑" },
        ]} />
        <div className="mt-3">
          <p className="text-foreground font-semibold mb-2">Alimentos Fermentados:</p>
          <ProtocolTable rows={[
            { name: "Kefir de leite (artesanal)", dose: "200-400ml/dia", timing: "Manhã ou com refeição", notes: "30-50 cepas vivas" },
            { name: "Kombucha artesanal (raw)", dose: "200ml/dia", timing: "—", notes: "Não pasteurizado" },
            { name: "Chucrute/Kimchi", dose: "50-100g/dia", timing: "Com refeições", notes: "Rico em L. plantarum" },
            { name: "Natto", dose: "50-80g/dia", timing: "—", notes: "Nattokinase + K2 MK-7 1000mcg/100g" },
          ]} />
        </div>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-3 space-y-3">
          <p className="text-xs font-semibold text-emerald-400">🍽️ Receitas simbióticas para atletas</p>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-foreground font-medium">1 — Kefir Anabólico:</p>
              <p>200ml kefir artesanal + 30g whey isolado + 50g aveia crua + 1 banana verde fatiada + 1 colher mel cru + canela de Ceylon</p>
              <p className="text-emerald-400">= 520 kcal | P 42g | C 65g | G 8g — pós-cardio perfeito</p>
            </div>
            <div>
              <p className="text-foreground font-medium">2 — Bowl Microbiota Elite:</p>
              <p>150g iogurte grego + 30g granola artesanal + 50g frutas vermelhas + 1 col chia + 1 col tahine + 30g romã (punicalagina = Akkermansia)</p>
            </div>
            <div>
              <p className="text-foreground font-medium">3 — Shot Imunidade (jejum):</p>
              <p>50ml kefir + 1 dente alho cru + 1cm gengibre + suco limão + cúrcuma + pimenta preta</p>
            </div>
            <div>
              <p className="text-foreground font-medium">4 — Arroz Resistente:</p>
              <p>Cozinhar normal → refrigerar 24h → reaquecer leve. AR aumenta 3-4x = mesmo arroz, muito mais prebiótico.</p>
            </div>
          </div>
        </Card>

        <div>
          <p className="text-foreground font-semibold mb-2">🌿 Polifenóis como prebióticos</p>
          <ProtocolTable rows={[
            { name: "Resveratrol (uva/romã)", dose: "150ml suco uva/dia", timing: "—", notes: "Akkermansia + Lacto" },
            { name: "Quercetina (maçã/cebola)", dose: "1 maçã com casca/dia", timing: "—", notes: "Lacto + Bifido" },
            { name: "EGCG (matcha/chá verde)", dose: "1-2 col matcha/dia", timing: "—", notes: "Diversidade geral" },
            { name: "Curcumina", dose: "500mg + piperina/dia", timing: "—", notes: "Anti-inflamatório geral" },
            { name: "Punicalagina (romã)", dose: "100ml romã/dia", timing: "—", notes: "Akkermansia específico" },
            { name: "Antocianinas (frutas vermelhas)", dose: "50-100g/dia", timing: "—", notes: "Bifido + Lacto" },
            { name: "Sulforafano (brócolis germ.)", dose: "100mg/dia", timing: "—", notes: "Elimina H. pylori" },
            { name: "Capsaicina (pimenta)", dose: "Adicionar refeições", timing: "—", notes: "Bifido + motilidade" },
          ]} />
        </div>
      </div>
    ),
  },
  {
    id: "fase4",
    title: "Fase 4 — PROTEGER (permanente)",
    icon: <Shield className="w-4 h-4 text-blue-500" />,
    badge: "Barreira",
    badgeColor: "text-blue-500 border-blue-500/30",
    content: (
      <div className="space-y-4">
        <p>Manter barreira intestinal íntegra com reparadores.</p>
        <ProtocolTable rows={[
          { name: "L-Glutamina", dose: "10-20g/dia (dividido)", timing: "5g jejum + 5g pós-treino + 5g pré-sono", notes: "Combustível dos enterócitos" },
          { name: "Colostro Bovino", dose: "5-20g/dia", timing: "Manhã em jejum (30min antes)", notes: "IgA, IGF-1, lactoferrina" },
          { name: "Zinco Carnosina", dose: "75mg 2x/dia", timing: "Com refeições", notes: "O mais específico para mucosa" },
          { name: "Butirato de sódio", dose: "300-600mg 3x/dia", timing: "Com refeições (entérico)", notes: "SCFA direto, HDAC inibidor" },
          { name: "BPC-157 oral", dose: "250-500mcg/dia", timing: "Em jejum", notes: "Reparo mucosa direto" },
          { name: "Cúrcuma BCM-95", dose: "—", timing: "—", notes: "Anti-inflamatório, tight junctions" },
          { name: "Aloe Vera (aloin-free)", dose: "200-400ml ou 500mg extrato", timing: "Manhã em jejum", notes: "Mucilaginoso protetor" },
          { name: "DGL (Licorice)", dose: "380mg 3x/dia", timing: "20min ANTES refeições", notes: "Sem glicirrizina — sem hipertensão" },
          { name: "Marshmallow Root", dose: "2-4g ou 500mg 4x/dia", timing: "Em jejum ou entre refeições", notes: "Mucoprotetor subestimado" },
          { name: "Slippery Elm", dose: "400mg 3-4x/dia", timing: "Em jejum ou entre refeições", notes: "Sinergia com Marshmallow" },
        ]} />

        <Card className="bg-blue-500/5 border-blue-500/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-blue-400">🔬 Postbióticos — fronteira 2024-2025</p>
          <p className="text-xs">Produtos bioativos produzidos pelas bactérias — agem mesmo sem as bactérias vivas (ISAPP 2021).</p>
          <ProtocolTable rows={[
            { name: "Tributirina", dose: "600mg/dia", timing: "Com refeição entérica", notes: "Precursor de butirato — superior ao butirato de sódio" },
            { name: "Urolitina A (Mitopure)", dose: "500mg/dia", timing: "Jejum pré-cardio", notes: "Mitofagia + biogênese — sinergia com SLU-PP-332" },
            { name: "Equol", dose: "Via alimentos", timing: "—", notes: "Liga-se ao DHT — proteção parcial queda cabelo" },
            { name: "Indol-3-carbinol", dose: "200mg/dia", timing: "Com refeição", notes: "Metabolismo estrogênico — alternativa ao DIM" },
            { name: "DIM (3,3'-Diindolilmetano)", dose: "200mg/dia", timing: "Com refeição gordurosa", notes: "Inibe aromatização" },
            { name: "Urolitina B", dose: "Pesquisa", timing: "—", notes: "Hipertrofia direta — em desenvolvimento" },
          ]} />
        </Card>

        <Card className="bg-purple-500/5 border-purple-500/20 p-3 space-y-2">
          <p className="text-xs font-semibold text-purple-400">⚡ Sinergia postbiótico + protocolo</p>
          <div className="text-xs space-y-2">
            <div>
              <p className="text-foreground font-medium">Urolitina A + SLU-PP-332:</p>
              <p>▸ Ambos ativam mitofagia + biogênese = efeito mitocondrial multiplicado</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Tributirina + Metformina:</p>
              <p>▸ Ambos ativam AMPK = sinergia controle glicêmico + particionamento calórico</p>
            </div>
            <div>
              <p className="text-foreground font-medium">Equol + Testosterona exógena:</p>
              <p>▸ Equol se liga ao DHT livre = proteção couro cabeludo, sem impactar T total</p>
            </div>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: "eixos",
    title: "Eixos Sistêmicos da Microbiota",
    icon: <Brain className="w-4 h-4 text-purple-500" />,
    badge: "Avançado",
    badgeColor: "text-purple-500 border-purple-500/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-purple-500/5 border-purple-500/20 p-3">
          <p className="text-xs font-semibold text-purple-400 mb-1">A. Eixo Intestino-Músculo (Gut-Muscle)</p>
          <p className="text-xs">SCFAs → receptor GPR41/43 → síntese proteica ↑ + sensibilidade insulínica ↑ + mitocôndria ↑</p>
          <p className="text-xs mt-1">Cepas: L. plantarum TWK10 (força/endurance), L. reuteri (via testosterona), Akkermansia (via insulina)</p>
          <p className="text-xs mt-1 text-primary">Hack: Kefir + whey pós-treino = sinergia proteína + probiótico</p>
        </Card>
        <Card className="bg-blue-500/5 border-blue-500/20 p-3">
          <p className="text-xs font-semibold text-blue-400 mb-1">B. Eixo Intestino-Cérebro (Gut-Brain)</p>
          <p className="text-xs">90% serotonina + 50% dopamina influenciada pelo intestino + GABA por L. rhamnosus</p>
          <p className="text-xs mt-1">Psychobiotics: L. helveticus R0052 + B. longum R0175 (cortisol ↓), L. rhamnosus JB-1 (GABA), B. longum 1714 (memória)</p>
        </Card>
        <Card className="bg-orange-500/5 border-orange-500/20 p-3">
          <p className="text-xs font-semibold text-orange-400 mb-1">C. Eixo Intestino-Hormônios</p>
          <p className="text-xs">Beta-glucuronidase alta = recirculação excessiva de estrogênio mesmo com AI</p>
          <p className="text-xs mt-1">Solução: Cálcio D-Glucarato 500-1000mg/dia (inibe beta-glucuronidase)</p>
          <p className="text-xs mt-1">L. reuteri → testosterona ↑ via redução de inflamação testicular + oxitocina</p>
        </Card>
        <Card className="bg-red-500/5 border-red-500/20 p-3">
          <p className="text-xs font-semibold text-red-400 mb-1">D. Eixo Intestino-Imune (70-80% imunidade)</p>
          <p className="text-xs">sIgA: 1ª linha de defesa mucosa. Aumentar: colostro, probióticos, glutamina, vitamina A, zinco</p>
          <p className="text-xs mt-1">Barreira: Claudina, ocludina, ZO-1. Reparar: L-glutamina, colostro, BPC-157, zinco carnosina, butirato</p>
        </Card>

        <Card className="bg-emerald-500/5 border-emerald-500/20 p-3">
          <p className="text-xs font-semibold text-emerald-400 mb-1">E. Eixo Intestino-Mitocôndria (Gut-Mito Axis)</p>
          <p className="text-xs">Descoberta 2023 — Cell Metabolism: SCFAs → GPR109a → PGC-1α = biogênese mitocondrial muscular</p>
          <p className="text-xs mt-1">Cepas produtoras de butirato: F. prausnitzii, Roseburia intestinalis, Eubacterium rectale</p>
          <p className="text-xs mt-1 text-primary">Hack: Amido resistente 30g/dia → mais butirato → mais mitocôndrias → sinergia com SLU-PP-332 + CoQ10</p>
        </Card>

        <Card className="bg-yellow-500/5 border-yellow-500/20 p-3">
          <p className="text-xs font-semibold text-yellow-500 mb-1">F. Eixo Intestino-Tendão (Gut-Tendon Axis)</p>
          <p className="text-xs">Atletas com anabólicos: músculo cresce mais rápido que tendão = risco de ruptura</p>
          <p className="text-xs mt-1">Microbiota regula colágeno: butirato → HATs → expressão genes de colágeno tipo I e III</p>
          <p className="text-xs mt-1 text-primary">Protocolo: L. rhamnosus GG + colágeno hidrolisado 10g + Vit C 1g + butirato sódio 300mg</p>
        </Card>

        <Card className="bg-indigo-500/5 border-indigo-500/20 p-3">
          <p className="text-xs font-semibold text-indigo-400 mb-1">G. Eixo Intestino-Sono (Gut-Sleep Axis)</p>
          <p className="text-xs">Microbiota produz: serotonina (90% intestinal → melatonina), GABA (L. rhamnosus JB-1), triptofano</p>
          <p className="text-xs mt-1 text-primary">Protocolo pré-sono: L. rhamnosus GG + B. longum BB536 + suco cereja azeda 150ml + L-triptofano 500mg</p>
          <p className="text-xs mt-1">= sono profundo = GH máximo = sinergia com CJC/Ipamorelin</p>
        </Card>
      </div>
    ),
  },
  {
    id: "protocolo-maestro",
    title: 'Protocolo Maestro — "GUT ELITE PROTOCOL"',
    icon: <Clock className="w-4 h-4 text-primary" />,
    badge: "Timing",
    content: (
      <div className="space-y-3">
        {[
          { time: "06:00", items: "Aloe vera 200ml (proteção mucosa)" },
          { time: "06:15", items: "L-Glutamina 5g em água fria" },
          { time: "06:30", items: "Probiótico manhã: L. plantarum 299v 10B + L. reuteri DSM 17938 100M + Akkermansia 100mg" },
          { time: "06:45", items: "Slippery Elm 400mg + DGL 380mg" },
          { time: "07:00", items: "Colostro bovino 10g (30min antes do café)" },
          { time: "Café", items: "Kefir 200ml + Psyllium 5g + Butirato 300mg + Zinco carnosina 75mg + Beta-glucana 3g" },
          { time: "Pós-treino", items: "L-Glutamina 5g com whey + Amido resistente (batata resfriada/banana verde)" },
          { time: "Almoço", items: "Enzimas digestivas + Betaína HCl 650mg + FOS/GOS 3g + Chucrute/Kimchi 50g" },
          { time: "Tarde", items: "L. gasseri SBT2055 10B (com lanche)" },
          { time: "Jantar", items: "Enzimas + Cálcio D-Glucarato 500mg + XOS 2g + Colostro 5g + Butirato 300mg" },
          { time: "Pré-sono", items: "L. rhamnosus GG 20B + B. longum BB536 15B + S. boulardii 10B + L. acidophilus NCFM 10B + L-Glutamina 5g + Marshmallow 500mg + Zinco carnosina 75mg" },
        ].map((entry, i) => (
          <div key={i} className="flex gap-3 items-start">
            <Badge variant="outline" className="text-primary border-primary/30 whitespace-nowrap text-[10px] mt-0.5">{entry.time}</Badge>
            <p className="text-xs">{entry.items}</p>
          </div>
        ))}

        <Card className="bg-orange-500/5 border-orange-500/20 p-3 space-y-1 mt-4">
          <p className="text-xs font-semibold text-orange-400">📅 Versão CUTTING (déficit calórico)</p>
          <p className="text-xs">Intestino mais vulnerável: menos calorias = menos substrato; mais cortisol = mais permeabilidade; mais cardio = mais stress oxidativo.</p>
          <div className="text-xs">
            <p className="text-foreground font-medium mt-1">Aumentar:</p>
            <p>▸ L-Glutamina 20g/dia (10+5+5) · Colostro 20g · Kefir 400ml · Zinco carnosina 150mg</p>
            <p className="text-foreground font-medium mt-1">Manter:</p>
            <p>▸ Probióticos · Prebióticos · BPC-157 (essencial no cutting)</p>
            <p className="text-foreground font-medium mt-1">Reduzir:</p>
            <p>▸ Psyllium para 10g/dia · Suspender lactulose (gases com déficit)</p>
          </div>
        </Card>

        <Card className="bg-red-500/5 border-red-500/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-red-400">📅 Versão PEAK WEEK</p>
          <p className="text-xs">Intestino precisa estar zerado visualmente.</p>
          <div className="text-xs space-y-0.5">
            <p>▸ <span className="text-foreground">48h antes:</span> parar psyllium e FOS/GOS (reduz gás)</p>
            <p>▸ <span className="text-foreground">48h antes:</span> manter probióticos (sem impacto visual)</p>
            <p>▸ <span className="text-foreground">48h antes:</span> glutamina 20g/dia (manter barreira no corte hídrico)</p>
            <p>▸ <span className="text-foreground">3 dias antes:</span> parar kefir (zero gás)</p>
            <p>▸ <span className="text-foreground">Dia da competição:</span> manhã glutamina 5g + probiótico, sem fibra (zero distensão)</p>
          </div>
        </Card>

        <Card className="bg-green-500/5 border-green-500/20 p-3 space-y-1">
          <p className="text-xs font-semibold text-green-400">📅 Versão PÓS-COMPETIÇÃO (4 semanas)</p>
          <p className="text-xs">Microbiota comprometida após corte severo + manipulação hídrica + diuréticos.</p>
          <div className="text-xs">
            <p className="text-foreground font-medium mt-1">Semanas 1-2 (Reparo emergencial):</p>
            <p>▸ Glutamina 20g · Colostro 20g · S. boulardii 1g · Dieta variada sem restrição</p>
            <p className="text-foreground font-medium mt-1">Semanas 3-4 (Repopulação):</p>
            <p>▸ Stack elite completo · Kefir 400ml · Todos os prebióticos · Natto 50g (K2 + B. subtilis)</p>
          </div>
        </Card>
      </div>
    ),
  },
  {
    id: "casos",
    title: "Casos Especiais",
    icon: <ShieldAlert className="w-4 h-4 text-red-400" />,
    badge: "Clínico",
    badgeColor: "text-red-400 border-red-400/30",
    content: (
      <div className="space-y-4">
        <Card className="bg-card border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Caso 1 — Pós-Antibiótico (8-12 semanas)</p>
          <p className="text-xs">Sem 1-2: S. boulardii 1000mg 3x + Colostro 20g + Glutamina 20g + Kefir 400ml</p>
          <p className="text-xs">Sem 3-4: + LGG 20B + BB536 20B + FOS/Inulina 10g</p>
          <p className="text-xs">Sem 5-8: Stack completo + Akkermansia + prebióticos múltiplos</p>
          <p className="text-xs">Sem 9-12: Manutenção + fermentados diários</p>
        </Card>
        <Card className="bg-card border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Caso 2 — SIBO</p>
          <p className="text-xs">Fase 1 (4 sem): Óleo orégano + Berberina + Alicina + C8. NÃO probióticos fermentadores. Dieta Low-FODMAP.</p>
          <p className="text-xs">Fase 2: Introduzir gradualmente L. reuteri e B. longum. Evitar LGG/L. acidophilus nas primeiras semanas (produtores H2).</p>
        </Card>
        <Card className="bg-card border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Caso 3 — Candida Sistêmica</p>
          <p className="text-xs">Fase 1 (4 sem): Óleo coco 2-3 col + C8 1500mg 3x + GSE + Berberina + Pau D'Arco + Alicina. Zero açúcar/álcool/leveduras/glúten.</p>
          <p className="text-xs">Fase 2 (5-8 sem): S. boulardii 1000mg 3x + L. acidophilus 20B + Biotina 5mg + Molibdênio 250mcg</p>
        </Card>
        <Card className="bg-card border-border/40 p-3">
          <p className="text-xs font-semibold text-foreground mb-2">Caso 4 — Leaky Gut (Zonulina alta)</p>
          <p className="text-xs">Intensivo: L-Glutamina 20-30g/dia + Colostro 20g + Zinco carnosina 75mg 3x + Butirato 600mg 3x + BPC-157 500mcg + DGL 380mg 4x + Marshmallow 400mg 4x + Slippery Elm 400mg 4x + Quercetina 500mg 3x + D3 10.000UI + Vit A 10.000UI + Omega-3 6g</p>
          <p className="text-xs mt-1 text-primary">Eliminar: glúten, laticínios, açúcar, AINEs, álcool por 8-12 semanas. Reavaliar zonulina após 12 sem.</p>
        </Card>
      </div>
    ),
  },
  {
    id: "absorcao",
    title: "Suplementos Potencializados pela Microbiota",
    icon: <Dumbbell className="w-4 h-4 text-primary" />,
    badge: "Absorção",
    content: (
      <div className="space-y-2">
        <ProtocolTable rows={[
          { name: "Proteína", dose: "Absorção +40%", timing: "L. plantarum 299v melhora absorção" },
          { name: "Creatina", dose: "Absorção +30%", timing: "Flora saudável = conversão mínima em creatinina" },
          { name: "Magnésio", dose: "↑ absorção", timing: "B. longum + L. rhamnosus" },
          { name: "Zinco", dose: "+35% absorção", timing: "Fitobactérias degradam fitato (antinutriente)" },
          { name: "Ferro", dose: "+50% não-heme", timing: "L. plantarum 299v via ácido lático → pH ↓" },
          { name: "Curcumina", dose: "Ativação bioativa", timing: "Convertida em tetra-hidrocurcumina pela flora" },
          { name: "Isoflavonas", dose: "10x mais ativo (equol)", timing: "30-50% não possuem bactéria conversora" },
          { name: "Ômega-3", dose: "Resolvinas ativadas", timing: "Interação Ω-3 + microbiota = anti-inflamação" },
        ]} />
      </div>
    ),
  },
  {
    id: "timing",
    title: "Regras de Timing — Microbiota",
    icon: <Clock className="w-4 h-4 text-yellow-500" />,
    badge: "Timing",
    badgeColor: "text-yellow-500 border-yellow-500/30",
    content: (
      <div className="space-y-3">
        <Card className="bg-red-500/5 border-red-500/20 p-3">
          <p className="text-xs font-semibold text-red-400">⚠️ Probióticos e antimicrobianos NUNCA juntos — separar mínimo 2-3h</p>
        </Card>
        <div className="space-y-2">
          <p className="text-foreground font-semibold text-xs">Probióticos — melhor sobrevivência:</p>
          <ul className="space-y-1 text-xs">
            <li>▸ Com refeição leve ou 30min antes: proteção gástrica (pH menos ácido)</li>
            <li>▸ Antes de dormir: trânsito mais lento = maior colonização</li>
            <li>▸ NUNCA com líquidos quentes (&gt;40°C mata bactérias)</li>
            <li>▸ NUNCA com água clorada (bactericida)</li>
          </ul>
          <p className="text-foreground font-semibold text-xs mt-2">Prebióticos:</p>
          <ul className="space-y-1 text-xs">
            <li>▸ Com refeições: fermentação gradual (menos gases)</li>
            <li>▸ Escalar dose em 2-3 semanas para adaptar</li>
          </ul>
          <p className="text-foreground font-semibold text-xs mt-2">Enzimas digestivas:</p>
          <ul className="space-y-1 text-xs">
            <li>▸ SEMPRE no início da refeição</li>
            <li>▸ Betaína HCl: início da refeição (ativa pepsina + minerais)</li>
          </ul>
        </div>
      </div>
    ),
  },
];

interface MicrobiotaLibraryProps {
  onAskApex?: (q: string) => void;
}

const MicrobiotaLibrary = ({ onAskApex }: MicrobiotaLibraryProps) => {
  const [search, setSearch] = useState("");

  const filtered = sections.filter(
    (s) =>
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.id.toLowerCase().includes(search.toLowerCase()) ||
      (s.badge && s.badge.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar protocolo, fase, eixo..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-xs bg-card border-border"
        />
      </div>

      {onAskApex && (
        <Button
          variant="outline"
          size="sm"
          className="w-full text-xs border-primary/30 text-primary hover:bg-primary/10"
          onClick={() => onAskApex("Crie um protocolo completo de reconstrução da microbiota para um atleta de elite com disbiose, incluindo as 4 fases (Remover, Repovoar, Nutrir, Proteger) com timing, doses e cepas específicas.")}
        >
          🧬 Perguntar ao APEX sobre Microbiota
        </Button>
      )}

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

export default MicrobiotaLibrary;
