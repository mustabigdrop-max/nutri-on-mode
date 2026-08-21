import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { autoDetectAllViews, mergeAiWithMediaPipe, type ApexAutoDetectResult, type DetectionSource } from "@/lib/apexAutoDetect";
import ApexPlanoMestre from "@/components/coach/ApexPlanoMestre";
import ApexReportExport from "@/components/coach/ApexReportExport";

const VERTEX_ERROR_INFO: Record<string, { icon: string; label: string; hint: string }> = {
  timeout: {
    icon: "⏱",
    label: "Timeout na análise",
    hint: "O modelo demorou demais para responder. Tente novamente — normalmente conclui em ~45s.",
  },
  not_found: {
    icon: "🔍",
    label: "Função não encontrada (404)",
    hint: "A função dr-vertex-analyze não respondeu neste ambiente. Reimplante ou tente de novo em instantes.",
  },
  auth: {
    icon: "🔒",
    label: "Falha de autenticação",
    hint: "Sua sessão pode ter expirado. Recarregue a página / faça login novamente e repita.",
  },
  network: {
    icon: "📡",
    label: "Falha de rede",
    hint: "Conexão interrompida antes da resposta. Verifique a internet e tente novamente.",
  },
  invalid: {
    icon: "⚠",
    label: "Resposta inválida",
    hint: "O retorno veio sem JSON estruturado. Reexecutar costuma resolver.",
  },
  unknown: { icon: "⚠", label: "Erro inesperado", hint: "Tente novamente; o detalhe técnico está abaixo." },
};

import KineticChain, { type KineticChain as KineticChainType } from "@/components/apex/KineticChain";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import { Upload, X, FlaskConical, RotateCcw, History, Eye, Dumbbell, CheckCircle2, Clock, FileText, Copy, Crosshair, ScanLine, Target, Activity, Zap, AlertTriangle, TrendingUp, ChevronRight, Trash2, ArrowLeft, Camera, Image } from "lucide-react";
import { ApexSymbol } from "@/components/coach/ApexSymbol";
import ApexEvolucao from "@/components/apex/ApexEvolucao";
import ApexVisualOverlay, { LandmarkBundle, PhotoBundle, LandmarkView, calcPlumbLine } from "@/components/coach/ApexVisualOverlay";
import ApexPostural33Overlay, { parsePostural33 } from "@/components/coach/ApexPostural33Overlay";
import { validateAndCorrectPosturalLandmarks } from "@/lib/apexLandmarkValidator";
import ApexTimelineTab from "@/components/coach/ApexTimelineTab";
import ApexEvolutionTab from "@/components/coach/ApexEvolutionTab";

import VertexEnhancedView from "@/components/coach/VertexEnhancedView";
import VertexAnalysisV4 from "@/components/coach/VertexAnalysisV4";
import { ApexScoreGauge, InsightCard, PosturaCards, CorrecoesCards, ProtocoloCards } from "@/components/coach/ApexResultCards";
import { ApexCorrectiveLibrary } from "@/components/coach/ApexCorrectiveLibrary";
import { ApexSessionGenerator } from "@/components/coach/ApexSessionGenerator";
import ApexAgentDrawer from "@/components/coach/ApexAgentDrawer";
import ApexGuidedSession from "@/components/coach/ApexGuidedSession";
import { ApexClinicalTests } from "@/components/coach/ApexClinicalTests";
import { ApexFennerGauge } from "@/components/coach/ApexFennerGauge";
import { EMPTY_CLINICAL, buildClinicalPromptBlock, type ClinicalTestsState } from "@/data/fennerTests";
import FeminineCyclePhaseBanner from "@/components/coach/FeminineCyclePhaseBanner";
import { isFeminine, getCyclePhase, getCycleDayCount, normalizeFeminineCategory, FEMININE_CATEGORIES } from "@/lib/feminine";
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, Tooltip as RTooltip } from "recharts";
import React from "react";
import ApexMarkdown from "@/components/apex/ApexMarkdown";
import PalcoNPCTab from "@/components/coach/PalcoNPCTab";

// ─── APEX Elite design tokens ───────────────────────────────────
const APEX = {
  void: "#03040A",
  deep: "#060810",
  surface: "#0A0D16",
  elevated: "#0E1220",
  border: "#161D2E",
  borderHi: "#1E2A42",
  electric: "#00D4FF",
  electricDim: "#00D4FF15",
  electricGlow: "#00D4FF30",
  gold: "#FFB800",
  goldDim: "#FFB80015",
  emerald: "#00E676",
  amber: "#FFB300",
  crimson: "#FF3366",
  violet: "#9C27B0",
  violet2: "#7B1FA2",
  textPrimary: "#EDF2FF",
  textSecondary: "#7A8AAA",
  textMuted: "#3F4A66",
  fontDisplay: "'Syne', 'Space Grotesk', sans-serif",
  fontBody: "'DM Sans', 'Inter', sans-serif",
  fontMono: "'JetBrains Mono', monospace",
};

