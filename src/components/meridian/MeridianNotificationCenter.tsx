// MERIDIAN — Centro de notificações táticas (alertas automáticos).
import { useState } from "react";
import { Bell, AlertTriangle, CheckCircle2, RefreshCw } from "lucide-react";
import { useMeridianNotifications, type MeridianNotification } from "@/hooks/useMeridianNotifications";

const ACCENT = "#B8922A";

const KIND_LABEL: Record<string, string> = {
  PEAK_WEEK_WINDOW: "PEAK WEEK",
  DRUG_TEST_NEAR: "DRUG TEST",
  CHECKPOINT_OVERDUE: "CHECKPOINT",
  REDS_DETECTED: "RED-S",
};

export default function MeridianNotificationCenter({ targetUserId }: { targetUserId?: string }) {
  const { items, unreadCount, loading, scanning, markRead, markAllRead, runScan } =
    useMeridianNotifications(targetUserId);
  const [open, setOpen] = useState(false);

  const sevColor = (s: string) =>
    s === "CRITICAL" ? "#ef4444" : s === "WARN" ? "#facc15" : "#7a7a7a";

  return (
    <div
      style={{
        background: "rgba(255,255,255,0.02)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderLeft: `3px solid ${ACCENT}`,
        padding: 14,
        borderRadius: 4,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: open ? 12 : 0 }}>
        <button
          onClick={() => setOpen((v) => !v)}
          style={{
            background: "transparent",
            border: "none",
            color: "#e8e8e8",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontFamily: "'Space Grotesk', sans-serif",
            padding: 0,
          }}
        >
          <Bell size={14} color={ACCENT} />
          <span style={{ fontSize: 10, letterSpacing: 3, color: ACCENT }}>SITREP // ALERTAS</span>
          {unreadCount > 0 && (
            <span
              style={{
                background: "#ef4444",
                color: "#fff",
                fontSize: 9,
                padding: "2px 6px",
                borderRadius: 8,
                fontWeight: 700,
              }}
            >
              {unreadCount}
            </span>
          )}
        </button>

        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={runScan}
            disabled={scanning}
            title="Re-escanear agora"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#999",
              padding: "4px 8px",
              fontSize: 9,
              letterSpacing: 1,
              borderRadius: 3,
              cursor: scanning ? "wait" : "pointer",
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            <RefreshCw size={10} className={scanning ? "animate-spin" : ""} />
            {scanning ? "SCANNING" : "SCAN"}
          </button>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.15)",
                color: "#999",
                padding: "4px 8px",
                fontSize: 9,
                letterSpacing: 1,
                borderRadius: 3,
                cursor: "pointer",
              }}
            >
              MARCAR LIDAS
            </button>
          )}
        </div>
      </div>

      {open && (
        <div style={{ display: "grid", gap: 6, marginTop: 8 }}>
          {loading ? (
            <div style={{ fontSize: 11, color: "#7a7a7a" }}>Carregando alertas...</div>
          ) : items.length === 0 ? (
            <div
              style={{
                fontSize: 11,
                color: "#7a7a7a",
                padding: 12,
                border: "1px dashed rgba(255,255,255,0.08)",
                borderRadius: 3,
                textAlign: "center",
              }}
            >
              Nenhum alerta. Operação em estado nominal.
            </div>
          ) : (
            items.map((n) => <NotifRow key={n.id} n={n} onRead={() => markRead(n.id)} sevColor={sevColor(n.severity)} />)
          )}
        </div>
      )}
    </div>
  );
}

function NotifRow({
  n,
  onRead,
  sevColor,
}: {
  n: MeridianNotification;
  onRead: () => void;
  sevColor: string;
}) {
  const unread = !n.read_at;
  return (
    <div
      style={{
        padding: 10,
        background: unread ? "rgba(184,146,42,0.04)" : "rgba(0,0,0,0.2)",
        border: `1px solid ${sevColor}33`,
        borderLeft: `3px solid ${sevColor}`,
        borderRadius: 3,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
          <AlertTriangle size={10} color={sevColor} />
          <span style={{ fontSize: 9, letterSpacing: 2, color: sevColor, fontWeight: 700 }}>
            {KIND_LABEL[n.kind] ?? n.kind} · {n.severity}
          </span>
          <span style={{ fontSize: 9, color: "#7a7a7a", marginLeft: "auto" }}>
            {new Date(n.created_at).toLocaleDateString("pt-BR")}
          </span>
        </div>
        <div style={{ fontSize: 12, color: "#e8e8e8", fontWeight: 600, marginBottom: 2 }}>{n.title}</div>
        {n.body && <div style={{ fontSize: 11, color: "#999", lineHeight: 1.4 }}>{n.body}</div>}
      </div>
      {unread && (
        <button
          onClick={onRead}
          title="Marcar como lida"
          style={{
            background: "transparent",
            border: "none",
            color: "#7a7a7a",
            cursor: "pointer",
            padding: 4,
          }}
        >
          <CheckCircle2 size={14} />
        </button>
      )}
    </div>
  );
}
