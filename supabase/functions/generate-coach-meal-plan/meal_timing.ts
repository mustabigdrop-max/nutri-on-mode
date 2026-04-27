// Lógica pura de posicionamento da Ceia e enforcement de horários.
// Extraída de index.ts para permitir testes determinísticos sem subir o servidor.

export type Refeicao = {
  refeicao?: string;
  horario?: string;
  alimentos?: any[];
  calorias?: number;
  macros?: { proteina?: number; carboidrato?: number; gordura?: number };
  observacao_clinica?: string;
  [k: string]: any;
};

export const toMinutes = (h?: string): number => {
  const m = String(h || "").match(/(\d{1,2}):(\d{2})/);
  return m ? Number(m[1]) * 60 + Number(m[2]) : -1;
};

export const fromMinutes = (min: number): string =>
  `${String(Math.floor(min / 60)).padStart(2, "0")}:${String(min % 60).padStart(2, "0")}`;

const PERI_REGEX =
  /intra[\s-]?treino|p[óo]s[\s-]?treino\s*imediato|janela\s*glut|glut[\s-]?4|pr[ée][\s-]?treino/i;

export const CEIA_DEFAULT: Refeicao = {
  refeicao: "Ceia (22:00)",
  horario: "22:00",
  alimentos: [
    {
      alimento: "Iogurte grego natural integral",
      quantidade: "1 pote (200g)",
      observacao: "Caseína de absorção lenta — libera aminoácidos por 6–8h durante o sono.",
      substituicoes: [
        { alimento: "Cottage", quantidade_g: 200, grupo: "proteina" },
        { alimento: "Ricota fresca", quantidade_g: 200, grupo: "proteina" },
      ],
    },
    {
      alimento: "Castanha do Pará",
      quantidade: "3 unidades (15g)",
      observacao: "Selênio + gordura boa — anti-inflamatório noturno e hormonal.",
      substituicoes: [
        { alimento: "Amêndoas", quantidade_g: 20, grupo: "gordura" },
        { alimento: "Nozes", quantidade_g: 20, grupo: "gordura" },
      ],
    },
    {
      alimento: "Linhaça dourada moída",
      quantidade: "1 col sopa (10g)",
      observacao: "Fibra solúvel + ômega-3 vegetal — saciedade e digestão lenta.",
      substituicoes: [
        { alimento: "Chia", quantidade_g: 10, grupo: "fibra" },
        { alimento: "Aveia em flocos", quantidade_g: 20, grupo: "fibra" },
      ],
    },
  ],
  calorias: 320,
  macros: { proteina: 22, carboidrato: 14, gordura: 18 },
  observacao_clinica:
    "Ceia obrigatória injetada pelo sistema (estava ausente no plano gerado).",
};

const renumerar = (refs: Refeicao[]) => {
  let i = 1;
  refs.forEach((m) => {
    if (typeof m?.refeicao === "string" && /Refei[çc][ãa]o\s*\d+/i.test(m.refeicao)) {
      m.refeicao = m.refeicao.replace(/Refei[çc][ãa]o\s*\d+/i, `Refeição ${i}`);
    }
    i++;
  });
};

/**
 * Garante que o plano tenha "Ceia" como ÚLTIMA refeição do dia, sempre depois
 * do Jantar (gap mínimo 2h30) e dentro da janela [21:30, 23:30].
 *
 * - Se ausente: tenta promover refeição noturna (>=21:00) que não seja peri-workout,
 *   senão injeta CEIA_DEFAULT às 22:00.
 * - Se presente mas mal posicionada (antes do Jantar, mesma hora ou fora da janela):
 *   reposiciona seguindo as regras.
 *
 * Mutates `refs` in place. Retorna o array já ordenado e renumerado.
 */
