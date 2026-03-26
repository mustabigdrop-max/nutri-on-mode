import { supabase } from "@/integrations/supabase/client";

export async function analisarMicrobioma(
  sintomas: string[],
  score: number,
  perfil: {
    sexo?: string;
    idade?: number;
    peso?: number;
    objetivo?: string;
    atividade?: string;
    metaFibras?: number;
  },
  onDelta: (text: string) => void,
  onComplete: () => void,
  onError: (error: string) => void
) {
  try {
    const { data: { session } } = await supabase.auth.getSession();

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/microbioma-agent`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({ sintomas, score, perfil }),
      }
    );

    if (!response.ok) {
      const err = await response.json().catch(() => ({ error: "Erro desconhecido" }));
      throw new Error(err.error || `Erro ${response.status}`);
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error("Stream não disponível");

    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;
        const jsonStr = line.slice(6).trim();
        if (jsonStr === "[DONE]") { onComplete(); return; }
        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) onDelta(content);
        } catch {
          // partial JSON, ignore
        }
      }
    }

    onComplete();
  } catch (error) {
    onError(error instanceof Error ? error.message : "Erro desconhecido");
  }
}

export async function salvarDiagnosticoMicrobioma(data: {
  sintomas: string[];
  score: number;
  classificacao: string;
  metaFibrasG?: number;
  analiseIA: string;
  perfilSnapshot?: object;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("microbioma_logs" as any).insert({
    user_id: user.id,
    sintomas: data.sintomas,
    score: data.score,
    classificacao: data.classificacao,
    meta_fibras_g: data.metaFibrasG,
    analise_ia: data.analiseIA,
    perfil_snapshot: data.perfilSnapshot,
  });

  if (error) console.error("Erro ao salvar diagnóstico:", error);
}
