// Ativação muscular do card TrainingON: volume real (séries) por grupo, primário peso 1, secundário 0,5.

export type MuscleKey =
  | "pec" | "delt" | "bi" | "tri" | "fore" | "abs" | "obl" | "lats" | "traps" | "lower"
  | "quad" | "ham" | "glute" | "hipabd" | "add" | "calf";

export interface ActivationInput { name: string; sub: string; sets?: number }
export interface MuscleActivation { key: MuscleKey; pct: number; volume: number }

export const normalizeMuscleText = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();

// Ordem importa: termos mais específicos primeiro (abdutor antes de abdômen, posterior de coxa antes de coxa).
const SYNONYMS: Array<[MuscleKey, RegExp]> = [
  ["hipabd", /abdut|gluteo medio|glute med/],
  ["add", /adut/],
  ["ham", /posterior(es)? de coxa|posterior|isquio|femora|hamstring|flexor(es)? de joelho/],
  ["glute", /glut/],
  ["quad", /quadr|quads|\bcoxa|vasto|reto femoral/],
  ["calf", /panturr|gastrocn|soleo|gemeo|calf/],
  ["lower", /lombar|eretor|paravertebra/],
  ["abs", /abdom|abdominal|\babd\b|\bcore\b|reto abdominal/],
  ["obl", /obliqu/],
  ["pec", /peit|pec|chest/],
  ["delt", /ombro|delt/],
  ["tri", /tricep/],
  ["bi", /bicep|braquial/],
  ["fore", /antebra|forearm|punho/],
  ["lats", /dorsa|costas|\blats?\b|latissimo|romboide/],
  ["traps", /trapez/],
];

// Padrões de exercício → [primário, ...secundários]
const EXERCISE_RULES: Array<[RegExp, MuscleKey[]]> = [
  [/stiff|romeno|rdl|terra|good morning/, ["ham", "glute", "lower"]],
  [/flexora|leg curl|nordic/, ["ham"]],
  [/extensora|leg extension/, ["quad"]],
  [/hip thrust|elevacao pelvica|ponte/, ["glute", "ham"]],
  [/bulgar|afundo|passada|lunge|step/, ["quad", "glute", "ham"]],
  [/agach|squat|hack|smith/, ["quad", "glute", "add"]],
  [/leg press/, ["quad", "glute"]],
  [/abdutora|abducao/, ["hipabd"]],
  [/adutora|aducao/, ["add"]],
  [/panturr|gemeos|calf|soleo/, ["calf"]],
  [/supino|crucifix|fly|peck|flexao de braco/, ["pec", "delt", "tri"]],
  [/desenvolv|militar|arnold/, ["delt", "tri"]],
  [/elevacao lateral|elevacao frontal|crucifixo inverso|face pull/, ["delt"]],
  [/remada|puxada|pulldown|barra fixa|pull ?up/, ["lats", "bi"]],
  [/encolhimento|shrug/, ["traps"]],
  [/rosca|curl/, ["bi", "fore"]],
  [/tricep|frances|testa|pushdown|mergulho|dip/, ["tri"]],
  [/prancha|crunch|abdominal/, ["abs"]],
];

function musclesFromField(sub: string): MuscleKey[] {
  const tokens = normalizeMuscleText(sub).split(/[,/+;·()]| e /).map((t) => t.trim()).filter(Boolean);
  const out: MuscleKey[] = [];
  tokens.forEach((t) => {
    const hit = SYNONYMS.find(([, re]) => re.test(t));
    if (hit && !out.includes(hit[0])) out.push(hit[0]);
  });
  return out;
}

export function computeMuscleActivation(exercises: ActivationInput[], warn: (msg: string) => void = console.warn): MuscleActivation[] {
  const volume = new Map<MuscleKey, number>();
  const add = (k: MuscleKey, v: number) => volume.set(k, (volume.get(k) || 0) + v);

  exercises.forEach((e) => {
    const fromField = musclesFromField(e.sub || "");
    const rule = EXERCISE_RULES.find(([re]) => re.test(normalizeMuscleText(e.name)))?.[1] || [];
    const primary = fromField[0] || rule[0];
    if (!primary) {
      warn(`[TrainingON card] músculo sem correspondência no desenho: "${e.sub}" (${e.name})`);
      return;
    }
    const secondaries = [...fromField.slice(1), ...rule].filter((k, i, arr) => k !== primary && arr.indexOf(k) === i);
    const sets = e.sets && e.sets > 0 ? e.sets : 1;
    add(primary, sets);
    secondaries.forEach((k) => add(k, sets * 0.5));
  });

  const total = [...volume.values()].reduce((a, b) => a + b, 0);
  if (!total) return [];
  return [...volume.entries()]
    .map(([key, v]) => ({ key, volume: v, pct: Math.round((v / total) * 100) }))
    .filter((a) => a.pct > 0)
    .sort((a, b) => b.volume - a.volume);
}

const BACK_LEADERS: MuscleKey[] = ["ham", "glute", "hipabd", "lats", "traps", "lower"];
export const autoView = (active: Array<{ key: MuscleKey }>): "front" | "back" =>
  active[0] && BACK_LEADERS.includes(active[0].key) ? "back" : "front";
