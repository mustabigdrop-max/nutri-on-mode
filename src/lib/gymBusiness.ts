export type GymStatus =
  | "nao_contactada"
  | "prospectada"
  | "visitada"
  | "em_negociacao"
  | "fechada"
  | "recusada";

export const GYM_STATUSES: { value: GymStatus; label: string; dot: string; color: string }[] = [
  { value: "nao_contactada", label: "Não contactada", dot: "⚪", color: "#94a3b8" },
  { value: "prospectada", label: "Prospectada", dot: "🟡", color: "#E8A020" },
  { value: "visitada", label: "Visitada", dot: "🔵", color: "#00D4FF" },
  { value: "em_negociacao", label: "Em negociação", dot: "🟠", color: "#fb923c" },
  { value: "fechada", label: "Fechada", dot: "🟢", color: "#00FF88" },
  { value: "recusada", label: "Recusada", dot: "🔴", color: "#f87171" },
];

export const statusMeta = (s?: string | null) =>
  GYM_STATUSES.find((x) => x.value === s) ?? GYM_STATUSES[0];

export const GYM_TYPES = [
  { value: "boutique", label: "Boutique" },
  { value: "media", label: "Média porte" },
  { value: "grande", label: "Grande porte" },
  { value: "studio", label: "Studio" },
  { value: "crossfit", label: "CrossFit" },
];

export interface Gym {
  id: string;
  name: string;
  city: string | null;
  neighborhood: string | null;
  address: string | null;
  owner_name: string | null;
  owner_phone: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  instagram: string | null;
  estimated_members: number | null;
  gym_type: string | null;
  status: GymStatus;
  commission_percent: number | null;
  notes: string | null;
  challenge_slug: string | null;
  active: boolean;
  contacted_at: string | null;
  visited_at: string | null;
  closed_at: string | null;
  created_at: string;
}

export const slugify = (v: string) =>
  v
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);

export const gymPhone = (g: Pick<Gym, "owner_phone" | "contact_phone">) =>
  (g.owner_phone || g.contact_phone || "").replace(/\D/g, "");

export const gymOwner = (g: Pick<Gym, "owner_name" | "contact_name">) =>
  g.owner_name || g.contact_name || "tudo bem";

export function outreachMessage(gym: Pick<Gym, "name" | "owner_name" | "contact_name">) {
  return `Fala, ${gymOwner(gym)}! Tudo bem?

Meu nome é Diogo Mello, sou coach nutricional e atleta IFBB Classic Physique aqui do Rio.

Eu criei uma plataforma chamada nutriON que resolve o maior problema de qualquer academia: RETENÇÃO.

Funciona assim: eu instalo uma tela na ${gym.name} (EU pago), seus alunos escaneiam um QR Code, entram num desafio de 90 dias GRATUITO, e começam a competir entre eles num ranking ao vivo.

Custo pra você: R$ 0.
Risco: zero.

Posso passar aí essa semana pra te mostrar em 5 minutos?

Abraço,
Diogo Mello
@diogo.mell0 · nutrion.app.br`;
}

export function openWhatsApp(phoneDigits: string, message: string) {
  const phone = phoneDigits.startsWith("55") ? phoneDigits : `55${phoneDigits}`;
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank", "noopener");
}

/* ---------- Templates de WhatsApp por etapa do funil ---------- */

export interface WaTemplate {
  id: string;
  label: string;
  status: GymStatus;
  build: (gym: Gym) => string;
}

const challengeLink = (gym: Gym) =>
  gym.challenge_slug ? `https://nutrion.app.br/desafio-21?gym=${gym.challenge_slug}` : "https://nutrion.app.br";

