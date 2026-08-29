import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Instagram, Loader2, ShieldCheck, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { topEngagedMedia, type MediaKitData } from "@/lib/mediaKit";

const C = {
  bg: "#020205", card: "#0B0B12", border: "#ffffff10", cyan: "#00D4FF",
  gold: "#B8922A", green: "#00FF88", text: "#F0F0F8", muted: "#8A8AA0",
};
const fT = { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 } as const;
const fM = { fontFamily: "'Space Mono', monospace" } as const;

const Chip = ({ children, color }: { children: React.ReactNode; color: string }) => (
  <span style={{ ...fM, fontSize: 11, color, border: `1px solid ${color}44`, background: `${color}12`, padding: "4px 10px", borderRadius: 999 }}>
    {children}
  </span>
);

export default function MediaKitPublicPage() {
  const { token = "" } = useParams();
  const [data, setData] = useState<MediaKitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        // A função get_media_kit_by_token ainda não está nos tipos gerados do Supabase
        // (só existe após a migration rodar no banco) — cast pontual até o tipo ser atualizado.
        const rpc = supabase.rpc as unknown as (
          fn: "get_media_kit_by_token", args: { _token: string },
        ) => Promise<{ data: MediaKitData | null; error: { message: string } | null }>;
        const { data: res, error } = await rpc("get_media_kit_by_token", { _token: token });
        if (error || !res) { setNotFound(true); return; }
        setData(res);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, display: "grid", placeItems: "center" }}>
        <Loader2 className="animate-spin" color={C.cyan} size={28} />
      </div>
    );
  }

  if (notFound || !data) {
    return (
      <div style={{ minHeight: "100vh", background: C.bg, color: C.text, display: "grid", placeItems: "center", padding: 24, textAlign: "center" }}>
        <div>
          <p style={{ ...fT, fontSize: 20 }}>Link não encontrado</p>
          <p style={{ ...fM, fontSize: 12, color: C.muted, marginTop: 8 }}>Esse kit de mídia não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  const handle = (data.instagram_handle || "").replace("@", "");
  const chips = [...(data.niches ?? []), ...(data.specialties ?? [])].filter(Boolean).slice(0, 8);
  const top = topEngagedMedia(data.recent_media, 3);

  return (
    <div style={{ minHeight: "100vh", background: C.bg, color: C.text }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "40px 20px 60px" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          {data.profile_picture_url || data.avatar_url ? (
            <img
              src={data.profile_picture_url || data.avatar_url || ""}
              alt={data.professional_name || "Foto de perfil"}
              style={{ width: 96, height: 96, borderRadius: "50%", objectFit: "cover", border: `2px solid ${C.gold}66`, margin: "0 auto" }}
            />
          ) : (
            <div style={{ width: 96, height: 96, borderRadius: "50%", background: `${C.gold}18`, border: `2px solid ${C.gold}66`, display: "grid", placeItems: "center", margin: "0 auto" }}>
              <Sparkles color={C.gold} size={28} />
            </div>
          )}
          <h1 style={{ ...fT, fontSize: 26, marginTop: 14 }}>{data.professional_name || "Coach de Fitness & Nutrição"}</h1>
          {data.crn && (
            <p style={{ ...fM, fontSize: 11, color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", gap: 4, marginTop: 4 }}>
              <ShieldCheck size={12} color={C.green} /> {data.crn}
            </p>
          )}
          {handle && (
            <a href={`https://instagram.com/${handle}`} target="_blank" rel="noreferrer"
              style={{ ...fM, fontSize: 13, color: C.cyan, display: "inline-flex", alignItems: "center", gap: 6, marginTop: 8, textDecoration: "none" }}>
              <Instagram size={14} /> @{handle}
            </a>
          )}
        </div>

        {/* Bio */}
        {data.bio && (
          <p style={{ ...fM, fontSize: 13, color: C.text, lineHeight: 1.7, textAlign: "center", marginBottom: 20, whiteSpace: "pre-wrap" }}>
            {data.bio}
          </p>
        )}

        {/* Chips: niches/specialties */}
        {chips.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6, justifyContent: "center", marginBottom: 28 }}>
            {chips.map((c) => <Chip key={c} color={C.gold}>{c}</Chip>)}
          </div>
        )}

        {/* Stats */}
        {(data.followers_count != null || data.media_count != null) && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 28 }}>
            {[
              { label: "SEGUIDORES", value: data.followers_count },
              { label: "POSTS", value: data.media_count },
            ].map((s) => (
              <div key={s.label} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: "14px 16px", textAlign: "center" }}>
                <div style={{ ...fT, fontSize: 24, color: C.cyan }}>{s.value ?? "—"}</div>
                <div style={{ ...fM, fontSize: 9, color: C.muted, letterSpacing: 1.5, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Top posts */}
        {top.length > 0 && (
          <div style={{ marginBottom: 28 }}>
            <p style={{ ...fM, fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 10, textAlign: "center" }}>MELHORES POSTS</p>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${top.length}, 1fr)`, gap: 8 }}>
              {top.map((m, i) => (
                <a key={m.id ?? i} href={m.permalink ?? undefined} target="_blank" rel="noreferrer" style={{ display: "block" }}>
                  <img src={m.media_url ?? ""} alt={m.caption?.slice(0, 60) || "Post"} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 8, border: `1px solid ${C.border}` }} />
                </a>
              ))}
            </div>
          </div>
        )}

        {/* Diferenciais */}
        {!!data.differentials?.length && (
          <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 10, padding: 18, marginBottom: 28 }}>
            <p style={{ ...fM, fontSize: 10, color: C.muted, letterSpacing: 2, marginBottom: 10 }}>POR QUE ME CHAMAR</p>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 8 }}>
              {data.differentials.map((d) => (
                <li key={d} style={{ display: "flex", alignItems: "flex-start", gap: 8, ...fM, fontSize: 13, color: C.text }}>
                  <span style={{ color: C.green }}>✓</span> {d}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA */}
        {handle && (
          <a
            href={`https://instagram.com/${handle}`}
            target="_blank"
            rel="noreferrer"
            style={{
              display: "block", textAlign: "center", padding: "14px 0", background: C.gold, color: "#020205",
              borderRadius: 10, textDecoration: "none", ...fT, fontSize: 15,
            }}
          >
            Conversar no Instagram
          </a>
        )}

        <p style={{ ...fM, fontSize: 10, color: C.muted, textAlign: "center", marginTop: 32, letterSpacing: 1 }}>
          Kit de mídia gerado via Social ON · nutrion.app.br
        </p>
      </div>
    </div>
  );
}
