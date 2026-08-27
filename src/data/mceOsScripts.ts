// Roteiros oficiais do PROTOCOLO MCE 24H (espelho client-side de supabase/functions/_shared/osScripts.ts) — voz do Coach Diogo Mello.
// Marcações [Xs] viram silêncio real no áudio final (ver parseRitualScript).
// Nunca há apresentação nos rituais diários: a voz é do Diogo, pessoa.

export type OsAudioKey = "despertar" | "corrida_mental" | "recalibracao" | "pre_sono";

export const OS_AUDIO_VOICE: Record<OsAudioKey, { instructions: string; speed: number }> = {
  despertar: {
    instructions:
      "Português do Brasil. Voz masculina grave, íntima e calma no começo, quase sussurrada, ganhando firmeza e energia progressiva até o comando final. Mentor falando ao pé do ouvido logo ao acordar. Nunca se apresente.",
    speed: 0.95,
  },
  corrida_mental: {
    instructions:
      "Português do Brasil. Voz masculina forte, direta, cadência militar, sem enfeite. Comando seco e energético do início ao fim.",
    speed: 1.0,
  },
  recalibracao: {
    instructions:
      "Português do Brasil. Voz masculina calma, reflexiva e breve, tom de pausa consciente no meio do dia. Sem julgamento.",
    speed: 0.95,
  },
  pre_sono: {
    instructions:
      "Português do Brasil. Voz masculina muito baixa, lenta e grave, desacelerando progressivamente até quase sussurro no fim.",
    speed: 0.85,
  },
};

export const OS_AUDIO_META: Record<OsAudioKey, { title: string; block: string; pilar: string; minutes: number }> = {
  despertar: { title: "Despertar", block: "Ignição · 05:00–06:00", pilar: "Mindset", minutes: 5 },
  corrida_mental: { title: "Corrida Mental", block: "Execução Primária · 06:00–12:00", pilar: "Execução", minutes: 3 },
  recalibracao: { title: "Micro-áudio Recalibração", block: "Recalibração · 12:00–13:00", pilar: "Comportamento", minutes: 2 },
  pre_sono: { title: "Pré-sono Consolidação", block: "Consolidação · 20:00–22:00", pilar: "Mindset + Comportamento", minutes: 7 },
};

