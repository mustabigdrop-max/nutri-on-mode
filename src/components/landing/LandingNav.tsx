import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const linkClass = "font-mono text-[.72rem] text-[#50507a] hover:text-primary transition-colors tracking-[.08em]";

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-5 flex items-center justify-between border-b transition-all duration-400 ${
        scrolled
          ? "bg-[#03030a]/92 backdrop-blur-[20px] border-[#14142a]"
          : "border-transparent"
      }`}
    >
      <div className="font-heading text-[1.8rem] tracking-[.12em]">
        <span className="text-[#f0edf8] opacity-85">NUTRI</span>
        <span className="text-primary tracking-[.18em]" style={{ textShadow: "0 0 20px rgba(232,160,32,.5)" }}>O</span>
        <span className="logo-n-cyan tracking-[.18em]" style={{ color: "#00D4FF" }}>N</span>
      </div>


      {/* Desktop */}
      <div className="hidden md:flex items-center gap-8">
        <a href="#protocols" className={linkClass}>Protocolos</a>
        <a href="#features" className={linkClass}>Módulos</a>
        <a href="#coach" className={linkClass}>Coach</a>
        <a href="#plans" className={linkClass}>Planos</a>
        <a href="/auth" className={linkClass}>Entrar</a>
        <a
          href="https://pay.kiwify.com.br/G8uxU9O"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-black font-mono text-[.72rem] font-medium px-5 py-2.5 rounded-[2px] tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all"
        >
          Começar agora →
        </a>
      </div>

      {/* Mobile hamburger */}
      <button
        className="md:hidden text-[#f0edf8] p-1"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-label="Menu"
      >
        {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="absolute top-full left-0 right-0 bg-[#03030a]/95 backdrop-blur-[20px] border-b border-[#14142a] flex flex-col items-center gap-5 py-6 md:hidden">
          <a href="#protocols" className={linkClass} onClick={() => setMenuOpen(false)}>Protocolos</a>
          <a href="#features" className={linkClass} onClick={() => setMenuOpen(false)}>Módulos</a>
          <a href="#coach" className={linkClass} onClick={() => setMenuOpen(false)}>Coach</a>
          <a href="#plans" className={linkClass} onClick={() => setMenuOpen(false)}>Planos</a>
          <a href="/auth" className={linkClass} onClick={() => setMenuOpen(false)}>Entrar</a>
          <a
            href="https://pay.kiwify.com.br/G8uxU9O"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary text-black font-mono text-[.72rem] font-medium px-5 py-2.5 rounded-[2px] tracking-[.08em]"
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
