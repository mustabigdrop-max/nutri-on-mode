// Kit de Palestra como módulo próprio — acesso direto, igual Social ON,
// MCE e os demais no dashboard do coach. Sem link nenhum: é uma página
// normal do app, autenticada, que carrega a identidade do coach logado
// (handle, nicho, produtos, diferenciais) e monta o roteiro na hora.
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Mic2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useInstagramAccount } from "@/hooks/useInstagramAccount";
import LecturePanel from "@/components/social/LecturePanel";
import { ACCENT, ACCENT2 } from "@/components/social/socialUi";

const LectureKitPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const uid = user?.id ?? "";
  const ig = useInstagramAccount();

  const [handle, setHandle] = useState("");
  const [niches, setNiches] = useState<string[]>([]);
  const [products, setProducts] = useState<string[]>([]);
  const [differentials, setDifferentials] = useState<string[]>([]);

  const loadIdentity = useCallback(async () => {
    if (!uid) return;
    const [{ data: prof }, { data: coach }] = await Promise.all([
      supabase.from("social_profile").select("instagram_handle, niches, products, differentials").eq("coach_id", uid).maybeSingle(),
      supabase.from("coach_profiles").select("instagram_handle").eq("user_id", uid).maybeSingle(),
    ]);
    if (prof) {
      setHandle(prof.instagram_handle || coach?.instagram_handle || "");
      setNiches((prof.niches as string[]) || []);
      setProducts((prof.products as string[]) || []);
      setDifferentials((prof.differentials as string[]) || []);
    } else if (coach?.instagram_handle) {
      setHandle(coach.instagram_handle);
    }
  }, [uid]);

  useEffect(() => { loadIdentity(); }, [loadIdentity]);

  const aiCtx = {
    handle: ig.account?.username || handle,
    niches,
    products,
    differentials,
    ig_profile: ig.account
      ? {
          name: ig.account.full_name,
          username: ig.account.username,
          bio: ig.account.biography,
          followers: ig.account.followers_count,
          recent_captions: (ig.account.recent_media || []).map((m) => m.caption).filter(Boolean).slice(0, 6),
        }
      : null,
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#020205" }}>
      <div className="sticky top-0 z-10 backdrop-blur-md" style={{ background: "rgba(2,2,5,0.92)", borderBottom: `1px solid ${ACCENT}22` }}>
        <div className="max-w-lg mx-auto flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => navigate("/coach/dashboard")}
            aria-label="Voltar"
            className="w-9 h-9 flex items-center justify-center rounded-lg"
            style={{ background: "rgba(255,255,255,0.04)", border: `1px solid ${ACCENT}22`, color: "rgba(255,255,255,0.6)" }}
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <Mic2 className="w-4 h-4" style={{ color: ACCENT }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: "#F5F0E8" }}>Kit de Palestra</p>
              <p className="text-[10px] font-mono" style={{ color: ACCENT2 }}>Slides · dados científicos · fala do palestrante</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-4">
        <LecturePanel ctx={aiCtx} />
      </div>
    </div>
  );
};

export default LectureKitPage;
