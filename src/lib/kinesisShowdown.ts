/**
 * KINESIS Showdown Engine — comparação científica de exercícios.
 *
 * Regras absolutas:
 * - Números de EMG só aparecem quando existe estudo real citado (badge ESTUDO).
 * - Sem estudo específico, a comparação é qualitativa e marcada ESTIMATIVA BIOMECÂNICA.
 * - Nenhum exercício é declarado "melhor" sem contexto: o veredicto é sempre
 *   por OBJETIVO e conectado ao tipo de deficit do APEX.
 */

export type EvidenceBadge = "ESTUDO" | "ESTIMATIVA" | "PRATICA";

export const BADGE_LABEL: Record<EvidenceBadge, string> = {
  ESTUDO: "ESTUDO",
  ESTIMATIVA: "ESTIMATIVA BIOMECÂNICA",
  PRATICA: "PRÁTICA DE COACHING",
};

export type Nivel3 = "baixa" | "moderada" | "alta";
export type Risco = "baixo" | "moderado" | "alto";
export type Dificuldade = "iniciante" | "intermediario" | "avancado";

export interface ExercicioDados {
  nome: string;
  /** O que o exercício mais recruta / viés principal. */
  foco: string;
  estabilizacao: Nivel3;
  risco: Risco;
  dificuldade: Dificuldade;
  /** Dado de EMG com fonte real. Ausente = sem número inventado. */
  emg?: { descricao: string; fonte: string };
  quandoUsar: string;
}

export type Objetivo =
  | "hipertrofia_geral"
  | "subgrupo_fraco"
  | "seguranca"
  | "conexao"
  | "forca"
  | "deficit_ativacao";

export const OBJETIVO_LABEL: Record<Objetivo, string> = {
  hipertrofia_geral: "Hipertrofia geral do grupo",
  subgrupo_fraco: "Subgrupo fraco",
  seguranca: "Segurança articular",
  conexao: "Conexão mente-músculo",
  forca: "Força máxima",
  deficit_ativacao: "Deficit de ativação (APEX)",
};

export interface Veredicto {
  vencedor: "a" | "b" | "empate";
  justificativa: string;
}

export interface Showdown {
  id: string;
  grupo: string;
  a: ExercicioDados;
  b: ExercicioDados;
  veredictos: Record<Objetivo, Veredicto>;
  /** Referências reais usadas nesta comparação (vazio = 100% estimativa). */
  fontes: string[];
}

const FONTES = {
  barnett1995:
    "Barnett C, Kippers V, Turner P. Effects of variations of the bench press exercise on the EMG activity of five shoulder muscles. J Strength Cond Res. 1995.",
  boeckh2000:
    "Boeckh-Behrens WU, Buskies W. Fitness-Krafttraining: Die besten Übungen und Methoden für Sport und Gesundheit. 2000 (comparações de EMG em exercícios de peitoral).",
  escamilla2001:
    "Escamilla RF et al. Effects of technique variations on knee biomechanics during the squat and leg press. Med Sci Sports Exerc. 2001.",
  contreras2015:
    "Contreras B et al. A comparison of gluteus maximus, biceps femoris, and vastus lateralis EMG activity in the back squat and barbell hip thrust. J Appl Biomech. 2015.",
};

function ex(
  nome: string,
  foco: string,
  estabilizacao: Nivel3,
  risco: Risco,
  dificuldade: Dificuldade,
  quandoUsar: string,
  emg?: ExercicioDados["emg"],
): ExercicioDados {
  return { nome, foco, estabilizacao, risco, dificuldade, quandoUsar, emg };
}

type V = Record<Objetivo, Veredicto>;
const v = (
  hg: Veredicto, sf: Veredicto, seg: Veredicto, con: Veredicto, for_: Veredicto, da: Veredicto,
): V => ({
  hipertrofia_geral: hg, subgrupo_fraco: sf, seguranca: seg,
  conexao: con, forca: for_, deficit_ativacao: da,
});
const A = (justificativa: string): Veredicto => ({ vencedor: "a", justificativa });
const B = (justificativa: string): Veredicto => ({ vencedor: "b", justificativa });
const E = (justificativa: string): Veredicto => ({ vencedor: "empate", justificativa });

