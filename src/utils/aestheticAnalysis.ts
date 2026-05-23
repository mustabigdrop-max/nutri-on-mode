// APEX Aesthetic Analysis — client wrapper sobre a edge function apex-npc-judge
import { supabase } from "@/integrations/supabase/client";
import { NPC_STANDARDS, type NPCCategory } from "@/utils/npcStandards";

export interface AestheticAnalysis {
  score_geral: number;
  score_simetria: number;
  score_proporcao: number;
  score_condicionamento: number;
  grupos: {
    nome: string;
    score: number;
    lado_dominante: "E" | "D" | "SIMETRICO";
    assimetria_pct: number;
    descricao: string;
    pontos_fortes: string[];
    pontos_fracos: string[];
    comparacao_npc: string;
  }[];
  proporcoes: {
    nome: string;
    valor: number;
    ideal: string;
    status: "EXCELENTE" | "BOM" | "REGULAR" | "FRACO";
    diferenca: string;
  }[];
  penalizacoes: {
    descricao: string;
    impacto: string;
    urgencia: "IMEDIATA" | "PROXIMA_PREP" | "LONGO_PRAZO";
  }[];
  categoria_atual: NPCCategory;
  categoria_ideal: NPCCategory;
  motivo_categoria: string;
  mensagem_juiz: string;
  top_3_prioridades: string[];
}

export interface AchadoClinicoLite {
  titulo: string;
  graus: number;
}

export interface AtletaContext {
  nome?: string | null;
  bf?: string | null;
  sexo?: string | null;
}

/** Baixa uma imagem e converte para base64 puro (sem prefixo data:). */
export async function urlToBase64(url: string): Promise<string> {
  const r = await fetch(url, { mode: "cors" });
  const blob = await r.blob();
  return await new Promise<string>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => {
      const s = String(fr.result);
      resolve(s.includes(",") ? s.split(",")[1] : s);
    };
    fr.onerror = reject;
    fr.readAsDataURL(blob);
  });
}

export async function runAestheticAnalysis(params: {
  imageBase64: string;
  categoria: NPCCategory;
  vista: "FRENTE" | "COSTAS" | "LATERAL";
  achados: AchadoClinicoLite[];
  atleta: AtletaContext;
}): Promise<AestheticAnalysis> {
  const standard = NPC_STANDARDS[params.categoria];
  const { data, error } = await supabase.functions.invoke("apex-npc-judge", {
    body: {
      imageBase64: params.imageBase64,
      categoria: params.categoria,
      categoriaNome: standard.nome,
      categoriaDescricao: standard.descricao,
      vista: params.vista,
      proporcoes: standard.proporcoes.map((p) => ({
        grupo: p.grupo,
        peso_visual: p.peso_visual,
        descricao_ideal: p.descricao_ideal,
      })),
      ratios: standard.ratios.map((r) => ({ nome: r.nome, ideal: r.ideal })),
      penalizacoes: standard.penalizacoes.map((p) => ({
        condicao: p.condicao,
        impacto: p.impacto,
      })),
      achados: params.achados,
      atleta: params.atleta,
    },
  });
  if (error) throw error;
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as AestheticAnalysis;
}
