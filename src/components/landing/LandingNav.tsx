import { useState, useEffect } from "react";

const LandingNav = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
        <span className="text-primary tracking-[.18em]" style={{ textShadow: "0 0 20px rgba(232,160,32,.5)" }}>ON</span>
      </div>
      <div className="hidden md:flex items-center gap-8">
        <a href="#protocols" className="font-mono text-[.72rem] text-[#50507a] hover:text-primary transition-colors tracking-[.08em]">Protocolos</a>
        <a href="#features" className="font-mono text-[.72rem] text-[#50507a] hover:text-primary transition-colors tracking-[.08em]">Features</a>
        <a href="#coach" className="font-mono text-[.72rem] text-[#50507a] hover:text-primary transition-colors tracking-[.08em]">Coach</a>
        <a href="#plans" className="font-mono text-[.72rem] text-[#50507a] hover:text-primary transition-colors tracking-[.08em]">Planos</a>
        <a
          href="https://pay.kiwify.com.br/G8uxU9O"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-primary text-black font-mono text-[.72rem] font-medium px-5 py-2.5 rounded-[2px] tracking-[.08em] hover:bg-black hover:text-primary hover:outline hover:outline-1 hover:outline-primary transition-all"
        >
          Começar agora →
        </a>
      </div>
    </nav>
  );
};

export default LandingNav;
