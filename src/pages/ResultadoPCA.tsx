import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ResultadoPCAType, PerfilPCA } from "@/types/pca";
import { cn } from "@/lib/utils";

const CONFIG_PERFIL: Record<PerfilPCA, {
  cor: string; icone: string; headline: string; descricao: string;
  pontoForte: string; desafio: string; comoAjuda: string;
}> = {
  "Atleta Mental": {
    cor: "#0F6E56",
    icone: "⚡",
    headline: "Disciplinado, orientado a dados e pronto para o próximo nível.",
    descricao: "Você já tem a mentalidade certa. O que falta é um sistema com dados precisos para otimizar além do básico — e é exatamente isso que o nutriON entrega.",
    pontoForte: "Consistência excepcional — você aparece mesmo sem motivação.",
    desafio: "Otimizar além do básico sem dados precisos para guiar cada decisão.",
    comoAjuda: "Seu plano tem macros precisos, Carb Cycling avançado e pesquisa global atualizada. Cada protocolo é baseado em estudos reais.",
  },
  "Sabotador Emocional": {
    cor: "#C04828",
    icone: "🧠",
    headline: "Você come com o coração. Está na hora de entender o porquê.",
    descricao: "Não é fraqueza — é comportamento. Você responde a emoções com comida, e isso tem solução com o suporte certo.",
    pontoForte: "Alta sensibilidade emocional que, quando direcionada, vira combustível.",
    desafio: "Quebrar ciclos de culpa e comer emocional sem suporte adequado.",
    comoAjuda: "A IA reconhece seu estado emocional antes de qualquer orientação técnica. Nunca usa palavras como 'falhou' ou 'fraqueza'. Foco em um passo de cada vez.",
  },
  "Executor Inconsistente": {
    cor: "#BA7517",
    icone: "🎯",
    headline: "Você sabe o que fazer. O problema é manter por mais de 3 semanas.",
    descricao: "Alta motivação no início, queda rápida depois. Não é falta de força de vontade — é falta do sistema certo.",
    pontoForte: "Capacidade de começar com alta energia — falta só o sistema para sustentar.",
    desafio: "Manter consistência por mais de 2-3 semanas sem perder o ritmo.",
    comoAjuda: "Missões simples, streak visual, notificações no momento certo e protocolo de retomada sem drama quando você sair do plano.",
  },
  "Perfeccionista Paralisado": {
    cor: "#534AB7",
    icone: "🔬",
    headline: "Tudo ou nada. Está na hora de descobrir que 80% bate 100% intermitente.",
    descricao: "Você quer fazer certo, e isso é uma força. Mas quando 'certo' se torna inimigo do 'bom', você paralisa.",
    pontoForte: "Atenção ao detalhe e comprometimento quando engajado.",
    desafio: "Um erro vira abandono total. Perfeição como inimiga da consistência.",
    comoAjuda: "Plano com opção A (fácil) e B (completa). Frase-guia: '80% consistente bate 100% intermitente — sempre'.",
  },
};

const BARRAS_ORDER = [
  { label: "Atleta Mental", key: "AM" as const, cor: "#0F6E56" },
  { label: "Executor Inconsistente", key: "EI" as const, cor: "#BA7517" },
  { label: "Sabotador Emocional", key: "SE" as const, cor: "#C04828" },
  { label: "Perfeccionista Paralisado", key: "PP" as const, cor: "#534AB7" },
];

