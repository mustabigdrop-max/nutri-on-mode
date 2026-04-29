import React, { useMemo } from "react";

// ──────────────────────────────────────────────────────────────────────────────
// Painel de Densidade Nutricional
// Estima micronutrientes-chave do plano somando contribuições por alimento
// (densidade/100g) e compara com metas (RDA adulto). Mostra gaps que explicam
// por que um plano "ficou pobre em nutrientes".
// ──────────────────────────────────────────────────────────────────────────────

const T = {
  card: "#0f1410",
  border: "#1f2a22",
  border2: "#2a3a2f",
  text: "#e8f3ec",
  muted: "#7a8a80",
  green: "#4ade80",
  amber: "#E8A020",
  red: "#ef4444",
  bg3: "#0a0f0a",
};

// Metas diárias de referência (RDA adulto saudável). Unidades em mg, exceto onde indicado.
const RDA: Record<string, { meta: number; unit: string; label: string; emoji: string }> = {
  ferro:        { meta: 14,    unit: "mg",  label: "Ferro",        emoji: "🩸" },
  zinco:        { meta: 11,    unit: "mg",  label: "Zinco",        emoji: "🛡️" },
  magnesio:     { meta: 400,   unit: "mg",  label: "Magnésio",     emoji: "🧲" },
  potassio:     { meta: 3500,  unit: "mg",  label: "Potássio",     emoji: "🍌" },
  calcio:       { meta: 1000,  unit: "mg",  label: "Cálcio",       emoji: "🦴" },
  vitamina_c:   { meta: 90,    unit: "mg",  label: "Vitamina C",   emoji: "🍊" },
  vitamina_a:   { meta: 900,   unit: "µg",  label: "Vitamina A",   emoji: "👁️" },
  vitamina_d:   { meta: 15,    unit: "µg",  label: "Vitamina D",   emoji: "☀️" },
  vitamina_e:   { meta: 15,    unit: "mg",  label: "Vitamina E",   emoji: "🌰" },
  vitamina_b12: { meta: 2.4,   unit: "µg",  label: "Vitamina B12", emoji: "⚡" },
  folato:       { meta: 400,   unit: "µg",  label: "Folato (B9)",  emoji: "🌿" },
  omega3:       { meta: 1600,  unit: "mg",  label: "Ômega-3",      emoji: "🐟" },
  fibra:        { meta: 30,    unit: "g",   label: "Fibra",        emoji: "🌾" },
  selenio:      { meta: 55,    unit: "µg",  label: "Selênio",      emoji: "✨" },
};

