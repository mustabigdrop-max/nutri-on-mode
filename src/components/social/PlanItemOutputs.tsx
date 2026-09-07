import { useState } from "react";
import { toast } from "sonner";
import { downloadMany } from "@/lib/socialImageKit";
import type { StoryScript } from "@/lib/storyFrameTemplate";

const C = {
  s2: "#10101A", s3: "#181824", border: "#ffffff10",
  cyan: "#00D4FF", gold: "#EF9F27", green: "#22C55E", red: "#EF4444",
  muted: "#4A4A5A", text: "#C8C8D8", white: "#F0F0F8", bg: "#020205",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success("Copiado");
};

function CopyBtn({ text }: { text: string }) {
  return (
    <button
      type="button"
      onClick={() => copy(text)}
      style={{ background: "transparent", border: `1px solid ${C.border}`, borderRadius: 5, cursor: "pointer", padding: "2px 6px", fontSize: 11, color: C.muted }}
      title="Copiar"
    >
      📋
    </button>
  );
}

// ── TIPO 2: pack de interação ───────────────────────────────
export interface InteractionPack {
  contexto?: string;
  respostas_elogio?: string[];
  respostas_duvida?: string[];
  respostas_marcou_amigo?: string[];
  respostas_critica?: string[];
  self_comment?: string;
  dica?: string;
}

