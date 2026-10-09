// Card do kit em tamanho real (1080 de largura). Todo texto é HTML; ilustração em SVG de código, foto só como fundo.
// Templates P2: A Capa, B Mecanismo, C Prova, D Há × Falta, E Ressalva, F Fontes (+ papéis do P1).
import { forwardRef } from "react";
import { FORMATOS, corTextoAA, type Formato } from "@/lib/cardStudio";
import { seloLinhas, type KitCard } from "@/lib/cardKits";
import type { Brand } from "./CardTemplate";
import { KitIcon, BrainSVG } from "./KitIcons";

export type Variante = "sem" | "ilustracao" | "foto" | "gerada";
interface Props { c: KitCard; formato: Formato; brand: Brand; variante: Variante; fotoUrl?: string | null; total?: number }

const VERDE = "#4ADE9A", AMBAR = "#F5A524", VERMELHO = "#FF6B6B", APOIO = "#8FA3B5";
const TAG: Record<string, string> = { capa: "CAPA", gancho: "PERGUNTA", mito_verdade: "MITO × VERDADE", dizem_estudos: "O QUE DIZEM", prova: "PROVA", ha_falta: "HÁ × FALTA", mecanismo: "MECANISMO", dizer: "ROTEIRO", ressalva: "RESSALVA", cta: "PRÓXIMO PASSO", limites: "LIMITES", fechamento: "FECHAMENTO", fontes: "FONTES", prova_bloqueada: "PROVA" };