// Densidade por 100g (valores médios consolidados de TACO/USDA — aproximação).
// Cada chave é um padrão (substring lowercase normalizada do nome do alimento).
type Densidade = Partial<Record<keyof typeof RDA, number>>;
const DB: { match: string[]; d: Densidade }[] = [
  // PROTEÍNAS ANIMAIS
  { match: ["fígado","figado"], d: { ferro:6.5, zinco:4, vitamina_a:6500, vitamina_b12:60, folato:290, selenio:30 } },
  { match: ["frango","peito de frango"], d: { ferro:0.9, zinco:1, magnesio:27, potassio:330, vitamina_b12:0.3, selenio:24 } },
  { match: ["coxa de frango"], d: { ferro:1.3, zinco:2, magnesio:23, potassio:230, vitamina_b12:0.5, selenio:20 } },
  { match: ["carne","patinho","alcatra","coxão","contrafilé","contrafile","músculo","musculo","acém","acem"], d: { ferro:2.6, zinco:5, magnesio:22, potassio:330, vitamina_b12:2.5, selenio:24 } },
  { match: ["salmão","salmao"], d: { ferro:0.5, zinco:0.6, magnesio:29, potassio:380, vitamina_d:11, vitamina_b12:3.2, omega3:2300, selenio:36 } },
  { match: ["sardinha"], d: { ferro:2.9, zinco:1.3, magnesio:39, calcio:380, vitamina_d:5, vitamina_b12:8.9, omega3:1480, selenio:52 } },
  { match: ["atum"], d: { ferro:1.0, zinco:0.6, magnesio:50, potassio:444, vitamina_b12:9, omega3:280, selenio:80 } },
  { match: ["tilápia","tilapia","pescada","merluza"], d: { ferro:0.6, zinco:0.4, magnesio:27, potassio:302, vitamina_b12:1.6, omega3:240, selenio:42 } },
  { match: ["ovo","ovos"], d: { ferro:1.2, zinco:1.3, magnesio:12, potassio:138, vitamina_a:160, vitamina_d:2, vitamina_b12:0.9, folato:47, selenio:30 } },
  { match: ["whey","albumina"], d: { calcio:500, magnesio:90, potassio:530, vitamina_b12:1, zinco:3 } },
  // LATICÍNIOS / FERMENTADOS
  { match: ["iogurte","kefir"], d: { calcio:121, potassio:155, magnesio:11, vitamina_b12:0.5, zinco:0.6 } },
  { match: ["leite"], d: { calcio:113, potassio:143, magnesio:10, vitamina_b12:0.5, vitamina_d:1.2 } },
  { match: ["queijo","cottage","ricota"], d: { calcio:200, potassio:104, magnesio:11, zinco:1.5, vitamina_b12:1.3 } },
  // CARBOIDRATOS
  { match: ["arroz integral"], d: { magnesio:43, potassio:79, ferro:0.4, fibra:1.8, selenio:9.8 } },
  { match: ["arroz","parboiliz"], d: { magnesio:12, potassio:35, ferro:0.3, fibra:0.4, selenio:7.5 } },
  { match: ["aveia"], d: { magnesio:138, potassio:362, ferro:4.7, fibra:10.6, zinco:4, folato:32, selenio:28 } },
  { match: ["batata-doce","batata doce"], d: { potassio:475, vitamina_a:1043, vitamina_c:24, magnesio:25, fibra:3, ferro:0.7 } },
  { match: ["batata"], d: { potassio:421, vitamina_c:19, magnesio:23, ferro:0.8, fibra:2.2 } },
  { match: ["mandioca","macaxeira","aipim"], d: { potassio:271, vitamina_c:21, magnesio:21, fibra:1.8 } },
  { match: ["inhame"], d: { potassio:816, magnesio:21, vitamina_c:17, fibra:4.1 } },
  { match: ["quinoa"], d: { magnesio:64, potassio:172, ferro:1.5, fibra:2.8, folato:42, zinco:1.1 } },
  { match: ["tapioca"], d: { potassio:11, magnesio:1, ferro:0.5 } },
  { match: ["pão","pao"], d: { magnesio:23, potassio:115, ferro:3.6, fibra:2.7, folato:90 } },
  { match: ["macarrão","macarrao","massa"], d: { magnesio:18, potassio:44, ferro:1.3, fibra:1.8, folato:83 } },
  { match: ["feijão","feijao"], d: { magnesio:42, potassio:355, ferro:2.5, fibra:8.5, folato:130, zinco:1, calcio:27 } },
  { match: ["lentilha"], d: { magnesio:36, potassio:369, ferro:3.3, fibra:7.9, folato:181, zinco:1.3 } },
  { match: ["grão de bico","grao de bico","grão-de-bico","grao-de-bico"], d: { magnesio:48, potassio:291, ferro:2.9, fibra:7.6, folato:172, zinco:1.5 } },
  // VEGETAIS
  { match: ["brócolis","brocolis"], d: { vitamina_c:89, vitamina_a:31, calcio:47, magnesio:21, potassio:316, folato:63, fibra:2.6 } },
  { match: ["espinafre"], d: { vitamina_c:28, vitamina_a:469, ferro:2.7, calcio:99, magnesio:79, potassio:558, folato:194, fibra:2.2 } },
  { match: ["couve"], d: { vitamina_c:120, vitamina_a:500, calcio:135, magnesio:31, potassio:447, folato:141, fibra:3.6 } },
  { match: ["rúcula","rucula"], d: { vitamina_c:15, vitamina_a:119, calcio:160, magnesio:47, potassio:369, folato:97 } },
  { match: ["alface"], d: { vitamina_c:9, vitamina_a:166, calcio:36, magnesio:13, potassio:194, folato:38 } },
  { match: ["tomate"], d: { vitamina_c:14, vitamina_a:42, potassio:237, magnesio:11, folato:15 } },
  { match: ["cenoura"], d: { vitamina_c:6, vitamina_a:835, potassio:320, magnesio:12, fibra:2.8 } },
  { match: ["beterraba"], d: { vitamina_c:5, potassio:325, magnesio:23, folato:109, fibra:2.8 } },
  { match: ["abobrinha"], d: { vitamina_c:18, potassio:262, magnesio:18, folato:24 } },
  { match: ["abóbora","abobora","moranga"], d: { vitamina_c:9, vitamina_a:426, potassio:340, magnesio:12 } },
  { match: ["pimentão","pimentao"], d: { vitamina_c:128, vitamina_a:157, potassio:211 } },
  { match: ["cebola","alho"], d: { vitamina_c:7, potassio:146, selenio:1.4 } },
  { match: ["repolho"], d: { vitamina_c:37, potassio:170, folato:43, fibra:2.5 } },
  // FRUTAS
  { match: ["banana"], d: { vitamina_c:9, potassio:358, magnesio:27, fibra:2.6, folato:20 } },
  { match: ["maçã","maca "], d: { vitamina_c:5, potassio:107, fibra:2.4 } },
  { match: ["mamão","mamao"], d: { vitamina_c:61, vitamina_a:47, potassio:182, folato:37, fibra:1.7 } },
  { match: ["laranja","tangerina","mexerica"], d: { vitamina_c:53, calcio:40, potassio:181, folato:30, fibra:2.4 } },
  { match: ["limão","limao"], d: { vitamina_c:53, potassio:138 } },
  { match: ["abacaxi"], d: { vitamina_c:48, potassio:109, magnesio:12, folato:18 } },
  { match: ["morango","framboesa","amora","mirtilo","blueberry"], d: { vitamina_c:59, potassio:153, folato:24, fibra:2 } },
  { match: ["abacate"], d: { vitamina_c:10, vitamina_e:2.1, potassio:485, magnesio:29, folato:81, fibra:6.7, omega3:110 } },
  { match: ["manga"], d: { vitamina_c:36, vitamina_a:54, potassio:168, fibra:1.6 } },
  { match: ["uva","uva-passa","passa"], d: { vitamina_c:3, potassio:191, ferro:0.4 } },
  // GORDURAS / OLEAGINOSAS
  { match: ["azeite"], d: { vitamina_e:14, omega3:760 } },
  { match: ["castanha-do-pará","castanha do para","castanha do pará"], d: { magnesio:376, selenio:1917, zinco:4, vitamina_e:5.7, fibra:7.5, omega3:18 } },
  { match: ["castanha","castanha de caju"], d: { magnesio:292, ferro:6.7, zinco:5.8, fibra:3.3, omega3:62 } },
  { match: ["amêndoa","amendoa"], d: { magnesio:270, calcio:264, vitamina_e:25, fibra:12.5, ferro:3.7, zinco:3.1 } },
  { match: ["noz","nozes"], d: { magnesio:158, vitamina_e:0.7, omega3:9080, fibra:6.7, ferro:2.9 } },
  { match: ["amendoim","pasta de amendoim"], d: { magnesio:168, vitamina_e:8.3, fibra:8.5, folato:240, zinco:3.3 } },
  { match: ["chia"], d: { calcio:631, magnesio:335, ferro:7.7, fibra:34, omega3:17800, zinco:4.6 } },
  { match: ["linhaça","linhaca"], d: { magnesio:392, calcio:255, ferro:5.7, fibra:27, omega3:22813, folato:87 } },
  { match: ["semente de abóbora","semente de abobora","semente de girassol"], d: { magnesio:535, ferro:8.8, zinco:7.8, vitamina_e:35, fibra:6 } },
  { match: ["coco"], d: { magnesio:32, potassio:356, fibra:9, ferro:2.4 } },
  // OUTROS
  { match: ["mel"], d: { potassio:52 } },
  { match: ["whey","proteína em pó","proteina em po"], d: { calcio:500, magnesio:90, vitamina_b12:1 } },
];

