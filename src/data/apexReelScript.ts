// Roteiro de Reel — APEX Visual Intelligence (voz do Coach Diogo Mello)

export interface ReelBeat {
  time: string;
  onScreen: string;
  speech: string;
  broll: string;
}

export const APEX_REEL_TITLE = "Como eu analiso meus atletas";

export const APEX_REEL_BEATS: ReelBeat[] = [
  {
    time: "0-3s",
    onScreen: "ISSO NÃO É ACHISMO.",
    speech: "Fala, aqui é o Diogo Mello. Você acha que analisar um shape é olhar e opinar? Não é.",
    broll: "Close no rosto, corte seco na foto do atleta abrindo no app.",
  },
  {
    time: "3-10s",
    onScreen: "3 FOTOS → 47 PONTOS",
    speech: "São três fotos: frente, costas e lateral. O sistema mapeia 47 pontos anatômicos em segundos.",
    broll: "Tela do APEX com os landmarks aparecendo sobre a foto.",
  },
  {
    time: "10-20s",
    onScreen: "DESVIOS + SCORES",
    speech:
      "Aí sai o que ninguém vê no espelho: inclinação pélvica, assimetria de ombro, rotação de escápula. Cada segmento recebe um score de 0 a 10.",
    broll: "Zoom nos cards de desvios e nas barras de score subindo.",
  },
  {
    time: "20-30s",
    onScreen: "DIAGNÓSTICO → PROTOCOLO",
    speech:
      "E o diagnóstico não morre no relatório: ele vira treino corretivo e ajuste de plano alimentar automaticamente.",
    broll: "Transição do APEX para o TrainingON com o protocolo gerado.",
  },
  {
    time: "30-40s",
    onScreen: "TRANSFORMAÇÃO É SISTEMA.",
    speech:
      "Enquanto o mercado dá palpite, a gente mede. Transformação é sistema. Comenta APEX que eu te mando como funciona.",
    broll: "Card final com o relatório visual gerado + logo nutriON.",
  },
];

export const APEX_REEL_CAPTION = `Transformação é sistema. 🔬

3 fotos. 47 pontos anatômicos. Scores por segmento, desvios posturais e um protocolo corretivo que já nasce dentro do treino e do plano alimentar.

Isso é o APEX Visual Intelligence dentro do nutriON.

Comenta APEX que eu te mostro como funciona na prática.

@diogo.mell0 · nutrion.app.br
#nutricaoesportiva #coaching #transformacao #apex`;

export const APEX_REEL_HASHTAGS = [
  "#nutricaoesportiva",
  "#nutricaoinsportiva",
  "#coachingdeperformance",
  "#transformacaoesistema",
  "#apexintelligence",
];

export const apexReelScriptText = () =>
  [
    `ROTEIRO REEL — ${APEX_REEL_TITLE}`,
    "",
    ...APEX_REEL_BEATS.map(
      (b) => `[${b.time}] TELA: ${b.onScreen}\nFALA: ${b.speech}\nB-ROLL: ${b.broll}\n`,
    ),
    "LEGENDA:",
    APEX_REEL_CAPTION,
  ].join("\n");
