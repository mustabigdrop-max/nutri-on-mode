// SOCIAL ON — Nível Surreal: dados estáticos

export const PHOTO_SUBJECTS = [
  { id: "shape", emoji: "💪", label: "Shape / Físico" },
  { id: "treino", emoji: "🏋️", label: "Treino / Exercício" },
  { id: "comida", emoji: "🍱", label: "Comida / Marmita" },
  { id: "familia", emoji: "👨‍👧", label: "Com a filha / Família" },
  { id: "lifestyle", emoji: "🧢", label: "Lifestyle / Roupa" },
  { id: "resultado", emoji: "📈", label: "Resultado de cliente" },
] as const;

export const QUICK_GOALS = [
  { id: "viralizar", emoji: "🚀", label: "Viralizar" },
  { id: "engajar", emoji: "💬", label: "Engajar" },
  { id: "vender", emoji: "💰", label: "Vender" },
] as const;

export const PHOTO_PRESETS = [
  { id: "original", label: "Original", sub: "crua" },
  { id: "fitness", label: "Fitness Grade", sub: "contraste +15 · saturação +10" },
  { id: "dark", label: "Dark Premium", sub: "paleta nutriON + vinheta" },
] as const;

export type BrandPillar = { key: string; emoji: string; label: string; hint: string };

export const BRAND_PILLARS: BrandPillar[] = [
  { key: "consistencia", emoji: "📊", label: "Consistência", hint: "Dias postados na semana" },
  { key: "mix", emoji: "🎯", label: "Mix de conteúdo", hint: "Equilíbrio entre os pilares" },
  { key: "copy", emoji: "✍️", label: "Qualidade de copy", hint: "Hook + CTA nos posts" },
  { key: "visual", emoji: "🎨", label: "Identidade visual", hint: "Padrão visual do feed" },
  { key: "conversao", emoji: "💰", label: "Conversão", hint: "DMs de venda recebidas" },
  { key: "engajamento", emoji: "🤝", label: "Engajamento", hint: "Comentários e shares" },
  { key: "crescimento", emoji: "📈", label: "Crescimento", hint: "Novos seguidores na semana" },
];

export const BRAND_LEVELS = [
  { min: 90, label: "REFERÊNCIA 🏆" },
  { min: 75, label: "AUTORIDADE 🔷" },
  { min: 60, label: "CRESCENDO 📈" },
  { min: 40, label: "CONSTRUINDO 🧱" },
  { min: 0, label: "COMEÇANDO 🌱" },
];

export const brandLevel = (score: number) =>
  BRAND_LEVELS.find((l) => score >= l.min)?.label ?? "COMEÇANDO 🌱";

export const PILLAR_ACTIONS: Record<string, { action: string; prompt: string }> = {
  consistencia: {
    action: "Fechar a semana com 5 posts: agenda 2 Reels, 1 carrossel e 2 fotos hoje mesmo.",
    prompt: "Post rápido para manter a consistência da semana",
  },
  mix: {
    action: "Postar 1 bastidor pessoal e 1 conteúdo de entretenimento — seus pilares mais fracos.",
    prompt: "Bastidor pessoal com humor leve sobre rotina de atleta e pai",
  },
  copy: {
    action: "Reescrever o hook dos 3 últimos posts usando número específico + negação.",
    prompt: "Post com hook de número específico e CTA forte de salvamento",
  },
  visual: {
    action: "Usar o template dark nutriON nos próximos 3 carrosséis pra criar padrão de feed.",
    prompt: "Carrossel educativo no template dark nutriON",
  },
  conversao: {
    action: "Postar 1 Story de venda com screen recording do nutriON + enquete Sim/Agora não.",
    prompt: "Story de venda com screen recording do nutriON e enquete",
  },
  engajamento: {
    action: "Publicar 1 post polêmico e responder todos os comentários na primeira hora.",
    prompt: "Post polêmico que questiona o senso comum do fitness",
  },
  crescimento: {
    action: "Fazer 1 Reel de trend com potencial de alcance frio (público que não te segue).",
    prompt: "Reel de trend fitness com alto potencial de alcance frio",
  },
};

export const AUTHORITY_CREDENTIALS = [
  "Atleta IFBB Classic Physique",
  "16 anos de Marinha do Brasil",
  "Nutrition Coach certificado",
  "Criador do Método MCE",
  "Fundador do nutriON",
];

