// SOCIAL ON — Kit de Mídia: gera um link público com credenciais, números
// reais do Instagram e melhores posts, pronto pra mandar pra quem quiser
// convidar o coach pra uma palestra, parceria ou colaboração.
import { useEffect, useState } from "react";
import { Copy, ExternalLink, Loader2, RefreshCw, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { generateMediaKitToken, mediaKitUrl } from "@/lib/mediaKit";

const C = {
  bg: "#020205", border: "#B8922A22", gold: "#B8922A", goldBg: "#B8922A08",
  cyan: "#00D4FF", green: "#00C896", text: "#F5F0E8", textMid: "#888888",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

export default function MediaKitPanel({ coachId }: { coachId?: string }) {
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!coachId) { setLoading(false); return; }
    (async () => {
      const { data } = await supabase.from("social_profile").select("media_kit_token").eq("coach_id", coachId).maybeSingle();
      setToken((data as { media_kit_token?: string | null } | null)?.media_kit_token ?? null);
      setLoading(false);
    })();
  }, [coachId]);

  const generate = async () => {
    if (!coachId) return;
    setGenerating(true);
    try {
      const newToken = generateMediaKitToken();
      const { error } = await supabase
        .from("social_profile")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .upsert({ coach_id: coachId, media_kit_token: newToken } as any, { onConflict: "coach_id" });
      if (error) throw error;
      setToken(newToken);
      toast.success("Link do Kit de Mídia gerado!");
    } catch (e) {
      // Erro do Supabase (PostgrestError) não é instanceof Error — sem isso,
      // a causa real (ex: coluna/migration pendente) ficava escondida atrás
      // de uma mensagem genérica, impossível de diagnosticar pelo print.
      const msg = e instanceof Error ? e.message : (e as { message?: string })?.message;
      const looksLikeMissingColumn = !!msg && /column|schema cache|media_kit_token/i.test(msg);
      toast.error(
        looksLikeMissingColumn
          ? "O banco ainda não tem essa coluna — rode as migrations pendentes no Lovable (peça 'rode as migrations pendentes deste projeto no Supabase') e tenta de novo."
          : msg || "Falha ao gerar o link",
      );
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = () => {
    if (!token) return;
    navigator.clipboard.writeText(mediaKitUrl(token));
    toast.success("Link copiado!");
  };

  return (
    <div style={{ background: C.bg, border: `1px solid ${C.border}`, padding: 16 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ ...fT, fontSize: 22, color: C.text, display: "flex", alignItems: "center", gap: 8 }}>
          <ShieldCheck size={18} color={C.gold} /> KIT DE MÍDIA / AUTORIDADE
        </div>
        <div style={{ ...fM, fontSize: 12, color: C.textMid, marginTop: 4 }}>
          Uma página com suas credenciais, números reais e melhores posts — mande pra quem quiser te convidar pra uma palestra, parceria ou colaboração.
        </div>
      </div>

      {loading ? (
        <Loader2 size={18} className="animate-spin" color={C.gold} />
      ) : token ? (
        <div style={{ display: "grid", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, background: C.goldBg, border: `1px solid ${C.border}`, padding: "10px 12px", ...fM, fontSize: 12, color: C.cyan, overflowWrap: "anywhere" }}>
              {mediaKitUrl(token)}
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button onClick={copyLink} style={{ flex: 1, minWidth: 120, padding: "10px 0", background: C.gold, border: "none", ...fT, fontSize: 13, color: C.bg, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6 }}>
              <Copy size={13} /> COPIAR LINK
            </button>
            <a href={mediaKitUrl(token)} target="_blank" rel="noreferrer" style={{ flex: 1, minWidth: 120, padding: "10px 0", background: "transparent", border: `1px solid ${C.border}`, ...fT, fontSize: 13, color: C.text, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, textDecoration: "none" }}>
              <ExternalLink size={13} /> VER PÁGINA
            </a>
            <button onClick={generate} disabled={generating} style={{ padding: "10px 14px", background: "transparent", border: `1px solid ${C.border}`, ...fM, fontSize: 11, color: C.textMid, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
              {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />} renovar link
            </button>
          </div>
          <p style={{ ...fM, fontSize: 10, color: C.textMid, lineHeight: 1.6 }}>
            A página sempre mostra seus dados atuais (nichos, diferenciais, seguidores, melhores posts) — não precisa gerar de novo quando algo mudar, só se quiser invalidar o link antigo.
          </p>
        </div>
      ) : (
        <button onClick={generate} disabled={generating} style={{ width: "100%", padding: "13px 0", background: C.gold, border: "none", ...fT, fontSize: 14, color: C.bg, cursor: generating ? "default" : "pointer", opacity: generating ? 0.7 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
          {generating ? <Loader2 size={15} className="animate-spin" /> : <ShieldCheck size={15} />} GERAR MEU LINK
        </button>
      )}
    </div>
  );
}