export const WA_TEMPLATES: WaTemplate[] = [
  {
    id: "primeiro_contato",
    label: "📲 Primeiro contato",
    status: "nao_contactada",
    build: (g) => outreachMessage(g),
  },
  {
    id: "follow_up",
    label: "🔁 Follow-up (2 dias)",
    status: "prospectada",
    build: (g) => `Oi ${gymOwner(g)}, tudo certo?

Passando rápido só pra saber se você chegou a ver minha mensagem sobre o nutriON GYM na ${g.name}.

Resumo em 3 linhas:
• Eu instalo a tela do ranking na academia (custo meu)
• Seus alunos entram num desafio de 90 dias grátis
• Você recebe ${g.commission_percent ?? 25}% de tudo que for assinado lá dentro

Te tomo 5 minutos essa semana? Quinta ou sexta, o que fica melhor?

— Diogo Mello · nutrion.app.br`,
  },
  {
    id: "pos_visita",
    label: "🤝 Pós-visita (fechar)",
    status: "visitada",
    build: (g) => `${gymOwner(g)}, obrigado pela visita de hoje!

Como combinamos, o próximo passo é simples:
1. Definimos a data de lançamento do desafio
2. Eu instalo a tela e mando o material gráfico (adesivos e banner)
3. Fazemos o evento de 30 min pros seus alunos

Comissão: ${g.commission_percent ?? 25}% de toda assinatura gerada na ${g.name}, paga via Pix todo dia 5.

Consigo bloquear a agenda essa semana. Fecha assim?

— Diogo Mello`,
  },
  {
    id: "negociacao",
    label: "💼 Em negociação (destravar)",
    status: "em_negociacao",
    build: (g) => `${gymOwner(g)}, tudo bem?

Sobre a parceria da ${g.name}: tô com agenda pra iniciar o desafio ainda neste mês.

Pra te ajudar a decidir:
• Custo pra academia: R$ 0 (equipamento e material são meus)
• Comissão: ${g.commission_percent ?? 25}% via Pix todo dia 5
• Contrato de 12 meses, rescindível com 30 dias de aviso

Alguma dúvida que eu possa resolver agora pra fecharmos?

— Diogo Mello`,
  },
  {
    id: "onboarding",
    label: "🚀 Fechada (lançamento)",
    status: "fechada",
    build: (g) => `${gymOwner(g)}, bora colocar de pé! 🔥

Checklist de lançamento da ${g.name}:
1. Data do evento de 30 min com os alunos
2. Instalação da tela do ranking (The Wall)
3. Adesivos com o QR Code nos pontos de maior fluxo

Link/QR do desafio: ${challengeLink(g)}

Me confirma a melhor data que eu já bloqueio a agenda.

— Diogo Mello`,
  },
  {
    id: "reativacao",
    label: "♻️ Recusada (reativação)",
    status: "recusada",
    build: (g) => `Oi ${gymOwner(g)}, tudo bem?

Sei que na época não fez sentido pra ${g.name}, mas o programa evoluiu bastante e hoje já roda em outras academias com resultado real de retenção.

Continua custo zero pra academia e ${g.commission_percent ?? 25}% de comissão pra vocês.

Faz sentido eu te mostrar os números atualizados em 5 minutos?

— Diogo Mello`,
  },
];

export const templateForStatus = (status: GymStatus) =>
  WA_TEMPLATES.find((t) => t.status === status) ?? WA_TEMPLATES[0];

export const buildWhatsAppMessage = (gym: Gym, templateId?: string) => {
  const tpl = (templateId && WA_TEMPLATES.find((t) => t.id === templateId)) || templateForStatus(gym.status);
  return { tpl, text: tpl.build(gym) };
};

export interface RevenueInput {
  gyms: number;
  membersPerGym: number;
  conversion: number; // %
  ticket: number;
  commission: number; // coach share %
}

export function calcRevenue(i: RevenueInput) {
  const participantsPerGym = Math.round((i.membersPerGym * i.conversion) / 100);
  const grossPerGym = participantsPerGym * i.ticket;
  const gross = grossPerGym * i.gyms;
  const net = (gross * i.commission) / 100;
  return {
    participants: participantsPerGym * i.gyms,
    gross,
    net,
    gymCommission: gross - net,
    netPerGym: (grossPerGym * i.commission) / 100,
  };
}

export const brl = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/* ---------------- Kit de vendas ---------------- */

export const SALES_MESSAGES: { title: string; text: string }[] = [
  {
    title: "📲 Primeiro contato",
    text: outreachMessage({ name: "[ACADEMIA]", owner_name: "[NOME]", contact_name: null }),
  },
  {
    title: "📲 Follow-up (2 dias)",
    text: `Oi [NOME], tudo certo?

Passando rápido só pra saber se você chegou a ver minha mensagem sobre o nutriON GYM.

Resumo em 3 linhas:
• Eu instalo a tela do ranking na academia (custo meu)
• Seus alunos entram num desafio de 90 dias grátis
• Você recebe 25% de tudo que for assinado lá dentro

Te tomo 5 minutos essa semana? Quinta ou sexta, o que fica melhor?`,
  },
  {
    title: "📲 Pós-visita (fechar)",
    text: `[NOME], obrigado pela visita de hoje!

Como combinamos, o próximo passo é simples:
1. Definimos a data de lançamento do desafio
2. Eu instalo a tela e mando o material gráfico (adesivos e banner)
3. Fazemos o evento de 30 min pros seus alunos

Comissão: 25% de toda assinatura gerada na [ACADEMIA], paga via Pix todo dia 5.

Consigo bloquear a agenda pra [DATA]. Fecha assim?`,
  },
  {
    title: "📲 Pós-evento (grupo de participantes)",
    text: `Galera do Desafio 90 Dias da [ACADEMIA]! 🔥

Bem-vindos. A partir de hoje:
• Check-in diário no app (leva 30 segundos)
• Ranking ao vivo na tela da academia
• Áudio do dia pra manter a cabeça no lugar

Quem quiser plano alimentar personalizado é só me chamar aqui.
Bora transformar 90 dias em outro corpo. 💪
— Coach Diogo`,
  },
];

