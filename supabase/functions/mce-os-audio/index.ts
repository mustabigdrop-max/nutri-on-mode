import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import { parseRitualScript } from "../_shared/ritualScripts.ts";
import { OS_AUDIO_SCRIPTS, OS_AUDIO_VOICE, type OsAudioKey } from "../_shared/osScripts.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const BUCKET = "mce-audio";
const TTS_MODEL = "openai/gpt-4o-mini-tts";
const TTS_VOICE = "onyx";
const SAMPLE_RATE = 24000;

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

function chunkText(text: string, maxChars = 3200): string[] {
  const sentences = text.match(/[^.!?\n]+[.!?\n]*\s*/g) ?? [text];
  const chunks: string[] = [];
  let cur = "";
  for (const s of sentences) {
    if (s.length > maxChars) {
      if (cur.trim()) { chunks.push(cur.trim()); cur = ""; }
      for (let i = 0; i < s.length; i += maxChars) chunks.push(s.slice(i, i + maxChars));
      continue;
    }
    if (cur.length + s.length > maxChars) { chunks.push(cur.trim()); cur = ""; }
    cur += s;
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks.filter(Boolean);
}

function wavHeader(dataBytes: number): Uint8Array {
  const h = new Uint8Array(44);
  const dv = new DataView(h.buffer);
  const w = (off: number, s: string) => { for (let i = 0; i < s.length; i++) h[off + i] = s.charCodeAt(i); };
  w(0, "RIFF"); dv.setUint32(4, 36 + dataBytes, true); w(8, "WAVE");
  w(12, "fmt "); dv.setUint32(16, 16, true); dv.setUint16(20, 1, true); dv.setUint16(22, 1, true);
  dv.setUint32(24, SAMPLE_RATE, true); dv.setUint32(28, SAMPLE_RATE * 2, true);
  dv.setUint16(32, 2, true); dv.setUint16(34, 16, true);
  w(36, "data"); dv.setUint32(40, dataBytes, true);
  return h;
}

function concat(parts: Uint8Array[]): Uint8Array {
  const total = parts.reduce((a, p) => a + p.length, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.length; }
  return out;
}

async function ttsPcm(input: string, instructions: string, speed: number): Promise<Uint8Array> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: TTS_MODEL,
      input,
      voice: TTS_VOICE,
      instructions,
      response_format: "pcm",
      speed,
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    const err = new Error(`TTS ${res.status}: ${detail}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  return new Uint8Array(await res.arrayBuffer());
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const authHeader = req.headers.get("authorization");
    if (!authHeader) return json({ error: "Não autenticado" }, 401);
    const { data: { user }, error: authError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (authError || !user) return json({ error: "Não autenticado" }, 401);

    const body = await req.json().catch(() => ({}));
    const key = String(body?.block || "") as OsAudioKey;
    if (!OS_AUDIO_SCRIPTS[key]) return json({ error: "Bloco inválido" }, 400);

    const path = `os24h/${key}.wav`;

    // Já existe em cache no storage? devolve direto.
    const { data: existing } = await admin.storage
      .from(BUCKET)
      .list("os24h", { search: `${key}.wav` });
    if (existing?.some((f) => f.name === `${key}.wav`)) {
      const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 120);
      if (signed?.signedUrl) return json({ ok: true, url: signed.signedUrl, path, cached: true });
    }

    // Gera narração com silêncios reais.
    const voice = OS_AUDIO_VOICE[key];
    const segments = parseRitualScript(OS_AUDIO_SCRIPTS[key]);
    const pcmParts: Uint8Array[] = [];
    try {
      for (const seg of segments) {
        if ("silence" in seg) {
          pcmParts.push(new Uint8Array(Math.round(seg.silence * SAMPLE_RATE) * 2));
          continue;
        }
        for (const chunk of chunkText(seg.text)) {
          pcmParts.push(await ttsPcm(chunk, voice.instructions, voice.speed));
        }
      }
    } catch (e) {
      const status = (e as { status?: number }).status;
      if (status === 429) return json({ error: "Muitas requisições. Tente em instantes." }, 429);
      if (status === 402) return json({ error: "Créditos de IA insuficientes." }, 402);
      return json({ error: "Falha na narração", detail: String(e) }, 500);
    }

    const pcm = concat(pcmParts);
    const wav = concat([wavHeader(pcm.length), pcm]);
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, wav, { contentType: "audio/wav", upsert: true });
    if (upErr) return json({ error: "Falha ao salvar áudio", detail: upErr.message }, 500);

    const { data: signed } = await admin.storage.from(BUCKET).createSignedUrl(path, 60 * 120);
    return json({
      ok: true,
      url: signed?.signedUrl ?? null,
      path,
      cached: false,
      duration_seconds: Math.round(pcm.length / 2 / SAMPLE_RATE),
    });
  } catch (e) {
    return json({ error: "Erro inesperado", detail: String(e) }, 500);
  }
});
