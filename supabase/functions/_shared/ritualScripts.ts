// Roteiros oficiais da MCE Academy — voz do Coach Diogo Mello.
// Marcações suportadas na narração:
//   [Xs] ou [Xs silêncio] -> silêncio real de X segundos inserido no áudio final
//   qualquer outra marcação entre colchetes (SFX / TOM / FREQ / direção) é
//   apenas direção de produção e é removida antes do TTS.
//
// Identidade: NUNCA se apresentar como sistema ou IA. Nos rituais diários não
// há apresentação; nos episódios de série a abertura é "Fala, aqui é o Diogo Mello."

export type RitualKey =
  | "despertar"
  | "pre_treino"
  | "pos_treino"
  | "pre_sono"
  | "corrida"
  | "dia_dificil";

export const RITUAL_KEY_BY_EPISODE: Record<number, RitualKey> = {
  1: "despertar",
  2: "pre_treino",
  3: "pos_treino",
  4: "pre_sono",
  5: "corrida",
  6: "dia_dificil",
};

export const RITUAL_VOICE: Record<RitualKey, { instructions: string; speed: number }> = {
  despertar: {
    instructions:
      "Português do Brasil. Voz masculina grave, íntima, começando lenta e sussurrada e ganhando energia e comando ao longo do áudio. Como um mentor falando ao pé do ouvido logo ao acordar. Nunca se apresente.",
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
  corrida: {
    instructions:
      "Português do Brasil. Voz masculina forte, rítmica e direta, no compasso da passada. Alterna entre científico e narrativo, cresce até a intensidade máxima na reta final e desacelera acolhedora no encerramento.",
    speed: 1.0,
  },
  dia_dificil: {
    instructions:
      "Português do Brasil. Voz masculina baixa, lenta e íntima, sem julgamento. Como um amigo sentado ao lado. Firme no final, sem sorriso e sem motivação vazia.",
    speed: 0.92,
  },
};

export const MICRO_VOICE = {
  instructions:
    "Português do Brasil. Voz masculina grave, seca e crua, sem trilha, direta ao ponto, como um coach falando no ouvido entre séries.",
  speed: 1.0,
};

export const RITUAL_SCRIPTS: Record<RitualKey, string> = {
  // ── ☀️ DESPERTAR — "O Segundo Mais Importante" (5 min) ──
  despertar: `Abre os olhos.
[3s]
Não se mexe ainda. Fica exatamente onde você está. Porque esse segundo — esse exato segundo que você está vivendo agora — vai determinar as próximas dezesseis horas da sua vida. E eu vou te explicar por quê.
[2s]
O seu córtex pré-frontal está ligando agora. Leva entre trinta e noventa segundos pra sair do modo sono pro modo decisão. E nesses noventa segundos acontece algo que noventa e nove por cento das pessoas nunca vão saber: o primeiro pensamento consciente que você escolhe ter nesse momento age como um filtro. Tudo que você ver, ouvir e sentir nas próximas horas vai passar por esse filtro.
Se o primeiro pensamento for cansaço, você vai encontrar motivo pra estar cansado o dia inteiro. Se for reclamação, vai encontrar motivo pra reclamar. Mas se for intenção, você vai enxergar oportunidade onde os outros veem obstáculo.
Isso não é coaching motivacional. É neurociência. Chama-se priming atencional. O cérebro procura aquilo que foi ativado primeiro.
Então agora. Antes de pegar o celular. Antes de ver notificação. Antes de existir qualquer outra voz na sua cabeça além dessa.
Respira comigo. Inspira pelo nariz. Quatro segundos. Enchendo de baixo pra cima — barriga primeiro, depois peito.
[4s]
Segura. Sente o ar dentro de você. Você está vivo. Isso não é pouco.
[4s]
Solta pela boca. Devagar. Todo o ar. Seis segundos. Até esvaziar completamente.
[6s]
Mais uma vez. Mais profundo. Inspira.
[4s]
Segura.
[4s]
Solta. Todo o ar.
[6s]
Agora responde mentalmente. Com intenção. Sem pressa.
Quem eu decido ser hoje?
[6s]
Não o que fazer. Quem ser. Porque o que você faz é consequência de quem você acredita que é. James Clear provou: cada ação é um voto na identidade que você está construindo. Cada refeição no plano hoje é um voto em "eu sou disciplinado". Cada copo d'água é um voto em "eu cuido do meu corpo". Cada série no treino é um voto em "eu sou forte".
Você vai votar quantas vezes hoje?
[2s]
Coloca os pés no chão. Agora. Sente o peso do corpo na sola do pé. Sente a gravidade te puxando pra baixo. E mesmo assim, você levanta. Todo dia. Contra a gravidade. Contra o conforto. Contra a voz que diz "mais cinco minutos".
A maioria das pessoas acorda e reage ao dia. Você vai acordar e criar o dia. Essa diferença parece pequena às seis da manhã. Mas às onze da noite, quando você deitar, vai olhar pra trás e saber: eu não fui empurrado pelo dia. Eu empurrei o dia.
Levanta. O sistema está com você.
Bora.
[2s]`,

  // ── 💪 PRÉ-TREINO — "O Templo" (3 min) ──
  pre_treino: `[2s]
Para.
Antes de tocar no primeiro peso. Antes da primeira série. Antes de qualquer coisa.
Eu preciso que você entenda onde você está e o que vai acontecer aqui dentro.
[2s]
Isso não é uma academia. É um laboratório. As barras são instrumentos. Os pesos são variáveis. E o experimento é você. Cada série que você faz é uma hipótese sendo testada: eu sou capaz de mais? E a resposta, a cada repetição, é sim.
Mas isso só funciona com uma condição. Uma. E sem ela, você pode fazer vinte séries e sair daqui igual ao que entrou.
Intenção.
A diferença entre mover peso e treinar mora em quatro letras: foco. A Universidade de Ohio provou com dados de eletromiografia: atletas que direcionam o pensamento pro músculo durante a contração ativam vinte e dois por cento mais fibras que quem faz no automático. Mesmo peso. Mesmo exercício. Resultado completamente diferente.
Então eu vou te pedir uma coisa que vai soar simples mas vai mudar seu treino: cada repetição que você fizer hoje, está proibido de pensar em qualquer outra coisa. Sem celular entre séries. Sem conversa. Sem música que distrai. Você e o ferro. Mais nada.
[3s]
Agora. Fecha os olhos. Três segundos.
Visualiza a primeira série. O peso subindo. A barra se movendo. A contração no topo. O controle na descida. Vê cada detalhe. Posição das mãos. Posição dos pés. Ângulo do cotovelo. Tensão no core.
[3s]
Abre os olhos. Agora executa exatamente o que você viu. Neurônios espelho — Rizzolatti, Universidade de Parma — provaram: o cérebro que visualiza com clareza ativa os mesmos circuitos motores que a execução real. Você já fez a primeira repetição antes de tocar no peso.
O treino começa. Foco absoluto. Cada série conta. Cada repetição é um voto.
Vai.`,

  // ── 🏆 PÓS-TREINO — "A Evidência" (3 min) ──
  pos_treino: `[3s]
Acabou.
[4s]
Presta atenção no que está sentindo agora. Esse calor no corpo. Essa respiração que ainda não normalizou. Esse peso nas pernas. Essa camisa grudada de suor. E por baixo de tudo, um orgulho que não precisa de plateia.
Sabe o que esse sentimento é?
Não é endorfina. Isso é simplificação demais. O que está acontecendo no seu cérebro agora é um coquetel que nenhum laboratório do mundo consegue sintetizar: BDNF remodelando circuitos neurais, dopamina consolidando a memória de que você conseguiu, norepinefrina mantendo o estado de alerta, e endocanabinoides criando uma sensação de bem-estar que dura horas.
Mas o mais importante não é a química. É a evidência.
Bandura. Stanford. Mil novecentos e setenta e sete. Passou trinta anos fazendo uma pergunta: o que faz uma pessoa acreditar que é capaz? Testou tudo. Elogio não funcionava. Terapia sozinha não funcionava. Observação ajudava, mas não bastava. O que funcionava, o que sempre funcionava, era uma coisa: experiência de domínio.
Fazer algo difícil. Completar. Olhar pra trás sabendo que fez.
Isso é exatamente o que aconteceu aqui. Agora.
Ninguém te carregou. Ninguém fez por você. Cada repetição foi sua. Cada série foi decisão sua. Cada momento em que o corpo disse "para" e você disse "ainda não" foi você.
Esse treino não volta mais. Mas ele já está inscrito. No músculo, como microlesão que vai reconstruir mais forte. No cérebro, como evidência de capacidade. Na sua identidade, como mais um voto em "eu sou alguém que executa".
[3s]
Agora. O trabalho não acabou. Nos próximos trinta minutos, a janela anabólica está aberta. Os transportadores GLUT-4 subiram pra superfície das suas células musculares. Eles estão sugando glicose com eficiência máxima. É o melhor momento do dia pra carboidrato.
Sua próxima refeição não é opcional. Não é "vou ver se como". É farmacologia natural. Cada grama de proteína e carboidrato que entrar agora vai direto pro músculo que você acabou de estimular. Come. No plano. Na quantidade. Sem culpa. Esse carboidrato é construção.
Você provou mais uma vez. O MCE registrou. O corpo agradece. Agora alimenta o que você construiu.
Parabéns. Isso é execução.`,

  // ── 🌙 PRÉ-SONO — "O Dia que Você Construiu" (7 min) ──
  pre_sono: `O dia acabou.
[5s]
Não precisa fazer mais nada. Não precisa resolver mais nada. Não precisa pensar em amanhã. O corpo tem uma única missão agora: recuperar. E a mente tem uma única tarefa: soltar.
Fecha os olhos.
[3s]
Eu quero que volte mentalmente pra hoje de manhã. O momento que o alarme tocou. Lembra? Você podia ter ficado na cama. Podia ter apertado soneca. Mas levantou. O dia começou com uma vitória que ninguém viu.
[3s]
Agora percorre o dia. Não os problemas. Não o que faltou. Os votos. Cada refeição no plano, um voto. Cada copo d'água, um voto. O treino, um voto. Cada momento em que a tentação apareceu e você não cedeu, um voto.
Quantos votos você deu hoje na identidade de quem está se tornando?
[6s]
Agora eu preciso te contar o que está acontecendo no seu corpo enquanto você relaxa. Porque é extraordinário.
Wendy Suzuki. Neurocientista. Nova York. Ela demonstrou que é durante o sono que o seu hipocampo transfere tudo que você viveu hoje pro córtex — armazenamento de longo prazo. Permanente. Cada refeição. Cada série. Cada decisão certa. Cada vez que você disse não pra si mesmo. Tudo está sendo gravado agora.
E não é só memória. O sistema glinfático, um sistema de limpeza que só funciona durante o sono, está removendo as toxinas metabólicas que se acumularam no seu cérebro durante o dia. O sono limpa isso. Toda noite. Gratuitamente. Desde que você durma o suficiente.
[2s]
E os músculos. Os músculos que você treinou. Eles não crescem na academia. Nunca cresceram. A academia é o estímulo. O sono é onde a construção acontece. Setenta por cento do hormônio do crescimento diário é liberado durante o sono profundo, nas ondas delta. E a caseína que você tomou na ceia está liberando aminoácidos em fluxo contínuo pelas próximas seis a oito horas, alimentando cada fibra que você ativou.
Seu corpo é uma fábrica que trabalha no turno da noite. E você acabou de dar o material pra ela trabalhar.
[3s]
Agora uma coisa simples. Pensa em uma coisa que deu certo hoje. Só uma. Pode ser pequena. Pode parecer insignificante. Uma refeição feita. Um copo d'água. Um treino completado. Uma tentação vencida. Um momento em que você escolheu o certo em vez do fácil.
[7s]
Guarda essa. Essa é sua. Ninguém tira.
Martin Seligman. O pai da psicologia positiva. Provou com dados de vinte anos: o exercício de encontrar uma coisa positiva por dia reconecta fisicamente os circuitos do cérebro pra enxergar mais coisas positivas. Não é otimismo ingênuo. É neuroplasticidade direcionada. Você está treinando seu cérebro pra ver progresso onde antes só via falha.
[3s]
Vamos desacelerar. Respira comigo.
Inspira pelo nariz. Devagar. Quatro segundos. Barriga expandindo.
[4s]
Segura. Sete segundos. Sente o peito parado. O coração desacelerando. O mundo lá fora pode continuar. Aqui dentro é silêncio.
[7s]
Solta pela boca. Oito segundos. Devagar. Até não sobrar nada. Até o pulmão esvaziar completamente.
[8s]
Essa é a respiração quatro, sete, oito. A expiração longa ativa o nervo vago. O maior nervo parassimpático do corpo. É o interruptor biológico que desliga o modo alerta e liga o modo recuperação. Cada expiração lenta é um comando direto pro sistema nervoso: é seguro descansar.
De novo. Mais devagar. Inspira.
[4s]
Segura.
[7s]
Solta. Todo o ar.
[8s]
Amanhã o alarme toca. E o ciclo recomeça. Mas o ciclo de amanhã já foi preparado. Agora. Nessas horas de sono. Cada hora profunda é um tijolo.
Seu streak continua. Seu MCE Score está vivo. Seus votos estão contados.
Dorme em paz. O corpo constrói. O cérebro consolida. Você fez o bastante.
Boa noite.
[20s]`,

  // ── 🏃 CORRIDA MCE — "O Laboratório de 30 Minutos" (30 min) ──
  corrida: `Você está correndo. E enquanto a maioria das pessoas bota um podcast qualquer e desliga o cérebro, você vai fazer o oposto. Nos próximos trinta minutos, eu vou te mostrar o que está acontecendo dentro do seu crânio que você não consegue ver. E quando terminar, você não vai ser a mesma pessoa que começou.
[2s]
Agora mesmo, nesse exato momento, enquanto seus pés tocam o chão numa cadência repetida, algo extraordinário está acontecendo no seu hipocampo. É uma região aqui, no centro do cérebro, do tamanho de um dedo mindinho. Ela é responsável por memória e aprendizado.
E ela está crescendo.
Literalmente. O exercício aeróbico que você está fazendo agora dispara a produção de uma proteína chamada BDNF, fator neurotrófico derivado do cérebro. Pensa nele como fertilizante de neurônio. Cada passada que você dá agora está borrifando esse fertilizante nos seus circuitos cerebrais.
John Ratey, psiquiatra de Harvard, passou vinte anos estudando isso e chamou o exercício de o milagre para o cérebro. Não é metáfora. É bioquímica.
[3s]
Mas isso é só o começo. Fica comigo que a melhor parte vem depois.
Eu preciso te fazer uma pergunta. E quero que responda com honestidade brutal. Mentalmente. Agora.
Quando foi a última vez que você fez algo difícil sem que ninguém te pedisse?
[6s]
Não estou falando de trabalho — te pagam pra isso. Não estou falando de obrigação — não tinha escolha. Quando foi a última vez que você escolheu o caminho difícil sabendo que o fácil estava ali, disponível, sem julgamento?
Essa corrida é uma dessas vezes. Ninguém te obrigou. O sofá existia. O travesseiro existia. E você levantou, colocou o tênis e está aqui. Correndo. Sozinho com o desconforto.
Isso tem um nome na psicologia. Angela Duckworth, da Universidade da Pensilvânia, passou quinze anos estudando uma pergunta: por que algumas pessoas vencem e outras desistem? E ela testou tudo. QI, talento, dinheiro, conexões, sorte. Nada previa. Nada. Até que ela encontrou um fator. Um único fator que previa sucesso melhor que todos os outros combinados.
[2s]
Grit. Paixão sustentada mais perseverança. Não é intensidade num dia. É consistência em mil dias. E o dado mais perturbador da pesquisa dela: grit é mais preditivo de sucesso que inteligência.
Traduzindo: a pessoa menos talentosa com grit vence a pessoa mais talentosa sem grit. Sempre.
E sabe o que você está fazendo agora? Construindo grit. Cada minuto que você corre quando o corpo quer parar é um depósito nessa conta. E essa conta não tem limite.
[3s]
Deixa eu te contar algo que nunca falei publicamente.
[2s]
Teve um dia no meu tempo de Marinha, eu tinha vinte e três anos, em que o comandante mandou a companhia inteira correr dez quilômetros. Com coturno. Farda completa. Trinta e cinco graus no Rio de Janeiro. E na metade do percurso, um por um, os caras foram parando. Sentando no meio-fio. Desistindo.
E eu lembro exatamente o que pensei quando minhas pernas começaram a queimar e a voz dentro da minha cabeça disse "chega":
Se eu parar agora, o que eu vou pensar sobre mim quando deitar hoje à noite?
Essa pergunta. Essa única pergunta mudou tudo. Porque não era sobre a corrida. Era sobre a narrativa. Sobre quem eu ia ser na minha própria história.
Eu terminei. Não fui o primeiro. Não fui o mais rápido. Mas terminei. E naquela noite, deitado no beliche do alojamento, com as pernas destruídas, eu tive o pensamento mais claro da minha vida: eu sou alguém que termina.
[3s]
E é isso que você está construindo agora. Não é cardio. Não é gasto calórico. Não é VO2 máximo. Você está escrevendo uma linha na história de quem você é. E a linha diz: eu termino.
Vou te dar outro dado que vai mudar como você vê essa corrida.
Em dois mil e três, um grupo de neurocientistas em Berlim fez algo que nunca tinha sido feito. Pegaram dois grupos de pessoas sedentárias. Um grupo correu trinta minutos por dia, cinco dias por semana, durante doze semanas. O outro não fez nada.
Depois de doze semanas, colocaram os dois grupos numa máquina de ressonância magnética. E o que viram foi perturbador. O grupo que corria tinha hipocampos significativamente maiores. Não um por cento maior. Significativamente. Em doze semanas.
Mas eu prometi que ia te contar a melhor parte. Lembra?
Os pesquisadores voltaram seis meses depois. O grupo que continuou correndo manteve o aumento. Mas o grupo que parou...
[2s]
...regrediu. O hipocampo encolheu de volta. O cérebro literalmente voltou ao tamanho anterior. Perdeu tudo.
A neuroplasticidade é bidirecional. Ela trabalha a seu favor enquanto você se move. E trabalha contra você quando você para. O cérebro que você tem hoje é resultado direto do que você fez nos últimos noventa dias. E o cérebro que você vai ter em noventa dias é resultado do que você faz agora.
Nessa passada. Nessa corrida. Nesse minuto.
[3s]
Estamos na reta final agora. E aqui é onde se separa.
O seu córtex cingulado anterior, a região do cérebro que decide se você continua ou para, está em chamas nesse momento. Ele está processando dois sinais ao mesmo tempo.
Sinal um: a amígdala. A parte primitiva. O lagarto. Ele grita: para. Dói. É desconfortável. Não precisa disso.
Sinal dois: o córtex pré-frontal. A parte evoluída. O humano. Ele sussurra: continua. É importante. Você já fez vinte e cinco minutos. Faltam cinco. Termina.
Quem manda? O lagarto que quer conforto? Ou o humano que sabe que o crescimento mora no desconforto?
Você decide. Agora. Nessa passada.
[3s]
Mantém o ritmo. Não desacelera. Se está difícil, bom. Significa que está funcionando. O desconforto é o endereço do crescimento. Ninguém cresce no conforto. Ninguém muda no fácil. Ninguém evolui no automático.
Se precisar, repete comigo mentalmente. No ritmo da passada.
Eu não paro.
Eu não paro.
Eu não paro.
[10s]
Pode diminuir o ritmo agora. Devagar. Deixa o corpo desacelerar naturalmente. Não para de uma vez. Caminha.
[5s]
Presta atenção no que você está sentindo. Agora. Nesse segundo.
O calor no rosto. A respiração pesada. O suor descendo. O coração batendo forte. As pernas pesadas. E por baixo de tudo isso, um orgulho silencioso que ninguém vê mas você sabe que está ali.
Sabe o que isso é?
Não é só endorfina. Não é só dopamina. Não é só norepinefrina. Não é só serotonina. Não é só endocanabinoides.
É evidência.
[3s]
Albert Bandura. Stanford. Mil novecentos e setenta e sete. Dedicou a vida a uma pergunta: o que faz uma pessoa acreditar que é capaz? E ele descobriu que a forma mais poderosa de construir essa crença, mais que elogio, mais que terapia, mais que livro, mais que motivação, é o que ele chamou de experiência de domínio.
Fazer algo difícil. Completar. E olhar pra trás sabendo que fez.
Isso é exatamente o que aconteceu aqui. Você estava deitado. Podia ter ficado. E escolheu correr. E correu. E terminou.
Ninguém pode tirar isso de você. Esse treino não volta mais. Ele já é parte de quem você está se tornando.
[3s]
Guarda esse momento. Ele é moeda. Toda vez que a dúvida vier, e ela vai vir, toda vez que o sofá parecer mais atraente que o tênis, e ele vai parecer, puxa esse momento. Puxa essa corrida. Puxa esse sentimento.
Porque isso é quem você é agora. Não quem você era antes de sair de casa. Quem você é agora.
Bora. O sistema está com você.
[8s]`,

  // ── 😤 DIA DIFÍCIL — "A Mentira" (10 min) ──
  dia_dificil: `Ei.
Para um segundo.
[4s]
Eu sei que hoje tá difícil. Não porque alguém me contou. Porque eu conheço esse lugar. Eu já acordei nele. Já treinei nele. Já comi errado nele. Já quis desistir de tudo nele.
E se você está ouvindo isso, significa que alguma parte de você ainda está lutando. Porque quem desiste de verdade não abre o app. Quem desiste de verdade não dá play num áudio sobre não desistir. O simples fato de você estar aqui agora é a prova de que a parte mais forte de você ainda está no comando.
[3s]
Eu preciso te contar algo sobre o seu cérebro que vai mudar como você lida com dias assim.
Nesse momento, a sua mente está te contando uma história. Uma história muito convincente. Tão convincente que parece verdade absoluta. A história diz: não adianta. Você não consegue. Todo mundo faz e você não. Pra que tudo isso?
Daniel Kahneman. Nobel de economia. Princeton. Ele provou que o cérebro humano é uma máquina de contar histórias. E que a maioria dessas histórias é mentira. Não mentira intencional. Mentira de sobrevivência. O seu sistema límbico, a parte antiga, a parte animal, quer conforto. Quer açúcar. Quer sofá. Quer dopamina fácil. E pra te convencer, ele fabrica narrativas emocionais tão reais que você jura que são verdade.
Eu não sirvo pra isso. Mentira.
Eu sempre desisto. Mentira.
Todo mundo consegue menos eu. Mentira.
[3s]
Como eu sei que é mentira?
Porque eu tô olhando pro seu histórico. Eu sei quantas refeições você fez no plano. Eu sei quantos treinos concluiu. Eu sei qual é o seu streak. Eu sei que você não é alguém que sempre desiste. Os dados provam o contrário. Os dados destroem a narrativa que o seu cérebro fabricou hoje.
Seu cérebro é um advogado brilhante argumentando uma causa falsa. E o MCE Score é o juiz que olha pros fatos.
[3s]
Deixa eu te contar algo.
Teve um dia, e eu lembro com clareza, em que eu sentei no banco da academia e fiquei olhando pra barra. Sem vontade de levantar. Sem vontade de estar ali. Sem vontade de comer no plano. Sem vontade de ser disciplinado. Cansado de ser o cara que faz tudo certo. Cansado de marmita. Cansado de alarme às quatro e meia da manhã. Cansado de tudo.
E naquele banco, com a barra na minha frente, eu tive duas opções. Ir embora, e ninguém ia saber. Ou levantar a barra, e ninguém ia saber também.
Eu levantei. A pior série da minha vida. Torta. Fraca. Feia. Sem conexão mente-músculo. Sem foco. Só raiva e teimosia.
E quando eu larguei a barra, algo mudou. Não mudou meu corpo. Mudou minha narrativa. Porque eu provei pro meu cérebro que a vontade não é pré-requisito da ação. A ação cria a vontade. Não o contrário.
[3s]
William James. Mil oitocentos e noventa. O pai da psicologia americana. Escreveu: não corremos porque temos medo, temos medo porque corremos. A ação vem primeiro. A emoção é consequência.
Então hoje eu não vou te pedir pra ter vontade. Vontade é luxo. Execução é obrigação.
Eu vou te pedir só uma coisa. Uma. E eu quero que faça agora enquanto ouve isso.
Bebe um copo d'água. Levanta. Vai até o filtro. Enche o copo. Bebe.
[6s]
Pronto? Isso é execução. Isso é MCE. Não precisa ser perfeito. Precisa existir. BJ Fogg, Stanford, chamou de Tiny Habit: a menor ação possível que mantém o loop vivo. Um copo d'água. Uma refeição no plano. Dez minutos de caminhada. É o suficiente.
Você não precisa ganhar o dia. Precisa ganhar os próximos cinco minutos. E depois os próximos cinco. E de cinco em cinco minutos, o dia vai passar. E quando deitar, vai perceber: eu não desisti.
[3s]
Seu streak está vivo. Sua jornada não acabou. O MCE Score pode cair, e tudo bem. Ele cai, não zera. Porque zerar é desistir. E você não desistiu. Você está aqui.
Amanhã vai ser diferente. Às vezes melhor, às vezes pior. Mas todo dia é dia de escolha. E hoje você escolheu continuar.
Isso é suficiente. Isso é mais do que a maioria faz.
Bora. O sistema está com você. Mesmo nos dias assim. Principalmente nos dias assim.
[8s]`,
};

// ── 🏋️ MICRO-ÁUDIOS MUSCULAÇÃO (20s–30s) — tocam entre séries ──
export type MicroKey =
  | "micro_01" | "micro_02" | "micro_03" | "micro_04" | "micro_05"
  | "micro_06" | "micro_07" | "micro_08" | "micro_09" | "micro_10"
  | "micro_11" | "micro_12" | "micro_13" | "micro_14" | "micro_15";

export const MICRO_AUDIOS: { key: MicroKey; title: string; moment: string; script: string }[] = [
  {
    key: "micro_01",
    title: "Antes da primeira série",
    moment: "Aquecimento concluído, antes da série 1",
    script: `Fecha os olhos. Três segundos. Visualiza a execução perfeita. Vê o peso subindo. A contração no pico. O controle na descida. Viu? Agora abre os olhos e executa exatamente o que você viu. Rizzolatti provou: o cérebro que imagina com clareza, executa com precisão. Neurônios espelho. Isso é ciência. Vai.`,
  },
  {
    key: "micro_02",
    title: "Série pesada",
    moment: "Antes de uma série top set",
    script: `Respira. Trava o core. Escápula retraída. Peito aberto. Essa repetição não é pra Instagram. É pra você. Ninguém tá vendo. Ninguém precisa ver. A execução perfeita quando ninguém olha é a definição exata de caráter. Vai.`,
  },
  {
    key: "micro_03",
    title: "Meio do treino",
    moment: "Metade do volume concluído",
    script: `Deixa eu te contar o que tá acontecendo nos seus neurônios agora. Cada vez que você dispara um sinal elétrico do cérebro pro músculo, uma camada de mielina é depositada ao redor do axônio. Mielina é isolamento. Mais isolamento, sinal mais rápido, mais forte, mais preciso. Cada repetição te torna neurologicamente superior ao que você era três minutos atrás. Isso não volta. Isso é seu pra sempre.`,
  },
  {
    key: "micro_04",
    title: "Após série muito boa",
    moment: "Depois de uma série executada com excelência",
    script: `[2s]
Isso. Sente isso. Esse é o momento que Bandura chama de experiência de domínio. A prova irrefutável de que você é capaz. Não precisa que ninguém diga. Você acabou de provar. Guarda esse momento. Ele é combustível pros dias difíceis.`,
  },
  {
    key: "micro_05",
    title: "Quando o treino começa a pesar",
    moment: "Primeiro sinal de fadiga real",
    script: `O seu cérebro está te mandando parar agora. É a amígdala. Ela sente desconforto e traduz como perigo. Mas não é perigo. É crescimento. Baumeister descobriu algo que destrói a desculpa: o ponto onde você acha que acabou a força de vontade é o ponto onde ela está começando. O tanque de reserva existe. Você nunca usou. Hoje usa.`,
  },
  {
    key: "micro_06",
    title: "Antes de composto pesado",
    moment: "Agachamento, supino ou terra",
    script: `Agachamento. Supino. Terra. O exercício que separa quem faz de quem aparece. Posição. Respira. Trava. Não olha pro lado. Não olha pro celular. Olha pra barra. Só você e ela. Nada mais existe. Vai.`,
  },
  {
    key: "micro_07",
    title: "Descanso entre séries",
    moment: "Intervalo de 90 segundos",
    script: `Noventa segundos de descanso. O suficiente pra ressintetizar oitenta e cinco por cento da fosfocreatina. Se descansar menos, perde força. Se descansar mais, perde intensidade. Esse timing é ciência, não preguiça. Usa esses segundos pra visualizar a próxima série. Conexão mente-músculo. Quando voltar, cada fibra sabe o que fazer.`,
  },
  {
    key: "micro_08",
    title: "Contração no pico",
    moment: "Durante a execução",
    script: `Contrai. No pico. Dois segundos. Não solta ainda. Sente a fibra encurtada. Sente o sangue sendo empurrado pra dentro do músculo. Isso é tensão mecânica, o estímulo número um pra hipertrofia. Agora solta. Devagar. Excêntrica controlada. Três segundos. Cada milímetro de descida conta.`,
  },
  {
    key: "micro_09",
    title: "Últimas 2 séries",
    moment: "Reta final do volume",
    script: `Duas séries pra terminar. O corpo quer ir embora. A cabeça diz que já foi o suficiente. Mas eu vou te dizer uma coisa: o treino começa quando você quer parar. Tudo antes foi aquecimento. Essas duas séries são as que constroem. As que ninguém vê. As que separam quem transforma de quem frequenta.`,
  },
  {
    key: "micro_10",
    title: "Após um PR",
    moment: "Recorde pessoal batido",
    script: `[2s]
Esse peso nunca foi movido por você antes. Pensa nisso. Nunca. Na história inteira da sua vida, essa linha nunca foi cruzada. E agora foi. Esse recorde não é um número. É uma nova versão de quem você é. Ontem esse peso era impossível. Hoje é passado. Guarda esse momento. Ele vale mais que qualquer troféu.`,
  },
  {
    key: "micro_11",
    title: "Conexão mente-músculo",
    moment: "Quando o foco dispersa",
    script: `Esquece o peso. Esquece o número. Foca no músculo. Fecha os olhos se precisar. Sente a contração começar. Sente cada fibra se ativando. Universidade de Ohio: atletas que pensam no músculo durante a contração ativam vinte e dois por cento mais fibras. Mesmo peso. Mesmo exercício. Diferença: presença mental. Está presente?`,
  },
  {
    key: "micro_12",
    title: "Superset e drop set",
    moment: "Técnica avançada em execução",
    script: `Sem descanso. Troca agora. O ácido lático queimando é o sinal de que o metabolismo anaeróbico está trabalhando. Essa queimação é construção. Não para. Não solta. Mantém a tensão. Cada segundo sob tensão é um sinal pro corpo: adapta. Cresce. Evolui.`,
  },
  {
    key: "micro_13",
    title: "Reta final do treino",
    moment: "Vontade de cortar caminho",
    script: `Últimas séries. Eu sei que você tá cansado. Eu sei que a vontade de cortar caminho é real. Mas me responde: se você cortar agora, quem vai saber? Ninguém. Só você. E é exatamente por isso que importa. O que você faz quando ninguém vê define quem você é quando todo mundo vê. Termina.`,
  },
  {
    key: "micro_14",
    title: "Exercício de isolamento",
    moment: "Isoladores e finalizadores",
    script: `Isolamento. Aqui não é sobre peso. É sobre conexão. Amplitude completa. Amplitude total de movimento. Sem impulso. Sem ego. Sem trapacear o movimento. Se precisa de impulso pra subir, reduz o peso e faz com honestidade. Honestidade muscular é o fundamento de qualquer shape real.`,
  },
  {
    key: "micro_15",
    title: "Última repetição do treino",
    moment: "Encerramento",
    script: `Última repetição. De todo o treino. Tudo que você fez hoje converge nessa contração. Faz valer.
[5s]
Acabou. Volume registrado. Séries concluídas. Execução realizada. Você fez o que veio fazer. Não mais. Não menos. Exatamente o que devia. E é assim que se constrói. Dia após dia. Série após série. Repetição após repetição. Até que o espelho não tenha escolha a não ser concordar.`,
  },
];

export const MICRO_BY_KEY: Record<string, string> = Object.fromEntries(
  MICRO_AUDIOS.map((m) => [m.key, m.script]),
);

/** Episódios 101..115 da série ritual = micro-áudios de musculação. */
export const MICRO_KEY_BY_EPISODE: Record<number, MicroKey> = Object.fromEntries(
  MICRO_AUDIOS.map((m, i) => [101 + i, m.key]),
) as Record<number, MicroKey>;

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