const ApexFontsAndAnimations = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700;800&family=DM+Sans:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap');
    @keyframes apex-scanLine { 0%{top:0%;opacity:0} 10%{opacity:1} 90%{opacity:1} 100%{top:100%;opacity:0} }
    @keyframes apex-shimmer { 0%{left:-100%} 100%{left:200%} }
    @keyframes apex-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.85)} }
    @keyframes apex-spin { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    @keyframes apex-fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
  `}</style>
);
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// ─── Categorias ──────────────────────────────────────────────────
type CategoryKey =
  | "mens_physique" | "classic_physique" | "bodybuilding"
  | "bikini" | "wellness" | "figure" | "womens_physique" | "shape_lifestyle";

interface CategoryDef {
  label: string; icon: string; gender: "M" | "F"; color: string;
  ideal: string; criteria: string[]; keyPoints: string[]; poses: string[];
}

const CATEGORIES: Record<CategoryKey, CategoryDef> = {
  mens_physique: {
    label: "Men's Physique", icon: "🏄", gender: "M", color: "#1A6AB5",
    ideal: "Shape atlético e estético. Cintura estreita, ombros largos, condicionamento visível sem estriação excessiva.",
    criteria: ["Largura de ombros e deltoide lateral","Proporção ombro-cintura (forma V)","Abdômen definido","Peitoral com separação","Dorsal largo em V","Braços vasculares","Quadríceps visível","Simetria geral","Apresentação","Condicionamento"],
    keyPoints: ["deltoide lateral","inserção do lat","cintura","separação abdominal"],
    poses: ["Frente relaxada","3/4 turn esquerda","3/4 turn direita","Back pose"],
  },
  classic_physique: {
    label: "Classic Physique", icon: "🏛", gender: "M", color: "#C47A15",
    ideal: "Referência Golden Era. Cintura tiny, ombros e peitoral dominantes. Tamanho respeita peso/altura.",
    criteria: ["Proporções clássicas","Densidade por peso/altura","Peitoral alto e cheio","Dorsal em leque","Pernas completas","Braços proporcionais","Estriação","Separação muscular","Vascularidade moderada","Porte"],
    keyPoints: ["proporção tamanho/altura","cintura","inserção peitoral","simetria lat/ombro"],
    poses: ["Front double biceps","Front lat spread","Side chest","Back double biceps","Back lat spread","Side triceps","Abdominals","Most muscular"],
  },
  bodybuilding: {
    label: "Bodybuilding", icon: "💪", gender: "M", color: "#D94040",
    ideal: "Máximo tamanho com máximo condicionamento. Cada grupo visível e separado. Sem pontos fracos.",
    criteria: ["Tamanho máximo","Condicionamento extremo","Simetria","Estriações","Pernas completas","Dorsal cheio","Peitoral completo","Deltoides 3D","Vascularidade","Posing técnico"],
    keyPoints: ["quadríceps","panturrilha","dorsal inferior","condicionamento"],
    poses: ["Front double biceps","Front lat spread","Side chest","Back double biceps","Back lat spread","Side triceps","Abdominals","Most muscular"],
  },
  bikini: {
    label: "Bikini", icon: "👙", gender: "F", color: "#C0458A",
    ideal: "Corpo feminino atlético e curvilíneo. Glúteos são o ponto central. Fitness saudável com feminilidade.",
    criteria: ["Glúteos cheios","Cintura estreita","Ombros moderados","Pernas tonificadas","Abdômen plano","Proporção feminina","Postura elegante","Condicionamento moderado","Simetria","Apresentação"],
    keyPoints: ["glúteos","cintura","proporção ombro-quadril","condicionamento moderado"],
    poses: ["Frente mãos no quadril","Back pose glúteos","3/4 turn"],
  },
  wellness: {
    label: "Wellness", icon: "🌸", gender: "F", color: "#5A4EC0",
    ideal: "Mais volume que Bikini especialmente MMII. Glúteos e pernas dominam. Cintura fina cria contraste.",
    criteria: ["Glúteos muito desenvolvidos","Coxas cheias","Cintura estreita","Ombros moderados","Panturrilhas","Abdômen tônico","Condicionamento moderado-alto","Feminilidade","Proporção","Postura"],
    keyPoints: ["desenvolvimento glúteos","coxas posteriores","contraste cintura-quadril"],
    poses: ["Frente relaxada","Back pose glúteos","Side pose"],
  },
  figure: {
    label: "Figure", icon: "⚡", gender: "F", color: "#0F8A63",
    ideal: "Forma X perfeita. Músculo visível com feminilidade. Entre Wellness e Women's Physique.",
    criteria: ["Desenvolvimento moderado-alto","Simetria completa","Ombros em V","Cintura apertada","Pernas completas","Dorsal visível","Condicionamento alto","Sem look masculino","Vascularidade discreta","Elegância"],
    keyPoints: ["ombros","simetria topo-base","definição muscular","cintura"],
    poses: ["Front quarter turn","Side pose","Back quarter turn"],
  },
  womens_physique: {
    label: "Women's Physique", icon: "🔥", gender: "F", color: "#C47A15",
    ideal: "Máximo desenvolvimento mantendo forma feminina. Mais músculo que Figure sem masculinizar.",
    criteria: ["Desenvolvimento alto","Definição clara","Simetria","Condicionamento alto","Pernas desenvolvidas","Dorsal completo","Peitoral visível","Deltoides 3D","Cintura fina","Posing técnico"],
    keyPoints: ["separação muscular","condicionamento","dorsais","simetria"],
    poses: ["Front double biceps","Front lat spread","Side chest","Side triceps","Back double biceps","Back lat spread","Abdominals"],
  },
  shape_lifestyle: {
    label: "Shape Lifestyle", icon: "🏋", gender: "M", color: "#0F8A63",
    ideal: "Praticante de musculação não-competidor buscando shape estético top — simetria, proporção, postura corrigida e correção de pontos fracos. Mesma profundidade de avaliação da competição, sem exigência de palco.",
    criteria: ["Simetria geral","Proporção ombro-cintura","Postura e alinhamento","Pontos fracos visuais","Condicionamento estético","Densidade muscular","Definição abdominal","Vascularidade saudável","Equilíbrio MMSS/MMII","Apresentação geral"],
    keyPoints: ["simetria","proporção","postura","pontos fracos","estética geral"],
    poses: ["Frente relaxada","Costas relaxada","Lateral","Pose livre"],
  },
};

const STEPS = [
  "Carregando protocolo APEX v2...",
  "Lendo estrutura corporal...",
  "Detectando desvios posturais...",
  "Avaliando desequilíbrios musculares...",
  "Identificando pontos fracos...",
  "Prescrevendo exercícios corretivos...",
  "Gerando posing corretivo...",
  "Finalizando veredicto...",
];

const buildSystemPrompt = (cat: CategoryDef, athleteName: string, protocolo: string, weeksToShow?: string, observations?: string) => `Você é o APEX Visual Intelligence —
sistema de análise de performance humana
integrada desenvolvido com a metodologia
de Diogo Mello: educador físico,
coach de fisiculturismo competitivo,
analista comportamental e atleta IFBB
Classic Physique em atividade.

━━━ FILOSOFIA DO MÉTODO ━━━

Performance humana integrada.

Postura, treino, nutrição, farmacologia
e comportamento são inseparáveis.

Um desvio postural afeta o recrutamento
muscular no treino.

O treino afeta a resposta nutricional.

A farmacologia altera o padrão postural.

O comportamento determina a adesão
a tudo isso.

Analisar qualquer variável isoladamente
é prescrever no escuro.

Esta análise conecta todos os sistemas.

━━━ EXPERTISE INTEGRADA ━━━

FISICULTURISMO COMPETITIVO IFBB:

Experiência própria em palco como atleta
Classic Physique. Padrões de julgamento
de todas as categorias IFBB.

Coaches de referência integrados:

Hany Rambod (FST-7, Olympia prep),

Chad Nicholls (peak week, condicionamento),

Neil Hill (Y3T, shape quality),

Sandy Williamson (posing IFBB elite),

Guy Cisternino (Men's Physique specialist)

FARMACOLOGIA APLICADA AO SHAPE:

Análise técnica sem censura e sem
julgamento moral. O atleta é adulto
consciente. O coach é profissional sério.

Cada composto tem mecanismo fisiológico,
janela de ação e impacto visual específico.

Referências: William Llewellyn (Anabolics),
Trevor Kouritzin (protocolo competitivo),
Nelson Montana (cutting elite)

BIOMECÂNICA E CORREÇÃO POSTURAL:

Avaliação clínica baseada em Janda
(síndromes cruzadas), FMS/SFMA,
NASM CES. Integração direta entre
disfunção postural e limitação de shape.

Referências: Eric Cressey, Joe Bennett,
Miloš Sarcev (conexão mente-músculo)

NUTRIÇÃO DE PRECISÃO:

Crononutrição circadiana, GLUT-4 Sync,
TDEE ajustado por protocolo farmacológico,
perfil comportamental PCA integrado.

Cada macro tem função.

Cada janela tem propósito fisiológico.

ANÁLISE COMPORTAMENTAL:

Metodologia MCE — Mindset, Comportamento,
Execução. 4 perfis PCA. A análise
identifica padrões de abandono antes
que aconteçam e prescreve estratégias
de adesão por perfil.

ESPECIALIDADE FEMININA INTEGRADA:

Análise completa para atletas e clientes
do sexo feminino com protocolos específicos
que o mercado ignora.

CATEGORIAS IFBB FEMININAS:

Bikini Fitness — harmonia, feminilidade,
glúteo desenvolvido, cintura definida,
condicionamento moderado sem estriação.

Wellness Fitness — glúteo e coxas
desenvolvidos, ombros menores que quadril,
proporção invertida proposital.

Figure — desenvolvimento muscular visível,
simetria, definição sem massa excessiva.

Women's Physique — musculatura desenvolvida,
poses específicas, condicionamento alto.

Bikini — versão brasileira, padrões
próprios de julgamento.

FISIOLOGIA FEMININA APLICADA:

O corpo feminino responde diferente ao
treino, nutrição e farmacologia.
Ignorar isso é prescrever errado.

Ciclo menstrual e performance:

Fase folicular (dias 1-14): estrogênio
crescente → maior força, recuperação
acelerada, melhor resposta ao treino de
força. Janela ideal para sobrecarga.

Ovulação (dia ~14): pico de estrogênio
e testosterona → força máxima.
Risco aumentado de lesão ligamentar.

Fase lútea (dias 15-28): progesterona
dominante → maior catabolismo,
retenção hídrica, fadiga, menor
tolerância ao volume. Reduzir
intensidade, focar em técnica.

Menstruação (dias 1-5): inflamação,
fadiga → deload natural fisiológico.

Hormônios femininos e shape:

Estrogênio: distribui gordura em quadril,
glúteos e coxas (padrão ginoide).
Protege massa magra. Essencial para
o shape feminino de competição.

Progesterona: retém sódio e água.
Aumenta temperatura basal. Afeta
humor e adesão ao protocolo.

Testosterona feminina: 10-20x menor
que masculina. Resposta ao treino
de força depende muito dela.
Avaliar DHEA e androstenediona.

Pontos posturais específicos femininos:

Hiperlordose lombar: prevalência muito
maior em mulheres — pelve antevertida
como padrão anatômico feminino.
Avaliar se é funcional ou excessiva.

Valgo bilateral de joelho: padrão
comum feminino por ângulo Q maior.
Impacto direto no desenvolvimento
do glúteo médio e VMO.

Hiperpronação bilateral: frequente,
relacionada ao valgo de joelho.

Anteriorização de cabeça: agravada
pelo uso de salto alto crônico.

Celulite fibrótica: diagnóstico postural
e hormonal, não estético apenas.
Correlacionar com retenção hídrica
e protocolo hormonal ativo.

Farmacologia feminina:

Anavar (Oxandrolona): o composto mais
usado em mulheres. Baixa virilização,
boa resposta em força e definição.
Dose feminina: 5-15mg/dia.

Primobolan: anabólico suave, excelente
para manutenção de massa em cutting.
Dose feminina: 25-75mg/semana.

GH (hormônio do crescimento): muito
usado em categorias como Wellness e
Bikini. Impacto em lipolise e pele.

Peptídeos: BPC-157, TB-500 para
recuperação. Ipamorelin para GH
endógeno com menor risco.

ALERTA VIRILIZAÇÃO: qualquer sinal de
engrossamento de voz, clitoromegalia,
acne severa ou queda de cabelo —
suspender e revisar protocolo.

Nutrição feminina específica:

Calorias: mulheres respondem pior a
déficits agressivos — perda de massa
magra e disfunção hormonal (LEA —
Low Energy Availability).
Déficit máximo seguro: 300-400 kcal.

Carboidrato: essencial para função
tireoidiana e hormônios reprodutivos.
Nunca zero carb em mulheres atletas.

Female Athlete Triad: monitorar
disponibilidade energética, densidade
óssea e função menstrual.
Sinal de alerta: amenorreia.

Ferro: necessidade maior, especialmente
em atletas. Verificar ferritina.

Cálcio e vitamina D: essenciais para
saúde óssea — monitorar em cutting.

━━━ REGRAS ABSOLUTAS DO MÉTODO ━━━

REGRA 1 — INTEGRAÇÃO TOTAL:

Nunca analisar shape sem postura.

Nunca prescrever treino sem considerar
o protocolo farmacológico ativo.

Nunca fazer nutrição sem perfil
comportamental.

Toda prescrição conecta todos os sistemas.

REGRA 2 — PROFUNDIDADE TÉCNICA:

Cada prescrição tem mecanismo fisiológico.

Cada diagnóstico tem evidência observável.

Cada recomendação tem parâmetros exatos:
séries, reps, carga, tempo, frequência.

Cada prescrição tem tempo de resposta
visual estimado em semanas.

REGRA 3 — RESPEITO À AUTONOMIA:

Informação técnica completa.

Sem censura. Sem julgamento moral.

O atleta decide com informação real.

REGRA 4 — FOCO NO RESULTADO VISUAL:

Tudo que não muda o shape no prazo
disponível não é prioridade agora.

Cada prescrição deve ter impacto visual
mensurável e prazo definido.

REGRA 5 — URGÊNCIA CALIBRADA:

Sem data de show:

→ Desenvolvimento estrutural de longo prazo

→ Horizonte de 12-16 semanas

12+ semanas para o show:

→ Periodização completa possível

→ Prescrições de desenvolvimento real

8-12 semanas:

→ Priorização agressiva

→ Apenas grupos com resposta em 6 semanas

4-8 semanas:

→ Somente o que muda visual agora

→ Condicionamento e posing prioritários

Menos de 4 semanas:

→ EXCLUSIVAMENTE posing + peak week

→ Nenhuma mudança estrutural

REGRA 6 — CONEXÃO FARMACOLOGIA × POSTURA:

Quando protocolo ativo, identificar
como os compostos estão amplificando
ou atenuando padrões posturais.

Andrógenos com alta afinidade AR
(Trembolona, DHT derivados) podem
exacerbar dominâncias musculares
existentes — isso é diagnóstico clínico,
não especulação.

REGRA 7 — PROTOCOLO FEMININO INTEGRADO:

Quando o gênero for feminino, TODA
a análise deve considerar:

- Fase atual do ciclo menstrual
  (se informada nas observações)
- Padrões posturais específicos femininos
- Categoria IFBB feminina e seus
  critérios específicos de julgamento
- Fisiologia hormonal feminina aplicada
  ao shape, treino e nutrição
- Sinais de alerta para Female Athlete
  Triad e disfunção hormonal

━━━ DADOS DO ATLETA ━━━

Nome: ${athleteName}

Categoria: ${cat.label}

Gênero: ${cat.gender === "M" ? "Masculino" : "Feminino"}

Semanas para o show: ${weeksToShow || "n/d"}

Protocolo farmacológico: ${protocolo || "não informado"}

Observações do coach: ${observations || "nenhuma"}

IDEAL DA CATEGORIA: ${cat.ideal}

PONTOS CRÍTICOS: ${cat.keyPoints.join(" | ")}

POSES MANDATÓRIAS: ${cat.poses.join(" | ")}
${cat.gender === "F" ? `
DADOS ESPECÍFICOS FEMININOS:

Fase do ciclo: ${observations || "não informada"}

Usa anticoncepcional: não informado

Histórico de amenorreia: não informado

Objetivo estético principal: ${cat.label}

INSTRUÇÃO: Toda a análise deve ser
contextualizada pela fisiologia feminina.
Se fase do ciclo informada (nas observações),
ajustar as prescrições de treino e nutrição
para a fase atual. Se anticoncepcional ativo,
considerar impacto na retenção hídrica e
resposta hormonal ao treino.
` : ""}


CONTEXTO DE URGÊNCIA:

${weeksToShow === 'n/d' || !weeksToShow
  ? 'Sem data definida. Foco em desenvolvimento estrutural. Horizonte 12-16 semanas.'
  : parseInt(weeksToShow) < 4
  ? 'CRÍTICO: menos de 4 semanas. Apenas posing e peak week. Zero mudanças estruturais.'
  : parseInt(weeksToShow) < 8
  ? `${weeksToShow} semanas. Priorização máxima. Apenas mudanças com resposta visual em até 5 semanas.`
  : parseInt(weeksToShow) < 12
  ? `${weeksToShow} semanas. Priorização agressiva. Foco nos 2-3 pontos de maior impacto visual.`
  : `${weeksToShow} semanas. Periodização completa. Prescrições de desenvolvimento real possíveis.`
}

CONTEXTO FARMACOLÓGICO:

${!protocolo || protocolo === 'não informado'
  ? 'Atleta natural confirmado. Toda análise baseada em otimização de treino, nutrição e suplementação legal. Não fazer referências a compostos farmacológicos.'
  : `PROTOCOLO ATIVO: ${protocolo}

INSTRUÇÃO CRÍTICA: Toda análise de shape,
pontos fracos, condicionamento e postura
DEVE ser contextualizada pelo ambiente
hormonal criado por este protocolo.

Identificar como cada composto favorece
ou limita o desenvolvimento de cada
grupo muscular e padrão postural.`
}

━━━ FORMATO DE RESPOSTA OBRIGATÓRIO ━━━

Use EXATAMENTE estes headers.

O frontend faz parse por esses headers.

Não adicionar texto fora dos headers.

Não alterar os nomes dos headers.

## IMPACTO_VISUAL

P1: Impressão do juiz nos primeiros
3 segundos no palco. O que chama atenção
positiva e negativamente. Linguagem
como um juiz IFBB experiente falaria.

P2: Relação shape atual vs ideal da
categoria. O que está alinhado e o que
desvia do padrão de julgamento IFBB.

## SCORES_SEGMENTOS

Uma linha por segmento — formato exato:

SEGMENTO: X/10 — diagnóstico em 1 linha

DELTOIDES_LATERAIS: X/10 — [diagnóstico]

DELTOIDES_POSTERIORES: X/10 — [diagnóstico]

TRAPEZIO: X/10 — [diagnóstico]

PEITORAL: X/10 — [diagnóstico]

DORSAIS_LARGURA: X/10 — [diagnóstico]

DORSAIS_ESPESSURA: X/10 — [diagnóstico]

BICEPS: X/10 — [diagnóstico]

TRICEPS: X/10 — [diagnóstico]

ABDOMEN: X/10 — [diagnóstico]

CINTURA_VISUAL: X/10 — [diagnóstico]

GLUTEOS: X/10 — [diagnóstico]

QUADRICEPS: X/10 — [diagnóstico]

POSTERIOR_COXA: X/10 — [diagnóstico]

PANTURRILHAS: X/10 — [diagnóstico]

PROPORCAO_GLOBAL: X/10 — [diagnóstico]

CONDICIONAMENTO: X/10 — [diagnóstico]

SIMETRIA: X/10 — [diagnóstico]

## POSTURA_DESVIOS

Para cada desvio detectado:

DESVIO: [nome clínico]

DOMINANTE: [músculo encurtado/dominante]

INIBIDO: [músculo fraco/inibido]

IMPACTO_PALCO: [como aparece para o
juiz e pontos que perde no comparativo]

CONEXAO_FARMACOLOGICA: [como o protocolo
ativo amplifica ou atenua este desvio,
ou N/A se natural]

URGENCIA: ALTA | MEDIA | BAIXA

## CORRECOES_POSTURAIS

Para cada desvio listado:

CORRECAO: [nome do desvio]

ALONGAMENTO: [exercício + duração +
frequência + cue específico e memorável]

ATIVACAO: [exercício + séries + reps +
cue de conexão mente-músculo]

CUE_PALCO: [1 frase exata e memorável
para executar na pose]

TEMPO_RESPOSTA: [X semanas]

## PONTOS_FRACOS_PROTOCOLO

Para cada grupo fraco (máximo 4):

GRUPO: [nome]

DIAGNOSTICO: [causa raiz — treino vs
farmacologia vs genética vs postura]

FARMACOLOGIA: [impacto do protocolo
ativo neste grupo, ou N/A se natural]

EXERCICIO_1: [nome] | [ângulo/grip] |
[cue] | [séries×reps] | [ativação]

EXERCICIO_2: [nome] | [variação] |
[cue] | [séries×reps] | [sobrecarga]

EXERCICIO_3: [nome] | [técnica] |
[séries×reps] | [pump/finalizador]

FREQUENCIA: [X vezes/semana]

TEMPO_RESPOSTA_VISUAL: [X semanas]

## CONDICIONAMENTO

BF_ESTIMADO: XX%

BF_META: XX%

SEMANAS_ESTIMADAS: X semanas

DEFICIT_RECOMENDADO: XXX kcal/dia

CARDIO_RECOMENDADO: [tipo + volume
+ horário ideal]

RETENCAO_HIDRICA: [sim/não/moderada
+ causa provável]

ANALISE: [2 parágrafos — estado atual
e estratégia para atingir o pico no
prazo disponível]

## PROTOCOLO_FEMININO

[Exibir APENAS quando gênero = Feminino. Se masculino, omitir esta seção completamente.]

FASE_CICLO_ATUAL: [fase informada ou
estimada se não informada]

IMPACTO_TREINO_ATUAL: [como a fase
atual afeta a prescrição de treino]

IMPACTO_NUTRICAO_ATUAL: [ajustes
nutricionais para a fase atual]

JANELA_OTIMA_PROXIMAS_SEMANAS: [quando
será o melhor momento para sobrecarga
máxima nas próximas 4 semanas]

SAUDE_HORMONAL: [sinais positivos e
alertas baseados nos dados disponíveis]

CELULITE_FIBROTICA: [se presente —
diagnóstico e protocolo integrado de
treino + nutrição + farmacologia]

CATEGORIA_FEMININA_ESPECIFICA: [análise
do shape atual vs ideal da categoria
feminina escolhida — proporções
específicas, o que o juiz feminino IFBB
valoriza e penaliza]

## FARMACOLOGIA_SHAPE

[Se protocolo informado:]

AVALIACAO_PROTOCOLO: [análise crítica
do protocolo atual para esta categoria
específica — o que está certo e errado]

IMPACTO_SHAPE: [como cada composto
está impactando o shape — positivo
e negativo por grupo muscular]

AJUSTE_SUGERIDO: [o que otimizar
para maximizar shape na categoria]

TIMING_PEAK: [estratégia farmacológica
para peak week com os compostos ativos]

ALERTA: [riscos visuais e de saúde
que precisam de atenção imediata]

[Se natural:]

FARMACOLOGIA_SHAPE: Natural confirmado.

OTIMIZACAO: [suplementação legal +
nutrição de precisão para maximizar
o resultado natural]

## GANHA_PONTOS

Máximo 4 itens:

✓ [ponto forte] — [por que o juiz
valoriza e em qual momento aparece]

## PERDE_PONTOS

Máximo 4 itens:

✗ [ponto fraco] — [por que penaliza
e como aparece no comparativo direto]

## PLANO_ATAQUE

PRIORIDADE_1: [grupo/ajuste]

PRESCRICAO_1: [protocolo completo
com mecanismo fisiológico]

TEMPO_1: [X semanas]

INDICADOR_1: [como medir o progresso]

PRIORIDADE_2: [grupo/ajuste]

PRESCRICAO_2: [protocolo completo]

TEMPO_2: [X semanas]

INDICADOR_2: [métrica de progresso]

PRIORIDADE_3: [grupo/ajuste]

PRESCRICAO_3: [protocolo completo]

TEMPO_3: [X semanas]

INDICADOR_3: [métrica de progresso]

## POSING_CORRETIVO

Para cada pose mandatória:

POSE: [nome exato]

PROBLEMA_ATUAL: [o que está errado
nessa pose específica]

CORRECAO: [instrução sequencial]

CUE_PRINCIPAL: [1 frase memorável]

MUSCULOS_ENGAJAR: [grupos ativos]

MUSCULOS_RELAXAR: [grupos soltos]

COMPENSACAO: [como esconder fraquezas
e vender pontos fortes nessa pose]

## VEREDICTO

SITUACAO_ATUAL: [1 frase — onde está
em relação ao top 5 agora]

DIFERENCIAL_FALTANTE: [1 frase — o que
especificamente separa dos top 5]

CAMINHO: [1 frase — ação prioritária
com prazo para chegar lá]`;


const parseFarmMeta = (text: string) => ({
  tdeeFator: text.match(/TDEE_FATOR:\s*([\d.]+)/i)?.[1],
  proteinaIdeal: text.match(/PROTEINA_IDEAL:\s*([^\n]+)/i)?.[1]?.trim(),
  choEstrategia: text.match(/CHO_ESTRATEGIA:\s*([^\n]+)/i)?.[1]?.trim(),
  gestaoE2: text.match(/GESTAO_E2:\s*([^\n]+)/i)?.[1]?.trim(),
  alertaCardio: text.match(/ALERTA_CARDIO:\s*([^\n]+)/i)?.[1]?.trim(),
  classificacao: text.match(/CLASSIFICACAO_PROTOCOLO:\s*([^\n]+)/i)?.[1]?.trim(),
  scoreOtim: text.match(/SCORE_OTIMIZACAO:\s*([\d.]+\s*\/\s*10|[\d.]+)/i)?.[1]?.trim(),
});

// ─── Parsers ─────────────────────────────────────────────────────
// Remove blocos técnicos de landmarks (com ou sem cercas markdown) que não devem aparecer no texto exibido
const stripLandmarkBlocks = (text: string): string =>
  text
    .replace(/```+\s*json_landmarks_(?:front|lateral|back|pro)[\s\S]*?```+/gi, "")
    .replace(/`{0,3}\s*json_?landmarks_?(?:front|lateral|back|pro)\s*\{[\s\S]*?\n\}\s*`{0,3}/gi, "");

const parseSection = (text: string, key: string, nextKey?: string): string => {
  const cleaned = stripLandmarkBlocks(text);
  const pattern = nextKey
    ? new RegExp(`##\\s*${key}([\\s\\S]*?)##\\s*${nextKey}`, "i")
    : new RegExp(`##\\s*${key}([\\s\\S]*)`, "i");
  return cleaned.match(pattern)?.[1]?.trim() || "";
};

const parseSegments = (text: string) => {
  const block = parseSection(text, "SCORES_SEGMENTOS", "POSTURA_DESVIOS");
  return block.split("\n")
    .map(l => l.trim())
    .filter(l => l.includes(":") && l.includes("/10"))
    .map(l => {
      const [labelPart, ...restParts] = l.split(":");
      const rest = restParts.join(":");
      const score = parseInt(rest.match(/(\d+)\/10/)?.[1] || "0", 10);
      const diag = rest.replace(/\d+\/10/, "").replace(/^[\s\-—]+/, "").trim();
      return { label: labelPart.trim(), score, diag };
    })
    .filter(s => s.label && s.score > 0);
};

const parseMeta = (text: string) => ({
  bfEst: text.match(/BF_ESTIMADO:\s*([\d.]+)/i)?.[1],
  bfMeta: text.match(/BF_META:\s*([\d.]+)/i)?.[1],
  semEst: text.match(/SEMANAS_ESTIMADAS:\s*(\d+)/i)?.[1],
  p1: text.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1],
  p2: text.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1],
  p3: text.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1],
});

const toBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve((r.result as string).split(",")[1]);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

// ─── Landmarks parser ───────────────────────────────────────────
const parseLandmarks = (text: string): LandmarkBundle => {
  const out: LandmarkBundle = {};
  const re = /```json_landmarks_(front|lateral|back)\s*([\s\S]*?)```/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const view = m[1].toLowerCase() as "front" | "lateral" | "back";
    try {
      const parsed = JSON.parse(m[2].trim());
      if (parsed && parsed.landmarks && parsed.angles) {
        let landmarks = parsed.landmarks;
        // Validação pós-detecção (corrige landmarks obviamente errados)
        if (view === "front" || view === "back") {
          const { landmarks: fixed, correcoes, qualidade } =
            validateAndCorrectPosturalLandmarks(landmarks);
          if (correcoes.length > 0 && import.meta.env.DEV) {
            console.log(`[APEX ${view}] Correções aplicadas (q=${qualidade}):`, correcoes);
          }
          landmarks = fixed;
        }
        out[view] = { view, landmarks, angles: parsed.angles } as LandmarkView;
      }
    } catch (e) {
      console.warn(`landmarks ${view} parse failed`, e);
    }
  }
  return out;
};

const uploadApexPhoto = async (
  file: File,
  coachId: string | null,
  athleteId: string | null,
  slot: "front" | "back" | "side"
): Promise<string | null> => {
  if (!file || !coachId) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const ts = Date.now();
  const path = `${coachId}/${athleteId || "noath"}/${ts}-${slot}.${ext}`;
  const { error } = await supabase.storage.from("apex-visual-photos").upload(path, file, {
    contentType: file.type || "image/jpeg",
    upsert: false,
  });
  if (error) {
    console.warn("apex photo upload failed", error);
    return null;
  }
  return path;
};
const segColor = (s: number) =>
  s >= 8 ? "#1DB87A" : s >= 6 ? "#C47A15" : s >= 4 ? "#E07030" : "#D94040";
const segBadge = (s: number) =>
  s >= 8 ? "Elite" : s >= 6 ? "Bom" : s >= 4 ? "Regular" : "Crítico";

