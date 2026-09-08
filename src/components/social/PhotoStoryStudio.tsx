import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  PHOTO_TEMPLATES,
  defaultStoryTexts,
  ensureFonts,
  loadImage,
  renderPhotoStory,
  type PhotoTemplate,
  type StoryTexts,
} from "@/lib/photoStoryTemplates";

const C = {
  s2: "#10101A", s3: "#181824", border: "#ffffff14",
  gold: "#EF9F27", text: "#C8C8D8", white: "#F0F0F8", muted: "#6A6A7A",
};
const F = { t: "'Rajdhani',sans-serif", m: "'Space Mono',monospace", b: "'Inter',sans-serif" };

const btn = (color: string): React.CSSProperties => ({
  padding: "7px 12px",
  background: `${color}14`,
  border: `1px solid ${color}44`,
  borderRadius: 6,
  cursor: "pointer",
  fontFamily: F.t,
  fontSize: 11,
  fontWeight: 700,
  color,
});

/** Campo de texto do template ativo (o coach edita e o story re-renderiza). */
function editorFor(template: PhotoTemplate, texts: StoryTexts, set: (t: StoryTexts) => void) {
  const input = (value: string, onChange: (v: string) => void, placeholder: string, multiline = false) => {
    const style: React.CSSProperties = {
      width: "100%", background: C.s3, border: `1px solid ${C.border}`, borderRadius: 6,
      padding: "6px 8px", color: C.white, fontFamily: F.b, fontSize: 11, marginBottom: 6,
    };
    return multiline ? (
      <textarea value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} rows={2} style={style} />
    ) : (
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} style={style} />
    );
  };

  if (template === "FRASE") return input(texts.frase || "", (v) => set({ ...texts, frase: v }), "Frase de impacto", true);
  if (template === "MINIMO") return input(texts.minimo || "", (v) => set({ ...texts, minimo: v }), "Frase curta");
  if (template === "CTA")
    return input(texts.cta?.pergunta || "", (v) => set({ ...texts, cta: { pergunta: v } }), "Pergunta do CTA");
  if (template === "DADO")
    return (
      <>
        {input(texts.dado?.numero || "", (v) => set({ ...texts, dado: { ...texts.dado, numero: v } }), "Número (ex: -15%)")}
        {input(texts.dado?.descricao || "", (v) => set({ ...texts, dado: { ...texts.dado, descricao: v } }), "O que significa", true)}
        {input(texts.dado?.fonte || "", (v) => set({ ...texts, dado: { ...texts.dado, fonte: v } }), "Fonte (autor, ano)")}
      </>
    );
  return (
    <>
      {input(texts.rotina?.hora || "", (v) => set({ ...texts, rotina: { ...texts.rotina, hora: v } }), "Hora")}
      {input(texts.rotina?.nome || "", (v) => set({ ...texts, rotina: { ...texts.rotina, nome: v } }), "Nome do treino")}
      {input(texts.rotina?.detalhes || "", (v) => set({ ...texts, rotina: { ...texts.rotina, detalhes: v } }), "Detalhes (5x5 · 40min)")}
      {input(texts.rotina?.frase || "", (v) => set({ ...texts, rotina: { ...texts.rotina, frase: v } }), "Frase", true)}
    </>
  );
}

/**
 * Story 1080x1920 com a foto real do coach: escolhe o estilo, o texto vem
 * pronto (e é editável) e o download sai no tamanho certo pro Instagram.
 */