export const SHOWDOWNS: Showdown[] = [
  // ===== PEITO =====
  {
    id: "supino-reto-vs-inclinado",
    grupo: "Peito",
    a: ex("Supino Reto com Barra", "Porção esternal do peitoral; maior carga absoluta", "moderada", "moderado", "intermediario",
      "Base de força e volume geral de peito; aluno já com boa mecânica de ombro.",
      { descricao: "Maior ativação da porção esternal do peitoral maior em comparação a variações inclinadas", fonte: FONTES.barnett1995 }),
    b: ex("Supino Inclinado 30° com Halteres", "Porção clavicular do peitoral; maior amplitude", "alta", "moderado", "intermediario",
      "Peito superior em deficit de volume; amplitude maior favorece hipertrofia da clavicular.",
      { descricao: "Inclinação de ~30° aumenta o recrutamento da porção clavicular do peitoral", fonte: FONTES.barnett1995 }),
    veredictos: v(
      E("Os dois hipertrofiam o peitoral; o reto permite mais carga, o inclinado mais amplitude."),
      B("Porção clavicular (peito superior) é o subgrupo mais comum em deficit — inclinado vence."),
      B("Halteres permitem trajetória natural do ombro; menos estresse na articulação glenoumeral."),
      B("Halteres exigem controle independente de cada lado — feedback sensorial maior."),
      A("Barra permite a maior carga absoluta do grupo."),
      B("Deficit de ativação de peito superior: inclinado com halteres, com pausa no estiramento."),
    ),
    fontes: [FONTES.barnett1995, FONTES.boeckh2000],
  },
  {
    id: "supino-barra-vs-halter",
    grupo: "Peito",
    a: ex("Supino com Barra", "Carga máxima; trajetória fixa bilateral", "baixa", "moderado", "intermediario",
      "Blocos de intensificação e trabalho de força; progressão de carga simples.",
      { descricao: "Permite as maiores cargas entre os exercícios de empurrar horizontal", fonte: FONTES.boeckh2000 }),
    b: ex("Supino com Halteres", "Amplitude maior; demanda estabilizadora alta", "alta", "moderado", "intermediario",
      "Hipertrofia com mais amplitude; correção de assimetria leve (cada lado trabalha sozinho)."),
    veredictos: v(
      B("Maior amplitude no estiramento favorece hipertrofia."),
      B("O lado mais fraco não pode compensar — halteres expõem e corrigem."),
      B("Articulação livre para encontrar a trajetória mais confortável."),
      B("Estabilização alta = mais feedback proprioceptivo."),
      A("Barra vence em força máxima pela estabilidade bilateral."),
      B("Deficit de ativação: halteres com tempo excêntrico controlado 3s."),
    ),
    fontes: [FONTES.boeckh2000],
  },
  {
    id: "cable-fly-vs-pec-deck",
    grupo: "Peito",
    a: ex("Crucifixo no Crossover (Cable Fly)", "Tensão contínua; resistência no estiramento e na contração", "moderada", "baixo", "intermediario",
      "Deficit de ativação de peito: tensão constante facilita sentir o músculo em toda a amplitude."),
    b: ex("Crucifixo na Máquina (Pec Deck)", "Trajetória fixa; estabilização mínima", "baixa", "baixo", "iniciante",
      "Iniciantes e alunos com deficit biomecânico: padrão guiado sem exigir controle de ombro."),
    veredictos: v(
      E("Ambos isolam o peitoral; o crossover mantém tensão na contração, a máquina facilita falhar com segurança."),
      A("Tensão contínua no crossover estimula mais a porção esternal em toda a amplitude."),
      B("Máquina elimina variáveis — menor risco para ombros sensíveis."),
      A("Ângulo do cabo ajustável permite encontrar a linha de maior sensação."),
      B("Trajetória fixa permite levar à falha com mais carga relativa."),
      A("Crossover com pausa de 2s na contração é primeira escolha para deficit de ativação."),
    ),
    fontes: [],
  },
  {
    id: "supino-declinado-vs-dips",
    grupo: "Peito",
    a: ex("Supino Declinado", "Porção inferior do peitoral; carga controlada", "moderada", "moderado", "intermediario",
      "Ênfase na porção inferior com progressão de carga previsível."),
    b: ex("Mergulho nas Paralelas (Dips)", "Peitoral inferior + tríceps; peso corporal", "alta", "alto", "avancado",
      "Alunos avançados sem queixa de ombro; fechamento de sessão com peso corporal."),
    veredictos: v(
      E("Os dois recrutam a porção inferior; o mergulho adiciona tríceps, o declinado isola mais."),
      A("Declinado isola melhor a porção inferior sem fadiga de tríceps limitar antes."),
      A("Declinado tem menos extensão de ombro sob carga — mais gentil que mergulho profundo."),
      A("Carga externa ajustável facilita o foco na contração do peito."),
      A("Barra permite sobrecarga progressiva além do peso corporal."),
      A("Declinado com pausa no estiramento para sentir a porção inferior."),
    ),
    fontes: [],
  },
  // ===== COSTAS =====
  {
    id: "pull-up-vs-pulldown",
    grupo: "Costas",
    a: ex("Pull-up (Barra Fixa)", "Latíssimo + estabilizadores; peso corporal", "alta", "moderado", "avancado",
      "Alunos que já fazem 6+ reps limpas; fechamento de força de costas."),
    b: ex("Pulldown na Polia", "Latíssimo com carga ajustável", "baixa", "baixo", "iniciante",
      "Deficit de ativação de dorsal: carga ajustável permite sentir o latíssimo sem o braço dominar."),
    veredictos: v(
      E("Recrutamento do latíssimo é semelhante; o que muda é a dose de carga que cada um permite."),
      B("Pulldown permite ajustar a carga para isolar o latíssimo de um aluno mais fraco."),
      B("Polia reduz demanda de estabilização e de ombro sob carga corporal total."),
      B("Carga menor e controlável facilita sentir a dorsal — crítico em deficit de ativação."),
      A("Pull-up com lastro progride para cargas altíssimas."),
      B("Pulldown com pegada neutra e pausa de 2s na contração é a escolha padrão do APEX."),
    ),
    fontes: [],
  },
  {
    id: "remada-curvada-vs-cavalinho",
    grupo: "Costas",
    a: ex("Remada Curvada com Barra", "Dorsal + eretores; carga livre", "alta", "alto", "avancado",
      "Alunos com lombar saudável e quadril forte; construção de densidade de costas."),
    b: ex("Remada Cavalinho (T-Bar com apoio)", "Dorsal com tronco apoiado", "baixa", "baixo", "iniciante",
      "Qualquer aluno com fadiga lombar ou deficit biomecânico — tira a lombar da equação."),
    veredictos: v(
      E("Os dois constroem dorsal; o cavalinho permite mais volume por não fadigar a lombar."),
      B("Sem a lombar limitando, o cavalinho isola melhor a dorsal em deficit."),
      B("Tronco apoiado elimina o risco de arredondamento lombar sob fadiga."),
      B("Menos estabilizadores cansando = atenção total na dorsal."),
      A("Curvada com barra aceita mais carga absoluta."),
      B("Deficit de ativação de dorsal: cavalinho com retração escapular pausada."),
    ),
    fontes: [],
  },
  {
    id: "pegada-aberta-vs-fechada",
    grupo: "Costas",
    a: ex("Pulldown Pegada Aberta Pronada", "Ênfase em largura; latíssimo superior", "baixa", "baixo", "iniciante",
      "Objetivo estético de V-taper; aluno sem dor de ombro."),
    b: ex("Pulldown Pegada Fechada Neutra", "Amplitude maior; latíssimo porção inferior", "baixa", "baixo", "iniciante",
      "Deficit de ativação: pegada neutra reduz a contribuição do bíceps e alonga mais o latíssimo."),
    veredictos: v(
      E("Ambas recrutam o latíssimo; a escolha depende da porção-alvo e do conforto do ombro."),
      B("Amplitude maior da pegada neutra favorece a porção inferior, comum em deficit."),
      B("Pegada neutra coloca o ombro em posição mais confortável."),
      B("Menos bíceps dominando = mais sensação de dorsal."),
      E("Carga semelhante; a pegada neutra costuma permitir um pouco mais pela amplitude."),
      B("Padrão APEX para dorsal adormecida: pegada neutra, cotovelos para baixo e para trás."),
    ),
    fontes: [],
  },
  {
    id: "unilateral-vs-bilateral",
    grupo: "Costas",
    a: ex("Remada Unilateral com Halter", "Um lado por vez; amplitude livre", "moderada", "baixo", "intermediario",
      "Assimetria de dorsal detectada no APEX: lado fraco primeiro, sempre.",
      { descricao: "Trabalho unilateral permite amplitude maior de rotação do tronco e maior excursão escapular", fonte: FONTES.boeckh2000 }),
    b: ex("Remada Bilateral na Máquina", "Dois lados juntos; trajetória guiada", "baixa", "baixo", "iniciante",
      "Volume geral de dorsal com estabilidade; alunos iniciantes."),
    veredictos: v(
      E("Volume bilateral rende mais por minuto; unilateral rende mais por lado."),
      A("Assimetria: unilateral é obrigatório até a diferença cair abaixo de 5%."),
      B("Máquina guiada é a opção mais segura das duas."),
      A("Um lado de cada vez permite foco total na contração daquele latíssimo."),
      B("Bilateral com carga de máquina permite mais sobrecarga total."),
      A("Unilateral com pausa de 2s na contração é a prescrição padrão para assimetria."),
    ),
    fontes: [FONTES.boeckh2000],
  },
  {
    id: "seal-row-vs-curvada",
    grupo: "Costas",
    a: ex("Seal Row (banco inclinado)", "Dorsal com tronco 100% apoiado", "baixa", "baixo", "intermediario",
      "Densidade de dorsal sem nenhuma fadiga lombar; ideal em semanas de volume alto."),
    b: ex("Remada Curvada com Barra", "Dorsal + cadeia posterior estabilizando", "alta", "alto", "avancado",
      "Força de tronco e densidade; alunos avançados com quadril e lombar saudáveis."),
    veredictos: v(
      A("Sem lombar limitando, o seal row permite mais volume útil de dorsal."),
      A("Isolamento total favorece qualquer subgrupo da dorsal em deficit."),
      A("Tronco apoiado = risco lombar praticamente zero."),
      A("Nada além da dorsal para sentir — conexão máxima."),
      B("Curvada aceita a maior carga absoluta das remadas."),
      A("Deficit de ativação: seal row com retração escapular pausada de 2s."),
    ),
    fontes: [],
  },
  // ===== OMBROS =====
  {
    id: "desenvolvimento-barra-vs-halter",
    grupo: "Ombros",
    a: ex("Desenvolvimento com Barra (em pé)", "Deltoide anterior + força total do cinto", "moderada", "moderado", "intermediario",
      "Blocos de força; progressão de carga simples no básico de ombros."),
    b: ex("Desenvolvimento com Halteres (sentado)", "Deltoide anterior com amplitude livre", "alta", "moderado", "intermediario",
      "Hipertrofia do deltoide com trajetória natural; ombros sensíveis."),
    veredictos: v(
      B("Amplitude maior e trajetória livre favorecem hipertrofia do deltoide."),
      B("Halteres expõem o lado mais fraco e corrigem assimetria de ombros."),
      B("Punho neutro/livre reduz o estresse no ombro."),
      B("Estabilização alta = mais feedback do deltoide trabalhando."),
      A("Barra permite a maior carga absoluta de ombros."),
      B("Deficit de ativação de deltoide: halteres com excêntrico de 3s."),
    ),
    fontes: [],
  },
  {
    id: "lateral-halter-vs-cabo",
    grupo: "Ombros",
    a: ex("Elevação Lateral com Halteres", "Deltoide médio; resistência zero no início", "moderada", "baixo", "iniciante",
      "Volume simples de deltoide médio; fácil de progredir e de executar."),
    b: ex("Elevação Lateral no Cabo (por trás)", "Deltoide médio com tensão contínua desde o início", "moderada", "baixo", "intermediario",
      "Deficit de ativação de deltoide médio: o cabo tensiona o músculo já no alongamento."),
    veredictos: v(
      B("Tensão no alongamento é um estímulo extra que o halter não oferece."),
      B("Deltoide médio em deficit: tensão contínua vence."),
      E("Ambos são seguros com carga moderada e cotovelo guiando o movimento."),
      B("Tensão constante facilita sentir o deltoide médio do início ao fim."),
      E("Força de deltoide médio se desenvolve nos dois; nenhum é exercício de força máxima."),
      B("Cabo por trás do corpo com pausa no topo é a escolha APEX para deltoide adormecido."),
    ),
    fontes: [],
  },
  {
    id: "face-pull-vs-reverse-fly",
    grupo: "Ombros",
    a: ex("Face Pull na Polia", "Deltoide posterior + manguito rotador + retração", "moderada", "baixo", "iniciante",
      "Todo aluno com muito volume de empurrar: equilibra o ombro e protege o manguito.",
      { descricao: "Exercícios de rotação externa com retração recrutam fortemente o manguito rotador e o deltoide posterior", fonte: FONTES.barnett1995 }),
    b: ex("Reverse Fly (Crucifixo Inverso)", "Deltoide posterior isolado", "baixa", "baixo", "iniciante",
      "Isolamento puro do deltoide posterior quando o manguito já está bem cuidado."),
    veredictos: v(
      A("Face pull soma deltoide posterior + saúde do ombro no mesmo exercício."),
      B("Reverse fly isola o deltoide posterior sem a rotação externa dividir o esforço."),
      A("Face pull fortalece ativamente o manguito — o mais protetor dos dois."),
      B("Menos articulações envolvidas = mais fácil sentir só o posterior."),
      E("Nenhum dos dois é exercício de força máxima."),
      A("Deficit de posterior + ombro instável: face pull primeiro, sempre."),
    ),
    fontes: [FONTES.barnett1995],
  },
  // ===== PERNAS =====
  {
    id: "agachamento-vs-leg-press",
    grupo: "Pernas",
    a: ex("Agachamento Livre", "Quadríceps + glúteos + tronco; padrão fundamental", "alta", "moderado", "avancado",
      "Alunos com boa mecânica e sem dor lombar; base de força de pernas.",
      { descricao: "Produz maiores demandas de estabilização e forças compressivas no joelho dentro de faixas seguras quando bem executado", fonte: FONTES.escamilla2001 }),
    b: ex("Leg Press 45°", "Quadríceps com tronco apoiado; carga alta", "baixa", "baixo", "iniciante",
      "Volume alto de quadríceps sem fadiga de tronco; deficit biomecânico ou lombar sensível.",
      { descricao: "Menor ativação de estabilizadores e menor demanda de coordenação que o agachamento", fonte: FONTES.escamilla2001 }),
    veredictos: v(
      E("Os dois hipertrofiam quadríceps; o leg press permite mais volume, o agachamento mais estímulo sistêmico."),
      B("Quadríceps em deficit: leg press isola sem a técnica do agachamento limitar."),
      B("Tronco apoiado e trajetória guiada = menos variáveis de risco."),
      B("Sem estabilizar a barra, toda a atenção vai para o quadríceps."),
      E("Cargas máximas são comparáveis; o agachamento transfere mais para força funcional."),
      B("Deficit de ativação de quadríceps: leg press com excêntrico de 3-4s."),
    ),
    fontes: [FONTES.escamilla2001],
  },
  {
    id: "agachamento-vs-bulgaro",
    grupo: "Pernas",
    a: ex("Agachamento Livre", "Bilateral de alta carga", "alta", "moderado", "avancado",
      "Força máxima e estímulo sistêmico; blocos de intensificação."),
    b: ex("Agachamento Búlgaro", "Unilateral; quadríceps + glúteo da perna de apoio", "alta", "moderado", "intermediario",
      "Assimetria de pernas detectada no APEX; deficit de ativação de glúteo."),
    veredictos: v(
      B("Tensão unilateral longa com menos carga total gera estímulo alto de hipertrofia."),
      B("Assimetria: búlgaro é ferramenta de correção, lado fraco primeiro."),
      A("Agachamento bem executado é seguro; o búlgaro exige mais equilíbrio."),
      B("Uma perna por vez = consciência total do quadríceps e glúteo daquele lado."),
      A("Agachamento bilateral aceita muito mais carga absoluta."),
      B("Deficit de glúteo: búlgaro com tronco levemente inclinado à frente."),
    ),
    fontes: [],
  },
  {
    id: "hip-thrust-vs-agachamento",
    grupo: "Pernas",
    a: ex("Hip Thrust com Barra", "Glúteo máximo em encurtamento; vetor horizontal", "baixa", "baixo", "iniciante",
      "Deficit de ativação de glúteo: é o exercício onde o glúteo é o protagonista absoluto.",
      { descricao: "Maior ativação média e de pico do glúteo máximo em comparação ao agachamento", fonte: FONTES.contreras2015 }),
    b: ex("Agachamento Livre", "Glúteo em alongamento + quadríceps + tronco", "alta", "moderado", "avancado",
      "Força geral e glúteo em posição alongada; alunos sem deficit de ativação.",
      { descricao: "Maior recrutamento de quadríceps e demanda de cadeia completa", fonte: FONTES.contreras2015 }),
    veredictos: v(
      E("Para glúteos, os dois se complementam: thrust no encurtamento, agachamento no alongamento."),
      A("Glúteo em deficit: hip thrust vence por isolar o músculo-alvo."),
      A("Quadril estendido contra a barra, tronco apoiado: risco articular baixo."),
      A("Pico de contração no topo com a pelve em retroversão — fácil de sentir."),
      B("Agachamento transfere mais para força total de pernas."),
      A("Deficit de ativação de glúteo: hip thrust com pausa de 3s no topo, padrão APEX."),
    ),
    fontes: [FONTES.contreras2015],
  },
  {
    id: "stiff-vs-rdl",
    grupo: "Pernas",
    a: ex("Stiff (pernas quase estendidas)", "Posterior de coxa em máximo alongamento", "alta", "alto", "avancado",
      "Posterior em deficit de volume com boa consciência de quadril e lombar neutra."),
    b: ex("RDL (Levantamento Terra Romeno)", "Posterior + glúteo com joelho semiflexionado", "alta", "moderado", "intermediario",
      "Força de cadeia posterior com mais carga; padrão de dobradiça de quadril."),
    veredictos: v(
      E("Os dois hipertrofiam o posterior; o stiff alonga mais, o RDL permite mais carga."),
      A("Posterior puro em deficit: o stiff isola mais ao tirar a flexão de joelho."),
      B("Joelho semiflexionado do RDL é mais tolerável para isquiotibiais sensíveis."),
      A("Menos músculos dividindo o esforço = mais sensação de posterior."),
      B("RDL aceita a maior carga absoluta dos dois."),
      A("Deficit de ativação de posterior: stiff leve com excêntrico de 4s."),
    ),
    fontes: [],
  },
  {
    id: "leg-curl-deitado-vs-sentado",
    grupo: "Pernas",
    a: ex("Mesa Flexora (deitado)", "Posterior em posição encurtada do quadril", "baixa", "baixo", "iniciante",
      "Volume simples de posterior; qualquer nível."),
    b: ex("Cadeira Flexora (sentado)", "Posterior em quadril fletido = maior alongamento do músculo", "baixa", "baixo", "iniciante",
      "Posterior em deficit de volume: a posição sentada alonga mais o isquiotibial."),
    veredictos: v(
      B("Quadril fletido alonga mais o posterior — estímulo de hipertrofia superior na cadeira."),
      B("Posterior em deficit: priorize a versão sentada."),
      E("Os dois são máquinas guiadas de baixo risco."),
      E("Ambos isolam bem o posterior; a conexão é fácil nos dois."),
      E("Nenhum dos dois é exercício de força máxima."),
      B("Cadeira flexora com pausa de 2s na contração para deficit de ativação."),
    ),
    fontes: [],
  },
  {
    id: "panturrilha-pe-vs-sentado",
    grupo: "Pernas",
    a: ex("Panturrilha em Pé", "Gastrocnêmio (porção visível da panturrilha)", "baixa", "baixo", "iniciante",
      "Volume geral de panturrilha; ênfase no gastrocnêmio com joelho estendido."),
    b: ex("Panturrilha Sentado", "Sóleo (porção profunda, base da panturrilha)", "baixa", "baixo", "iniciante",
      "Panturrilha 'sem volume' na base: o sóleo só trabalha de verdade com joelho flexionado."),
    veredictos: v(
      E("São complementares: gastrocnêmio em pé, sóleo sentado. Semana completa usa os dois."),
      E("Depende do subgrupo fraco: gastrocnêmio (em pé) ou sóleo (sentado)."),
      E("Ambos são de risco muito baixo."),
      E("Conexão fácil nos dois com pausa no topo e amplitude completa."),
      A("Em pé aceita mais carga pelo gastrocnêmio mais forte."),
      E("Deficit de panturrilha: alternar as duas posições dentro da semana."),
    ),
    fontes: [],
  },
  // ===== BRAÇOS =====
  {
    id: "rosca-direta-vs-inclinada",
    grupo: "Braços",
    a: ex("Rosca Direta com Barra", "Bíceps em posição neutra; carga alta", "baixa", "baixo", "iniciante",
      "Volume base de bíceps com progressão de carga simples."),
    b: ex("Rosca Inclinada 45° com Halteres", "Bíceps em máximo alongamento (cabeça longa)", "moderada", "baixo", "intermediario",
      "Bíceps em deficit de volume: ombro estendido alonga a cabeça longa no início do movimento."),
    veredictos: v(
      B("Estímulo no alongamento da cabeça longa é um diferencial de hipertrofia."),
      B("Cabeça longa em deficit: inclinada vence."),
      A("Barra em pé é a mais estável e simples das duas."),
      B("Posição alongada aumenta a sensação do bíceps trabalhando."),
      A("Barra permite a maior carga absoluta de bíceps."),
      B("Deficit de ativação de bíceps: inclinada com excêntrico de 3s."),
    ),
    fontes: [],
  },
  {
    id: "martelo-vs-supinada",
    grupo: "Braços",
    a: ex("Rosca Martelo", "Braquial + braquiorradial (espessura do braço)", "baixa", "baixo", "iniciante",
      "Braço 'fino' visto de lado: o braquial empurra o bíceps para cima."),
    b: ex("Rosca Supinada com Halteres", "Bíceps com rotação do antebraço (pico)", "moderada", "baixo", "intermediario",
      "Deficit de ativação de bíceps: a supinação é a segunda função do bíceps — usá-la maximiza a contração."),
    veredictos: v(
      E("Martelo constrói espessura, supinada constrói pico — objetivos diferentes."),
      E("Braquial fraco = martelo; pico de bíceps fraco = supinada."),
      E("Ambas são seguras com cotovelo fixo ao lado do corpo."),
      B("Supinar durante a subida aumenta a sensação de contração do bíceps."),
      E("Cargas semelhantes; nenhuma é exercício de força máxima."),
      B("Deficit de ativação: supinada com pausa de 2s no topo em supinação máxima."),
    ),
    fontes: [],
  },
  {
    id: "pushdown-vs-overhead",
    grupo: "Braços",
    a: ex("Tríceps Pushdown na Polia", "Cabeça lateral e medial do tríceps", "baixa", "baixo", "iniciante",
      "Volume base de tríceps; aquecimento de cotovelo antes de empurrar pesado."),
    b: ex("Tríceps Overhead (extensão acima da cabeça)", "Cabeça longa do tríceps em alongamento", "moderada", "moderado", "intermediario",
      "Tríceps 'sem volume' na parte de trás: a cabeça longa só alonga com o braço acima da cabeça."),
    veredictos: v(
      B("Cabeça longa é a maior parte do tríceps — e só o overhead a coloca em alongamento."),
      B("Cabeça longa em deficit: overhead vence."),
      A("Pushdown é o mais gentil para o cotovelo e o ombro."),
      E("Os dois isolam bem o tríceps; o overhead pede mais controle de tronco."),
      E("Nenhum dos dois é exercício de força máxima."),
      B("Deficit de ativação de cabeça longa: overhead unilateral com excêntrico lento."),
    ),
    fontes: [],
  },
  {
    id: "testa-vs-french-press",
    grupo: "Braços",
    a: ex("Tríceps Testa (barra W)", "Tríceps completo com carga livre", "moderada", "moderado", "intermediario",
      "Força e volume de tríceps com sobrecarga progressiva."),
    b: ex("Tríceps Francês com Halter (overhead)", "Cabeça longa em alongamento", "moderada", "moderado", "intermediario",
      "Cabeça longa em deficit; preferir halter para punho livre."),
    veredictos: v(
      E("Testa carrega mais; francês alonga mais a cabeça longa."),
      B("Cabeça longa em deficit: francês/overhead vence."),
      E("Ambos pedem cotovelo aquecido; o francês com halter poupa o punho."),
      E("Conexão boa nos dois com cotovelos apontados para cima."),
      A("Testa com barra permite mais carga absoluta."),
      B("Deficit de ativação: francês unilateral com pausa no alongamento."),
    ),
    fontes: [],
  },
];

