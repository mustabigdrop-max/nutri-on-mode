import { useEffect } from "react";
import { Link } from "react-router-dom";
import { BIO_LINKS, registrarCliqueBio } from "@/lib/socialGrowth";

const BG = "#0A0A0A";
const INK = "#F5F0E8";
const GOLD = "#EF9F27";
const MUTED = "#888888";

export default function BioLinkPage() {
  useEffect(() => {
    document.title = "Diogo Mello · nutriON — links oficiais";
    const desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", "Diagnóstico MCE gratuito, nutriON, NEXUS-BIO e contato direto com o Coach Diogo Mello.");
    void registrarCliqueBio("pageview");
  }, []);

  return (
    <main style={{ background: BG, minHeight: "100vh", color: INK, padding: "48px 20px" }}>
      <div style={{ maxWidth: 460, margin: "0 auto", textAlign: "center" }}>
        <p style={{ fontSize: 30, fontWeight: 800, letterSpacing: 1 }}>
          nutri<span style={{ color: GOLD }}>ON</span>
        </p>
        <p style={{ color: MUTED, fontFamily: "monospace", fontSize: 13, marginTop: 4 }}>@diogo.mell0</p>

        <h1 style={{ fontSize: 18, fontWeight: 700, marginTop: 22 }}>Coach de Nutrição &amp; Treino</h1>
        <p style={{ color: MUTED, fontSize: 14, marginTop: 6, lineHeight: 1.6 }}>
          Criador do Método MCE<br />16 anos de Marinha do Brasil
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 30 }}>
          {BIO_LINKS.map((l) => {
            const conteudo = (
              <>
                <span style={{ fontSize: 15, fontWeight: 700, display: "block" }}>{l.icone} {l.titulo}</span>
                <span style={{ fontSize: 12, color: MUTED, display: "block", marginTop: 3 }}>{l.sub}</span>
              </>
            );
            const estilo: React.CSSProperties = {
              display: "block",
              padding: "16px 18px",
              borderRadius: 12,
              border: `1px solid ${GOLD}66`,
              background: "rgba(239,159,39,0.06)",
              color: INK,
              textDecoration: "none",
              textAlign: "left",
            };
            return l.externo ? (
              <a key={l.id} href={l.href} target="_blank" rel="noopener noreferrer" style={estilo} onClick={() => void registrarCliqueBio(l.id)}>
                {conteudo}
              </a>
            ) : (
              <Link key={l.id} to={l.href} style={estilo} onClick={() => void registrarCliqueBio(l.id)}>
                {conteudo}
              </Link>
            );
          })}
        </div>

        <p style={{ color: MUTED, fontSize: 11, fontFamily: "monospace", marginTop: 34, letterSpacing: 1 }}>
          nutriON · Transformação é sistema.
        </p>
      </div>
    </main>
  );
}
