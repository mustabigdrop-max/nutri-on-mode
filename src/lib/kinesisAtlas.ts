/**
 * KINESIS — Seção 1: ATLAS DE EXERCÍCIOS.
 * Execução detalhada, cues obrigatórios, erros comuns, variações com "quando
 * usar / quando não usar", prescrição por objetivo e ativação muscular.
 *
 * Regra da base: todo dado de ativação tem fonte real OU é marcado como
 * ESTIMATIVA BIOMECÂNICA. Nunca inventar número de estudo inexistente.
 */

import type { ExercicioKinesis } from "./kinesisTypes";

const ESTIMATIVA = "ESTIMATIVA BIOMECÂNICA (princípios de alavanca, linha de força e amplitude — sem EMG específico)";

export const KINESIS_ATLAS: ExercicioKinesis[] = [
  {
    id: "barbell-bent-row",
    exercicio: "Remada Curvada com Barra (Barbell Bent-Over Row)",
    grupo_primario: "Dorsal (Latíssimo Dorsal)",
    grupos_secundarios: ["Trapézio Médio", "Romboides", "Deltoide Posterior", "Bíceps", "Eretores da Espinha (estabilização)"],
    subgrupo_enfase: {
      padrao: "Dorsal Médio",
      pegada_supinada: "Dorsal Inferior + Bíceps",
      pegada_pronada_aberta: "Dorsal Superior + Trapézio Médio",
      cotovelos_altos: "Deltoide Posterior + Trapézio",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "puxada horizontal",
      cadeia_cinetica: "aberta",
      plano_movimento: "sagital",
      articulacoes: ["glenoumeral", "escapulotorácica", "cotovelo"],
      nivel_minimo: "intermediario",
    },
    execucao: {
      posicao_inicial:
        "Em pé, pés na largura dos ombros. Flexão de quadril (hip hinge) até o tronco ficar 30-45° em relação ao chão. Joelhos levemente flexionados. Barra pendurada com braços estendidos. Escápulas em posição neutra (ainda NÃO deprimidas).",
      fase_concentrica:
        "Iniciar com DEPRESSÃO e RETRAÇÃO ESCAPULAR (ombros pra baixo, escápulas juntas). Só depois flexionar os cotovelos, puxando a barra em direção ao umbigo — não ao peito. Cotovelos rente ao corpo. Contrair forte no pico.",
      fase_excentrica:
        "Descer controlando 2-3s. Primeiro estender os cotovelos, depois protrair levemente as escápulas para alongar o latíssimo. Não jogar a barra. Manter tensão no dorsal durante todo o excêntrico.",
      respiracao: "Inspirar na descida, expirar na subida. Core contraído do início ao fim da série.",
      amplitude_ideal:
        "Barra toca ou quase toca o abdômen inferior, escápulas totalmente retraídas no topo. Embaixo, braços estendidos sem travar o cotovelo, com leve protração escapular.",
      tempo_recomendado: {
        padrao: "2-0-1-1",
        ativacao: "3-0-2-2 (2s de squeeze no pico)",
        forca: "1-0-X-0 (concêntrico explosivo)",
      },
    },
    cues_coaching: {
      cue_primario: "Puxe os COTOVELOS pra trás, não a barra pra cima. Imagine cordas amarradas nos cotovelos te puxando.",
      cue_secundario: "Primeiro movimento é escapular: ombros PRA BAIXO e PRA TRÁS. Só depois flexione os cotovelos.",
      cue_ajuste: "Tronco a 45° é o padrão. Mais vertical = mais trapézio. Mais horizontal = mais dorsal inferior.",
      cue_conexao_mente_musculo: "No pico, aperte como se houvesse um lápis entre as escápulas e você quisesse quebrá-lo. Se não sentir, a carga está pesada demais.",
    },
    erros_comuns: [
      {
        erro: "Usar momentum (puxar com impulso do corpo)",
        consequencia: "Dorsal não é recrutado adequadamente, eretores absorvem o estresse, risco lombar.",
        correcao: "Reduzir carga em 20%. Tronco FIXO durante toda a rep — se sobe mais que 5°, está pesado.",
        indicador_visual: "O corpo 'sacoleja' durante a rep.",
      },
      {
        erro: "Puxar a barra pro peito em vez do abdômen",
        consequencia: "Recruta mais trapézio superior e deltoide posterior no lugar do latíssimo.",
        correcao: "Guiar a barra ao UMBIGO. Cotovelos apontam pra trás, não pra cima.",
        indicador_visual: "Cotovelos acima da linha dos ombros no topo.",
      },
      {
        erro: "Não retrair escápulas (puxar só com os braços)",
        consequencia: "Bíceps fadiga antes do dorsal — o aluno diz que 'sente mais bíceps que costas'.",
        correcao: "2-3 séries de Band Pull-Apart como ativação antes. Cue: primeiro as escápulas, depois os cotovelos.",
        indicador_visual: "Escápulas ficam protraídas durante toda a rep.",
      },
      {
        erro: "Arredondar a lombar",
        consequencia: "Estresse excessivo nos discos lombares.",
        correcao: "Engajar core antes de cada série. Sem coluna neutra, trocar por remada no Smith ou no cabo.",
        indicador_visual: "Curvatura visível, 'corcunda' na parte baixa das costas.",
      },
      {
        erro: "Extensão incompleta (reps curtas)",
        consequencia: "Latíssimo nunca alonga totalmente; perde o estímulo no ponto de maior tensão mecânica.",
        correcao: "No excêntrico, estender os braços por completo e protrair levemente as escápulas.",
        indicador_visual: "Reps parecem 'pulsos curtos'.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Remada Pegada Supinada (Yates Row)",
        diferenca: "Palmas pra cima, tronco mais vertical (~60°), cotovelos rente ao corpo.",
        quando: "Deficit no dorsal INFERIOR.",
        contra: "Mais estresse no bíceps e antebraço. Evitar se o bíceps já limita o treino de costas.",
      },
      {
        variacao: "Remada Unilateral com Halter",
        diferenca: "Um lado de cada vez, apoio no banco.",
        quando: "ASSIMETRIA detectada. Lado fraco primeiro, +1 série.",
        contra: "Exige mais estabilização de tronco.",
      },
      {
        variacao: "Remada no Smith / máquina",
        diferenca: "Barra guiada, menos exigência de estabilização.",
        quando: "Deficit BIOMECÂNICO — isola o padrão de puxada sem cobrar estabilização lombar.",
        contra: "Ferramenta temporária do bloco CORRECT, não solução permanente.",
      },
      {
        variacao: "Seal Row (remada no banco)",
        diferenca: "Deitado de bruços em banco elevado, halteres pendurados.",
        quando: "Deficit de ATIVAÇÃO — elimina momentum e compensação lombar.",
        contra: "Precisa de setup específico e limita carga.",
      },
      {
        variacao: "Pendlay Row (do chão)",
        diferenca: "Cada rep começa do chão, tronco paralelo ao solo.",
        quando: "Objetivo de FORÇA, nível avançado.",
        contra: "NÃO usar com deficit biomecânico ou mobilidade de quadril limitada.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "8-12", rpe: "8-9", descanso: "90-120s" },
      forca: { series: "4-5", reps: "4-6", rpe: "9-10", descanso: "180-240s" },
      ativacao_neuromuscular: { series: "2-3", reps: "12-15", rpe: "6-7", descanso: "60-75s", nota: "Foco no squeeze, não na carga" },
      correcao_biomecanica: { series: "3", reps: "10", rpe: "6-7", descanso: "90s", nota: "Excêntrico 4s, carga -30%" },
    },
    emg: {
      fonte: "Fenwick et al., 2009 (remada curvada vs variações) / Lehman et al., 2004 (pegada na puxada)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Latíssimo dorsal", nivel: "ALTO" },
        { musculo: "Trapézio médio", nivel: "MODERADO-ALTO" },
        { musculo: "Romboides", nivel: "MODERADO" },
        { musculo: "Bíceps braquial", nivel: "MODERADO" },
        { musculo: "Eretores da espinha", nivel: "MODERADO (estabilização)" },
      ],
      nota: "A comparação direta entre pegadas na remada curvada é medida com métodos diferentes entre estudos — trate a diferença entre supinada e pronada como tendência, não como número fechado.",
    },
    conteudo_social: {
      hooks: [
        "O primeiro movimento da remada NÃO é puxar.",
        "90% puxam com BÍCEPS na remada. O erro que mata seu dorsal.",
        "Pegada pronada vs supinada na remada: o que muda de verdade.",
        "5 erros na remada que fazem você sentir mais bíceps que costas.",
      ],
      dados_impacto: [
        { texto: "Na remada, a ordem importa: escápula primeiro, cotovelo depois — sem isso o bíceps fadiga antes do dorsal.", badge: "DICA" },
        { texto: "Tronco mais horizontal desloca a ênfase para dorsal; mais vertical, para trapézio e deltoide posterior.", badge: "ESTIMATIVA", fonte: ESTIMATIVA },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },

  {
    id: "lat-pulldown-aberto",
    exercicio: "Puxada Frontal Pegada Aberta (Lat Pulldown)",
    grupo_primario: "Dorsal (Latíssimo Dorsal — porção superior)",
    grupos_secundarios: ["Teres major", "Trapézio inferior", "Bíceps", "Romboides"],
    subgrupo_enfase: {
      padrao: "Dorsal Superior (largura / V-taper)",
      pegada_neutra_estreita: "Dorsal Inferior + Braquial",
      pegada_supinada: "Dorsal Inferior + Bíceps",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "puxada vertical",
      cadeia_cinetica: "aberta",
      plano_movimento: "frontal",
      articulacoes: ["glenoumeral", "escapulotorácica", "cotovelo"],
      nivel_minimo: "iniciante",
    },
    execucao: {
      posicao_inicial:
        "Sentado, coxas travadas no apoio, pegada pronada um pouco mais larga que os ombros. Tronco levemente inclinado (10-15°), peito aberto, escápulas soltas no topo.",
      fase_concentrica:
        "Deprimir as escápulas (ombros pra longe das orelhas) e puxar os cotovelos pra baixo e levemente pra fora, até a barra passar da linha do queixo em direção à clavícula.",
      fase_excentrica: "Subir controlado em 2-3s deixando as escápulas elevarem no topo para alongar o latíssimo, sem perder a postura do tronco.",
      respiracao: "Expirar na puxada, inspirar na subida.",
      amplitude_ideal: "Alongamento completo no topo (escápula sobe), contração com cotovelos abaixo da linha dos ombros embaixo. Não puxar atrás da cabeça.",
      tempo_recomendado: { padrao: "2-0-1-1", ativacao: "3-0-2-2", forca: "2-0-X-0" },
    },
    cues_coaching: {
      cue_primario: "Puxe com os COTOVELOS pra baixo, como se fosse enfiar os cotovelos nos bolsos laterais.",
      cue_secundario: "Ombros longe das orelhas ANTES de puxar — se o trapézio encolhe, o lat desliga.",
      cue_ajuste: "Pegada mais larga = mais dorsal superior. Pegada neutra estreita = mais dorsal inferior.",
      cue_conexao_mente_musculo: "Sinta o 'abrir' embaixo das axilas. É ali que o V-taper nasce.",
    },
    erros_comuns: [
      {
        erro: "Deitar o tronco pra trás e transformar em remada",
        consequencia: "Muda o padrão motor: o estímulo vai pro dorsal médio e o aluno usa carga maior que consegue controlar.",
        correcao: "Limitar a inclinação a 10-15°. Se precisa deitar, reduzir carga.",
        indicador_visual: "Tronco oscila junto com cada rep.",
      },
      {
        erro: "Puxar atrás da cabeça",
        consequencia: "Rotação externa forçada com abdução máxima — estresse desnecessário no ombro sem ganho de recrutamento.",
        correcao: "Puxar sempre à frente, em direção à clavícula.",
        indicador_visual: "Cabeça projetada pra frente pra 'abrir espaço' para a barra.",
      },
      {
        erro: "Amplitude curta no topo",
        consequencia: "Perde a fase alongada, onde a tensão mecânica no latíssimo é maior.",
        correcao: "Deixar a escápula subir no topo de cada rep, mantendo controle.",
        indicador_visual: "Cotovelos nunca estendem por completo.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Pulldown Pegada Neutra Estreita",
        diferenca: "Cotovelos descem rente ao corpo.",
        quando: "Deficit de dorsal INFERIOR.",
        contra: "Menos estímulo para largura (dorsal superior).",
      },
      {
        variacao: "Pulldown Unilateral no Cabo",
        diferenca: "Um braço de cada vez, permite rotação livre do tronco.",
        quando: "ASSIMETRIA de dorsal: lado fraco primeiro, mesma carga nos dois lados.",
        contra: "Volume por sessão dobra em tempo.",
      },
      {
        variacao: "Pull-up com pegada larga",
        diferenca: "Peso corporal, cadeia mais exigente.",
        quando: "Intermediário/avançado com controle escapular já estabelecido.",
        contra: "Sem controle escapular, o aluno compensa com trapézio superior e bíceps.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "8-12", rpe: "8-9", descanso: "90s" },
      forca: { series: "4", reps: "5-6", rpe: "9", descanso: "150-180s" },
      ativacao_neuromuscular: { series: "2-3", reps: "12-15", rpe: "6-7", descanso: "60s", nota: "Pausa de 2s com cotovelos embaixo" },
      correcao_biomecanica: { series: "3", reps: "10-12", rpe: "6-7", descanso: "90s", nota: "Excêntrico 4s, foco em depressão escapular" },
    },
    emg: {
      fonte: "Lehman et al., 2004; Andersen et al., 2014 (variações de pegada na puxada)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Latíssimo dorsal", nivel: "ALTO" },
        { musculo: "Bíceps braquial", nivel: "MODERADO-ALTO" },
        { musculo: "Trapézio inferior", nivel: "MODERADO" },
      ],
      nota: "Os estudos de pegada na puxada mostram diferenças pequenas de ativação do latíssimo entre pegadas — a escolha se justifica mais pela ênfase de subgrupo e conforto articular do que por ativação total.",
    },
    conteudo_social: {
      hooks: [
        "Sua puxada virou remada. E seu dorsal parou de crescer.",
        "Puxada atrás da cabeça: por que eu tirei do treino dos meus alunos.",
        "Largura das costas: a pegada certa pro V-taper.",
      ],
      dados_impacto: [
        { texto: "Diferenças de pegada na puxada mudam mais a ênfase de subgrupo que a ativação total do latíssimo.", badge: "ESTUDO", fonte: "Lehman et al., 2004" },
        { texto: "Deixar a escápula subir no topo devolve a fase alongada — onde o dorsal recebe mais tensão mecânica.", badge: "DICA" },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },

  {
    id: "straight-arm-pulldown",
    exercicio: "Straight-Arm Pulldown (Pullover no Cabo)",
    grupo_primario: "Dorsal (Latíssimo Dorsal — porção inferior)",
    grupos_secundarios: ["Teres major", "Tríceps (porção longa)", "Core"],
    subgrupo_enfase: {
      padrao: "Dorsal Inferior (extensão pura de ombro)",
      com_pausa_isometrica: "Ativação neuromuscular do latíssimo",
    },
    classificacao: {
      tipo: "isolador",
      padrao_motor: "extensão de ombro",
      cadeia_cinetica: "aberta",
      plano_movimento: "sagital",
      articulacoes: ["glenoumeral"],
      nivel_minimo: "iniciante",
    },
    execucao: {
      posicao_inicial: "Em pé de frente pra polia alta, quadril levemente fletido, tronco 20-30° à frente, braços estendidos acima da cabeça, cotovelos com leve flexão fixa.",
      fase_concentrica: "Levar os braços estendidos até as coxas, mantendo o cotovelo no mesmo ângulo. Pausa de 2-3s com o latíssimo contraído.",
      fase_excentrica: "Retornar em 3s deixando o dorsal alongar acima da cabeça, sem perder a posição do tronco.",
      respiracao: "Expirar ao levar os braços pra baixo, inspirar no retorno.",
      amplitude_ideal: "Da flexão completa de ombro (braços acima da cabeça) até as mãos alcançarem as coxas.",
      tempo_recomendado: { padrao: "3-0-1-2", ativacao: "3-0-2-3 (pausa de 3s)", forca: "não recomendado para força" },
    },
    cues_coaching: {
      cue_primario: "O cotovelo é uma dobradiça TRAVADA. Só o ombro se move.",
      cue_secundario: "Puxe com a axila, não com a mão.",
      cue_ajuste: "Se sentir tríceps, reduza a carga e trave mais o ângulo do cotovelo.",
      cue_conexao_mente_musculo: "Na pausa embaixo, aperte a axila contra a costela por 3s. É esse o 'ligar' do dorsal.",
    },
    erros_comuns: [
      {
        erro: "Flexionar e estender o cotovelo (virar tríceps pushdown)",
        consequencia: "Sai a extensão de ombro, o latíssimo deixa de ser o motor.",
        correcao: "Reduzir carga 30% e travar o cotovelo. Filmar de lado para conferir.",
        indicador_visual: "Ângulo do cotovelo muda ao longo da rep.",
      },
      {
        erro: "Carga alta com balanço de tronco",
        consequencia: "O movimento passa a ser de quadril e core; o estímulo de ativação se perde.",
        correcao: "Fixar o tronco, usar carga que permita pausa de 2-3s.",
        indicador_visual: "Tronco sobe e desce a cada rep.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Pullover com halter",
        diferenca: "Deitado no banco, resistência varia com o ângulo.",
        quando: "Sem acesso a polia alta.",
        contra: "Pico de tensão em posição diferente; menos constante que o cabo.",
      },
      {
        variacao: "Straight-Arm Pulldown unilateral",
        diferenca: "Um braço por vez.",
        quando: "ASSIMETRIA ou deficit de ativação em um lado.",
        contra: "Exige mais antirotação de core.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3", reps: "10-15", rpe: "8", descanso: "60-75s" },
      forca: { series: "—", reps: "—", rpe: "—", descanso: "—", nota: "Exercício de isolamento: não indicado como trabalho de força" },
      ativacao_neuromuscular: { series: "2-3", reps: "12-15", rpe: "6-7", descanso: "60s", nota: "Pausa isométrica 3s — primeiro exercício da sessão no bloco [ACTIVATE]" },
      correcao_biomecanica: { series: "3", reps: "12", rpe: "6", descanso: "75s", nota: "Excêntrico 4s, sem falha" },
    },
    emg: {
      fonte: ESTIMATIVA,
      badge: "ESTIMATIVA",
      ativacao: [
        { musculo: "Latíssimo dorsal", nivel: "ALTO (isolado, carga menor)" },
        { musculo: "Teres major", nivel: "MODERADO" },
        { musculo: "Tríceps (porção longa)", nivel: "BAIXO-MODERADO" },
      ],
      nota: "Classificação por linha de força e amplitude articular — não há EMG específico comparável para todas as variações no cabo.",
    },
    conteudo_social: {
      hooks: [
        "O exercício que ensina seu dorsal a ligar.",
        "Sente mais bíceps que costas? Comece o treino por aqui.",
      ],
      dados_impacto: [
        { texto: "Sem flexão de cotovelo, o bíceps sai da equação: o dorsal é obrigado a fazer o trabalho.", badge: "DICA" },
      ],
      formato_sugerido: "REEL_ROTEIRO",
    },
  },

  {
    id: "supino-reto-barra",
    exercicio: "Supino Reto com Barra",
    grupo_primario: "Peitoral Maior (porção esternal)",
    grupos_secundarios: ["Deltoide anterior", "Tríceps", "Serrátil anterior"],
    subgrupo_enfase: {
      padrao: "Peitoral médio/esternal",
      inclinado_30: "Peitoral superior (porção clavicular)",
      declinado: "Peitoral inferior",
      pegada_fechada: "Tríceps + peitoral interno",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "empurrar horizontal",
      cadeia_cinetica: "aberta",
      plano_movimento: "transverso",
      articulacoes: ["glenoumeral", "escapulotorácica", "cotovelo"],
      nivel_minimo: "iniciante",
    },
    execucao: {
      posicao_inicial: "Deitado, cinco pontos de apoio, escápulas retraídas e deprimidas, arco lombar natural, pés firmes. Pegada pouco mais larga que os ombros.",
      fase_concentrica: "Empurrar a barra em leve diagonal, do peito para a linha dos ombros, mantendo as escápulas travadas. Cotovelos a ~45-60° do tronco.",
      fase_excentrica: "Descer em 2-3s até o esterno, mantendo antebraços verticais e cotovelos sob a barra.",
      respiracao: "Inspirar na descida, expirar após passar o ponto mais difícil.",
      amplitude_ideal: "Barra toca o peito sem quicar; no topo, cotovelos quase estendidos sem perder a retração escapular.",
      tempo_recomendado: { padrao: "2-0-1-0", ativacao: "3-1-2-1 (pausa 1s no peito)", forca: "2-0-X-0" },
    },
    cues_coaching: {
      cue_primario: "Empurre o CORPO longe da barra, não a barra longe do corpo.",
      cue_secundario: "Escápulas presas no banco do começo ao fim — ombro travado, peito aberto.",
      cue_ajuste: "Cotovelos muito abertos (90°) sobrecarregam o ombro; muito fechados viram tríceps. Mire 45-60°.",
      cue_conexao_mente_musculo: "Pense em juntar os peitorais no meio, como se fosse amassar algo entre eles.",
    },
    erros_comuns: [
      {
        erro: "Perder a retração escapular no topo",
        consequencia: "Ombro rola pra frente, aumenta estresse anterior e reduz tensão no peitoral.",
        correcao: "Manter as escápulas travadas; não perseguir a barra com os ombros no fim da rep.",
        indicador_visual: "Ombros sobem do banco no topo.",
      },
      {
        erro: "Quicar a barra no peito",
        consequencia: "Usa energia elástica e retira tensão do peitoral na fase mais importante.",
        correcao: "Tocar controlado, ou usar pausa de 1s no peito.",
        indicador_visual: "Barra 'salta' do tórax.",
      },
      {
        erro: "Cotovelos a 90° do tronco",
        consequencia: "Máximo estresse na articulação do ombro, comum em quem relata dor anterior.",
        correcao: "Trazer os cotovelos para 45-60°; se dói, reduzir amplitude ou trocar por halteres.",
        indicador_visual: "Braços formam um T perfeito com o tronco.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Supino com halteres",
        diferenca: "Amplitude maior, cada lado independente.",
        quando: "ASSIMETRIA de peitoral ou desconforto de ombro com barra.",
        contra: "Carga total menor; entrada e saída exigem técnica.",
      },
      {
        variacao: "Supino inclinado 30°",
        diferenca: "Maior flexão de ombro.",
        quando: "Deficit ESTÉTICO de peitoral superior.",
        contra: "Deltoide anterior participa mais; cuidado se o ombro é o ponto forte dominante.",
      },
      {
        variacao: "Supino no Smith ou máquina",
        diferenca: "Trajetória guiada.",
        quando: "Deficit BIOMECÂNICO — treinar o padrão sem cobrar estabilização.",
        contra: "Temporário; menos estabilizadores.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "6-12", rpe: "8-9", descanso: "120s" },
      forca: { series: "4-5", reps: "3-5", rpe: "9", descanso: "180-240s" },
      ativacao_neuromuscular: { series: "2-3", reps: "12-15", rpe: "6-7", descanso: "75s", nota: "Pausa de 1s no peito, carga -20%" },
      correcao_biomecanica: { series: "3", reps: "10", rpe: "6-7", descanso: "90s", nota: "Excêntrico 4s, carga -30%, sem falha" },
    },
    emg: {
      fonte: "Barnett et al., 1995 (ângulo do banco e ativação do peitoral)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Peitoral maior (esternal)", nivel: "ALTO" },
        { musculo: "Deltoide anterior", nivel: "MODERADO-ALTO" },
        { musculo: "Tríceps", nivel: "MODERADO-ALTO" },
      ],
      nota: "O banco inclinado aumenta a participação da porção clavicular; o declinado, da porção inferior.",
    },
    conteudo_social: {
      hooks: [
        "Seu supino trabalha ombro, não peito. Veja o ângulo do cotovelo.",
        "Dor no ombro no supino? Um detalhe resolve 80% dos casos.",
      ],
      dados_impacto: [
        { texto: "O ângulo do banco altera a ativação entre as porções do peitoral.", badge: "ESTUDO", fonte: "Barnett et al., 1995" },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },

  {
    id: "agachamento-livre",
    exercicio: "Agachamento Livre com Barra",
    grupo_primario: "Quadríceps",
    grupos_secundarios: ["Glúteo máximo", "Adutores", "Eretores da espinha", "Core"],
    subgrupo_enfase: {
      padrao: "Quadríceps + glúteo",
      barra_alta_tronco_vertical: "Quadríceps",
      barra_baixa_tronco_inclinado: "Glúteo + cadeia posterior",
      calcanheira: "Vasto medial e reto femoral (mais amplitude de joelho)",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "agachar (squat)",
      cadeia_cinetica: "fechada",
      plano_movimento: "sagital",
      articulacoes: ["quadril", "joelho", "tornozelo"],
      nivel_minimo: "intermediario",
    },
    execucao: {
      posicao_inicial: "Barra apoiada no trapézio, pés na largura dos ombros com leve rotação externa, core contraído, olhar neutro.",
      fase_concentrica: "Empurrar o chão com o pé todo, joelho e quadril estendendo juntos, mantendo o tronco no mesmo ângulo da descida.",
      fase_excentrica: "Descer em 2-3s com quadril e joelho simultâneos, joelho passando na direção do pé, coluna neutra.",
      respiracao: "Inspirar e travar o core antes de descer, expirar após o ponto mais difícil da subida.",
      amplitude_ideal: "Até a profundidade em que a pelve ainda não retroverte (sem 'butt wink'). Para a maioria, coxa abaixo da paralela.",
      tempo_recomendado: { padrao: "2-0-1-0", ativacao: "3-1-2-0 (pausa 1s embaixo)", forca: "2-0-X-0" },
    },
    cues_coaching: {
      cue_primario: "Empurre o CHÃO pra longe, o corpo sobe como consequência.",
      cue_secundario: "Joelhos acompanham a linha dos dedos — nem pra dentro, nem forçados pra fora.",
      cue_ajuste: "Barra alta + calcanheira = mais quadríceps. Barra baixa e tronco mais inclinado = mais glúteo.",
      cue_conexao_mente_musculo: "Na subida, sinta a pressão distribuída no meio do pé, não no dedão nem só no calcanhar.",
    },
    erros_comuns: [
      {
        erro: "Valgo dinâmico (joelho cai pra dentro)",
        consequencia: "Sobrecarga no ligamento colateral medial e no padrão de quadril; sinal de glúteo médio fraco.",
        correcao: "Reduzir carga, ativar glúteo médio antes (banda), cue 'joelho na linha do dedo'. Se persiste, avaliar no APEX.",
        indicador_visual: "Joelho colapsa pra dentro na subida.",
      },
      {
        erro: "Retroversão pélvica no fundo ('butt wink')",
        consequencia: "Flexão lombar sob carga.",
        correcao: "Reduzir a amplitude até o limite sem retroverter e trabalhar mobilidade de quadril/tornozelo.",
        indicador_visual: "Pelve gira embaixo e a lombar arredonda.",
      },
      {
        erro: "Subir com o quadril primeiro (good morning squat)",
        consequencia: "Transfere a carga para eretores e cadeia posterior; o quadríceps recebe menos estímulo.",
        correcao: "Manter o ângulo do tronco constante. Pausa de 1s embaixo, carga -20%.",
        indicador_visual: "Quadril sobe antes do peito.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Hack Squat / Leg Press",
        diferenca: "Trajetória guiada, menos exigência de estabilização e de coluna.",
        quando: "Deficit BIOMECÂNICO ou restrição lombar.",
        contra: "Menos transferência para padrões livres.",
      },
      {
        variacao: "Bulgarian Split Squat",
        diferenca: "Unilateral, base dividida.",
        quando: "ASSIMETRIA de quadríceps ou glúteo. Lado fraco primeiro.",
        contra: "Exige equilíbrio; progressão de carga mais lenta.",
      },
      {
        variacao: "Agachamento frontal",
        diferenca: "Barra à frente, tronco mais vertical.",
        quando: "Ênfase em quadríceps mantendo padrão livre.",
        contra: "Exige mobilidade de punho/ombro e core forte.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "6-12", rpe: "8", descanso: "150-180s" },
      forca: { series: "4-5", reps: "3-5", rpe: "9", descanso: "240s" },
      ativacao_neuromuscular: { series: "2-3", reps: "10-12", rpe: "6", descanso: "90s", nota: "Pausa 1s embaixo, foco no padrão" },
      correcao_biomecanica: { series: "3", reps: "8-10", rpe: "6", descanso: "120s", nota: "Carga -30-40%, excêntrico 4s, amplitude sem compensação" },
    },
    emg: {
      fonte: "Escamilla, 2001 (biomecânica do agachamento)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Quadríceps", nivel: "ALTO" },
        { musculo: "Glúteo máximo", nivel: "MODERADO-ALTO (cresce com a profundidade)" },
        { musculo: "Eretores da espinha", nivel: "MODERADO-ALTO (estabilização)" },
      ],
      nota: "Profundidade e posição da barra deslocam a demanda entre joelho e quadril.",
    },
    conteudo_social: {
      hooks: [
        "Seu joelho cai pra dentro no agachamento? O problema não é o joelho.",
        "Agachamento profundo: quando ajuda e quando vira flexão de lombar.",
      ],
      dados_impacto: [
        { texto: "A posição da barra e a profundidade mudam a divisão de trabalho entre joelho e quadril.", badge: "ESTUDO", fonte: "Escamilla, 2001" },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },

  {
    id: "hip-thrust",
    exercicio: "Hip Thrust com Barra",
    grupo_primario: "Glúteo Máximo",
    grupos_secundarios: ["Posterior de coxa", "Quadríceps", "Adutores"],
    subgrupo_enfase: {
      padrao: "Glúteo máximo (extensão de quadril com pico no topo)",
      pes_mais_afastados: "Posterior de coxa",
      pes_mais_proximos: "Quadríceps",
      unilateral: "Glúteo máximo + estabilizadores do quadril",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "extensão de quadril",
      cadeia_cinetica: "fechada",
      plano_movimento: "sagital",
      articulacoes: ["quadril", "joelho"],
      nivel_minimo: "iniciante",
    },
    execucao: {
      posicao_inicial: "Costas apoiadas no banco na linha das escápulas inferiores, barra sobre a dobra do quadril, pés na largura do quadril, tíbia vertical no topo.",
      fase_concentrica: "Estender o quadril até o tronco ficar paralelo ao chão, com retroversão pélvica ativa e squeeze de 1-2s no topo.",
      fase_excentrica: "Descer em 2-3s controlando, sem apoiar a barra no chão entre as reps.",
      respiracao: "Expirar na extensão, inspirar na descida. Costelas para baixo — não estufar o peito.",
      amplitude_ideal: "Do quadril abaixo da linha do banco até a extensão completa sem hiperextender a lombar.",
      tempo_recomendado: { padrao: "2-0-1-2", ativacao: "3-0-1-3 (squeeze de 3s)", forca: "2-0-X-1" },
    },
    cues_coaching: {
      cue_primario: "Empurre o chão com os calcanhares e leve o QUADRIL pra cima, não a lombar.",
      cue_secundario: "Costelas pra baixo e queixo levemente pra dentro — se a lombar arqueia, o glúteo saiu do movimento.",
      cue_ajuste: "Pés mais afastados envolvem mais posterior; mais próximos, mais quadríceps.",
      cue_conexao_mente_musculo: "No topo, aperte o glúteo por 2s como se fosse segurar uma moeda entre eles.",
    },
    erros_comuns: [
      {
        erro: "Hiperextender a lombar no topo",
        consequencia: "A extensão vem da coluna e não do quadril; glúteo recebe menos estímulo e a lombar sofre.",
        correcao: "Retroversão pélvica ativa, costelas pra baixo, reduzir carga.",
        indicador_visual: "Arco lombar acentuado no topo.",
      },
      {
        erro: "Amplitude curta (não descer)",
        consequencia: "Perde a fase alongada do glúteo.",
        correcao: "Descer até o quadril passar a linha do banco com controle.",
        indicador_visual: "Reps curtas, quase estáticas no topo.",
      },
      {
        erro: "Empurrar na ponta do pé",
        consequencia: "Transfere o trabalho para o quadríceps.",
        correcao: "Pressão no calcanhar e meio do pé, tíbia vertical no topo.",
        indicador_visual: "Calcanhar sobe do chão durante a subida.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Hip Thrust unilateral",
        diferenca: "Uma perna por vez.",
        quando: "ASSIMETRIA de glúteo ou rotação pélvica. Lado fraco primeiro.",
        contra: "Exige controle antirrotação; carga bem menor.",
      },
      {
        variacao: "Glute Bridge no chão",
        diferenca: "Amplitude menor, sem banco.",
        quando: "Bloco [ACTIVATE] no aquecimento ou aluno iniciante.",
        contra: "Estímulo insuficiente como exercício principal em avançados.",
      },
      {
        variacao: "Hip Thrust na máquina",
        diferenca: "Carga guiada, setup rápido.",
        quando: "Séries altas e progressão simples de carga.",
        contra: "Ajuste do banco limita alunos muito altos ou baixos.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "8-12", rpe: "8-9", descanso: "90-120s" },
      forca: { series: "4", reps: "5-6", rpe: "9", descanso: "150s" },
      ativacao_neuromuscular: { series: "2-3", reps: "12-15", rpe: "6-7", descanso: "60s", nota: "Squeeze de 3s no topo — bloco [ACTIVATE]" },
      correcao_biomecanica: { series: "3", reps: "10-12", rpe: "6", descanso: "90s", nota: "Sem carga máxima; foco em retroversão e amplitude" },
    },
    emg: {
      fonte: "Contreras et al., 2015 (hip thrust vs agachamento — ativação do glúteo)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Glúteo máximo", nivel: "ALTO" },
        { musculo: "Posterior de coxa", nivel: "MODERADO" },
        { musculo: "Quadríceps", nivel: "BAIXO-MODERADO" },
      ],
      nota: "O hip thrust gera maior ativação glútea média e de pico que o agachamento no estudo citado, com pico de tensão no fim da amplitude.",
    },
    conteudo_social: {
      hooks: [
        "Se sua lombar arqueia no hip thrust, o glúteo não está trabalhando.",
        "Glúteo não cresce? Confira onde está o pico de tensão do seu treino.",
      ],
      dados_impacto: [
        { texto: "O hip thrust apresentou ativação glútea maior que o agachamento em comparação direta.", badge: "ESTUDO", fonte: "Contreras et al., 2015" },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },

  {
    id: "elevacao-lateral",
    exercicio: "Elevação Lateral (Halteres ou Cabo)",
    grupo_primario: "Deltoide Lateral",
    grupos_secundarios: ["Deltoide anterior", "Supraespinhal", "Trapézio superior"],
    subgrupo_enfase: {
      padrao: "Deltoide lateral",
      no_cabo_atras_do_corpo: "Deltoide lateral com tensão na fase inicial",
      tronco_inclinado: "Deltoide lateral em maior amplitude útil",
    },
    classificacao: {
      tipo: "isolador",
      padrao_motor: "abdução de ombro",
      cadeia_cinetica: "aberta",
      plano_movimento: "frontal",
      articulacoes: ["glenoumeral", "escapulotorácica"],
      nivel_minimo: "iniciante",
    },
    execucao: {
      posicao_inicial: "Em pé, leve flexão de cotovelo fixa, halteres ao lado do corpo, escápulas deprimidas, ombros longe das orelhas.",
      fase_concentrica: "Abduzir até a linha dos ombros liderando com o cotovelo, sem encolher o trapézio.",
      fase_excentrica: "Descer em 3s mantendo tensão; não deixar os halteres baterem na coxa.",
      respiracao: "Expirar na subida, inspirar na descida.",
      amplitude_ideal: "Da lateral do corpo até a altura dos ombros. Acima disso, a escápula assume o movimento.",
      tempo_recomendado: { padrao: "3-0-1-1", ativacao: "3-0-2-2", forca: "não recomendado para força" },
    },
    cues_coaching: {
      cue_primario: "Lidere com o COTOVELO, como se estivesse derramando uma jarra para o lado.",
      cue_secundario: "Ombros pra baixo antes de iniciar. Se o movimento começa encolhido, é trapézio, não deltoide.",
      cue_ajuste: "Inclinar o tronco 10-15° à frente aumenta o tempo de tensão no deltoide lateral.",
      cue_conexao_mente_musculo: "Sinta o 'queimar' na lateral do ombro, não no pescoço.",
    },
    erros_comuns: [
      {
        erro: "Encolher os ombros (dominância de trapézio superior)",
        consequencia: "Trapézio assume o movimento; deltoide lateral recebe pouco estímulo.",
        correcao: "Carga -30%, depressão escapular ativa, 2 séries de trapézio inferior antes.",
        indicador_visual: "Ombro sobe em direção à orelha no início da rep.",
      },
      {
        erro: "Usar momentum e balançar o tronco",
        consequencia: "Reduz a tensão na parte mais difícil da amplitude.",
        correcao: "Excêntrico de 3s, carga que permita parada nos 90°.",
        indicador_visual: "Halteres 'jogados' pra cima.",
      },
      {
        erro: "Subir acima da linha dos ombros com carga alta",
        consequencia: "Aumenta a participação escapular e o desconforto subacromial em quem já tem sintoma.",
        correcao: "Parar na linha dos ombros; amplitude maior apenas sem sintoma e com carga leve.",
        indicador_visual: "Halteres acima da cabeça em série de hipertrofia.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "Elevação lateral no cabo",
        diferenca: "Tensão constante, inclusive no início da amplitude.",
        quando: "Deficit de ATIVAÇÃO de deltoide lateral.",
        contra: "Um lado por vez: dobra o tempo da sessão.",
      },
      {
        variacao: "Elevação lateral unilateral com apoio",
        diferenca: "Tronco apoiado, sem compensação.",
        quando: "ASSIMETRIA de deltoide.",
        contra: "Carga limitada.",
      },
      {
        variacao: "Lateral na máquina",
        diferenca: "Trajetória guiada, fácil progressão.",
        quando: "Deficit BIOMECÂNICO ou séries de alta repetição no fim da sessão.",
        contra: "Ajuste ruim muda o eixo do ombro.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "12-20", rpe: "8-9", descanso: "45-60s" },
      forca: { series: "—", reps: "—", rpe: "—", descanso: "—", nota: "Isolador: não indicado para trabalho de força" },
      ativacao_neuromuscular: { series: "2-3", reps: "15-20", rpe: "6-7", descanso: "45s", nota: "Pausa de 2s nos 90°, carga -20%" },
      correcao_biomecanica: { series: "3", reps: "15", rpe: "6", descanso: "60s", nota: "Depressão escapular ativa; parar antes do encolhimento" },
    },
    emg: {
      fonte: ESTIMATIVA,
      badge: "ESTIMATIVA",
      ativacao: [
        { musculo: "Deltoide lateral", nivel: "ALTO" },
        { musculo: "Trapézio superior", nivel: "MODERADO (cresce com carga excessiva)" },
        { musculo: "Supraespinhal", nivel: "MODERADO no início da abdução" },
      ],
      nota: "Ranking por mecânica da abdução; variações no cabo e na máquina não têm EMG comparável entre si.",
    },
    conteudo_social: {
      hooks: [
        "Se seu ombro sobe até a orelha, você está treinando trapézio.",
        "Elevação lateral: o ajuste de 10° que muda tudo.",
      ],
      dados_impacto: [
        { texto: "Ombro que inicia encolhido entrega o movimento ao trapézio superior — o deltoide lateral fica de fora.", badge: "DICA" },
      ],
      formato_sugerido: "REEL_ROTEIRO",
    },
  },

  {
    id: "rdl-stiff",
    exercicio: "Levantamento Terra Romeno (RDL / Stiff)",
    grupo_primario: "Posterior de Coxa (Isquiotibiais)",
    grupos_secundarios: ["Glúteo máximo", "Eretores da espinha", "Adutor magno"],
    subgrupo_enfase: {
      padrao: "Posterior de coxa + glúteo",
      unilateral: "Posterior + estabilizadores do quadril",
      deficit_no_step: "Amplitude maior de posterior",
    },
    classificacao: {
      tipo: "composto",
      padrao_motor: "dobradiça de quadril (hip hinge)",
      cadeia_cinetica: "fechada",
      plano_movimento: "sagital",
      articulacoes: ["quadril", "joelho (leve)"],
      nivel_minimo: "intermediario",
    },
    execucao: {
      posicao_inicial: "Em pé, barra rente às coxas, pés na largura do quadril, joelhos com flexão leve e FIXA, escápulas deprimidas.",
      fase_concentrica: "Empurrar o quadril à frente contraindo glúteo e posterior até a extensão completa, sem hiperextender a lombar.",
      fase_excentrica: "Levar o quadril PARA TRÁS em 3s, barra deslizando rente à perna, até sentir o alongamento do posterior com coluna neutra.",
      respiracao: "Inspirar e travar o core antes de descer, expirar no fim da subida.",
      amplitude_ideal: "Até o ponto em que a lombar ainda está neutra — normalmente barra no meio da canela. Alongamento manda, não o chão.",
      tempo_recomendado: { padrao: "3-0-1-1", ativacao: "4-1-2-1 (pausa embaixo)", forca: "2-0-X-0" },
    },
    cues_coaching: {
      cue_primario: "O quadril vai PRA TRÁS, não pra baixo. A barra desliza na perna.",
      cue_secundario: "Joelho com flexão fixa: se dobra mais, virou agachamento.",
      cue_ajuste: "Se sentir mais lombar que posterior, reduza a amplitude e a carga até a coluna ficar neutra em toda a descida.",
      cue_conexao_mente_musculo: "Sinta o posterior esticando como um elástico. É o alongamento que cresce o músculo aqui.",
    },
    erros_comuns: [
      {
        erro: "Arredondar a lombar para ganhar amplitude",
        consequencia: "Flexão lombar sob carga; posterior deixa de ser o alongado.",
        correcao: "Parar a descida onde a coluna se mantém neutra; filmar de perfil.",
        indicador_visual: "Lombar arredonda antes de a barra passar do joelho.",
      },
      {
        erro: "Transformar em agachamento (joelho flexiona muito)",
        consequencia: "Quadríceps assume, posterior perde alongamento.",
        correcao: "Fixar o ângulo de joelho; cue de quadril pra trás.",
        indicador_visual: "Joelho avança sobre o pé na descida.",
      },
      {
        erro: "Hiperextender no topo",
        consequencia: "Carga vai pra lombar.",
        correcao: "Terminar em extensão neutra com glúteo contraído.",
        indicador_visual: "Quadril projetado à frente com lombar arqueada no topo.",
      },
    ],
    variacoes_e_quando_usar: [
      {
        variacao: "RDL unilateral",
        diferenca: "Apoio em uma perna.",
        quando: "ASSIMETRIA de posterior ou histórico de estiramento unilateral. Progressão lenta.",
        contra: "Equilíbrio limita a carga.",
      },
      {
        variacao: "Mesa flexora (leg curl)",
        diferenca: "Flexão de joelho isolada.",
        quando: "Complementar o RDL — atende a função de flexão do joelho, que o hinge não cobre.",
        contra: "Não treina o padrão de quadril.",
      },
      {
        variacao: "Good Morning",
        diferenca: "Barra nas costas, alavanca maior no tronco.",
        quando: "Avançado com bom controle de coluna.",
        contra: "Não usar com deficit biomecânico ou dor lombar.",
      },
    ],
    prescricao_por_objetivo: {
      hipertrofia: { series: "3-4", reps: "8-12", rpe: "8", descanso: "120s" },
      forca: { series: "4", reps: "5-6", rpe: "8-9", descanso: "180s" },
      ativacao_neuromuscular: { series: "2-3", reps: "10-12", rpe: "6", descanso: "90s", nota: "Pausa 1s no alongamento, carga -20%" },
      correcao_biomecanica: { series: "3", reps: "8-10", rpe: "6", descanso: "120s", nota: "Amplitude parcial com coluna neutra, excêntrico 4s" },
    },
    emg: {
      fonte: "Schoenfeld et al., 2015 (exercícios de quadril e joelho para isquiotibiais)",
      badge: "ESTUDO",
      ativacao: [
        { musculo: "Isquiotibiais (porção proximal)", nivel: "ALTO" },
        { musculo: "Glúteo máximo", nivel: "MODERADO-ALTO" },
        { musculo: "Eretores da espinha", nivel: "MODERADO-ALTO (estabilização)" },
      ],
      nota: "Exercícios de quadril e de joelho estimulam regiões diferentes do isquiotibial — por isso RDL e flexora convivem no mesmo programa.",
    },
    conteudo_social: {
      hooks: [
        "Stiff não é agachamento com perna reta. A diferença está no quadril.",
        "Posterior de coxa não cresce? Você provavelmente só faz flexora.",
      ],
      dados_impacto: [
        { texto: "Exercícios de quadril e de joelho atingem regiões diferentes do isquiotibial — o programa precisa dos dois.", badge: "ESTUDO", fonte: "Schoenfeld et al., 2015" },
      ],
      formato_sugerido: "CARROSSEL_EDUCATIVO",
    },
  },
];

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

/** Busca um exercício do atlas por id, nome exato ou nome aproximado. */
export function buscarExercicio(termo: string): ExercicioKinesis | null {
  const t = norm(termo);
  if (!t) return null;
  return (
    KINESIS_ATLAS.find((e) => e.id === termo) ||
    KINESIS_ATLAS.find((e) => norm(e.exercicio) === t) ||
    KINESIS_ATLAS.find((e) => norm(e.exercicio).includes(t) || t.includes(norm(e.exercicio).split(" ")[0])) ||
    null
  );
}

/** Cue principal de um exercício — usado pelo STRATUM e pelo PRAXIS. */
export function cueDoExercicio(nome: string): string | null {
  const ex = buscarExercicio(nome);
  return ex ? ex.cues_coaching.cue_primario : null;
}

/** Variação indicada para um tipo de deficit (ASSIMETRIA, ATIVACAO, BIOMECANICO). */
export function variacaoParaDeficit(nome: string, deficit: string): string | null {
  const ex = buscarExercicio(nome);
  if (!ex) return null;
  const alvo = norm(deficit);
  const achado = ex.variacoes_e_quando_usar.find((v) => norm(v.quando).includes(alvo));
  return achado ? `${achado.variacao} — ${achado.quando}` : null;
}

/** Lista de exercícios do atlas de um grupo muscular. */
export function exerciciosDoGrupo(grupo: string): ExercicioKinesis[] {
  const g = norm(grupo);
  if (!g) return KINESIS_ATLAS;
  return KINESIS_ATLAS.filter((e) => norm(e.grupo_primario).includes(g) || g.includes(norm(e.grupo_primario).split(" ")[0]));
}
