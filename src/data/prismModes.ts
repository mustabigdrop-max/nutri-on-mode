// PRISM — 8 modos do hub de conteúdo

export type PrismMode =
  | "post_pronto"
  | "viral_trend"
  | "reels"
  | "vender"
  | "representatividade"
  | "lifestyle_pai"
  | "pack_semanal"
  | "ia_decide";

export type PrismSubtype = { id: string; emoji: string; label: string; hint?: string };

export type PrismModeDef = {
  id: PrismMode;
  emoji: string;
  label: string;
  desc: string;
  color: string;
  subtypes: PrismSubtype[];
  subtypeTitle?: string;
  needsFiles?: boolean;
};

export const PRISM_MODES: PrismModeDef[] = [
  {
    id: "post_pronto",
    emoji: "📸",
    label: "Post Pronto",
    desc: "Sobe foto/vídeo e gera o pacote completo",
    color: "#00D4FF",
    subtypes: [],
    needsFiles: true,
  },
  {
    id: "viral_trend",
    emoji: "🔥",
    label: "Viral / Trend",
    desc: "Conteúdo pra viralizar e ganhar seguidores (TOFU)",
    color: "#FF4D6D",
    subtypeTitle: "Que tipo de viral?",
    subtypes: [
      { id: "pov", emoji: "👁️", label: "POV", hint: "texto na batida" },
      { id: "edit", emoji: "✂️", label: "Edit Transição", hint: "sequência de fotos" },
      { id: "fisheye", emoji: "🐟", label: "Fisheye", hint: "lente wide + bold" },
      { id: "polemica", emoji: "💬", label: "Polêmica / Opinião", hint: "5 temas" },
      { id: "trend_musical", emoji: "🎵", label: "Trend Musical", hint: "áudio em alta" },
      { id: "antes_depois", emoji: "🤯", label: "Antes / Depois", hint: "transformação" },
    ],
  },
  {
    id: "reels",
    emoji: "🎬",
    label: "Reels",
    desc: "Roteiros de Reel por tipo de gravação",
    color: "#A855F7",
    subtypeTitle: "Tipo de Reel",
    subtypes: [
      { id: "talking_head", emoji: "🗣️", label: "Talking head" },
      { id: "edit", emoji: "✂️", label: "Edit Fotos" },
      { id: "pov", emoji: "👁️", label: "POV Fisheye" },
      { id: "screen_recording", emoji: "📱", label: "Screen Recording" },
      { id: "timelapse", emoji: "⏩", label: "Timelapse" },
      { id: "treino", emoji: "💪", label: "Treino Clips" },
      { id: "meal_prep", emoji: "🍳", label: "Meal Prep" },
      { id: "corrida", emoji: "🏃", label: "Corrida Outdoor" },
    ],
  },
  {
    id: "vender",
    emoji: "💰",
    label: "Vender",
    desc: "Conteúdo focado em conversão",
    color: "#00FF88",
    subtypeTitle: "O que vender?",
    subtypes: [
      { id: "nutrion", emoji: "📱", label: "nutriON", hint: "plataforma" },
      { id: "mindforce", emoji: "💊", label: "MindForce", hint: "creatina" },
      { id: "vemp", emoji: "👕", label: "VEMP", hint: "roupa" },
      { id: "consultoria", emoji: "🏋️", label: "Consultoria", hint: "R$ 247/mês" },
    ],
  },
  {
    id: "representatividade",
    emoji: "✊",
    label: "Representatividade",
    desc: "Identidade negra com orgulho e autenticidade",
    color: "#E8A020",
    subtypeTitle: "Tipo de conteúdo",
    subtypes: [
      { id: "icones", emoji: "🏆", label: "Ícones Negros" },
      { id: "pai_negro", emoji: "👨‍👧", label: "Pai Negro" },
      { id: "shape_negro", emoji: "💪", label: "Shape Negro" },
      { id: "musica", emoji: "🎵", label: "Música / Dança" },
      { id: "historia", emoji: "📖", label: "História Real" },
      { id: "trending_black", emoji: "🔥", label: "Trending Black" },
    ],
  },
  {
    id: "lifestyle_pai",
    emoji: "👨‍👧",
    label: "Lifestyle / Pai",
    desc: "Rotina real, família e bastidor",
    color: "#A78BFA",
    subtypeTitle: "Momento",
    subtypes: [
      { id: "filha", emoji: "👨‍👧", label: "Com a filha" },
      { id: "rotina", emoji: "🏠", label: "Rotina Real" },
      { id: "comida", emoji: "🍳", label: "Comida / Cozinha" },
      { id: "manha_noite", emoji: "💤", label: "Manhã / Noite" },
      { id: "bastidor", emoji: "☕", label: "Bastidor" },
      { id: "vemp_outfit", emoji: "👕", label: "VEMP Outfit" },
    ],
  },
  {
    id: "pack_semanal",
    emoji: "📦",
    label: "Pack Semanal",
    desc: "7 dias de conteúdo de uma vez",
    color: "#00D4FF",
    subtypes: [],
  },
  {
    id: "ia_decide",
    emoji: "⚡",
    label: "FLASH",
    desc: "Sobe o material. O PRISM faz tudo.",
    color: "#FFB020",
    subtypes: [],
    needsFiles: true,
  },
];

export const modeById = (id: string) => PRISM_MODES.find((m) => m.id === id);

export const SALE_LEVELS = [
  { id: "invisivel", emoji: "🫣", label: "Invisível", hint: "product placement" },
  { id: "suave", emoji: "🎯", label: "Suave", hint: "menção natural" },
  { id: "direto", emoji: "🔥", label: "Direto", hint: "CTA explícito" },
] as const;

export const PRISM_TONES = [
  { id: "direto", emoji: "🔥", label: "Direto" },
  { id: "cientifico", emoji: "🧠", label: "Ciência" },
  { id: "pessoal", emoji: "❤️", label: "Pessoal" },
  { id: "humor", emoji: "😂", label: "Humor" },
  { id: "militar", emoji: "⚓", label: "Militar" },
  { id: "pai", emoji: "👨‍👧", label: "Pai" },
] as const;

export const PRISM_OBJECTIVES = [
  { id: "seguidores", emoji: "👥", label: "Seguidores" },
  { id: "engajar", emoji: "💬", label: "Engajar" },
  { id: "vender", emoji: "💰", label: "Vender" },
] as const;

export const PACK_PRODUCTS = [
  { id: "nutrion", label: "nutriON" },
  { id: "mindforce", label: "MindForce" },
  { id: "vemp", label: "VEMP" },
  { id: "consultoria", label: "Consultoria" },
] as const;
