// 8 templates de card em tamanho real (1080 de largura). Todo texto é HTML; imagem gerada só entra como fundo.
import { forwardRef } from "react";
import { FORMATOS, corTextoAA, type CardContent, type Formato, type TemplateId } from "@/lib/cardStudio";
import { Scene } from "./Scenes";

export interface Brand { cor_primaria: string; cor_secundaria: string; cor_fundo: string; fonte_titulo: string; handle: string | null; logo?: string | null; margem_topo: number; margem_base: number }
export const DEFAULT_BRAND: Brand = { cor_primaria: "#00D4FF", cor_secundaria: "#B8922A", cor_fundo: "#020205", fonte_titulo: "Rajdhani", handle: null, logo: null, margem_topo: 250, margem_base: 340 };

interface Props { template: TemplateId; conteudo: CardContent; formato: Formato; brand: Brand; fundoUrl?: string | null; gerada?: boolean }

const fit = (t: string, base: number) => { const n = (t || "").length; return n <= 18 ? base : n <= 36 ? base * 0.78 : n <= 60 ? base * 0.62 : base * 0.5; };

export const CardTemplate = forwardRef<HTMLDivElement, Props>(function CardTemplate({ template, conteudo: c, formato, brand, fundoUrl, gerada }, ref) {
  const { w, h } = FORMATOS[formato];
  const k = h / 1920;
  const top = formato === "9:16" ? brand.margem_topo : Math.round(brand.margem_topo * k * 0.7);
  const bot = formato === "9:16" ? brand.margem_base : Math.round(brand.margem_base * k * 0.7);
  const txt = corTextoAA(brand.cor_fundo, "#F5F0E8");
  const pri = corTextoAA(brand.cor_fundo, brand.cor_primaria);
  const sec = corTextoAA(brand.cor_fundo, brand.cor_secundaria);
  const FT = `'${brand.fonte_titulo}', 'Rajdhani', sans-serif`, FM = "'Space Mono', monospace";
  const short = h < 1400;
  const T = (size: number, color = txt): React.CSSProperties => ({ fontFamily: FT, fontWeight: 700, fontSize: size, lineHeight: 1.02, color, textTransform: "uppercase", margin: 0, overflowWrap: "anywhere" });
  const sceneSize = short ? 300 : 460;
  const scene = c.cena && !fundoUrl ? <div style={{ display: "flex", justifyContent: "center" }}><Scene id={c.cena} cor={pri} acento={sec} intensidade={c.intensidade ?? 0.85} size={sceneSize} /></div> : null;
  const itens = (c.itens ?? []).filter(x => x !== undefined);

  let inner: JSX.Element;
  switch (template) {
    case "mito_verdade":
      inner = <div style={{ display: "flex", flexDirection: "column", gap: short ? 24 : 40, flex: 1, justifyContent: "center" }}>
        <div style={{ borderLeft: `14px solid #EF4444`, paddingLeft: 32 }}><p style={{ fontFamily: FM, fontSize: 34, color: "#EF9A9A", margin: 0 }}>MITO</p><p style={{ ...T(fit(c.esquerda ?? "", 96)), textDecoration: "line-through", textDecorationColor: "#EF4444", opacity: .8 }}>{c.esquerda}</p></div>
        {scene && <div style={{ transform: "scale(.6)", margin: short ? -80 : -100 }}>{scene}</div>}
        <div style={{ borderLeft: `14px solid ${pri}`, paddingLeft: 32 }}><p style={{ fontFamily: FM, fontSize: 34, color: pri, margin: 0 }}>VERDADE</p><p style={T(fit(c.direita ?? c.titulo, 110))}>{c.direita ?? c.titulo}</p></div>
      </div>; break;
    case "numero":
      inner = <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", flex: 1, textAlign: "center", gap: 24 }}>
        <p style={T((c.numero ?? "").length > 5 ? 260 : 380, pri)}>{c.numero}</p>
        <div style={{ width: 240, height: 10, background: sec }} />
        <p style={T(fit(c.rotulo ?? c.titulo, 84))}>{c.rotulo || c.titulo}</p>
        {c.fonte && <p style={{ fontFamily: FM, fontSize: 28, color: "#B0B0B8", margin: "30px 0 0", maxWidth: 860 }}>Fonte: {c.fonte}</p>}
      </div>; break;
    case "comparacao":
      inner = <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 40 }}>
        <p style={{ ...T(fit(c.titulo, 92)), textAlign: "center" }}>{c.titulo}</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {[c.esquerda, c.direita].map((v, i) => <div key={i} style={{ border: `6px solid ${i ? pri : sec}`, padding: 36, minHeight: short ? 220 : 420, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}><p style={T(fit(v ?? "", 72), i ? pri : sec)}>{v}</p></div>)}
        </div>
        {scene && <div style={{ transform: "scale(.55)", margin: -120 }}>{scene}</div>}
      </div>; break;
    case "passos": case "timeline": case "lista3": {
      const list = template === "lista3" ? itens.slice(0, 3) : itens.slice(0, 5);
      inner = <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: short ? 18 : 30 }}>
        <p style={T(fit(c.titulo, 88))}>{c.titulo}</p>
        <div style={{ display: "flex", flexDirection: "column", gap: short ? 12 : 22, position: "relative", paddingLeft: template === "timeline" ? 40 : 0 }}>
          {template === "timeline" && <div style={{ position: "absolute", left: 12, top: 10, bottom: 10, width: 6, background: sec }} />}
          {list.map((it, i) => <div key={i} style={{ display: "flex", gap: 28, alignItems: "center", border: template === "passos" ? `4px solid ${i % 2 ? sec : pri}` : "none", padding: template === "passos" ? "18px 28px" : "6px 0" }}>
            <span style={{ fontFamily: FM, fontSize: 40, color: i % 2 ? sec : pri, minWidth: 70 }}>{template === "lista3" ? "■" : String(i + 1).padStart(2, "0")}</span>
            <span style={T(fit(it, short ? 54 : 64))}>{it}</span></div>)}
        </div>
        {scene && !short && list.length <= 3 && <div style={{ transform: "scale(.6)", margin: -90 }}>{scene}</div>}
      </div>; break;
    }
    case "pergunta":
      inner = <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 40 }}>
        {scene}
        <p style={T(fit(c.titulo, 120))}>{c.titulo}</p>
        <div style={{ height: 8, width: "70%", background: sec }} />
        {c.apoio && <p style={T(52, pri)}>{c.apoio}</p>}
      </div>; break;
    case "capa_serie":
      inner = <div style={{ display: "flex", flexDirection: "column", flex: 1, justifyContent: "center", gap: 30 }}>
        <p style={{ fontFamily: FM, fontSize: 40, color: sec, margin: 0, letterSpacing: 6 }}>SÉRIE</p>
        <p style={T(fit(c.titulo, 150), pri)}>{c.titulo}</p>
        <p style={{ ...T(70), border: `6px solid ${txt}`, padding: "10px 30px", alignSelf: "flex-start" }}>PARTE {c.parte ?? 1}</p>
        {scene}
      </div>; break;
  }

  return <div ref={ref} style={{ width: w, height: h, minWidth: w, maxWidth: "none", flexShrink: 0, background: brand.cor_fundo, position: "relative", overflow: "hidden", boxSizing: "border-box" }}>
    {fundoUrl && <><img src={fundoUrl} crossOrigin="anonymous" alt="" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${brand.cor_fundo}66, ${brand.cor_fundo}E6)` }} /></>}
    <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${pri}10 1px, transparent 1px), linear-gradient(90deg, ${pri}10 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    <div style={{ position: "absolute", left: 100, right: 100, top, bottom: bot, display: "flex", flexDirection: "column" }}>{inner}</div>
    {(brand.handle || brand.logo) && <div style={{ position: "absolute", right: 60, bottom: Math.max(40, bot - 90), display: "flex", alignItems: "center", gap: 14, opacity: .75 }}>
      {brand.logo && <img src={brand.logo} crossOrigin="anonymous" alt="" style={{ height: 48 }} />}
      {brand.handle && <span style={{ fontFamily: FM, fontSize: 28, color: txt }}>{brand.handle}</span>}</div>}
    {gerada && <span style={{ position: "absolute", left: 60, bottom: Math.max(40, bot - 90), fontFamily: FM, fontSize: 22, color: txt, opacity: .7 }}>Ilustração gerada</span>}
  </div>;
});
