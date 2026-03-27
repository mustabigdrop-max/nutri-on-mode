import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { AlertTriangle, LogOut } from "lucide-react";

export default function PartnerBlockedPage() {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="max-w-md text-center space-y-6 p-8">
        <span className="text-2xl font-bold text-[#27500A]">nutriON</span>
        <div className="w-16 h-16 mx-auto rounded-full bg-[#FCEBEB] flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-[#A32D2D]" />
        </div>
        <h1 className="text-2xl font-bold text-[#A32D2D]">Acesso suspenso</h1>
        <p className="text-[#5F5E5A]">
          Identificamos um acesso simultâneo na sua conta. Por segurança, seu acesso foi bloqueado.
          Entre em contato com o administrador para reativar.
        </p>
        <div className="space-y-3">
          <Button className="w-full bg-[#3B6D11] hover:bg-[#27500A]" onClick={() => window.open("https://wa.me/5500000000000", "_blank")}>
            Falar com o administrador
          </Button>
          <Button variant="outline" className="w-full" onClick={() => signOut()}>
            <LogOut className="w-4 h-4 mr-2" /> Sair
          </Button>
        </div>
      </div>
    </div>
  );
}
