import { createClient } from "npm:@supabase/supabase-js@2.45.0";
import {
  RITUAL_KEY_BY_EPISODE,
  RITUAL_SCRIPTS,
  RITUAL_VOICE,
  MICRO_KEY_BY_EPISODE,
  MICRO_BY_KEY,
  MICRO_VOICE,
  parseRitualScript,
} from "../_shared/ritualScripts.ts";


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const ADMIN_UID = "70e51469-1acf-4df6-afe6-f094d21db122";
const BUCKET = "mce-audio";

// Mesma identidade sonora do Briefing do dia
const TTS_MODEL = "openai/gpt-4o-mini-tts";
const TTS_VOICE = "onyx";
const TTS_INSTRUCTIONS =
  "Fale em português do Brasil, voz masculina grave, ritmo pausado e firme, como um mentor confiante.";

const SERIES_TONE: Record<string, string> = {
  mindset: "identidade, crenças e a mente que sustenta o shape",
  comportamento: "gatilhos, ambiente e desenho de hábitos",
  execucao: "disciplina prática, rotina e consistência de execução",
  ciencia: "explicação científica aplicada, didática e precisa",
  ritual: "condução guiada, respiração e presença (ritual de despertar ou pré-sono)",
  carreira: "aplicação do MCE ao trabalho: energia, foco, produtividade e performance profissional",
  relacionamentos: "vínculos, ambiente social, comunicação e limites que protegem o processo",
  parentalidade: "ser exemplo em casa: rotina familiar, alimentação dos filhos e legado de hábitos",
  financas: "disciplina financeira com a mesma lógica comportamental do MCE, custo x prioridade",
};

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

