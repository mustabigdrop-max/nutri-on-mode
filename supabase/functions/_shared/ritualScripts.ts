// Roteiros oficiais dos 4 Rituais MCE.
// Marcações suportadas na narração:
//   [Xs silêncio] -> silêncio real de X segundos inserido no áudio final
//   qualquer outra marcação entre colchetes (Soundscape / Tom / Frequência) é
//   apenas direção de produção e é removida antes do TTS.

export type RitualKey = "despertar" | "pre_treino" | "pos_treino" | "pre_sono";

export const RITUAL_KEY_BY_EPISODE: Record<number, RitualKey> = {
  1: "despertar",
  2: "pre_treino",
  3: "pos_treino",
  4: "pre_sono",
};

export const RITUAL_VOICE: Record<RitualKey, { instructions: string; speed: number }> = {
  despertar: {
    instructions:
      "Português do Brasil. Voz masculina grave, íntima, começando lenta e sussurrada e ganhando energia e comando ao longo do áudio. Como um mentor falando ao pé do ouvido logo ao acordar.",
    speed: 0.95,
  },
  pre_treino: {
    instructions:
      "Português do Brasil. Voz masculina grave, controlada e tensa, como antes de uma batalha. Ritmo firme, crescendo para comando seco no final.",
    speed: 1.0,
  },
  pos_treino: {
    instructions:
      "Português do Brasil. Voz masculina grave, calma e reconhecedora, orgulhosa e acolhedora, como alguém que te viu lutar.",
    speed: 0.95,
  },
  pre_sono: {
    instructions:
      "Português do Brasil. Voz masculina muito baixa, lenta e pausada, quase sussurro, desacelerando progressivamente até o silêncio.",
    speed: 0.85,
  },
};