export const KitCardView = forwardRef<HTMLDivElement, Props>(function KitCardView({ c, formato, brand, variante, fotoUrl, total }, ref) {
  const { w, h } = FORMATOS[formato];
  const k = h / 1920; const alto = formato === "9:16";
  const top = alto ? Math.max(250, brand.margem_topo) : Math.round(250 * k * 0.6), bot = alto ? Math.max(340, brand.margem_base) : Math.round(340 * k * 0.6);
  const side = 70; const rodape = alto ? 110 : 50;
  const fundo = brand.cor_fundo;
  const txt = corTextoAA(fundo, "#F2F6FA"), pri = corTextoAA(fundo, brand.cor_primaria), sec = corTextoAA(fundo, brand.cor_secundaria);
  const FT = `'${brand.fonte_titulo}', 'Rajdhani', sans-serif`, FM = "'Space Mono', monospace";
  const semImg = variante === "sem"; const foto = variante === "foto" && fotoUrl; const comImg = variante === "ilustracao";
  const curto = !alto;
  // Ajuste: até 15% menor para caber; o verificador avisa textos longos.
  const fit = (s: string, base: number) => { const n = (s ?? "").length; return Math.round(base * (n <= 22 ? 1 : n <= 45 ? 0.92 : 0.85) * (curto ? 0.8 : 1)); };
  const H = (s: string, size: number, color = txt): React.CSSProperties => ({ fontFamily: FT, fontWeight: 700, fontSize: fit(s, size), lineHeight: 1.02, color, textTransform: "uppercase", margin: 0, overflowWrap: "anywhere" });
  const S = (size = 34, color = txt): React.CSSProperties => ({ fontFamily: FM, fontSize: curto ? Math.round(size * 0.85) : size, lineHeight: 1.35, color, margin: 0 });
  const tag = <p style={{ ...S(30, sec), letterSpacing: 4 }}>{TAG[c.papel] ?? ""}</p>;
  const ilu = (frac: number) => !comImg || c.icone === "nenhum" ? null : <div style={{ display: "flex", justifyContent: "center" }}>
    {c.icone === "cerebro" ? <BrainSVG cor={pri} acento={sec} fundo={fundo} width={Math.round((w - side * 2) * frac * (curto ? 0.7 : 1))} /> : <KitIcon id={c.icone} cor={pri} acento={sec} fundo={fundo} size={Math.round((w - side * 2) * frac * 0.6 * (curto ? 0.7 : 1))} />}</div>;
  const destaque = (t: string) => { const ws = t.split(/\s+/); const n = Math.min(3, Math.max(1, Math.floor(ws.length / 3))); return <>{ws.slice(0, -n).join(" ")} <span style={{ color: sec }}>{ws.slice(-n).join(" ")}</span></>; };

  const sl = seloLinhas(c.prova, c.chip);
  const Selo = () => !sl || c.mostrarSelo === false ? null : <div style={{ border: `3px solid ${sl.cor === "verde" ? VERDE : AMBAR}`, background: "#0A0E16", padding: "22px 28px", display: "flex", flexDirection: "column", gap: 8 }}>
    <p style={S(28, sl.cor === "verde" ? VERDE : AMBAR)}>{sl.tipo}</p>
    {sl.autores && <p style={{ fontFamily: FT, fontWeight: 700, fontSize: curto ? 36 : 44, color: txt, margin: 0, lineHeight: 1.05 }}>{sl.autores}</p>}
    {sl.organizacao && <p style={S(32, APOIO)}>{sl.organizacao}</p>}
    {!sl.autores && c.selo && c.selo !== sl.tipo && <p style={S(28, APOIO)}>{c.selo}</p>}
  </div>;
  const Chip = () => c.chip ? <span style={{ alignSelf: "flex-start", border: `3px solid ${AMBAR}`, color: AMBAR, fontFamily: FM, fontSize: curto ? 24 : 30, padding: "10px 18px", letterSpacing: 2 }}>{c.chip}</span> : null;
  const col = (gap: number, children: React.ReactNode, extra: React.CSSProperties = {}) => <div style={{ display: "flex", flexDirection: "column", gap: curto ? gap * 0.6 : gap, ...extra }}>{children}</div>;

  let body: JSX.Element;
  switch (c.papel) {
    case "capa": case "gancho":
      body = col(36, <>{tag}{ilu(0.85)}
        <p style={H(c.principal, semImg ? 150 : 120)}>{destaque(c.principal)}</p>
        <div style={{ width: 220, height: 8, background: sec }} />
        <Chip />
        {c.secundario && <p style={S(46, APOIO)}>{c.secundario}</p>}</>); break;
    case "mecanismo": {
      const ps = c.passos ?? [];
      body = col(30, <>{tag}<p style={H(c.principal, 96)}>{c.principal}</p>
        {semImg ? <p style={{ ...H(ps.map(p => p.nome).join(" → "), 104, pri), lineHeight: 1.15 }}>{ps.map((p, i) => <span key={i}>{i > 0 && <span style={{ color: sec }}> → </span>}{p.nome}</span>)}</p>
          : <div style={{ display: "flex", flexDirection: "column", alignItems: "stretch" }}>{ps.map((p, i) => <div key={i}>
              {i > 0 && <div style={{ textAlign: "center", color: sec, fontSize: curto ? 40 : 56, lineHeight: 1, margin: "6px 0", fontFamily: FM }}>↓</div>}
              <div style={{ border: `4px solid ${pri}`, padding: curto ? "12px 20px" : "20px 28px", background: `${pri}0D` }}>
                <p style={{ fontFamily: FT, fontWeight: 700, fontSize: curto ? 44 : 60, color: txt, margin: 0, lineHeight: 1 }}>{p.nome}</p>
                {p.detalhe && <p style={S(30, APOIO)}>{p.detalhe}</p>}</div></div>)}</div>}
        <Selo /></>); break;
    }
    case "prova":
      body = col(30, <>{tag}
        {semImg ? (c.numero ? <p style={{ fontFamily: FT, fontWeight: 700, fontSize: curto ? 200 : 260, color: sec, margin: 0, lineHeight: .9 }}>{c.numero}</p> : null) : ilu(0.78)}
        <p style={H(c.principal, 84)}>{c.principal}</p><Selo /><Chip /></>); break;
    case "ha_falta":
      body = col(30, <>{tag}<p style={H(c.principal, 84)}>{c.principal}</p>{ilu(0.46)}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
          {[["O QUE HÁ", c.esquerda, VERDE], ["O QUE FALTA", c.direita, VERMELHO]].map(([t, v, cor]) => <div key={t as string} style={{ border: `4px solid ${cor}`, padding: curto ? 18 : 26, background: `${cor}10`, display: "flex", flexDirection: "column", gap: 12 }}>
            <p style={S(28, cor as string)}>{t}</p><p style={S(34)}>{v}</p></div>)}
        </div><Selo /><Chip /></>); break;
    case "ressalva":
      body = col(30, <>{tag}<p style={H(c.principal, 110)}>{c.principal}</p>{c.secundario && <p style={S(38)}>{c.secundario}</p>}</>, { border: `6px solid ${AMBAR}`, padding: 48, background: `${AMBAR}14` }); break;
    case "fontes":
      body = col(26, <>{tag}<p style={H(c.principal, 100, pri)}>{c.principal}</p>
        {(c.provas?.length ? c.provas.map(p => [p.autores ? seloLinhas(p)?.autores : null, p.ano, p.periodico].filter(Boolean).join(", ") || p.referencia) : c.itens ?? []).map((x, i) => <p key={i} style={S(32)}>{i + 1}. {x}</p>)}
        {c.secundario && <p style={{ ...S(38, sec), marginTop: 20 }}>{c.secundario}</p>}</>); break;
    case "mito_verdade": case "dizem_estudos":
      body = col(36, <>{tag}
        <div style={{ borderLeft: `14px solid ${VERMELHO}`, paddingLeft: 28 }}><p style={S(30, VERMELHO)}>{c.papel === "mito_verdade" ? "MITO" : "O QUE DIZEM"}</p><p style={{ ...H(c.esquerda ?? "", 84), textDecoration: c.papel === "mito_verdade" ? "line-through" : "none", textDecorationColor: VERMELHO }}>{c.esquerda}</p></div>
        {ilu(0.5)}
        <div style={{ borderLeft: `14px solid ${pri}`, paddingLeft: 28 }}><p style={S(30, pri)}>{c.papel === "mito_verdade" ? "VERDADE" : "O QUE OS ESTUDOS MOSTRAM"}</p><p style={H(c.direita ?? "", 76)}>{c.direita}</p></div></>); break;
    case "dizer":
      body = col(30, <>{tag}<p style={S(30, VERDE)}>O QUE DIZER</p><p style={H(c.esquerda ?? "", 64)}>{c.esquerda}</p>
        <p style={{ ...S(30, VERMELHO), marginTop: 20 }}>O QUE NÃO DIZER</p>
        {(c.itens ?? []).map((x, i) => <p key={i} style={{ ...S(36), textDecoration: "line-through", textDecorationColor: VERMELHO }}>× {x}</p>)}</>); break;
    case "limites": case "fechamento":
      body = col(28, <>{tag}<p style={H(c.principal, 90, pri)}>{c.principal}</p>{ilu(0.4)}
        {(c.itens ?? []).map((x, i) => <p key={i} style={S(34)}>— {x}</p>)}
        {c.secundario && <p style={{ ...S(34, sec), marginTop: 16 }}>{c.secundario}</p>}</>); break;
    case "prova_bloqueada":
      body = col(24, <><p style={H("PROVA BLOQUEADA", 90, "#B0B0B8")}>PROVA BLOQUEADA</p><p style={S(34, "#B0B0B8")}>{c.secundario}</p></>, { border: "4px dashed #888", padding: 48, background: "#11111a" }); break;
    default:
      body = col(36, <>{tag}{ilu(0.5)}<p style={H(c.principal, 110)}>{c.principal}</p>{c.secundario && <p style={S(40, APOIO)}>{c.secundario}</p>}</>);
  }
  return <div ref={ref} style={{ width: w, height: h, position: "relative", overflow: "hidden", background: fundo, boxSizing: "border-box" }}>
    <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 40%, ${pri}1A, transparent 70%)` }} />
    {foto && <><img src={fotoUrl!} alt="" crossOrigin="anonymous" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }} />
      <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${fundo}cc, ${fundo}ee 45%, ${fundo}f5)` }} /></>}
    <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${pri}0B 1px, transparent 1px), linear-gradient(90deg, ${pri}0B 1px, transparent 1px)`, backgroundSize: "60px 60px" }} />
    <div style={{ position: "absolute", left: side, right: side, top, bottom: bot, display: "flex", flexDirection: "column", justifyContent: "center" }}>{body}</div>
    <div style={{ position: "absolute", left: side, right: side, bottom: rodape, display: "flex", justifyContent: "space-between", fontFamily: FM, fontSize: 28, color: APOIO }}>
      <span>{c.mostrarHandle !== false ? brand.handle ?? "" : ""}</span>
      {total ? <span>{String(c.idx + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}</span> : <span />}
    </div>
  </div>;
});
