/**
 * Pacote de conteúdo pronto pra postar — roteiro do Coach Diogo Mello.
 * Fica salvo no Social ON pra ser copiado e postado sem precisar reescrever.
 */

export type PackBlock = { label: string; text: string };

export type PackPost = {
  id: string;
  title: string;
  format: string;
  bestTime: string;
  goal?: string;
  hooks?: PackBlock[];
  slides?: PackBlock[];
  caption: string;
  hashtags: string;
  onScreen?: PackBlock[];
  stories?: PackBlock[];
};

export const CONTENT_PACK_POSTS: PackPost[] = [
  {
    id: "reels_vsquat",
    title: "Reels V-Squat Breakdown",
    format: "Reels 30-45s (vídeo do Breakdown Studio)",
    bestTime: "12-13h ou 18-19h",
    hooks: [
      { label: "Opção A · Polêmico", text: "Seu personal te botou no V-Squat sem nem olhar se seu quadril permite?" },
      { label: "Opção B · Educativo", text: "A diferença entre fazer V-Squat e PRESCREVER V-Squat" },
      { label: "Opção C · Direto", text: "Tá fazendo V-Squat assim? Para e assiste." },
    ],
    caption: `Tá fazendo V-Squat? Então presta atenção.

A maioria entra na máquina, bota peso e empurra. Sem saber se a posição dos pés está ativando glúteo ou sobrecarregando o joelho. Sem saber se tem um desvio de quadril que muda completamente como o exercício deveria ser feito.

E o pior: provavelmente ninguém avaliou sua postura antes de te colocar ali.

O V-Squat é um dos melhores exercícios pra quadríceps e glúteos — mas só quando é PRESCRITO pro seu corpo. Não copiado de uma ficha genérica.

Antes de qualquer treino, o corpo precisa ser avaliado:
→ Postura
→ Assimetrias
→ Desvios articulares
→ Padrão de movimento

Depois disso, a prescrição muda. A posição dos pés muda. O volume muda. As prioridades mudam. Tudo muda.

Isso é o que separa treino de exercício.
Isso é o que separa protocolo de achismo.

Transformação é sistema. 🎯

Quer saber onde seu corpo está travando?
Diagnóstico gratuito no link da bio 👆`,
    hashtags:
      "#vsquat #agachamento #treino #treinointeligente #musculação #legday #quadriceps #gluteos #avaliacaopostural #treinopersonalizado #educacaofisica #personaltrainer #metodomce #nutrion #fitnessbrasileiro #treinofuncional #hipertrofia #periodizacao #biomecânica #coachdiogomello",
    onScreen: [
      { label: "Corte 1", text: "V-SQUAT" },
      { label: "Corte 2", text: "NINGUÉM AVALIOU SEU CORPO" },
      { label: "Corte 3", text: "PÉS ERRADOS = JOELHO DESTRUÍDO" },
      { label: "Corte 4", text: "PRESCRIÇÃO ≠ FICHA GENÉRICA" },
      { label: "Corte 5", text: "DIAGNÓSTICO GRATUITO — BIO" },
    ],
    stories: [
      {
        label: "Story 1 · Enquete",
        text: "Seu personal avaliou sua postura antes de montar seu treino?\n☐ SIM  ☐ NÃO",
      },
      {
        label: "Story 2 · Revelação",
        text: "Se a resposta foi NÃO, seu treino pode estar reforçando problemas em vez de corrigi-los.",
      },
      { label: "Story 3 · Caixa de perguntas", text: "Manda aqui o exercício que você tem dúvida na execução 👇" },
      {
        label: "Story 4 · CTA",
        text: "Quer saber onde seu corpo está travando? Diagnóstico MCE gratuito — link na bio ☝️",
      },
    ],
  },
  {
    id: "carrossel_mce",
    title: "Carrossel MCE Educacional",
    format: "Carrossel 7 slides",
    bestTime: "Dia seguinte, 12-13h",
    goal: "Educar sobre o MCE e gerar salvamento",
    slides: [
      {
        label: "Slide 1 · Gancho",
        text: `"Eu sei o que fazer,
mas não consigo manter."

Se essa frase é sua,
leia até o final. 👇`,
      },
      {
        label: "Slide 2 · O problema",
        text: `O mercado fitness te vende DIETA e TREINO.

Mas ninguém fala das outras 22 horas do dia
— onde a transformação realmente acontece
ou morre.

O problema nunca foi informação.
O problema é PADRÃO.`,
      },
      {
        label: "Slide 3 · Pilar M",
        text: `🧠 MENTALIDADE

"Vou recomeçar na segunda."

Essa frase é a prova de que seu sistema
mental está travado. Você trata
transformação como EVENTO
(dieta de 30 dias) em vez de IDENTIDADE
(sou uma pessoa que treina).

Quando treinar vira quem você É,
a consistência para de custar.`,
      },
      {
        label: "Slide 4 · Pilar C",
        text: `⚡ COMPORTAMENTO

"Durante a semana eu consigo,
mas no final de semana..."

Seu ambiente controla seu
comportamento mais que sua vontade.

Comida preparada > decidir com fome.
Roupa separada > lembrar de manhã.
Celular fora do quarto > resistir à vontade.

O comportamento vem antes do alimento.`,
      },
      {
        label: "Slide 5 · Pilar E",
        text: `🎯 EXECUÇÃO

"Eu treino, como bem,
mas meu corpo não muda."

Sem registro, sem avaliação, sem dado.
Cada semana é uma repetição cega
da anterior.

Treinar sem medir é dirigir sem GPS.
Comer "saudável" sem contar é
orçamento sem planilha.

Execução inteligente: avaliar → prescrever
→ registrar → medir → ajustar.`,
      },
      {
        label: "Slide 6 · A integração",
        text: `MCE não é fitness.
É SISTEMA OPERACIONAL DE VIDA.

O padrão que trava seu treino
é o MESMO que trava seu trabalho,
seus relacionamentos
e suas finanças.

Quando os 3 pilares funcionam juntos,
o resultado é inevitável.

Não só no corpo — na vida inteira.`,
      },
      {
        label: "Slide 7 · CTA",
        text: `Quer saber qual pilar
está te travando?

Diagnóstico MCE gratuito
Link na bio 👆

14 perguntas. 4 minutos.
Resultado imediato.

Transformação é sistema. 🎯

@diogo.mell0`,
      },
    ],
    caption: `O método que mudou tudo.

Eu passei anos achando que o problema era dieta. Treino. Suplemento. Informação.

Até entender que nada disso funciona sem os 3 pilares rodando juntos.

🧠 Mentalidade — como você PENSA sobre o processo
⚡ Comportamento — como você AGE no dia a dia
🎯 Execução — o que você FAZ de concreto

Quando um falha, os outros desmoronam. Não importa quão boa seja a dieta.

O MCE não é mais um método fitness. É o sistema que integra treino, alimentação e VIDA num protocolo que funciona — porque ataca o padrão, não o sintoma.

Salva esse post ← vai precisar reler.

Quer descobrir qual pilar te trava? Link na bio — diagnóstico gratuito em 4 minutos.`,
    hashtags:
      "#metodomce #transformacao #mentalidade #comportamento #execucao #mindset #habitossaudaveis #mudancadevida #coachingdevida #nutrion #treinointeligente #desenvolvimentopessoal #disciplina #consistencia #sistemadevida #fitnessbrasileiro #saude #bemestar #motivacao #processodetransformacao",
  },
];

export const CONTENT_PACK_SCHEDULE: { day: string; items: string[] }[] = [
  {
    day: "Hoje",
    items: [
      "12-13h → Reels V-Squat Breakdown",
      "Logo após → 4 Stories (enquete + revelação + caixa + CTA)",
    ],
  },
  {
    day: "Amanhã",
    items: [
      "12-13h → Carrossel MCE “Eu sei o que fazer mas não consigo”",
      "Stories → compartilhar o carrossel + enquete “Qual pilar te trava?”",
    ],
  },
  {
    day: "Depois de amanhã",
    items: [
      "18-19h → Reels React Coach (reagir a algum vídeo de exercício)",
      "Stories → MCE do Dia (pilar do dia + enquete)",
    ],
  },
];

export const CONTENT_PACK_RULES: string[] = [
  "Nos primeiros 60 minutos após postar: responda TODOS os comentários",
  "Se alguém comentar marcando amigo: curta o comentário e responda os dois",
  "Nos stories: responda toda enquete e toda pergunta — gera DM e puxa alcance",
  "Reposte qualquer pessoa que compartilhar seu conteúdo",
  "No final do dia: poste 1 story de bastidor (editando, treinando, tela do nutriON)",
];
