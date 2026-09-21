import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowRight, Loader2, MessageCircle, Share2 } from "lucide-react";
import {
  DEFICIT_CARDS, QUIZ_PERGUNTAS, buildWhatsappMessage, calcularResultado,
  type DeficitKey,
} from "@/lib/quizDeficit";

const COACH_WHATSAPP = ""; // preenchido pelo coach nas configurações públicas

const C = {
  bg: "#020205",
  ciano: "#00D4FF",
  dourado: "#B8922A",
  texto: "#F5F0E8",
  cinza: "#888",
  borda: "rgba(0,212,255,0.2)",
};

type Etapa = "landing" | "perguntas" | "resultado";

const QuizDeficitPage = () => {
  const [params] = useSearchParams();
  const fonte = params.get("fonte") || params.get("utm_source") || "direto";

  const [etapa, setEtapa] = useState<Etapa>("landing");
  const [nome, setNome] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [qIdx, setQIdx] = useState(0);
  const [respostas, setRespostas] = useState<number[]>([]);
  const [salvando, setSalvando] = useState(false);
  const [resultado, setResultado] = useState<DeficitKey | null>(null);

  const card = resultado ? DEFICIT_CARDS[resultado] : null;

  const progresso = useMemo(
    () => Math.round(((qIdx) / QUIZ_PERGUNTAS.length) * 100),
    [qIdx],
  );

  const iniciar = () => {
    if (!nome.trim() || whatsapp.replace(/\D/g, "").length < 10) {
      toast({ title: "Preencha nome e WhatsApp", description: "Precisamos deles para enviar seu resultado.", variant: "destructive" });
      return;
    }
    setEtapa("perguntas");
  };

  const responder = async (opcaoIdx: number) => {
    const novas = [...respostas, opcaoIdx];
    setRespostas(novas);
    if (qIdx + 1 < QUIZ_PERGUNTAS.length) {
      setQIdx(qIdx + 1);
      return;
    }
    // Fim: calcula e salva o lead
    const { resultado: r, pontuacao } = calcularResultado(novas);
    setResultado(r);
    setEtapa("resultado");
    setSalvando(true);
    try {
      await supabase.from("quiz_leads").insert({
        nome: nome.trim(),
        whatsapp: whatsapp.trim(),
        respostas: novas.map((opcao, i) => ({ pergunta: QUIZ_PERGUNTAS[i].id, opcao })),
        resultado: r,
        fonte,
      });
    } catch {
      // não bloqueia o resultado por falha de gravação
    } finally {
      setSalvando(false);
    }
    void pontuacao;
  };

  const linkWhatsapp = () => {
    if (!card) return "#";
    const msg = encodeURIComponent(buildWhatsappMessage(card));
    return COACH_WHATSAPP
      ? `https://wa.me/${COACH_WHATSAPP}?text=${msg}`
      : `https://wa.me/?text=${msg}`;
  };

  const compartilhar = async () => {
    if (!card) return;
    const texto = `Meu resultado no quiz de deficit do nutriON: ${card.titulo}. Descobre o teu — transformação é sistema.`;
    try {
      if (navigator.share) await navigator.share({ title: "Meu deficit", text: texto, url: window.location.origin + "/quiz" });
      else {
        await navigator.clipboard.writeText(`${texto} ${window.location.origin}/quiz`);
        toast({ title: "Copiado", description: "Texto do resultado copiado para compartilhar." });
      }
    } catch { /* usuário cancelou */ }
  };

  const pergunta = QUIZ_PERGUNTAS[qIdx];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: C.bg, color: C.texto, fontFamily: "'Space Mono', monospace" }}>
      {/* Marca */}
      <header className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.borda}` }}>
        <span style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 2, color: C.ciano }}>nutriON</span>
        <span className="text-[10px]" style={{ color: C.cinza }}>APEX · DIAGNÓSTICO DE DEFICIT</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-lg">

          {etapa === "landing" && (
            <div className="space-y-6">
              <div>
                <h1 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 34, lineHeight: 1.1 }}>
                  Descubra o deficit que está <span style={{ color: C.ciano }}>TRAVANDO</span> sua evolução
                </h1>
                <p className="mt-3 text-sm" style={{ color: C.cinza }}>10 perguntas. 2 minutos. Resultado imediato.</p>
              </div>
              <div className="space-y-3">
                <Input
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: C.borda, color: C.texto, borderRadius: 0 }}
                />
                <Input
                  placeholder="WhatsApp (DDD + número)"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  inputMode="tel"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: C.borda, color: C.texto, borderRadius: 0 }}
                />
                <Button
                  onClick={iniciar}
                  className="w-full"
                  style={{ background: C.ciano, color: C.bg, borderRadius: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1 }}
                >
                  DESCOBRIR MEU DEFICIT <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <p className="text-[10px]" style={{ color: C.cinza }}>Transformação é sistema.</p>
            </div>
          )}

          {etapa === "perguntas" && pergunta && (
            <div className="space-y-6">
              <div>
                <div className="h-1 w-full" style={{ background: "rgba(255,255,255,0.08)" }}>
                  <div className="h-1 transition-all" style={{ width: `${progresso}%`, background: C.ciano }} />
                </div>
                <p className="text-[10px] mt-2" style={{ color: C.cinza }}>PERGUNTA {qIdx + 1} DE {QUIZ_PERGUNTAS.length}</p>
              </div>
              <h2 style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 24, lineHeight: 1.2 }}>
                {pergunta.pergunta}
              </h2>
              <div className="space-y-2">
                {pergunta.opcoes.map((op, i) => (
                  <button
                    key={i}
                    onClick={() => responder(i)}
                    className="w-full text-left px-4 py-3 text-sm transition-all"
                    style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${C.borda}`, color: C.texto, borderRadius: 0 }}
                  >
                    {op.texto}
                  </button>
                ))}
              </div>
            </div>
          )}

          {etapa === "resultado" && card && (
            <div className="space-y-6">
              <div className="p-5" style={{ border: `1px solid ${C.dourado}`, background: "rgba(184,146,42,0.06)" }}>
                <p className="text-[10px] tracking-widest" style={{ color: C.dourado }}>SEU RESULTADO, {nome.split(" ")[0].toUpperCase()}</p>
                <h2 className="mt-2" style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, fontSize: 26, lineHeight: 1.15, color: C.ciano }}>
                  {card.titulo}
                </h2>
                <p className="mt-3 text-sm" style={{ color: C.texto }}>{card.explicacao}</p>
                <div className="mt-4">
                  <p className="text-[10px] tracking-widest mb-2" style={{ color: C.dourado }}>O QUE FAZER</p>
                  {card.oQueFazer.map((o) => (
                    <p key={o} className="text-xs mb-1" style={{ color: C.texto }}>• {o}</p>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <a href={linkWhatsapp()} target="_blank" rel="noopener noreferrer" className="block">
                  <Button
                    className="w-full"
                    style={{ background: C.ciano, color: C.bg, borderRadius: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700, letterSpacing: 1 }}
                  >
                    <MessageCircle className="w-4 h-4 mr-2" /> QUERO A AVALIAÇÃO COMPLETA
                  </Button>
                </a>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={compartilhar}
                  style={{ borderColor: C.borda, color: C.texto, borderRadius: 0, fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 }}
                >
                  <Share2 className="w-4 h-4 mr-2" /> COMPARTILHAR MEU RESULTADO
                </Button>
                <p className="text-center text-[10px]" style={{ color: C.cinza }}>
                  {salvando ? <span className="inline-flex items-center gap-1"><Loader2 className="w-3 h-3 animate-spin" /> salvando…</span> : "Resultado registrado. Transformação é sistema."}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default QuizDeficitPage;
