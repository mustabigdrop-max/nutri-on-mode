import { useEffect, useState } from "react";
import { Drama, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const GOLD = "#E8A020";
const DIM = "rgba(255,255,255,0.55)";

type AlterEgo = { name: string; posture: string | null; activation_phrase: string | null };

/** 🎭 Alter Ego — a versão imbatível do cliente (Todd Herman + embodied cognition). */
export default function AlterEgoCard() {
  const { user } = useAuth();
  const [data, setData] = useState<AlterEgo | null>(null);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState("");
  const [posture, setPosture] = useState("");
  const [phrase, setPhrase] = useState("");
  const [saving, setSaving] = useState(false);
  const [activated, setActivated] = useState(false);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("mce_alter_ego")
      .select("name, posture, activation_phrase")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setData(data as AlterEgo);
          setName(data.name ?? "");
          setPosture(data.posture ?? "");
          setPhrase(data.activation_phrase ?? "");
        } else {
          setEditing(true);
        }
      });
  }, [user]);

  const save = async () => {
    if (!user || !name.trim()) {
      toast.message("Dê um nome ao seu Alter Ego.");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: user.id,
      name: name.trim(),
      posture: posture.trim() || null,
      activation_phrase: phrase.trim() || null,
      updated_at: new Date().toISOString(),
    };
    const { error } = await supabase.from("mce_alter_ego").upsert(payload, { onConflict: "user_id" });
    setSaving(false);
    if (error) {
      toast.error("Não foi possível salvar agora.");
      return;
    }
    setData({ name: payload.name, posture: payload.posture, activation_phrase: payload.activation_phrase });
    setEditing(false);
    toast.success("Alter Ego registrado.");
  };

  const activate = () => {
    setActivated(true);
    toast.success(`${data?.name} ativado. Ombros pra trás. Queixo erguido.`);
    setTimeout(() => setActivated(false), 6000);
  };

  return (
    <section
      className="rounded-2xl p-4"
      style={{ border: `1px solid ${GOLD}33`, background: `linear-gradient(135deg, ${GOLD}10, transparent)` }}
    >
      <div className="flex items-center gap-2 mb-2">
        <Drama className="w-4 h-4" style={{ color: GOLD }} />
        <h2 className="text-[11px] font-bold tracking-[2px] uppercase" style={{ color: GOLD }}>
          🎭 Alter Ego
        </h2>
      </div>

      {editing ? (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: DIM }}>
            Kobe escolheu Black Mamba. Beyoncé escolheu Sasha Fierce. Qual é o seu? Não precisa ser um nome real —
            pode ser uma palavra, uma sigla, um código.
          </p>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nome do Alter Ego (ex: BLACK WOLF)"
            className="w-full text-sm rounded-lg px-3 py-2 bg-transparent"
            style={{ border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
          />
          <input
            value={posture}
            onChange={(e) => setPosture(e.target.value)}
            placeholder="Como ele anda / respira / olha"
            className="w-full text-sm rounded-lg px-3 py-2 bg-transparent"
            style={{ border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
          />
          <input
            value={phrase}
            onChange={(e) => setPhrase(e.target.value)}
            placeholder="Frase de ativação"
            className="w-full text-sm rounded-lg px-3 py-2 bg-transparent"
            style={{ border: "1px solid rgba(255,255,255,0.14)", color: "#fff" }}
          />
          <button
            onClick={save}
            disabled={saving}
            className="text-xs font-bold px-4 py-2 rounded-lg inline-flex items-center gap-2"
            style={{ background: GOLD, color: "#03030a", opacity: saving ? 0.6 : 1 }}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
            Salvar Alter Ego
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-lg font-black truncate" style={{ color: GOLD }}>
              {data?.name}
            </p>
            <p className="text-[11px]" style={{ color: DIM }}>
              {data?.posture || "Ombros pra trás. Queixo erguido. Maxilar travado."}
            </p>
            {data?.activation_phrase && (
              <p className="text-[11px] italic mt-1" style={{ color: "rgba(255,255,255,0.7)" }}>
                "{data.activation_phrase}"
              </p>
            )}
            <button onClick={() => setEditing(true)} className="text-[10px] underline mt-1" style={{ color: DIM }}>
              editar
            </button>
          </div>
          <button
            onClick={activate}
            className="text-xs font-bold px-4 py-2 rounded-lg shrink-0"
            style={{
              background: activated ? "#EF4444" : GOLD,
              color: "#03030a",
              transition: "background 200ms",
            }}
          >
            {activated ? "ATIVADO" : "Ativar"}
          </button>
        </div>
      )}
    </section>
  );
}
