import { useEffect, useState } from "react";
import { Plus, Check, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { LineChart, Line, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  athleteId: string | null;
  protocolId: string | null;
  exerciseName: string;
  weekNumber: number;
  dayNumber: number;
}

interface LogRow {
  id: string;
  week_number: number;
  top_set_kg: number | null;
  rpe_felt: number | null;
  notes: string | null;
  logged_at: string;
}

export default function ExerciseLogPanel({
  athleteId,
  protocolId,
  exerciseName,
  weekNumber,
  dayNumber,
}: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [logs, setLogs] = useState<LogRow[]>([]);
  const [kg, setKg] = useState("");
  const [rpe, setRpe] = useState("");
  const [notes, setNotes] = useState("");

  const enabled = !!athleteId;
  const currentLogged = logs.find((l) => l.week_number === weekNumber);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        let q = supabase
          .from("workout_logs")
          .select("id, week_number, top_set_kg, rpe_felt, notes, logged_at")
          .eq("athlete_id", athleteId!)
          .eq("exercise_name", exerciseName)
          .order("week_number", { ascending: true });
        if (protocolId) q = q.eq("protocol_id", protocolId);
        const { data, error } = await q;
        if (!cancelled && !error) setLogs((data || []) as LogRow[]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [athleteId, protocolId, exerciseName, enabled]);

  const handleSave = async () => {
    if (!enabled) return;
    const kgNum = parseFloat(kg.replace(",", "."));
    const rpeNum = parseFloat(rpe.replace(",", "."));
    if (!Number.isFinite(kgNum)) {
      toast.error("Informe a carga em kg");
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from("workout_logs")
        .insert({
          athlete_id: athleteId!,
          protocol_id: protocolId,
          week_number: weekNumber,
          day_number: dayNumber,
          exercise_name: exerciseName,
          top_set_kg: kgNum,
          rpe_felt: Number.isFinite(rpeNum) ? rpeNum : null,
          notes: notes || null,
        })
        .select("id, week_number, top_set_kg, rpe_felt, notes, logged_at")
        .single();
      if (error) throw error;
      setLogs((prev) => [...prev.filter((l) => l.week_number !== weekNumber), data as LogRow]
        .sort((a, b) => a.week_number - b.week_number));
      setKg(""); setRpe(""); setNotes("");
      setOpen(false);
      toast.success("Registro salvo");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar registro");
    } finally {
      setSaving(false);
    }
  };

  if (!enabled) {
    return (
      <div className="text-[9px] mt-2" style={{ color: "#64748b" }}>
        Faça login como atleta para registrar carga
      </div>
    );
  }

  // Histórico das últimas 4 semanas relevantes ao redor de weekNumber
  const recent = logs.filter((l) => l.week_number >= Math.max(1, weekNumber - 3) && l.week_number <= weekNumber);
  const sparkData = logs.map((l) => ({ w: l.week_number, kg: l.top_set_kg ?? 0 }));

  return (
    <div className="mt-2 space-y-1.5">
      <div className="flex items-center justify-between gap-2">
        {currentLogged ? (
          <span
            className="text-[9px] px-2 py-1 rounded-full font-bold flex items-center gap-1"
            style={{ background: "rgba(74,222,128,0.12)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.3)" }}
          >
            <Check className="w-2.5 h-2.5" /> Registrado · {currentLogged.top_set_kg}kg
            {currentLogged.rpe_felt != null && ` · RPE ${currentLogged.rpe_felt}`}
          </span>
        ) : (
          <button
            onClick={() => setOpen((o) => !o)}
            className="text-[9px] px-2 py-1 rounded-lg flex items-center gap-1 font-bold"
            style={{ background: "rgba(74,222,128,0.08)", color: "#4ade80", border: "1px solid rgba(74,222,128,0.2)" }}
          >
            <Plus className="w-2.5 h-2.5" /> Registrar carga
          </button>
        )}
        {sparkData.length >= 2 && (
          <div style={{ width: 60, height: 18 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={sparkData}>
                <Line type="monotone" dataKey="kg" stroke="#4ade80" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <AnimatePresence>
        {open && !currentLogged && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div
              className="rounded-lg p-2.5 space-y-2"
              style={{ background: "rgba(74,222,128,0.04)", border: "1px solid rgba(74,222,128,0.15)" }}
            >
              <div className="grid grid-cols-2 gap-2">
                <input
                  inputMode="decimal"
                  value={kg}
                  onChange={(e) => setKg(e.target.value)}
                  placeholder="Top Set (kg)"
                  className="text-[10px] rounded px-2 py-1.5 outline-none"
                  style={{ background: "#0c120c", color: "#f0fdf4", border: "1px solid rgba(74,222,128,0.2)" }}
                />
                <input
                  inputMode="decimal"
                  value={rpe}
                  onChange={(e) => setRpe(e.target.value)}
                  placeholder="RPE sentido (1–10)"
                  className="text-[10px] rounded px-2 py-1.5 outline-none"
                  style={{ background: "#0c120c", color: "#f0fdf4", border: "1px solid rgba(74,222,128,0.2)" }}
                />
              </div>
              <input
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Observação (opcional)"
                className="w-full text-[10px] rounded px-2 py-1.5 outline-none"
                style={{ background: "#0c120c", color: "#f0fdf4", border: "1px solid rgba(74,222,128,0.2)" }}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setOpen(false)}
                  className="text-[10px] px-2 py-1 rounded"
                  style={{ color: "#94a3b8" }}
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="text-[10px] px-3 py-1 rounded font-bold flex items-center gap-1 disabled:opacity-50"
                  style={{ background: "#4ade80", color: "#03030a" }}
                >
                  {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3 h-3" />}
                  Salvar registro
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mini histórico */}
      <div className="text-[9px]" style={{ color: "#64748b" }}>
        {loading ? (
          "Carregando histórico…"
        ) : recent.length === 0 ? (
          "Nenhum registro ainda — comece hoje"
        ) : (
          <div className="flex flex-wrap gap-x-3 gap-y-0.5">
            {recent.map((l) => {
              const isCurrent = l.week_number === weekNumber;
              return (
                <span
                  key={l.id}
                  style={{
                    color: isCurrent ? "#4ade80" : "#94a3b8",
                    fontWeight: isCurrent ? 700 : 400,
                  }}
                >
                  Sem {l.week_number}: {l.top_set_kg}kg
                  {l.rpe_felt != null && ` | RPE ${l.rpe_felt}`}
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
