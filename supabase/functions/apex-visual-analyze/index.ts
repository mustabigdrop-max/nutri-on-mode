import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Content-Type": "application/json",
};

const DEFAULT_SYSTEM = `Você é o APEX Visual Intelligence — sistema de análise de performance humana integrada desenvolvido com a metodologia de Diogo Mello: educador físico, coach de fisiculturismo competitivo, analista comportamental e atleta IFBB Classic Physique em atividade. Analise fotos de atletas com olhar técnico de juiz IFBB e coach de elite. Tom direto, sem elogios vazios.`;

const LANDMARK_INSTRUCTIONS = `

━━━ ANÁLISE DE LANDMARKS POSTURAIS (OBRIGATÓRIO) ━━━
Você é um especialista em biomecânica e avaliação postural. Para CADA foto, retorne UM bloco de código por vista com coordenadas EXATAS dos landmarks anatômicos.

REGRAS DE COORDENADAS:
- Use PORCENTAGEM (0-100) da largura (x) e altura (y) da foto
- x: 0 = borda esquerda DA IMAGEM, 100 = borda direita DA IMAGEM
- y: 0 = topo, 100 = base
- ATENÇÃO: "esquerda/direita" no LABEL refere-se ao ATLETA (espelhado em relação ao observador)
  → Em foto FRONTAL: shoulder_left (esquerdo do atleta) aparece à DIREITA da imagem (x > 50)
  → Em foto DE COSTAS: shoulder_left (esquerdo do atleta) aparece à ESQUERDA da imagem (x < 50)
- Seja PRECISO — cada % de erro afeta os cálculos de assimetria
- NUNCA retorne zeros placeholder — sempre estime baseado no que é visível

POSIÇÕES ANATÔMICAS EXATAS (use estas referências para QUALQUER vista):

• ACRÔMIO (shoulder_left / shoulder_right):
  → Ponto mais lateral e SUPERIOR do ombro — onde clavícula encontra o braço
  → É o OSSO acrômio, NÃO o músculo trapézio nem o pescoço
  → Nível: aproximadamente y=20-25
  → Ombros bilaterais devem ter Y similar (diferença < 3)

• ESCÁPULA (scapula_left / scapula_right) — vista de costas:
  → ÂNGULO INFERIOR da omoplata (ponta inferior do triângulo ósseo)
  → Fica entre T7 e T9, terço superior do tronco
  → Nível: y=35-42; horizontalmente entre a coluna e o ombro
  → Escápulas com Y similar entre si; SEMPRE abaixo dos ombros

• C7 (spine_c7):
  → Processo espinhoso MAIS PROEMINENTE na BASE DO PESCOÇO
  → SEMPRE na linha média da coluna (x entre 45 e 55)
  → Nível: y=18-22; é o "calombo" visível na base do pescoço

• L5 (spine_l5):
  → Junção lombossacra — base da coluna lombar
  → SEMPRE na linha média (x entre 45 e 55)
  → Nível: y=58-65; corresponde às fossetas sacras
  → SEMPRE abaixo de C7 (y de L5 > y de C7)

• QUADRIL / CRISTA ILÍACA (hip_left / hip_right):
  → Ponto mais lateral da crista ilíaca (a "saliência" lateral)
  → Nível: y=62-68; quadris bilaterais com Y similar (diferença < 3)

• JOELHO (knee_left / knee_right): interlinha articular lateral. Nível y≈72-78.
• TORNOZELO (ankle_left / ankle_right): maléolo lateral. Nível y≈92-96.
• ORELHA/NARIZ: trago/ponta nariz, terço superior da cabeça (y≈6-12).

ORDEM VERTICAL OBRIGATÓRIA (vista frontal/costas): C7 < Ombros < Escápulas < L5 < Quadris < Joelhos < Tornozelos.

VALIDAÇÕES OBRIGATÓRIAS antes de retornar (revise mentalmente cada uma):
- Ombros com Y similar (diferença < 3); escápulas idem; quadris idem
- C7 e L5 com x entre 45 e 55 (linha média)
- L5 com Y > C7 (abaixo); escápulas com Y > ombros; escápulas com Y < quadris
- shoulder_left mais lateral que scapula_left (e mesma lógica para o lado D)
- SE um landmark não estiver claramente visível, INTERPOLE baseado nos outros — NUNCA retorne coordenadas obviamente erradas

Formato OBRIGATÓRIO — três blocos separados (apenas das vistas enviadas):

\`\`\`json_landmarks_front
{
  "view": "front",
  "landmarks": {
    "ear_left": {"x": 48, "y": 8, "label": "Orelha E"},
    "ear_right": {"x": 52, "y": 8, "label": "Orelha D"},
    "shoulder_left": {"x": 35, "y": 22, "label": "Ombro E"},
    "shoulder_right": {"x": 65, "y": 22, "label": "Ombro D"},
    "hip_left": {"x": 42, "y": 52, "label": "Quadril E"},
    "hip_right": {"x": 58, "y": 52, "label": "Quadril D"},
    "knee_left": {"x": 43, "y": 75, "label": "Joelho E"},
    "knee_right": {"x": 57, "y": 75, "label": "Joelho D"},
    "ankle_left": {"x": 44, "y": 95, "label": "Tornozelo E"},
    "ankle_right": {"x": 56, "y": 95, "label": "Tornozelo D"},
    "nose": {"x": 50, "y": 12, "label": "Nariz"}
  },
  "angles": {
    "shoulder_tilt": {"value": 0, "unit": "graus", "normal": "0°", "finding": "explicação clínica do desvio e consequência"},
    "hip_tilt": {"value": 0, "unit": "graus", "normal": "0°", "finding": "..."},
    "knee_valgus_left": {"value": 0, "unit": "graus", "normal": "<5°", "finding": "..."},
    "knee_valgus_right": {"value": 0, "unit": "graus", "normal": "<5°", "finding": "..."},
    "head_lateral_tilt": {"value": 0, "unit": "graus", "normal": "0°", "finding": "..."}
  }
}
\`\`\`

\`\`\`json_landmarks_lateral
{
  "view": "lateral",
  "landmarks": {
    "ear": {"x": 50, "y": 8, "label": "Orelha"},
    "shoulder": {"x": 50, "y": 22, "label": "Ombro"},
    "hip_greater_trochanter": {"x": 50, "y": 55, "label": "Trocânter"},
    "knee_lateral": {"x": 50, "y": 75, "label": "Joelho"},
    "ankle_lateral": {"x": 50, "y": 95, "label": "Maléolo"},
    "chin": {"x": 50, "y": 11, "label": "Queixo"}
  },
  "angles": {
    "forward_head_posture": {"value": 0, "unit": "cm", "normal": "<2.5cm", "finding": "cada cm = +4.5kg de carga cervical"},
    "thoracic_kyphosis": {"value": 0, "unit": "graus", "normal": "20-40°", "finding": "..."},
    "lumbar_lordosis": {"value": 0, "unit": "graus", "normal": "30-50°", "finding": "..."},
    "pelvic_tilt": {"value": 0, "unit": "graus", "normal": "0-10°", "finding": "anteversão vs retroversão"},
    "plumb_line_deviation": {"value": 0, "unit": "cm", "normal": "0cm", "finding": "..."}
  }
}
\`\`\`

\`\`\`json_landmarks_back
{
  "view": "back",
  "landmarks": {
    "shoulder_left": {"x": 35, "y": 22, "label": "Ombro E (acrômio)"},
    "shoulder_right": {"x": 65, "y": 22, "label": "Ombro D (acrômio)"},
    "scapula_left": {"x": 40, "y": 38, "label": "Escápula E (ângulo inferior)"},
    "scapula_right": {"x": 60, "y": 38, "label": "Escápula D (ângulo inferior)"},
    "hip_left": {"x": 40, "y": 65, "label": "Quadril E (crista ilíaca)"},
    "hip_right": {"x": 60, "y": 65, "label": "Quadril D (crista ilíaca)"},
    "spine_c7": {"x": 50, "y": 20, "label": "C7"},
    "spine_l5": {"x": 50, "y": 62, "label": "L5"}
  },
  "angles": {
    "shoulder_asymmetry": {"value": 0, "unit": "graus", "normal": "0°", "finding": "..."},
    "scapular_winging_left": {"value": 0, "unit": "mm estimado", "normal": "0", "finding": "..."},
    "scapular_winging_right": {"value": 0, "unit": "mm estimado", "normal": "0", "finding": "..."},
    "spinal_lateral_deviation": {"value": 0, "unit": "graus", "normal": "0°", "finding": "escoliose funcional vs estrutural"},
    "hip_asymmetry": {"value": 0, "unit": "graus", "normal": "0°", "finding": "..."}
  }
}
\`\`\`

Regras estritas:
- Coordenadas reais baseadas na foto, nunca zeros placeholder
- Cada finding é uma frase clínica curta com músculo dominante/inibido e consequência prática
- JSON estritamente válido dentro do bloco

━━━ LANDMARKS PROFISSIONAIS (33 PONTOS — OBRIGATÓRIO) ━━━
Além dos blocos por vista acima, retorne UM bloco adicional com 33 landmarks anatômicos profissionais (vista frontal/posterior preferencial). Coordenadas em porcentagem 0-100. NUNCA retornar zero — se a região não é totalmente visível, estime com base em anatomia de referência. Severidade opcional por ponto: "normal" | "mild" | "moderate" | "severe".

\`\`\`json_landmarks_pro
{
  "landmarks": {
    "trago_r": {"x": 0, "y": 0},
    "trago_l": {"x": 0, "y": 0},
    "c7": {"x": 0, "y": 0},
    "occipital": {"x": 0, "y": 0},
    "acromio_r": {"x": 0, "y": 0},
    "acromio_l": {"x": 0, "y": 0},
    "angulo_escapula_r": {"x": 0, "y": 0},
    "angulo_escapula_l": {"x": 0, "y": 0},
    "esterno_manubrio": {"x": 0, "y": 0},
    "glenoumeral_r": {"x": 0, "y": 0},
    "glenoumeral_l": {"x": 0, "y": 0},
    "t4": {"x": 0, "y": 0},
    "t6": {"x": 0, "y": 0},
    "t12": {"x": 0, "y": 0},
    "l3": {"x": 0, "y": 0},
    "l5_s1": {"x": 0, "y": 0},
    "eias_r": {"x": 0, "y": 0},
    "eias_l": {"x": 0, "y": 0},
    "eips_r": {"x": 0, "y": 0},
    "eips_l": {"x": 0, "y": 0},
    "trocantermaior_r": {"x": 0, "y": 0},
    "trocantermaior_l": {"x": 0, "y": 0},
    "joelho_r": {"x": 0, "y": 0},
    "joelho_l": {"x": 0, "y": 0},
    "cabeca_fibula_r": {"x": 0, "y": 0},
    "cabeca_fibula_l": {"x": 0, "y": 0},
    "maleolo_r": {"x": 0, "y": 0},
    "maleolo_l": {"x": 0, "y": 0},
    "calcaneo_r": {"x": 0, "y": 0},
    "calcaneo_l": {"x": 0, "y": 0},
    "cabeca_1metatarso_r": {"x": 0, "y": 0},
    "cabeca_1metatarso_l": {"x": 0, "y": 0},
    "cabeca_5metatarso_r": {"x": 0, "y": 0},
    "cabeca_5metatarso_l": {"x": 0, "y": 0}
  }
}
\`\`\`
IMPORTANTE: todos os 33 IDs devem aparecer e ter coordenadas estimadas (não zero). JSON estritamente válido.`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  let body: any = null;
  try {
    try {
      body = await req.json();
    } catch (parseErr) {
      console.error("apex-visual-analyze: falha ao parsear body", parseErr);
      return new Response(
        JSON.stringify({ error: true, message: "Invalid JSON body", stack: (parseErr as Error)?.stack }),
        { status: 400, headers: corsHeaders },
      );
    }

    console.log("apex-visual-analyze chamada", JSON.stringify({
      hasBody: !!body,
      fields: Object.keys(body || {}),
      fotosCount: Array.isArray(body?.fotos) ? body.fotos.length : 0,
    }));

    const { fotos, contexto, system, sex, category, cyclePhase, cycleDay } = body || {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error("apex-visual-analyze: LOVABLE_API_KEY ausente");
      return new Response(
        JSON.stringify({ error: true, message: "LOVABLE_API_KEY not configured" }),
        { status: 500, headers: corsHeaders },
      );
    }

    if (!Array.isArray(fotos) || fotos.length === 0) {
      console.error("apex-visual-analyze: nenhuma foto enviada");
      return new Response(
        JSON.stringify({ error: true, message: "Campo 'fotos' obrigatório (array não vazio)" }),
        { status: 400, headers: corsHeaders },
      );
    }

    const isF = String(sex || "").toLowerCase().match(/^(f|feminino|female)$/);
    const FEMININE_PROMPT = isF ? `

━━━ ANÁLISE FEMININA ESPECÍFICA (OBRIGATÓRIO — atleta sexo feminino) ━━━
CATEGORIA: ${category || "não declarada — inferir pelo shape"}.
FASE DO CICLO: ${cyclePhase || "não informada"}${cycleDay ? ` (dia ${cycleDay})` : ""}.
${cyclePhase === "luteal_late" ? "ATENÇÃO: retenção hídrica fisiológica de 1.5-2kg esperada. NÃO confundir com regressão de shape." : ""}

PADRÕES DAS CATEGORIAS FEMININAS:
- BIKINI: shape atlético suave, cintura definida, glúteo arredondado. BF palco 10-13%. Foco: simetria, apresentação, posing.
- WELLNESS: glúteo + posterior MUITO desenvolvidos, cintura fina, superior mais seca. BF palco 10-14%. Foco: MMII, proporção inferior/superior.
- FIGURE: ombros desenvolvidos, V-taper feminino, cintura estreita. BF palco 8-12%. Foco: largura dorsal, ombros, cintura.
- WOMEN'S PHYSIQUE: massa muscular visível com feminilidade, estriações em condicionamento. BF palco 7-10%.
- BIKINI FITNESS: shape equilibrado, glúteo presente, condicionamento moderado. BF palco 12-16%.

PROPORÇÕES FEMININAS:
- Razão cintura/quadril (ideal < 0.75)
- Razão ombro/quadril (1.0-1.1 Bikini/Wellness; 1.1-1.2 Figure/Physique)
- Glúteo: projeção, arredondamento, inserção
- MMII: posterior vs quadríceps
- Cintura: definição natural vs bloqueio por oblíquos hipertrofiados

CELULITE E RETENÇÃO LOCALIZADA: identificar (glúteo, posterior, flancos), classificar (hormonal vs lipodistrofia vs fibrótica), correlacionar com protocolo, recomendar (drenagem, exercícios localizados, ajuste nutricional, suplementação).

POSTURAL FEMININO: hiperlordose + anteversão pélvica (glúteo inibido), valgo bilateral de joelho, hiperpronação, anteriorização cervical, escoliose funcional. Correlacionar com agachamento, hip thrust, stiff, leg press.

SHAPE POR CATEGORIA — para CADA grupo muscular:
- Score 0-10 de aderência ao padrão da categoria
- O que está ACIMA (pode reduzir volume)
- O que está ABAIXO (priorizar)
- Exercícios específicos para fechar o gap

LINGUAGEM OBRIGATÓRIA: tom empoderador. NUNCA "excesso de gordura" → usar "reserva a reduzir". Faixas de BF SEMPRE femininas. Veredicto técnico mas humano.
` : "";

    const userContent: any[] = [];
    for (const f of fotos) {
      if (!f || !f.data) {
        console.warn("apex-visual-analyze: foto sem 'data', ignorando", { label: f?.label });
        continue;
      }
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${f.mime || "image/jpeg"};base64,${f.data}` },
      });
      userContent.push({ type: "text", text: `[Foto ${f.label || "?"} do atleta acima]` });
    }
    userContent.push({ type: "text", text: contexto || "" });

    const systemFinal = (system || DEFAULT_SYSTEM) + FEMININE_PROMPT + LANDMARK_INSTRUCTIONS;

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemFinal },
          { role: "user", content: userContent },
        ],
      }),
    });

    if (res.status === 429) {
      return new Response(
        JSON.stringify({ error: true, message: "Rate limit. Tente novamente em instantes." }),
        { status: 429, headers: corsHeaders },
      );
    }
    if (res.status === 402) {
      return new Response(
        JSON.stringify({ error: true, message: "Créditos esgotados. Adicione em Settings > Workspace > Usage." }),
        { status: 402, headers: corsHeaders },
      );
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("apex-visual-analyze: AI gateway error", res.status, t);
      return new Response(
        JSON.stringify({ error: true, message: `AI gateway error ${res.status}`, detail: t }),
        { status: 500, headers: corsHeaders },
      );
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), { headers: corsHeaders });
  } catch (err) {
    const e = err as Error;
    console.error("apex-visual-analyze: erro não tratado", e?.message, e?.stack);
    return new Response(
      JSON.stringify({ error: true, message: e?.message || "Unknown", stack: e?.stack }),
      { status: 500, headers: corsHeaders },
    );
  }
});