export const SALES_SCRIPTS: { title: string; text: string }[] = [
  {
    title: "🎤 Pitch 5 min pro dono",
    text: `1. "Eu resolvo seu maior problema — retenção — sem custo nenhum pra você. E ainda te pago por isso."
2. Eu coloco uma tela na sua academia. Eu pago.
3. Seus alunos escaneiam o QR Code e entram num desafio de 90 dias GRATUITO.
4. A tela mostra o ranking ao vivo. Eles começam a competir e a vir todo dia.
5. Quem quiser plano alimentar personalizado assina. De cada assinatura, 25% é seu.
6. A cada 90 dias, novo desafio, novas transformações, novos posts marcando a academia.

Custo pra academia: R$ 0. Risco: zero.`,
  },
  {
    title: "🎤 Evento de lançamento (30 min)",
    text: `0-5 min · Quem é o Diogo e qual problema resolve
5-15 min · O MCE: Mindset, Comportamento, Execução
15-20 min · O Desafio: ranking, competição, premiação
20-25 min · Demonstração ao vivo: escanear QR e fazer onboarding
25-30 min · CTA: escaneia agora e ganha 7 dias de Premium`,
  },
  {
    title: "🎤 Script de visita",
    text: `Chegada: cumprimentar, elogiar algo real da estrutura.
Diagnóstico: "Quantos alunos ativos hoje? Qual o churn nos 3 primeiros meses?"
Dor: mostrar que o aluno sai porque não vê resultado — e resultado é treino + nutrição + comportamento.
Solução: The Wall + Desafio 90 Dias, custo zero, 25% de comissão.
Prova: abrir o app na hora, mostrar ranking e MCE Score.
Fechamento: propor data de instalação e evento de lançamento.`,
  },
];

export const SALES_DOCS: { title: string; text: string }[] = [
  {
    title: "📄 Regulamento do Desafio 90 Dias",
    text: `REGULAMENTO — DESAFIO 90 DIAS nutriON

1. Participação gratuita para alunos ativos da academia parceira.
2. Inscrição pelo QR Code oficial do desafio.
3. Pontuação: MCE Score (mindset, comportamento, execução) + streak de check-ins.
4. Check-in diário obrigatório para manutenção do streak.
5. Fotos de progresso quinzenais (opcionais para ranking, obrigatórias para premiação).
6. Premiação: 1º 3 meses Premium + troféu; 2º 2 meses Premium; 3º 1 mês Premium.
7. Prêmios especiais: maior streak, maior evolução, melhor foto do prato, mais episódios ouvidos.
8. Conduta antidesportiva ou dados falsos implicam desclassificação.
9. O desafio tem duração de 90 dias corridos a partir da data de lançamento.`,
  },
  {
    title: "📄 Contrato de parceria (modelo)",
    text: `CONTRATO DE PARCERIA — nutriON GYM PARTNER

Partes: [ACADEMIA], CNPJ [___], e Diogo Mello (nutriON).

1. OBJETO — Implantação do programa nutriON GYM (The Wall + Desafio 90 Dias) nas dependências da academia.
2. CUSTOS — Todos os equipamentos e materiais são custeados pela nutriON. Custo para a academia: R$ 0.
3. COMISSÃO — 25% do valor líquido das assinaturas geradas por alunos da academia, pagos via Pix até o dia 5 do mês seguinte.
4. VIGÊNCIA — 12 meses, renovável automaticamente, rescindível por qualquer parte com 30 dias de aviso.
5. IMAGEM — A academia autoriza uso de nome e logo em materiais do programa; a nutriON autoriza uso do selo "nutriON Certified Gym".
6. DADOS — Os dados dos alunos são tratados conforme a LGPD e pertencem ao titular.

Local e data: ______________________
Assinaturas: ______________________`,
  },
];

export const SALES_ASSETS: { title: string; specs: string }[] = [
  {
    title: "🖼️ Adesivo QR 5×5 cm",
    specs: "5×5 cm · vinil fosco laminado · QR 3,5 cm centralizado · margem branca 6 mm · CMYK 300 dpi · aplicar em halteres, esteiras e espelhos.",
  },
  {
    title: "🖼️ Banner roll-up 85×200 cm",
    specs: "85×200 cm · lona 440 g · área segura 6 cm nas bordas · QR 20×20 cm a 120 cm do chão · fundo #05070C com destaques âmbar.",
  },
  {
    title: "🖼️ Placa de certificação (acrílico)",
    specs: "30×20 cm · acrílico 5 mm · impressão UV · texto 'nutriON Certified Gym' + ano + nome da academia · fixação com prisma inox.",
  },
];
