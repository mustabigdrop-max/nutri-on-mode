import { ROLE_META, type ProfessionalRole } from "@/lib/professionalScopes";

interface Props {
  role: ProfessionalRole;
  size?: "sm" | "md";
  registration?: string | null;
}

const ProfRoleBadge = ({ role, size = "sm", registration }: Props) => {
  const m = ROLE_META[role];
  const Icon = m.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 ${size === "md" ? "px-3 py-1" : "px-2 py-0.5"}`}
      style={{
        borderRadius: 20,
        background: `${m.color}1a`,
        color: m.color,
        border: `1px solid ${m.color}33`,
        fontFamily: "Rajdhani, sans-serif",
        fontWeight: 700,
        fontSize: size === "md" ? 12 : 10,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
      }}
    >
      <Icon className="w-3 h-3" />
      {m.label}
      {registration ? <span style={{ opacity: 0.7 }}>· {registration}</span> : null}
    </span>
  );
};

export default ProfRoleBadge;
