import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ApexAssessment {
  id: string;
  assessment_date: string;
  overall_score: number | null;
  posture_score: number | null;
  mobility_score: number | null;
  symmetry_score: number | null;
  fms_total: number | null;
  notes: string | null;
}

export interface PostureData {
  forward_head: string;
  thoracic_kyphosis: string;
  lumbar_lordosis: string;
  pelvic_tilt: string;
  shoulder_asym: string;
  hip_asym: string;
  scoliosis: string;
  upper_crossed: string;
  lower_crossed: string;
  pronation_dist: string;
}

export interface FMSScores {
  deep_squat: number;
  hurdle_step_l: number;
  hurdle_step_r: number;
  inline_lunge_l: number;
  inline_lunge_r: number;
  shoulder_mob_l: number;
  shoulder_mob_r: number;
  active_slr_l: number;
  active_slr_r: number;
  trunk_stability: number;
  rotary_stab_l: number;
  rotary_stab_r: number;
}

export interface PainEntry {
  id: string;
  body_region: string;
  side: string;
  pain_type: string;
  quality: string[];
  intensity: number;
  behavior: string;
  onset_pattern: string;
  notes: string | null;
  red_flag: boolean;
  resolved_at: string | null;
  created_at: string;
}

export interface ROMData {
  ankle_df_l: number | null; ankle_df_r: number | null;
  hip_flex_l: number | null; hip_flex_r: number | null;
  hip_ext_l: number | null;  hip_ext_r: number | null;
  hip_ir_l: number | null;   hip_ir_r: number | null;
  hip_er_l: number | null;   hip_er_r: number | null;
  shoulder_flex_l: number | null; shoulder_flex_r: number | null;
  shoulder_er_l: number | null;   shoulder_er_r: number | null;
  thoracic_rot_l: number | null;  thoracic_rot_r: number | null;
  cervical_flex: number | null;
  cervical_ext: number | null;
  cervical_rot_l: number | null;
  cervical_rot_r: number | null;
}

export interface MuscleScores {
  chest_upper: number; chest_lower: number;
  shoulder_ant: number; shoulder_lat: number; shoulder_post: number;
  biceps_l: number; biceps_r: number;
  triceps_l: number; triceps_r: number;
  forearms_l: number; forearms_r: number;
  traps_upper: number; traps_mid: number; traps_lower: number;
  lats: number; rhomboids: number;
  abs_rectus: number; abs_obliques: number; erectors: number;
  glute_max: number; glute_med: number;
  quads_l: number; quads_r: number;
  hams_l: number; hams_r: number;
  calves_l: number; calves_r: number;
  adductors: number;
  shape_goal: string;
}

export const DEFAULT_POSTURE: PostureData = {
  forward_head: "none", thoracic_kyphosis: "normal",
  lumbar_lordosis: "normal", pelvic_tilt: "neutral",
  shoulder_asym: "none", hip_asym: "none", scoliosis: "none",
  upper_crossed: "none", lower_crossed: "none", pronation_dist: "none",
};

export const DEFAULT_FMS: FMSScores = {
  deep_squat: 2, hurdle_step_l: 2, hurdle_step_r: 2,
  inline_lunge_l: 2, inline_lunge_r: 2,
  shoulder_mob_l: 2, shoulder_mob_r: 2,
  active_slr_l: 2, active_slr_r: 2,
  trunk_stability: 2, rotary_stab_l: 2, rotary_stab_r: 2,
};

export const DEFAULT_ROM: ROMData = {
  ankle_df_l: null, ankle_df_r: null,
  hip_flex_l: null, hip_flex_r: null,
  hip_ext_l: null, hip_ext_r: null,
  hip_ir_l: null, hip_ir_r: null,
  hip_er_l: null, hip_er_r: null,
  shoulder_flex_l: null, shoulder_flex_r: null,
  shoulder_er_l: null, shoulder_er_r: null,
  thoracic_rot_l: null, thoracic_rot_r: null,
  cervical_flex: null, cervical_ext: null,
  cervical_rot_l: null, cervical_rot_r: null,
};

