import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { PROFILE_META, type ProfessionalType, isProfessionalType } from "@/lib/professionalTypes";

interface Props {
  /** override db lookup */
  type?: ProfessionalType | null;
  size?: "sm" | "md";
}

const ProfessionalTypeBadge = ({ type, size = "sm" }: Props) => {
  const { user } = useAuth();
  const [resolved, setResolved] = useState<ProfessionalType | null>(type ?? null);

  useEffect(() => {
    if (type !== undefined) { setResolved(type); return; }
    if (!user) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("professional_type")
        .eq("user_id", user.id)
        .maybeSingle();
      const pt = (data as any)?.professional_type;
      setResolved(isProfessionalType(pt) ? pt : null);
    })();
  }, [type, user]);

  if (!resolved) return null;
  const m = PROFILE_META[resolved];
  const px = size === "md" ? "px-2 py-1" : "px-1.5 py-0.5";
  const fs = size === "md" ? 9 : 7;

  return (
    <span
      className={`inline-flex items-center gap-1 ${px}`}
      style={{
        border: `1px solid ${m.color}55`,
        background: `${m.color}10`,
        color: m.color,
        fontFamily: "'Space Mono', monospace",
        fontSize: fs,
        letterSpacing: "0.12em",
        borderRadius: 2,
        textTransform: "uppercase",
      }}
    >
      <m.icon className="w-3 h-3" />
      {m.label}
    </span>
  );
};

export default ProfessionalTypeBadge;
