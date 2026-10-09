// Bloqueios do Gerador de Cortes (ilustração conceitual). Checados em código antes de qualquer chamada de imagem.
const BLOCKED: [RegExp, string][] = [
  [/\b(pessoa|homem|mulher|atleta|modelo|rosto|retrato|selfie|garot[oa]|crian[cç]a|gente|humano|people|person|face)\b/i, "pessoa realista"],
  [/\b(f[ií]sico|corpo|abd[oô]men|tanquinho|m[uú]sculos? definid|shape|silhueta|barriga|body)\b/i, "físico ou corpo como resultado"],
  [/antes\s*(e|x|\/)\s*depois|before\s*(and|\/)\s*after|transforma[cç][aã]o corporal/i, "antes e depois"],
  [/\b(celebridade|famos[oa]|influencer|ator|atriz|jogador)\b/i, "rosto de pessoa real ou celebridade"],
  [/\b(marca|logo|logotipo|nike|adidas|coca|mcdonald|disney|marvel|pok[eé]mon|personagem)\b/i, "marca ou personagem de terceiros"],
  [/\b(embalagem|r[oó]tulo|pote|frasco|suplemento|whey|produto|c[aá]psula)\b/i, "embalagem ou produto com alegações"],
  [/\b(raio-?x|tomografia|resson[aâ]ncia|cirurgia|ferida|[oó]rg[aã]o real|sangue|exame m[eé]dico|tumor)\b/i, "imagem médica realista"],
  [/mind\s*force/i, "produto MindForce: use somente foto real enviada por você"],
];

export function blockReason(text: string): string | null {
  for (const [re, why] of BLOCKED) if (re.test(text)) return why;
  return null;
}

export function buildPrompt(descricao: string): string {
  return `Abstract stylized conceptual illustration representing: ${descricao.trim().slice(0, 300)}. ` +
    "Flat geometric vector style, near-black #020205 background, cyan #00D4FF and gold #B8922A accents, sharp corners, vertical 2:3 composition, " +
    "lots of empty space at top and bottom. Absolutely no people, no human figures, no faces, no bodies, no text, no letters, no numbers, no logos, no products, no packaging.";
}

export async function sha256(s: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
}