export function enforceCeiaPosition(refs: Refeicao[]): Refeicao[] {
  if (!Array.isArray(refs) || refs.length === 0) return refs;

  // 1) Garante existência da Ceia
  const temCeia = refs.some((m) => /\bceia\b/i.test(String(m?.refeicao || "")));
  if (!temCeia) {
    const sorted = [...refs].sort((a, b) => toMinutes(a?.horario) - toMinutes(b?.horario));
    const candidato = [...sorted].reverse().find((m) => {
      const min = toMinutes(m?.horario);
      const nome = String(m?.refeicao || "");
      return min >= 21 * 60 && !PERI_REGEX.test(nome);
    });
    if (candidato) {
      const horario = candidato.horario || "22:00";
      candidato.refeicao = `Ceia (${horario})`;
    } else {
      refs.push({ ...CEIA_DEFAULT, alimentos: [...CEIA_DEFAULT.alimentos!] });
    }
  }

  // 2) Reposiciona a Ceia (sempre após Jantar, última do dia, janela 21:30–23:30)
  const idxCeia = refs.findIndex((m) => /\bceia\b/i.test(String(m?.refeicao || "")));
  if (idxCeia >= 0) {
    const ceia = refs[idxCeia];
    const idxJantar = refs.findIndex(
      (m, i) => i !== idxCeia && /\bjantar\b/i.test(String(m?.refeicao || "")),
    );
    const jantarMin = idxJantar >= 0 ? toMinutes(refs[idxJantar]?.horario) : -1;
    let ceiaMin = toMinutes(ceia?.horario);
    if (ceiaMin < 0) ceiaMin = 22 * 60;

    if (jantarMin > 0) {
      const minPermitido = jantarMin + 150;
      if (ceiaMin < minPermitido || ceiaMin <= jantarMin) {
        ceiaMin = Math.max(minPermitido, 21 * 60 + 30);
      }
    }
    if (ceiaMin < 21 * 60 + 30) ceiaMin = 21 * 60 + 30;
    if (ceiaMin > 23 * 60 + 30) ceiaMin = 23 * 60 + 30;

    const maxOutro = Math.max(
      ...refs.map((m, i) => (i === idxCeia ? -1 : toMinutes(m?.horario))).filter((v) => v >= 0),
      -1,
    );
    if (maxOutro >= 0 && ceiaMin <= maxOutro) {
      ceiaMin = Math.min(maxOutro + 30, 23 * 60 + 30);
    }

    const novoHorario = fromMinutes(ceiaMin);
    if (novoHorario !== ceia?.horario) {
      ceia.horario = novoHorario;
      if (typeof ceia.refeicao === "string") {
        ceia.refeicao = ceia.refeicao.replace(/\(\d{1,2}:\d{2}\)/, `(${novoHorario})`);
      }
    }
  }

  refs.sort((a, b) => toMinutes(a?.horario) - toMinutes(b?.horario));
  renumerar(refs);
  return refs;
}

// ────────────────────────────────────────────────────────────────────────────
// Templates determinísticos por horário de treino
// Usados como referência (e cobertos por testes) para validar que o esquema
// declarado no prompt continua coerente com a lógica de enforcement.
// ────────────────────────────────────────────────────────────────────────────

export type WorkoutWindow = "manha" | "meio_dia" | "tarde" | "noite" | "descanso";

export function classifyWorkoutWindow(time?: string): WorkoutWindow {
  const m = toMinutes(time);
  if (m < 0) return "descanso";
  if (m >= 6 * 60 && m < 10 * 60) return "manha";
  if (m >= 11 * 60 && m < 14 * 60 + 30) return "meio_dia";
  if (m >= 14 * 60 + 30 && m < 19 * 60) return "tarde";
  if (m >= 19 * 60) return "noite";
  return "descanso";
}

/**
 * Retorna o template canônico de horários de refeições para a janela de treino.
 * usaIntra=false suprime "Intra-Treino" (regra coach uses_intra_malto=false).
 */
