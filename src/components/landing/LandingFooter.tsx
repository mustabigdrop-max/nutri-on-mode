const LandingFooter = () => (
  <footer className="bg-[#03030a] border-t border-[#ffffff08] px-6 md:px-12 pt-8 pb-6 flex flex-col gap-4">
    {/* Status bar final */}
    <div className="font-mono text-[9px] text-[#ffffff20] tracking-[0.1em] text-center leading-relaxed pb-4 border-b border-[#ffffff08]">
      nutrion.app.br · Transformação é sistema.{" "}
      <span className="italic text-[#B8922A30]">O comportamento vem antes do alimento.</span>
    </div>

    {/* Assinatura do coach */}
    <div className="flex flex-col items-center gap-1.5 text-center pb-5 border-b border-[#ffffff08]">
      <span className="font-heading text-[1.1rem] tracking-[.06em] text-white">Coach Diogo Mello</span>
      <span className="font-mono text-[11px] text-[#8A8A8A]">Nutrition &amp; Business Coach 🇺🇸 Certified</span>
      <span className="font-mono text-[11px] text-[#8A8A8A]">
        Automação &amp; IA no Fitness · Criador do Método MCE
      </span>
      <span className="font-mono text-[11px] text-[#8A8A8A]">@diogo.mell0 · nutrion.app.br</span>
      <span className="font-landing italic text-[13px] mt-1" style={{ color: "#00D4FF" }}>
        "Transformação é sistema."
      </span>
    </div>

    <div className="flex flex-col md:flex-row justify-between items-center gap-6 md:gap-4">
      {/* Bloco esquerdo */}
      <div className="flex flex-col items-center md:items-start gap-1">
        <span className="font-mono text-[11px] text-[#888] tracking-[0.08em]">© 2026 nutriON</span>
        <span className="font-mono text-[10px] text-[#ffffff30]">
          SISTEMA INTEGRADO DE PERFORMANCE HUMANA
        </span>
      </div>

      {/* Bloco central */}
      <div className="font-mono text-[10px] text-[#888] tracking-[0.06em] text-center leading-relaxed">
        APEX · VERTEX · TRAININGON · NUTRIPLAN · MICROBIOTA · PCA
      </div>

      {/* Bloco direito */}
      <div className="flex flex-col items-center md:items-end gap-1">
        <span className="font-mono text-[10px] text-[#888]">
          IA de ponta · Dados protegidos · Protocolo sempre atualizado
        </span>
        <div className="flex items-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
          <span className="font-mono text-[10px] text-[#888]">SISTEMA ONLINE</span>
        </div>
      </div>
    </div>
  </footer>
);

export default LandingFooter;