export default function ResultadoPCAPage() {
  const navigate = useNavigate();
  const [resultado, setResultado] = useState<ResultadoPCAType | null>(null);
  const [fase, setFase] = useState<"loading" | "revelando" | "pronto">("loading");
  const [barrasAnimadas, setBarrasAnimadas] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem("resultado_pca");
    if (!raw) { navigate("/assessment"); return; }
    const r = JSON.parse(raw) as ResultadoPCAType;
    setResultado(r);

    setTimeout(() => setFase("revelando"), 300);
    setTimeout(() => setFase("pronto"), 1200);
    setTimeout(() => setBarrasAnimadas(true), 1600);
  }, [navigate]);

  if (!resultado) return null;

  const config = CONFIG_PERFIL[resultado.perfil_principal];

  const barras = BARRAS_ORDER
    .map(b => ({ ...b, valor: resultado.pontuacao[b.key] }))
    .sort((a, b) => b.valor - a.valor);

  return (
    <div className="min-h-screen bg-[#0D0D0B] overflow-y-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet" />

      <div className="max-w-lg mx-auto px-5 py-8">
        {/* Logo */}
        <div className="text-center mb-8">
          <span style={{ fontFamily: "'DM Serif Display', serif" }} className="text-xl">
            <span className="text-[#F5F4F0]">nutri</span>
            <span className="text-primary">ON</span>
          </span>
        </div>

        {/* Card principal */}
        <div
          className={cn(
            "rounded-2xl p-6 mb-6 border border-[#2A2A27] bg-[#111110] transition-all duration-600",
            fase === "loading" ? "opacity-0 scale-95" : "opacity-100 scale-100"
          )}
        >
          <div className="flex items-center gap-4 mb-5">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
              style={{ background: `${config.cor}22` }}
            >
              {config.icone}
            </div>
            <div>
              <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#666] mb-1">
                SEU PERFIL PCA
              </p>
              <h1
                className="text-xl text-[#F5F4F0]"
                style={{ fontFamily: "'DM Serif Display', serif", color: config.cor }}
              >
                {resultado.perfil_principal}
              </h1>
            </div>
          </div>

          <p
            className="text-[18px] text-[#F5F4F0] leading-[1.4] mb-4"
            style={{ fontFamily: "'DM Serif Display', serif" }}
          >
            {config.headline}
          </p>

          <p className="text-sm text-[#999] leading-[1.7] mb-5">
            {config.descricao}
          </p>

          <div className="space-y-3">
            <p className="text-sm text-[#CCC]">
              <span className="text-emerald-400 font-semibold">✦ Ponto forte: </span>
              {config.pontoForte}
            </p>
            <p className="text-sm text-[#CCC]">
              <span className="text-red-400 font-semibold">⚠ Desafio central: </span>
              {config.desafio}
            </p>
          </div>
        </div>

        {/* Como ajuda */}
        {fase === "pronto" && (
          <div className="rounded-2xl p-5 mb-6 border border-[#2A2A27] bg-[#111110] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-primary mb-3">
              COMO O nutriON FOI ADAPTADO PARA VOCÊ
            </p>
            <p className="text-sm text-[#CCC] leading-[1.7]">
              {config.comoAjuda}
            </p>
          </div>
        )}

        {/* Barras */}
        {fase === "pronto" && (
          <div className="rounded-2xl p-5 mb-6 border border-[#2A2A27] bg-[#111110] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#666] mb-4">
              SUA DISTRIBUIÇÃO DE PERFIL
            </p>
            <div className="space-y-4">
              {barras.map((b) => {
                const pct = Math.round((b.valor / 30) * 100);
                const isPrincipal = b.label === resultado.perfil_principal;
                return (
                  <div key={b.key}>
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className={cn("text-[#CCC]", isPrincipal && "font-bold")}>
                        {b.label} {isPrincipal && "★"}
                      </span>
                      <span className="text-[#666]">{b.valor} pts</span>
                    </div>
                    <div className="w-full h-2 bg-[#1A1A18] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: barrasAnimadas ? `${pct}%` : "0%",
                          backgroundColor: b.cor,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-[#555] mt-4">
              Tendência secundária: {resultado.perfil_secundario}
            </p>
          </div>
        )}

        {/* CTA */}
        {fase === "pronto" && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
              onClick={() => navigate("/dashboard")}
              className="w-full py-4 rounded-[14px] bg-primary text-[#0D0D0B] text-base font-bold hover:brightness-110 transition-all"
            >
              Continuar para o app →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