export const DEFAULT_MUSCLES: MuscleScores = {
  chest_upper: 5, chest_lower: 5,
  shoulder_ant: 5, shoulder_lat: 5, shoulder_post: 5,
  biceps_l: 5, biceps_r: 5, triceps_l: 5, triceps_r: 5,
  forearms_l: 5, forearms_r: 5,
  traps_upper: 5, traps_mid: 5, traps_lower: 5,
  lats: 5, rhomboids: 5,
  abs_rectus: 5, abs_obliques: 5, erectors: 5,
  glute_max: 5, glute_med: 5,
  quads_l: 5, quads_r: 5,
  hams_l: 5, hams_r: 5,
  calves_l: 5, calves_r: 5,
  adductors: 5,
  shape_goal: "physique",
};

// ─── FMS total (uses minimum of bilateral pairs — official FMS scoring) ────────
export const calcFmsTotal = (f: FMSScores): number => {
  const hurdle   = Math.min(f.hurdle_step_l,  f.hurdle_step_r);
  const lunge    = Math.min(f.inline_lunge_l, f.inline_lunge_r);
  const shoulder = Math.min(f.shoulder_mob_l, f.shoulder_mob_r);
  const slr      = Math.min(f.active_slr_l,   f.active_slr_r);
  const rotary   = Math.min(f.rotary_stab_l,  f.rotary_stab_r);
  return f.deep_squat + hurdle + lunge + shoulder + slr + f.trunk_stability + rotary;
};

// ─── ROM score: % joints within normal range ──────────────────────────────────
const ROM_NORMS: Record<keyof Omit<ROMData, "cervical_flex" | "cervical_ext">, number> & { cervical_flex: number; cervical_ext: number } = {
  ankle_df_l: 20, ankle_df_r: 20,
  hip_flex_l: 120, hip_flex_r: 120,
  hip_ext_l: 20,  hip_ext_r: 20,
  hip_ir_l: 45,   hip_ir_r: 45,
  hip_er_l: 45,   hip_er_r: 45,
  shoulder_flex_l: 180, shoulder_flex_r: 180,
  shoulder_er_l: 90,   shoulder_er_r: 90,
  thoracic_rot_l: 45,  thoracic_rot_r: 45,
  cervical_flex: 45, cervical_ext: 45,
  cervical_rot_l: 80, cervical_rot_r: 80,
};

export const calcRomScore = (rom: ROMData): number => {
  const entries = Object.entries(ROM_NORMS) as [keyof typeof ROM_NORMS, number][];
  const measured = entries.filter(([k]) => rom[k as keyof ROMData] !== null);
  if (measured.length === 0) return 100;
  const inRange = measured.filter(([k, norm]) => {
    const val = rom[k as keyof ROMData] as number;
    return val >= norm * 0.8;
  });
  return Math.round((inRange.length / measured.length) * 100);
};

// ─── Posture score (inverts severity weights) ─────────────────────────────────
const SEV: Record<string, number> = { none: 0, normal: 0, neutral: 0, increased: 1, decreased: 1, mild: 1, moderate: 2, severe: 3, functional: 1, structural: 3, anterior: 1, posterior: 1 };
export const calcPostureScore = (p: PostureData): number => {
  const keys: (keyof PostureData)[] = ["forward_head", "thoracic_kyphosis", "lumbar_lordosis", "pelvic_tilt", "shoulder_asym", "upper_crossed", "lower_crossed", "pronation_dist"];
  const totalPenalty = keys.reduce((acc, k) => acc + (SEV[p[k]] ?? 0), 0);
  return Math.max(0, Math.round(100 - totalPenalty * (100 / (keys.length * 3))));
};

// ─── Symmetry score from muscle data ─────────────────────────────────────────
export const calcSymmetryScore = (m: MuscleScores): number => {
  const pairs: [keyof MuscleScores, keyof MuscleScores][] = [
    ["biceps_l", "biceps_r"], ["triceps_l", "triceps_r"],
    ["quads_l", "quads_r"],   ["hams_l", "hams_r"],
    ["calves_l", "calves_r"], ["forearms_l", "forearms_r"],
  ];
  const diffs = pairs.map(([l, r]) => Math.abs((m[l] as number) - (m[r] as number)));
  const avgDiff = diffs.reduce((a, b) => a + b, 0) / diffs.length;
  return Math.max(0, Math.round(100 - avgDiff * 20));
};

