import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldOff } from "lucide-react";

const AccessEndedScreen = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full border-destructive/30">
        <CardContent className="p-8 text-center space-y-4">
          <ShieldOff className="w-14 h-14 text-destructive mx-auto" />
          <h2 className="text-xl font-bold text-foreground">Acesso Encerrado</h2>
          <p className="text-muted-foreground">
            Seu acesso via coach foi encerrado. Para continuar usando o nutriON com todas as
            funcionalidades, assine um plano individual.
          </p>
          <div className="space-y-2">
            <Button className="w-full" onClick={() => navigate("/#planos")}>
              Ver Planos — a partir de R$67/mês
            </Button>
            <Button variant="outline" className="w-full" onClick={() => navigate("/dashboard")}>
              Continuar com plano Free
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccessEndedScreen;
