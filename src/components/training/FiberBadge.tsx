import { useState } from "react";
import { fiberColor, fiberProfileForExercise, type FiberContext } from "@/lib/fiberEngine";

/**
 * Badge discreto de fibra muscular ao lado do exercício.
 * Clique expande a justificativa (reps · descanso · perfil).
 */
export default function FiberBadge({
  exerciseName,
  muscleTarget,
  declared,
  note,
  ctx,
}: {
  exerciseName: string;
  muscleTarget?: string;
  declared?: string;
  note?: string;
  ctx?: FiberContext;
}) {
  const [open, setOpen] = useState(false);
  const profile = fiberProfileForExercise(exerciseName, muscleTarget, ctx || {});
  if (!profile) return null;

  const type = (declared === "I" || declared === "IIA" || declared === "IIX" ? declared : profile.type) as typeof profile.type;
  const color = fiberColor(type);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v); }}
        className="text-[8px] px-1.5 py-0.5 rounded-full font-bold transition"
        style={{ background: `${color}1f`, color, border: `1px solid ${color}40` }}
        title="Perfil de fibras"
      >
        {type}
      </button>
      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full mt-1 rounded-lg p-2"
          style={{ background: "rgba(0,0,0,0.35)", border: `1px solid ${color}33` }}
        >
          <p className="text-[10px] font-bold" style={{ color }}>
            Repetições {profile.reps} · Descanso {profile.rest} · Tempo {profile.tempo}
          </p>
          <p className="text-[9px] mt-0.5 leading-relaxed" style={{ color: "#94a3b8" }}>
            {note || profile.rationale}
          </p>
        </div>
      )}
    </>
  );
}
