import { useNavigate } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowLeft, Building2, Trophy, Smartphone, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const APP_URL = "https://nutrion.app.br";
const CHALLENGE_URL = "https://nutrion.app.br/desafio-21";

export default function CoachGymAcademyPage() {
  const navigate = useNavigate();
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      <header className="border-b border-border bg-card px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/dashboard")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-500" />
              Academia nutriON
            </h1>
            <p className="text-xs text-muted-foreground">QR Codes para recepção e equipamentos</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Trophy className="w-6 h-6 text-amber-500 shrink-0 mt-1" />
              <div>
                <h2 className="text-base font-bold">Desafio 90 Dias da Academia</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  QR principal para cartaz na recepção, The Wall e espelhos. O aluno escaneia e entra
                  direto no desafio híbrido, sem precisar buscar o app.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-5 rounded-xl bg-white">
              <QRCodeSVG
                value={CHALLENGE_URL}
                size={180}
                bgColor="#ffffff"
                fgColor="#03030a"
                level="M"
                includeMargin={false}
              />
              <div className="text-center">
                <p className="text-xs font-mono text-foreground/60 break-all">{CHALLENGE_URL}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => copy(CHALLENGE_URL, "challenge")}
            >
              {copied === "challenge" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === "challenge" ? "Link copiado" : "Copiar link do desafio"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <Smartphone className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
              <div>
                <h2 className="text-base font-bold">App nutriON</h2>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  QR secundário para recepção e cartazes gerais. Direciona para a landing do app,
                  onde o aluno faz o cadastro completo.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4 p-5 rounded-xl bg-white">
              <QRCodeSVG
                value={APP_URL}
                size={160}
                bgColor="#ffffff"
                fgColor="#03030a"
                level="M"
                includeMargin={false}
              />
              <div className="text-center">
                <p className="text-xs font-mono text-foreground/60 break-all">{APP_URL}</p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full gap-2"
              onClick={() => copy(APP_URL, "app")}
            >
              {copied === "app" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied === "app" ? "Link copiado" : "Copiar link do app"}
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <p className="font-semibold mb-1">Onde colocar?</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Recepção e balcão de entrada</li>
              <li>• The Wall (ranking ao vivo)</li>
              <li>• Espelhos do vestiário</li>
              <li>• Equipamentos de cardio</li>
            </ul>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card/50">
            <p className="font-semibold mb-1">Como funciona?</p>
            <ul className="space-y-1 text-muted-foreground text-xs">
              <li>• Aluno escaneia com a câmera do celular</li>
              <li>• Entra no desafio ou no app</li>
              <li>• Faz cadastro com o convite da academia</li>
              <li>• Você acompanha no painel do coach</li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