export const CONTROVERSIES = [
  { text: "Disciplina não existe. Existe sistema.", base: "Wood & Neal (2007): 43% do comportamento diário é hábito automático, não decisão consciente." },
  { text: "Motivação é a maior mentira do fitness.", base: "Baumeister (1998): ego depletion — a força de vontade se esgota ao longo do dia." },
  { text: "Comer 'saudável' pode te fazer engordar.", base: "Chandon & Wansink (2007): halo effect leva a subestimar calorias de alimentos rotulados como saudáveis." },
  { text: "Cardio em jejum não queima mais gordura.", base: "Schoenfeld et al. (2014): sem diferença na perda de gordura quando as calorias são equiparadas." },
  { text: "Você não precisa de 6 refeições por dia.", base: "Schoenfeld & Aragon (2018): frequência alimentar tem efeito mínimo com proteína adequada." },
  { text: "Whey não é essencial. Comida é.", base: "Morton et al. (2018): o que importa é a proteína total diária (~1,6 g/kg), não a fonte." },
  { text: "Treinar todo dia é overtraining pra 90% das pessoas.", base: "Bell et al. (2020): recuperação insuficiente reduz síntese proteica e desempenho." },
  { text: "Abdômen não se faz na cozinha nem na academia. Se faz no comportamento.", base: "Dweck (2006): mindset de crescimento sustenta adesão a longo prazo." },
];

export type ScienceFact = {
  id: string;
  category: string;
  emoji: string;
  fact: string;
  source: string;
};

export const SCIENCE_CATEGORIES = [
  "Sono", "Treino", "Nutrição", "Comportamento", "Hormônios",
  "Hidratação", "Suplementação", "Psicologia", "Neurociência", "Metabolismo",
];

