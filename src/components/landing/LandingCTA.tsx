import { useNavigate } from "react-router-dom";

const LandingCTA = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-primary px-6 md:px-12 py-[120px] text-center relative overflow-hidden">
      {/* Background watermark */}
      <span
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-heading text-[30vw] text-black/[.06] pointer-events-none whitespace-nowrap leading-none"
      >
        NutriON
      </span>

      <h2 className="font-heading text-black leading-[.9] mb-6 relative" style={{ fontSize: "clamp(3rem, 8vw, 8rem)" }}>
        VOCÊ ESTÁ<br />
        <span style={{ WebkitTextStroke: "2px #000", color: "transparent" }}>NUTRI</span>
        <span>ON?</span>
      </h2>
      <p className="text-[1rem] text-black/55 mb-2 font-landing max-w-[500px] mx-auto leading-[1.6] relative">
        Resultado não acontece quando você quer. Acontece quando você estrutura. Entra no modo ON agora.
      </p>
      <p className="font-mono text-[.7rem] text-black/40 mb-9 relative">
        Cancele quando quiser
      </p>
      <a
        href="https://pay.kiwify.com.br/6pXyygp"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block bg-black text-primary font-heading text-[1.3rem] tracking-[.1em] px-[52px] py-5 rounded-[2px] hover:bg-[#f0edf8] hover:text-black transition-all relative"
      >
        Entrar no modo ON →
      </a>
    </div>
  );
};

export default LandingCTA;
