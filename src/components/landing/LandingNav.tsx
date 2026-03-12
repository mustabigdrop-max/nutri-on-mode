import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] px-6 md:px-12 py-4 flex items-center justify-between transition-all duration-500 ${
        scrolled
          ? "bg-[#03030a]/88 backdrop-blur-[24px] border-b border-[#e8a020]/05"
          : "border-b border-transparent"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3">
        {/* System indicator */}
        <div className="hidden md:flex items-center gap-1.5 border-r border-[#ffffff]/06 pr-4 mr-1">
          <span
            className="w-1.5 h-1.5 rounded-full bg-[#00f0b4]"
            style={{ boxShadow: "0 0 6px rgba(0,240,180,.9)", animation: "pulse 2s ease-in-out infinite" }}
          />
          <span className="font-mono text-[.5rem] text-[#00f0b4]/50 tracking-[.2em]">SYS.ON</span>
        </div>

        <div className="font-heading text-[1.75rem] tracking-[.1em] leading-none">
          <span className="text-[#f0edf8] opacity-80">NUTRI</span>
          <span
            className="text-[#e8a020] tracking-[.15em]"
            style={{ textShadow: "0 0 18px rgba(232,160,32,.5)" }}
          >
            ON
          </span>
        </div>
      </div>

      {/* Desktop nav links */}
      <div className="hidden md:flex items-center gap-7">
        {[
          { label: "Protocolos", href: "#protocols" },
          { label: "Features", href: "#features" },
          { label: "Coach", href: "#coach" },
          { label: "Planos", href: "#plans" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className="relative font-mono text-[.68rem] text-[#404060] hover:text-[#e8a020]/80 transition-colors duration-300 tracking-[.1em] group"
          >
            {label}
            <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#e8a020]/50 group-hover:w-full transition-all duration-300" />
          </a>
        ))}

        {/* Divider */}
        <div className="w-px h-4 bg-[#e8a020]/10" />

        {/* CTA Button */}
        <button
          onClick={() => navigate("/auth")}
          className="group relative font-mono text-[.68rem] font-medium px-5 py-2.5 tracking-[.1em] overflow-hidden transition-all duration-300"
          style={{
            background: "hsl(38 80% 52%)",
            color: "#030310",
            clipPath: "polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 8px 100%, 0 calc(100% - 8px))",
          }}
        >
          <span className="relative z-10">Começar agora →</span>
          <span className="absolute inset-0 bg-white/0 group-hover:bg-white/15 transition-colors duration-300" />
        </button>
      </div>

      {/* Mobile: just a small CTA */}
      <button
        onClick={() => navigate("/auth")}
        className="md:hidden font-mono text-[.65rem] text-[#e8a020] border border-[#e8a020]/25 px-4 py-2 tracking-[.08em] hover:bg-[#e8a020]/08 transition-colors"
      >
        Entrar →
      </button>
    </nav>
  );
};

export default LandingNav;