export const RITUAL_SCRIPTS: Record<RitualKey, string> = {
  despertar: `Abre os olhos.
[3s silêncio]
Esse segundo — esse exato segundo — é o mais importante do seu dia. E eu vou te provar por quê.
Agora mesmo, enquanto você está deitado, o seu córtex pré-frontal está desligando o modo de sono e ligando o modo de decisão. Isso leva entre trinta e noventa segundos. E nesses noventa segundos, algo acontece que a maioria das pessoas nunca vai saber: o primeiro pensamento consciente que você tem ao acordar define o filtro pelo qual você enxerga as próximas dezesseis horas.
A neurociência chama de priming atencional. O que você pensa primeiro, você procura depois. Se for reclamação, você vai achar motivo pra reclamar o dia inteiro. Se for intenção, você vai enxergar oportunidade o dia inteiro.
[2s silêncio]
Então antes de olhar o celular. Antes de checar mensagem. Antes de qualquer coisa.
Respira fundo comigo. Inspira pelo nariz. Quatro segundos.
[4s silêncio]
Segura.
[4s silêncio]
Solta pela boca. Devagar. Seis segundos. Todo o ar.
[6s silêncio]
De novo. Mais profundo. Inspira.
[4s silêncio]
Segura.
[4s silêncio]
Solta. Todo o ar.
[6s silêncio]
Agora responde mentalmente. Sem pressa. Sem preguiça. Com intenção.
Quem eu decido ser hoje?
[5s silêncio]
Não o que você vai fazer. Quem você vai ser. Porque o que você faz é consequência de quem você acredita que é. James Clear escreveu: cada ação é um voto na identidade que você está construindo. Não é sobre perfeição. É sobre direção.
Hoje você tem refeições no plano. Cada uma é um voto. Você tem água pra beber. Cada gole é um voto. Você pode ter treino. Cada série é um voto.
A maioria das pessoas acorda e reage ao dia. Você vai acordar e decidir o dia. Essa é a diferença entre quem sonha e quem constrói.
[2s silêncio]
Coloca os pés no chão.
Sente o peso do corpo na sola do pé. Sente o frio do chão. Isso é real. Você está aqui. Acordado. Vivo. Com um plano. Com um método. Com um propósito que vai além da estética.
Tem gente que acordou hoje sem plano. Sem direção. Sem sistema. Você não. Você tem o MCE. Mindset definido. Comportamento projetado. Execução programada.
Levanta. O dia é seu. E o sistema está com você.
Bora.`,

  pre_treino: `[2s silêncio]
Para.
Antes de tocar no primeiro peso. Antes da primeira série. Antes de qualquer coisa.
Eu preciso que você entenda onde você está.
Isso aqui não é uma academia. É um laboratório. E o experimento é você.
[2s silêncio]
Cada série que você faz agora vai enviar um sinal elétrico do seu córtex motor até a fibra muscular. Esse sinal viaja a cento e vinte metros por segundo através do nervo. E cada vez que esse sinal é disparado, uma camada microscópica de mielina é depositada ao redor do axônio. Mielina é isolamento. E mais isolamento significa sinal mais rápido, mais forte, mais preciso.
Tradução: cada repetição que você faz hoje te torna neurologicamente melhor do que você era ontem. Não é metáfora. É neuroanatomia.
Mas isso só funciona com uma condição.
Intenção.
Um estudo da Universidade de Ohio mostrou que atletas que pensam no músculo durante a contração — conexão mente-músculo — ativam vinte e dois por cento mais fibras do que quem faz o movimento no automático. Vinte e dois por cento. Mesmo peso. Mesmo exercício. Diferença: presença mental.
Então eu vou te pedir uma coisa: cada repetição que você fizer agora, fecha a cadeia. Olho no músculo. Pensamento no músculo. Contração no músculo. Sem celular entre séries. Sem conversa. Sem distração.
[3s silêncio]
Agora eu quero que você visualize. Fecha os olhos. Três segundos.
Visualiza a primeira série. O peso subindo. A contração no pico. O controle na descida. A execução perfeita. Vê isso na sua cabeça.
[3s silêncio]
Abre os olhos.
Agora executa exatamente o que você viu. Neurônios espelho: o cérebro que imagina com clareza executa com precisão. Isso não é crença. É neurociência de Rizzolatti. Visualizou, ativou. Agora entrega.
O treino começa. Foco absoluto. Cada série conta. Cada repetição é um voto.
Vai.`,

  pos_treino: `[2s silêncio]
Acabou.
[3s silêncio]
Presta atenção no que você está sentindo agora. Esse calor no corpo. Essa respiração pesada. Esse peso nos músculos. Esse orgulho silencioso que ninguém vê mas você sabe que tá ali.
Sabe o que isso é?
Não é só endorfina. Não é só dopamina. Não é só serotonina.
É evidência.
[2s silêncio]
Albert Bandura, Stanford, mil novecentos e setenta e sete, passou trinta anos fazendo uma pergunta: o que faz uma pessoa acreditar que é capaz? A resposta dele mudou a psicologia. Ele chamou de autoeficácia. E descobriu que a forma mais poderosa de construir autoeficácia não é elogio. Não é terapia. Não é livro.
É experiência de domínio.
Fazer algo difícil. Completar. E olhar pra trás sabendo que fez.
É exatamente o que aconteceu aqui. Agora.
Você chegou. Provavelmente cansado. Provavelmente com mil coisas na cabeça. E mesmo assim fez. Levantou o peso. Completou as séries. Executou o que estava prescrito.
Ninguém pode tirar isso de você. Esse treino não volta mais. Ele já é parte de quem você está se tornando.
[3s silêncio]
Agora, o seu corpo entra na fase mais importante: recuperação. Nos próximos trinta minutos, a janela anabólica está aberta. Os transportadores GLUT-4 estão ativados nos seus músculos — eles estão sugando glicose do sangue pra dentro da célula com eficiência máxima. É o melhor momento do dia pra carboidrato.
Sua próxima refeição não é opcional. É farmacologia natural. É o combustível que transforma o estímulo que você acabou de dar em músculo real.
Come. No horário. Na quantidade. Sem culpa. Esse carboidrato é merecido. Esse carboidrato é prescrito. Esse carboidrato é construção.
Você provou mais uma vez. Bora pro próximo passo. O sistema registrou. O MCE atualizou. E você está mais forte do que estava sessenta minutos atrás.
Parabéns. Isso é execução.`,

  pre_sono: `O dia acabou.
[4s silêncio]
Não precisa fazer mais nada. Não precisa resolver mais nada. Não precisa ser produtivo. O corpo agora tem uma única missão: recuperar.
Fecha os olhos se ainda não fechou.
[3s silêncio]
Eu quero que você faça algo. Pensa no momento mais difícil de hoje. O momento em que a disciplina pesou. A refeição que deu vontade de pular. O treino que quase não aconteceu. O copo d'água que parecia desnecessário. O momento em que o cérebro disse: hoje não.
[5s silêncio]
Achou?
Agora percebe: você está aqui. Deitado. O dia acabou. E esse momento difícil, você atravessou. Não importa se a nota foi dez ou seis. Você não cedeu. E atravessar o difícil sem ceder remodela circuitos neurais. Literalmente.
[2s silêncio]
O seu cérebro está fazendo algo extraordinário agora enquanto você relaxa. A neurocientista Wendy Suzuki, de Nova York, demonstrou que é durante o sono que o hipocampo transfere tudo que você viveu hoje pro córtex — armazenamento permanente. Cada refeição no plano. Cada série no treino. Cada decisão de não ceder. Tudo está sendo gravado agora. Pro resto da vida.
Você não percebe, mas está ficando mais forte enquanto descansa. Setenta por cento do hormônio do crescimento é liberado no sono profundo. O músculo que você estimulou hoje cresce agora. A caseína que você tomou na ceia está liberando aminoácidos pelas próximas seis a oito horas, alimentando cada fibra que você ativou.
Seu corpo é uma fábrica noturna. E o sono é o turno principal.
[3s silêncio]
Agora eu quero que pense em uma coisa que deu certo hoje. Só uma. Pode ser pequena. Uma refeição feita no horário. Um treino concluído. Uma tentação vencida. Um copo d'água quando deu preguiça. Um momento em que você escolheu o certo em vez do fácil.
[6s silêncio]
Guarda essa. Essa é sua. Ninguém tira.
Martin Seligman, o pai da psicologia positiva, provou que o exercício de identificar uma coisa positiva por dia reconecta o cérebro pra enxergar mais coisas positivas. Não é otimismo bobo. É neuroplasticidade direcionada. Você está treinando o cérebro pra ver progresso onde antes via falha.
[2s silêncio]
Vamos desacelerar o corpo. Respira comigo.
Inspira pelo nariz. Quatro segundos.
[4s silêncio]
Segura. Sete segundos. Sente o peito expandido. Sente o coração desacelerar.
[7s silêncio]
Solta pela boca. Oito segundos. Devagar. Todo o ar. Até não sobrar nada.
[8s silêncio]
Essa é a respiração quatro, sete, oito. O doutor Andrew Weil estudou ela por décadas. A expiração longa ativa o nervo vago — o maior nervo parassimpático do corpo. É o interruptor que desliga o modo luta ou fuga e liga o modo descansa e recupera. Cada expiração lenta é um comando biológico pro seu corpo: é seguro dormir.
De novo. Mais devagar. Inspira.
[4s silêncio]
Segura.
[7s silêncio]
Solta. Todo o ar.
[8s silêncio]
Amanhã o alarme toca. E o ciclo recomeça. Mas o ciclo de amanhã é construído agora. Cada hora de sono profundo é um tijolo na fundação do dia seguinte.
Seu streak continua. Seu MCE Score está vivo. Seu progresso está gravado.
[3s silêncio]
Dorme em paz. Seu corpo cresce. Seu cérebro consolida. Você fez o bastante.
Boa noite.
[15s silêncio]`,
};

export type ScriptPart = { text: string } | { silence: number };

/** Divide o roteiro em falas e silêncios reais, removendo direções de produção. */
export function parseRitualScript(script: string): ScriptPart[] {
  const parts: ScriptPart[] = [];
  const re = /\[([^\]]+)\]/g;
  let last = 0;
  let m: RegExpExecArray | null;
  const pushText = (raw: string) => {
    const t = raw.replace(/\s+/g, " ").trim();
    if (t) parts.push({ text: t });
  };
  while ((m = re.exec(script))) {
    pushText(script.slice(last, m.index));
    last = m.index + m[0].length;
    const sil = m[1].match(/^(\d+(?:[.,]\d+)?)\s*s/i);
    if (sil) parts.push({ silence: Math.min(30, parseFloat(sil[1].replace(",", ".")) || 0) });
  }
  pushText(script.slice(last));
  return parts;
}