// ─── Photo dropzone ─────────────────────────────────────────────
function PhotoZone({ label, file, onPick, onClear, accent }: {
  label: string; file: File | null;
  onPick: (f: File) => void; onClear: () => void; accent: string;
}) {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const albumInputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const [preview, setPreview] = useState<string>("");

  useEffect(() => {
    if (!file) { setPreview(""); return; }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const btnStyle: React.CSSProperties = {
    flex: 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    background: "#0d1520",
    border: "0.5px solid #00D4FF40",
    color: "#00D4FF",
    fontSize: 12,
    fontWeight: 700,
    borderRadius: 8,
    padding: "10px 20px",
    cursor: "pointer",
    transition: "all .2s",
    fontFamily: "inherit",
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "#001520";
    e.currentTarget.style.borderColor = "#00D4FF";
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = "#0d1520";
    e.currentTarget.style.borderColor = "#00D4FF40";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
      onDragLeave={() => setDrag(false)}
      onDrop={(e) => {
        e.preventDefault(); setDrag(false);
        const f = e.dataTransfer.files?.[0];
        if (f && f.type.startsWith("image/")) onPick(f);
      }}
      className="relative rounded-xl overflow-hidden transition-all"
      style={{
        border: `2px dashed ${file ? "#1DB87A" : drag ? accent : "hsl(var(--border))"}`,
        background: file ? "rgba(29,184,122,0.05)" : "hsl(var(--muted) / 0.3)",
        minHeight: 140,
      }}
    >
      {/* Input para câmera (Tirar foto) */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      {/* Input para álbum (Escolher do álbum) — sem capture */}
      <input
        ref={albumInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
      {preview ? (
        <>
          <img src={preview} alt={label} className="w-full h-36 object-cover" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onClear(); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 text-white flex items-center justify-center hover:bg-black"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent text-white text-xs font-semibold px-2 py-1">
            {label}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-36 gap-3 text-muted-foreground">
          {/* Ícones superiores */}
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <Upload className="w-5 h-5" style={{ color: accent }} />
            <Camera className="w-5 h-5" style={{ color: accent }} />
          </div>
          {/* Texto drag-and-drop */}
          <div className="text-sm font-semibold text-foreground">Arraste a foto aqui</div>
          <div className="text-[10px]" style={{ color: APEX.textMuted }}>{label} · MÁX 15MB</div>
          {/* Linha ou */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, width: "100%", padding: "0 12px" }}>
            <div style={{ flex: 1, height: 1, background: APEX.border }} />
            <span style={{ fontSize: 10, color: APEX.textMuted }}>ou</span>
            <div style={{ flex: 1, height: 1, background: APEX.border }} />
          </div>
          {/* Botões lado a lado */}
          <div style={{ display: "flex", gap: 12, width: "100%", padding: "0 12px" }}>
            <button
              type="button"
              onClick={() => cameraInputRef.current?.click()}
              style={btnStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Camera className="w-3.5 h-3.5" />
              Tirar foto
            </button>
            <button
              type="button"
              onClick={() => albumInputRef.current?.click()}
              style={btnStyle}
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              <Image className="w-3.5 h-3.5" />
              Escolher do álbum
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Markdown helpers ───────────────────────────────────────────
const stripMd = (s: string): string =>
  (s || "")
    .replace(/^\s{0,3}#{1,6}\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/(^|[^*])\*([^*\n]+)\*/g, "$1$2")
    .replace(/_([^_\n]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/\*\*+/g, "") // remove any orphan ** sequences
    .trim();

function renderMd(text: string): React.ReactNode {
  if (!text) return null;
  return <ApexMarkdown text={text} />;
}

// ─── Segment bar ────────────────────────────────────────────────
function SegmentBar({ label, score, diag }: { label: string; score: number; diag: string }) {
  const color = segColor(score);
  const cleanLabel = stripMd(label);
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="flex items-center justify-between mb-1">
        <div className="text-sm font-semibold text-foreground">{cleanLabel}</div>
        <div className="flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background: `${color}22`, color }}>
            {segBadge(score)}
          </span>
          <span className="text-sm font-bold" style={{ color }}>{score}/10</span>
        </div>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden mb-2">
        <div className="h-full rounded-full transition-all" style={{ width: `${score * 10}%`, background: color }} />
      </div>
      {diag && <div className="text-xs text-muted-foreground leading-snug whitespace-pre-wrap">{renderMd(diag)}</div>}
    </div>
  );
}

// ─── APEX general score / classification ────────────────────────
type SegItem = { label: string; score: number; diag: string };

const normTxt = (s: string) => (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

function computeApexGeneral(segments: SegItem[], _cat: CategoryDef): number {
  let totalW = 0, totalS = 0;
  segments.forEach((s) => {
    const w = s.score <= 5 ? 2 : 1;
    totalW += w;
    totalS += w * s.score;
  });
  return totalW ? Math.round((totalS / totalW) * 10) : 0;
}

function apexBand(score: number): { label: string; color: string } {
  if (score >= 90) return { label: "World Class", color: "#FFB800" };
  if (score >= 80) return { label: "Elite", color: "#1A6AB5" };
  if (score >= 65) return { label: "Bom", color: "#1DB87A" };
  if (score >= 50) return { label: "Intermediário", color: "#C47A15" };
  return { label: "Iniciante", color: "#D94040" };
}

function ApexGeneralScoreCard({ segments, cat }: { segments: SegItem[]; cat: CategoryDef }) {
  if (!segments.length) return null;
  const score = computeApexGeneral(segments, cat);
  return <ApexScoreGauge score={score} />;
}

function InsightHighlights({ segments }: { segments: SegItem[] }) {
  if (segments.length < 2) return null;
  let lowIdx = 0, highIdx = 0;
  segments.forEach((s, i) => {
    if (s.score < segments[lowIdx].score) lowIdx = i;
    if (s.score > segments[highIdx].score) highIdx = i;
  });
  const low = segments[lowIdx];
  const high = segments[highIdx];
  const firstSentence = (txt: string) => {
    const t = stripMd(txt || "");
    const m = t.match(/^([^.!?\n]+[.!?])/);
    return (m ? m[1] : t).trim();
  };
  return (
    <div className="grid md:grid-cols-2 gap-2">
      <InsightCard type="critico" name={stripMd(low.label)} score={low.score} desc={firstSentence(low.diag)} />
      <InsightCard type="forte" name={stripMd(high.label)} score={high.score} desc={firstSentence(high.diag)} />
    </div>
  );
}

function ScoresRadar({ segments, prevSegments }: { segments: SegItem[]; prevSegments: SegItem[] | null }) {
  if (segments.length < 3) return null;
  const data = segments.map((s) => {
    const label = stripMd(s.label);
    const item: any = { subject: label.length > 16 ? label.slice(0, 14) + "…" : label, current: s.score, fullMark: 10 };
    if (prevSegments) {
      const norm = normTxt(label);
      const match = prevSegments.find((p) => normTxt(stripMd(p.label)) === norm);
      if (match) item.previous = match.score;
    }
    return item;
  });
  return (
    <div className="rounded-xl p-3 border bg-card">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Mapa de Scores</div>
        {prevSegments && <div className="text-[10px] text-muted-foreground">vs análise anterior</div>}
      </div>
      <div style={{ width: "100%", height: 320 }}>
        <ResponsiveContainer>
          <RadarChart data={data} outerRadius="75%">
            <PolarGrid stroke="hsl(var(--border))" />
            <PolarAngleAxis dataKey="subject" tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 10 }} />
            <PolarRadiusAxis angle={90} domain={[0, 10]} tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 9 }} stroke="hsl(var(--border))" />
            {prevSegments && (
              <Radar name="Anterior" dataKey="previous" stroke="#4A9EFF" fill="#4A9EFF" fillOpacity={0.18} />
            )}
            <Radar name="Atual" dataKey="current" stroke="#B8922A" fill="#B8922A" fillOpacity={0.45} />
            <RTooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", fontSize: 11 }} />
            <Legend wrapperStyle={{ fontSize: 10 }} />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────
interface Props { coachId?: string }

export default function ApexVisualDashboard({ coachId: coachIdProp }: Props) {
  const { user } = useAuth();
  const coachId = coachIdProp || user?.id || null;

  const [athlete, setAthlete] = useState<AthleteOption | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CategoryKey>("mens_physique");
  const [photos, setPhotos] = useState<{ front: File | null; back: File | null; side: File | null }>({
    front: null, back: null, side: null,
  });
  const [formData, setFormData] = useState({ semanas: "", compostos: "", obs: "" });
  const [clinicalTests, setClinicalTests] = useState<ClinicalTestsState>(EMPTY_CLINICAL);
  const [objetivoCiclo, setObjetivoCiclo] = useState("cutting");
  const [semanaCiclo, setSemanaCiclo] = useState("");
  const [duracaoCiclo, setDuracaoCiclo] = useState("");
  const [suporte, setSuporte] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState("");
  const [activeResultTab, setActiveResultTab] = useState("scores");
  const [activeVertexTab, setActiveVertexTab] = useState<"auditoria"|"sinergia"|"contencao"|"periodizacao"|"veredicto">("auditoria");
  const [isDone, setIsDone] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);
  const [kineticChains, setKineticChains] = useState<KineticChainType[]>([]);
  const [syncStatus, setSyncStatus] = useState<"pending" | "applied" | null>(null);
  const [showTrainingModal, setShowTrainingModal] = useState(false);
  const [generatingTraining, setGeneratingTraining] = useState(false);
  const [showPromptPreview, setShowPromptPreview] = useState(false);
  const [feminineProfile, setFeminineProfile] = useState<{ ultima_menstruacao: string | null; duracao_ciclo: number | null; fase_ciclo: string | null } | null>(null);
  // Dr. VERTEX v4.0 — análise farmacológica PhD em JSON estruturado
  const [vertexV4Analysis, setVertexV4Analysis] = useState<import("@/components/coach/VertexAnalysisV4").VertexAnalysis | null>(null);
  const [vertexV4Loading, setVertexV4Loading] = useState(false);
  const [vertexV4Error, setVertexV4Error] = useState<string | null>(null);
  const [vertexV4ErrorKind, setVertexV4ErrorKind] = useState<
    "timeout" | "not_found" | "auth" | "network" | "invalid" | "unknown" | null
  >(null);
  const [vertexV4Elapsed, setVertexV4Elapsed] = useState(0);
  const [vertexV4Attempts, setVertexV4Attempts] = useState(0);

  // Consentimento de risco virilizante — exigido a cada sessão antes de gerar farmacologia
  const [virilizationRiskAccepted, setVirilizationRiskAccepted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return sessionStorage.getItem("apex_virilization_risk_accepted") === "1";
  });
  const [showVirilizationModal, setShowVirilizationModal] = useState(false);
  const [pendingVertexAction, setPendingVertexAction] = useState<null | (() => void)>(null);
  // MediaPipe auto-detect bundle (sobrescreve landmarks do sistema quando presente)
  const [mpAutoBundle, setMpAutoBundle] = useState<{
    front: ApexAutoDetectResult | null;
    back: ApexAutoDetectResult | null;
    lateral: ApexAutoDetectResult | null;
  } | null>(null);
  const [detectionSource, setDetectionSource] = useState<DetectionSource>("none");

  const isFemAthlete = isFeminine({ sexo: athlete?.sexo });
  const cyclePhase = feminineProfile?.ultima_menstruacao
    ? getCyclePhase(feminineProfile.ultima_menstruacao, feminineProfile.duracao_ciclo || 28)
    : (feminineProfile?.fase_ciclo as any) || null;
  const cycleDay = feminineProfile?.ultima_menstruacao
    ? getCycleDayCount(feminineProfile.ultima_menstruacao, feminineProfile.duracao_ciclo || 28)
    : null;
  const femCategory = normalizeFeminineCategory(athlete?.categoria || null);

  useEffect(() => {
    (async () => {
      if (!isFemAthlete || !athlete?.patient_user_id) { setFeminineProfile(null); return; }
      const { data } = await supabase
        .from("feminine_profiles" as any)
        .select("ultima_menstruacao,duracao_ciclo,fase_ciclo")
        .eq("user_id", athlete.patient_user_id)
        .maybeSingle();
      setFeminineProfile((data as any) || null);
    })();
  }, [isFemAthlete, athlete?.patient_user_id]);
  const [apexMode, setApexMode] = useState<"analise" | "evolucao" | "guiada">("analise");
  const [promptCopied, setPromptCopied] = useState(false);
  const navigate = useNavigate();

  // History
  const [history, setHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any | null>(null);

  // Visual overlay photo URLs (signed)
  const [photoUrls, setPhotoUrls] = useState<PhotoBundle>({});
  const loadPhotoUrls = useCallback(
    async (paths: { front?: string | null; back?: string | null; side?: string | null }) => {
      const out: PhotoBundle = {};
      const sign = async (p?: string | null) => {
        if (!p) return undefined;
        const { data } = await supabase.storage.from("apex-visual-photos").createSignedUrl(p, 3600);
        return data?.signedUrl;
      };
      out.front = await sign(paths.front);
      out.back = await sign(paths.back);
      out.lateral = await sign(paths.side);
      setPhotoUrls(out);
    },
    []
  );

  // Loading step animation
  useEffect(() => {
    if (!loading) { setStepIdx(0); return; }
    const id = setInterval(() => setStepIdx((i) => Math.min(i + 1, STEPS.length - 1)), 900);
    return () => clearInterval(id);
  }, [loading]);

  const cat = CATEGORIES[selectedCategory];
  const hasAnyPhoto = !!(photos.front || photos.back || photos.side);

  // Bundle de landmarks final = análise (parseada) + MediaPipe (autoritativo onde presente)
  const mergedLandmarksBundle = useMemo(() => {
    const aiBundle = analysisResult ? parseLandmarks(analysisResult) : ({} as any);
    if (!mpAutoBundle) return aiBundle;
    const out: any = { ...aiBundle };
    (["front", "back", "lateral"] as const).forEach((v) => {
      const aiView = (aiBundle as any)[v];
      const mpRes = (mpAutoBundle as any)[v] as ApexAutoDetectResult | null;
      if (!mpRes || mpRes.source === "none") return;
      const { landmarks: merged } = mergeAiWithMediaPipe(aiView?.landmarks, mpRes);
      out[v] = {
        view: v,
        landmarks: merged,
        angles: aiView?.angles || {},
      };
    });
    return out;
  }, [analysisResult, mpAutoBundle]);

  // Fetch history for selected athlete
  const fetchHistory = useCallback(async () => {
    if (!coachId || !athlete?.id) { setHistory([]); return; }
    setHistoryLoading(true);
    const { data, error } = await supabase
      .from("apex_analyses" as any)
      .select("*")
      .eq("coach_id", coachId)
      .eq("athlete_id", athlete.id)
      .order("created_at", { ascending: false })
      .limit(5);
    if (!error) setHistory((data as any[]) || []);
    setHistoryLoading(false);
  }, [coachId, athlete?.id]);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const reset = () => {
    setIsDone(false);
    setAnalysisResult("");
    setPhotos({ front: null, back: null, side: null });
    setFormData({ semanas: "", compostos: "", obs: "" });
    setObjetivoCiclo("cutting");
    setSemanaCiclo("");
    setDuracaoCiclo("");
    setSuporte("");
    setActiveResultTab("scores");
    setSavedAnalysisId(null);
    setSyncStatus(null);
    setPhotoUrls({});
    setVertexV4Analysis(null);
    setVertexV4Error(null);
  };

  // Dr. VERTEX v4.0 — dispara análise farmacológica PhD em JSON
  const runVertexV4 = useCallback(async () => {
    console.log("[DR.VERTEX DEBUG] runVertexV4() iniciado");
    setVertexV4Loading(true);
    setVertexV4Error(null);
    setVertexV4ErrorKind(null);
    setVertexV4Elapsed(0);
    setVertexV4Attempts((n) => n + 1);

    try {
      const farmMeta = parseFarmMeta(analysisResult);
      const meta = parseMeta(analysisResult);
      const segments = parseSegments(analysisResult);
      const compostosInformados = (formData.compostos || "").trim();
      console.log("[DR.VERTEX DEBUG] Compostos informados:", compostosInformados || "(vazio)");
      const protocoloCompleto = `Compostos: ${compostosInformados || "não informado — gerar recomendação farmacológica baseada em perfil/objetivo"}
Objetivo do ciclo: ${objetivoCiclo}
Semana ${semanaCiclo || "não informada"} de ${duracaoCiclo || "não informada"} semanas
Suporte em uso: ${suporte || "não informado"}`;
      const payload = {
        atleta: {
          nome: athlete?.nome,
          categoria: cat?.label,
          semanasShow: formData.semanas,
          fase: objetivoCiclo,
          peso: (athlete as any)?.peso,
          altura: (athlete as any)?.altura,
          experiencia: (athlete as any)?.experiencia,
          condicoes: (athlete as any)?.condicoes,
          suporte,
          observacoes: formData.obs,
        },
        apexScores: {
          bf_estimado: meta?.bfEst,
          bf_meta: meta?.bfMeta,
          condicionamento: segments.find((s) => /condicionamento/i.test(s.label))?.score,
          dorsais: segments.find((s) => /dorsa|largura/i.test(s.label))?.score,
          cintura: segments.find((s) => /cintura/i.test(s.label))?.score,
          panturrilhas: segments.find((s) => /panturr/i.test(s.label))?.score,
          sri: farmMeta?.scoreOtim,
          achados_posturais: parseSection(analysisResult, "POSTURA", "TREINO") || "",
        },
        protocolo: protocoloCompleto,
      };
      console.log("[DR.VERTEX DEBUG] Iniciando chamada para:", "edge function: dr-vertex-analyze");
      console.log("[DR.VERTEX DEBUG] Payload enviado:", JSON.stringify(payload, null, 2));

      // Chamada direta com timeout controlado (a análise leva ~45s; invoke sem timeout
      // pode ficar pendurado indefinidamente e dar a impressão de "nada acontece").
      const { data: sessionData } = await supabase.auth.getSession();
      const accessToken = sessionData?.session?.access_token;
      const anonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;
      const fnUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/dr-vertex-analyze`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 180_000);
      let resp: Response;
      try {
        resp = await fetch(fnUrl, {
          method: "POST",
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            apikey: anonKey,
            Authorization: `Bearer ${accessToken || anonKey}`,
          },
          body: JSON.stringify(payload),
        });
      } catch (err: any) {
        throw new Error(
          err?.name === "AbortError"
            ? "Timeout: a análise passou de 180s sem resposta."
            : `Falha de rede ao chamar a análise: ${err?.message || err}`,
        );
      } finally {
        clearTimeout(timeoutId);
      }

      const text = await resp.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch { /* resposta não-JSON */ }
      console.log("[DR.VERTEX DEBUG] Status da resposta:", resp.status);
      console.log("[DR.VERTEX DEBUG] Dados retornados:", data ?? text?.slice(0, 300));

      if (!resp.ok) {
        throw new Error(data?.error || `Erro ${resp.status} na função dr-vertex-analyze`);
      }
      if (data?.error) throw new Error(data.error);
      const analysis = data?.analysis;
      if (!analysis) throw new Error("Resposta sem análise estruturada");

      console.log("[DR.VERTEX DEBUG] Análise recebida com seções:", Object.keys(analysis || {}));
      setVertexV4Analysis(analysis);
      toast({ title: "Dr. VERTEX v4.0", description: "Análise PhD concluída." });
    } catch (e: any) {
      console.error("[DR.VERTEX DEBUG] ERRO na análise:", e);
      console.error("[DR.VERTEX DEBUG] Error message:", e?.message);
      const msg = e?.message || "Falha na análise";
      const raw = `${msg} ${e?.status ?? ""}`.toLowerCase();
      const kind =
        /timeout|timed out|abort|deadline|504|gateway/.test(raw)
          ? "timeout"
          : /404|not found|function not/.test(raw)
            ? "not_found"
            : /401|403|jwt|unauthor|forbidden|auth|api key/.test(raw)
              ? "auth"
              : /failed to fetch|network|offline|cors/.test(raw)
                ? "network"
                : /sem análise|json|parse|estruturada/.test(raw)
                  ? "invalid"
                  : "unknown";
      setVertexV4ErrorKind(kind as any);
      setVertexV4Error(msg);
      toast({ title: "Erro Dr. VERTEX", description: msg, variant: "destructive" });
    } finally {
      console.log("[DR.VERTEX DEBUG] runVertexV4() finalizado — loading=false");
      setVertexV4Loading(false);
    }

  }, [formData, objetivoCiclo, semanaCiclo, duracaoCiclo, suporte, athlete, analysisResult]);

  // Cronômetro da análise Dr. VERTEX
  useEffect(() => {
    if (!vertexV4Loading) return;
    const t = setInterval(() => setVertexV4Elapsed((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [vertexV4Loading]);



  const fetchSyncStatus = useCallback(async (athleteId: string | null) => {
    if (!athleteId) { setSyncStatus(null); return; }
    const { data } = await supabase
      .from("apex_training_sync" as any)
      .select("sync_status")
      .eq("athlete_id", athleteId)
      .maybeSingle();
    setSyncStatus(((data as any)?.sync_status as any) || null);
  }, []);

  const openHistoryItem = (item: any) => {
    const cat = (Object.keys(CATEGORIES) as CategoryKey[]).find(
      (k) => k === item.category
    ) || "mens_physique";
    setSelectedCategory(cat);
    setAnalysisResult(item.analysis_text || "");
    setIsDone(true);
    setActiveResultTab("scores");
    setSavedAnalysisId(item.id || null);
    fetchSyncStatus(item.athlete_id || athlete?.id || null);
    loadPhotoUrls({
      front: item.photo_front_url,
      back: item.photo_back_url,
      side: item.photo_side_url,
    });
  };

  const handleDelete = async (item: any) => {
    const { error } = await supabase
      .from("apex_analyses" as any)
      .delete()
      .eq("id", item.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
      return;
    }
    setHistory((prev) => prev.filter((h) => h.id !== item.id));
    setItemToDelete(null);
    toast({ title: "Análise excluída" });
  };

  const analyzeWithAI = useCallback(async () => {
    setLoading(true);
    // Kick off MediaPipe auto-detect em paralelo com a chamada do sistema
    const mpPromise = autoDetectAllViews({
      front: photos.front,
      back: photos.back,
      side: photos.side,
    }).catch((e) => {
      console.warn("[APEX] autoDetectAllViews falhou:", e);
      return { front: null, back: null, lateral: null };
    });
    try {
      const photoMap: { label: string; file: File | null }[] = [
        { label: "Frente", file: photos.front },
        { label: "Costas", file: photos.back },
        { label: "Lateral", file: photos.side },
      ];
      const fotos: { label: string; mime: string; data: string }[] = [];
      for (const { label, file } of photoMap) {
        if (!file) continue;
        const data = await toBase64(file);
        fotos.push({ label, mime: file.type || "image/jpeg", data });
      }

      // Upload photos in parallel for overlay + persistence
      const [pathFront, pathBack, pathSide] = await Promise.all([
        photos.front ? uploadApexPhoto(photos.front, coachId, athlete?.id || null, "front") : Promise.resolve(null),
        photos.back ? uploadApexPhoto(photos.back, coachId, athlete?.id || null, "back") : Promise.resolve(null),
        photos.side ? uploadApexPhoto(photos.side, coachId, athlete?.id || null, "side") : Promise.resolve(null),
      ]);
      loadPhotoUrls({ front: pathFront, back: pathBack, side: pathSide });

      const athleteName = athlete?.nome || "atleta";
      const protocoloCompleto = formData.compostos ? `Compostos: ${formData.compostos}
Objetivo do ciclo: ${objetivoCiclo}
Semana ${semanaCiclo || "não informada"} de ${duracaoCiclo || "não informada"} semanas
Suporte em uso: ${suporte || "não informado"}` : "";
      const clinicalBlock = buildClinicalPromptBlock(clinicalTests);
      const contexto = `Atleta: ${athleteName} | Semanas para o show: ${formData.semanas || "n/d"} | Protocolo: ${formData.compostos || "não informado"} | Obs: ${formData.obs || "nenhuma"}${clinicalBlock ? "\n\n" + clinicalBlock : ""}\n\nGere a análise APEX v2 completa.`;
      const system = buildSystemPrompt(cat, athleteName, protocoloCompleto, formData.semanas, formData.obs);

      const { data, error } = await supabase.functions.invoke("apex-visual-analyze", {
        body: {
          fotos, contexto, system,
          sex: isFemAthlete ? "F" : (athlete?.sexo || null),
          category: femCategory ? FEMININE_CATEGORIES[femCategory].label : (athlete?.categoria || null),
          cyclePhase: cyclePhase || null,
          cycleDay: cycleDay || null,
        },
      });
      if (error) throw new Error(error.message);
      if ((data as any)?.error) throw new Error((data as any).error);

      const text = (data as any)?.text || "";
      if (!text) throw new Error("Resposta vazia do sistema");

      setAnalysisResult(text);
      setIsDone(true);
      setActiveResultTab("scores");

      // Await MediaPipe auto-detect e armazena para render/merge
      const mpBundle = await mpPromise;
      setMpAutoBundle(mpBundle);
      const anyMp = ["front", "back", "lateral"].some(
        (v) => (mpBundle as any)[v]?.source === "mediapipe+interpolated",
      );
      const src: DetectionSource = anyMp ? "mediapipe+interpolated" : "ai_vision_fallback";
      setDetectionSource(src);
      if (import.meta.env.DEV) {
        console.log(
          `[APEX MediaPipe] source=${src}`,
          {
            front: mpBundle.front && { conf: mpBundle.front.confidence, n: Object.keys(mpBundle.front.landmarks).length, corrections: mpBundle.front.corrections },
            back: mpBundle.back && { conf: mpBundle.back.confidence, n: Object.keys(mpBundle.back.landmarks).length, corrections: mpBundle.back.corrections },
            lateral: mpBundle.lateral && { conf: mpBundle.lateral.confidence, n: Object.keys(mpBundle.lateral.landmarks).length, corrections: mpBundle.lateral.corrections },
          },
        );
      }

      // Persist to Supabase
      try {
        const meta = parseMeta(text);
        const farmMeta = parseFarmMeta(text);
        const segments = parseSegments(text);
        const aiLandmarks = parseLandmarks(text);
        // Mescla MediaPipe sobre por vista
        const landmarks: any = {};
        (["front", "back", "lateral"] as const).forEach((v) => {
          const aiView = (aiLandmarks as any)[v];
          const mpRes = (mpBundle as any)[v] as ApexAutoDetectResult | null;
          if (!aiView && !mpRes) return;
          const { landmarks: merged, source } = mergeAiWithMediaPipe(aiView?.landmarks, mpRes);
          landmarks[v] = {
            view: v,
            landmarks: merged,
            angles: aiView?.angles || {},
            detection_source: source,
          };
        });
        // Auditoria retrospectiva da qualidade da linha de prumo por vista
        const plumbQuality: Record<string, any> = {};
        (["front", "lateral", "back"] as const).forEach((v) => {
          const lv = (landmarks as any)[v];
          if (lv?.landmarks) {
            const p = calcPlumbLine(lv.landmarks, 100, 100);
            plumbQuality[v] = {
              source: p.source,
              axis_x: p.axisX,
              image_width: 100,
              axis_percent: p.axisX / 100,
            };
          }
        });
        const landmarksWithMeta = Object.keys(landmarks).length
          ? { ...landmarks, plumb_line_quality: plumbQuality }
          : null;
        const scoresJson = segments.reduce((acc, s) => {
          acc[s.label] = s.score;
          return acc;
        }, {} as Record<string, number>);

        const { data: inserted, error: insErr } = await supabase.from("apex_analyses" as any).insert({
          coach_id: coachId,
          athlete_id: athlete?.id || null,
          category: selectedCategory,
          category_label: cat.label,
          analysis_text: text,
          bf_estimated: meta.bfEst ? parseFloat(meta.bfEst) : null,
          bf_target: meta.bfMeta ? parseFloat(meta.bfMeta) : null,
          weeks_estimated: meta.semEst ? parseInt(meta.semEst, 10) : null,
          priority_1: meta.p1 || null,
          priority_2: meta.p2 || null,
          priority_3: meta.p3 || null,
          scores: scoresJson,
          protocol: formData.compostos || null,
          cycle_goal: formData.compostos ? objetivoCiclo : null,
          cycle_week: semanaCiclo ? parseInt(semanaCiclo, 10) : null,
          cycle_duration: duracaoCiclo ? parseInt(duracaoCiclo, 10) : null,
          support: suporte || null,
          tdee_factor: farmMeta.tdeeFator ? parseFloat(farmMeta.tdeeFator) : null,
          protein_ideal: farmMeta.proteinaIdeal || null,
          landmarks: landmarksWithMeta,
          photo_front_url: pathFront,
          photo_back_url: pathBack,
          photo_side_url: pathSide,
        }).select("id").single();
        if (insErr) throw insErr;
        setSavedAnalysisId((inserted as any)?.id || null);
        await fetchSyncStatus(athlete?.id || null);
        toast({ title: "✓ Análise APEX salva com sucesso" });
        fetchHistory();
      } catch (saveErr: any) {
        console.error("apex save error", saveErr);
        toast({
          title: "Análise gerada",
          description: "Erro ao salvar histórico — verifique a conexão.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      toast({
        title: "Erro na análise",
        description: e?.message || "Falha ao processar com a",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [athlete, cat, formData, photos, coachId, selectedCategory, fetchHistory, fetchSyncStatus, objetivoCiclo, semanaCiclo, duracaoCiclo, suporte, loadPhotoUrls]);

  // ─── Generate corrective training ────────────────────
  const buildSyncPayload = useCallback(() => {
    const meta = parseMeta(analysisResult);
    const segments = parseSegments(analysisResult);
    const weakPoints = segments
      .filter((s) => s.score < 6)
      .sort((a, b) => a.score - b.score)
      .map((s) => ({ muscle: s.label, score: s.score, diagnosis: (s as any).diag || "" }));
    return {
      meta,
      weakPoints,
      posturalDeviations: parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS"),
      correctiveProtocol: parseSection(analysisResult, "PONTOS_FRACOS_PROTOCOLO", "CONDICIONAMENTO"),
      posturalCorrections: parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO"),
      priorities: { p1: meta.p1, p2: meta.p2, p3: meta.p3 },
    };
  }, [analysisResult]);

  const handleGenerateTraining = useCallback(async () => {
    if (!athlete?.id || !coachId) {
      toast({ title: "Selecione um atleta antes de gerar o treino", variant: "destructive" });
      return;
    }
    setGeneratingTraining(true);
    try {
      const p = buildSyncPayload();
      const { error } = await supabase.from("apex_training_sync" as any).upsert({
        athlete_id: athlete.id,
        coach_id: user?.id,
        category: selectedCategory,
        weak_points: p.weakPoints,
        postural_deviations: p.posturalDeviations,
        corrective_protocol: p.correctiveProtocol,
        postural_corrections: p.posturalCorrections,
        priorities: p.priorities,
        bf_estimated: p.meta.bfEst ? parseFloat(p.meta.bfEst) : null,
        bf_target: p.meta.bfMeta ? parseFloat(p.meta.bfMeta) : null,
        apex_analysis_id: savedAnalysisId,
        sync_status: "pending",
        updated_at: new Date().toISOString(),
      }, { onConflict: "athlete_id" });
      if (error) throw error;
      setSyncStatus("pending");
      setShowTrainingModal(true);
    } catch (e: any) {
      toast({ title: "Erro ao sincronizar com TrainingON", description: e?.message, variant: "destructive" });
    } finally {
      setGeneratingTraining(false);
    }
  }, [athlete, coachId, user?.id, selectedCategory, savedAnalysisId, buildSyncPayload]);

  const goToTrainingOn = () => {
    if (!athlete?.id) return;
    setShowTrainingModal(false);
    navigate(`/coach/trainingon?athlete=${athlete.id}&mode=corrective`);
  };

  // ─── RENDER: LOADING ─────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-6">
        <ApexSymbol size={96} color={cat.color} animated />
        <div className="text-lg font-bold text-foreground">APEX Intelligence analisando...</div>
        <div className="space-y-1.5 w-full max-w-md">
          {STEPS.map((s, i) => (
            <div
              key={i}
              className="text-sm transition-all"
              style={{
                color: i < stepIdx ? "#1DB87A" : i === stepIdx ? cat.color : "hsl(var(--muted-foreground))",
                opacity: i <= stepIdx ? 1 : 0.4,
                fontWeight: i === stepIdx ? 700 : 400,
              }}
            >
              {i < stepIdx ? "✓ " : i === stepIdx ? "▸ " : "  "}{s}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ─── RENDER: RESULT ──────────────────────────────────
  if (isDone) {
    const meta = parseMeta(analysisResult);
    const farmMeta = parseFarmMeta(analysisResult);
    const farmacologiaSection = parseSection(analysisResult, "FARMACOLOGIA_SHAPE", "GANHA_PONTOS");
    const hasFarmacologia = !!farmacologiaSection && !/nenhum protocolo informado/i.test(farmacologiaSection);
    const segments = parseSegments(analysisResult);
    const tabs = [
      { key: "scores", label: "Scores" },
      { key: "visual", label: "📐 Análise Visual" },
      { key: "postura", label: "Postura" },
      { key: "correcoes", label: "Correções" },
      { key: "plano-mestre", label: "Plano Mestre" },
      { key: "protocolo", label: "Protocolo" },
      ...(hasFarmacologia ? [{ key: "farmacologia", label: "💉 Farmacologia" }] : []),
      { key: "palco", label: "Palco" },
      { key: "plano", label: "Plano" },
      { key: "timeline", label: "📅 Timeline" },
      { key: "evolucao", label: "📈 Evolução" },
    ];

    return (
      <div className="space-y-5">
        {/* Header */}
        <div
          className="rounded-xl p-4 flex items-center gap-3"
          style={{ background: `linear-gradient(135deg, ${cat.color}22, transparent)`, border: `1px solid ${cat.color}55` }}
        >
          <div className="text-3xl">{cat.icon}</div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-base font-black text-foreground">{cat.label}</span>
              <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded tracking-widest" style={{ background: "linear-gradient(135deg,#FFB800,#E0A000)", color: "#1A1100" }}>ELITE</span>
            </div>
            <div className="text-xs text-muted-foreground">{athlete?.nome || "Atleta"} · Análise APEX Visual Intelligence</div>
          </div>
          <button
            onClick={reset}
            className="text-xs px-3 py-2 rounded-lg border hover:bg-muted flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Nova análise
          </button>
        </div>

        {/* Meta pills */}
        <div className="flex flex-wrap gap-2">
          {meta.bfEst && <Pill label="BF estimado" value={`${meta.bfEst}%`} color="#E07030" />}
          {meta.bfMeta && <Pill label="BF meta" value={`${meta.bfMeta}%`} color="#1DB87A" />}
          {meta.semEst && <Pill label="Semanas" value={meta.semEst} color={cat.color} />}
        </div>

        {/* Modo Apresentação */}
        <ApexReportExport
          data={{
            athleteName: athlete?.nome || "Atleta",
            categoryLabel: cat.label,
            photoUrl: photoUrls.front || photoUrls.lateral || photoUrls.back || null,
            accent: cat.color,
            deviations: parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS")
              .split("\n")
              .map((l) => l.replace(/^[\s\-*•]+/, "").trim())
              .filter((l) => l.length > 3 && !l.startsWith("#"))
              .slice(0, 6)
              .map((l) => {
                const [name, ...rest] = l.split(/[:—-]/);
                return { name: name.trim().slice(0, 42), severity_label: rest.join(" ").trim().slice(0, 24) };
              }),
            scores: segments.map((s) => ({ label: s.label, value: s.score })),
            bfEstimated: meta.bfEst,
            bfTarget: meta.bfMeta,
            weeks: meta.semEst,
            priority: meta.p1,
            clientSummary: meta.p1
              ? `Seu foco das próximas semanas: ${meta.p1}. Um passo de cada vez — transformação é sistema.`
              : undefined,
            strengths: [...segments].sort((a, b) => b.score - a.score).slice(0, 3).map((s) => `${s.label} em boa evolução`),
            attentions: [...segments].sort((a, b) => a.score - b.score).slice(0, 2).map((s) => `${s.label} precisa de atenção`),
          }}
        />


        {/* Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-border">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveResultTab(t.key)}
              className="px-3 py-2 text-xs font-semibold whitespace-nowrap rounded-t-lg transition-all"
              style={{
                color: activeResultTab === t.key ? cat.color : "hsl(var(--muted-foreground))",
                borderBottom: `2px solid ${activeResultTab === t.key ? cat.color : "transparent"}`,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        <div>
          {activeResultTab === "scores" && (
            <div className="space-y-3">
              {segments.length === 0 && <EmptyMsg text="Nenhum score retornado pelo sistema." />}
              {segments.length > 0 && (
                <>
                  <ApexGeneralScoreCard segments={segments} cat={cat} />
                  <InsightHighlights segments={segments} />
                  <ScoresRadar
                    segments={segments}
                    prevSegments={(() => {
                      const prev = history.find((h: any) => h && h.id !== savedAnalysisId && h.scores && Object.keys(h.scores).length);
                      if (!prev) return null;
                      return Object.entries(prev.scores as Record<string, number>).map(([label, score]) => ({
                        label, score: Number(score) || 0, diag: "",
                      }));
                    })()}
                  />
                </>
              )}
              {segments.map((s, i) => <SegmentBar key={i} {...s} />)}
              <InfoBlock title="Impacto visual" body={parseSection(analysisResult, "IMPACTO_VISUAL", "SCORES_SEGMENTOS")} accent={cat.color} />
            </div>
          )}
          {activeResultTab === "visual" && (
            <div className="space-y-4">
              {detectionSource !== "none" && (
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                    style={{
                      borderColor: detectionSource === "mediapipe+interpolated" ? "#1D9E75" : "#B8922A",
                      color: detectionSource === "mediapipe+interpolated" ? "#1D9E75" : "#B8922A",
                      background: "rgba(255,255,255,0.02)",
                    }}
                  >
                    {detectionSource === "mediapipe+interpolated"
                      ? "⬡ MediaPipe + Interpolação"
                      : "✦ Vision (fallback)"}
                  </span>
                  <span className="text-white/40">Landmarks detectados automaticamente — coach pode ajustar manualmente</span>
                </div>
              )}
              <ApexVisualOverlay
                landmarks={mergedLandmarksBundle}
                photos={photoUrls}
                athleteName={athlete?.nome}
                category={cat.label}
                sex={isFemAthlete ? "F" : (athlete?.sexo || null)}
                cyclePhase={cyclePhase as any}
                cycleDay={cycleDay}
                feminineCategory={femCategory ? FEMININE_CATEGORIES[femCategory].label : null}
              />
              <KineticChain
                sessionId={savedAnalysisId || null}
                dysfunctions={parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS")}
                muscleMap={parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO")}
                analysisRaw={analysisResult}
                athleteProfile={{
                  nome: athlete?.nome,
                  sexo: athlete?.sexo,
                  categoria: cat?.label,
                }}
                autoGenerate={isDone}
                onChainsReady={setKineticChains}
              />
            </div>
          )}

          {activeResultTab === "postura" && (
            <div className="space-y-3">
              <InfoBox color="#D94040" text="Desvios posturais detectados — músculo dominante vs inibido e impacto no palco." />
              <PosturaCards body={parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS")} />
            </div>
          )}
          {activeResultTab === "correcoes" && (
            <div className="space-y-4">
              <ApexFennerGauge state={clinicalTests} />
              <InfoBox color="#0F8A63" text="Para cada desvio: alongamento, ativação e cue de postura." />
              <CorrecoesCards body={parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO")} />
              <ApexSessionGenerator />
              <ApexCorrectiveLibrary />
            </div>
          )}
          {activeResultTab === "plano-mestre" && (
            <ApexPlanoMestre
              sessionId={savedAnalysisId || null}
              autoGenerate
              fcsScore={(() => {
                const sc = segments.map(s => s.score).filter(n => typeof n === "number");
                return sc.length ? Math.round(sc.reduce((a,b)=>a+b,0)/sc.length) : null;
              })()}
              dysfunctions={parseSection(analysisResult, "POSTURA_DESVIOS", "CORRECOES_POSTURAIS")}
              muscleMap={parseSection(analysisResult, "CORRECOES_POSTURAIS", "PONTOS_FRACOS_PROTOCOLO")}
              athleteProfile={{
                nome: athlete?.nome,
                sexo: athlete?.sexo,
                idade: (athlete as any)?.idade,
                altura: (athlete as any)?.altura,
                peso: (athlete as any)?.peso,
                categoria: cat?.label,
              }}
              goal={(athlete as any)?.objetivo || cat?.label || ""}
              analysisRaw={analysisResult}
              kineticChains={kineticChains}
            />
          )}
          {activeResultTab === "protocolo" && (
            <div className="space-y-3">
              <InfoBox color="#C47A15" text="Diagnóstico + causa + exercícios + frequência + tempo de resposta." />
              <ProtocoloCards body={parseSection(analysisResult, "PONTOS_FRACOS_PROTOCOLO", "CONDICIONAMENTO")} />
              <GenerateTrainingButton onClick={handleGenerateTraining} loading={generatingTraining} />
            </div>
          )}
          {activeResultTab === "farmacologia" && hasFarmacologia && (() => {
            const vertexTabs: { key: typeof activeVertexTab; label: string; section: string; next: string; color: string; intro: string }[] = [
              { key: "auditoria",    label: "🧪 Auditoria",        section: "VERTEX_AUDITORIA",   next: "VERTEX_SINERGIA",     color: "#534AB7", intro: "Composto a composto — status, dose, timing, sinergia, impacto no shape e red flags." },
              { key: "sinergia",     label: "🔗 Sinergia",         section: "VERTEX_SINERGIA",    next: "VERTEX_OTIMIZACAO",   color: "#3B82F6", intro: "Stack como um todo — interações, redundâncias, gaps, ratio androgênico, perfil estrogênico e impacto no HPTA." },
              { key: "contencao",    label: "🛡️ Contenção de Danos", section: "VERTEX_CONTENCAO",   next: "VERTEX_PERIODIZACAO", color: "#D94040", intro: "Sistemas orgânicos com semáforo de risco + protocolos de suporte e exames recomendados." },
              { key: "periodizacao", label: "📅 Periodização",      section: "VERTEX_PERIODIZACAO", next: "VERTEX_SHAPE",        color: "#C47A15", intro: "Cronograma farmacológico semana a semana até o show, incluindo peak week." },
              { key: "veredicto",    label: "🏆 Veredicto",         section: "VERTEX_VEREDICTO",   next: "GANHA_PONTOS",        color: "#FFB800", intro: "Classificação do protocolo, score de otimização e mensagem do Dr. VERTEX." },
            ];
            const otimizacao = parseSection(analysisResult, "VERTEX_OTIMIZACAO", "VERTEX_CONTENCAO");
            const shape = parseSection(analysisResult, "VERTEX_SHAPE", "VERTEX_VEREDICTO");
            const current = vertexTabs.find(t => t.key === activeVertexTab)!;
            const currentBody = parseSection(analysisResult, current.section, current.next);
            return (
              <div className="space-y-3">
                <InfoBox color="#534AB7" text="💉 Dr. VERTEX — coach farmacológico de elite. Análise técnica, sem julgamento, orientada a resultado máximo com menor risco." />

                {/* Meta pills */}
                <div className="flex flex-wrap gap-2">
                  {farmMeta.classificacao && <Pill label="Protocolo" value={farmMeta.classificacao} color="#FFB800" />}
                  {farmMeta.scoreOtim && <Pill label="Otimização" value={farmMeta.scoreOtim.includes("/") ? farmMeta.scoreOtim : `${farmMeta.scoreOtim}/10`} color="#534AB7" />}
                  {farmMeta.tdeeFator && <Pill label="TDEE fator" value={`×${farmMeta.tdeeFator}`} color="#534AB7" />}
                  {farmMeta.proteinaIdeal && <Pill label="Proteína" value={farmMeta.proteinaIdeal} color="#1DB87A" />}
                  {farmMeta.choEstrategia && <Pill label="CHO" value={farmMeta.choEstrategia} color="#C47A15" />}
                  {farmMeta.gestaoE2 && <Pill label="E2" value={farmMeta.gestaoE2} color="#E07030" />}
                  {farmMeta.alertaCardio && <Pill label="Cardio" value={farmMeta.alertaCardio} color="#D94040" />}
                </div>

                {/* Sub-tabs */}
                <div className="flex gap-1.5 overflow-x-auto pb-1 border-b border-border">
                  {vertexTabs.map(t => (
                    <button
                      key={t.key}
                      onClick={() => setActiveVertexTab(t.key)}
                      className="px-3 py-2 text-[11px] font-semibold whitespace-nowrap rounded-t-lg transition-all"
                      style={{
                        color: activeVertexTab === t.key ? t.color : "hsl(var(--muted-foreground))",
                        borderBottom: `2px solid ${activeVertexTab === t.key ? t.color : "transparent"}`,
                      }}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* Trigger Dr. VERTEX v4.0 (JSON estruturado, PhD-level) */}
                <div className="flex items-center gap-2 flex-wrap relative" style={{ zIndex: 10 }}>
                  <button
                    type="button"
                    onClick={() => {
                      console.log("[DR.VERTEX DEBUG] Botão clicado");
                      console.log("[DR.VERTEX DEBUG] Handler registrado no botão", typeof runVertexV4);
                      console.log("[DR.VERTEX DEBUG] Props recebidas:", {
                        analysisId: savedAnalysisId,
                        compounds: formData?.compostos,
                        profileData: { athlete, objetivoCiclo, semanaCiclo, duracaoCiclo, suporte },
                      });
                      console.log("[DR.VERTEX DEBUG] Estados de bloqueio:", {
                        vertexV4Loading,
                        virilizationRiskAccepted,
                        temAnaliseAnterior: !!vertexV4Analysis,
                      });
                      if (vertexV4Loading) {
                        console.warn("[DR.VERTEX DEBUG] RETURN PREMATURO: loading travado em true");
                        return;
                      }
                      if (virilizationRiskAccepted) {
                        console.log("[DR.VERTEX DEBUG] Risco aceito → chamando runVertexV4()");
                        runVertexV4();
                      } else {
                        console.log("[DR.VERTEX DEBUG] Risco NÃO aceito → abrindo modal de consentimento (ação pendente)");
                        setPendingVertexAction(() => () => runVertexV4());
                        setShowVirilizationModal(true);
                      }
                    }}
                    className="px-[18px] py-[10px] text-[13px] font-semibold rounded-md border transition-all"
                    style={{
                      background: vertexV4Loading ? "rgba(144,128,255,0.12)" : (vertexV4Analysis ? "rgba(144,128,255,0.18)" : "rgba(144,128,255,0.12)"),
                      borderColor: "rgba(144,128,255,0.4)",
                      color: "#c0b8ff",
                      position: "relative",
                      zIndex: 10,
                      pointerEvents: "auto",
                      cursor: vertexV4Loading ? "wait" : "pointer",
                      opacity: vertexV4Loading ? 0.7 : 1,
                      boxShadow: vertexV4Loading ? "none" : undefined,
                    }}
                    onMouseEnter={(e) => {
                      if (vertexV4Loading) return;
                      e.currentTarget.style.background = "rgba(144,128,255,0.22)";
                      e.currentTarget.style.borderColor = "#9080ff";
                      e.currentTarget.style.boxShadow = "0 0 12px rgba(144,128,255,0.2)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = vertexV4Analysis ? "rgba(144,128,255,0.18)" : "rgba(144,128,255,0.12)";
                      e.currentTarget.style.borderColor = "rgba(144,128,255,0.4)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                  >
                    {vertexV4Loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="inline-block w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Analisando... {vertexV4Elapsed}s
                      </span>
                    ) : vertexV4ErrorKind ? (
                      `${VERTEX_ERROR_INFO[vertexV4ErrorKind].icon} ${VERTEX_ERROR_INFO[vertexV4ErrorKind].label} — tentar novamente`
                    ) : vertexV4Analysis ? "🔬 Reexecutar Dr. VERTEX v4.0" : "🔬 Analisar com Dr. VERTEX v4.0 (PhD)"}
                  </button>
                  {vertexV4Analysis && !vertexV4Loading && !vertexV4ErrorKind && (
                    <span className="text-[10px] font-mono" style={{ color: "#34D399" }}>
                      ✓ Análise PhD ativa — JSON estruturado
                    </span>
                  )}

                  {/* Tela de status */}
                  {(vertexV4Loading || vertexV4Error) && (
                    <div
                      className="w-full rounded-xl p-3 mt-1 text-[11px] space-y-1.5"
                      style={{
                        background: vertexV4Error ? "rgba(239,68,68,0.08)" : "rgba(144,128,255,0.08)",
                        border: `1px solid ${vertexV4Error ? "rgba(239,68,68,0.35)" : "rgba(144,128,255,0.3)"}`,
                      }}
                    >
                      {vertexV4Loading ? (
                        <>
                          <div className="font-bold" style={{ color: "#c0b8ff" }}>
                            Dr. VERTEX processando · {vertexV4Elapsed}s / ~90s
                          </div>
                          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.08)" }}>
                            <div
                              className="h-full transition-all"
                              style={{ width: `${Math.min(97, (vertexV4Elapsed / 90) * 100)}%`, background: "#9080ff" }}
                            />
                          </div>
                          <div className="text-muted-foreground">
                            Tentativa {vertexV4Attempts} · análise farmacológica PhD em JSON estruturado
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="font-bold" style={{ color: "#EF4444" }}>
                            {VERTEX_ERROR_INFO[vertexV4ErrorKind || "unknown"].icon}{" "}
                            {VERTEX_ERROR_INFO[vertexV4ErrorKind || "unknown"].label}
                          </div>
                          <div className="text-muted-foreground">
                            {VERTEX_ERROR_INFO[vertexV4ErrorKind || "unknown"].hint}
                          </div>
                          <div className="font-mono opacity-70 break-all">{vertexV4Error}</div>
                          <div className="text-muted-foreground">Tentativas: {vertexV4Attempts}</div>
                          <div className="flex gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => runVertexV4()}
                              className="px-3 py-1.5 rounded-md border text-[11px] font-semibold"
                              style={{ borderColor: "rgba(144,128,255,0.5)", color: "#c0b8ff" }}
                            >
                              ↻ Tentar novamente
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setVertexV4Error(null);
                                setVertexV4ErrorKind(null);
                              }}
                              className="px-3 py-1.5 rounded-md border border-border text-[11px] text-muted-foreground"
                            >
                              Dispensar
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                </div>

                {/* Sub-tab content — visualização estruturada */}
                <InfoBox color={current.color} text={current.intro} />
                {vertexV4Analysis ? (
                  <VertexAnalysisV4 analysis={vertexV4Analysis} activeTab={activeVertexTab} />
                ) : (
                  <VertexEnhancedView
                    activeTab={activeVertexTab}
                    analysisResult={analysisResult}
                    segments={segments}
                    farmMeta={farmMeta}
                    categoryColor={cat.color}
                    parseSection={parseSection}
                  />
                )}
                {/* Fallback raw markdown (colapsado) caso o sistema não respeite o formato esperado */}
                {currentBody && (
                  <details className="rounded border border-border/50 p-2 bg-card/30">
                    <summary className="cursor-pointer text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      📄 Texto bruto do sistema
                    </summary>
                    <div className="mt-2"><Pre body={currentBody} /></div>
                  </details>
                )}
              </div>
            );
          })()}
          {activeResultTab === "palco" && (
            <div className="space-y-3">
              <PalcoNPCTab
                photoUrls={{ front: photoUrls.front, side: photoUrls.lateral, back: photoUrls.back }}
                initialCategoryKey={selectedCategory}
                athlete={{
                  nome: athlete?.nome,
                  bf: (meta as any)?.bfEst ?? null,
                  sexo: athlete?.sexo,
                }}
                achados={(parseSection(analysisResult, "POSTURA", "TREINO") || "")
                  .split("\n")
                  .map((l) => l.trim())
                  .filter(Boolean)
                  .slice(0, 12)
                  .map((titulo) => {
                    const m = titulo.match(/(-?\d+(?:[.,]\d+)?)\s*°/);
                    return { titulo, graus: m ? parseFloat(m[1].replace(",", ".")) : 0 };
                  })}
              />
              <div className="grid md:grid-cols-2 gap-3">
                <ScoreSide title="✅ Ganha pontos" color="#1DB87A" body={parseSection(analysisResult, "GANHA_PONTOS", "PERDE_PONTOS")} />
                <ScoreSide title="❌ Perde pontos" color="#D94040" body={parseSection(analysisResult, "PERDE_PONTOS", "PLANO_ATAQUE")} />
              </div>
              <InfoBlock title="Posing corretivo" body={parseSection(analysisResult, "POSING_CORRETIVO", "VEREDICTO")} accent={cat.color} />
            </div>
          )}
          {activeResultTab === "plano" && (
            <div className="space-y-3">
              <div className="grid md:grid-cols-3 gap-3">
                <PrioCard n={1} color="#D94040" text={meta.p1} />
                <PrioCard n={2} color="#C47A15" text={meta.p2} />
                <PrioCard n={3} color="#1DB87A" text={meta.p3} />
              </div>
              <div className="flex flex-wrap gap-2">
                {meta.bfEst && <Pill label="BF estimado" value={`${meta.bfEst}%`} color="#E07030" />}
                {meta.bfMeta && <Pill label="BF meta" value={`${meta.bfMeta}%`} color="#1DB87A" />}
                {meta.semEst && <Pill label="Semanas" value={meta.semEst} color={cat.color} />}
              </div>
              <InfoBlock title="Condicionamento" body={parseSection(analysisResult, "CONDICIONAMENTO", "FARMACOLOGIA_SHAPE")} accent={cat.color} />
              {hasFarmacologia && (
                <InfoBlock
                  title="💉 Farmacologia"
                  body={farmacologiaSection || ""}
                  accent="#C47A15"
                />
              )}
              <GenerateTrainingButton onClick={handleGenerateTraining} loading={generatingTraining} />
            </div>
          )}
          {activeResultTab === "timeline" && (
            <ApexTimelineTab
              athleteId={athlete?.id || null}
              coachId={coachId || null}
              athleteName={athlete?.nome}
            />
          )}
          {activeResultTab === "evolucao" && (
            <ApexEvolutionTab athleteId={athlete?.id || null} />
          )}
        </div>

        {/* Sync status badge */}
        {syncStatus && (
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{
              background: syncStatus === "applied" ? "#1DB87A22" : "#C47A1522",
              color: syncStatus === "applied" ? "#1DB87A" : "#C47A15",
              border: `1px solid ${syncStatus === "applied" ? "#1DB87A55" : "#C47A1555"}`,
            }}
          >
            {syncStatus === "applied" ? (
              <><CheckCircle2 className="w-3.5 h-3.5" /> Treino Corretivo Ativo no TrainingON</>
            ) : (
              <><Clock className="w-3.5 h-3.5" /> Aguardando TrainingON</>
            )}
          </div>
        )}

        {/* Veredicto sempre visível */}
        <div
          className="rounded-xl p-4"
          style={{ background: `linear-gradient(135deg, ${cat.color}33, ${cat.color}11)`, border: `1px solid ${cat.color}66` }}
        >
          <div className="flex items-center gap-2 mb-1" style={{ color: cat.color }}>
            <ApexSymbol size={20} color={cat.color} animated />
            <span className="text-[10px] font-bold uppercase tracking-wider">Veredicto APEX — O que falta para Top 5</span>
          </div>
          <div className="text-sm italic text-foreground whitespace-pre-wrap">
            {parseSection(analysisResult, "VEREDICTO") ? renderMd(parseSection(analysisResult, "VEREDICTO")) : "—"}
          </div>
        </div>

        {/* Modal de confirmação */}
        <Dialog open={showTrainingModal} onOpenChange={setShowTrainingModal}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Dumbbell className="w-5 h-5" style={{ color: cat.color }} />
                Treino Corretivo Pronto para Gerar
              </DialogTitle>
              <DialogDescription>
                Os dados da análise APEX foram sincronizados. O TrainingON vai gerar treino específico para os pontos fracos + exercícios de ativação pré-treino.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-2 text-sm">
              <div><span className="text-muted-foreground">Atleta:</span> <span className="font-semibold">{athlete?.nome || "—"}</span></div>
              <div><span className="text-muted-foreground">Categoria:</span> <span className="font-semibold">{cat.label}</span></div>
              <div>
                <div className="text-muted-foreground mb-1">Pontos fracos identificados:</div>
                <div className="flex flex-wrap gap-1.5">
                  {buildSyncPayload().weakPoints.length === 0 && (
                    <span className="text-xs text-muted-foreground italic">Nenhum grupo com score &lt; 6.</span>
                  )}
                  {buildSyncPayload().weakPoints.map((w, i) => (
                    <span key={i} className="text-[11px] px-2 py-0.5 rounded-full bg-muted font-semibold">
                      {w.muscle} ({w.score})
                    </span>
                  ))}
                </div>
              </div>
              {meta.p1 && (
                <div><span className="text-muted-foreground">Prioridade 1:</span> <span className="font-semibold">{meta.p1}</span></div>
              )}
            </div>
            <DialogFooter>
              <button
                onClick={() => setShowTrainingModal(false)}
                className="px-4 py-2 text-sm rounded-lg border hover:bg-muted"
              >
                Cancelar
              </button>
              <button
                onClick={goToTrainingOn}
                className="px-4 py-2 text-sm rounded-lg font-bold text-white"
                style={{ background: "linear-gradient(135deg, #1A6AB5, #2A8AE5)" }}
              >
                Ir para o TrainingON
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ─── RENDER: FORM ────────────────────────────────────
  const accent = cat.color;
  const sysFont = APEX.fontBody;
  const labelStyle: React.CSSProperties = {
    fontFamily: APEX.fontBody, fontSize: 10, fontWeight: 700,
    color: APEX.textSecondary, letterSpacing: ".12em", textTransform: "uppercase",
  };
  const cardStyle: React.CSSProperties = {
    background: APEX.surface, border: `1px solid ${APEX.border}`,
    borderRadius: 16, padding: "18px 20px",
  };
  const inputBase: React.CSSProperties = {
    width: "100%", padding: "12px 14px", background: APEX.deep,
    border: `1px solid ${APEX.border}`, borderRadius: 10,
    color: APEX.textPrimary, fontSize: 13, fontFamily: APEX.fontBody,
    lineHeight: 1.55, outline: "none", boxSizing: "border-box", transition: "border .2s",
  };
  const sectionTick = (color: string) => (
    <div style={{ width: 3, height: 14, background: color, borderRadius: 2 }} />
  );

  return (
    <div style={{ background: APEX.void, color: APEX.textPrimary, fontFamily: sysFont, padding: 4 }}>
      <ApexFontsAndAnimations />

      {/* ━━━ HEADER ━━━ */}
      <div style={{
        background: `linear-gradient(180deg, ${APEX.deep}, ${APEX.void})`,
        border: `1px solid ${APEX.border}`, borderRadius: 18,
        padding: "20px 24px", marginBottom: 20, position: "relative", overflow: "hidden",
      }}>
        <button
          onClick={() => navigate("/coach")}
          className="absolute top-4 right-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded border transition-all hover:brightness-110"
          style={{
            borderColor: `${APEX.gold}44`,
            color: APEX.gold,
            fontFamily: "'Space Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: ".15em",
            textTransform: "uppercase" as const,
            background: "transparent",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${APEX.gold}88`;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 12px ${APEX.gold}22`;
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = `${APEX.gold}44`;
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
          }}
        >
          <ArrowLeft size={12} />
          Voltar
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 10, color: APEX.textMuted, fontFamily: APEX.fontMono, letterSpacing: ".08em", marginBottom: 14 }}>
          <span>nutriON</span>
          <ChevronRight size={10} />
          <span>Coach Hub</span>
          <ChevronRight size={10} />
          <span style={{ color: APEX.electric }}>APEX Intelligence</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{
              width: 56, height: 56, borderRadius: 14,
              background: `linear-gradient(135deg, ${APEX.electricDim}, ${APEX.deep})`,
              border: `1px solid ${APEX.electric}55`, position: "relative", overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: `0 0 30px ${APEX.electricGlow}`,
            }}>
              <ApexSymbol size={44} color={APEX.electric} animated />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 800, color: APEX.textPrimary, letterSpacing: ".02em" }}>APEX</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 800, color: APEX.electric, letterSpacing: ".02em" }}>INTELLIGENCE</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 24, fontWeight: 400, color: APEX.textSecondary, letterSpacing: ".02em" }}>SYSTEM</span>
                <span style={{
                  fontFamily: APEX.fontDisplay, fontSize: 10, fontWeight: 800, letterSpacing: ".15em",
                  padding: "3px 8px", borderRadius: 4, color: "#1A1100",
                  background: `linear-gradient(135deg, ${APEX.gold}, #E0A000)`,
                  boxShadow: `0 0 12px ${APEX.gold}55`,
                }}>ELITE</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 11, color: APEX.textSecondary, fontFamily: APEX.fontBody, letterSpacing: ".02em", display: "flex", flexWrap: "wrap", gap: "0 4px", alignItems: "center" }}>
                <span>Motor de Diagnóstico Visual</span><span style={{ color: APEX.textMuted }}>·</span>
                <span>Padrão IFBB</span><span style={{ color: APEX.textMuted }}>·</span>
                <span>Biomecânica</span><span style={{ color: APEX.textMuted }}>·</span>
                <span>Farmacologia Integrada</span>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", background: APEX.deep, border: `1px solid ${APEX.emerald}44`, borderRadius: 999 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: APEX.emerald, boxShadow: `0 0 8px ${APEX.emerald}`, animation: "apex-pulse 2s ease-in-out infinite" }} />
            <span style={{ fontFamily: APEX.fontMono, fontSize: 10, fontWeight: 700, color: APEX.emerald, letterSpacing: ".1em" }}>SISTEMA ATIVO</span>
          </div>
        </div>

        <div style={{ marginTop: 16, height: 2, borderRadius: 2, background: `linear-gradient(90deg, ${APEX.electric}, transparent 60%)` }} />
      </div>

      {/* ━━━ ATLETA ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {sectionTick(APEX.electric)}
          <span style={labelStyle}>Atleta em Análise</span>
        </div>
        <AthleteSelector value={athlete?.id ?? null} onChange={setAthlete} />
        {isFemAthlete && (
          <FeminineCyclePhaseBanner phase={cyclePhase as any} cycleDay={cycleDay} />
        )}
      </div>

      {/* ━━━ MODE TOGGLE: Análise vs Evolução Fotográfica ━━━ */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {([
          { k: "analise" as const,  l: "Análise APEX",            icon: ScanLine },
          { k: "guiada" as const,   l: "Sessão Guiada",         icon: Crosshair },
          { k: "evolucao" as const, l: "Evolução Fotográfica",  icon: TrendingUp },
        ]).map(({ k, l, icon: Ic }) => {
          const active = apexMode === k;
          return (
            <button
              key={k}
              onClick={() => setApexMode(k)}
              style={{
                flex: 1, padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                background: active ? `linear-gradient(135deg, ${APEX.electricDim}, ${APEX.deep})` : APEX.deep,
                border: `1px solid ${active ? APEX.electric : APEX.border}`,
                color: active ? APEX.electric : APEX.textSecondary,
                fontFamily: APEX.fontDisplay, fontSize: 12, fontWeight: 700,
                letterSpacing: ".08em", textTransform: "uppercase",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                boxShadow: active ? `0 0 18px ${APEX.electricGlow}` : "none",
              }}
            >
              <Ic size={14} /> {l}
            </button>
          );
        })}
      </div>

      {apexMode === "evolucao" && (
        <div style={{ marginBottom: 16 }}>
          {athlete ? (
            <ApexEvolucao
              atletaId={athlete.id}
              atletaNome={athlete.nome}
              dataCompeticao={athlete.data_competicao}
              categoriaAtleta={athlete.categoria ?? selectedCategory}
            />
          ) : (
            <div style={{ ...cardStyle, textAlign: "center", color: APEX.textSecondary, padding: 32 }}>
              Selecione um atleta para acessar a evolução fotográfica.
            </div>
          )}
        </div>
      )}

      {apexMode === "guiada" && (
        <div style={{ marginBottom: 16 }}>
          <ApexGuidedSession
            athleteId={athlete?.id || null}
            athleteName={athlete?.nome || null}
            athleteData={{
              sex: (athlete?.sexo as "M" | "F") || undefined,
              sport: athlete?.categoria || undefined,
            }}
            accentColor={APEX.gold}
            onCompleted={() => { /* salvo no Supabase */ }}
          />
        </div>
      )}

      {apexMode === "analise" && (<>



      {/* ━━━ CATEGORIA ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
          {sectionTick(APEX.gold)}
          <span style={labelStyle}>Categoria de Competição</span>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {(Object.keys(CATEGORIES) as CategoryKey[]).map((key) => {
            const c = CATEGORIES[key];
            const isActive = selectedCategory === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedCategory(key)}
                style={{
                  padding: "10px 14px", borderRadius: 10, cursor: "pointer",
                  fontFamily: APEX.fontBody, transition: "all .2s",
                  background: isActive ? `linear-gradient(135deg, ${c.color}25, ${c.color}10)` : APEX.deep,
                  border: `1px solid ${isActive ? c.color : APEX.border}`,
                  color: isActive ? c.color : APEX.textSecondary,
                  fontSize: 12, fontWeight: isActive ? 700 : 500,
                  display: "flex", alignItems: "center", gap: 8, letterSpacing: ".01em",
                  boxShadow: isActive ? `0 0 20px ${c.color}30` : "none",
                }}
              >
                <span style={{ fontSize: 14 }}>{c.icon}</span>
                <span>{c.label}</span>
                <span style={{ fontSize: 11, opacity: .7 }}>{c.gender === "M" ? "♂" : "♀"}</span>
              </button>
            );
          })}
        </div>

        <div style={{
          marginTop: 14, padding: "12px 14px", borderRadius: 10,
          background: `linear-gradient(135deg, ${accent}10, transparent)`,
          border: `1px solid ${accent}44`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
            <Target size={11} color={accent} />
            <span style={{ fontFamily: APEX.fontMono, fontSize: 9, fontWeight: 700, color: accent, letterSpacing: ".15em" }}>
              PADRÃO DE JULGAMENTO IFBB
            </span>
          </div>
          <div style={{ fontSize: 12, color: APEX.textPrimary, lineHeight: 1.55, marginBottom: 8 }}>{cat.ideal}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {cat.keyPoints.map((k) => (
              <span key={k} style={{
                fontSize: 10, fontFamily: APEX.fontMono, padding: "3px 8px", borderRadius: 4,
                background: `${accent}1A`, color: accent, border: `1px solid ${accent}33`,
              }}>{k}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ━━━ FOTOS ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {sectionTick(APEX.electric)}
            <span style={labelStyle}>Fotos para Análise</span>
          </div>
          <span style={{ fontSize: 10, color: APEX.textMuted }}>
            mín. 1 obrigatória · mais ângulos = diagnóstico mais preciso
          </span>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12 }}>
          {[
            { key: "front" as const, label: "FRENTE", num: "01", instruction: "Relaxado, braços ao lado" },
            { key: "back" as const, label: "COSTAS", num: "02", instruction: "Dorsal visível" },
            { key: "side" as const, label: "LATERAL", num: "03", instruction: "Perfil direito ou esquerdo" },
          ].map(({ key, label, num, instruction }) => (
            <div key={key}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                <span style={{ fontFamily: APEX.fontMono, fontSize: 11, fontWeight: 700, color: APEX.electric }}>{num}</span>
                <span style={{ fontFamily: APEX.fontDisplay, fontSize: 11, fontWeight: 700, color: APEX.textPrimary, letterSpacing: ".1em" }}>{label}</span>
              </div>
              <PhotoZone
                label={instruction}
                file={photos[key]}
                accent={APEX.electric}
                onPick={(f) => setPhotos((p) => ({ ...p, [key]: f }))}
                onClear={() => setPhotos((p) => ({ ...p, [key]: null }))}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ━━━ SEMANAS + PROTOCOLO ━━━ */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 12, marginBottom: 16 }}>
        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {sectionTick(APEX.amber)}
            <span style={labelStyle}>Semanas para o Show</span>
          </div>
          <input
            type="number" min={0}
            value={formData.semanas}
            onChange={(e) => setFormData({ ...formData, semanas: e.target.value })}
            placeholder="Ex: 12"
            style={{ ...inputBase, fontFamily: APEX.fontMono, fontSize: 15, fontWeight: 500 }}
            onFocus={(e) => (e.target.style.borderColor = APEX.electric)}
            onBlur={(e) => (e.target.style.borderColor = APEX.border)}
          />
        </div>

        <div style={cardStyle}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {sectionTick(APEX.violet)}
              <span style={labelStyle}>Protocolo Farmacológico</span>
            </div>
            {formData.compostos && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "4px 10px", background: `${APEX.violet}15`, border: `1px solid ${APEX.violet}55`, borderRadius: 999 }}>
                <Zap size={10} color={APEX.violet} />
                <span style={{ fontFamily: APEX.fontMono, fontSize: 9, fontWeight: 700, color: APEX.violet, letterSpacing: ".1em" }}>DR. VERTEX ATIVO</span>
              </div>
            )}
          </div>
          <textarea
            value={formData.compostos}
            onChange={(e) => setFormData({ ...formData, compostos: e.target.value })}
            placeholder="Ex: Testosterona Enantato 300mg/sem, Trembolona 200mg/sem, Masteron 200mg/sem, HGH 2UI/dia..."
            rows={3}
            style={{ ...inputBase, border: `1px solid ${formData.compostos ? `${APEX.violet}44` : APEX.border}`, fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
            onFocus={(e) => (e.target.style.borderColor = APEX.violet)}
            onBlur={(e) => (e.target.style.borderColor = formData.compostos ? `${APEX.violet}44` : APEX.border)}
          />
          {formData.compostos && (
            <div style={{ marginTop: 8, fontSize: 10, color: APEX.textSecondary, lineHeight: 1.5 }}>
              ✦ A análise incluirá: impacto dos compostos no shape · sinergias do stack · próximo nível do protocolo · fitoterápicos e suporte · gestão de estrogênio
            </div>
          )}
        </div>
      </div>

      {/* ━━━ CICLO DETALHES ━━━ */}
      {formData.compostos && (
        <div style={{ ...cardStyle, marginBottom: 16, borderColor: `${APEX.violet}44` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
            {sectionTick(APEX.violet)}
            <span style={labelStyle}>Detalhes do Ciclo</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Objetivo</div>
              <select value={objetivoCiclo} onChange={(e) => setObjetivoCiclo(e.target.value)} style={inputBase}>
                <option value="cutting">Cutting</option>
                <option value="bulk">Bulk</option>
                <option value="recomp">Recomposição</option>
                <option value="peak">Peak Week</option>
                <option value="manutencao">Manutenção</option>
              </select>
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Semana do ciclo</div>
              <input type="number" value={semanaCiclo} onChange={(e) => setSemanaCiclo(e.target.value)} placeholder="Ex: 6" style={{ ...inputBase, fontFamily: APEX.fontMono }} />
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Duração total (sem)</div>
              <input type="number" value={duracaoCiclo} onChange={(e) => setDuracaoCiclo(e.target.value)} placeholder="Ex: 16" style={{ ...inputBase, fontFamily: APEX.fontMono }} />
            </div>
            <div>
              <div style={{ ...labelStyle, fontSize: 9, marginBottom: 6 }}>Suporte em uso</div>
              <input type="text" value={suporte} onChange={(e) => setSuporte(e.target.value)} placeholder="Ex: Anastrozol 0.5mg, TUDCA" style={inputBase} />
            </div>
          </div>
        </div>
      )}

      {/* ━━━ TESTES CLÍNICOS (por foto) ━━━ */}
      <div id="apex-clinical-tests" style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {sectionTick(APEX.electric)}
          <span style={labelStyle}>Testes Clínicos</span>
        </div>
        <ApexClinicalTests
          athleteId={athlete?.patient_user_id ?? athlete?.id ?? null}
          coachId={user?.id ?? null}
          athleteData={{
            sex: (athlete?.sexo === "F" ? "F" : "M") as "M" | "F",
          }}
        />
      </div>

      {/* ━━━ OBSERVAÇÕES ━━━ */}
      <div style={{ ...cardStyle, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          {sectionTick(APEX.electric)}
          <span style={labelStyle}>Observações do Coach</span>
        </div>
        <textarea
          value={formData.obs}
          onChange={(e) => setFormData({ ...formData, obs: e.target.value })}
          placeholder="Contexto adicional: lesões, deload, dieta atual, queixas do atleta, pontos específicos para avaliar..."
          rows={3}
          style={{ ...inputBase, fontSize: 12, lineHeight: 1.65, resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = APEX.electric)}
          onBlur={(e) => (e.target.style.borderColor = APEX.border)}
        />
      </div>

      {/* ━━━ HISTÓRICO ━━━ */}
      {athlete && (
        <div style={{ ...cardStyle, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            {sectionTick(APEX.textSecondary)}
            <span style={labelStyle}>Análises anteriores</span>
            <span style={{ fontSize: 10, color: APEX.textMuted, marginLeft: 4 }}>· {athlete.nome}</span>
          </div>
          {historyLoading ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ height: 56, borderRadius: 10, background: APEX.deep, opacity: .5 }} />
              ))}
            </div>
          ) : history.length === 0 ? (
            <div style={{ fontSize: 11, color: APEX.textMuted, fontStyle: "italic", padding: "16px", textAlign: "center", border: `1px dashed ${APEX.border}`, borderRadius: 10 }}>
              Nenhuma análise anterior para este atleta.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {history.map((item) => {
                const itemCat = (CATEGORIES as any)[item.category] || cat;
                return (
                  <div key={item.id} style={{
                    display: "flex", alignItems: "center", gap: 12, padding: "10px 12px",
                    background: APEX.deep, border: `1px solid ${itemCat.color}33`, borderRadius: 10,
                  }}>
                    <div style={{ fontSize: 22 }}>{itemCat.icon}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span style={{ fontSize: 12, fontWeight: 700, color: APEX.textPrimary }}>{item.category_label || itemCat.label}</span>
                        <span style={{ fontSize: 10, color: APEX.textMuted, fontFamily: APEX.fontMono }}>{formatRelative(item.created_at)}</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                        {item.bf_estimated != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${APEX.amber}22`, color: APEX.amber, fontFamily: APEX.fontMono }}>BF est {item.bf_estimated}%</span>}
                        {item.bf_target != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${APEX.emerald}22`, color: APEX.emerald, fontFamily: APEX.fontMono }}>Meta {item.bf_target}%</span>}
                        {item.weeks_estimated != null && <span style={{ fontSize: 9, padding: "2px 6px", borderRadius: 3, background: `${itemCat.color}22`, color: itemCat.color, fontFamily: APEX.fontMono }}>{item.weeks_estimated} sem</span>}
                      </div>
                    </div>
                    <button
                      onClick={() => openHistoryItem(item)}
                      style={{ fontSize: 10, padding: "6px 10px", borderRadius: 6, background: "transparent", color: itemCat.color, border: `1px solid ${itemCat.color}55`, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700 }}
                    >
                      <Eye size={11} /> Ver
                    </button>
                    <button
                      onClick={() => setItemToDelete(item)}
                      title="Excluir análise"
                      style={{ fontSize: 10, padding: "6px 10px", borderRadius: 6, background: "transparent", color: APEX.textMuted, border: `1px solid ${APEX.border}`, cursor: "pointer", display: "flex", alignItems: "center", gap: 4, fontWeight: 700, transition: "color 0.2s, border-color 0.2s" }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = APEX.crimson; (e.currentTarget as HTMLButtonElement).style.borderColor = `${APEX.crimson}55`; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = APEX.textMuted; (e.currentTarget as HTMLButtonElement).style.borderColor = APEX.border; }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ━━━ AÇÕES ━━━ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <button
          onClick={() => setShowPromptPreview(true)}
          style={{
            width: "100%", padding: "10px 16px", borderRadius: 10, cursor: "pointer",
            background: APEX.deep, border: `1px solid ${APEX.border}`,
            color: APEX.textSecondary, fontSize: 11, fontFamily: APEX.fontBody, fontWeight: 600,
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            letterSpacing: ".05em",
          }}
        >
          <FileText size={12} />
          Pré-visualizar diagnóstico (APEX + Dr. VERTEX)
        </button>

        <button
          onClick={analyzeWithAI}
          disabled={!hasAnyPhoto}
          style={{
            width: "100%", padding: "18px 24px", borderRadius: 14, border: "none",
            cursor: hasAnyPhoto ? "pointer" : "not-allowed",
            fontFamily: APEX.fontDisplay, fontSize: 14, fontWeight: 800,
            letterSpacing: ".1em", textTransform: "uppercase",
            transition: "all .3s", position: "relative", overflow: "hidden",
            background: hasAnyPhoto ? `linear-gradient(135deg, ${accent}, ${accent}AA)` : APEX.deep,
            color: hasAnyPhoto ? "#000" : APEX.textMuted,
            boxShadow: hasAnyPhoto ? `0 0 40px ${accent}40, 0 4px 20px ${accent}30` : "none",
          }}
        >
          {hasAnyPhoto && (
            <div style={{
              position: "absolute", top: 0, left: "-100%", width: "60%", height: "100%",
              background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
              animation: "apex-shimmer 2.5s ease-in-out infinite",
            }} />
          )}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, position: "relative" }}>
            {hasAnyPhoto ? (
              <>
                <Crosshair size={18} strokeWidth={2.5} />
                <span>INICIAR DIAGNÓSTICO APEX{formData.compostos ? " + DR. VERTEX" : ""}</span>
              </>
            ) : (
              <>
                <ApexSymbol size={18} color={APEX.textMuted} animated={false} />
                <span>ADICIONE AO MENOS 1 FOTO PARA INICIAR</span>
              </>
            )}
          </div>
        </button>
      </div>

      {/* Modal: prompt preview */}
      <Dialog open={showPromptPreview} onOpenChange={setShowPromptPreview}>
        <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-4 h-4" /> Prompt completo enviado ao sistema
            </DialogTitle>
            <DialogDescription>
              Análise APEX {formData.compostos ? "+ Dr. VERTEX (farmacologia ativa)" : "(sem protocolo farmacológico)"} — {athlete?.nome || "atleta"} · {cat.label}
            </DialogDescription>
          </DialogHeader>
          {(() => {
            const athleteName = athlete?.nome || "atleta";
            const protocoloCompleto = formData.compostos ? `Compostos: ${formData.compostos}
Objetivo do ciclo: ${objetivoCiclo}
Semana ${semanaCiclo || "não informada"} de ${duracaoCiclo || "não informada"} semanas
Suporte em uso: ${suporte || "não informado"}` : "";
            const system = buildSystemPrompt(cat, athleteName, protocoloCompleto, formData.semanas, formData.obs);
            const contexto = `Atleta: ${athleteName} | Semanas para o show: ${formData.semanas || "n/d"} | Protocolo: ${formData.compostos || "não informado"} | Obs: ${formData.obs || "nenhuma"}\n\nGere a análise APEX completa.`;
            const fullPrompt = `━━━━━ SYSTEM PROMPT ━━━━━\n\n${system}\n\n━━━━━ USER CONTEXT ━━━━━\n\n${contexto}`;
            return (
              <>
                <div className="flex-1 overflow-auto rounded-lg border border-border bg-muted/30 p-3">
                  <pre className="text-[11px] leading-relaxed whitespace-pre-wrap font-mono text-foreground">{fullPrompt}</pre>
                </div>
                <DialogFooter className="gap-2">
                  <div className="text-xs text-muted-foreground mr-auto self-center">{fullPrompt.length.toLocaleString()} caracteres</div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(fullPrompt).then(() => {
                        setPromptCopied(true);
                        toast({ title: "Prompt copiado", description: "Conteúdo enviado ao sistema copiado para a área de transferência." });
                        setTimeout(() => setPromptCopied(false), 2000);
                      });
                    }}
                    className="px-4 py-2 rounded-md text-xs font-bold bg-primary text-primary-foreground hover:bg-primary/90 flex items-center gap-2"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {promptCopied ? "✓ Copiado" : "Copiar prompt completo"}
                  </button>
                </DialogFooter>
              </>
            );
          })()}
        </DialogContent>
      </Dialog>
      </>)}

      {/* ━━━ DELETE CONFIRMATION DIALOG ━━━ */}
      <AlertDialog open={!!itemToDelete} onOpenChange={(open) => !open && setItemToDelete(null)}>
        <AlertDialogContent style={{ background: APEX.surface, border: `1px solid ${APEX.border}`, color: APEX.textPrimary }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: APEX.textPrimary }}>Deseja excluir esta análise?</AlertDialogTitle>
            <AlertDialogDescription style={{ color: APEX.textSecondary }}>
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => setItemToDelete(null)}
              style={{ background: "transparent", border: `1px solid ${APEX.border}`, color: APEX.textSecondary }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToDelete && handleDelete(itemToDelete)}
              style={{ background: APEX.crimson, color: "#fff", border: "none" }}
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Consentimento obrigatório — risco virilizante antes de gerar farmacologia */}
      <AlertDialog
        open={showVirilizationModal}
        onOpenChange={(open) => {
          if (!open) {
            setShowVirilizationModal(false);
            setPendingVertexAction(null);
          }
        }}
      >
        <AlertDialogContent style={{ background: APEX.surface, border: `1px solid #D94040`, color: APEX.textPrimary, maxWidth: 540 }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: "#FF6B6B", display: "flex", alignItems: "center", gap: 8 }}>
              ⚠️ Consentimento de risco — Farmacologia
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div style={{ color: APEX.textSecondary, fontSize: 13, lineHeight: 1.55, marginTop: 8 }}>
                <p style={{ marginBottom: 10 }}>
                  Toda recomendação farmacológica gerada pelo <b style={{ color: "#A78BFA" }}>Dr. VERTEX</b> envolve compostos
                  androgênicos/anabolizantes com <b style={{ color: "#FF6B6B" }}>risco virilizante</b> (especialmente em atletas
                  femininas): engrossamento da voz, hirsutismo, clitoromegalia, acne severa, queda capilar, alteração do ciclo
                  menstrual — alguns efeitos podem ser <b>irreversíveis</b>.
                </p>
                <p style={{ marginBottom: 10 }}>
                  Esta ferramenta é destinada a <b>profissionais qualificados</b>. Você confirma que:
                </p>
                <ul style={{ paddingLeft: 18, marginBottom: 10, listStyle: "disc" }}>
                  <li>O atleta tem <b>≥ 18 anos</b> e consentiu o uso.</li>
                  <li>Há <b>acompanhamento médico</b> e exames laboratoriais em dia.</li>
                  <li>Você compreende os <b>sinais de virilização</b> e interromperá o protocolo ao primeiro sinal.</li>
                  <li>A responsabilidade clínica é <b>sua</b> — o NutriON não prescreve medicamentos.</li>
                </ul>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{ background: "transparent", color: APEX.textSecondary, border: `1px solid ${APEX.border}` }}
              onClick={() => { setShowVirilizationModal(false); setPendingVertexAction(null); }}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                console.log("[DR.VERTEX DEBUG] Consentimento aceito no modal de virilização");
                setVirilizationRiskAccepted(true);
                try { sessionStorage.setItem("apex_virilization_risk_accepted", "1"); } catch {}
                setShowVirilizationModal(false);
                const action = pendingVertexAction;
                setPendingVertexAction(null);
                console.log("[DR.VERTEX DEBUG] Ação pendente presente?", !!action);
                if (action) action();
              }}
              style={{ background: "#D94040", color: "#fff", border: "none", fontWeight: 700 }}
            >
              Aceito o risco e prosseguir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* APEX Agent — fixed drawer available on every tab */}
      <ApexAgentDrawer
        athleteId={(athlete as any)?.patient_user_id ?? (athlete as any)?.id ?? null}
        athleteName={(athlete as any)?.nome || undefined}
        activeTab={activeResultTab}
        apexContext={[
          `Atleta: ${(athlete as any)?.nome || "n/d"} · Categoria: ${cat?.label || "n/d"}`,
          `Semanas para o palco: ${formData?.semanas || "n/d"}`,
          formData?.compostos ? `Protocolo farmacológico: ${formData.compostos}` : "Sem protocolo farmacológico informado",
          formData?.obs ? `Observações: ${formData.obs}` : "",
          "",
          "=== ANÁLISE APEX COMPLETA ===",
          analysisResult || "(análise ainda não gerada)",
        ].filter(Boolean).join("\n")}
      />
    </div>
  );
}

