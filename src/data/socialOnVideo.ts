// SOCIAL ON — tipos de vídeo e dicas de edição por formato

export type VideoType = {
  id: string;
  emoji: string;
  label: string;
  sub: string;
  tips: string[];
};

export const VIDEO_TYPES: VideoType[] = [
  {
    id: "talking_head",
    emoji: "🗣️",
    label: "Talking head",
    sub: "você falando na câmera",
    tips: [
      "Legendas automáticas (Auto Captions no CapCut) — 85% assiste sem som",
      "Zoom digital sutil a cada 5-7s pra manter atenção",
      "Cortar todas as pausas e respiros (jump cut agressivo)",
      "Olhar fixo na lente, não no próprio rosto na tela",
    ],
  },
  {
    id: "edit_trend",
    emoji: "✂️",
    label: "Edit / Trend",
    sub: "cortes rápidos + áudio em alta",
    tips: [
      "Sincronizar cada corte com a batida da música",
      "Transições rápidas (whip pan, flash, zoom punch)",
      "Texto na tela em todos os frames — o vídeo tem que ser lido",
      "Máximo 15s: trend curta roda mais no explorar",
    ],
  },
  {
    id: "pov",
    emoji: "👁️",
    label: "POV",
    sub: "câmera subjetiva",
    tips: [
      "Câmera na mão / no peito, ponto de vista em primeira pessoa",
      "Sem legendas — o texto na tela conta a história",
      "Música trend em alta, volume alto na mixagem",
      "Uma única ideia por vídeo (rotina 4:30am, dia de treino, meal prep)",
    ],
  },
  {
    id: "clips_treino",
    emoji: "💪",
    label: "Clips treino",
    sub: "execução e força",
    tips: [
      "Slow motion nas reps mais pesadas (0.4x-0.5x)",
      "Fisheye ou grande angular pra dar volume ao shape",
      "Ângulo de baixo pra cima (low angle) = dominância visual",
      "Cortar entre 2-3 ângulos do mesmo exercício",
    ],
  },
  {
    id: "timelapse",
    emoji: "⏩",
    label: "Timelapse",
    sub: "meal prep, preparo, rotina",
    tips: [
      "Velocidade 4x a 8x, tripé fixo (nunca na mão)",
      "Texto overlay explicando cada etapa",
      "Música calma no início → energética no final",
      "Fechar com o resultado pronto em velocidade normal",
    ],
  },
  {
    id: "screen_rec",
    emoji: "📱",
    label: "Screen recording",
    sub: "tour no app, demonstração",
    tips: [
      "Voiceover gravado depois, com áudio limpo",
      "Zoom nas áreas importantes da tela (não confie no olho do viewer)",
      "Setas e destaques pra guiar o olhar",
      "Mostrar o resultado nos primeiros 2s, explicar depois",
    ],
  },
];

export const videoTypeById = (id: string) => VIDEO_TYPES.find((v) => v.id === id);

export const MAX_VIDEO_MB = 100;
export const MAX_VIDEO_SECONDS = 60;