export function buildMealTemplate(
  window: WorkoutWindow,
  trainingTime?: string,
  opts: { usaIntra?: boolean; durationMin?: number } = {},
): { refeicao: string; horario: string }[] {
  const usaIntra = opts.usaIntra ?? true;
  const dur = opts.durationMin ?? 60;
  const t = toMinutes(trainingTime);

  const peri = (mins: number) => fromMinutes(mins);

  if (window === "descanso" || t < 0) {
    return [
      { refeicao: "Café da Manhã", horario: "07:00" },
      { refeicao: "Lanche da Manhã", horario: "10:00" },
      { refeicao: "Almoço", horario: "12:30" },
      { refeicao: "Lanche da Tarde", horario: "16:00" },
      { refeicao: "Jantar", horario: "19:30" },
      { refeicao: "Ceia", horario: "22:00" },
    ];
  }

  if (window === "manha") {
    const out: { refeicao: string; horario: string }[] = [
      { refeicao: "Café da Manhã / Pré-Treino Sólido", horario: peri(t - 60) },
    ];
    if (usaIntra) out.push({ refeicao: "Intra-Treino", horario: peri(t + Math.floor(dur / 2)) });
    out.push(
      { refeicao: "Pós-Treino Imediato", horario: peri(t + dur + 15) },
      { refeicao: "Pós-Treino Sólido", horario: peri(t + dur + 90) },
      { refeicao: "Almoço", horario: "12:30" },
      { refeicao: "Lanche da Tarde", horario: "16:00" },
      { refeicao: "Jantar", horario: "19:30" },
      { refeicao: "Ceia", horario: "22:00" },
    );
    return out;
  }

  if (window === "meio_dia") {
    const out: { refeicao: string; horario: string }[] = [
      { refeicao: "Café da Manhã", horario: "07:00" },
      { refeicao: "Lanche da Manhã", horario: "10:00" },
      { refeicao: "Almoço / Pré-Treino Sólido", horario: peri(t - 60) },
    ];
    if (usaIntra) out.push({ refeicao: "Intra-Treino", horario: peri(t + Math.floor(dur / 2)) });
    out.push(
      { refeicao: "Pós-Treino Imediato", horario: peri(t + dur + 15) },
      { refeicao: "Pós-Treino Sólido", horario: peri(t + dur + 90) },
      { refeicao: "Jantar", horario: "19:30" },
      { refeicao: "Ceia", horario: "22:00" },
    );
    return out;
  }

  if (window === "tarde") {
    const out: { refeicao: string; horario: string }[] = [
      { refeicao: "Café da Manhã", horario: "07:00" },
      { refeicao: "Lanche da Manhã", horario: "10:00" },
      { refeicao: "Almoço", horario: "12:30" },
      { refeicao: "Lanche da Tarde / Pré-Treino Sólido", horario: peri(t - 60) },
    ];
    if (usaIntra) out.push({ refeicao: "Intra-Treino", horario: peri(t + Math.floor(dur / 2)) });
    out.push(
      { refeicao: "Pós-Treino Imediato", horario: peri(t + dur + 15) },
      { refeicao: "Jantar / Pós-Treino Sólido", horario: peri(Math.max(t + dur + 90, 19 * 60 + 30)) },
      { refeicao: "Ceia", horario: "22:30" },
    );
    return out;
  }

  // noite
  const ceiaPosSolido = t + dur + 90 >= 22 * 60;
  const out: { refeicao: string; horario: string }[] = [
    { refeicao: "Café da Manhã", horario: "07:00" },
    { refeicao: "Lanche da Manhã", horario: "10:00" },
    { refeicao: "Almoço", horario: "12:30" },
    { refeicao: "Lanche da Tarde", horario: "16:00" },
    { refeicao: "Jantar / Pré-Treino Sólido", horario: peri(t - 60) },
  ];
  if (usaIntra) out.push({ refeicao: "Intra-Treino", horario: peri(t + Math.floor(dur / 2)) });
  out.push({ refeicao: "Pós-Treino Imediato", horario: peri(t + dur + 15) });
  if (ceiaPosSolido) {
    out.push({
      refeicao: "Ceia / Pós-Treino Sólido",
      horario: peri(Math.min(t + dur + 90, 23 * 60 + 30)),
    });
  } else {
    out.push({ refeicao: "Pós-Treino Sólido", horario: peri(t + dur + 90) });
    out.push({ refeicao: "Ceia", horario: "22:30" });
  }
  return out;
}