const SAMPLE_RATE = 24000; // pcm 24kHz 16-bit mono do gateway

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
    throw new Error(`TTS ${res.status}: ${detail}`);
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

    if (user.id !== ADMIN_UID) {
      const { data: coach } = await admin
        .from("coach_profiles").select("id").eq("user_id", user.id).maybeSingle();
      if (!coach) return json({ error: "Somente o coach pode gerar áudios." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const episodeId = String(body?.episodeId || "");
    const maxMinutes = Math.min(20, Math.max(3, Number(body?.maxMinutes) || 10));
    if (!episodeId) return json({ error: "episodeId obrigatório" }, 400);

    const { data: ep, error: epErr } = await admin
      .from("mce_audio_episodes")
      .select("id, series, episode_number, title, description, duration_seconds, scientific_reference, audio_url")
      .eq("id", episodeId)
      .maybeSingle();
    if (epErr || !ep) return json({ error: "Episódio não encontrado" }, 404);

    // ===== RITUAIS + MICRO-ÁUDIOS: roteiro fixo oficial + silêncios reais (WAV 24kHz) =====
    const ritualKey = ep.series === "ritual" && ep.episode_number
      ? RITUAL_KEY_BY_EPISODE[ep.episode_number]
      : undefined;
    const microKey = ep.series === "ritual" && ep.episode_number
      ? MICRO_KEY_BY_EPISODE[ep.episode_number]
      : undefined;
    const fixedScript = ritualKey
      ? RITUAL_SCRIPTS[ritualKey]
      : microKey
        ? MICRO_BY_KEY[microKey]
        : undefined;

    if (fixedScript) {
      const scriptText = fixedScript;
      const voice = ritualKey ? RITUAL_VOICE[ritualKey] : MICRO_VOICE;
      const segments = parseRitualScript(scriptText);
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
        return json({ error: "Falha na narração do ritual", detail: String(e) }, 500);
      }

      const pcm = concat(pcmParts);
      const wav = concat([wavHeader(pcm.length), pcm]);
      const ritualPath = `ritual/${ritualKey || microKey}-${Date.now()}.wav`;
      const { error: rUpErr } = await admin.storage
        .from(BUCKET)
        .upload(ritualPath, wav, { contentType: "audio/wav", upsert: true });
      if (rUpErr) return json({ error: "Falha ao salvar áudio", detail: rUpErr.message }, 500);

      const ritualDuration = Math.max(10, Math.round(pcm.length / 2 / SAMPLE_RATE));
      await admin
        .from("mce_audio_episodes")
        .update({ audio_url: ritualPath, duration_seconds: ritualDuration })
        .eq("id", ep.id);

      if (ep.audio_url && !/^https?:/.test(ep.audio_url)) {
        await admin.storage.from(BUCKET).remove([ep.audio_url]).catch(() => {});
      }

      return json({
        ok: true,
        path: ritualPath,
        duration_seconds: ritualDuration,
        words: (scriptText.match(/\S+/g) || []).length,
        ritual: ritualKey || microKey,
      });
    }



    // 1) Roteiro
    const targetMin = Math.min(maxMinutes, Math.max(3, Math.round((ep.duration_seconds || 600) / 60)));
    const targetWords = targetMin * 150;

    const prompt = `Você é o Coach Diogo Mello gravando um episódio da MCE Audio Academy.
Escreva o roteiro FALADO desse episódio.

EPISÓDIO
- Série: ${ep.series} (${SERIES_TONE[ep.series] || "desenvolvimento comportamental"})
- Número: ${ep.episode_number ?? "-"}
- Título: ${ep.title}
- Premissa: ${ep.description || "—"}
- Referência científica: ${ep.scientific_reference || "—"}

IDENTIDADE
- A voz é sua, de pessoa. NUNCA se apresente como sistema, plataforma, assistente ou IA. Nunca diga "eu sou o PRAXIS", "eu sou o NUTRIS" nem qualquer nome de sistema.
- Por ser episódio de série (conteúdo longo, tipo podcast), abra exatamente com: "Fala, aqui é o Diogo Mello. Episódio ${ep.episode_number ?? ""}${ep.episode_number ? "." : ""} ${ep.title}." e siga direto no conteúdo.

REGRAS
- Português do Brasil, texto corrido, para ser lido em voz alta.
- Aproximadamente ${targetWords} palavras (${targetMin} minutos de fala).
- Tom firme, acolhedor, de mentor. Nunca mencione inteligência artificial, IA, modelos ou que é gerado.
- Sem títulos, sem marcadores, sem emojis, sem "capítulo 1". Apenas fala natural em parágrafos.
- Desenvolva o conceito com um exemplo concreto do dia a dia de quem treina e come, cite a evidência de forma natural quando houver, e feche com uma micro-ação prática para hoje.
- Encerre com: "Bora. O sistema está com você."`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!aiRes.ok) {
      const detail = await aiRes.text().catch(() => "");
      const status = aiRes.status === 429 || aiRes.status === 402 ? aiRes.status : 500;
      return json({ error: "Falha ao gerar roteiro", detail }, status);
    }
    const script = String((await aiRes.json())?.choices?.[0]?.message?.content || "").trim();
    if (!script) return json({ error: "Roteiro vazio" }, 502);

    // 2) Narração (mesma voz do briefing), em blocos concatenados
    const chunks = chunkText(script);
    const parts: Uint8Array[] = [];
    for (const chunk of chunks) {
      const ttsRes = await fetch("https://ai.gateway.lovable.dev/v1/audio/speech", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: TTS_MODEL,
          input: chunk,
          voice: TTS_VOICE,
          instructions: TTS_INSTRUCTIONS,
          response_format: "mp3",
          speed: 0.95,
        }),
      });
      if (!ttsRes.ok) {
        const detail = await ttsRes.text().catch(() => "");
        const status = ttsRes.status === 429 || ttsRes.status === 402 ? ttsRes.status : 500;
        return json({ error: "Falha na narração", detail }, status);
      }
      parts.push(new Uint8Array(await ttsRes.arrayBuffer()));
    }

    const total = parts.reduce((a, p) => a + p.length, 0);
    const audio = new Uint8Array(total);
    let offset = 0;
    for (const p of parts) { audio.set(p, offset); offset += p.length; }

    // 3) Publicação
    const path = `${ep.series}/ep-${ep.episode_number ?? "x"}-${Date.now()}.mp3`;
    const { error: upErr } = await admin.storage
      .from(BUCKET)
      .upload(path, audio, { contentType: "audio/mpeg", upsert: true });
    if (upErr) return json({ error: "Falha ao salvar áudio", detail: upErr.message }, 500);

    const words = (script.match(/\S+/g) || []).length;
    const duration = Math.max(60, Math.round((words / 150) * 60 / 0.95));

    await admin
      .from("mce_audio_episodes")
      .update({ audio_url: path, duration_seconds: duration })
      .eq("id", ep.id);

    if (ep.audio_url && !/^https?:/.test(ep.audio_url)) {
      await admin.storage.from(BUCKET).remove([ep.audio_url]).catch(() => {});
    }

    return json({ ok: true, path, duration_seconds: duration, words });
  } catch (err) {
    return json({ error: String(err) }, 500);
  }
});
