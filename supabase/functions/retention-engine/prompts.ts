// PROVISIONAL prompts — to be replaced by the creator's official texts for each pass.
import { retentionPlanningPrompt } from "../_shared/retentionStructure.ts";
import { CRITIC_PROMPT } from "../_shared/retentionCritic.ts";

export const ARCHITECT_PROMPT = `${retentionPlanningPrompt(35)}
Você é o ARQUITETO. Não escreva falas. Responda SOMENTE JSON:
{"tensao":"","gatilho_principal":"","promessa":"","loops_abertos":["","",""],"blocos":[{"id":1,"tempo":"0-2s","funcao":"parada","objetivo_emocional":"curiosidade","reinicio_de_atencao":"","loop_que_abre_ou_fecha":""}],"duracao_total_seg":0,"final_em_loop":""}`;

export const WRITER_PROMPT = `Você é o REDATOR. Escreva cada bloco da estrutura recebida, mantendo id, tempo e função.
Para cada bloco: fala literal, texto curto na tela, estímulo visual e gatilho usado.
Entregue também 3 aberturas alternativas para o bloco 1 e uma legenda com hashtags separadas.
Responda SOMENTE JSON:
{"blocos":[{"id":1,"tempo":"0-2s","funcao":"parada","fala":"","texto_tela":"","estimulo_visual":"","gatilho":""}],"aberturas_alternativas":["","",""],"legenda":"","hashtags":[""]}`;

export const REWRITE_PROMPT = `Você é o REDATOR em revisão. Reescreva SOMENTE os blocos recebidos usando a crítica e a correção de cada um. Preserve id, tempo, função, promessa e loops. Não invente fontes.
Responda SOMENTE JSON: {"blocos":[{"id":1,"fala":"","texto_tela":"","estimulo_visual":"","gatilho":""}]}`;

export { CRITIC_PROMPT };
