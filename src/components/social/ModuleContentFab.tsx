import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { supabase } from "@/integrations/supabase/client";
import { detectarModulo, CONFIGS_MODULO } from "@/lib/moduleContent";
import ModuleContentPanel from "@/components/social/ModuleContentPanel";

/** Rotas públicas/neutras onde o botão não aparece. */
const OCULTAR = ["/", "/auth", "/modulos", "/diagnostico", "/onboarding", "/coach/social", "/coach/social-on", "/coach/social-classic"];

/**
 * Botão flutuante "📲 Criar conteúdo" — presente em todas as telas internas do
 * nutriON. Detecta o módulo pela rota e abre o painel de geração com os dados
 * reais daquela tela.
 */
export default function ModuleContentFab() {
  const { pathname } = useLocation();
  const [ehCoach, setEhCoach] = useState(false);
  const [aberto, setAberto] = useState(false);

  useEffect(() => {
    let ativo = true;

    const verificar = async (userId?: string | null) => {
      if (!userId) {
        if (ativo) setEhCoach(false);
        return;
      }
      const { data } = await supabase
        .from("coach_profiles")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle();
      if (ativo) setEhCoach(!!data);
    };

    void supabase.auth.getSession().then(({ data }) => verificar(data.session?.user?.id));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      void verificar(session?.user?.id);
    });
    return () => {
      ativo = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => setAberto(false), [pathname]);

  const modulo = detectarModulo(pathname);
  // Ferramenta de conteúdo é exclusiva do coach: alunos nunca veem o botão.
  if (!ehCoach || !modulo || OCULTAR.includes(pathname)) return null;

  return (
    <>
      <button
        type="button"
        aria-label="Criar conteúdo para redes sociais"
        onClick={() => setAberto(true)}
        className="fixed bottom-6 right-6 z-[9999] flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-black text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.35)] transition hover:scale-105"
      >
        📲
      </button>

      <Sheet open={aberto} onOpenChange={setAberto}>
        <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>📲 Criar conteúdo — {CONFIGS_MODULO[modulo].label}</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <ModuleContentPanel modulo={modulo} />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