function formatRelative(iso: string) {
  const d = new Date(iso);
  const diffMs = Date.now() - d.getTime();
  const days = Math.floor(diffMs / 86400000);
  if (days < 1) {
    const h = Math.floor(diffMs / 3600000);
    return h < 1 ? "agora" : `há ${h}h`;
  }
  if (days === 1) return "ontem";
  if (days < 7) return `há ${days} dias`;
  return d.toLocaleDateString("pt-BR");
}

// ─── Small helpers ───────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</div>
      {children}
    </label>
  );
}

function Pill({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-2"
      style={{ background: color + "1A", border: `1px solid ${color}55`, color }}>
      <span className="opacity-70">{label}:</span>
      <span className="font-bold">{value}</span>
    </div>
  );
}

function InfoBox({ color, text }: { color: string; text: string }) {
  return (
    <div className="rounded-lg p-3 text-xs" style={{ background: color + "12", border: `1px solid ${color}44`, color }}>
      {text}
    </div>
  );
}

function Pre({ body }: { body: string }) {
  if (!body) return <EmptyMsg text="Sem conteúdo nesta seção." />;
  return (
    <div className="text-xs font-mono text-foreground/90 whitespace-pre-wrap leading-relaxed bg-muted/30 rounded-lg p-3 border border-border">
      {renderMd(body)}
    </div>
  );
}

