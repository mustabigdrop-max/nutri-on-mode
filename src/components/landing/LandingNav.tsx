import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const GOLD = "#B8922A";
const CYAN = "#00D4FF";

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1200);
    return () => clearInterval(id);
  }, []);

  const time = new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  const links = [
    { href: "#protocols", label: "Protocolos" },
    { href: "#features",  label: "Features" },
    { href: "#coach",     label: "Coach" },
    { href: "#plans",     label: "Planos" },
  ];

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-[100] px-5 md:px-10"
      style={{
        background: scrolled
          ? "rgba(10,10,26,0.96)"
          : "rgba(10,10,26,0.0)",
        borderBottom: scrolled ? `1px solid rgba(184,146,42,0.15)` : "1px solid transparent",
        backdropFilter: scrolled ? "blur(16px)" : "none",
        transition: "background 0.4s ease, border-color 0.4s ease",
      }}
    >
      {/* Top micro-line */}
      <div
        className="absolute top-0 left-0 right-0 h-px pointer-events-none"
        style={{ background: `linear-gradient(90deg, transparent, rgba(184,146,42,0.5), rgba(0,212,255,0.3), transparent)` }}
      />

      <div className="flex items-center justify-between h-16">
        {/* Logo */}
        <div className="relative flex items-center gap-3">
          {/* Corner brackets */}
          <div className="absolute -top-1 -left-2 w-3 h-3 border-t border-l" style={{ borderColor: GOLD }} />
          <div className="absolute -bottom-1 -left-2 w-3 h-3 border-b border-l" style={{ borderColor: GOLD }} />
          <span
            className="font-heading text-[1.7rem] tracking-[.12em]"
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
          >
            <span style={{ color: "rgba(245,240,232,0.9)" }}>NUTRI</span>
            <span style={{ color: GOLD, textShadow: `0 0 18px rgba(184,146,42,.5)` }}>ON</span>
          </span>
        </div>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", color: "rgba(80,80,122,1)", textTransform: "uppercase" }}
              className="px-4 py-2 hover:text-[#B8922A] transition-colors relative group"
            >
              {l.label}
              <span className="absolute bottom-0 left-4 right-4 h-px scale-x-0 group-hover:scale-x-100 transition-transform origin-left" style={{ background: GOLD }} />
            </a>
          ))}
          <a
            href="/auth"
            style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.1em", color: "rgba(80,80,122,1)", textTransform: "uppercase" }}
            className="px-4 py-2 hover:text-[#00D4FF] transition-colors"
          >
            Entrar
          </a>

          {/* Live readout */}
          <div
            className="hidden lg:flex items-center gap-2 px-3 py-1 ml-2"
            style={{ border: `1px solid rgba(0,212,255,0.12)`, background: "rgba(0,212,255,0.03)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: CYAN, boxShadow: `0 0 6px ${CYAN}`, animation: "hud-flicker 3s ease-in-out infinite" }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.52rem", letterSpacing: "0.15em", color: `rgba(0,212,255,0.55)` }}>
              {time}
            </span>
          </div>

          {/* CTA */}
          <a
            href="https://pay.kiwify.com.br/G8uxU9O"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-3 relative overflow-hidden group"
            style={{
              background: GOLD,
              color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              padding: "0.55rem 1.25rem",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
              transition: "all 0.25s ease",
            }}
          >
            <span className="relative z-10">Começar agora →</span>
            <span
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: "rgba(255,255,255,0.15)" }}
            />
          </a>
        </div>

        {/* Mobile burger */}
        <button
          className="md:hidden p-2"
          style={{ color: "#f0edf8" }}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div
          className="absolute top-full left-0 right-0 flex flex-col items-center gap-4 py-8 md:hidden"
          style={{ background: "rgba(10,10,26,0.97)", borderBottom: `1px solid rgba(184,146,42,0.15)`, backdropFilter: "blur(20px)" }}
        >
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setMenuOpen(false)}
              style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(80,80,122,1)", textTransform: "uppercase" }}
              className="hover:text-[#B8922A] transition-colors"
            >
              {l.label}
            </a>
          ))}
          <a
            href="/auth"
            onClick={() => setMenuOpen(false)}
            style={{ fontFamily: "'Space Mono', monospace", fontSize: "0.65rem", letterSpacing: "0.15em", color: "rgba(80,80,122,1)", textTransform: "uppercase" }}
            className="hover:text-[#00D4FF] transition-colors"
          >
            Entrar
          </a>
          <a
            href="https://pay.kiwify.com.br/G8uxU9O"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setMenuOpen(false)}
            style={{
              background: GOLD, color: "#0a0a1a",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem", fontWeight: 700,
              letterSpacing: "0.1em", textTransform: "uppercase",
              padding: "0.65rem 1.5rem",
              clipPath: "polygon(0 0, calc(100% - 6px) 0, 100% 6px, 100% 100%, 6px 100%, 0 calc(100% - 6px))",
            }}
          >
            Começar agora →
          </a>
        </div>
      )}
    </nav>
  );
};

export default LandingNav;
