import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Brain, X } from "lucide-react";

type Props = {
  dimension: "c" | "e";
  text: string;
  storageKey: string;
};

export default function MceBanner({ dimension, text, storageKey }: Props) {
  const navigate = useNavigate();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem(storageKey) === "1") return;
    let cancel = false;
    (async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u?.user) return;
      const { data } = await supabase
        .from("mce_scores")
        .select("score_c, score_e")
        .eq("user_id", u.user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (cancel || !data) return;
      const v = dimension === "c" ? data.score_c : data.score_e;
      if (typeof v === "number" && v < 60) setShow(true);
    })();
    return () => { cancel = true; };
  }, [dimension, storageKey]);

  if (!show) return null;

  return (
    <div
      style={{
        margin: "12px 16px",
        padding: 14,
        background: "rgba(45,212,191,0.06)",
        border: "0.5px solid rgba(45,212,191,0.35)",
        borderLeft: "3px solid #2DD4BF",
        borderRadius: 10,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <Brain className="w-5 h-5" style={{ color: "#2DD4BF", flexShrink: 0 }} />
      <p style={{ flex: 1, fontSize: 12, color: "rgba(255,255,255,0.85)", margin: 0, lineHeight: 1.4 }}>
        {text}
      </p>
      <button
        onClick={() => navigate("/mce")}
        style={{
          fontSize: 11,
          fontWeight: 600,
          padding: "6px 12px",
          borderRadius: 6,
          background: "rgba(45,212,191,0.15)",
          color: "#2DD4BF",
          border: "0.5px solid rgba(45,212,191,0.4)",
        }}
      >
        Ver MCE
      </button>
      <button
        onClick={() => {
          sessionStorage.setItem(storageKey, "1");
          setShow(false);
        }}
        aria-label="Dispensar"
        style={{ color: "rgba(255,255,255,0.5)", padding: 4 }}
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