export const OS_AUDIO_SCRIPTS: Record<OsAudioKey, string> = {
  despertar: `[3s]
Acorda.
Não para o mundo. Não porque alguém mandou. Acorda porque você decidiu que hoje importa.
[2s]
Antes de olhar o celular. Antes de falar com qualquer pessoa. Senta na beira da cama.
Respira fundo. Inspira pelo nariz... segura... expira pela boca.
Mais uma vez. Inspira... segura... expira.
[3s]
Agora responde mentalmente. Quem eu sou?
Não o que você faz. Não seu cargo. Não seu nome. Quem você É. Qual identidade você está construindo?
Eu sou um atleta que constrói disciplina pelo comportamento.
Repete isso mentalmente. Sente o peso dessas palavras. Bandura, em Stanford, provou que identidade precede comportamento. Você se declara primeiro. Depois seus comportamentos se alinham à declaração.
[3s]
Segunda pergunta. O que eu estou construindo?
Não hoje. Não essa semana. O que eu estou construindo que vai existir daqui a um ano? Frankl sobreviveu a campos de concentração porque tinha um propósito claro. Quem tem propósito levanta da cama. Quem não tem, escolhe o travesseiro.
O que você está construindo?
[4s]
Terceira pergunta. O que eu faço hoje que me aproxima?
Não amanhã. Hoje. Uma coisa. Qual é?
Treino. Refeição. Conteúdo. Conversa. Qual é a ação de hoje que reduz o gap entre quem você é e quem quer ser?
[3s]
Agora, revisão de intenção. Três prioridades do dia.
Treino: qual treino, que horas.
Nutrição: refeições planejadas, marmitas prontas?
Execução profissional: qual a entrega principal de hoje.
Mueller e Oppenheimer, em Princeton, provaram que escrever à mão ativa mais áreas cerebrais. Se puder, escreva. Se não puder, declare mentalmente.
[3s]
Seu Sistema 2 está no pico agora. Kahneman, Nobel em Princeton, mostrou que o pensamento racional, deliberado, está mais forte pela manhã. Conforme o dia avança, ele cansa. E quando o Sistema 2 cansa, o Sistema 1 assume: automático, emocional, impulsivo. É ele que abre a geladeira às 23 horas.
Se você não programa o dia agora, o Sistema 1 comanda. E o Sistema 1 não tem o seu plano.
[2s]
Levanta. Pega 10 minutos de luz natural. Huberman, em Stanford, provou que 10 minutos de luz solar nos primeiros 30 minutos do dia sincronizam o ritmo circadiano, elevam cortisol no momento certo e suprimem melatonina. Combine com movimento leve: caminhada, alongamento. O objetivo é ativar, não treinar.
[2s]
Última parte. Declaração do dia em voz alta.
Não precisa ser épica. Precisa ser verdadeira.
Hoje eu executo. Sem negociação. O plano é claro, a intenção está definida, e o meu comportamento vai se alinhar à minha identidade.
Repete comigo mentalmente. Hoje eu executo.
[2s]
Ignição completa. Seu dia começou. O sistema operacional está programado. Agora vai pro Bloco 2, Execução Primária. Cada série, cada refeição, cada entrega reconstrói o circuito.
Merzenich provou: o cérebro se molda pelo que você repete. Repita excelência.
Vai.
[3s]`,

  corrida_mental: `[2s]
Execução Primária. Este é o bloco de fazer. Não de pensar. Não de planejar. Fazer.
Cortisol e testosterona estão nos picos naturais. Força de vontade cheia. Sistema 2 forte. Este é o período de ouro do seu dia.
[2s]
Regra número um: tarefa mais difícil primeiro. Newport, em Georgetown, chama isso de Deep Work. O trabalho que exige mais concentração vai agora, quando seu cérebro está fresco. Não depois do almoço. Não quando der. Agora.
[2s]
Regra número dois: treino com intenção. Cada série que você vai fazer não é repetição mecânica. É uma instrução neural. Antes de cada série pesada, use self-talk instrucional.
Controle na excêntrica.
Drive de quadril.
Ativa a dorsal antes de puxar.
Hatzigeorgiadis provou em meta-análise que self-talk instrucional melhora performance 20 a 25 por cento mais que o motivacional. Não é motivação. É instrução.
[2s]
Regra número três: refeições planejadas, sem improviso. Comer é Sistema 1: o que tiver disponível. Executar o plano é Sistema 2: o que foi planejado. Marmita pronta é execução automática. Prep de marmita não é perfumaria. É engenharia comportamental.
[2s]
Regra número quatro: zero negociação com a meta do dia. Duckworth, em Penn, estudou Grit, a combinação de paixão e perseverança. As pessoas que atingem resultados extraordinários não são as mais talentosas. São as que não negociam com o processo.
Não negocie. Execute.
[2s]
Cada série que você completa no limite reforça o circuito neural da excelência. Merzenich provou que o cérebro se reconfigura fisicamente pelo que você repete. Você está literalmente reconstruindo a arquitetura do seu cérebro agora.
Vai. Executa. Sem negociação.
[2s]`,

  recalibracao: `[2s]
Pausa. Recalibração.
Este é o bloco que ninguém faz. E é exatamente o que separa quem executa de quem desiste na segunda semana.
[2s]
Meio do dia. Check-in rápido.
Treinei? Sim ou não.
Refeições 1 a 3 conforme o plano? Sim, parcial, ou não.
Minha energia agora? Alta, média, ou baixa.
O que preciso ajustar pra tarde?
[3s]
Se algo saiu do plano, corrija agora. Não no fim do dia quando já não tem o que fazer. Agora, quando ainda dá tempo.
Baumeister chamou isso de what the hell effect. Falhou uma vez, pensa "já estraguei tudo" e abandona o dia. O check-in interrompe esse ciclo. Um desvio é dado. Dois desvios viram padrão. Nunca deixe dois erros seguidos acontecerem.
[2s]
Rotter, na University of Connecticut, provou que locus de controle interno monitora resultados ativamente. O check-in é um exercício de locus. Quando você para e avalia, você assume o controle. Quando ignora, terceiriza o resultado pro acaso.
[2s]
Três minutos sem tela. Respira. Recalibra. Define um ajuste concreto pra tarde.
[3s]
Pronto. Recalibração feita. Segue pro Bloco 4, Sustentação. A tarde é onde a maioria desiste. Você não é a maioria.
[2s]`,

  pre_sono: `[3s]
Consolidação. O último bloco do dia. O mais subestimado. E talvez o mais poderoso.
[2s]
O hipocampo transfere memórias de curto prazo para longo prazo durante o sono. A última hora acordado influencia o que o cérebro prioriza consolidar. O que você faz agora determina o que seu cérebro vai reforçar enquanto dorme.
[3s]
Revisão MCE do dia.
Mindset. De 1 a 10, como esteve seu sistema operacional hoje? Qual foi sua crença mais forte? Teve algum pensamento de mindset fixo, algum "eu não consigo", "eu não sou capaz"? Se sim, como reinterpretou?
[4s]
Comportamento. Quantas refeições executou conforme o plano? Teve algum padrão automático negativo? Qual? O que disparou esse padrão?
[4s]
Execução. Treinou? Intensidade de 1 a 10. Qual foi sua principal entrega do dia? Nota geral de execução.
[4s]
Agora: uma coisa que você vai manter. Algo que funcionou hoje e que vai repetir amanhã. Identifique e declare.
E uma coisa que vai corrigir. Algo que não funcionou e que precisa de ajuste. Não julgamento. Ajuste.
[3s]
Walker, em UC Berkeley, autor de Why We Sleep, provou que a qualidade do sono determina síntese proteica, consolidação de memória, regulação hormonal — GH, testosterona, cortisol — e controle de apetite por grelina e leptina. Sono não é descanso. É parte do protocolo.
[2s]
Preparação do amanhã. Cinco itens. Não leva 5 minutos.
Roupa de treino separada.
Marmitas prontas ou planejadas.
Alarme configurado.
Primeira tarefa do dia definida.
Qual pilar MCE vai exercitar conscientemente amanhã.
Isso não é organização. É programação do Sistema 1. Cada decisão eliminada de manhã é energia mental preservada.
[3s]
Agora, desaceleração neural.
Não faça: olhar celular com luz azul. Harvard provou que suprime melatonina em 50 por cento. Não abra redes sociais. Não tome decisões importantes. Não entre em discussões.
Faça: respiração 4-7-8. Inspira pelo nariz contando 4. Segura contando 7. Expira pela boca contando 8.
Vamos juntos.
Inspira... 2... 3... 4.
[2s]
Segura... 2... 3... 4... 5... 6... 7.
[3s]
Expira... 2... 3... 4... 5... 6... 7... 8.
[4s]
Mais uma vez. Inspira... 2... 3... 4.
[2s]
Segura... 2... 3... 4... 5... 6... 7.
[3s]
Expira... 2... 3... 4... 5... 6... 7... 8.
[4s]
Uma última. Inspira... 2... 3... 4.
[2s]
Segura... 2... 3... 4... 5... 6... 7.
[3s]
Expira... 2... 3... 4... 5... 6... 7... 8.
[3s]
Seu dia está completo. Cada bloco executado. O circuito de excelência foi reforçado mais uma vez.
Amanhã o ciclo recomeça. E cada dia que você executa, o gap entre quem você é e quem quer ser diminui. Isso não é motivação. É neuroplasticidade. É arquitetura comportamental. É MCE.
O comportamento vem antes do protocolo.
Descansa. Amanhã a gente reconstrói de novo.
[5s]`,
};
