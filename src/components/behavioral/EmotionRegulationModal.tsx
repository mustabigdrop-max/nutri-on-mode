import { useState, useEffect, useRef } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Wind, Heart, Zap, Moon, PartyPopper, Frown, Timer } from "lucide-react";

const EMOCOES = [
  { key: "estressado", label: "Estressado", icon: Zap, color: "text-red-400" },
  { key: "ansioso", label: "Ansioso", icon: Wind, color: "text-orange-400" },
  { key: "triste", label: "Triste", icon: Frown, color: "text-blue-400" },
  { key: "entediado", label: "Entediado", icon: Moon, color: "text-gray-400" },
  { key: "cansado", label: "Cansado", icon: Moon, color: "text-indigo-400" },
  { key: "celebrando", label: "Celebrando", icon: PartyPopper, color: "text-amber-400" },
];

const TECNICAS: Record<string, { nome: string; instrucao: string }[]> = {
  estressado: [
    { nome: "Respiração 4-4-6", instrucao: "Inspire 4s → Segure 4s → Expire 6s" },
    { nome: "Caminhada 10min", instrucao: "Caminhe ao ar livre por 10 minutos" },
    { nome: "Escrita", instrucao: "Escreva 3 linhas sobre o que te estressa" },
  ],
  ansioso: [
    { nome: "Grounding 5-4-3-2-1", instrucao: "5 coisas que vê, 4 que toca, 3 que ouve, 2 que cheira, 1 que saboreia" },
    { nome: "Respiração 90s", instrucao: "Apenas respire por 90 segundos — a emoção vai passar" },
  ],
  triste: [
    { nome: "Contato social", instrucao: "Ligue ou mande mensagem para alguém" },
    { nome: "Movimento", instrucao: "Caminhe ao ar livre por 15 minutos" },
    { nome: "Música", instrucao: "Ouça algo que te inspire" },
  ],
  entediado: [
    { nome: "Teste da água", instrucao: "Beba 500ml de água e espere 10 minutos" },
    { nome: "Atividade 5min", instrucao: "Faça algo rápido: organize, caminhe, alongue" },
  ],
  cansado: [
    { nome: "Teste da água", instrucao: "Beba água — pode ser desidratação" },
    { nome: "Powernap", instrucao: "20 minutos de cochilo se possível" },
  ],
  celebrando: [
    { nome: "Celebração consciente", instrucao: "Celebre! Proteína primeiro, depois o que quiser em quantidade menor" },
  ],
};

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function EmotionRegulationModal({ open, onClose, onSave }: Props) {
  const [step, setStep] = useState<"emocao" | "intensidade" | "pausa" | "tecnica" | "resultado">("emocao");
  const [emocao, setEmocao] = useState("");
  const [intensidade, setIntensidade] = useState([5]);
  const [timer, setTimer] = useState(90);
  const [tecnica, setTecnica] = useState("");
  const [eficacia, setEficacia] = useState([5]);
  const [decisao, setDecisao] = useState("");
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (step === "pausa" && timer > 0) {
      intervalRef.current = setInterval(() => setTimer(t => t - 1), 1000);
      return () => clearInterval(intervalRef.current);
    }
    if (timer <= 0 && step === "pausa") setStep("tecnica");
  }, [step, timer]);

  const handleSave = () => {
    onSave({ emocao, intensidade: intensidade[0], tecnica_usada: tecnica, duracao_segundos: 90, eficacia: eficacia[0], decisao_pos: decisao });
    resetAndClose();
  };

  const resetAndClose = () => {
    setStep("emocao");
    setEmocao("");
    setIntensidade([5]);
    setTimer(90);
    setTecnica("");
    setEficacia([5]);
    setDecisao("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-pink-400" />
            {step === "emocao" && "Como você está se sentindo?"}
            {step === "intensidade" && "Qual a intensidade?"}
            {step === "pausa" && "Pausa de 90 segundos"}
            {step === "tecnica" && "Escolha uma técnica"}
            {step === "resultado" && "Como foi?"}
          </DialogTitle>
        </DialogHeader>

        {step === "emocao" && (
          <div className="grid grid-cols-2 gap-2">
            {EMOCOES.map(e => {
              const Icon = e.icon;
              return (
                <button key={e.key} onClick={() => { setEmocao(e.key); setStep("intensidade"); }}
                  className="p-3 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left">
                  <Icon className={`w-5 h-5 ${e.color} mb-1`} />
                  <p className="text-xs font-semibold">{e.label}</p>
                </button>
              );
            })}
          </div>
        )}

        {step === "intensidade" && (
          <div className="space-y-6 py-4">
            <div className="text-center">
              <span className="text-4xl font-bold text-primary">{intensidade[0]}</span>
              <span className="text-sm text-muted-foreground">/10</span>
            </div>
            <Slider value={intensidade} onValueChange={setIntensidade} min={1} max={10} step={1} />
            <Button onClick={() => { setTimer(90); setStep("pausa"); }} className="w-full">
              Iniciar Pausa de 90s
            </Button>
          </div>
        )}

        {step === "pausa" && (
          <div className="text-center py-8 space-y-4">
            <div className="w-24 h-24 rounded-full border-4 border-primary/30 flex items-center justify-center mx-auto">
              <span className="text-3xl font-bold text-primary">{timer}</span>
            </div>
            <p className="text-xs text-muted-foreground">Inspire 4s → Segure 4s → Expire 6s</p>
            <p className="text-[10px] text-muted-foreground italic">"Emoções duram 90 segundos — o resto é pensamento"</p>
            <Button variant="outline" size="sm" onClick={() => { clearInterval(intervalRef.current); setStep("tecnica"); }}>
              Pular
            </Button>
          </div>
        )}

        {step === "tecnica" && (
          <div className="space-y-2">
            <p className="text-[10px] text-muted-foreground mb-2">O que seu corpo realmente precisa agora?</p>
            {(TECNICAS[emocao] || TECNICAS.estressado).map(t => (
              <button key={t.nome} onClick={() => { setTecnica(t.nome); setStep("resultado"); }}
                className="w-full text-left p-3 rounded-xl border border-border hover:border-primary/50 transition-all">
                <p className="text-xs font-semibold">{t.nome}</p>
                <p className="text-[10px] text-muted-foreground">{t.instrucao}</p>
              </button>
            ))}
          </div>
        )}

        {step === "resultado" && (
          <div className="space-y-4 py-2">
            <div>
              <p className="text-xs mb-2">A técnica ajudou? (1-10)</p>
              <div className="text-center mb-2">
                <span className="text-2xl font-bold text-primary">{eficacia[0]}</span>
              </div>
              <Slider value={eficacia} onValueChange={setEficacia} min={1} max={10} step={1} />
            </div>
            <div>
              <p className="text-xs mb-2">O que você decidiu fazer?</p>
              <div className="grid grid-cols-2 gap-2">
                {["Comi dentro do protocolo", "Comi fora mas consciente", "Não comi — usei alternativa", "Comi por impulso"].map(d => (
                  <button key={d} onClick={() => setDecisao(d)}
                    className={`p-2 rounded-lg border text-[10px] transition-all ${decisao === d ? "border-primary bg-primary/10" : "border-border"}`}>
                    {d}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={handleSave} disabled={!decisao} className="w-full" size="sm">Salvar</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