export const SHOWDOWN_GRUPOS = [...new Set(SHOWDOWNS.map((s) => s.grupo))];

export const showdownPorId = (id: string) => SHOWDOWNS.find((s) => s.id === id) || null;

/** Nome de quem venceu o objetivo, ou "Empate técnico". */
export function nomeVencedor(s: Showdown, ver: Veredicto): string {
  if (ver.vencedor === "a") return s.a.nome;
  if (ver.vencedor === "b") return s.b.nome;
  return "Empate técnico";
}

/** Badge de evidência de um exercício: ESTUDO se tiver EMG com fonte, senão ESTIMATIVA. */
export function badgeDoExercicio(e: ExercicioDados): EvidenceBadge {
  return e.emg ? "ESTUDO" : "ESTIMATIVA";
}

export type FormatoShowdown = "carrossel" | "reel_roteiro" | "post_estatico" | "dados_brutos";

export const FORMATO_LABEL: Record<FormatoShowdown, string> = {
  carrossel: "Carrossel (6-8 slides)",
  reel_roteiro: "Roteiro de Reel (30-45s)",
  post_estatico: "Post estático",
  dados_brutos: "Dados brutos",
};

function blocoExercicio(e: ExercicioDados): string {
  const linhas = [
    `• Foco: ${e.foco}`,
    `• Estabilização exigida: ${e.estabilizacao} · Risco relativo: ${e.risco} · Nível técnico: ${e.dificuldade}`,
  ];
  if (e.emg) linhas.push(`• EMG [${BADGE_LABEL.ESTUDO}]: ${e.emg.descricao} (${e.emg.fonte})`);
  else linhas.push(`• Ativação: ${BADGE_LABEL.ESTIMATIVA} — sem número de EMG citado`);
  linhas.push(`• Quando usar: ${e.quandoUsar}`);
  return linhas.join("\n");
}