export const SCIENCE_FACTS: ScienceFact[] = [
  { id: "s1", category: "Sono", emoji: "💤", fact: "5h de sono por noite durante 1 semana reduz a testosterona em 10-15%.", source: "Leproult & Van Cauter, JAMA, 2011" },
  { id: "s2", category: "Sono", emoji: "💤", fact: "Cerca de 70% do GH diário é liberado durante o sono profundo (ondas delta).", source: "Van Cauter et al., Sleep Medicine, 2004" },
  { id: "s3", category: "Sono", emoji: "💤", fact: "Privação de sono aumenta grelina (~28%) e reduz leptina (~18%): mais fome, menos saciedade.", source: "Spiegel et al., Annals of Internal Medicine, 2004" },
  { id: "s4", category: "Sono", emoji: "💤", fact: "Dormir 5,5h em déficit calórico faz 55% da perda vir de massa magra.", source: "Nedeltcheva et al., Annals of Internal Medicine, 2010" },
  { id: "s5", category: "Sono", emoji: "💤", fact: "Extensão de sono melhora precisão e tempo de reação de atletas em até 9%.", source: "Mah et al., Sleep, 2011" },
  { id: "t1", category: "Treino", emoji: "🏋️", fact: "10+ séries semanais por grupamento maximizam hipertrofia em relação a volumes baixos.", source: "Schoenfeld et al., J Sports Sci, 2017" },
  { id: "t2", category: "Treino", emoji: "🏋️", fact: "Cargas de 30% a 80% de 1RM geram hipertrofia semelhante quando levadas próximo à falha.", source: "Morton et al., J Appl Physiol, 2016" },
  { id: "t3", category: "Treino", emoji: "🏋️", fact: "Descanso de 3 min entre séries aumenta ganhos de força e hipertrofia vs 1 min.", source: "Schoenfeld et al., JSCR, 2016" },
  { id: "t4", category: "Treino", emoji: "🏋️", fact: "Treinar cada músculo 2x por semana supera 1x com volume igual.", source: "Schoenfeld et al., Sports Medicine, 2016" },
  { id: "t5", category: "Treino", emoji: "🏋️", fact: "Amplitude completa gera mais hipertrofia que parciais na maioria dos exercícios.", source: "Pallarés et al., Scand J Med Sci Sports, 2021" },
  { id: "t6", category: "Treino", emoji: "🏋️", fact: "Deixar 1-3 repetições na reserva (RIR) mantém o estímulo e reduz fadiga acumulada.", source: "Zourdos et al., JSCR, 2016" },
  { id: "n1", category: "Nutrição", emoji: "🍚", fact: "1,6 g/kg/dia de proteína é o ponto onde ganhos adicionais em massa magra saturam.", source: "Morton et al., BJSM, 2018" },
  { id: "n2", category: "Nutrição", emoji: "🍚", fact: "Déficit de 0,5-1% do peso corporal por semana preserva massa magra em atletas.", source: "Garthe et al., IJSNEM, 2011" },
  { id: "n3", category: "Nutrição", emoji: "🍚", fact: "Proteína tem efeito térmico de 20-30% contra 5-10% dos carboidratos.", source: "Westerterp, Nutrition & Metabolism, 2004" },
  { id: "n4", category: "Nutrição", emoji: "🍚", fact: "Fibra acima de 25 g/dia aumenta saciedade e reduz ingestão calórica espontânea.", source: "Slavin, Nutrition, 2005" },
  { id: "n5", category: "Nutrição", emoji: "🍚", fact: "Comer proteína no café da manhã reduz beliscos noturnos de forma mensurável.", source: "Leidy et al., AJCN, 2013" },
  { id: "n6", category: "Nutrição", emoji: "🍚", fact: "Alimentos ultraprocessados levam a +500 kcal/dia espontâneas com mesma oferta de macros.", source: "Hall et al., Cell Metabolism, 2019" },
  { id: "c1", category: "Comportamento", emoji: "🧭", fact: "43% dos comportamentos diários são hábitos automáticos, não decisões conscientes.", source: "Wood & Neal, Psychological Review, 2007" },
  { id: "c2", category: "Comportamento", emoji: "🧭", fact: "Formar um hábito leva em média 66 dias, não 21.", source: "Lally et al., Eur J Social Psychology, 2010" },
  { id: "c3", category: "Comportamento", emoji: "🧭", fact: "Intenções de implementação (se X, então Y) dobram a adesão a metas.", source: "Gollwitzer & Sheeran, Adv Exp Soc Psych, 2006" },
  { id: "c4", category: "Comportamento", emoji: "🧭", fact: "Automonitoramento é o preditor mais forte de manutenção de peso a longo prazo.", source: "Burke et al., J Am Diet Assoc, 2011" },
  { id: "c5", category: "Comportamento", emoji: "🧭", fact: "Ambiente alimentar visível aumenta consumo em até 70% (efeito proximidade).", source: "Wansink et al., Environment & Behavior, 2006" },
  { id: "h1", category: "Hormônios", emoji: "⚗️", fact: "Déficit agressivo reduz T3 e leptina, sinalizando adaptação metabólica.", source: "Rosenbaum & Leibel, Int J Obesity, 2010" },
  { id: "h2", category: "Hormônios", emoji: "⚗️", fact: "Cortisol cronicamente elevado favorece acúmulo de gordura visceral.", source: "Epel et al., Psychosomatic Medicine, 2000" },
  { id: "h3", category: "Hormônios", emoji: "⚗️", fact: "Treino de força eleva testosterona e GH de forma aguda, mas o ganho vem do estímulo local.", source: "West & Phillips, Eur J Appl Physiol, 2012" },
  { id: "h4", category: "Hormônios", emoji: "⚗️", fact: "Baixa disponibilidade energética suprime função reprodutiva em mulheres atletas (RED-S).", source: "Mountjoy et al., BJSM, 2018" },
  { id: "i1", category: "Hidratação", emoji: "💧", fact: "Desidratação de 2% do peso corporal reduz desempenho de força e foco.", source: "Judelson et al., Sports Medicine, 2007" },
  { id: "i2", category: "Hidratação", emoji: "💧", fact: "Beber 500 ml de água antes das refeições aumenta a perda de peso em 12 semanas.", source: "Dennis et al., Obesity, 2010" },
  { id: "i3", category: "Hidratação", emoji: "💧", fact: "Sede é um marcador tardio: a queda de performance começa antes dela.", source: "Cheuvront & Kenefick, Compr Physiol, 2014" },
  { id: "u1", category: "Suplementação", emoji: "💊", fact: "Creatina monoidratada aumenta força em ~8% e repetições em ~14%.", source: "Rawson & Volek, JSCR, 2003" },
  { id: "u2", category: "Suplementação", emoji: "💊", fact: "Cafeína 3-6 mg/kg melhora desempenho de força e resistência de forma consistente.", source: "Grgic et al., BJSM, 2020" },
  { id: "u3", category: "Suplementação", emoji: "💊", fact: "Beta-alanina melhora desempenho em esforços de 1-4 minutos.", source: "Saunders et al., BJSM, 2017" },
  { id: "u4", category: "Suplementação", emoji: "💊", fact: "Creatina também melhora memória de trabalho e reduz fadiga mental.", source: "Avgerinos et al., Exp Gerontology, 2018" },
  { id: "u5", category: "Suplementação", emoji: "💊", fact: "Ômega-3 aumenta a resposta anabólica à proteína em adultos.", source: "Smith et al., Clinical Science, 2011" },
  { id: "p1", category: "Psicologia", emoji: "🧠", fact: "Mindset de crescimento aumenta persistência diante de falhas.", source: "Dweck, Mindset, 2006" },
  { id: "p2", category: "Psicologia", emoji: "🧠", fact: "Autoeficácia é o melhor preditor de adesão a programas de exercício.", source: "Bandura, Psychological Review, 1977" },
  { id: "p3", category: "Psicologia", emoji: "🧠", fact: "Metas de processo superam metas de resultado em manutenção do comportamento.", source: "Locke & Latham, American Psychologist, 2002" },
  { id: "p4", category: "Psicologia", emoji: "🧠", fact: "Autocompaixão após deslizes reduz a chance de abandono da dieta.", source: "Adams & Leary, J Social & Clinical Psych, 2007" },
  { id: "p5", category: "Psicologia", emoji: "🧠", fact: "Perfeccionismo alimentar prediz episódios de compulsão.", source: "Bardone-Cone et al., Clinical Psych Review, 2007" },
  { id: "e1", category: "Neurociência", emoji: "⚡", fact: "Dopamina sinaliza antecipação da recompensa, não a recompensa em si.", source: "Schultz, Neuron, 2015" },
  { id: "e2", category: "Neurociência", emoji: "⚡", fact: "Exercício aeróbico aumenta BDNF e neurogênese no hipocampo.", source: "Cotman & Berchtold, Trends in Neurosciences, 2002" },
  { id: "e3", category: "Neurociência", emoji: "⚡", fact: "Decisões consecutivas degradam a qualidade da escolha (decision fatigue).", source: "Danziger et al., PNAS, 2011" },
  { id: "e4", category: "Neurociência", emoji: "⚡", fact: "Estresse crônico reduz volume do córtex pré-frontal, área do autocontrole.", source: "Arnsten, Nature Reviews Neuroscience, 2009" },
  { id: "m1", category: "Metabolismo", emoji: "🔥", fact: "NEAT pode variar até 2.000 kcal/dia entre indivíduos.", source: "Levine et al., Science, 1999" },
  { id: "m2", category: "Metabolismo", emoji: "🔥", fact: "Adaptação metabólica reduz o gasto além do previsto pela perda de massa.", source: "Rosenbaum et al., AJCN, 2008" },
  { id: "m3", category: "Metabolismo", emoji: "🔥", fact: "Massa magra é o maior determinante da taxa metabólica basal.", source: "Cunningham, AJCN, 1991" },
  { id: "m4", category: "Metabolismo", emoji: "🔥", fact: "Refeed de carboidrato eleva leptina de forma aguda em déficit prolongado.", source: "Dirlewanger et al., Int J Obesity, 2000" },
  { id: "m5", category: "Metabolismo", emoji: "🔥", fact: "Perda de peso rápida em atletas custa mais massa magra que perda gradual.", source: "Garthe et al., IJSNEM, 2011" },
  { id: "m6", category: "Metabolismo", emoji: "🔥", fact: "O gasto total ajusta-se ao treino: mais exercício não soma linearmente calorias.", source: "Pontzer et al., Current Biology, 2016" },
  { id: "t7", category: "Treino", emoji: "🏋️", fact: "Aquecimento específico melhora desempenho na primeira série de trabalho.", source: "Ribeiro et al., JSCR, 2020" },
  { id: "n7", category: "Nutrição", emoji: "🍚", fact: "Distribuir 0,4 g/kg de proteína por refeição, 4x ao dia, maximiza síntese proteica.", source: "Schoenfeld & Aragon, JISSN, 2018" },
];

