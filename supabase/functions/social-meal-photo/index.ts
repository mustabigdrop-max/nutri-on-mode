import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

/**
 * Gera uma FOTO NOVA do prato a partir do que o usuário selecionou no
 * Social ON → Postar Refeição (alimentos reais da refeição + estilo do post).
 * A foto gerada volta em base64 e o front grava a legenda por cima.
 *
 * Regras duras:
 * - Nada é inventado: o prompt usa SÓ os alimentos/porções que vieram no body.
 * - Texto NUNCA é renderizado pela IA (a legenda entra depois, via canvas).
 */

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, "Content-Type": "application/json" } });

type Alimento = { nome: string; porcao?: string };

type Body = {
  nome?: string;
  tag?: string;
  horario?: string;
  alimentos?: Alimento[];
  estiloId?: string;
  estiloBrief?: string;
  janelaTreino?: { posicao: "pre" | "pos"; minutos: number } | null;
  formato?: "feed" | "story";
};

const ESTILO_VISUAL: Record<string, string> = {
  direto: "minimalist dark editorial food photography, clean composition, single plate centered",
  ciencia: "clinical precise food photography, ingredients neatly separated, laboratory-like precision on dark slate",
  mce: "bold dramatic food photography, hard directional light, strong shadows, intense mood",
  educativo: "bright overhead flat-lay food photography, ingredients visible and organized, instructional cookbook style",
  ponto_fraco: "energetic sports nutrition photography, pre/post workout meal, gym-adjacent dark aesthetic",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  const auth = req.headers.get("Authorization") || "";
  if (!auth.startsWith("Bearer ")) return json({ error: true, message: "Não autenticado" }, 401);

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: auth } } },
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) return json({ error: true, message: "Não autenticado" }, 401);

  let body: Body;
  try {
    body = await req.json();
  } catch {
    return json({ error: true, message: "Body inválido" }, 400);
  }

  const alimentos = (body.alimentos || []).map((a) => a?.nome).filter(Boolean).slice(0, 12) as string[];
  if (!alimentos.length && !body.nome) {
    return json({ error: true, message: "Selecione uma refeição com alimentos reais para gerar a foto." }, 400);
  }

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: true, message: "Geração de imagem não configurada." }, 500);

  const proporcao = body.formato === "story" ? "vertical 9:16" : "vertical 4:5";
  const visual = ESTILO_VISUAL[body.estiloId || ""] || ESTILO_VISUAL.direto;

  const lista = alimentos.length
    ? `The plate contains exactly these foods: ${alimentos.join(", ")}. Do not add any other food.`
    : `The meal is: ${body.nome}.`;

  const prompt = [
    `Professional appetizing photo of a real meal, ${proporcao} aspect.`,
    lista,
    `Style: ${visual}.`,
    "Dark moody background (near-black), warm golden accent lighting, shallow depth of field, shot on a dark ceramic plate on a dark stone table.",
    "Photorealistic, high detail, editorial quality.",
    "IMPORTANT: no text, no words, no letters, no logos, no watermarks, no people, no hands.",
  ].join(" ");

  try {
    const res = await fetch("https://ai.gateway.lovable.dev/v1/images/generations", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-pro-image",
        messages: [{ role: "user", content: prompt }],
        modalities: ["image", "text"],
      }),
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => "");
      return json({ error: true, message: `Falha ao gerar a foto (${res.status}). ${txt.slice(0, 200)}` }, 502);
    }

    const data = await res.json();
    const b64 = data?.data?.[0]?.b64_json as string | undefined;
    if (!b64) return json({ error: true, message: "A geração não devolveu imagem. Tente de novo." }, 502);

    return json({ result: { foto: `data:image/png;base64,${b64}` } });
  } catch (e) {
    return json({ error: true, message: e instanceof Error ? e.message : "Erro ao gerar a foto." }, 500);
  }
});