export default function PhotoStoryStudio({
  file, tema, handle, onClose,
}: {
  file: File;
  tema: string;
  handle?: string;
  onClose: () => void;
}) {
  const [photo, setPhoto] = useState<HTMLImageElement | null>(null);
  const [template, setTemplate] = useState<PhotoTemplate>("FRASE");
  const [texts, setTexts] = useState<StoryTexts>(() => defaultStoryTexts(tema));
  const [thumbs, setThumbs] = useState<Record<string, string>>({});
  const [preview, setPreview] = useState("");
  const [loadingText, setLoadingText] = useState(false);
  const at = handle || "diogo.mell0";

  useEffect(() => {
    let vivo = true;
    (async () => {
      try {
        await ensureFonts();
        const img = await loadImage(file);
        if (vivo) setPhoto(img);
      } catch (e) {
        toast.error(e instanceof Error ? e.message : "Não consegui abrir essa foto.");
        onClose();
      }
    })();
    return () => {
      vivo = false;
    };
  }, [file, onClose]);

  const gerarTextos = useCallback(async () => {
    setLoadingText(true);
    try {
      const { data, error } = await supabase.functions.invoke("social-on-generate", {
        body: { mode: "photo_story", topic: tema, handle: at },
      });
      if (error) throw new Error(error.message);
      const r = (data?.result || {}) as StoryTexts;
      setTexts((prev) => ({
        frase: r.frase || prev.frase,
        minimo: r.minimo || prev.minimo,
        cta: { pergunta: r.cta?.pergunta || prev.cta?.pergunta },
        dado: { ...prev.dado, ...(r.dado || {}) },
        rotina: { ...prev.rotina, ...(r.rotina || {}) },
      }));
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Não consegui gerar o texto agora.");
    } finally {
      setLoadingText(false);
    }
  }, [tema, at]);

  // textos automáticos assim que abre
  useEffect(() => {
    void gerarTextos();
  }, [gerarTextos]);

  // thumbnails dos 5 estilos com a foto do coach
  useEffect(() => {
    if (!photo) return;
    const next: Record<string, string> = {};
    for (const t of PHOTO_TEMPLATES) next[t.id] = renderPhotoStory(photo, t.id, texts, at);
    setThumbs(next);
    setPreview(next[template] || "");
  }, [photo, texts, template, at]);

  const baixar = () => {
    if (!preview) return;
    const a = document.createElement("a");
    a.href = preview;
    a.download = `story-${template.toLowerCase()}-1080x1920.png`;
    a.click();
    toast.success("Story salvo em 1080x1920.");
  };

  const hint = useMemo(() => PHOTO_TEMPLATES.find((t) => t.id === template)?.hint || "", [template]);

  return (
    <div style={{ marginTop: 8, background: C.s2, border: `1px solid ${C.border}`, borderRadius: 8, padding: 10 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: C.gold }}>
          📸 STORY COM SUA FOTO · 1080×1920
        </span>
        <button type="button" onClick={onClose} style={{ ...btn(C.muted), padding: "3px 8px" }}>
          Fechar
        </button>
      </div>

      {!photo ? (
        <div style={{ fontFamily: F.b, fontSize: 11, color: C.text }}>Abrindo sua foto…</div>
      ) : (
        <>
          <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: C.muted, marginBottom: 6 }}>
            ESCOLHA O ESTILO
          </div>
          <div style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4, marginBottom: 10 }}>
            {PHOTO_TEMPLATES.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTemplate(t.id)}
                title={t.hint}
                style={{
                  flexShrink: 0, background: "transparent", cursor: "pointer", padding: 0,
                  border: `1px solid ${template === t.id ? C.gold : C.border}`, borderRadius: 6, overflow: "hidden",
                }}
              >
                {thumbs[t.id] && (
                  <img src={thumbs[t.id]} alt={t.label} style={{ width: 62, height: 110, objectFit: "cover", display: "block" }} />
                )}
                <div
                  style={{
                    fontFamily: F.m, fontSize: 8, letterSpacing: 1, padding: "3px 0",
                    color: template === t.id ? C.gold : C.muted,
                  }}
                >
                  {t.label}
                </div>
              </button>
            ))}
          </div>

          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {preview && (
              <img
                src={preview}
                alt="Preview do story"
                style={{ width: 150, borderRadius: 8, border: `1px solid ${C.border}`, alignSelf: "flex-start" }}
              />
            )}
            <div style={{ flex: 1, minWidth: 200 }}>
              <div style={{ fontFamily: F.m, fontSize: 8, letterSpacing: 1, color: C.muted, marginBottom: 6 }}>
                EDITAR TEXTO · {hint.toUpperCase()}
              </div>
              {editorFor(template, texts, setTexts)}
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                <button type="button" onClick={gerarTextos} disabled={loadingText} style={btn(C.gold)}>
                  {loadingText ? "Gerando texto…" : "🔄 Gerar outro texto"}
                </button>
                <button type="button" onClick={baixar} style={btn("#22C55E")}>
                  📥 Baixar story
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