// Extrai gramas de uma string como "120g", "100 g", "2 colheres" → null
function parseGrams(q?: string): number | null {
  if (!q) return null;
  const s = q.toLowerCase().replace(",", ".");
  const m = s.match(/(\d+(?:\.\d+)?)\s*g\b/);
  if (m) return parseFloat(m[1]);
  // fallback: número solto se contiver 'g' em algum lugar
  const n = s.match(/(\d+(?:\.\d+)?)/);
  if (n && /g\b|gram/.test(s)) return parseFloat(n[1]);
  return null;
}

function normalize(s: string): string {
  return (s || "").toLowerCase().trim();
}

function findDensity(alimento: string): Densidade | null {
  const n = normalize(alimento);
  if (!n) return null;
  // melhor match: substring mais longa
  let best: { len: number; d: Densidade } | null = null;
  for (const row of DB) {
    for (const m of row.match) {
      if (n.includes(m) && (!best || m.length > best.len)) {
        best = { len: m.length, d: row.d };
      }
    }
  }
  return best?.d || null;
}

interface Meal {
  refeicao?: string;
  alimentos?: { alimento: string; quantidade?: string; quantidade_g?: string }[];
}

interface Props {
  refeicoes: Meal[];
  fibraDeclarada?: number; // se o plano já trouxer fibra total
  onRegenerate?: () => void;
  regenerating?: boolean;
}

