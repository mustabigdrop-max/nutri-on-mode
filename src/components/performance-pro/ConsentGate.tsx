import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ShieldAlert, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ConsentGateProps {
  onAccept: () => void;
}

const ConsentGate = ({ onAccept }: ConsentGateProps) => {
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-[#FF6B00]/20 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8 text-[#FF6B00]" />
          </div>
          <h1 className="text-2xl font-bold">⚡ Performance Pro</h1>
          <p className="text-muted-foreground text-sm">
            Nutrição e suporte para quem opera no limite
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5 space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="age"
              checked={ageConfirmed}
              onCheckedChange={(v) => setAgeConfirmed(!!v)}
            />
            <label htmlFor="age" className="text-sm cursor-pointer leading-relaxed">
              Confirmo que tenho <strong>18 anos ou mais</strong>
            </label>
          </div>

          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={termsAccepted}
              onCheckedChange={(v) => setTermsAccepted(!!v)}
            />
            <label htmlFor="terms" className="text-sm cursor-pointer leading-relaxed text-muted-foreground">
              Este módulo fornece informações nutricionais e de suporte para
              usuários que já fazem uso consciente de substâncias para
              performance. O nutriON <strong>não incentiva, prescreve nem
              substitui acompanhamento médico</strong>. O uso é de total
              responsabilidade do usuário.
            </label>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <Button
            className="flex-1 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white"
            disabled={!ageConfirmed || !termsAccepted}
            onClick={onAccept}
          >
            Entendo e quero acessar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConsentGate;
