// Busca mídia remota (vídeo de post do Instagram) no servidor e devolve os bytes
// com CORS liberado, para o navegador conseguir usar o vídeo no Overlay Studio
// sem bloqueio de origem e sem contaminar o canvas.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ALLOWED_HOSTS = [
  "cdninstagram.com",
  "fbcdn.net",
  "instagram.com",
  "scontent.cdninstagram.com",
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const url = new URL(req.url).searchParams.get("url");
    if (!url) {
      return new Response(JSON.stringify({ error: "Parâmetro url ausente" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const target = new URL(url);
    if (target.protocol !== "https:" || !ALLOWED_HOSTS.some((h) => target.hostname.endsWith(h))) {
      return new Response(JSON.stringify({ error: "Origem de mídia não permitida" }), {
        status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const upstream = await fetch(target.toString());
    if (!upstream.ok || !upstream.body) {
      return new Response(JSON.stringify({ error: `Falha ao buscar mídia (${upstream.status})` }), {
        status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(upstream.body, {
      headers: {
        ...corsHeaders,
        "Content-Type": upstream.headers.get("content-type") || "video/mp4",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : "Erro inesperado" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
