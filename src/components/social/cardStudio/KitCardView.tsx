// Card do kit em tamanho real (1080 de largura). Todo texto é HTML; foto/ilustração só entram como fundo.
import { forwardRef } from "react";
import { FORMATOS, corTextoAA, type Formato } from "@/lib/cardStudio";
import type { KitCard } from "@/lib/cardKits";
import type { Brand } from "./CardTemplate";
import { KitIcon } from "./KitIcons";

export type Variante = "sem" | "ilustracao" | "foto" | "gerada";
interface Props { c: KitCard; formato: Formato; brand: Brand; variante: Variante; fotoUrl?: string | null }

export const KitCardView = forwardRef<HTMLDivElement, Props>(function KitCardView({ c, formato, brand, variante, fotoUrl }, ref) {
  const { w, h } = FORMATOS[formato];
  const top = formato === "9:16" ? Math.max(250, brand.margem_topo) : 120, bot = formato === "9:16" ? Math.max(340, brand.margem_base) : 120;
  const txt = corTextoAA(brand.cor_fundo, "#F5F0E8"), pri = corTextoAA(brand.cor_fundo, brand.cor_primaria), sec = corTextoAA(brand.cor_fundo, brand.cor_secundaria);
  const FT = `'${brand.fonte_titulo}', 'Rajdhani', sans-serif`, FM = "'Space Mono', monospace";
  const semImg = variante === "sem"; const foto = variante === "foto" && fotoUrl;
  const big = (s: string) => { const n = s.length; const b = semImg ? 120 : 100; return n <= 20 ? b : n <= 45 ? b * 0.75 : n <= 80 ? b * 0.58 : b * 0.46; };
  const H = (s: string, color = txt, size?: number): React.CSSProperties => ({ fontFamily: FT, fontWeight: 700, fontSize: size ?? big(s), lineHeight: 1.05, color, textTransform: "uppercase", margin: 0, overflowWrap: "anywhere" });
  const S: React.CSSProperties = { fontFamily: FM, fontSize: 34, lineHeight: 1.4, color: txt, margin: 0 };
  const icon = variante === "ilustracao" ? <div style={{ display: "flex", justifyContent: "center" }}><KitIcon id={c.icone} cor={pri} acento={sec} size={h < 1400 ? 240 : 360} /></div> : null;
  const sec2 = c.prova?.nivel === "secundaria";
  let body: JSX.Element;
  switch (c.papel) {
    case "mito_verdade": case "dizem_estudos":
      body = <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
        <p style={{ ...S, color: pri }}>{c.principal.toUpperCase()}</p>
        <div style={{ borderLeft: "14px solid #EF4444", paddingLeft: 28 }}><p style={{ ...S, color: "#F2B8B8", fontSize: 30 }}>{c.papel === "mito_verdade" ? "MITO" : "O QUE DIZEM"}</p><p style={{ ...H(c.esquerda ?? "", txt, big(c.esquerda ?? "") * 0.8), textDecoration: c.papel === "mito_verdade" ? "line-through" : "none", textDecorationColor: "#EF4444" }}>{c.esquerda}</p></div>
        {icon}
        <div style={{ borderLeft: `14px solid ${pri}`, paddingLeft: 28 }}><p style={{ ...S, color: pri, fontSize: 30 }}>{c.papel === "mito_verdade" ? "VERDADE" : "O QUE OS ESTUDOS MOSTRAM"}</p><p style={H(c.direita ?? "", txt, big(c.direita ?? "") * 0.8)}>{c.direita}</p></div>
      </div>; break;
    case "dizer":
      body = <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
        <p style={{ ...S, color: pri }}>O QUE DIZER</p><p style={H(c.esquerda ?? "", txt, 64)}>{c.esquerda}</p>
        <p style={{ ...S, color: "#F2B8B8", marginTop: 20 }}>O QUE NÃO DIZER</p>
        {(c.itens ?? []).map((x, i) => <p key={i} style={{ ...S, fontSize: 38, textDecoration: "line-through", textDecorationColor: "#EF4444" }}>× {x}</p>)}
      </div>; break;
    case "limites": case "fontes": case "fechamento":
      body = <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
        <p style={H(c.principal, pri, 90)}>{c.principal}</p>{icon}
        {(c.itens ?? []).map((x, i) => <p key={i} style={{ ...S, fontSize: c.papel === "fontes" ? 30 : 36 }}>{c.papel === "fontes" ? `${i + 1}. ` : "— "}{x}</p>)}
        {c.secundario && <p style={{ ...S, color: sec, marginTop: 16 }}>{c.secundario}</p>}
      </div>; break;
    case "prova_bloqueada":
      body = <div style={{ border: "4px dashed #888", padding: 48, display: "flex", flexDirection: "column", gap: 24, background: "#11111a" }}>
        <p style={H("PROVA BLOQUEADA", "#B0B0B8", 90)}>PROVA BLOQUEADA</p><p style={{ ...S, color: "#B0B0B8" }}>{c.secundario}</p></div>; break;
    case "ressalva":
      body = <div style={{ display: "flex", flexDirection: "column", gap: 30, border: `6px solid ${sec}`, padding: 48 }}>
        <p style={{ ...S, color: sec }}>ATENÇÃO</p>{icon}<p style={H(c.principal, txt, Math.min(96, big(c.principal)))}>{c.principal}</p>{c.secundario && <p style={S}>{c.secundario}</p>}</div>; break;
    default:
      body = <div style={{ display: "flex", flexDirection: "column", gap: 36, textAlign: c.papel === "prova" ? "center" : "left" }}>
        {icon}<p style={H(c.principal, c.papel === "prova" ? pri : txt)}>{c.principal}</p>
        {c.secundario && <p style={S}>{c.secundario}</p>}
        {c.papel === "prova" && c.fonte && <p style={{ ...S, fontSize: 28, color: "#C8C8D0" }}>{c.fonte}</p>}
      </div>;
  }
  return <div ref={ref} style={{ width: w, height: h, position: "relative", overflow: "hidden", background: brand.cor_fundo, boxSizing: "border-box" }}>
    {foto && <><img src={fotoUrl!} alt="" crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${brand.cor_fundo}cc, ${brand.cor_fundo}ee 45%, ${brand.cor_fundo}f5)` }} /></>}
    {semImg && <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 18, background: pri }} />}
    <div style={{ position: "absolute", left: 90, right: 90, top, bottom: c.papel === "prova" && c.selo && c.mostrarSelo !== false ? bot + 110 : bot, display: "flex", flexDirection: "column", justifyContent: "center" }}>{body}</div>
    {c.papel === "prova" && c.mostrarSelo !== false && c.selo && <div style={{ position: "absolute", left: 90, right: 90, bottom: bot, padding: "16px 22px", background: sec2 ? "#EF9F27" : "#5DCAA5", color: "#0A0A0A", fontFamily: FM, fontSize: 28, fontWeight: 700 }}>
      {c.selo}{sec2 ? " · CONFERIR NO ORIGINAL" : ""}</div>}
    {c.mostrarHandle !== false && brand.handle && <div style={{ position: "absolute", left: 90, bottom: Math.max(60, bot - 220), fontFamily: FM, fontSize: 30, color: txt, opacity: 0.85 }}>{brand.handle}</div>}
  </div>;
});
