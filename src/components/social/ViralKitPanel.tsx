/**
 * Painel do motor de viralização: escolha de hook, texto de tela do Reels,
 * CTA certo por tipo de post e hashtags em 3 camadas.
 */

import { toast } from "sonner";
import {
  TIPOS_HOOK, achatarHashtags, type ViralKit, type HookOption, type CorteTexto,
} from "@/lib/socialViral";

const C = {
  s2: "#10101A", s3: "#181824", border: "#ffffff10",
  cyan: "#00D4FF", gold: "#EF9F27", green: "#22C55E",
  muted: "#4A4A5A", text: "#C8C8D8", white: "#F0F0F8",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const copy = (text: string, msg = "Copiado") => {
  navigator.clipboard.writeText(text);
  toast.success(msg);
};

const raios = (n: number) => "⚡".repeat(Math.max(1, Math.min(5, n)));

export function HookChooser({
  hooks, selected, onSelect,
}: { hooks: HookOption[]; selected?: string; onSelect: (h: HookOption) => void }) {
  if (!hooks?.length) return null;
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 2, marginBottom: 6 }}>
        🎯 ESCOLHA SEU HOOK
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {hooks.slice(0, 3).map((h, i) => {
          const meta = TIPOS_HOOK[h.tipo] || TIPOS_HOOK.CURIOSIDADE;
          const on = selected === h.texto;
          return (
            <div key={i} style={{
              background: on ? `${C.green}0C` : C.s3, border: `1px solid ${on ? `${C.green}55` : C.border}`,
              borderRadius: 8, padding: "8px 10px",
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 1 }}>
                  OPÇÃO {String.fromCharCode(65 + i)} · {h.tipo} {raios(meta.poder)}
                </span>
                <button type="button" onClick={() => onSelect(h)} style={{
                  padding: "3px 8px", background: on ? C.green : "transparent",
                  border: `1px solid ${on ? C.green : `${C.cyan}40`}`, borderRadius: 5, cursor: "pointer",
                  fontFamily: F.m, fontSize: 9, color: on ? "#02150E" : C.cyan, flexShrink: 0,
                }}>{on ? "USANDO" : "USAR ESTE"}</button>
              </div>
              <div style={{ fontFamily: F.b, fontSize: 12, color: C.white, lineHeight: 1.4, marginTop: 4 }}>“{h.texto}”</div>
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 3 }}>{meta.sinal}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function ScreenTextTimeline({ cortes }: { cortes: CorteTexto[] }) {
  if (!cortes?.length) return null;
  const tudo = cortes.map((c) => `${c.segundo}\n${c.texto_tela}`).join("\n\n");
  return (
    <div style={{ marginTop: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, color: C.cyan, letterSpacing: 2 }}>📝 TEXTO DE TELA — COPIE PRO CAPCUT</span>
        <button type="button" onClick={() => copy(tudo, "Texto de tela copiado")} style={{
          padding: "2px 8px", background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5,
          cursor: "pointer", fontFamily: F.m, fontSize: 9, color: C.muted,
        }}>copiar tudo</button>
      </div>
      <div style={{ display: "flex", gap: 3, marginBottom: 6 }}>
        {cortes.map((c, i) => (
          <div key={i} style={{ flex: 1, height: 3, background: i === 0 ? C.gold : i === cortes.length - 1 ? C.green : C.cyan, opacity: 0.7 }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
        {cortes.map((c, i) => (
          <div key={i} style={{ background: C.s3, border: `1px solid ${C.border}`, borderRadius: 6, padding: "7px 9px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
              <span style={{ fontFamily: F.m, fontSize: 8, color: C.gold }}>{c.segundo}</span>
              <button type="button" onClick={() => copy(c.texto_tela)} style={{
                background: "transparent", border: "none", cursor: "pointer", fontSize: 11, padding: 0,
              }}>📋</button>
            </div>
            <div style={{ fontFamily: F.t, fontSize: 13, fontWeight: 700, color: C.white, letterSpacing: 0.5, whiteSpace: "pre-line", marginTop: 2 }}>
              {c.texto_tela}
            </div>
            {(c.posicao || c.estilo) && (
              <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 3 }}>
                {[c.posicao, c.estilo].filter(Boolean).join(" · ")}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ViralExtras({ kit }: { kit: ViralKit }) {
  const tags = achatarHashtags(kit.hashtags);
  return (
    <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
      {(kit.cta_post || kit.cta_caption) && (
        <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.gold, letterSpacing: 2, marginBottom: 4 }}>CTA CERTO</div>
          {kit.cta_post && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text }}>No post: {kit.cta_post}</div>}
          {kit.cta_caption && <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginTop: 2 }}>Na legenda: {kit.cta_caption}</div>}
        </div>
      )}
      {kit.self_comment && (
        <div style={{ background: `${C.green}08`, border: `1px solid ${C.green}25`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.green, letterSpacing: 2 }}>SELF-COMMENT · POSTE EM 30s</span>
            <button type="button" onClick={() => copy(kit.self_comment!, "Self-comment copiado")} style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: 11, padding: 0,
            }}>📋</button>
          </div>
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, marginTop: 3 }}>{kit.self_comment}</div>
        </div>
      )}
      {tags && (
        <div style={{ background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: "8px 10px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 8, marginBottom: 4 }}>
            <span style={{ fontFamily: F.m, fontSize: 8, color: C.cyan, letterSpacing: 2 }}>HASHTAGS · 3 CAMADAS</span>
            <button type="button" onClick={() => copy(tags, "Hashtags copiadas")} style={{
              background: "transparent", border: "none", cursor: "pointer", fontSize: 11, padding: 0,
            }}>📋</button>
          </div>
          {([["Alcance", kit.hashtags?.alcance], ["Nicho", kit.hashtags?.nicho], ["Micro", kit.hashtags?.micro]] as const).map(
            ([label, arr]) =>
              arr?.length ? (
                <div key={label} style={{ fontFamily: F.b, fontSize: 10, color: C.text, marginTop: 3 }}>
                  <span style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{label}: </span>
                  {arr.join(" ")}
                </div>
              ) : null,
          )}
        </div>
      )}
    </div>
  );
}