// ─── Hook ─────────────────────────────────────────────────────────────────────
export const useApex = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [latestAssessment, setLatestAssessment] = useState<ApexAssessment | null>(null);
  const [postureData, setPostureDataState] = useState<PostureData>(DEFAULT_POSTURE);
  const [fmsScores, setFmsScoresState] = useState<FMSScores>(DEFAULT_FMS);
  const [romData, setRomDataState] = useState<ROMData>(DEFAULT_ROM);
  const [muscleScores, setMuscleScoresState] = useState<MuscleScores>(DEFAULT_MUSCLES);
  const [activePain, setActivePain] = useState<PainEntry[]>([]);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [assessRes, painRes] = await Promise.all([
        supabase.from("apex_assessments").select("*").eq("user_id", user.id).order("assessment_date", { ascending: false }).limit(1).maybeSingle(),
        supabase.from("apex_pain_entries").select("*").eq("user_id", user.id).is("resolved_at", null).order("created_at", { ascending: false }),
      ]);

      if (assessRes.data) {
        setLatestAssessment(assessRes.data as ApexAssessment);
        const id = assessRes.data.id;
        const [postRes, fmsRes, romRes, musRes] = await Promise.all([
          supabase.from("apex_posture_data").select("*").eq("assessment_id", id).maybeSingle(),
          supabase.from("apex_fms_scores").select("*").eq("assessment_id", id).maybeSingle(),
          supabase.from("apex_rom_measurements").select("*").eq("assessment_id", id).maybeSingle(),
          supabase.from("apex_muscle_scores").select("*").eq("user_id", user.id).order("assessment_date", { ascending: false }).limit(1).maybeSingle(),
        ]);
        if (postRes.data) setPostureDataState(postRes.data as PostureData);
        if (fmsRes.data) setFmsScoresState(fmsRes.data as FMSScores);
        if (romRes.data) setRomDataState(romRes.data as ROMData);
        if (musRes.data) setMuscleScoresState(musRes.data as MuscleScores);
      }
      if (painRes.data) setActivePain(painRes.data as PainEntry[]);
    } catch (e) {
      console.error("useApex load error", e);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => { load(); }, [load]);

  const saveFullAssessment = async (
    posture: PostureData,
    fms: FMSScores,
    rom: ROMData,
    muscles: MuscleScores
  ) => {
    if (!user?.id) return;
    const fmsTotal = calcFmsTotal(fms);
    const postureScore = calcPostureScore(posture);
    const mobilityScore = calcRomScore(rom);
    const symmetryScore = calcSymmetryScore(muscles);
    const overallScore = Math.round((fmsTotal / 21) * 25 + postureScore * 0.25 + mobilityScore * 0.25 + symmetryScore * 0.25);

    const { data: assess } = await supabase.from("apex_assessments").insert({
      user_id: user.id, assessment_date: new Date().toISOString().split("T")[0],
      overall_score: overallScore, posture_score: postureScore,
      mobility_score: mobilityScore, symmetry_score: symmetryScore, fms_total: fmsTotal,
    }).select().single();

    if (!assess) return;
    await Promise.all([
      supabase.from("apex_posture_data").insert({ ...posture, assessment_id: assess.id, user_id: user.id }),
      supabase.from("apex_fms_scores").insert({ ...fms, assessment_id: assess.id, user_id: user.id }),
      supabase.from("apex_rom_measurements").insert({ ...rom, assessment_id: assess.id, user_id: user.id }),
      supabase.from("apex_muscle_scores").insert({ ...muscles, user_id: user.id }),
    ]);
    await load();
  };

  const addPainEntry = async (entry: Omit<PainEntry, "id" | "created_at" | "resolved_at">) => {
    if (!user?.id) return;
    await supabase.from("apex_pain_entries").insert({ ...entry, user_id: user.id });
    await load();
  };

  const resolvePain = async (id: string) => {
    await supabase.from("apex_pain_entries").update({ resolved_at: new Date().toISOString() }).eq("id", id);
    setActivePain((p) => p.filter((e) => e.id !== id));
  };

  return {
    loading, latestAssessment, postureData, fmsScores, romData, muscleScores,
    activePain, saveFullAssessment, addPainEntry, resolvePain,
    calcFmsTotal, calcPostureScore, calcRomScore, calcSymmetryScore,
  };
};