export default function NutrientDensityPanel({ refeicoes, fibraDeclarada, onRegenerate, regenerating }: Props) {
  const { totals, matched, unmatched } = useMemo(() => {
    const totals: Record<string, number> = {};
    const matched: string[] = [];
    const unmatched: string[] = [];
    for (const meal of refeicoes || []) {
      for (const a of meal.alimentos || []) {
        const grams = parseGrams(a.quantidade_g) ?? parseGrams(a.quantidade);
        const d = findDensity(a.alimento);
        if (!d || !grams) {
          if (!d && a.alimento) unmatched.push(a.alimento);
          continue;
        }
        matched.push(a.alimento);
        const factor = grams / 100;
        for (const k of Object.keys(d) as (keyof typeof RDA)[]) {
          const v = (d[k] || 0) * factor;
          totals[k] = (totals[k] || 0) + v;
        }
      }
    }
    if (fibraDeclarada && !totals.fibra) totals.fibra = fibraDeclarada;
    return { totals, matched, unmatched };
  }, [refeicoes, fibraDeclarada]);

  const rows = (Object.keys(RDA) as (keyof typeof RDA)[]).map((k) => {
    const meta = RDA[k].meta;
    const val = Math.round((totals[k] || 0) * 10) / 10;
    const pct = Math.min(200, Math.round((val / meta) * 100));
    let color = T.red;
    if (pct >= 90) color = T.green;
    else if (pct >= 60) color = T.amber;
    return { k, label: RDA[k].label, emoji: RDA[k].emoji, unit: RDA[k].unit, val, meta, pct, color };
  });

  const cobertura = Math.round(rows.reduce((s, r) => s + Math.min(100, r.pct), 0) / rows.length);
  const gaps = rows.filter((r) => r.pct < 60).slice(0, 6);

  let veredito = { txt: "Plano nutricionalmente DENSO", color: T.green };
  if (cobertura < 60) veredito = { txt: "Plano POBRE em micronutrientes", color: T.red };
  else if (cobertura < 80) veredito = { txt: "Cobertura intermediária — ajustes recomendados", color: T.amber };

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: T.green, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ width: 16, height: 1, background: T.green }} />
        🧬 Densidade Nutricional do Plano
      </div>

      <div style={{ background: T.card, border: `1px solid ${veredito.color}55`, borderRadius: 10, padding: 16, boxShadow: `0 0 18px ${veredito.color}11` }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 11, color: T.muted, letterSpacing: "0.05em", marginBottom: 4 }}>COBERTURA MÉDIA RDA</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: veredito.color, fontFamily: "'Space Grotesk', sans-serif" }}>{cobertura}%</div>
            <div style={{ fontSize: 12, color: veredito.color, marginTop: 4 }}>{veredito.txt}</div>
          </div>
          <div style={{ fontSize: 10, color: T.muted, textAlign: "right", maxWidth: 280 }}>
            Estimativa baseada em densidade nutricional (TACO/USDA) por alimento ×<br />
            quantidade declarada. Comparação com RDA adulto.
          </div>
        </div>

        {/* Grid de micronutrientes */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 10, marginBottom: gaps.length ? 14 : 0 }}>
          {rows.map((r) => (
            <div key={r.k} style={{ background: T.bg3, border: `1px solid ${r.color}44`, borderRadius: 8, padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                <div style={{ fontSize: 11, color: T.text, fontWeight: 600 }}>
                  <span style={{ marginRight: 4 }}>{r.emoji}</span>{r.label}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: r.color }}>{r.pct}%</div>
              </div>
              <div style={{ fontSize: 10, color: T.muted, marginBottom: 6 }}>
                {r.val} / {r.meta} {r.unit}
              </div>
              <div style={{ height: 4, background: T.border, borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${Math.min(100, r.pct)}%`, height: "100%", background: r.color, transition: "width .3s" }} />
              </div>
            </div>
          ))}
        </div>

        {/* Diagnóstico de gaps */}
        {gaps.length > 0 && (
          <div style={{ background: `${T.red}11`, border: `1px solid ${T.red}44`, borderRadius: 8, padding: 12, marginTop: 4 }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: T.red, marginBottom: 8, letterSpacing: "0.05em" }}>
              ⚠ POR QUE FICOU POBRE: déficits críticos detectados
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {gaps.map((g) => (
                <div key={g.k} style={{ background: T.bg3, border: `1px solid ${T.red}55`, borderRadius: 6, padding: "4px 8px", fontSize: 11, color: T.text }}>
                  {g.emoji} {g.label}: <strong style={{ color: T.red }}>{g.pct}%</strong>
                </div>
              ))}
            </div>
            <div style={{ fontSize: 10, color: T.muted, marginTop: 8, lineHeight: 1.5 }}>
              <strong style={{ color: T.amber }}>Sugestão:</strong> ative <em>Diversidade Alimentar Elite</em> e <em>Variedade Funcional</em> na configuração e regenere — adicionar fígado 1x/sem (ferro/B12/A), castanha-do-pará (selênio), folhas verde-escuras (folato/Mg), peixes gordos 2x/sem (ω-3/D) e fermentados diários costuma fechar &gt;85% da RDA.
            </div>
          </div>
        )}

        {/* Botão Regerar com mais densidade */}
        {onRegenerate && cobertura < 95 && (
          <button
            onClick={onRegenerate}
            disabled={regenerating}
            style={{
              marginTop: 14,
              width: "100%",
              background: regenerating ? T.bg3 : `linear-gradient(135deg, ${T.green}, #22c55e)`,
              color: regenerating ? T.muted : "#0a0f0a",
              border: `1px solid ${T.green}`,
              borderRadius: 8,
              padding: "12px 16px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.03em",
              cursor: regenerating ? "not-allowed" : "pointer",
              transition: "all .2s",
              boxShadow: regenerating ? "none" : `0 0 24px ${T.green}33`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            {regenerating ? (
              <>⏳ Recalculando com mais densidade...</>
            ) : (
              <>🧬 Regerar com mais densidade nutricional</>
            )}
          </button>
        )}

        <div style={{ fontSize: 9, color: T.muted, marginTop: 10, opacity: 0.7 }}>
          Reconhecidos: {matched.length} alimentos · Não mapeados: {unmatched.length} (não entram no cálculo).
          Preserva preferências, restrições e orçamento — apenas força ↑ variedade e ↑ micronutrientes.
        </div>
      </div>
    </div>
  );
}
