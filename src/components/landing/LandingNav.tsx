import { useState, useEffect, type CSSProperties } from "react";
import { Menu, X } from "lucide-react";

// Mesma paleta/tipografia da nova LandingHero — grafite + ouro fosco,
// sem o glow neon. Tokens do tema global (--primary etc.) seguem intocados.
const GOLD = "#B8922A";
const BONE = "#F4EFE3";
const DIM = "#9A9280";
const INK = "#14120F";
const MONO = "'JetBrains Mono', 'Space Mono', monospace";
const DISPLAY = "'Big Shoulders Display', 'Rajdhani', sans-serif";

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkStyle: CSSProperties = {
    fontFamily: "'Work Sans', sans-serif",
    fontSize: "0.85rem",
    fontWeight: 500,
    color: DIM,
    letterSpacing: "0.01em",
  };

  const navLinks = [
    { href: "#protocols", label: "Protocolos" },
    { href: "#features", label: "Módulos" },
    { href: "#coach", label: "Coach" },
    { href: "#plans", label: "Planos" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-5 flex items-center justify-between border-b transition-all duration-400 ${
        scrolled ? "backdrop-blur-[20px]" : "border-transparent"
      }`}
      style={{ background: scrolled ? "rgba(20,18,15,0.92)" : "transparent", borderColor: scrolled ? "rgba(244,239,227,0.08)" : "transparent" }}
    >
      <div style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: "1.5rem", letterSpacing: "0.01em", textTransform: "uppercase" }}>
        <span style={{ color: BONE, opacity: 0.9 }}>Nutri</span>
        <span style={{ color: GOLD }}>on</span>
      </div>

      {/* Desktop */}
      <div className="hidden md:flex items-center gap-7">
        {navLinks.map((l) => (
          <a
            key={l.href}
            href={l.href}
            style={linkStyle}
            className="transition-colors hover:!text-[#F4EFE3]"
          >
            {l.label}
          </a>
        ))}
        <a href="/auth" style={{ ...linkStyle, color: DIM, opacity: 0.75 }} className="transition-colors hover:!text-[#F4EFE3]">
          Entrar
        </a>
        <a
          href="https://pay.kiwify.com.br/G8uxU9O"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            background: GOLD,
            color: INK,
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: "0.72rem",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            padding: "0.6rem 1.15rem",
          }}
          className="transition-[filter] hover:brightness-110"
        >
          Começar agora →
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden p-1"
        style={{ color: BONE }}
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 backdrop-blur-[20px] border-b flex flex-col items-center gap-5 py-6 md:hidden"
          style={{ background: "rgba(20,18,15,0.95)", borderColor: "rgba(244,239,227,0.08)" }}
        >
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} style={linkStyle} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="/auth" style={{ ...linkStyle, opacity: 0.75 }} onClick={() => setMenuOpen(false)}>
            Entrar
          </a>
          <a
            href="https://pay.kiwify.com.br/G8uxU9O"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              background: GOLD,
              color: INK,
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: "0.72rem",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              padding: "0.6rem 1.15rem",
            }}
            onClick={() => setMenuOpen(false)}
          >
            Começar agora →
          </a>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
