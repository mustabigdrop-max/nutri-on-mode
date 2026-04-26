// ============================================================
// DETECTOR DE CONFLITOS: Sistema recomendado x restrições
// (lesões, equipamento disponível, tempo de sessão)
// ============================================================
import { TRAINING_SYSTEMS, TrainingSystem } from "./trainingSystems";

export type ConflictSeverity = "block" | "warn" | "info";
export type ConflictCategory = "injury" | "equipment" | "time";

export interface SystemConflict {
  id: string;
  category: ConflictCategory;
  severity: ConflictSeverity;
  title: string;
  detail: string;
  suggestion?: string;
  alternativeSystemIds?: string[];
}

interface DetectArgs {
  systemId: string;
  injuries: string;          // texto livre
  equipment: string[];       // chips selecionados
  sessionDuration: string;   // ex "30min" | "45min" | "60min" | "75min" | "90min" | "120min"
}

// Mapeamento sistema -> minutos mínimos de sessão recomendados
const MIN_MINUTES_BY_SYSTEM: Record<string, number> = {
  "gvt": 75, "gvt-poliquin": 70, "smolov": 75, "531-monolith": 75,
  "conjugada": 75, "bulgarian": 60, "mountain-dog": 75, "weider": 60,
  "block": 70, "triphasic": 70, "french-contrast": 75, "rp": 70,
  "doggcrapp": 45, "heavy-duty": 30, "edt": 30, "flushing": 45,
  "531": 60, "texas-method": 60, "cube": 60, "dup": 60, "wup": 60,
  "apre": 60, "vbt": 60, "linear-simples": 45, "staggered": 60,
  "super-comp": 60,
};

// Equipamentos exigidos (sets) — basta UM dos arrays internos para satisfazer
const EQUIPMENT_REQUIRED: Record<string, { needs: string[][]; label: string }> = {
  "conjugada": { needs: [["Bandas", "Correntes"], ["Box", "Caixote"], ["Rack", "Power Rack"]], label: "Westside Conjugado" },
  "smolov": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "Smolov (back squat)" },
  "531": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "5/3/1" },
  "531-monolith": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "5/3/1 Monolith" },
  "texas-method": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "Texas Method" },
  "bulgarian": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "Bulgarian Method" },
  "cube": { needs: [["Rack", "Power Rack"], ["Barra Olímpica", "Barra"]], label: "Cube Method" },
  "french-contrast": { needs: [["Plyo Box", "Caixote"], ["Barra Olímpica", "Barra"]], label: "French Contrast (PAP)" },
  "vbt": { needs: [["Encoder", "App de velocidade", "VBT"]], label: "Velocity Based Training" },
  "doggcrapp": { needs: [["Halteres"], ["Máquinas"], ["Cabos", "Polias"]], label: "Doggcrapp (rotação A/B/C)" },
  "mountain-dog": { needs: [["Halteres"], ["Cabos", "Polias"], ["Máquinas"]], label: "Mountain Dog" },
  "gvt": { needs: [["Barra Olímpica", "Barra"], ["Halteres"]], label: "GVT 10x10" },
  "edt": { needs: [["Halteres"], ["Cabos", "Polias"]], label: "EDT (densidade)" },
};

// Heurística simples de lesão -> sistemas/conteúdos contraindicados
interface InjuryRule {
  match: RegExp;
  area: string;
  blocks: string[];     // systems totalmente contraindicados
  warns: string[];      // systems com cuidado
  detail: string;
}

const INJURY_RULES: InjuryRule[] = [
  {
    match: /lombar|hérnia|hernia|disco|l4|l5|s1|coluna/i,
    area: "lombar/coluna",
    blocks: ["smolov", "bulgarian", "531-monolith", "texas-method"],
    warns: ["531", "conjugada", "cube", "gvt"],
    detail: "Sistemas com squat/deadlift de alta frequência ou cargas máximas diárias agravam lesões lombares.",
  },
  {
    match: /joelho|menisco|lca|patela|patelar/i,
    area: "joelho",
    blocks: ["smolov", "bulgarian"],
    warns: ["531", "texas-method", "cube", "french-contrast", "triphasic"],
    detail: "Frequência alta de squat pesado e pliometria sobrecarrega articulação patelofemoral.",
  },
  {
    match: /ombro|manguito|impingement|labrum|acrômio|acromio/i,
    area: "ombro",
    blocks: [],
    warns: ["weider", "gvt", "mountain-dog", "doggcrapp", "flushing"],
    detail: "Sistemas com volume alto de pressing e abdução podem perpetuar inflamação do manguito rotador.",
  },
  {
    match: /cotovelo|epicondilite|tendinite/i,
    area: "cotovelo/tendões",
    blocks: [],
    warns: ["gvt", "weider", "edt", "doggcrapp", "rest.?pause"],
    detail: "Volume elevado em supinos/rosca e técnicas de falha estressam tendões já inflamados.",
  },
  {
    match: /quadril|labrum.*quadril|fêmur|femur/i,
    area: "quadril",
    blocks: ["smolov", "bulgarian"],
    warns: ["531", "texas-method"],
    detail: "Squat de alta frequência com cargas máximas é contraindicado em lesões de quadril.",
  },
  {
    match: /cervical|pescoço|pescoco/i,
    area: "cervical",
    blocks: [],
    warns: ["gvt", "smolov", "bulgarian", "531-monolith"],
    detail: "Back squat e agachamento pesado pressionam coluna cervical sob carga.",
  },
];

