import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const DEFAULT_SYSTEM = `Você é o APEX Visual Coach do nutriON. Analise fotos de atletas com olhar técnico de juiz IFBB e coach de elite (Hany Rambod, Neil Hill). Tom direto, sem elogios vazios.`;

const LANDMARK_INSTRUCTIONS = `

━━━ ANÁLISE DE LANDMARKS POSTURAIS (OBRIGATÓRIO) ━━━
Ao final da resposta, para CADA foto recebida, retorne UM bloco de código com as coordenadas anatômicas e ângulos clínicos. Use porcentagem (0-100) da largura (x) e altura (y) da foto. NUNCA retorne zeros — sempre estime baseado no que é visível. Se uma vista não foi enviada, NÃO inclua o bloco dela.

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
    "ear": {"x": 0, "y": 0, "label": "Orelha"},
    "shoulder": {"x": 0, "y": 0, "label": "Ombro"},
    "hip_greater_trochanter": {"x": 0, "y": 0, "label": "Trocânter"},
    "knee_lateral": {"x": 0, "y": 0, "label": "Joelho"},
    "ankle_lateral": {"x": 0, "y": 0, "label": "Maléolo"},
    "chin": {"x": 0, "y": 0, "label": "Queixo"}
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
    "shoulder_left": {"x": 0, "y": 0, "label": "Ombro E"},
    "shoulder_right": {"x": 0, "y": 0, "label": "Ombro D"},
    "scapula_left": {"x": 0, "y": 0, "label": "Escápula E"},
    "scapula_right": {"x": 0, "y": 0, "label": "Escápula D"},
    "hip_left": {"x": 0, "y": 0, "label": "Quadril E"},
    "hip_right": {"x": 0, "y": 0, "label": "Quadril D"},
    "spine_c7": {"x": 0, "y": 0, "label": "C7"},
    "spine_l5": {"x": 0, "y": 0, "label": "L5"}
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
- JSON estritamente válido dentro do bloco`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const body = await req.json();
    const { fotos, contexto, system } = body;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const userContent: any[] = [];
    for (const f of (fotos || [])) {
      userContent.push({
        type: "image_url",
        image_url: { url: `data:${f.mime || "image/jpeg"};base64,${f.data}` },
      });
      userContent.push({ type: "text", text: `[Foto ${f.label} do atleta acima]` });
    }
    userContent.push({ type: "text", text: contexto || "" });

    const systemFinal = (system || DEFAULT_SYSTEM) + LANDMARK_INSTRUCTIONS;

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
      return new Response(JSON.stringify({ error: "Rate limit. Tente novamente em instantes." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (res.status === 402) {
      return new Response(JSON.stringify({ error: "Créditos esgotados. Adicione em Settings > Workspace > Usage." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!res.ok) {
      const t = await res.text();
      console.error("AI gateway error:", res.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await res.json();
    const text = data.choices?.[0]?.message?.content || "";
    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("apex-visual-analyze error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
