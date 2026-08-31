import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import AthleteSelector, { AthleteOption } from "@/components/coach/AthleteSelector";
import { buildFeminineContext, type FeminineContext } from "@/lib/feminineContext";
import jsPDF from "jspdf";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, BarChart, Bar, Cell } from "recharts";
import APEXPoseAnalysisPage from "@/pages/coach/APEXPoseAnalysisPage";
import { buildApexPackage } from "@/utils/apexVeraMap";

function EvolutionCharts({ history, cat, C }: { history: any[]; cat: any; C: any }) {
  // Order chronologically (history is desc)
  const data = [...history].reverse().map((h: any) => ({
    semana: `S${h.semana_numero}`,
    data: new Date(h.data_avaliacao).toLocaleDateString("pt-BR", { day:"2-digit", month:"2-digit" }),
    peso: h.peso_kg ? Number(h.peso_kg) : null,
    bf: h.bf_estimado ? Number(h.bf_estimado) : null,
    fase: h.fase || "—",
  }));

  const FASE_COLORS: Record<string, string> = {
    "OFF-SEASON": C.green, "BULKING": C.green,
    "PRÉ-CONTEST": C.amber, "PRE-CONTEST": C.amber, "CUTTING": C.amber,
    "PEAK WEEK": C.red, "PEAK-WEEK": C.red,
    "RECOMP": C.purple, "MANUTENÇÃO": C.apex,
  };
  const fases = Array.from(new Set(data.map(d => d.fase))).filter(f => f && f !== "—");
  const faseData = data.map((d, i) => ({ semana: d.semana, idx: i+1, fase: d.fase, color: FASE_COLORS[d.fase?.toUpperCase()] || C.apex }));

  const cardStyle: React.CSSProperties = { background: C.cardHi, border:`1px solid ${C.border}`, borderRadius:10, padding:12 };
  const titleStyle: React.CSSProperties = { fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase", fontWeight:600 };
  const tooltipStyle = { background: C.card, border:`1px solid ${C.borderHi}`, borderRadius:6, fontSize:11, color:C.text };
  const axisProps = { stroke: C.textSec, fontSize: 10, tick: { fill: C.textSec } };

  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:12, marginBottom:14 }}>
      <div style={cardStyle}>
        <div style={titleStyle}>📊 Peso (kg) · semana a semana</div>
        <div style={{ width:"100%", height:160 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top:5, right:8, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="semana" {...axisProps} />
              <YAxis {...axisProps} domain={["auto","auto"]} />
              <Tooltip contentStyle={tooltipStyle as any} labelStyle={{ color: C.text }} />
              <Line type="monotone" dataKey="peso" stroke={cat.c} strokeWidth={2} dot={{ r:3, fill: cat.c }} connectNulls name="Peso (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>🔥 BF estimado (%) · evolução</div>
        <div style={{ width:"100%", height:160 }}>
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top:5, right:8, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="semana" {...axisProps} />
              <YAxis {...axisProps} domain={["auto","auto"]} />
              <Tooltip contentStyle={tooltipStyle as any} labelStyle={{ color: C.text }} />
              <Line type="monotone" dataKey="bf" stroke={C.amber} strokeWidth={2} dot={{ r:3, fill: C.amber }} connectNulls name="BF (%)" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={titleStyle}>🎯 Fase · linha do tempo</div>
        <div style={{ width:"100%", height:160 }}>
          <ResponsiveContainer>
            <BarChart data={faseData} margin={{ top:5, right:8, left:-15, bottom:0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} />
              <XAxis dataKey="semana" {...axisProps} />
              <YAxis hide domain={[0, 1]} />
              <Tooltip contentStyle={tooltipStyle as any} labelStyle={{ color: C.text }} formatter={(_v:any, _n:any, p:any) => [p.payload.fase, "Fase"]} />
              <Bar dataKey={() => 1} radius={[4,4,0,0]}>
                {faseData.map((d, i) => <Cell key={i} fill={d.color} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div style={{ display:"flex", flexWrap:"wrap", gap:8, marginTop:6 }}>
          {fases.map(f => (
            <div key={f} style={{ display:"flex", alignItems:"center", gap:4, fontSize:10, color:C.textSec }}>
              <span style={{ width:8, height:8, borderRadius:2, background: FASE_COLORS[f.toUpperCase()] || C.apex, display:"inline-block" }} />{f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PALETA APEX v3 ───────────────────────────────────────────────
const C = {
  void: "#04050A", deep: "#080B12", surface: "#0C1018",
  card: "#101520", cardHi: "#141A26",
  border: "#1C2333", borderHi: "#28344A",
  apex: "#00E5FF", apexDim: "#00E5FF22", apexGlow: "#00E5FF44",
  gold: "#FFB800", goldDim: "#FFB80022",
  green: "#00E676", greenDim: "#00E67622",
  amber: "#FFB300",
  red: "#FF3D57", redDim: "#FF3D5722",
  purple: "#7C4DFF", purpleDim: "#7C4DFF22",
  pink: "#FF4081", pinkDim: "#FF408122",
  text: "#F0F4FF", textSec: "#5A6A88", textDim: "#2A3348",
};

type Cat = { l: string; i: string; g: "M" | "F"; c: string; ideal: string; pts: string[] };
const CATS: Record<string, Cat> = {
  mens_physique:    { l:"Men's Physique",   i:"🏄", g:"M", c:C.apex,   ideal:"Shape atlético, cintura estreita, ombros largos, condicionamento sem estriação excessiva.", pts:["deltoide lateral","inserção lat","cintura","abdômen"] },
  classic_physique: { l:"Classic Physique", i:"🏛", g:"M", c:C.gold,   ideal:"Golden Era — Zane, Reeves. Cintura tiny, ombros e peitoral dominantes, proporção peso/altura.", pts:["proporção peso/altura","cintura","peitoral","simetria"] },
  bodybuilding:     { l:"Bodybuilding",     i:"💪", g:"M", c:C.red,    ideal:"Máximo tamanho + máximo condicionamento. Sem pontos fracos.", pts:["quadríceps","panturrilha","dorsal inferior","condicionamento"] },
  bikini:           { l:"Bikini",           i:"👙", g:"F", c:C.pink,   ideal:"Glúteos centrais, cintura estreita, fitness saudável com feminilidade.", pts:["glúteos","cintura","proporção","condicionamento moderado"] },
  wellness:         { l:"Wellness",         i:"🌸", g:"F", c:C.purple, ideal:"MMII dominantes. Glúteos e pernas em destaque. Contraste cintura-quadril máximo.", pts:["glúteos","coxas posteriores","contraste cintura-quadril"] },
  figure:           { l:"Figure",           i:"⚡", g:"F", c:C.green,  ideal:"Forma X perfeita. Músculo visível com feminilidade.", pts:["ombros","simetria topo-base","definição","cintura"] },
  womens_physique:  { l:"Women's Physique", i:"🔥", g:"F", c:C.amber,  ideal:"Máximo desenvolvimento mantendo forma feminina.", pts:["separação","condicionamento","dorsais","simetria"] },
  shape_lifestyle:  { l:"Shape Lifestyle",  i:"🏋", g:"M", c:C.green,  ideal:"Praticante de musculação não-competidor buscando shape estético top, simetria, proporção e correções posturais. Avaliação completa (mesma profundidade da competição) sem exigência de palco.", pts:["simetria","proporção","postura","pontos fracos","estética geral"] },
};

type Athlete = { nome: string; idade: string; peso: string; altura: string; semanas: string; fase: string };
type Protocol = { compostos: string; objetivo: string; semana: string; duracao: string; suporte: string; faseCorpo: string; pesoAtual: string; pesoPico: string };

// ─── SYSTEM PROMPT MASTER ─────────────────────────────────────────
const buildSystem = (cat: Cat, athlete: Athlete, protocol: Protocol) => `Você é o APEX Visual Intelligence —
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
Ciclo menstrual: folicular (1-14, estrogênio
crescente, janela de sobrecarga); ovulação
(~14, força máxima, risco ligamentar);
lútea (15-28, progesterona, catabolismo,
retenção, reduzir volume); menstruação
(1-5, deload natural).
Hormônios: estrogênio (padrão ginoide,
protege massa magra); progesterona (sódio/
água, humor); testosterona feminina 10-20x
menor — avaliar DHEA e androstenediona.

Pontos posturais femininos:
Hiperlordose lombar, valgo bilateral de
joelho (ângulo Q maior, impacta glúteo
médio e VMO), hiperpronação, anteriorização
de cabeça por salto alto, celulite fibrótica
como diagnóstico postural/hormonal.

Farmacologia feminina:
Anavar 5-15mg/dia (mais usado, baixa
virilização); Primobolan 25-75mg/sem
(manutenção em cutting); GH (Wellness/
Bikini, lipolise e pele); peptídeos
BPC-157, TB-500, Ipamorelin.
ALERTA VIRILIZAÇÃO: voz, clitoromegalia,
acne severa, queda de cabelo → suspender.

Nutrição feminina:
Déficit máx seguro 300-400 kcal (LEA);
nunca zero carb (tireoide/hormônios
reprodutivos); monitorar Female Athlete
Triad (energia, densidade óssea, ciclo);
amenorreia = alerta máximo; ferro/ferritina,
cálcio e vitamina D prioritários.

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

Quando o gênero for feminino, TODA a
análise deve considerar:
- Fase atual do ciclo menstrual
  (se informada nas observações)
- Padrões posturais específicos femininos
- Categoria IFBB feminina e critérios
  específicos de julgamento
- Fisiologia hormonal feminina aplicada
  ao shape, treino e nutrição
- Sinais de alerta para Female Athlete
  Triad e disfunção hormonal

━━━ DADOS DO ATLETA ━━━

Nome: ${athlete.nome || "não informado"}

Categoria: ${cat.l}

Gênero: ${cat.g === "M" ? "Masculino" : "Feminino"}

Semanas para o show: ${athlete.semanas || "n/d"}

Protocolo farmacológico: ${protocol.compostos || "não informado"}

Observações do coach: nenhuma

IDEAL DA CATEGORIA: ${cat.ideal}

PONTOS CRÍTICOS: ${cat.pts.join(" | ")}

POSES MANDATÓRIAS: Consultar poses da categoria
${cat.g === "F" ? `
DADOS ESPECÍFICOS FEMININOS:

Fase do ciclo: não informada
Usa anticoncepcional: não informado
Histórico de amenorreia: não informado
Objetivo estético principal: ${cat.l}

INSTRUÇÃO: Toda a análise deve ser
contextualizada pela fisiologia feminina.
Se fase do ciclo informada, ajustar as
prescrições de treino e nutrição para a
fase atual. Se anticoncepcional ativo,
considerar impacto na retenção hídrica e
resposta hormonal ao treino.
` : ""}


CONTEXTO DE URGÊNCIA:

${!athlete.semanas || athlete.semanas === 'n/d'
  ? 'Sem data definida. Foco em desenvolvimento estrutural. Horizonte 12-16 semanas.'
  : parseInt(athlete.semanas) < 4
  ? 'CRÍTICO: menos de 4 semanas. Apenas posing e peak week. Zero mudanças estruturais.'
  : parseInt(athlete.semanas) < 8
  ? `${athlete.semanas} semanas. Priorização máxima. Apenas mudanças com resposta visual em até 5 semanas.`
  : parseInt(athlete.semanas) < 12
  ? `${athlete.semanas} semanas. Priorização agressiva. Foco nos 2-3 pontos de maior impacto visual.`
  : `${athlete.semanas} semanas. Periodização completa. Prescrições de desenvolvimento real possíveis.`
}

CONTEXTO FARMACOLÓGICO:

${!protocol.compostos || protocol.compostos === 'não informado'
  ? 'Atleta natural confirmado. Toda análise baseada em otimização de treino, nutrição e suplementação legal. Não fazer referências a compostos farmacológicos.'
  : `PROTOCOLO ATIVO: ${protocol.compostos}

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

[Exibir APENAS quando gênero = Feminino. Se masculino, omitir esta seção.]

FASE_CICLO_ATUAL: [fase informada ou estimada]
IMPACTO_TREINO_ATUAL: [como a fase atual
afeta a prescrição de treino]
IMPACTO_NUTRICAO_ATUAL: [ajustes nutricionais
para a fase atual]
JANELA_OTIMA_PROXIMAS_SEMANAS: [melhor momento
para sobrecarga máxima nas próximas 4 semanas]
SAUDE_HORMONAL: [sinais positivos e alertas]
CELULITE_FIBROTICA: [se presente — diagnóstico
e protocolo integrado treino+nutrição+farmaco]
CATEGORIA_FEMININA_ESPECIFICA: [shape atual vs
ideal — proporções, o que o juiz feminino IFBB
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


// ─── HELPERS ─────────────────────────────────────────────────────
const toB64 = (f: File): Promise<string> => new Promise((res, rej) => {
  const r = new FileReader();
  r.onload = () => res((r.result as string).split(",")[1]);
  r.onerror = rej;
  r.readAsDataURL(f);
});

const secParse = (t: string, k: string, n: string | null) => {
  const p = n ? new RegExp(`##\\s*${k}([\\s\\S]*?)##\\s*${n}`, "i") : new RegExp(`##\\s*${k}([\\s\\S]*)`, "i");
  return t.match(p)?.[1]?.trim() || "";
};

const parseSegs = (t: string) => {
  const b = secParse(t, "SCORES_SEGMENTOS", "COMPOSICAO_CORPORAL");
  return b.split("\n").map(l => l.trim()).filter(l => l.includes(":") && l.includes("/10")).map(l => {
    const [a, b2] = l.split(":");
    const s = parseInt(b2?.match(/(\d+)\/10/)?.[1] || "0");
    const d = b2?.replace(/\d+\/10/, "").replace(/^[\s—\-]+/, "").trim() || "";
    return { label: a.trim(), score: s, diag: d };
  }).filter(s => s.label && s.score > 0);
};

const parseMeta = (t: string) => ({
  bfEst: t.match(/BF_ESTIMADO:\s*([\d.]+)/i)?.[1],
  bfMeta: t.match(/BF_META:\s*([\d.]+)/i)?.[1],
  massaMagra: t.match(/MASSA_MAGRA_EST:\s*([\d.]+)/i)?.[1],
  semMeta: t.match(/SEMANAS_META:\s*(\d+)/i)?.[1],
  veredictoFase: t.match(/VEREDICTO_FASE:\s*([^\n]+)/i)?.[1]?.trim(),
  manobraPrincipal: t.match(/MANOBRA_PRINCIPAL:\s*([^\n]+)/i)?.[1]?.trim(),
  urgencia: t.match(/URGENCIA:\s*([^\n]+)/i)?.[1]?.trim(),
  tdeeFator: t.match(/TDEE_FATOR:\s*([\d.]+)/i)?.[1],
  proteinaIdeal: t.match(/PROTEINA_IDEAL:\s*([^\n]+)/i)?.[1],
  gestaoE2: t.match(/GESTAO_E2:\s*([^\n]+)/i)?.[1],
  alertaCardio: t.match(/ALERTA_CARDIOVASCULAR:\s*([^\n]+)/i)?.[1],
  p1: t.match(/PRIORIDADE_1:\s*([^\n]+)/i)?.[1],
  p2: t.match(/PRIORIDADE_2:\s*([^\n]+)/i)?.[1],
  p3: t.match(/PRIORIDADE_3:\s*([^\n]+)/i)?.[1],
});

const scCol = (v: number) => v >= 8 ? C.green : v >= 6 ? C.amber : v >= 4 ? "#FF8C00" : C.red;
const scLbl = (v: number) => v >= 8 ? "Elite" : v >= 6 ? "Bom" : v >= 4 ? "Regular" : "Crítico";

const FASE_CONFIG: Record<string, { label: string; col: string; icon: string; desc: string }> = {
  continuar_bulk:     { label:"Continuar Bulk",    col:C.green, icon:"📈", desc:"Shape evoluindo bem. Manter protocolo atual." },
  reduzir_bulk:       { label:"Reduzir Bulk",      col:C.amber, icon:"⚠️", desc:"BF acumulando. Reduzir surplus e adicionar cardio." },
  iniciar_cutting:    { label:"Iniciar Cutting",   col:C.red,   icon:"🔥", desc:"Hora de virar. Ajustar protocolo e dieta." },
  aprofundar_cutting: { label:"Aprofundar Cutting",col:C.red,   icon:"💧", desc:"Intensificar déficit. Cardio obrigatório." },
  manter:             { label:"Manutenção",        col:C.apex,  icon:"⚖️", desc:"Shape estável. Refinar sem perder massa." },
  peak_week:          { label:"Peak Week",         col:C.gold,  icon:"🏆", desc:"Protocolo de palco ativado." },
};

const URGENCIA_CONFIG: Record<string, { col: string; label: string }> = {
  imediata:           { col:C.red,   label:"Ação imediata" },
  proxima_semana:     { col:C.amber, label:"Esta semana" },
  proximas_2_semanas: { col:C.apex,  label:"Nas próximas 2 semanas" },
  sem_pressa:         { col:C.green, label:"Sem urgência" },
};

const inputStyle: React.CSSProperties = { width:"100%", padding:"10px 12px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit", transition:"border .2s" };
const selectStyle: React.CSSProperties = { ...inputStyle, cursor:"pointer" };

// ─── DROPZONE ────────────────────────────────────────────────────
function DropZone({ angle, file, onFile, onClear }: { angle: string; file: File | null; onFile: (f: File) => void; onClear: () => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);
  const prev = file ? URL.createObjectURL(file) : null;
  return (
    <div>
      <div style={{ fontSize:10, color:C.textSec, marginBottom:6, letterSpacing:".1em", textTransform:"uppercase" }}>{angle}</div>
      <div
        onClick={() => !file && ref.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f?.type.startsWith("image/")) onFile(f); }}
        style={{ height:160, borderRadius:12, position:"relative", overflow:"hidden", border:`1.5px dashed ${drag?C.apex:file?C.green:C.border}`, background:file?"transparent":C.card, cursor:file?"default":"pointer", transition:"all .2s", display:"flex", alignItems:"center", justifyContent:"center" }}>
        {file && prev ? (
          <>
            <img src={prev} alt={angle} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <button onClick={e => { e.stopPropagation(); onClear(); }} style={{ position:"absolute", top:6, right:6, width:24, height:24, borderRadius:"50%", background:"#000000CC", border:"none", cursor:"pointer", color:"#fff", fontSize:12 }}>✕</button>
            <div style={{ position:"absolute", bottom:0, left:0, right:0, padding:"4px 8px", background:"linear-gradient(transparent,#000C)", color:C.green, fontSize:9, fontWeight:600 }}>✓ foto carregada</div>
          </>
        ) : (
          <div style={{ textAlign:"center", color:C.textSec }}>
            <div style={{ fontSize:24, marginBottom:4 }}>◈</div>
            <div style={{ fontSize:10, letterSpacing:".1em" }}>+ FOTO</div>
          </div>
        )}
        <input ref={ref} type="file" accept="image/*" hidden onChange={e => { const f = e.target.files?.[0]; if (f) onFile(f); }} />
      </div>
    </div>
  );
}

// ─── SCORE BAR ───────────────────────────────────────────────────
function ScoreBar({ label, score, diag, hasFarma }: { label: string; score: number; diag: string; hasFarma: boolean }) {
  const col = scCol(score);
  return (
    <div style={{ marginBottom:12 }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:4 }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:C.text, fontWeight:600 }}>{label}</span>
          {hasFarma && score < 6 && <span style={{ fontSize:8, padding:"2px 6px", borderRadius:4, background:C.purpleDim, color:C.purple, fontWeight:700, letterSpacing:".05em" }}>APEX+FARMA</span>}
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:9, color:col, fontWeight:700, textTransform:"uppercase", letterSpacing:".05em" }}>{scLbl(score)}</span>
          <span style={{ fontSize:13, color:col, fontWeight:800 }}>{score}/10</span>
        </div>
      </div>
      <div style={{ height:6, background:C.card, borderRadius:3, overflow:"hidden" }}>
        <div style={{ height:"100%", width:`${score*10}%`, background:col, transition:"width .6s" }} />
      </div>
      {diag && <div style={{ fontSize:11, color:C.textSec, marginTop:4, fontStyle:"italic" }}>{diag}</div>}
    </div>
  );
}

// ─── MANEUVER CARD ───────────────────────────────────────────────
function ManeuverCard({ manobra, urgencia }: { manobra: string; urgencia: string }) {
  const fc = FASE_CONFIG[manobra] || FASE_CONFIG.manter;
  const uc = URGENCIA_CONFIG[urgencia] || URGENCIA_CONFIG.sem_pressa;
  return (
    <div style={{ background:`linear-gradient(135deg,${fc.col}22,${fc.col}05)`, border:`1.5px solid ${fc.col}55`, borderRadius:14, padding:"14px 18px", marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
        <div style={{ fontSize:32 }}>{fc.icon}</div>
        <div style={{ flex:1, minWidth:180 }}>
          <div style={{ fontSize:14, fontWeight:800, color:fc.col, letterSpacing:".05em" }}>{fc.label}</div>
          <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>{fc.desc}</div>
        </div>
        <div style={{ padding:"6px 12px", borderRadius:8, background:uc.col+"22", border:`1px solid ${uc.col}55`, fontSize:10, color:uc.col, fontWeight:700, letterSpacing:".05em", textTransform:"uppercase" }}>⚡ {uc.label}</div>
      </div>
    </div>
  );
}

// ─── TIPOGRAFIA · TOKENS ─────────────────────────────────────────
// Escala única para garantir hierarquia consistente em qualquer seção
const T = {
  // tamanhos
  micro: 10,        // labels, chips, hints fortes
  caption: 11,      // legendas, hints, meta
  small: 12,        // controles, pills
  body: 13.5,       // corpo principal — leitura confortável
  bodyStrong: 14,
  h3: 13,           // títulos de panel
  h2: 16,
  h1: 22,
  // line-heights
  lhTight: 1.4,
  lhBody: 1.7,      // texto longo
  lhRelaxed: 1.85,
  // tracking
  trackTitle: ".08em",
  trackLabel: ".1em",
  // largura máxima (~72ch) p/ legibilidade de prosa longa
  proseMaxWidth: 760,
  // espaçamentos verticais
  spXS: 6, spSM: 10, spMD: 14, spLG: 20, spXL: 28,
};

// ─── PROSE TEXT ──────────────────────────────────────────────────
// Wrapper único para todo conteúdo textual longo das seções
function ProseText({ children, tone = "secondary", emphasis = false }: { children: React.ReactNode; tone?: "primary" | "secondary"; emphasis?: boolean }) {
  const color = tone === "primary" ? C.text : C.textSec;
  return (
    <div style={{
      fontSize: T.body,
      color,
      lineHeight: T.lhBody,
      whiteSpace: "pre-wrap",
      maxWidth: T.proseMaxWidth,
      letterSpacing: ".005em",
      fontWeight: emphasis ? 500 : 400,
      wordBreak: "break-word",
    }}>{children}</div>
  );
}

// ─── HINT ────────────────────────────────────────────────────────
// Banner discreto acima do conteúdo, com acento configurável
function Hint({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div style={{
      fontSize: T.caption,
      color: C.textSec,
      background: accent + "12",
      border: `1px solid ${accent}33`,
      borderRadius: 8,
      padding: "9px 13px",
      marginBottom: T.spMD,
      lineHeight: T.lhTight,
    }}>{children}</div>
  );
}

// ─── PANEL ───────────────────────────────────────────────────────
function Panel({ icon, title, children, accent = C.apex, defaultOpen = true }: { icon: string; title: string; children: React.ReactNode; accent?: string; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background:C.card, border:`1px solid ${C.border}`, borderRadius:12, marginBottom:T.spMD, overflow:"hidden" }}>
      <button onClick={() => setOpen(o => !o)} style={{ width:"100%", background:"none", border:"none", cursor:"pointer", padding:"14px 18px", display:"flex", alignItems:"center", justifyContent:"space-between", fontFamily:"inherit" }}>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ fontSize:T.h2 }}>{icon}</span>
          <span style={{ fontSize:T.h3, color:accent, fontWeight:700, letterSpacing:T.trackTitle, textTransform:"uppercase" }}>{title}</span>
        </div>
        <span style={{ color:accent, transform:open?"rotate(0)":"rotate(-90deg)", transition:"transform .2s" }}>▾</span>
      </button>
      {open && (
        <div style={{ padding:"0 18px 18px" }}>
          <div style={{ height:1, background:C.border, marginBottom:14 }} />
          {children}
        </div>
      )}
    </div>
  );
}

// ─── LOADING ─────────────────────────────────────────────────────
function Loading({ catColor }: { catColor: string }) {
  const steps = ["Carregando protocolo APEX v3...", "Analisando estrutura corporal...", "Lendo composição corporal...", "Detectando desvios posturais...", "Avaliando pontos fracos...", "Analisando protocolo farmacológico...", "Calculando manobras disponíveis...", "Prescrevendo exercícios corretivos...", "Consultando estratégias de elite...", "Gerando veredicto master..."];
  const [step, setStep] = useState(0);
  useEffect(() => { const t = setInterval(() => setStep(s => Math.min(s+1, steps.length-1)), 900); return () => clearInterval(t); }, []);
  return (
    <div style={{ padding:"40px 20px", textAlign:"center" }}>
      <div style={{ width:80, height:80, margin:"0 auto 20px", position:"relative" }}>
        <div style={{ position:"absolute", inset:0, border:`3px solid ${C.border}`, borderTopColor:catColor, borderRadius:"50%", animation:"spin 1s linear infinite" }} />
        <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center", fontSize:28 }}>🔬</div>
      </div>
      <div style={{ fontSize:14, fontWeight:800, color:catColor, letterSpacing:".1em", marginBottom:6 }}>APEX v3 ANALISANDO</div>
      <div style={{ fontSize:11, color:C.textSec, marginBottom:24 }}>Visual + Postura + Farmacologia + Manobras de Elite</div>
      <div style={{ maxWidth:380, margin:"0 auto", textAlign:"left" }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display:"flex", alignItems:"center", gap:8, padding:"4px 0", fontSize:11, color:i<=step?C.text:C.textDim, transition:"color .3s" }}>
            <span style={{ color:i<step?C.green:i===step?catColor:C.textDim }}>{i<step?"✓":i===step?"●":"○"}</span>
            {s}
          </div>
        ))}
      </div>
      <style>{`@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── PILL ────────────────────────────────────────────────────────
function Pill({ icon, label, value, color }: { icon: string; label: string; value: string; color: string }) {
  return (
    <div style={{ display:"flex", alignItems:"center", gap:8, padding:"8px 12px", background:color+"15", border:`1px solid ${color}44`, borderRadius:10 }}>
      <span style={{ fontSize:14 }}>{icon}</span>
      <div>
        <div style={{ fontSize:13, color, fontWeight:700, lineHeight:1 }}>{value}</div>
        <div style={{ fontSize:9, color:C.textSec, marginTop:2, letterSpacing:".05em", textTransform:"uppercase" }}>{label}</div>
      </div>
    </div>
  );
}

// ─── INPUT FIELD ─────────────────────────────────────────────────
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{ fontSize:10, color:C.textSec, marginBottom:5, letterSpacing:".08em", textTransform:"uppercase" }}>{label}</div>
      {children}
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────
export default function ApexVisualV3() {
  const navigate = useNavigate();
  const [catKey, setCatKey] = useState("mens_physique");
  const [fotoF, setFotoF] = useState<File | null>(null);
  const [fotoC, setFotoC] = useState<File | null>(null);
  const [fotoL, setFotoL] = useState<File | null>(null);

  const [nome, setNome] = useState("");
  const [idade, setIdade] = useState("");
  const [peso, setPeso] = useState("");
  const [altura, setAltura] = useState("");
  const [semanas, setSemanas] = useState("8");
  const [fase, setFase] = useState("cutting");
  const [obs, setObs] = useState("");

  const [compostos, setCompostos] = useState("");
  const [objetivoCiclo, setObjetivoCiclo] = useState("cutting");
  const [semanaCiclo, setSemanaCiclo] = useState("");
  const [duracaoCiclo, setDuracaoCiclo] = useState("");
  const [suporte, setSuporte] = useState("");
  const [faseCorpo, setFaseCorpo] = useState("bulk");
  const [pesoAtual, setPesoAtual] = useState("");
  const [pesoPico, setPesoPico] = useState("");

  const [loading, setLoading] = useState(false);
  const [raw, setRaw] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  // ─── Vinculação ao atleta cadastrado + histórico ─────────────────
  const { user } = useAuth();
  const [selectedAthlete, setSelectedAthlete] = useState<AthleteOption | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [savingState, setSavingState] = useState<"idle"|"saving"|"saved"|"error">("idle");

  const loadHistory = async (athleteId: string) => {
    const { data } = await supabase
      .from("athlete_visual_assessments" as any)
      .select("id,data_avaliacao,semana_numero,fase,peso_kg,bf_estimado,score_geral,observacoes_coach")
      .eq("athlete_id", athleteId)
      .order("data_avaliacao", { ascending: false })
      .limit(20);
    setHistory((data as any) || []);
  };

  const [femCtx, setFemCtx] = useState<FeminineContext | null>(null);

  useEffect(() => {
    if (selectedAthlete) {
      setNome(selectedAthlete.nome || "");
      if (selectedAthlete.fase_atual) setFase(selectedAthlete.fase_atual);
      loadHistory(selectedAthlete.id);
      const sexHint = (selectedAthlete as any).sexo ?? (CATS[catKey]?.g === "F" ? "F" : null);
      buildFeminineContext(
        selectedAthlete.patient_user_id,
        sexHint,
        selectedAthlete.categoria ?? CATS[catKey]?.l ?? null,
      ).then(setFemCtx);
    } else {
      setHistory([]);
      setFemCtx(null);
    }
  }, [selectedAthlete?.id, catKey]);

  const cat = CATS[catKey];
  const temFoto = !!(fotoF || fotoC || fotoL);
  const temProtocolo = compostos.trim().length > 0;

  const meta = parseMeta(raw);
  const segs = parseSegs(raw);

  const S = {
    impacto:    secParse(raw, "IMPACTO_VISUAL",          "SCORES_SEGMENTOS"),
    composicao: secParse(raw, "COMPOSICAO_CORPORAL",     "DECISAO_MANOBRA"),
    manobra:    secParse(raw, "DECISAO_MANOBRA",         "POSTURA_DESVIOS"),
    postura:    secParse(raw, "POSTURA_DESVIOS",         "CORRECOES_POSTURAIS"),
    correcoes:  secParse(raw, "CORRECOES_POSTURAIS",     "PONTOS_FRACOS_PROTOCOLO"),
    fracos:     secParse(raw, "PONTOS_FRACOS_PROTOCOLO", "FARMACOLOGIA_INTEGRADA"),
    farma:      secParse(raw, "FARMACOLOGIA_INTEGRADA",  "NUTRICAO_FASE"),
    nutricao:   secParse(raw, "NUTRICAO_FASE",           "GANHA_PONTOS"),
    ganha:      secParse(raw, "GANHA_PONTOS",            "PERDE_PONTOS"),
    perde:      secParse(raw, "PERDE_PONTOS",            "PLANO_ATAQUE"),
    plano:      secParse(raw, "PLANO_ATAQUE",            "POSING_CORRETIVO"),
    posing:     secParse(raw, "POSING_CORRETIVO",        "VEREDICTO"),
    veredicto:  secParse(raw, "VEREDICTO",               null),
  };

  const RESULT_TABS = [
    { id:"overview",     label:"⚡ Overview",     show: segs.length > 0 || !!S.impacto },
    { id:"manobra",      label:"🎯 Manobra",      show: !!meta.manobraPrincipal || !!S.manobra },
    { id:"postura",      label:"🦴 Postura",      show: !!S.postura },
    { id:"correcoes",    label:"🔧 Correções",    show: !!S.correcoes },
    { id:"protocolo",    label:"⚡ Protocolo",    show: !!S.fracos },
    { id:"farmacologia", label:"💉 Farmacologia", show: temProtocolo && !!S.farma },
    { id:"palco",        label:"🎭 Palco",        show: !!S.ganha || !!S.posing },
    { id:"plano",        label:"🗺 Plano",        show: !!meta.p1 || !!S.plano || !!S.veredicto },
    { id:"pose",         label:"🤖 Pose AI",      show: true },
  ].filter(t => t.show || !done);

  const analisar = async () => {
    if (!temFoto) return;
    setLoading(true); setRaw(""); setDone(false); setError(null); setStreaming(false);
    try {
      const fotos: { label: string; mime: string; data: string }[] = [];
      for (const [ang, file] of [["Frente", fotoF], ["Costas", fotoC], ["Lateral", fotoL]] as const) {
        if (!file) continue;
        fotos.push({ label: ang, mime: file.type || "image/jpeg", data: await toB64(file) });
      }

      const athlete: Athlete = { nome, idade, peso, altura, semanas, fase };
      const protocol: Protocol = { compostos, objetivo: objetivoCiclo, semana: semanaCiclo, duracao: duracaoCiclo, suporte, faseCorpo, pesoAtual, pesoPico };

      // Timeout de 90s
      const timeoutPromise = new Promise<never>((_, rej) =>
        setTimeout(() => rej(new Error("Tempo esgotado (90s). O sistema demorou demais para responder — tente novamente.")), 90000)
      );

      const invokePromise = supabase.functions.invoke("apex-visual-analyze", {
        body: {
          fotos,
          contexto: `Fase corporal declarada: ${fase}. Observação do coach: ${obs || "nenhuma"}. Gere análise APEX v3 completa.`,
          system: buildSystem(cat, athlete, protocol),
          sex: femCtx?.isF || cat.g === "F" ? "F" : "M",
          category: femCtx?.feminineCategoryLabel || cat.l,
          cyclePhase: femCtx?.cyclePhase || null,
          cycleDay: femCtx?.cycleDay || null,
        },
      });

      const { data, error: fnErr } = await Promise.race([invokePromise, timeoutPromise]) as any;
      if (fnErr) {
        const msg = (fnErr as any)?.message || "";
        if (msg.includes("429") || msg.toLowerCase().includes("rate")) throw new Error("Limite de requisições atingido. Aguarde alguns instantes e tente novamente.");
        if (msg.includes("402")) throw new Error("Créditos do sistema esgotados. Adicione em Settings → Workspace → Usage.");
        if (msg.toLowerCase().includes("network") || msg.toLowerCase().includes("failed to fetch")) throw new Error("Falha de conexão. Verifique sua internet e tente novamente.");
        throw new Error(msg || "Falha ao chamar a análise APEX.");
      }
      if ((data as any)?.error) throw new Error((data as any).error);
      const text: string = (data as any)?.text || "";

      if (!text || text.trim().length < 100) {
        throw new Error("Resposta vazia ou muito curta do sistema. Tente novamente — se persistir, troque/recoloque as fotos.");
      }
      if (!/##\s*(IMPACTO_VISUAL|SCORES_SEGMENTOS|VEREDICTO)/i.test(text)) {
        throw new Error("O sistema respondeu fora do formato esperado (sem cabeçalhos ##). Clique em tentar novamente.");
      }

      setStreaming(true); setLoading(false);
      let idx = 0;
      const iv = setInterval(() => {
        idx = Math.min(idx + 24, text.length);
        setRaw(text.slice(0, idx));
        if (idx >= text.length) {
          clearInterval(iv); setStreaming(false); setDone(true); setActiveTab("overview");
          // Auto-salva no histórico do atleta selecionado
          saveAssessment(text).catch((e) => console.error("[APEX] save failed:", e));
        }
      }, 16);
    } catch (e: any) {
      setError(e?.message || "Erro desconhecido na análise.");
      setLoading(false);
      setStreaming(false);
    }
  };

  // Mapa das 13+1 seções esperadas → checagem de completude
  const SECTION_CHECK: { key: string; label: string }[] = [
    { key: "impacto",    label: "Impacto visual" },
    { key: "composicao", label: "Composição corporal" },
    { key: "manobra",    label: "Decisão de manobra" },
    { key: "postura",    label: "Postura · desvios" },
    { key: "correcoes",  label: "Correções posturais" },
    { key: "fracos",     label: "Pontos fracos · protocolo" },
    { key: "farma",      label: "Farmacologia integrada" },
    { key: "nutricao",   label: "Nutrição da fase" },
    { key: "ganha",      label: "Ganha pontos" },
    { key: "perde",      label: "Perde pontos" },
    { key: "plano",      label: "Plano de ataque" },
    { key: "posing",     label: "Posing corretivo" },
    { key: "veredicto",  label: "Veredicto master" },
  ];


  const reset = () => { setRaw(""); setDone(false); setError(null); setFotoF(null); setFotoC(null); setFotoL(null); setStreaming(false); setSavedId(null); setSavingState("idle"); };

  // ─── APEX → VERA / STRATUM bridge ───────────────────────────────
  const atletaFeminino = (selectedAthlete as any)?.sexo === "F" || cat.g === "F";

  const extractAchadosFromRaw = (): { key: string; titulo: string; graus: number; inibido?: string; dominante?: string; lado?: "E" | "D" | "bilateral" | null }[] => {
    const text = (raw || "").toLowerCase();
    const detect: { re: RegExp; key: string; titulo: string; inibido: string; dominante: string; lado: "E" | "D" | "bilateral" | null }[] = [
      { re: /escápula\s+alada|escapula\s+alada|winging/i, key: "scapula_alada", titulo: "Escápula alada", inibido: "Serrátil anterior", dominante: "Peitoral menor", lado: null },
      { re: /pelv(e|ic).*(antever|inclina)|hiperlordose|anterior\s+pelvic/i, key: "pelvic_tilt", titulo: "Inclinação pélvica anterior", inibido: "Glúteo máximo + médio", dominante: "Iliopsoas + lombar", lado: null },
      { re: /assimetria.*(ombro|deltoid)|ombro.*assim/i, key: "shoulder_asymmetry", titulo: "Assimetria de ombros", inibido: "Deltóide lateral", dominante: "Trapézio superior", lado: null },
      { re: /escoliose|desvio.*lateral.*coluna|lateral.*spine/i, key: "lateral_spine_deviation", titulo: "Desvio lateral da coluna", inibido: "Oblíquos contralateral", dominante: "Quadrado lombar ipsilateral", lado: null },
      { re: /assimetria.*quadril|quadril.*assim|hip.*asymmetry/i, key: "hip_asymmetry", titulo: "Assimetria de quadril", inibido: "Glúteo médio", dominante: "Adutores", lado: null },
    ];
    const out: any[] = [];
    detect.forEach((d) => {
      if (d.re.test(text)) {
        // extract degrees if present near match
        const m = text.match(new RegExp(d.re.source + "[^\\n]{0,80}?(\\d+(?:\\.\\d+)?)\\s*[°º]", "i"));
        const graus = m ? Math.round(parseFloat(m[1])) : 2;
        out.push({ key: d.key, titulo: d.titulo, graus, inibido: d.inibido, dominante: d.dominante, lado: d.lado });
      }
    });
    // Garantir ao menos um achado para permitir fluxo de demonstração
    if (out.length === 0 && done) {
      out.push({ key: "pelvic_tilt", titulo: "Inclinação pélvica (genérico)", graus: 1, inibido: "Glúteo máximo + médio", dominante: "Iliopsoas + lombar", lado: null });
    }
    return out;
  };

  const iniciarAvaliacaoVERAouSTRATUM = async (destino: "vera" | "stratum") => {
    if (!selectedAthlete) {
      alert("Vincule um atleta cadastrado antes de avaliar pontos fracos.");
      return;
    }
    try {
      const achados = extractAchadosFromRaw();
      const m = parseMeta(raw);
      const pkg = buildApexPackage({
        atleta_id: selectedAthlete.id,
        atleta_nome: selectedAthlete.nome || nome || "Atleta",
        atleta_sexo: atletaFeminino ? "F" : "M",
        sri: (m as any)?.sri ?? null,
        body_score: (m as any)?.bodyScore ?? null,
        fcs: (m as any)?.fcs ?? null,
        qualidade: 0.82,
        achados,
      });
      await supabase.from("apex_vera_bridge" as any).insert({
        atleta_id: selectedAthlete.id,
        coach_user_id: user?.id ?? null,
        package: pkg as any,
        status: "PENDENTE",
      });
      if (destino === "vera") {
        navigate(`/coach/vera?avaliacao=apex&atleta=${selectedAthlete.id}`);
      } else {
        navigate(`/training?avaliacao=apex&atleta=${selectedAthlete.id}`);
      }
    } catch (e: any) {
      console.error("apex bridge error", e);
      alert("Falha ao iniciar avaliação: " + (e?.message || "erro desconhecido"));
    }
  };

  const saveAssessment = async (fullText: string) => {
    if (!user || !selectedAthlete) {
      setSavingState("idle");
      return;
    }
    setSavingState("saving");
    const m = parseMeta(fullText);
    const veredicto = secParse(fullText, "VEREDICTO", null) || "";
    const composicao = secParse(fullText, "COMPOSICAO_CORPORAL", "DECISAO_MANOBRA") || "";
    const ajustes = secParse(fullText, "PLANO_ATAQUE", "POSING_CORRETIVO") || "";
    const meta_proxima = secParse(fullText, "DECISAO_MANOBRA", "POSTURA_DESVIOS") || "";
    const semanaNum = Math.max(1, (history?.[0]?.semana_numero || 0) + 1);

    const payload: any = {
      athlete_id: selectedAthlete.id,
      coach_id: user.id,
      semana_numero: semanaNum,
      semanas_ate_palco: parseInt(semanas) || null,
      fase,
      peso_kg: peso ? parseFloat(peso) : null,
      bf_estimado: m.bfEst ? parseFloat(m.bfEst) : null,
      massa_magra_kg: m.massaMagra ? parseFloat(m.massaMagra) : null,
      analise_ia: { raw: fullText, meta: m, categoria: catKey, protocolo: { compostos, objetivoCiclo, semanaCiclo, duracaoCiclo, faseCorpo, pesoAtual, pesoPico } },
      observacoes_coach: obs || veredicto.slice(0, 1000) || null,
      ajustes_plano: ajustes ? ajustes.slice(0, 2000) : null,
      meta_proxima_semana: meta_proxima ? meta_proxima.slice(0, 1000) : null,
    };

    const { data, error: e } = await supabase
      .from("athlete_visual_assessments" as any)
      .insert(payload)
      .select("id")
      .maybeSingle();

    if (e) {
      console.error("[APEX] insert error:", e);
      setSavingState("error");
      return;
    }
    setSavedId((data as any)?.id || null);
    setSavingState("saved");
    await loadHistory(selectedAthlete.id);
  };


  const exportarPDF = (accessible: boolean = false) => {
    const pdf = new jsPDF({ unit: "mm", format: "a4" });
    const W = 210, H = 297, M = accessible ? 18 : 15;
    const maxW = W - M * 2;
    let y = M;

    // Cores (RGB) — modo acessível usa contraste ≥ WCAG AA (preto puro + acentos escuros)
    const RGB = accessible ? {
      ink:    [0, 0, 0]       as [number, number, number],
      sub:    [40, 40, 40]    as [number, number, number],
      mute:   [70, 70, 70]    as [number, number, number],
      line:   [120, 120, 120] as [number, number, number],
      brand:  [0, 80, 110]    as [number, number, number],
      gold:   [120, 75, 0]    as [number, number, number],
      green:  [0, 95, 40]     as [number, number, number],
      red:    [150, 20, 35]   as [number, number, number],
      purple: [70, 35, 140]   as [number, number, number],
      bgSoft: [240, 240, 240] as [number, number, number],
    } : {
      ink: [22, 26, 38] as [number, number, number],
      sub: [95, 105, 125] as [number, number, number],
      mute: [140, 150, 170] as [number, number, number],
      line: [220, 224, 232] as [number, number, number],
      brand: [0, 130, 160] as [number, number, number],
      gold: [200, 140, 20] as [number, number, number],
      green: [20, 140, 70] as [number, number, number],
      red: [200, 50, 70] as [number, number, number],
      purple: [110, 70, 200] as [number, number, number],
      bgSoft: [245, 247, 252] as [number, number, number],
    };

    // ===== ESCALA TIPOGRÁFICA PDF =====
    // Modo acessível: tamanhos mínimos para leitura em tela e impressão (body ≥ 12pt, caption ≥ 10pt)
    const PT = accessible ? {
      h1: 22, h2: 14, h3: 12, body: 12, small: 11, caption: 10,
      lhBody: 1.6, lhTight: 1.45, lhHeading: 1.25,
      spXS: 2, spSM: 4, spMD: 6, spLG: 10, spXL: 13,
      proseW: Math.min(maxW, 170),
      trackTitle: 0.2,
    } : {
      h1: 18, h2: 11, h3: 10, body: 10, small: 8.5, caption: 7.5,
      lhBody: 1.5, lhTight: 1.35, lhHeading: 1.2,
      spXS: 1.5, spSM: 3, spMD: 5, spLG: 8, spXL: 11,
      proseW: Math.min(maxW, 175),
      trackTitle: 0.25,
    };

    const need = (h: number) => { if (y + h > H - M) { pdf.addPage(); y = M; } };

    const text = (txt: string, opts: { size?: number; bold?: boolean; color?: [number, number, number]; indent?: number; lh?: number; width?: number } = {}) => {
      const { size = PT.body, bold = false, color = RGB.ink, indent = 0, lh = PT.lhBody, width } = opts;
      pdf.setFont("helvetica", bold ? "bold" : "normal");
      pdf.setFontSize(size);
      pdf.setTextColor(...color);
      const w = (width ?? PT.proseW) - indent;
      const lines = pdf.splitTextToSize(txt, w);
      const lineH = size * 0.3528 * lh;
      for (const ln of lines) {
        need(lineH);
        pdf.text(ln, M + indent, y);
        y += lineH;
      }
    };

    const sectionHeader = (num: number, title: string, accent: [number, number, number]) => {
      need(PT.spLG + PT.spMD);
      y += PT.spSM;
      const barH = 9;
      pdf.setFillColor(...accent);
      pdf.rect(M, y, 3, barH, "F");
      pdf.setFillColor(...RGB.bgSoft);
      pdf.rect(M + 3, y, maxW - 3, barH, "F");
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(PT.h2);
      pdf.setTextColor(...accent);
      pdf.text(`${String(num).padStart(2, "0")}`, M + 6, y + 6.2);
      pdf.setTextColor(...RGB.ink);
      pdf.setCharSpace(PT.trackTitle);
      pdf.text(title.toUpperCase(), M + 16, y + 6.2);
      pdf.setCharSpace(0);
      y += barH + PT.spMD;
    };

    const sectionBody = (body: string) => {
      const cleaned = (body || "").trim();
      if (!cleaned) {
        text("— sem conteúdo gerado —", { size: PT.small, color: RGB.mute });
        y += PT.spSM;
        return;
      }
      const paragraphs = cleaned.split(/\n+/).map(p => p.trim()).filter(Boolean);
      for (const p of paragraphs) {
        if (/^[-•*]\s+/.test(p)) {
          const t = p.replace(/^[-•*]\s+/, "");
          need(PT.body * 0.3528 * PT.lhBody);
          pdf.setFillColor(...RGB.brand);
          pdf.circle(M + 2, y - 1.4, 0.8, "F");
          text(t, { size: PT.body, color: RGB.ink, indent: 6 });
        } else if (/^[A-Z_ ]{3,}:/.test(p)) {
          const idx = p.indexOf(":");
          const k = p.slice(0, idx);
          const v = p.slice(idx + 1).trim();
          text(k + ":", { size: PT.h3, bold: true, color: RGB.brand, lh: PT.lhTight });
          if (v) text(v, { size: PT.body, color: RGB.ink, indent: 4 });
        } else {
          text(p, { size: PT.body, color: RGB.ink, lh: PT.lhBody });
        }
        y += PT.spSM;
      }
      y += PT.spMD;
    };

    const hr = () => { need(4); pdf.setDrawColor(...RGB.line); pdf.setLineWidth(0.2); pdf.line(M, y, W - M, y); y += 4; };

    // ===== CAPA =====
    if (accessible) {
      pdf.setFillColor(255, 255, 255);
      pdf.rect(0, 0, W, 50, "F");
      pdf.setDrawColor(0, 0, 0); pdf.setLineWidth(0.5);
      pdf.line(M, 48, W - M, 48);
      pdf.setTextColor(0, 0, 0);
    } else {
      pdf.setFillColor(8, 12, 24);
      pdf.rect(0, 0, W, 50, "F");
      pdf.setTextColor(255, 255, 255);
    }
    pdf.setFont("helvetica", "bold"); pdf.setFontSize(PT.h1);
    pdf.text("APEX VISUAL v3", M, 22);
    pdf.setFont("helvetica", "normal"); pdf.setFontSize(PT.body);
    if (!accessible) pdf.setTextColor(180, 200, 230);
    pdf.text("Análise Visual + Postura + Farmacologia + Manobras de Elite", M, 30);
    pdf.setFontSize(PT.small);
    pdf.text(`Categoria: ${cat.l}  ·  Atleta: ${nome || "—"}  ·  ${idade ? idade + " anos · " : ""}${peso ? peso + "kg · " : ""}${altura ? altura + "cm" : ""}`, M, 38);
    pdf.text(`Semanas para o show: ${semanas || "—"}  ·  Fase: ${fase}  ·  Emitido: ${new Date().toLocaleDateString("pt-BR")}`, M, 44);
    y = 60;

    // ===== SUMÁRIO EXECUTIVO =====
    sectionHeader(0, "SUMÁRIO EXECUTIVO", RGB.brand);

    if (meta.manobraPrincipal) {
      const fc = FASE_CONFIG[(meta.manobraPrincipal || "").toLowerCase().replace(/ /g, "_")] || FASE_CONFIG.manter;
      const uc = URGENCIA_CONFIG[(meta.urgencia || "").toLowerCase().replace(/ /g, "_")] || URGENCIA_CONFIG.sem_pressa;
      need(16);
      pdf.setFillColor(245, 247, 252);
      pdf.rect(M, y, maxW, 14, "F");
      pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...RGB.ink);
      pdf.text("Manobra principal:", M + 3, y + 5.5);
      pdf.setFont("helvetica", "normal");
      pdf.text(fc.label, M + 42, y + 5.5);
      pdf.setFont("helvetica", "bold"); pdf.text("Urgência:", M + 3, y + 11);
      pdf.setFont("helvetica", "normal"); pdf.text(uc.label, M + 42, y + 11);
      y += 18;
    }

    // Pílulas de métricas
    const pills: { label: string; value: string }[] = [];
    if (meta.bfEst) pills.push({ label: "BF atual", value: meta.bfEst + "%" });
    if (meta.bfMeta) pills.push({ label: "BF meta", value: meta.bfMeta + "%" });
    if (meta.massaMagra) pills.push({ label: "Massa magra", value: meta.massaMagra + "kg" });
    if (meta.semMeta) pills.push({ label: "Semanas meta", value: meta.semMeta });
    if (meta.tdeeFator) pills.push({ label: "TDEE fator", value: "×" + meta.tdeeFator });
    if (meta.proteinaIdeal) pills.push({ label: "Proteína", value: meta.proteinaIdeal });
    if (pills.length) {
      need(14);
      let px = M;
      const pw = (maxW - 4 * 2) / 3;
      pills.forEach((p, i) => {
        if (i > 0 && i % 3 === 0) { y += 14; px = M; need(14); }
        pdf.setDrawColor(...RGB.line); pdf.setLineWidth(0.3);
        pdf.roundedRect(px, y, pw, 12, 1.5, 1.5, "S");
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...RGB.mute);
        pdf.text(p.label.toUpperCase(), px + 2.5, y + 4);
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(11); pdf.setTextColor(...RGB.ink);
        pdf.text(p.value, px + 2.5, y + 9.5);
        px += pw + 4;
      });
      y += 16;
    }

    // Scores tabela
    if (segs.length) {
      text("Scores por segmento", { size: PT.h3, bold: true, color: RGB.ink, lh: PT.lhTight });
      y += 1;
      const rowH = 6.5;
      segs.forEach(s => {
        need(rowH + 1);
        const col = s.score >= 8 ? RGB.green : s.score >= 6 ? RGB.gold : RGB.red;
        // label
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9); pdf.setTextColor(...RGB.ink);
        pdf.text(s.label, M, y + 4);
        // bar
        const barX = M + 60, barW = maxW - 60 - 18;
        pdf.setFillColor(235, 238, 244); pdf.rect(barX, y + 1.5, barW, 4, "F");
        pdf.setFillColor(...col); pdf.rect(barX, y + 1.5, (barW * s.score) / 10, 4, "F");
        // score
        pdf.setFont("helvetica", "bold"); pdf.setTextColor(...col);
        pdf.text(`${s.score}/10`, W - M - 14, y + 4);
        y += rowH;
        if (s.diag) {
          pdf.setFont("helvetica", "italic"); pdf.setFontSize(8); pdf.setTextColor(...RGB.sub);
          const lns = pdf.splitTextToSize(s.diag, maxW - 4);
          for (const ln of lns) { need(3.5); pdf.text(ln, M + 2, y + 2.5); y += 3.5; }
          y += 1;
        }
      });
      y += 3;
    }

    // Plano de ataque resumo
    if (meta.p1 || meta.p2 || meta.p3) {
      text("Plano de ataque", { size: PT.h3, bold: true, color: RGB.ink, lh: PT.lhTight });
      y += 1;
      const items: { n: number; v?: string; c: [number, number, number] }[] = [
        { n: 1, v: meta.p1, c: RGB.red },
        { n: 2, v: meta.p2, c: RGB.gold },
        { n: 3, v: meta.p3, c: RGB.green },
      ];
      items.filter(i => i.v).forEach(i => {
        const lns = pdf.splitTextToSize(i.v!, maxW - 14);
        const blockH = lns.length * 4.2 + 4;
        need(blockH);
        pdf.setFillColor(248, 249, 252); pdf.rect(M, y, maxW, blockH, "F");
        pdf.setFillColor(...i.c); pdf.rect(M, y, 2, blockH, "F");
        pdf.setFont("helvetica", "bold"); pdf.setFontSize(10); pdf.setTextColor(...i.c);
        pdf.text(`P${i.n}`, M + 4, y + 6);
        pdf.setFont("helvetica", "normal"); pdf.setFontSize(9.5); pdf.setTextColor(...RGB.ink);
        let yy = y + 6;
        lns.forEach((ln: string) => { pdf.text(ln, M + 12, yy); yy += 4.2; });
        y += blockH + 2;
      });
    }

    hr();

    // ===== 13 SEÇÕES =====
    const sections: { title: string; body: string; color: [number, number, number] }[] = [
      { title: "IMPACTO VISUAL",            body: S.impacto,    color: RGB.brand },
      { title: "SCORES POR SEGMENTO",       body: secParse(raw, "SCORES_SEGMENTOS", "COMPOSICAO_CORPORAL"), color: RGB.brand },
      { title: "COMPOSIÇÃO CORPORAL",       body: S.composicao, color: RGB.gold },
      { title: "DECISÃO DE MANOBRA",        body: S.manobra,    color: RGB.red },
      { title: "POSTURA · DESVIOS",         body: S.postura,    color: RGB.red },
      { title: "CORREÇÕES POSTURAIS",       body: S.correcoes,  color: RGB.brand },
      { title: "PONTOS FRACOS · PROTOCOLO", body: S.fracos,     color: RGB.gold },
      { title: "FARMACOLOGIA INTEGRADA",    body: S.farma,      color: RGB.purple },
      { title: "NUTRIÇÃO DA FASE",          body: S.nutricao,   color: RGB.green },
      { title: "GANHA PONTOS",              body: S.ganha,      color: RGB.green },
      { title: "PERDE PONTOS",              body: S.perde,      color: RGB.red },
      { title: "PLANO DE ATAQUE",           body: S.plano,      color: RGB.brand },
      { title: "POSING CORRETIVO",          body: S.posing,     color: RGB.gold },
      { title: "VEREDICTO MASTER",          body: S.veredicto,  color: RGB.gold },
    ];

    sections.forEach((s, i) => {
      sectionHeader(i + 1, s.title, s.color);
      sectionBody(s.body);
    });

    // ===== RODAPÉ =====
    const total = (pdf as any).internal.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      pdf.setPage(i);
      pdf.setFont("helvetica", "normal"); pdf.setFontSize(7); pdf.setTextColor(...RGB.mute);
      pdf.text(`APEX Visual v3 · ${cat.l} · ${nome || "Atleta"}`, M, H - 6);
      pdf.text(`Página ${i}/${total}`, W - M, H - 6, { align: "right" });
    }

    const safe = (nome || "atleta").replace(/[^a-z0-9]+/gi, "_").toLowerCase();
    pdf.save(`apex-visual-v3${accessible ? "-acessivel" : ""}-${safe}-${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <div style={{ minHeight:"100vh", background:`radial-gradient(ellipse at top,${C.deep},${C.void})`, color:C.text, fontFamily:"'Space Grotesk',-apple-system,sans-serif", padding:"20px 16px" }}>
      {/* HEADER */}
      <div style={{ maxWidth:1100, margin:"0 auto 20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:14 }}>
            <div style={{ fontSize:36 }}>{cat.i}</div>
            <div>
              <div style={{ display:"flex", gap:6, alignItems:"baseline" }}>
                <span style={{ fontSize:22, fontWeight:900, color:C.text, letterSpacing:".05em" }}>APEX</span>
                <span style={{ fontSize:22, fontWeight:300, color:cat.c, letterSpacing:".05em" }}>VISUAL</span>
                <span style={{ fontSize:11, fontWeight:700, color:cat.c, padding:"2px 6px", border:`1px solid ${cat.c}55`, borderRadius:4, letterSpacing:".1em" }}>v3</span>
              </div>
              <div style={{ fontSize:9, color:C.textSec, letterSpacing:".15em", marginTop:2 }}>VISUAL · POSTURA · FARMACOLOGIA · MANOBRAS · {cat.l.toUpperCase()}</div>
            </div>
          </div>
          {(done || streaming) && (
            <div style={{ display:"flex", gap:8 }}>
              {streaming && <div style={{ padding:"6px 12px", borderRadius:8, background:cat.c+"22", border:`1px solid ${cat.c}55`, fontSize:10, color:cat.c, fontWeight:700, letterSpacing:".1em" }}>● ANALISANDO</div>}
              {done && <button onClick={() => exportarPDF(false)} style={{ padding:"6px 14px", borderRadius:8, background:cat.c+"22", border:`1px solid ${cat.c}66`, color:cat.c, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em", fontWeight:700 }}>⬇ EXPORTAR PDF</button>}
              {done && <button onClick={() => exportarPDF(true)} title="Versão com fontes maiores e contraste alto (WCAG AA)" style={{ padding:"6px 14px", borderRadius:8, background:"#ffffff", border:`1px solid #000`, color:"#000", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em", fontWeight:700 }}>♿ PDF ACESSÍVEL</button>}
              {done && atletaFeminino && (
                <button onClick={() => iniciarAvaliacaoVERAouSTRATUM("vera")} style={{ padding:"6px 14px", borderRadius:8, background:"rgba(167,139,250,0.12)", border:"1px solid rgba(167,139,250,0.45)", color:"#A78BFA", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em", fontWeight:700 }}>
                  ✦ AVALIAR COM VERA
                </button>
              )}
              {done && !atletaFeminino && (
                <button onClick={() => iniciarAvaliacaoVERAouSTRATUM("stratum")} style={{ padding:"6px 14px", borderRadius:8, background:"rgba(52,211,153,0.12)", border:"1px solid rgba(52,211,153,0.4)", color:"#34D399", fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em", fontWeight:700 }}>
                  ⬡ AVALIAR COM STRATUM
                </button>
              )}
              {done && <button onClick={reset} style={{ padding:"6px 14px", borderRadius:8, background:C.card, border:`1px solid ${C.border}`, color:C.text, fontSize:11, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>+ NOVA ANÁLISE</button>}
            </div>
          )}
        </div>
      </div>

      <div style={{ maxWidth:1100, margin:"0 auto" }}>
        {/* FORMULÁRIO */}
        {!done && !loading && !streaming && (
          <>
            {/* SELEÇÃO DE ATLETA + HISTÓRICO */}
            <div style={{ marginBottom:20, padding:16, background:C.card, border:`1px solid ${C.border}`, borderRadius:12 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:10, letterSpacing:".1em", textTransform:"uppercase" }}>Atleta vinculado · histórico salvo automaticamente</div>
              <AthleteSelector value={selectedAthlete?.id ?? null} onChange={setSelectedAthlete} label="Selecionar atleta cadastrado" />
              {!selectedAthlete && (
                <div style={{ marginTop:10, fontSize:11, color:C.amber }}>
                  ⚠ Sem atleta selecionado, esta análise <b>não será salva</b> no histórico. Cadastre em <i>Atletas</i> para monitorar evolução.
                </div>
              )}
              {selectedAthlete && history.length > 0 && (
                <div style={{ marginTop:14 }}>
                  <EvolutionCharts history={history} cat={cat} C={C} />
                  <div style={{ fontSize:10, color:C.textSec, marginBottom:8, marginTop:16, letterSpacing:".1em", textTransform:"uppercase" }}>Últimas avaliações ({history.length})</div>
                  <div style={{ display:"flex", flexDirection:"column", gap:6, maxHeight:220, overflowY:"auto" }}>
                    {history.map((h: any) => (
                      <div key={h.id} style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", background:C.cardHi, border:`1px solid ${C.border}`, borderRadius:8, fontSize:11, flexWrap:"wrap" }}>
                        <div style={{ minWidth:90, color:C.textSec }}>{new Date(h.data_avaliacao).toLocaleDateString("pt-BR")}</div>
                        <div style={{ minWidth:40, color:cat.c, fontWeight:700 }}>S{h.semana_numero}</div>
                        <div style={{ minWidth:80, color:C.text }}>{h.fase}</div>
                        <div style={{ minWidth:60, color:C.text }}>{h.peso_kg ? `${h.peso_kg}kg` : "—"}</div>
                        <div style={{ minWidth:70, color:C.text }}>{h.bf_estimado ? `${h.bf_estimado}% BF` : "—"}</div>
                        <div style={{ flex:1, minWidth:120, color:C.textSec, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{h.observacoes_coach || ""}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CATEGORIAS */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Categoria IFBB</div>
              <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                {Object.entries(CATS).map(([k, c]) => (
                  <button key={k} onClick={() => setCatKey(k)} style={{ padding:"8px 14px", borderRadius:10, cursor:"pointer", fontFamily:"inherit", background:catKey===k?c.c+"22":C.card, border:`1.5px solid ${catKey===k?c.c:C.border}`, color:catKey===k?c.c:C.textSec, fontSize:11, fontWeight:catKey===k?700:400, display:"flex", alignItems:"center", gap:6, transition:"all .2s", letterSpacing:".02em" }}>
                    <span>{c.i}</span><span>{c.l}</span><span style={{ opacity:.6 }}>{c.g==="M"?"♂":"♀"}</span>
                  </button>
                ))}
              </div>
              <div style={{ marginTop:10, padding:"10px 14px", background:cat.c+"10", border:`1px solid ${cat.c}33`, borderRadius:10 }}>
                <div style={{ fontSize:9, color:cat.c, fontWeight:700, letterSpacing:".1em", textTransform:"uppercase", marginBottom:4 }}>Ideal da categoria</div>
                <div style={{ fontSize:12, color:C.text, lineHeight:1.5 }}>{cat.ideal}</div>
                <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:8 }}>
                  {cat.pts.map(p => <span key={p} style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:C.card, color:C.textSec, letterSpacing:".05em" }}>{p}</span>)}
                </div>
              </div>
            </div>

            {/* DADOS DO ATLETA */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Dados do atleta</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:10 }}>
                <Field label="Nome"><input style={inputStyle} value={nome} onChange={e=>setNome(e.target.value)} placeholder="Nome do atleta"/></Field>
                <Field label="Idade"><input style={inputStyle} type="number" value={idade} onChange={e=>setIdade(e.target.value)} placeholder="30"/></Field>
                <Field label="Peso (kg)"><input style={inputStyle} type="number" value={peso} onChange={e=>setPeso(e.target.value)} placeholder="90"/></Field>
                <Field label="Altura (cm)"><input style={inputStyle} type="number" value={altura} onChange={e=>setAltura(e.target.value)} placeholder="178"/></Field>
                <Field label="Semanas show"><input style={inputStyle} type="number" value={semanas} onChange={e=>setSemanas(e.target.value)} placeholder="8"/></Field>
                <Field label="Fase atual">
                  <select style={selectStyle} value={fase} onChange={e=>setFase(e.target.value)}>
                    <option value="bulk">Bulk</option>
                    <option value="cutting">Cutting</option>
                    <option value="recomp">Recomposição</option>
                    <option value="manutencao">Manutenção</option>
                    <option value="peak">Peak Week</option>
                  </select>
                </Field>
              </div>
            </div>

            {/* FOTOS */}
            <div style={{ marginBottom:20 }}>
              <div style={{ fontSize:10, color:C.textSec, marginBottom:8, letterSpacing:".1em", textTransform:"uppercase" }}>Fotos — mín. 1 obrigatória · mais ângulos = análise mais precisa</div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:12 }}>
                <DropZone angle="Frente"  file={fotoF} onFile={setFotoF} onClear={() => setFotoF(null)} />
                <DropZone angle="Costas"  file={fotoC} onFile={setFotoC} onClear={() => setFotoC(null)} />
                <DropZone angle="Lateral" file={fotoL} onFile={setFotoL} onClear={() => setFotoL(null)} />
              </div>
            </div>


            {/* PROTOCOLO FARMACOLÓGICO */}
            <div style={{ marginBottom:20, padding:16, background:temProtocolo?C.purpleDim:C.card, border:`1px solid ${temProtocolo?C.purple+"55":C.border}`, borderRadius:12, transition:"all .2s" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                <span style={{ fontSize:20 }}>💉</span>
                <div style={{ flex:1, minWidth:160 }}>
                  <div style={{ fontSize:12, color:temProtocolo?C.purple:C.text, fontWeight:700, letterSpacing:".05em" }}>Protocolo farmacológico</div>
                  <div style={{ fontSize:10, color:C.textSec, marginTop:2 }}>Opcional — quando preenchido ativa a análise Dr. VERTEX integrada</div>
                </div>
                {temProtocolo && <span style={{ fontSize:9, padding:"3px 8px", borderRadius:4, background:C.purple+"33", color:C.purple, fontWeight:700, letterSpacing:".05em" }}>DR. VERTEX ATIVO</span>}
              </div>
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                <Field label="Compostos em uso">
                  <textarea value={compostos} onChange={e=>setCompostos(e.target.value)} rows={2} placeholder="Ex: Testosterona Enantato 300mg/sem, Trembolona Acetato 200mg/sem, Masteron 200mg/sem, HGH 2UI/dia, BPC-157 500mcg/dia..." style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
                </Field>
                {temProtocolo && (
                  <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                    <div style={{ flex:1, minWidth:110 }}>
                      <Field label="Objetivo do ciclo">
                        <select style={selectStyle} value={objetivoCiclo} onChange={e=>setObjetivoCiclo(e.target.value)}>
                          <option value="cutting">Cutting</option>
                          <option value="bulk">Bulk limpo</option>
                          <option value="recomp">Recomposição</option>
                          <option value="peak">Peak Week</option>
                          <option value="manutencao">Manutenção</option>
                        </select>
                      </Field>
                    </div>
                    <div style={{ flex:1, minWidth:80 }}><Field label="Semana do ciclo"><input style={inputStyle} type="number" value={semanaCiclo} onChange={e=>setSemanaCiclo(e.target.value)} placeholder="6"/></Field></div>
                    <div style={{ flex:1, minWidth:80 }}><Field label="Duração total"><input style={inputStyle} type="number" value={duracaoCiclo} onChange={e=>setDuracaoCiclo(e.target.value)} placeholder="16 sem"/></Field></div>
                    <div style={{ flex:1, minWidth:110 }}>
                      <Field label="Fase corporal">
                        <select style={selectStyle} value={faseCorpo} onChange={e=>setFaseCorpo(e.target.value)}>
                          <option value="bulk">Bulk ativo</option>
                          <option value="bulk_fim">Fim do bulk</option>
                          <option value="cutting">Cutting</option>
                          <option value="transicao">Transição</option>
                          <option value="peak">Peak Week</option>
                        </select>
                      </Field>
                    </div>
                    {(faseCorpo === "bulk" || faseCorpo === "bulk_fim") && (
                      <>
                        <div style={{ flex:1, minWidth:80 }}><Field label="Peso atual (kg)"><input style={inputStyle} type="number" value={pesoAtual} onChange={e=>setPesoAtual(e.target.value)} placeholder="98"/></Field></div>
                        <div style={{ flex:1, minWidth:80 }}><Field label="Peso pico bulk"><input style={inputStyle} type="number" value={pesoPico} onChange={e=>setPesoPico(e.target.value)} placeholder="Meta kg"/></Field></div>
                      </>
                    )}
                    <div style={{ flex:2, minWidth:180 }}><Field label="Suporte em uso"><input style={inputStyle} value={suporte} onChange={e=>setSuporte(e.target.value)} placeholder="Ex: Anastrozol 0.5mg EOD, TUDCA 500mg, NAC 600mg 2x, Ômega-3 4g"/></Field></div>
                  </div>
                )}
              </div>
            </div>

            {/* OBSERVAÇÃO */}
            <div style={{ marginBottom:20 }}>
              <Field label="Observação do coach">
                <textarea value={obs} onChange={e=>setObs(e.target.value)} rows={2} placeholder="Ex: atleta passou do ponto no bulk, ombro esquerdo caindo, insônia com tren, sensível à aromatização..." style={{ ...inputStyle, resize:"vertical", lineHeight:1.6 }} />
              </Field>
            </div>

            <button onClick={analisar} disabled={!temFoto} style={{ width:"100%", padding:"18px 24px", background:temFoto?`linear-gradient(135deg,${cat.c},${cat.c}88)`:C.card, border:`1.5px solid ${temFoto?cat.c:C.border}`, borderRadius:14, cursor:temFoto?"pointer":"not-allowed", fontSize:14, fontWeight:700, color:temFoto?"#000":C.textDim, letterSpacing:".06em", transition:"all .25s", boxShadow:temFoto?`0 0 40px ${cat.c}44`:"none", display:"flex", alignItems:"center", justifyContent:"center", gap:10, fontFamily:"inherit", textTransform:"uppercase" }}>
              {temFoto ? <>{cat.i} ANALISAR COM APEX v3 {temProtocolo?"+ DR. VERTEX":""}</> : <>◈ ADICIONE AO MENOS 1 FOTO</>}
            </button>

            {error && (
              <div style={{ marginTop:14, background:C.redDim, border:`1.5px solid ${C.red}55`, borderRadius:12, padding:"16px 18px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8 }}>
                  <span style={{ fontSize:20 }}>⚠️</span>
                  <div style={{ fontSize:12, fontWeight:800, color:C.red, letterSpacing:".08em", textTransform:"uppercase" }}>Falha na análise APEX</div>
                </div>
                <div style={{ fontSize:13, color:C.text, lineHeight:1.6, marginBottom:12 }}>{error}</div>
                <div style={{ display:"flex", gap:8, flexWrap:"wrap" }}>
                  <button onClick={analisar} disabled={!temFoto} style={{ padding:"10px 18px", background:cat.c, border:"none", borderRadius:10, color:"#000", fontSize:12, fontWeight:700, cursor:temFoto?"pointer":"not-allowed", fontFamily:"inherit", letterSpacing:".05em", opacity:temFoto?1:.5 }}>↻ TENTAR NOVAMENTE</button>
                  <button onClick={() => setError(null)} style={{ padding:"10px 18px", background:C.card, border:`1px solid ${C.border}`, borderRadius:10, color:C.text, fontSize:12, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>Fechar</button>
                </div>
                <div style={{ fontSize:10, color:C.textSec, marginTop:10, lineHeight:1.5 }}>
                  Dicas: verifique sua conexão · use fotos nítidas em boa luz · se o erro for de limite, aguarde alguns minutos.
                </div>
              </div>
            )}
          </>
        )}

        {loading && <Loading catColor={cat.c} />}

        {(streaming || done) && (
          <div>
            <div style={{ background:`linear-gradient(135deg,${cat.c}18,${cat.c}05)`, border:`1.5px solid ${cat.c}44`, borderRadius:16, padding:"16px 20px", marginBottom:16, display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
              <div style={{ fontSize:28 }}>{cat.i}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:14, fontWeight:800, color:cat.c, letterSpacing:".05em" }}>APEX v3 · {cat.l.toUpperCase()}</div>
                <div style={{ fontSize:11, color:C.textSec, marginTop:2 }}>
                  {nome||"Atleta"} {idade?`· ${idade} anos`:""} {peso?`· ${peso}kg`:""} · {semanas} semanas para o show
                  {temProtocolo && <span style={{ color:C.purple, fontWeight:700 }}> · Dr. VERTEX ativo</span>}
                </div>
              </div>
            </div>

            {done && selectedAthlete && (
              <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, fontSize:11, fontWeight:600, letterSpacing:".05em",
                background: savingState==="saved"?C.greenDim:savingState==="error"?C.redDim:savingState==="saving"?C.apexDim:C.card,
                border:`1px solid ${savingState==="saved"?C.green+"66":savingState==="error"?C.red+"66":savingState==="saving"?C.apex+"66":C.border}`,
                color: savingState==="saved"?C.green:savingState==="error"?C.red:savingState==="saving"?C.apex:C.textSec }}>
                {savingState==="saving" && "💾 Salvando avaliação no histórico do atleta…"}
                {savingState==="saved" && `✔ Avaliação salva no histórico de ${selectedAthlete.nome} (semana ${(history?.[0]?.semana_numero) || "?"}).`}
                {savingState==="error" && "✖ Falha ao salvar histórico. Tente novamente."}
                {savingState==="idle" && "💾 Aguardando salvamento…"}
              </div>
            )}
            {done && !selectedAthlete && (
              <div style={{ marginBottom:12, padding:"10px 14px", borderRadius:10, fontSize:11, color:C.amber, background:C.amber+"15", border:`1px solid ${C.amber}55` }}>
                ⚠ Esta análise não foi salva no histórico — nenhum atleta cadastrado foi vinculado antes da análise.
              </div>
            )}

            {done && (() => {
              const missing = SECTION_CHECK.filter(sc => {
                if (sc.key === "farma" && !temProtocolo) return false;
                return !((S as any)[sc.key] || "").trim();
              });
              if (missing.length === 0) return null;
              const critico = missing.length >= 6;
              const accent = critico ? C.red : C.amber;
              return (
                <div style={{ background:accent+"15", border:`1.5px solid ${accent}55`, borderRadius:12, padding:"14px 18px", marginBottom:16 }}>
                  <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:18 }}>{critico ? "⚠️" : "ℹ️"}</span>
                    <div style={{ flex:1, minWidth:200 }}>
                      <div style={{ fontSize:12, fontWeight:800, color:accent, letterSpacing:".06em", textTransform:"uppercase" }}>
                        Análise {critico ? "muito incompleta" : "parcialmente incompleta"} — {missing.length} de {SECTION_CHECK.length} seção(ões) faltando
                      </div>
                      <div style={{ fontSize:11, color:C.textSec, marginTop:3 }}>
                        O sistema não retornou os blocos abaixo. Você pode usar o que veio ou refazer a análise.
                      </div>
                    </div>
                    <button onClick={analisar} style={{ padding:"8px 14px", background:accent, border:"none", borderRadius:8, color:"#000", fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"inherit", letterSpacing:".05em" }}>↻ RE-ANALISAR</button>
                  </div>
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginTop:6 }}>
                    {missing.map(m => (
                      <span key={m.key} style={{ fontSize:10, padding:"4px 10px", borderRadius:6, background:C.card, color:accent, border:`1px solid ${accent}44`, fontWeight:600, letterSpacing:".03em" }}>
                        {m.label}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })()}

            {meta.manobraPrincipal && done && (
              <ManeuverCard manobra={(meta.manobraPrincipal||"").toLowerCase().replace(/ /g,"_")} urgencia={(meta.urgencia||"").toLowerCase().replace(/ /g,"_")} />
            )}

            {done && (meta.bfEst || meta.bfMeta || meta.tdeeFator || meta.semMeta) && (
              <div style={{ display:"flex", gap:10, marginBottom:16, flexWrap:"wrap" }}>
                {meta.bfEst      && <Pill icon="📊" label="BF atual"     value={meta.bfEst+"%"}        color={C.amber} />}
                {meta.bfMeta     && <Pill icon="🎯" label="BF meta"      value={meta.bfMeta+"%"}       color={C.green} />}
                {meta.massaMagra && <Pill icon="💪" label="Massa magra"  value={meta.massaMagra+"kg"}  color={cat.c} />}
                {meta.semMeta    && <Pill icon="📅" label="Semanas"      value={meta.semMeta}          color={C.apex} />}
                {meta.tdeeFator  && <Pill icon="⚡" label="TDEE fator"   value={"×"+meta.tdeeFator}    color={C.purple} />}
              </div>
            )}

            {(done || RESULT_TABS.some(t => t.id === "pose")) && (
              <div style={{ display:"flex", gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:16, overflowX:"auto" }}>
                {RESULT_TABS.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{ fontSize:10, padding:"9px 12px", background:"none", border:"none", cursor:"pointer", color:activeTab===t.id?cat.c:C.textSec, borderBottom:`2px solid ${activeTab===t.id?cat.c:"transparent"}`, fontWeight:activeTab===t.id?700:400, whiteSpace:"nowrap", transition:"all .15s", fontFamily:"inherit", letterSpacing:".03em" }}>
                    {t.label}
                  </button>
                ))}
              </div>
            )}

            <div>
              {((!done && activeTab !== "pose") || activeTab === "overview") && (
                <div style={{ display: done && activeTab !== "overview" ? "none" : "block" }}>
                  {segs.length > 0 && (
                    <Panel icon="📊" title="SCORES POR SEGMENTO" accent={cat.c}>
                      {segs.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} diag={s.diag} hasFarma={temProtocolo} />)}
                    </Panel>
                  )}
                  {S.impacto && (
                    <Panel icon="👁" title="IMPACTO VISUAL" accent={C.apex} defaultOpen={false}>
                      <ProseText>{S.impacto}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "manobra" && (
                <div>
                  {S.composicao && (
                    <Panel icon="⚖️" title="COMPOSIÇÃO CORPORAL" accent={C.amber}>
                      <ProseText>{S.composicao.replace(/BF_ESTIMADO:[^\n]*/i,"").replace(/BF_META:[^\n]*/i,"").replace(/MASSA_MAGRA_EST:[^\n]*/i,"").replace(/SEMANAS_META:[^\n]*/i,"").replace(/VEREDICTO_FASE:[^\n]*/i,"").trim()}</ProseText>
                    </Panel>
                  )}
                  {S.manobra && (
                    <Panel icon="🎯" title="DECISÃO DE MANOBRA" accent={C.red}>
                      <Hint accent={C.red}>Manobras disponíveis com ajuste calórico, cardio e protocolo específico.</Hint>
                      <ProseText>{S.manobra.replace(/MANOBRA_PRINCIPAL:[^\n]*/i,"").replace(/URGENCIA:[^\n]*/i,"").trim()}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "postura" && S.postura && (
                <Panel icon="🦴" title="DESVIOS POSTURAIS" accent={C.red}>
                  <Hint accent={C.red}>Cada desvio afeta o visual no palco e indica desequilíbrios musculares corrigíveis.</Hint>
                  <ProseText>{S.postura}</ProseText>
                </Panel>
              )}

              {done && activeTab === "correcoes" && S.correcoes && (
                <Panel icon="🔧" title="CORREÇÕES POSTURAIS" accent={C.apex}>
                  <Hint accent={C.apex}>Execute antes de cada sessão do grupo afetado.</Hint>
                  <ProseText>{S.correcoes}</ProseText>
                </Panel>
              )}

              {done && activeTab === "protocolo" && S.fracos && (
                <Panel icon="⚡" title="PROTOCOLO DE EXERCÍCIOS CORRETIVOS" accent={C.amber}>
                  <Hint accent={C.gold}>Para cada ponto fraco: 3 exercícios (ativação/sobrecarga/pump), frequência e tempo de resposta.</Hint>
                  <ProseText>{S.fracos}</ProseText>
                </Panel>
              )}

              {done && activeTab === "farmacologia" && temProtocolo && (
                <div>
                  {(meta.tdeeFator || meta.proteinaIdeal) && (
                    <div style={{ display:"flex", gap:10, marginBottom:12, flexWrap:"wrap" }}>
                      {meta.tdeeFator    && <Pill icon="⚡" label="TDEE fator" value={"×"+meta.tdeeFator}  color={C.purple} />}
                      {meta.proteinaIdeal && <Pill icon="🥩" label="Proteína"  value={meta.proteinaIdeal} color={C.green} />}
                    </div>
                  )}
                  <Panel icon="💉" title="DR. VERTEX — ANÁLISE FARMACOLÓGICA INTEGRADA" accent={C.purple}>
                    <Hint accent={C.purple}>Composto a composto · sinergias · próximo nível · fitoterápicos · gestão E2 · cardiovascular · recuperação do eixo.</Hint>
                    <ProseText>{S.farma}</ProseText>
                  </Panel>
                  {S.nutricao && (
                    <Panel icon="🥗" title="NUTRIÇÃO INTEGRADA AO PROTOCOLO" accent={C.green} defaultOpen={false}>
                      <ProseText>{S.nutricao}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "palco" && (
                <div>
                  {S.ganha && (
                    <Panel icon="✅" title="GANHA PONTOS" accent={C.green}>
                      <ProseText>{S.ganha}</ProseText>
                    </Panel>
                  )}
                  {S.perde && (
                    <Panel icon="⚠️" title="PERDE PONTOS" accent={C.red}>
                      <ProseText>{S.perde}</ProseText>
                    </Panel>
                  )}
                  {S.posing && (
                    <Panel icon="🎭" title="POSING CORRETIVO" accent={C.gold}>
                      <Hint accent={C.gold}>Cues por pose mandatória — compensar fraquezas + vender pontos fortes.</Hint>
                      <ProseText>{S.posing}</ProseText>
                    </Panel>
                  )}
                </div>
              )}

              {done && activeTab === "plano" && (
                <div>
                  {(meta.p1 || meta.p2 || meta.p3) && (
                    <Panel icon="🗺" title="PLANO DE ATAQUE" accent={cat.c}>
                      {[{ n:1, v:meta.p1, c:C.red },{ n:2, v:meta.p2, c:C.amber },{ n:3, v:meta.p3, c:C.green }].filter(p=>p.v).map(p => (
                        <div key={p.n} style={{ display:"flex", gap:12, padding:"10px 12px", marginBottom:8, background:p.c+"10", border:`1px solid ${p.c}33`, borderRadius:10 }}>
                          <div style={{ fontSize:18, fontWeight:900, color:p.c, minWidth:24 }}>P{p.n}</div>
                          <div style={{ fontSize:12, color:C.text, lineHeight:1.6 }}>{p.v}</div>
                        </div>
                      ))}
                    </Panel>
                  )}
                  {S.plano && (
                    <Panel icon="📋" title="DETALHAMENTO" accent={C.apex} defaultOpen={false}>
                      <ProseText>{S.plano.replace(/PRIORIDADE_[123]:[^\n]*/gi,"").trim()}</ProseText>
                    </Panel>
                  )}
                  {S.veredicto && (
                    <Panel icon="🏆" title="VEREDICTO MASTER" accent={C.gold}>
                      <div style={{ padding:"14px 16px", background:C.goldDim, border:`1px solid ${C.gold}33`, borderRadius:10 }}><ProseText tone="primary" emphasis>{S.veredicto}</ProseText></div>
                    </Panel>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {activeTab === "pose" && (
        <div style={{ position:"fixed", inset:0, zIndex:9999, background:C.void, overflow:"auto", WebkitOverflowScrolling:"touch" }}>
          <button
            onClick={() => setActiveTab("overview")}
            style={{ position:"fixed", top:12, right:12, zIndex:10000, padding:"8px 14px", borderRadius:10, background:C.surface, border:`1px solid ${C.border}`, color:C.text, fontSize:12, fontWeight:700, cursor:"pointer", fontFamily:"inherit" }}
          >
            ✕ Fechar
          </button>
          <APEXPoseAnalysisPage />
        </div>
      )}
    </div>
  );
}
