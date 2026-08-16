export const LOGIN_URL = "nutrion.app.br/login";

export const DEFAULT_WELCOME_TEMPLATE = `🟢 *Bem-vindo ao nutriON, {nome}!* 🏋️

Seu plano de acompanhamento está pronto. Acesse a plataforma:

🔗 *Link:* {link}
📧 *E-mail:* {email}
🔑 *Senha:* {senha}

📱 Salve o link na tela inicial do celular pra acesso rápido.

Dentro da plataforma você encontra:
✅ Seu plano alimentar completo
✅ Substituições inteligentes
✅ Acompanhamento de hidratação
✅ MCE Audio — conteúdo exclusivo
✅ Check-in diário

Qualquer dúvida, é só chamar!

_{coach}_
_{instagram} · nutrion.app.br_`;

export type WelcomeVars = {
  nome: string;
  email: string;
  senha: string;
  link?: string;
  coach?: string;
  instagram?: string;
};

export const WELCOME_VARIABLES = [
  { key: "{nome}", label: "Primeiro nome do cliente" },
  { key: "{email}", label: "E-mail de acesso" },
  { key: "{senha}", label: "Senha temporária" },
  { key: "{link}", label: "Link de login" },
  { key: "{coach}", label: "Nome do coach" },
  { key: "{instagram}", label: "@ do coach" },
];

export function renderWelcomeMessage(template: string | null | undefined, v: WelcomeVars): string {
  const base = template?.trim() ? template : DEFAULT_WELCOME_TEMPLATE;
  return base
    .replaceAll("{nome}", v.nome)
    .replaceAll("{email}", v.email)
    .replaceAll("{senha}", v.senha)
    .replaceAll("{link}", v.link || LOGIN_URL)
    .replaceAll("{coach}", v.coach || "Seu Coach")
    .replaceAll("{instagram}", v.instagram || "@nutrion");
}

export function openWhatsAppWith(phone: string, message: string) {
  const clean = (phone || "").replace(/\D/g, "");
  const br = clean.startsWith("55") ? clean : `55${clean}`;
  window.open(`https://wa.me/${br}?text=${encodeURIComponent(message)}`, "_blank");
}
