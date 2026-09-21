import { Lock, MessageCircle } from "lucide-react";

interface Props {
  clientName?: string | null;
  expiredAt?: string | null;
  coachPhone?: string | null;
}

const onlyDigits = (v: string) => v.replace(/\D/g, "");

/** Tela mostrada ao aluno quando o plano expirou e o acesso foi pausado. */
export default function LockedScreen({ clientName, expiredAt, coachPhone }: Props) {
  const nome = (clientName || "").trim().split(" ")[0];
  const zap = coachPhone ? onlyDigits(coachPhone) : "";
  const whatsapp = zap
    ? `https://wa.me/${zap.length > 11 ? zap : `55${zap}`}?text=${encodeURIComponent(
        "Oi, Coach! Quero renovar meu plano para liberar o acesso.",
      )}`
    : null;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: "#0A0A0A", color: "#F5F0E8" }}
    >
      <div style={{ fontFamily: "Rajdhani, sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: "0.04em" }}>
        nutriON
      </div>

      <div
        className="flex items-center justify-center"
        style={{
          width: 72,
          height: 72,
          marginTop: 28,
          border: "1px solid rgba(255,68,68,0.4)",
          background: "rgba(255,68,68,0.08)",
          borderRadius: 0,
        }}
      >
        <Lock size={28} color="#FF4444" />
      </div>

      <div
        style={{
          fontFamily: "Rajdhani, sans-serif",
          fontWeight: 700,
          fontSize: 32,
          marginTop: 20,
          letterSpacing: "0.02em",
        }}
      >
        ACESSO PAUSADO
      </div>

      <p style={{ maxWidth: 440, marginTop: 14, fontSize: 14, lineHeight: 1.7, color: "#BDB8AE" }}>
        {nome ? `Olá ${nome}! ` : ""}
        {expiredAt
          ? `Seu plano expirou em ${new Date(expiredAt).toLocaleDateString("pt-BR")}.`
          : "Seu plano está sem validade ativa no momento."}{" "}
        Para voltar a acessar seu treino, plano alimentar e todo o acompanhamento, fale com o Coach Diogo Mello para
        renovar.
      </p>

      {whatsapp && (
        <a
          href={whatsapp}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2"
          style={{
            marginTop: 24,
            padding: "12px 24px",
            background: "#EF9F27",
            color: "#0A0A0A",
            fontFamily: "Rajdhani, sans-serif",
            fontWeight: 700,
            fontSize: 15,
            borderRadius: 0,
            letterSpacing: "0.02em",
          }}
        >
          <MessageCircle size={16} /> FALAR COM O COACH
        </a>
      )}

      <div style={{ fontFamily: "Space Mono, monospace", fontSize: 11, color: "#888", marginTop: 34 }}>
        Transformação é sistema.
      </div>
    </div>
  );
}
