import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, Camera, Image as ImageIcon, Save, Share2, Download,
  Activity, Target, Layers, MessageSquare, ChevronDown, Loader2, CheckCircle2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ───────────── Design tokens ─────────────
const C = {
  bg: "#040404",
  card: "#0a0a0a",
  border: "#1a1a1a",
  gold: "#B8922A",
  goldSoft: "rgba(184,146,42,.14)",
  text: "#f5f5f5",
  textSec: "#9a9a9a",
  high: "#E24B4A",
  med: "#EF9F27",
  low: "#1D9E75",
};

declare global {
  interface Window {
    Pose: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    POSE_CONNECTIONS: any;
  }
}

// ───────────── Types ─────────────
interface NormalizedLandmark { x: number; y: number; z: number; visibility?: number; }
interface PosturalAngles {
  headForwardDeg: number;
  shoulderProtraction: number;
  thoracicKyphosis: number;
  lumbarLordosis: number;
  pelvicTilt: number;
  kneeAlignment: number;
}
interface APEXReport {
  athleteName: string;
  date: string;
  apexScore: number;
  findings: Array<{ area: string; severity: "high" | "medium" | "low"; value: string; referenceRange: string; description: string; }>;
  muscleStatus: Array<{ name: string; status: "shortened" | "inhibited" | "normal" }>;
  protocol: Array<{ phase: number; name: string; exercises: Array<{ name: string; target: string; dose: string }> }>;
  cueing: Array<{ movement: string; cues: string[] }>;
}

// ───────────── Helpers ─────────────
const MOCK_ANGLES: PosturalAngles = {
  headForwardDeg: 12,
  shoulderProtraction: 8.4,
  thoracicKyphosis: 38,
  lumbarLordosis: 54,
  pelvicTilt: 9,
  kneeAlignment: 6,
};

function calcAPEXScore(a: PosturalAngles): number {
  let s = 100;
  if (a.headForwardDeg > 5) s -= Math.min(30, (a.headForwardDeg - 5) * 3);
  if (a.shoulderProtraction > 5) s -= Math.min(25, (a.shoulderProtraction - 5) * 2);
  if (a.thoracicKyphosis > 30) s -= Math.min(20, (a.thoracicKyphosis - 30) * 1.5);
  if (a.lumbarLordosis > 50) s -= Math.min(15, (a.lumbarLordosis - 50) * 1);
  if (a.pelvicTilt > 5) s -= Math.min(10, (a.pelvicTilt - 5) * 1);
  return Math.max(0, Math.round(s));
}

function generateFindings(a: PosturalAngles): APEXReport["findings"] {
  const f: APEXReport["findings"] = [];
  if (a.headForwardDeg > 5)
    f.push({ area: "Cabeça anteriorizada", severity: a.headForwardDeg > 12 ? "high" : "medium",
      value: `${a.headForwardDeg.toFixed(1)}°`, referenceRange: "≤ 5°",
      description: "Sobrecarga em extensores cervicais e suboccipitais." });
  if (a.shoulderProtraction > 5)
    f.push({ area: "Protração de ombros", severity: a.shoulderProtraction > 9 ? "high" : "medium",
      value: `${a.shoulderProtraction.toFixed(1)}%`, referenceRange: "≤ 5%",
      description: "Encurtamento de peitoral menor / inibição de trap. médio e inferior." });
  if (a.thoracicKyphosis > 30)
    f.push({ area: "Cifose torácica", severity: a.thoracicKyphosis > 40 ? "high" : "medium",
      value: `${a.thoracicKyphosis.toFixed(0)}°`, referenceRange: "20–30°",
      description: "Limita extensão torácica e rotação externa de ombro." });
  if (a.lumbarLordosis > 50)
    f.push({ area: "Hiperlordose lombar", severity: "medium",
      value: `${a.lumbarLordosis.toFixed(0)}°`, referenceRange: "30–50°",
      description: "Anteversão pélvica associada — risco em agachamento profundo." });
  if (a.pelvicTilt > 5)
    f.push({ area: "Inclinação pélvica", severity: "low",
      value: `${a.pelvicTilt.toFixed(1)}°`, referenceRange: "≤ 5°",
      description: "Assimetria pélvica leve." });
  if (a.kneeAlignment > 5)
    f.push({ area: "Alinhamento do joelho", severity: "low",
      value: `${a.kneeAlignment.toFixed(1)}°`, referenceRange: "≤ 5°",
      description: "Tendência a valgo dinâmico." });
  return f;
}