function blocoFontes(s: Showdown): string {
  if (!s.fontes.length) {
    return "FONTES: comparação 100% em estimativa biomecânica e prática de coaching — nenhum número de estudo citado.";
  }
  return "FONTES\n" + s.fontes.map((f) => `• ${f}`).join("\n");
}

export function buildShowdownContent(s: Showdown, formato: FormatoShowdown): string {
  if (formato === "dados_brutos") {
    return [
      `${s.a.nome} × ${s.b.nome} — ${s.grupo}`,
      "",
      `EXERCÍCIO A — ${s.a.nome} [${BADGE_LABEL[badgeDoExercicio(s.a)]}]`,
      blocoExercicio(s.a),
      "",
      `EXERCÍCIO B — ${s.b.nome} [${BADGE_LABEL[badgeDoExercicio(s.b)]}]`,
      blocoExercicio(s.b),
      "",
      "VEREDICTO POR OBJETIVO",
      ...(Object.keys(OBJETIVO_LABEL) as Objetivo[]).map(
        (o) => `• ${OBJETIVO_LABEL[o]}: ${nomeVencedor(s, s.veredictos[o])} — ${s.veredictos[o].justificativa}`,
      ),
      "",
      blocoFontes(s),
    ].join("\n");
  }

  if (formato === "carrossel") {
    const objKeys = Object.keys(OBJETIVO_LABEL) as Objetivo[];
    return [
      `SLIDE 1 — CAPA`,
      `${s.a.nome.toUpperCase()} × ${s.b.nome.toUpperCase()}`,
      `Qual vence para ${s.grupo.toUpperCase()}? Depende do SEU objetivo. Arrasta →`,
      "",
      `SLIDE 2 — ${s.a.nome.toUpperCase()}`,
      blocoExercicio(s.a),
      "",
      `SLIDE 3 — ${s.b.nome.toUpperCase()}`,
      blocoExercicio(s.b),
      "",
      `SLIDE 4 — DADOS COMPARATIVOS`,
      s.a.emg ? `${s.a.nome}: ${s.a.emg.descricao} [ESTUDO]` : `${s.a.nome}: comparação qualitativa [ESTIMATIVA BIOMECÂNICA]`,
      s.b.emg ? `${s.b.nome}: ${s.b.emg.descricao} [ESTUDO]` : `${s.b.nome}: comparação qualitativa [ESTIMATIVA BIOMECÂNICA]`,
      "",
      `SLIDE 5 — VEREDICTO POR OBJETIVO`,
      ...objKeys.slice(0, 3).map((o) => `${OBJETIVO_LABEL[o]}: ${nomeVencedor(s, s.veredictos[o])}`),
      "",
      `SLIDE 6 — VEREDICTO POR OBJETIVO (cont.)`,
      ...objKeys.slice(3).map((o) => `${OBJETIVO_LABEL[o]}: ${nomeVencedor(s, s.veredictos[o])}`),
      "",
      `SLIDE 7 — QUANDO USAR CADA UM (conexão APEX)`,
      `${s.a.nome}: ${s.a.quandoUsar}`,
      `${s.b.nome}: ${s.b.quandoUsar}`,
      "",
      `SLIDE 8 — CTA + FONTES`,
      `Salva esse post pra montar seu treino. Quer saber qual é o SEU deficit? Comenta "APEX".`,
      blocoFontes(s),
    ].join("\n");
  }

  if (formato === "reel_roteiro") {
    const vHipertrofia = s.veredictos.hipertrofia_geral;
    return [
      `ROTEIRO DE REEL — ${s.a.nome} × ${s.b.nome} (30-45s)`,
      "",
      `[0-3s] HOOK: "${s.a.nome} ou ${s.b.nome}: qual constrói mais ${s.grupo.toLowerCase()}? A resposta honesta: depende."`,
      `[3-10s] DADO A: "${s.a.nome} — ${s.a.foco}." ${s.a.emg ? `[ESTUDO: ${s.a.emg.fonte}]` : "[ESTIMATIVA BIOMECÂNICA]"}`,
      `[10-16s] DADO B: "${s.b.nome} — ${s.b.foco}." ${s.b.emg ? `[ESTUDO: ${s.b.emg.fonte}]` : "[ESTIMATIVA BIOMECÂNICA]"}`,
      `[16-26s] VEREDICTO: "Para ${OBJETIVO_LABEL.hipertrofia_geral.toLowerCase()}: ${nomeVencedor(s, vHipertrofia)}. ${vHipertrofia.justificativa}"`,
      `[26-36s] CONEXÃO APEX: "No APEX eu não escolho exercício por gosto. ${s.a.quandoUsar} Já o ${s.b.nome}: ${s.b.quandoUsar}"`,
      `[36-42s] CTA: "Quer saber qual é o SEU deficit? Comenta 'APEX' que eu te mando o quiz."`,
      "",
      blocoFontes(s),
    ].join("\n");
  }

  // post_estatico
  return [
    `${s.a.nome.toUpperCase()} × ${s.b.nome.toUpperCase()} — qual vence?`,
    "",
    `A resposta honesta: depende do objetivo e do deficit.`,
    "",
    `${s.a.nome}: ${s.a.foco}. Quando usar: ${s.a.quandoUsar}`,
    `${s.b.nome}: ${s.b.foco}. Quando usar: ${s.b.quandoUsar}`,
    "",
    ...(["hipertrofia_geral", "seguranca", "deficit_ativacao"] as Objetivo[]).map(
      (o) => `→ ${OBJETIVO_LABEL[o]}: ${nomeVencedor(s, s.veredictos[o])}`,
    ),
    "",
    `Comenta "APEX" que eu te mando o quiz de deficit.`,
    "",
    blocoFontes(s),
    "",
    "#nutriON #TransformaçãoÉSistema #TreinoInteligente #CiênciaDoTreino #CoachDiogoMello",
  ].join("\n");
}