function Group({ label, items }: { label: string; items: string[] }) {
  const [open, setOpen] = useState(false);
  if (!items.length) return null;
  return (
    <div style={{ borderTop: `1px solid ${C.border}` }}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", background: "transparent", border: "none", cursor: "pointer", padding: "8px 0", fontFamily: F.t, fontSize: 12, fontWeight: 700, color: C.white }}
      >
        <span>▸ {label} ({items.length})</span>
        <span style={{ color: C.muted }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingBottom: 8 }}>
          {items.map((t, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "flex-start", background: C.s2, borderRadius: 6, padding: 8 }}>
              <span style={{ flex: 1, fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{t}</span>
              <CopyBtn text={t} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InteractionPackCard({ pack, time }: { pack: InteractionPack; time?: string }) {
  return (
    <div style={{ background: C.s3, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.gold, letterSpacing: 1, marginBottom: 8 }}>
        ⚡ PACK DE INTERAÇÃO {time ? `— ${time}` : ""}
      </div>
      {pack.contexto && (
        <div style={{ fontFamily: F.m, fontSize: 9, color: C.muted, marginBottom: 8 }}>Contexto: {pack.contexto}</div>
      )}
      {pack.self_comment && (
        <div style={{ display: "flex", gap: 6, alignItems: "flex-start", background: `${C.gold}12`, border: `1px solid ${C.gold}35`, borderRadius: 6, padding: 8, marginBottom: 8 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.gold, marginBottom: 3 }}>📌 SELF-COMMENT (FIXAR NO TOPO)</div>
            <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5 }}>{pack.self_comment}</div>
          </div>
          <CopyBtn text={pack.self_comment} />
        </div>
      )}
      <Group label="Respostas para elogios" items={pack.respostas_elogio || []} />
      <Group label="Respostas para dúvidas" items={pack.respostas_duvida || []} />
      <Group label="Respostas para marcações" items={pack.respostas_marcou_amigo || []} />
      <Group label="Respostas para críticas" items={pack.respostas_critica || []} />
      {pack.dica && (
        <div style={{ marginTop: 8, fontFamily: F.b, fontSize: 10, color: C.cyan }}>💡 {pack.dica}</div>
      )}
    </div>
  );
}

// ── TIPO 4: gestão de DMs ───────────────────────────────────
export interface DmScripts {
  categoria_leads?: { titulo?: string; script?: string; followup_24h?: string; followup_48h?: string };
  categoria_duvidas?: { titulo?: string; script?: string; cta_final?: string };
  categoria_elogios?: { titulo?: string; script?: string; cta_sutil?: string };
  categoria_spam?: { titulo?: string; acao?: string };
  meta?: string;
}

function DmBlock({ dot, title, lines }: { dot: string; title: string; lines: { label: string; text: string }[] }) {
  const all = lines.map((l) => l.text).join("\n\n");
  if (!lines.length) return null;
  return (
    <div style={{ background: C.s2, borderRadius: 6, padding: 8, marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
        <span style={{ fontFamily: F.t, fontSize: 12, fontWeight: 700, color: C.white }}>{dot} {title}</span>
        <CopyBtn text={all} />
      </div>
      {lines.map((l, i) => (
        <div key={i} style={{ marginTop: 4 }}>
          <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted }}>{l.label}</div>
          <div style={{ fontFamily: F.b, fontSize: 11, color: C.text, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{l.text}</div>
        </div>
      ))}
    </div>
  );
}

export function DmScriptsCard({ data, time }: { data: DmScripts; time?: string }) {
  const l = data.categoria_leads || {};
  const d = data.categoria_duvidas || {};
  const e = data.categoria_elogios || {};
  const s = data.categoria_spam || {};
  return (
    <div style={{ background: C.s3, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.cyan, letterSpacing: 1, marginBottom: 8 }}>
        📊 GESTÃO DE DMs {time ? `— ${time}` : ""}
      </div>
      <DmBlock
        dot="🔴"
        title={l.titulo || "Leads quentes (responder agora)"}
        lines={[
          l.script ? { label: "SCRIPT PRINCIPAL", text: l.script } : null,
          l.followup_24h ? { label: "FOLLOW-UP 24H", text: l.followup_24h } : null,
          l.followup_48h ? { label: "FOLLOW-UP 48H", text: l.followup_48h } : null,
        ].filter(Boolean) as { label: string; text: string }[]}
      />
      <DmBlock
        dot="🟡"
        title={d.titulo || "Dúvidas técnicas"}
        lines={[
          d.script ? { label: "SCRIPT", text: d.script } : null,
          d.cta_final ? { label: "CTA FINAL", text: d.cta_final } : null,
        ].filter(Boolean) as { label: string; text: string }[]}
      />
      <DmBlock
        dot="🟢"
        title={e.titulo || "Elogios"}
        lines={[
          e.script ? { label: "SCRIPT", text: e.script } : null,
          e.cta_sutil ? { label: "CTA SUTIL", text: e.cta_sutil } : null,
        ].filter(Boolean) as { label: string; text: string }[]}
      />
      {s.acao && (
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.muted, marginBottom: 6 }}>⚫ {s.titulo || "Spam"} — {s.acao}</div>
      )}
      {data.meta && <div style={{ fontFamily: F.b, fontSize: 10, color: C.green }}>💡 {data.meta}</div>}
    </div>
  );
}

// ── TIPOS 3 e 5: stories ────────────────────────────────────
export const storyScriptText = (script: StoryScript) =>
  [
    script.tema ? `TEMA: ${script.tema}` : "",
    ...(script.frames || []).map((f, i) =>
      [
        `FRAME ${i + 1} — ${(f.tipo || "").replace(/_/g, " ")}`,
        f.instrucao ? `Gravação: ${f.instrucao}` : "",
        f.texto_tela ? `Texto na tela: ${f.texto_tela}` : "",
        f.texto_principal || "",
        f.destaque || "",
        f.texto_secundario || "",
        f.pergunta ? `Enquete: ${f.pergunta} (${f.opcao_1} / ${f.opcao_2})` : "",
        f.cta ? `CTA: ${f.cta}` : "",
        f.subtexto || "",
      ].filter(Boolean).join("\n"),
    ),
    script.dica_gravacao ? `DICA: ${script.dica_gravacao}` : "",
  ].filter(Boolean).join("\n\n");

export function StoryFramesCard({
  script, images, title, time,
}: { script: StoryScript; images: string[]; title: string; time?: string }) {
  return (
    <div style={{ background: C.s3, border: `1px solid ${C.border}`, borderRadius: 8, padding: 12 }}>
      <div style={{ fontFamily: F.m, fontSize: 9, color: C.gold, letterSpacing: 1, marginBottom: 8 }}>
        ✦ {title} {time ? `— ${time}` : ""}
      </div>
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 6 }}>
        {(script.frames || []).map((f, i) => (
          <div key={i} style={{ width: 132, flexShrink: 0 }}>
            {images[i] && (
              <img src={images[i]} alt={`Frame ${i + 1}`} style={{ width: 132, height: 235, objectFit: "cover", borderRadius: 6, border: `1px solid ${C.border}` }} />
            )}
            <div style={{ fontFamily: F.m, fontSize: 8, color: C.muted, marginTop: 4 }}>
              {i + 1} · {(f.tipo || "").replace(/_/g, " ")}
            </div>
            {f.instrucao && (
              <div style={{ fontFamily: F.b, fontSize: 10, color: C.text, lineHeight: 1.4, marginTop: 2 }}>{f.instrucao}</div>
            )}
            {(f.texto_tela || f.texto_principal) && (
              <div style={{ display: "flex", gap: 4, alignItems: "flex-start", marginTop: 4 }}>
                <span style={{ flex: 1, fontFamily: F.b, fontSize: 10, color: C.white, lineHeight: 1.4 }}>
                  {f.texto_tela || f.texto_principal}
                </span>
                <CopyBtn text={(f.texto_tela || f.texto_principal) as string} />
              </div>
            )}
          </div>
        ))}
      </div>
      {script.dica_gravacao && (
        <div style={{ fontFamily: F.b, fontSize: 10, color: C.cyan, marginTop: 6 }}>💡 {script.dica_gravacao}</div>
      )}
      <div style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={async () => {
            const n = await downloadMany(images.map((url, i) => ({ url, filename: `story-frame-${i + 1}.png` })));
            if (n) toast.success(`${n} frames baixados!`);
            else toast.error("Não consegui baixar os frames");
          }}
          disabled={!images.length}
          style={{ flex: 1, minWidth: 110, padding: "6px 0", background: C.gold, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: C.bg }}
        >
          📥 BAIXAR FRAMES
        </button>
        <button
          type="button"
          onClick={() => copy(storyScriptText(script))}
          style={{ flex: 1, minWidth: 110, padding: "6px 0", background: C.cyan, border: "none", borderRadius: 6, cursor: "pointer", fontFamily: F.t, fontSize: 11, fontWeight: 700, color: C.bg }}
        >
          📋 COPIAR ROTEIRO
        </button>
      </div>
    </div>
  );
}