function generateMuscleStatus(a: PosturalAngles): APEXReport["muscleStatus"] {
  return [
    { name: "Suboccipitais", status: a.headForwardDeg > 5 ? "shortened" : "normal" },
    { name: "Peitoral menor", status: a.shoulderProtraction > 5 ? "shortened" : "normal" },
    { name: "Trap. médio / inferior", status: a.shoulderProtraction > 5 ? "inhibited" : "normal" },
    { name: "Eretores torácicos", status: a.thoracicKyphosis > 30 ? "inhibited" : "normal" },
    { name: "Flexores do quadril", status: a.lumbarLordosis > 50 ? "shortened" : "normal" },
    { name: "Glúteo máximo", status: a.lumbarLordosis > 50 ? "inhibited" : "normal" },
  ];
}

function generateProtocol(a: PosturalAngles): APEXReport["protocol"] {
  const ex: Array<{ phase: number; name: string; target: string; dose: string }> = [];
  if (a.headForwardDeg > 5) {
    ex.push({ phase: 1, name: "Liberação suboccipital", target: "Suboccipitais", dose: "90s · 3x/sem" });
    ex.push({ phase: 2, name: "Chin tuck + flexão cervical", target: "Extensores cervicais", dose: "3×20s · 2x/dia" });
    ex.push({ phase: 3, name: "Chin tuck isométrico", target: "Fl. cervicais profundos", dose: "3×10×10s" });
  }
  if (a.shoulderProtraction > 5) {
    ex.push({ phase: 1, name: "Liberação peitoral c/ bola", target: "Peitoral menor", dose: "2 min/lado" });
    ex.push({ phase: 2, name: "Doorway stretch", target: "Peitoral maior e menor", dose: "3×30s/lado" });
    ex.push({ phase: 3, name: "Face pull corda", target: "Trap. médio / infra", dose: "4×15–20 · 3x/sem" });
    ex.push({ phase: 4, name: "Remada c/ retração escapular", target: "Dorsal + romboides", dose: "4×8–12" });
  }
  if (a.thoracicKyphosis > 30) {
    ex.push({ phase: 1, name: "Foam roll torácico", target: "T4–T8", dose: "2–3 min · diário" });
    ex.push({ phase: 2, name: "Extensão torácica sobre rolo", target: "Coluna torácica", dose: "3×10 ext." });
    ex.push({ phase: 3, name: "Wall angel", target: "Serrátil + trap. inferior", dose: "3×10 · diário" });
  }
  if (a.lumbarLordosis > 50) {
    ex.push({ phase: 2, name: "Alongamento iliopsoas", target: "Flexores do quadril", dose: "3×30s/lado" });
    ex.push({ phase: 3, name: "Glute bridge", target: "Glúteo máximo", dose: "4×15" });
    ex.push({ phase: 4, name: "Dead bug", target: "Core anti-extensão", dose: "3×8/lado" });
  }
  return [1, 2, 3, 4]
    .map((p) => ({
      phase: p,
      name: ["Inibir", "Alongar", "Ativar", "Integrar"][p - 1],
      exercises: ex.filter((e) => e.phase === p).map(({ phase, ...rest }) => rest),
    }))
    .filter((p) => p.exercises.length > 0);
}

function generateCueing(a: PosturalAngles): APEXReport["cueing"] {
  const c: APEXReport["cueing"] = [];
  if (a.shoulderProtraction > 5 || a.thoracicKyphosis > 30) {
    c.push({ movement: "Puxadas", cues: ["Inicia retração escapular antes de puxar", "Cotovelos abaixo da linha do ombro", "Peito alto, escápulas para o bolso"] });
    c.push({ movement: "Supino", cues: ["Escápulas retraídas e deprimidas", "Pega ligeiramente mais aberta evita protração", "Cotovelos em ~45° do tronco"] });
  }
  if (a.headForwardDeg > 5) {
    c.push({ movement: "Desenvolvimento", cues: ["Chin tuck antes da subida", "Olhar levemente para cima sem estender cervical", "Não permita projeção da cabeça"] });
  }
  c.push({ movement: "Postura geral", cues: ["A cada 50min, 60s de wall angel", "Respiração diafragmática 5 min antes do treino", "Hidratação e mobilidade torácica diária"] });
  return c;
}

