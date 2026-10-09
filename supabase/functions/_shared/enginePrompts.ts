// Loads the caller's engine instructions (engine_prompts) and builds each pass's system prompt:
// bloco_0 (placeholders filled with real data) + pass instruction + atlas + retorica.
// Missing or empty rows fall back to the defaults so generation never blocks.
import { ENGINE_PROMPT_DEFAULTS, withAddendum, type EnginePromptKey } from "./engineDefaults.ts";
import { parseProibidas } from "./reelVerifier.ts";

const NONE = "nenhum cadastrado";

// Field contract the code reads; appended after the user's editable text so edits cannot break parsing.
const CONTRATO: Record<"arquiteto" | "redator" | "critico" | "calibracao" | "angulo" | "revisor", string> = {
  angulo: "",
  revisor: `\n\nCONTRATO DO SISTEMA: "id" de blocos_alterados é o id do bloco recebido. Altere só ids de blocos_para_revisar. Se não houver bloco novo ou ajuste de tempo, devolva listas vazias.`,
  arquiteto: `\n\nCONTRATO DO SISTEMA: além dos campos acima, cada item de "blocos" leva "id" (1, 2, 3...) e "loops_abertos" é uma lista de textos.`,
  redator: `\n\nCONTRATO DO SISTEMA: cada item de "blocos" leva "id" igual ao bloco do plano (1, 2, 3...), "tempo", "funcao", "fala", "texto_tela" (mesmo conteúdo de texto_na_tela), "estimulo_visual" e "gatilho". Inclua também "legenda" (mesmo conteúdo de legenda_post). Em modo "reescrita_parcial", devolva só os blocos pedidos, com o mesmo "id".`,
  critico: `\n\nCONTRATO DO SISTEMA: cada item de "notas_por_bloco" leva "id" do bloco, "nota", "causa_da_queda" e "correcao". Inclua "frases_fracas":[{"bloco":id,"frase":"texto exato","correcao":"instrução"}]. A entrada traz "verificador" com tetos de nota calculados em código: respeite-os.`,
  calibracao: "",
};

export type EnginePrompts = { arquiteto: string; redator: string; critico: string; calibracao: string; angulo: string; revisor: string; proibidas: string[]; fatores: string[]; pesos: string; exemplos: number; editadas: string[] };

export function fillPlaceholders(text: string, data: Record<string, string>) {
  return text.replace(/\{\{(perfil|vencedores|fracos|fontes_verificadas|exemplos_ouro)\}\}/g, (_, k) => data[k]?.trim() || NONE);
}

const list = (rows: any[]) => rows.length ? rows.map(p => `- ${p.tipo ? `[${p.tipo}] ` : ""}${p.texto}${p.amostras ? ` (${p.amostras} vídeos)` : ""}`).join("\n") : "";

export async function loadEnginePrompts(db: any, userId: string, opts: { tema?: string; scriptId?: string; pilar?: number | null } = {}): Promise<EnginePrompts> {
  const [{ data: rows }, { data: voice }, { data: patterns }] = await Promise.all([
    db.from("engine_prompts").select("chave, conteudo").eq("user_id", userId),
    db.from("creator_voice").select("nicho, expressoes_usa, expressoes_evita").eq("user_id", userId).maybeSingle(),
    db.from("retention_patterns").select("tipo, texto, amostras, confirmado").eq("user_id", userId).order("amostras", { ascending: false }).limit(40),
  ]);
  // Verified sources: from the reel itself, or from the caller's reels with a matching theme.
  let fontes: any[] = [];
  if (opts.scriptId) {
    const { data } = await db.from("script_sources").select("rotulo_card, referencia, link, tipo").eq("user_id", userId).eq("script_id", opts.scriptId).order("ordem").limit(15);
    fontes = data ?? [];
  } else if (opts.tema) {
    const words = opts.tema.toLowerCase().split(/\s+/).filter(w => w.length > 4).slice(0, 3);
    if (words.length) {
      const { data: scripts } = await db.from("retention_scripts").select("id").eq("user_id", userId).or(words.map(w => `tema.ilike.%${w.replace(/[%,()]/g, "")}%`).join(",")).limit(10);
      const ids = (scripts ?? []).map((s: any) => s.id);
      if (ids.length) { const { data } = await db.from("script_sources").select("rotulo_card, referencia, link, tipo").eq("user_id", userId).in("script_id", ids).limit(15); fontes = data ?? []; }
    }
  }
  const get = (k: EnginePromptKey) => {
    const v = (rows ?? []).find((r: any) => r.chave === k)?.conteudo;
    return withAddendum(k, typeof v === "string" && v.trim() ? v : ENGINE_PROMPT_DEFAULTS[k]);
  };
  // Gold examples: same pillar first, else the 2 most recent; imitate specificity and rhythm only.
  const { data: ouro } = await db.from("retention_scripts").select("tema, pilar, roteiro, created_at").eq("user_id", userId).eq("exemplo_ouro", true).order("created_at", { ascending: false }).limit(20);
  const ouroSel = [...(ouro ?? [])].sort((a: any, b: any) => Number(b.pilar === opts.pilar) - Number(a.pilar === opts.pilar)).slice(0, 2);
  const exemplos = ouroSel.map((e: any, i: number) => `Exemplo ${i + 1} (${e.tema}):\n${(e.roteiro?.blocos ?? []).map((b: any) => `${b.tempo ?? ""} ${b.fala ?? ""}`.trim()).join("\n")}`).join("\n\n");
  const perfil = voice ? [voice.nicho && `Nicho: ${Array.isArray(voice.nicho) ? voice.nicho.join(", ") : voice.nicho}`,
    voice.expressoes_usa?.length && `Expressões que usa: ${[].concat(voice.expressoes_usa).join(", ")}`,
    voice.expressoes_evita?.length && `Expressões que evita: ${[].concat(voice.expressoes_evita).join(", ")}`].filter(Boolean).join("\n") : "";
  const base = fillPlaceholders(get("bloco_0"), {
    perfil,
    vencedores: list((patterns ?? []).filter((p: any) => p.confirmado)),
    fracos: list((patterns ?? []).filter((p: any) => /fraco|queda|evitar/i.test(String(p.tipo)))),
    exemplos_ouro: exemplos,
    fontes_verificadas: fontes.map(f => `- ${f.rotulo_card ?? ""} ${f.referencia ?? ""} ${f.link ?? ""} (${f.tipo})`.trim()).join("\n"),
  });
  const tail = `${get("atlas")}\n\n${get("retorica")}`;
  const build = (k: keyof typeof CONTRATO) => fillPlaceholders(`${base}\n\n${get(k)}${CONTRATO[k]}\n\n${tail}`, { exemplos_ouro: exemplos || "Sem reels de referência cadastrados" });
  return { arquiteto: build("arquiteto"), redator: build("redator"), critico: build("critico"), calibracao: build("calibracao"), angulo: build("angulo"), revisor: build("revisor"), proibidas: parseProibidas(get("proibidas")),
    fatores: parseProibidas(get("fatores_centrais")).map(f => f.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")), pesos: get("pesos_score"), exemplos: ouroSel.length,
    editadas: (rows ?? []).map((r: any) => r.chave) };
}
