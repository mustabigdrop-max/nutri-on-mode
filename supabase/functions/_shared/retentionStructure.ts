export const RETENTION_RULES = {
  minDuration: 25,
  maxDuration: 45,
  openLoops: 3,
  minDevelopmentBlock: 5,
  maxDevelopmentBlock: 7,
  triggers: ["quebra_de_crenca", "curiosidade", "identidade", "medo_de_perder", "prova", "polemica"],
} as const;

/** A feasible timing scaffold, not generated creative content or scientific data. */
export function retentionTiming(duration: number) {
  const total = Math.round(Math.min(RETENTION_RULES.maxDuration,
    Math.max(RETENTION_RULES.minDuration, Number.isFinite(duration) ? duration : 35)));
  // Reserve 5 seconds for payoff and 3 for a single CTA.
  const middle = total - 14;
  const count = Math.ceil(middle / RETENTION_RULES.maxDevelopmentBlock);
  const base = Math.floor(middle / count);
  let cursor = 6;
  const blocks = [{ tempo: "0-2s", funcao: "parada" }, { tempo: "2-6s", funcao: "promessa" }];
  for (let index = 0; index < count; index++) {
    const end = cursor + base + (index < middle % count ? 1 : 0);
    blocks.push({ tempo: `${cursor}-${end}s`, funcao: "desenvolvimento" });
    cursor = end;
  }
  blocks.push({ tempo: `${cursor}-${total - 3}s`, funcao: "payoff" });
  blocks.push({ tempo: `${total - 3}-${total}s`, funcao: "cta" });
  return { duracao_total_seg: total, blocos: blocks };
}

export function retentionPlanningPrompt(duration?: number): string {
  const scaffold = retentionTiming(duration ?? 35);
  return `PLANEJAMENTO OBRIGATÓRIO ANTES DE TODO ROTEIRO DE VÍDEO VERTICAL:
Não aplique a legendas isoladas, carrosséis, pesquisas, DMs ou vídeos longos. Em pacotes mistos, aplique a cada roteiro vertical.
Primeiro trabalhe como estrategista de retenção: projete a ESTRUTURA, não escreva a fala nessa etapa.
Entrada: tema efetivo do pedido, objetivo, tom e perfil do criador acima. Nunca invente calibração ausente.
1. Descubra a tensão: crença errada, medo, desejo ou erro comum. O vídeo inteiro nasce dessa tensão.
2. Escolha UM gatilho principal: ${RETENTION_RULES.triggers.join(" | ")}. Use os padrões vencedores reais como desempate.
3. Promessa em uma frase: o que o espectador ganha ficando até o fim. Em saúde, ganho de compreensão, nunca promessa de cura ou resultado específico.
4. Crie exatamente ${RETENTION_RULES.openLoops} loops abertos. Cada pergunta ou promessa precisa ser fechada no payoff ou mais adiante. Identifique loop 1, 2 e 3 nos blocos. Não deixe promessa sem resposta.
5. 0-2s PARADA quebra o scroll. 2-6s PROMESSA comunica o ganho e abre loop 1. Desenvolvimento em blocos de ${RETENTION_RULES.minDevelopmentBlock} a ${RETENTION_RULES.maxDevelopmentBlock}s, cada um com reinício de atenção: virada, pergunta, número confirmado, prova real ou mudança de plano. PAYOFF entrega exatamente a promessa. CTA pede uma única ação.
6. Duração total entre ${RETENTION_RULES.minDuration} e ${RETENTION_RULES.maxDuration}s; tempos contínuos, sem buracos ou sobreposição. Todo bloco tem objetivo emocional: curiosidade, tensão, alívio ou identificação.
7. Final em loop: conecte o final ao começo sem reabrir uma promessa não resolvida.
Exemplo de distribuição viável (adapte o conteúdo, mantenha os limites): ${JSON.stringify(scaffold)}
Estrutura JSON da etapa:
{"tensao":"","gatilho_principal":"","promessa":"","loops_abertos":["","",""],"blocos":[{"id":1,"tempo":"0-2s","funcao":"parada","objetivo_emocional":"","reinicio_de_atencao":"","loop_que_abre_ou_fecha":""}],"duracao_total_seg":35,"final_em_loop":"como a última frase conecta com a primeira"}
Depois dessa etapa, escreva o roteiro seguindo a estrutura, fechando os três loops e respeitando 14 palavras por frase e 2,5-3 palavras faladas por segundo. Essa etapa precede a escrita dentro da mesma geração; não substitui o roteiro solicitado.
Inclua a estrutura no campo adicional planejamento_retencao do JSON final (array de estruturas se houver vários roteiros). Preserve todos os campos e tipos do resultado já pedido, sem colocar objetos nos campos de texto. No Command Center, planejamento_retencao fica ao lado de content, nunca dentro da string content.
Os limites de 25-45s prevalecem sobre exemplos conflitantes de duração para roteiros verticais. Não siga exemplos de 15s ou 60s. Ruim: apresenta tema, explica três pontos em sequência, encerra genérico. Bom: crença errada, promessa de três erros, entrega 1 e 2, segura 3 com loop, payoff e final ligado ao começo.`;
}