export function detectSystemConflicts({
  systemId, injuries, equipment, sessionDuration,
}: DetectArgs): SystemConflict[] {
  const sys: TrainingSystem | undefined = TRAINING_SYSTEMS.find((s) => s.id === systemId);
  if (!sys) return [];

  const conflicts: SystemConflict[] = [];
  const injuryText = (injuries || "").trim();
  const minutes = parseInt((sessionDuration || "60").replace(/\D/g, "")) || 60;

  // ── 1. LESÕES ──
  if (injuryText.length > 2 && !/nenhuma|nao|não/i.test(injuryText)) {
    INJURY_RULES.forEach((rule) => {
      if (!rule.match.test(injuryText)) return;
      if (rule.blocks.includes(systemId)) {
        conflicts.push({
          id: `injury-block-${rule.area}`,
          category: "injury",
          severity: "block",
          title: `⛔ ${sys.nome} contraindicado para lesão em ${rule.area}`,
          detail: rule.detail,
          suggestion: "Troque por um sistema mais conservador antes de gerar o protocolo.",
          alternativeSystemIds: ["dup", "rp", "linear-simples", "wup"],
        });
      } else if (rule.warns.includes(systemId)) {
        conflicts.push({
          id: `injury-warn-${rule.area}`,
          category: "injury",
          severity: "warn",
          title: `⚠️ Atenção: ${sys.nome} com lesão em ${rule.area}`,
          detail: rule.detail,
          suggestion: "Permitido com adaptações: reduzir volume, evitar amplitudes dolorosas e priorizar variações.",
        });
      }
    });
  }

  // ── 2. EQUIPAMENTO ──
  const req = EQUIPMENT_REQUIRED[systemId];
  if (req) {
    const has = (alts: string[]) =>
      alts.some((a) => equipment.some((e) => e.toLowerCase().includes(a.toLowerCase())));
    const missing = req.needs.filter((alts) => !has(alts));
    if (equipment.length === 0) {
      conflicts.push({
        id: `equip-empty`,
        category: "equipment",
        severity: "warn",
        title: `⚠️ Nenhum equipamento marcado`,
        detail: `${req.label} requer: ${req.needs.map((a) => a.join("/")).join(" + ")}.`,
        suggestion: "Selecione os equipamentos disponíveis na anamnese ou troque por um sistema com requisitos menores.",
      });
    } else if (missing.length > 0) {
      conflicts.push({
        id: `equip-missing`,
        category: "equipment",
        severity: missing.length === req.needs.length ? "block" : "warn",
        title: `${missing.length === req.needs.length ? "⛔" : "⚠️"} Equipamento ausente para ${req.label}`,
        detail: `Faltando: ${missing.map((a) => a.join(" ou ")).join(" + ")}.`,
        suggestion: missing.length === req.needs.length
          ? "Sistema inviável com o equipamento atual — escolha outro."
          : "Sistema viável com adaptações; algumas variações terão de ser substituídas.",
      });
    }
  }

  // ── 3. TEMPO DE SESSÃO ──
  const minMin = MIN_MINUTES_BY_SYSTEM[systemId];
  if (minMin && minutes < minMin) {
    const gap = minMin - minutes;
    conflicts.push({
      id: `time`,
      category: "time",
      severity: gap >= 30 ? "block" : "warn",
      title: `${gap >= 30 ? "⛔" : "⚠️"} Tempo de sessão insuficiente`,
      detail: `${sys.nome} requer ~${minMin}min/sessão; você definiu ${minutes}min (faltam ${gap}min).`,
      suggestion: gap >= 30
        ? "Aumente o tempo de sessão na anamnese ou escolha um sistema mais denso (EDT, Heavy Duty, DC)."
        : "Aceitável com cortes em acessórios e descansos; considere ajustar o tempo.",
      alternativeSystemIds: gap >= 30 ? ["edt", "heavy-duty", "doggcrapp", "linear-simples"] : undefined,
    });
  }

  return conflicts;
}