function buildReport(name: string, a: PosturalAngles): APEXReport {
  return {
    athleteName: name || "Atleta",
    date: new Date().toLocaleDateString("pt-BR"),
    apexScore: calcAPEXScore(a),
    findings: generateFindings(a),
    muscleStatus: generateMuscleStatus(a),
    protocol: generateProtocol(a),
    cueing: generateCueing(a),
  };
}

// ───────────── Mediapipe loader ─────────────
function loadScript(src: string) {
  return new Promise<void>((res, rej) => {
    if (document.querySelector(`script[src="${src}"]`)) return res();
    const s = document.createElement("script");
    s.src = src; s.crossOrigin = "anonymous";
    s.onload = () => res(); s.onerror = () => rej(new Error("script " + src));
    document.head.appendChild(s);
  });
}
async function ensureMediapipe() {
  await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
  await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js");
  await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
}

// ───────────── Page ─────────────
export default function APEXPoseAnalysisPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const poseRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  const [mode, setMode] = useState<"idle" | "photo" | "camera" | "analyzing" | "result">("idle");
  const [imageSource, setImageSource] = useState<string | null>(null);
  const [landmarks, setLandmarks] = useState<NormalizedLandmark[] | null>(null);
  const [angles, setAngles] = useState<PosturalAngles | null>(null);
  const [report, setReport] = useState<APEXReport | null>(null);
  const [activeTab, setActiveTab] = useState<"markers" | "angles" | "protocol" | "cueing">("markers");
  const [athleteName, setAthleteName] = useState("Carlos Mendes");
  const [openPhase, setOpenPhase] = useState<number | null>(1);
  const [saving, setSaving] = useState(false);

  // Init mediapipe
  useEffect(() => {
    ensureMediapipe().then(() => {
      if (!window.Pose) return;
      const pose = new window.Pose({
        locateFile: (f: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${f}`,
      });
      pose.setOptions({
        modelComplexity: 1, smoothLandmarks: true, enableSegmentation: false,
        minDetectionConfidence: 0.6, minTrackingConfidence: 0.5,
      });
      pose.onResults(onPoseResults);
      poseRef.current = pose;
    }).catch(() => toast.error("Falha ao carregar MediaPipe"));
    // Pre-load mock so preview is rich
    const a = MOCK_ANGLES;
    setAngles(a);
    setReport(buildReport("Carlos Mendes", a));
    return () => { try { cameraRef.current?.stop(); } catch {} };
  }, []);

  const onPoseResults = useCallback((results: any) => {
    const cv = canvasRef.current; if (!cv) return;
    const ctx = cv.getContext("2d"); if (!ctx) return;
    const W = cv.width, H = cv.height;
    ctx.save();
    ctx.clearRect(0, 0, W, H);
    if (results.image) ctx.drawImage(results.image, 0, 0, W, H);

    if (results.poseLandmarks && window.drawConnectors && window.POSE_CONNECTIONS) {
      window.drawConnectors(ctx, results.poseLandmarks, window.POSE_CONNECTIONS,
        { color: "rgba(255,255,255,0.4)", lineWidth: 1.5 });
      // spine accent
      const spineIdx = [[0, 11], [0, 12], [11, 23], [12, 24], [23, 24], [11, 12]];
      ctx.strokeStyle = C.gold; ctx.lineWidth = 3;
      spineIdx.forEach(([a, b]) => {
        const p1 = results.poseLandmarks[a], p2 = results.poseLandmarks[b];
        if (!p1 || !p2) return;
        ctx.beginPath();
        ctx.moveTo(p1.x * W, p1.y * H); ctx.lineTo(p2.x * W, p2.y * H); ctx.stroke();
      });
      window.drawLandmarks(ctx, results.poseLandmarks,
        { color: C.gold, lineWidth: 1, radius: 3, fillColor: "#fff" });

      // Plumb line from ear (7) to ankle (27)
      const ear = results.poseLandmarks[7] || results.poseLandmarks[8];
      const ankle = results.poseLandmarks[27] || results.poseLandmarks[28];
      if (ear && ankle) {
        ctx.setLineDash([6, 6]); ctx.strokeStyle = "rgba(255,255,255,0.25)"; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(ear.x * W, ear.y * H); ctx.lineTo(ear.x * W, ankle.y * H); ctx.stroke();
        ctx.setLineDash([]);
      }

      // Compute angles
      const lm = results.poseLandmarks;
      const headFwd = Math.abs(Math.atan2((lm[7].x - lm[11].x), (lm[11].y - lm[7].y)) * (180 / Math.PI));
      const shoulderProt = Math.abs(lm[11].x - lm[23].x) * 100;
      const newAngles: PosturalAngles = {
        headForwardDeg: headFwd,
        shoulderProtraction: shoulderProt,
        thoracicKyphosis: 28 + Math.abs(lm[11].y - lm[23].y) * 30,
        lumbarLordosis: 40 + Math.abs(lm[23].x - lm[25].x) * 50,
        pelvicTilt: Math.abs(lm[23].y - lm[24].y) * 100,
        kneeAlignment: Math.abs(lm[25].x - lm[27].x) * 60,
      };
      setLandmarks(results.poseLandmarks);
      setAngles(newAngles);
    }

    // Top-left badge
    ctx.fillStyle = "rgba(0,0,0,.55)"; ctx.fillRect(12, 12, 168, 28);
    ctx.fillStyle = C.gold; ctx.font = "bold 12px 'Barlow Condensed', sans-serif";
    ctx.fillText("APEX · " + (mode === "analyzing" ? "ANALISANDO" : "CONCLUÍDO"), 22, 30);

    // Bottom watermark
    ctx.fillStyle = "rgba(255,255,255,.3)"; ctx.font = "10px 'Barlow Condensed', sans-serif";
    ctx.fillText(`nutriON APEX · ${new Date().toLocaleDateString("pt-BR")}`, 12, H - 10);

    ctx.restore();
  }, [mode]);

  // ─── Photo handling ───
  const handleFile = async (file: File) => {
    if (!file.type.startsWith("image/")) { toast.error("Arquivo inválido"); return; }
    const reader = new FileReader();
    reader.onload = async (e) => {
      const src = e.target?.result as string;
      setImageSource(src); setMode("analyzing");
      const img = new Image();
      img.onload = async () => {
        imgRef.current = img;
        const cv = canvasRef.current; if (!cv) return;
        const maxW = 720; const ratio = img.height / img.width;
        cv.width = Math.min(maxW, img.width); cv.height = cv.width * ratio;
        if (poseRef.current) {
          await poseRef.current.send({ image: img });
        }
        setMode("result");
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  };

  // ─── Camera ───
  const startCamera = async () => {
    setMode("camera");
    try {
      if (!videoRef.current || !poseRef.current) return;
      const cv = canvasRef.current; if (cv) { cv.width = 640; cv.height = 480; }
      cameraRef.current = new window.Camera(videoRef.current, {
        onFrame: async () => { if (videoRef.current) await poseRef.current.send({ image: videoRef.current }); },
        width: 640, height: 480,
      });
      cameraRef.current.start();
      setMode("analyzing");
    } catch {
      toast.error("Câmera indisponível");
      setMode("idle");
    }
  };
  const stopCamera = () => { try { cameraRef.current?.stop(); } catch {} setMode("result"); };

  // Recompute report when angles change (debounced via direct effect)
  useEffect(() => { if (angles) setReport(buildReport(athleteName, angles)); }, [angles, athleteName]);

  // ─── Save ───
  const saveReport = async () => {
    if (!user) { toast.error("Faça login"); return; }
    if (!report || !angles) return;
    setSaving(true);
    try {
      let imageUrl: string | null = null;
      if (imageSource) {
        const blob = await (await fetch(imageSource)).blob();
        const path = `${user.id}/${Date.now()}.jpg`;
        const { error: upErr } = await supabase.storage.from("assessments").upload(path, blob, { contentType: "image/jpeg", upsert: false });
        if (!upErr) {
          const { data } = await supabase.storage.from("assessments").createSignedUrl(path, 60 * 60 * 24 * 365);
          imageUrl = data?.signedUrl || null;
        }
      }
      const { error } = await supabase.from("apex_reports").insert({
        user_id: user.id,
        athlete_name: report.athleteName,
        assessment_date: new Date().toISOString().slice(0, 10),
        image_url: imageUrl,
        landmarks: landmarks as any,
        angles: angles as any,
        apex_score: report.apexScore,
        findings: report.findings as any,
        muscle_status: report.muscleStatus as any,
        protocol: report.protocol as any,
        cueing: report.cueing as any,
      });
      if (error) throw error;
      toast.success("Relatório salvo");
    } catch (e: any) { toast.error(e.message || "Erro ao salvar"); }
    finally { setSaving(false); }
  };

  // ───────────── UI ─────────────
  const sevColor = (s: "high" | "medium" | "low") => s === "high" ? C.high : s === "medium" ? C.med : C.low;

  return (
    <div style={{ background: C.bg, minHeight: "100vh", color: C.text, fontFamily: "'Barlow Condensed', system-ui, sans-serif" }} className="apex-pose-page">
      <style>{`
        @keyframes apexPulse { 0%,100%{ transform:scale(1); opacity:.9 } 50%{ transform:scale(1.6); opacity:.2 } }
        .apex-dot { animation: apexPulse 1.4s ease-in-out infinite; }
        @media print {
          .apex-no-print { display:none !important; }
          .apex-pose-page { background:#fff !important; color:#000 !important; }
        }
      `}</style>

      {/* Top bar */}
      <header className="apex-no-print" style={{ borderBottom: `1px solid ${C.border}`, background: C.card }}>
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3 flex-wrap">
          <button onClick={() => navigate("/coach/dashboard")} className="flex items-center gap-1 text-sm" style={{ color: C.textSec }}>
            <ArrowLeft size={16} /> Voltar
          </button>
          <div className="flex items-center gap-2 ml-2">
            <div style={{ width: 22, height: 22, background: C.gold, clipPath: "polygon(0 0,100% 0,50% 100%)" }} />
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: ".06em", color: C.gold }}>
              APEX POSE ANALYSIS
            </h1>
          </div>

          <div className="ml-auto flex items-center gap-2 flex-wrap">
            <div className="flex rounded-md overflow-hidden" style={{ border: `1px solid ${C.border}` }}>
              {[
                { k: "photo", label: "Foto", icon: <ImageIcon size={14} /> },
                { k: "camera", label: "Câmera ao vivo", icon: <Camera size={14} /> },
              ].map((t) => (
                <button key={t.k}
                  onClick={() => t.k === "camera" ? startCamera() : (document.getElementById("apex-file-input") as HTMLInputElement)?.click()}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs"
                  style={{
                    background: (mode === t.k || (t.k === "camera" && mode === "analyzing" && cameraRef.current)) ? C.gold : "transparent",
                    color: (mode === t.k || (t.k === "camera" && mode === "analyzing" && cameraRef.current)) ? "#000" : C.textSec,
                    fontWeight: 600, letterSpacing: ".04em",
                  }}>
                  {t.icon}{t.label}
                </button>
              ))}
            </div>
            <input value={athleteName} onChange={(e) => setAthleteName(e.target.value)}
              placeholder="Nome do atleta" className="px-3 py-1.5 text-sm rounded-md outline-none"
              style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text, width: 180 }} />
            <button onClick={saveReport} disabled={!report || saving}
              className="px-4 py-1.5 rounded-md text-xs flex items-center gap-1.5 disabled:opacity-40"
              style={{ background: C.gold, color: "#000", fontWeight: 700, letterSpacing: ".05em" }}>
              {saving ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
              Gerar / Salvar Relatório
            </button>
          </div>
        </div>
      </header>

      <input id="apex-file-input" type="file" accept="image/*" className="hidden"
        onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])} />

      {/* Main */}
      <main className="max-w-7xl mx-auto px-4 py-5 grid gap-4" style={{ gridTemplateColumns: "minmax(0,1fr) 320px" }}>
        {/* Canvas panel */}
        <section className="flex flex-col gap-3 min-w-0">
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files?.[0]; if (f) handleFile(f); }}
            style={{
              background: C.card, border: `1px ${mode === "idle" ? "dashed" : "solid"} ${mode === "idle" ? C.gold : C.border}`,
              borderRadius: 12, minHeight: 480, position: "relative", overflow: "hidden",
            }}
            className="flex items-center justify-center"
          >
            {mode === "idle" ? (
              <div className="text-center px-6 py-12">
                <Camera size={42} style={{ color: C.gold, margin: "0 auto 16px" }} />
                <p style={{ color: C.textSec, fontSize: 14, maxWidth: 360, margin: "0 auto" }}>
                  Arraste uma foto lateral ou frontal do atleta — ou use a câmera ao vivo.
                </p>
              </div>
            ) : mode === "analyzing" && !cameraRef.current ? (
              <div className="flex flex-col items-center justify-center gap-4 py-16 px-6 text-center w-full">
                <Loader2 size={48} style={{ color: C.gold }} className="animate-spin" />
                <div style={{ color: C.gold, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: ".08em" }}>
                  APEX analisando — aguarde…
                </div>
                <div style={{ color: C.textSec, fontSize: 12, maxWidth: 320 }}>
                  Processando landmarks, ângulos e diagnóstico clínico integrado.
                </div>
                {/* Canvas oculto: MediaPipe precisa renderizar, mas escondemos até o diagnóstico ficar pronto */}
                <video ref={videoRef} className="hidden" playsInline />
                <canvas ref={canvasRef} style={{ display: "none" }} />
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .4 }} className="w-full">
                <video ref={videoRef} className="hidden" playsInline />
                <canvas ref={canvasRef} style={{ width: "100%", display: "block", background: "#000" }} />
              </motion.div>
            )}
            {(mode === "camera" || cameraRef.current) && mode !== "idle" && (
              <button onClick={stopCamera} className="absolute bottom-3 right-3 px-3 py-1.5 rounded-md text-xs apex-no-print"
                style={{ background: C.high, color: "#fff", fontWeight: 700 }}>Parar câmera</button>
            )}
          </div>

          {/* Action bar */}
          {report && (
            <div className="apex-no-print grid grid-cols-3 gap-2">
              <button onClick={saveReport} disabled={saving} className="flex items-center justify-center gap-2 py-2 rounded-md text-xs"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}>
                <Save size={14} style={{ color: C.gold }} /> Salvar
              </button>
              <button onClick={() => { navigator.clipboard.writeText(window.location.href); toast.success("Link copiado"); }}
                className="flex items-center justify-center gap-2 py-2 rounded-md text-xs"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}>
                <Share2 size={14} style={{ color: C.gold }} /> Compartilhar
              </button>
              <button onClick={() => window.print()}
                className="flex items-center justify-center gap-2 py-2 rounded-md text-xs"
                style={{ background: C.card, border: `1px solid ${C.border}`, color: C.text }}>
                <Download size={14} style={{ color: C.gold }} /> Exportar PDF
              </button>
            </div>
          )}
        </section>

        {/* Right: results */}
        <motion.aside initial={{ x: 40, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: .4 }}
          style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12 }}>
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: `1px solid ${C.border}` }}>
            {[
              { k: "markers", label: "Marcadores", icon: <Target size={13} /> },
              { k: "angles", label: "Ângulos", icon: <Activity size={13} /> },
              { k: "protocol", label: "Protocolo", icon: <Layers size={13} /> },
              { k: "cueing", label: "Cueing", icon: <MessageSquare size={13} /> },
            ].map((t) => (
              <button key={t.k} onClick={() => setActiveTab(t.k as any)}
                className="flex-1 flex flex-col items-center gap-1 py-2 text-[10px]"
                style={{
                  color: activeTab === t.k ? C.gold : C.textSec,
                  borderBottom: activeTab === t.k ? `2px solid ${C.gold}` : "2px solid transparent",
                  fontWeight: 700, letterSpacing: ".05em", textTransform: "uppercase",
                }}>
                {t.icon}{t.label}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-[680px] overflow-y-auto">
            <AnimatePresence mode="wait">
              {activeTab === "markers" && (
                <motion.div key="m" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <h3 className="text-xs uppercase mb-2" style={{ color: C.textSec, letterSpacing: ".1em" }}>Landmarks</h3>
                  <ul className="space-y-1.5 mb-4">
                    {[
                      { n: "Orelha", v: angles ? `${angles.headForwardDeg.toFixed(1)}°` : "—", bad: (angles?.headForwardDeg || 0) > 5 },
                      { n: "Ombro", v: angles ? `${angles.shoulderProtraction.toFixed(1)}%` : "—", bad: (angles?.shoulderProtraction || 0) > 5 },
                      { n: "T6 (estimado)", v: angles ? `${angles.thoracicKyphosis.toFixed(0)}°` : "—", bad: (angles?.thoracicKyphosis || 0) > 30 },
                      { n: "Quadril", v: angles ? `${angles.pelvicTilt.toFixed(1)}°` : "—", bad: (angles?.pelvicTilt || 0) > 5 },
                      { n: "Joelho", v: angles ? `${angles.kneeAlignment.toFixed(1)}°` : "—", bad: (angles?.kneeAlignment || 0) > 5 },
                      { n: "Tornozelo", v: "ref.", bad: false },
                    ].map((l, i) => (
                      <li key={i} className="flex items-center justify-between text-xs py-1.5 px-2 rounded"
                        style={{ background: "rgba(255,255,255,.02)" }}>
                        <span className="flex items-center gap-2">
                          <span className="apex-dot inline-block rounded-full" style={{ width: 8, height: 8, background: l.bad ? C.high : C.low }} />
                          {l.n}
                        </span>
                        <span style={{ color: l.bad ? C.high : C.text, fontWeight: 600 }}>{l.v}</span>
                      </li>
                    ))}
                  </ul>

                  {report && <ApexScoreGauge score={report.apexScore} />}
                </motion.div>
              )}

              {activeTab === "angles" && angles && (
                <motion.div key="a" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { n: "Cervical", v: `${angles.headForwardDeg.toFixed(1)}°`, ref: "≤ 5°", bad: angles.headForwardDeg > 5 },
                      { n: "Ombro", v: `${angles.shoulderProtraction.toFixed(1)}%`, ref: "≤ 5%", bad: angles.shoulderProtraction > 5 },
                      { n: "Cifose T", v: `${angles.thoracicKyphosis.toFixed(0)}°`, ref: "20–30°", bad: angles.thoracicKyphosis > 30 },
                      { n: "Lordose L", v: `${angles.lumbarLordosis.toFixed(0)}°`, ref: "30–50°", bad: angles.lumbarLordosis > 50 },
                      { n: "Pelve", v: `${angles.pelvicTilt.toFixed(1)}°`, ref: "≤ 5°", bad: angles.pelvicTilt > 5 },
                      { n: "Joelho", v: `${angles.kneeAlignment.toFixed(1)}°`, ref: "≤ 5°", bad: angles.kneeAlignment > 5 },
                    ].map((c, i) => (
                      <div key={i} className="p-2 rounded" style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}` }}>
                        <div className="text-[10px] uppercase" style={{ color: C.textSec, letterSpacing: ".08em" }}>{c.n}</div>
                        <div style={{ color: c.bad ? C.high : C.low, fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, lineHeight: 1 }}>{c.v}</div>
                        <div className="text-[10px]" style={{ color: C.textSec }}>ref. {c.ref}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-3 p-3 rounded text-xs leading-relaxed" style={{ background: C.goldSoft, border: `1px solid ${C.gold}40`, color: C.text }}>
                    <div className="text-[10px] uppercase mb-1" style={{ color: C.gold, letterSpacing: ".1em" }}>Interpretação clínica</div>
                    {report?.findings.slice(0, 2).map((f) => f.description).join(" ") || "Padrão dentro da normalidade."}
                  </div>
                </motion.div>
              )}

              {activeTab === "protocol" && report && (
                <motion.div key="p" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {report.protocol.map((ph) => (
                    <div key={ph.phase} style={{ border: `1px solid ${C.border}`, borderRadius: 8 }}>
                      <button onClick={() => setOpenPhase(openPhase === ph.phase ? null : ph.phase)}
                        className="w-full flex items-center justify-between p-2.5 text-left">
                        <span className="flex items-center gap-2">
                          <span style={{ background: C.gold, color: "#000", fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontSize: 11 }}>FASE {ph.phase}</span>
                          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: ".06em" }}>{ph.name}</span>
                        </span>
                        <ChevronDown size={14} style={{ transform: openPhase === ph.phase ? "rotate(180deg)" : "none", transition: ".2s" }} />
                      </button>
                      {openPhase === ph.phase && (
                        <div className="grid grid-cols-1 gap-1.5 p-2 pt-0">
                          {ph.exercises.map((ex, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * .05 }}
                              className="p-2 rounded text-xs" style={{ background: "rgba(255,255,255,.03)" }}>
                              <div style={{ color: C.text, fontWeight: 600 }}>{ex.name}</div>
                              <div style={{ color: C.textSec }} className="text-[10px]">{ex.target}</div>
                              <span className="inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded" style={{ background: C.goldSoft, color: C.gold }}>{ex.dose}</span>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </motion.div>
              )}

              {activeTab === "cueing" && report && (
                <motion.div key="c" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-2">
                  {report.cueing.map((c, i) => (
                    <div key={i} className="p-3 rounded" style={{ background: "rgba(255,255,255,.03)", border: `1px solid ${C.border}` }}>
                      <div style={{ fontFamily: "'Bebas Neue', sans-serif", color: C.gold, fontSize: 16, letterSpacing: ".06em" }}>{c.movement}</div>
                      <ul className="mt-1 space-y-1">
                        {c.cues.map((q, j) => (
                          <li key={j} className="flex gap-2 text-xs" style={{ color: C.text }}>
                            <span style={{ color: C.gold }}>›</span>{q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Findings list always */}
            {report && report.findings.length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs uppercase mb-2" style={{ color: C.textSec, letterSpacing: ".1em" }}>Findings</h3>
                <ul className="space-y-1.5">
                  {report.findings.map((f, i) => (
                    <li key={i} className="p-2 rounded text-xs flex items-start gap-2"
                      style={{ background: "rgba(255,255,255,.02)", borderLeft: `3px solid ${sevColor(f.severity)}` }}>
                      <div className="flex-1">
                        <div style={{ color: C.text, fontWeight: 600 }}>{f.area}</div>
                        <div className="text-[10px]" style={{ color: C.textSec }}>{f.value} · ref {f.referenceRange}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </motion.aside>
      </main>
    </div>
  );
}

// ───────────── APEX Score Gauge ─────────────
function ApexScoreGauge({ score }: { score: number }) {
  const r = 45, circ = 2 * Math.PI * r;
  const offset = circ - (score / 100) * circ;
  const color = score >= 80 ? C.low : score >= 60 ? C.med : C.high;
  return (
    <div className="flex flex-col items-center mt-3 pt-3" style={{ borderTop: `1px solid ${C.border}` }}>
      <div className="text-[10px] uppercase mb-1" style={{ color: C.textSec, letterSpacing: ".12em" }}>APEX Score</div>
      <svg width={120} height={120} viewBox="0 0 120 120">
        <circle cx={60} cy={60} r={r} stroke={C.border} strokeWidth={8} fill="none" />
        <motion.circle cx={60} cy={60} r={r} stroke={color} strokeWidth={8} fill="none" strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: [.4, 0, .2, 1], delay: .3 }}
          transform="rotate(-90 60 60)" />
        <text x={60} y={66} textAnchor="middle" fill={C.text}
          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 32 }}>{score}</text>
      </svg>
    </div>
  );
}