function InfoBlock({ title, body, accent }: { title: string; body: string; accent: string }) {
  if (!body) return null;
  return (
    <div className="rounded-lg p-3 border bg-card">
      <div className="text-[10px] font-bold uppercase tracking-wider mb-1.5" style={{ color: accent }}>{stripMd(title)}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{renderMd(body)}</div>
    </div>
  );
}

function ScoreSide({ title, color, body }: { title: string; color: string; body: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: color + "66", background: color + "0A" }}>
      <div className="text-xs font-bold mb-2" style={{ color }}>{stripMd(title)}</div>
      <div className="text-xs text-foreground/90 whitespace-pre-wrap leading-relaxed">{body ? renderMd(body) : "—"}</div>
    </div>
  );
}

function PrioCard({ n, color, text }: { n: number; color: string; text?: string }) {
  return (
    <div className="rounded-lg p-3 border" style={{ borderColor: color + "66", background: color + "0A" }}>
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black text-white" style={{ background: color }}>
          {n}
        </div>
        <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color }}>Prioridade {n}</div>
      </div>
      <div className="text-xs text-foreground/90">{text ? renderMd(text) : "—"}</div>
    </div>
  );
}

function EmptyMsg({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground italic px-3 py-4 text-center">{text}</div>;
}

function GenerateTrainingButton({ onClick, loading }: { onClick: () => void; loading?: boolean }) {
  return (
    <button
      onClick={onClick}
      disabled={loading}
      className="w-full mt-4 p-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      style={{ background: "linear-gradient(135deg, #1A6AB5, #2A8AE5)", color: "#fff" }}
    >
      <Dumbbell className="w-4 h-4" />
      {loading ? "Sincronizando..." : "Gerar Treino Corretivo no TrainingON"}
    </button>
  );
}