// ── Melhorias finais ──
export const CAPTION_TONES = [
  { id: "direto", emoji: "🔥", label: "Direto agressivo", brief: "Frases curtas, confronto direto, zero rodeio. Provoca e resolve." },
  { id: "cientifico", emoji: "🧠", label: "Científico com dados", brief: "Traz o dado de forma simples, sem citação acadêmica formal." },
  { id: "pessoal", emoji: "❤️", label: "Pessoal / história", brief: "Abre com uma cena real do dia do coach e conecta com o ensinamento." },
  { id: "humor", emoji: "😂", label: "Humor", brief: "Ironia leve sobre a rotina fitness, sem perder autoridade." },
  { id: "militar", emoji: "⚓", label: "Militar", brief: "Disciplina, ordem, missão. Vocabulário de Marinha aplicado ao shape." },
  { id: "pai", emoji: "👨‍👧", label: "Pai", brief: "Perspectiva de pai: saúde como legado, força pra estar presente." },
] as const;

export const CAROUSEL_STYLES = [
  { id: "dark_authority", label: "DARK AUTHORITY", sub: "Científico · linhas finas · autoridade" },
  { id: "bold_impact", label: "BOLD IMPACT", sub: "Palavras em caixas · alto contraste" },
  { id: "minimal_clean", label: "MINIMAL CLEAN", sub: "Espaço vazio · sofisticado · premium" },
] as const;

export type CarouselStyleId = (typeof CAROUSEL_STYLES)[number]["id"];
