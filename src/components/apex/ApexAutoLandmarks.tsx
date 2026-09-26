// @ts-nocheck
// ============================================================
// APEX AUTO-LANDMARKS — Detecção Automática de Pontos Anatômicos
// Componente React para nutriON / Lovable.dev
// ============================================================
// COMO USAR:
// 1. No Lovable, instale a dependência: @mediapipe/pose
//    (ou use o CDN — o código suporta ambos)
// 2. Cole este componente no seu projeto
// 3. Importe e use: <ApexAutoLandmarks onLandmarksDetected={...} />
// ============================================================

import React, { useRef, useState, useCallback, useEffect } from "react";

// ============================================================
// TIPOS
// ============================================================

interface Point2D {
  x: number; // 0-1 (percentual da largura da imagem)
  y: number; // 0-1 (percentual da altura da imagem)
}

interface ApexLandmark {
  id: string;
  label: string;
  position: Point2D;
  confidence: number; // 0-1
  category: "coluna" | "ombros" | "quadril" | "joelhos" | "tornozelos" | "referencia";
  severity?: "normal" | "moderado" | "leve" | "severo" | "critico";
}

interface ApexAnalysis {
  landmarks: ApexLandmark[];
  findings: ApexFinding[];
  scores: {
    frente: number;
    lateral: number;
    costas: number;
  };
}

interface ApexFinding {
  id: string;
  type: "critico" | "limitrofe" | "normal";
  title: string;
  description: string;
  relatedLandmarks: string[];
  deviation: number; // graus ou cm
}

interface ApexAutoLandmarksProps {
  imageUrl?: string;
  viewAngle?: "frente" | "lateral" | "costas";
  onLandmarksDetected?: (analysis: ApexAnalysis) => void;
  onPointMoved?: (landmarkId: string, newPosition: Point2D) => void;
  existingLandmarks?: ApexLandmark[];
  clientName?: string;
}

// ============================================================
// MAPEAMENTO MEDIAPIPE → APEX
// ============================================================

// MediaPipe Pose retorna 33 landmarks indexados 0-32
// Referência: https://developers.google.com/mediapipe/solutions/vision/pose_landmarker

const MEDIAPIPE_TO_APEX: Record<string, {
  mediapipeIndices: number[];
  label: string;
  category: ApexLandmark["category"];
  calculate?: (landmarks: any[]) => Point2D;
}> = {
  // === REFERÊNCIA ===
  topo_cabeca: {
    mediapipeIndices: [0],
    label: "Topo da Cabeça",
    category: "referencia",
  },

  // === OMBROS ===
  ombro_e: {
    mediapipeIndices: [11],
    label: "Ombro E",
    category: "ombros",
  },
  ombro_d: {
    mediapipeIndices: [12],
    label: "Ombro D",
    category: "ombros",
  },

  // === COLUNA (calculados) ===
  c7: {
    mediapipeIndices: [11, 12], // média dos ombros + offset
    label: "C7",
    category: "coluna",
    calculate: (landmarks) => {
      const ombroE = landmarks[11];
      const ombroD = landmarks[12];
      return {
        x: (ombroE.x + ombroD.x) / 2,
        y: ((ombroE.y + ombroD.y) / 2) - 0.045, // ~4.5% acima da linha dos ombros
      };
    },
  },
  l5: {
    mediapipeIndices: [23, 24], // média dos quadris + offset
    label: "L5",
    category: "coluna",
    calculate: (landmarks) => {
      const quadrilE = landmarks[23];
      const quadrilD = landmarks[24];
      return {
        x: (quadrilE.x + quadrilD.x) / 2,
        y: ((quadrilE.y + quadrilD.y) / 2) - 0.035, // ~3.5% acima da linha do quadril
      };
    },
  },
  meio_coluna: {
    mediapipeIndices: [11, 12, 23, 24], // ponto médio entre C7 e L5
    label: "T6-T7",
    category: "coluna",
    calculate: (landmarks) => {
      const ombroMidY = (landmarks[11].y + landmarks[12].y) / 2 - 0.045;
      const quadrilMidY = (landmarks[23].y + landmarks[24].y) / 2 - 0.035;
      const ombroMidX = (landmarks[11].x + landmarks[12].x) / 2;
      const quadrilMidX = (landmarks[23].x + landmarks[24].x) / 2;
      return {
        x: (ombroMidX + quadrilMidX) / 2,
        y: (ombroMidY + quadrilMidY) / 2,
      };
    },
  },

  // === QUADRIL ===
  quadril_e: {
    mediapipeIndices: [23],
    label: "Quadril E",
    category: "quadril",
  },
  quadril_d: {
    mediapipeIndices: [24],
    label: "Quadril D",
    category: "quadril",
  },

  // === JOELHOS ===
  joelho_e: {
    mediapipeIndices: [25],
    label: "Joelho E",
    category: "joelhos",
  },
  joelho_d: {
    mediapipeIndices: [26],
    label: "Joelho D",
    category: "joelhos",
  },

  // === TORNOZELOS ===
  tornozelo_e: {
    mediapipeIndices: [27],
    label: "Tornozelo E",
    category: "tornozelos",
  },
  tornozelo_d: {
    mediapipeIndices: [28],
    label: "Tornozelo D",
    category: "tornozelos",
  },

  // === PONTOS EXTRAS (cotovelos — úteis para avaliação de protração) ===
  cotovelo_e: {
    mediapipeIndices: [13],
    label: "Cotovelo E",
    category: "referencia",
  },
  cotovelo_d: {
    mediapipeIndices: [14],
    label: "Cotovelo D",
    category: "referencia",
  },

  // === PUNHOS (referência para alinhamento de braço) ===
  punho_e: {
    mediapipeIndices: [15],
    label: "Punho E",
    category: "referencia",
  },
  punho_d: {
    mediapipeIndices: [16],
    label: "Punho D",
    category: "referencia",
  },

  // === ORELHAS (referência para inclinação cervical) ===
  orelha_e: {
    mediapipeIndices: [7],
    label: "Orelha E",
    category: "referencia",
  },
  orelha_d: {
    mediapipeIndices: [8],
    label: "Orelha D",
    category: "referencia",
  },
};

// ============================================================
// ANÁLISE POSTURAL AUTOMÁTICA
// ============================================================

function calculateAngleDegrees(p1: Point2D, p2: Point2D): number {
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  return Math.atan2(dy, dx) * (180 / Math.PI);
}

function calculateDistance(p1: Point2D, p2: Point2D): number {
  return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
}

function analyzePosture(landmarks: ApexLandmark[]): ApexFinding[] {
  const findings: ApexFinding[] = [];
  const byId = new Map(landmarks.map((l) => [l.id, l]));

  // --- 1. INCLINAÇÃO DOS OMBROS ---
  const ombroE = byId.get("ombro_e");
  const ombroD = byId.get("ombro_d");
  if (ombroE && ombroD) {
    const angleDeg = calculateAngleDegrees(ombroE.position, ombroD.position);
    const deviation = Math.abs(angleDeg);

    if (deviation > 2) {
      const lado = ombroE.position.y > ombroD.position.y ? "esquerdo" : "direito";
      findings.push({
        id: "ombro_inclinacao",
        type: deviation > 5 ? "critico" : deviation > 3 ? "limitrofe" : "normal",
        title: `Inclinação e protração`,
        description: `Ombro ${lado} mais elevado. Desvio de ${deviation.toFixed(1)}°. Avaliar trapézio superior e serrátil anterior.`,
        relatedLandmarks: ["ombro_e", "ombro_d"],
        deviation,
      });

      // Atualizar severity nos landmarks
      ombroE.severity = deviation > 5 ? "severo" : deviation > 3 ? "moderado" : "leve";
      ombroD.severity = deviation > 5 ? "severo" : deviation > 3 ? "moderado" : "leve";
    }
  }

  // --- 2. NIVELAMENTO DO QUADRIL ---
  const quadrilE = byId.get("quadril_e");
  const quadrilD = byId.get("quadril_d");
  if (quadrilE && quadrilD) {
    const angleDeg = calculateAngleDegrees(quadrilE.position, quadrilD.position);
    const deviation = Math.abs(angleDeg);

    if (deviation > 2) {
      const lado = quadrilE.position.y > quadrilD.position.y ? "esquerdo" : "direito";
      findings.push({
        id: "quadril_nivelamento",
        type: deviation > 4 ? "critico" : deviation > 2.5 ? "limitrofe" : "normal",
        title: `Nivelamento pélvico`,
        description: `Quadril ${lado} mais elevado. Desvio de ${deviation.toFixed(1)}°. Avaliar glúteo médio e oblíquos.`,
        relatedLandmarks: ["quadril_e", "quadril_d"],
        deviation,
      });

      quadrilE.severity = deviation > 4 ? "severo" : deviation > 2.5 ? "moderado" : "leve";
      quadrilD.severity = deviation > 4 ? "severo" : deviation > 2.5 ? "moderado" : "leve";
    }
  }

  // --- 3. ALINHAMENTO DA COLUNA (C7 → L5) ---
  const c7 = byId.get("c7");
  const l5 = byId.get("l5");
  if (c7 && l5) {
    const lateralDeviation = Math.abs(c7.position.x - l5.position.x);

    if (lateralDeviation > 0.015) {
      const lado = c7.position.x > l5.position.x ? "direita" : "esquerda";
      findings.push({
        id: "coluna_lateral",
        type: lateralDeviation > 0.04 ? "critico" : lateralDeviation > 0.025 ? "limitrofe" : "normal",
        title: `Desvio lateral da coluna`,
        description: `C7 desviado para ${lado} em relação a L5. Possível escoliose funcional. Encaminhar para avaliação especializada se persistente.`,
        relatedLandmarks: ["c7", "l5"],
        deviation: lateralDeviation * 100,
      });
    }
  }

  // --- 4. VALGO/VARO DE JOELHOS ---
  const joelhoE = byId.get("joelho_e");
  const joelhoD = byId.get("joelho_d");
  if (joelhoE && joelhoD && quadrilE && quadrilD) {
    // Calcular alinhamento quadril-joelho-tornozelo
    const tornozeloE = byId.get("tornozelo_e");
    const tornozeloD = byId.get("tornozelo_d");

    if (tornozeloE && tornozeloD) {
      // Verificar se joelhos estão mais internos que a linha quadril-tornozelo
      const midQuadril = (quadrilE.position.x + quadrilD.position.x) / 2;
      const midJoelho = (joelhoE.position.x + joelhoD.position.x) / 2;
      const midTornozelo = (tornozeloE.position.x + tornozeloD.position.x) / 2;

      const joelhoDeviation = Math.abs(midJoelho - ((midQuadril + midTornozelo) / 2));

      if (joelhoDeviation > 0.02) {
        findings.push({
          id: "joelho_alinhamento",
          type: joelhoDeviation > 0.05 ? "critico" : "limitrofe",
          title: `Alinhamento de joelhos`,
          description: `Possível valgo/varo. Avaliar padrão de agachamento e ativação de glúteo médio.`,
          relatedLandmarks: ["joelho_e", "joelho_d"],
          deviation: joelhoDeviation * 100,
        });
      }
    }
  }

  // --- 5. PROTRAÇÃO CERVICAL (orelha vs ombro na lateral) ---
  const orelhaE = byId.get("orelha_e");
  if (orelhaE && ombroE && c7) {
    const forwardHead = orelhaE.position.x - ombroE.position.x;

    if (Math.abs(forwardHead) > 0.03) {
      findings.push({
        id: "protracao_cervical",
        type: Math.abs(forwardHead) > 0.06 ? "critico" : "limitrofe",
        title: `Protração cervical`,
        description: `Cabeça anteriorizada. Fortalecer flexores profundos cervicais e alongar esternocleidomastoideo.`,
        relatedLandmarks: ["orelha_e", "c7"],
        deviation: Math.abs(forwardHead) * 100,
      });
    }
  }

  return findings;
}

function calculateScores(findings: ApexFinding[]): { frente: number; lateral: number; costas: number } {
  let totalDeductions = 0;

  findings.forEach((f) => {
    if (f.type === "critico") totalDeductions += 3;
    else if (f.type === "limitrofe") totalDeductions += 1.5;
  });

  // Score base 10, deduzir por achado
  const baseScore = Math.max(0, 10 - totalDeductions);

  return {
    frente: Math.round(baseScore),
    lateral: Math.round(baseScore), // ajustado quando lateral é processada
    costas: 0, // será preenchido quando costas for processada
  };
}

// ============================================================
// CARREGAMENTO DO MEDIAPIPE POSE (via CDN)
// ============================================================

let poseInstance: any = null;
let isLoading = false;
let loadPromise: Promise<any> | null = null;

async function loadMediaPipePose(): Promise<any> {
  if (poseInstance) return poseInstance;
  if (loadPromise) return loadPromise;

  isLoading = true;

  loadPromise = new Promise(async (resolve, reject) => {
    try {
      // Carregar scripts do CDN
      const scripts = [
        "https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/drawing_utils/drawing_utils.js",
        "https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js",
      ];

      for (const src of scripts) {
        if (!document.querySelector(`script[src="${src}"]`)) {
          await new Promise<void>((res, rej) => {
            const script = document.createElement("script");
            script.src = src;
            script.crossOrigin = "anonymous";
            script.onload = () => res();
            script.onerror = () => rej(new Error(`Falha ao carregar: ${src}`));
            document.head.appendChild(script);
          });
        }
      }

      // Aguardar Pose estar disponível no window
      const win = window as any;
      if (!win.Pose) {
        throw new Error("MediaPipe Pose não carregou corretamente");
      }

      poseInstance = new win.Pose({
        locateFile: (file: string) =>
          `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      poseInstance.setOptions({
        modelComplexity: 2, // máxima precisão (0, 1, ou 2)
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.7,
        minTrackingConfidence: 0.7,
        staticImageMode: true, // importante: estamos processando fotos, não vídeo
      });

      isLoading = false;
      resolve(poseInstance);
    } catch (error) {
      isLoading = false;
      loadPromise = null;
      reject(error);
    }
  });

  return loadPromise;
}

// ============================================================
// PROCESSAMENTO DA IMAGEM
// ============================================================

async function detectLandmarks(imageElement: HTMLImageElement): Promise<ApexLandmark[]> {
  const pose = await loadMediaPipePose();

  return new Promise((resolve, reject) => {
    pose.onResults((results: any) => {
      if (!results.poseLandmarks || results.poseLandmarks.length === 0) {
        reject(new Error("Nenhuma pessoa detectada na imagem. Verifique se o corpo está visível."));
        return;
      }

      const raw = results.poseLandmarks; // array de 33 landmarks
      const apexLandmarks: ApexLandmark[] = [];

      for (const [id, mapping] of Object.entries(MEDIAPIPE_TO_APEX)) {
        let position: Point2D;
        let confidence: number;

        if (mapping.calculate) {
          // Ponto calculado (C7, L5, T6-T7)
          position = mapping.calculate(raw);
          // Confidence é a média dos landmarks usados
          confidence =
            mapping.mediapipeIndices.reduce(
              (sum, idx) => sum + (raw[idx]?.visibility || 0),
              0
            ) / mapping.mediapipeIndices.length;
        } else {
          // Ponto direto do MediaPipe
          const idx = mapping.mediapipeIndices[0];
          const lm = raw[idx];
          position = { x: lm.x, y: lm.y };
          confidence = lm.visibility || 0;
        }

        // Clampar valores entre 0 e 1
        position.x = Math.max(0, Math.min(1, position.x));
        position.y = Math.max(0, Math.min(1, position.y));

        apexLandmarks.push({
          id,
          label: mapping.label,
          position,
          confidence,
          category: mapping.category,
          severity: "normal",
        });
      }

      resolve(apexLandmarks);
    });

    // Enviar imagem pro MediaPipe processar
    pose.send({ image: imageElement });
  });
}

// ============================================================
// COMPONENTE REACT PRINCIPAL
// ============================================================

const ApexAutoLandmarks: React.FC<ApexAutoLandmarksProps> = ({
  imageUrl,
  viewAngle = "frente",
  onLandmarksDetected,
  onPointMoved,
  existingLandmarks,
  clientName = "Cliente",
}) => {
  const [landmarks, setLandmarks] = useState<ApexLandmark[]>(existingLandmarks || []);
  const [findings, setFindings] = useState<ApexFinding[]>([]);
  const [scores, setScores] = useState({ frente: 0, lateral: 0, costas: 0 });
  const [status, setStatus] = useState<"idle" | "loading" | "processing" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [dragging, setDragging] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(imageUrl || "");
  const imageRef = useRef<HTMLImageElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Cores por categoria
  const categoryColors: Record<string, string> = {
    coluna: "#ffb300",     // gold
    ombros: "#00e5ff",     // cyan
    quadril: "#ff2d78",    // magenta
    joelhos: "#00e676",    // green
    tornozelos: "#b388ff", // purple
    referencia: "#78909c", // grey
  };

  const severityColors: Record<string, string> = {
    normal: "#00e676",
    leve: "#ffb300",
    moderado: "#ff9100",
    severo: "#ff2d78",
    critico: "#ff1744",
  };

  // === UPLOAD DE IMAGEM ===
  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      setSelectedImage(ev.target?.result as string);
      setLandmarks([]);
      setFindings([]);
      setStatus("idle");
    };
    reader.readAsDataURL(file);
  }, []);

  // === DETECÇÃO AUTOMÁTICA ===
  const runDetection = useCallback(async () => {
    if (!imageRef.current) return;

    try {
      setStatus("loading");
      setErrorMsg("");

      // Carregar o modelo (primeira vez demora ~3-5s, depois é instantâneo)
      await loadMediaPipePose();

      setStatus("processing");

      // Detectar landmarks
      const detected = await detectLandmarks(imageRef.current);
      setLandmarks(detected);

      // Analisar postura
      const postureFindings = analyzePosture(detected);
      setFindings(postureFindings);

      // Calcular scores
      const postureScores = calculateScores(postureFindings);
      setScores(postureScores);

      setStatus("done");

      // Callback pro componente pai
      if (onLandmarksDetected) {
        onLandmarksDetected({
          landmarks: detected,
          findings: postureFindings,
          scores: postureScores,
        });
      }
    } catch (error: any) {
      setStatus("error");
      setErrorMsg(error.message || "Erro na detecção");
    }
  }, [onLandmarksDetected]);

  // === DRAG DOS PONTOS (ajuste manual) ===
  const handlePointerDown = useCallback((e: React.PointerEvent, landmarkId: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragging(landmarkId);
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!dragging || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

      setLandmarks((prev) =>
        prev.map((l) =>
          l.id === dragging ? { ...l, position: { x, y } } : l
        )
      );
    },
    [dragging]
  );

  const handlePointerUp = useCallback(() => {
    if (dragging) {
      const movedLandmark = landmarks.find((l) => l.id === dragging);
      if (movedLandmark && onPointMoved) {
        onPointMoved(dragging, movedLandmark.position);
      }

      // Recalcular análise após ajuste manual
      const postureFindings = analyzePosture([...landmarks]);
      setFindings(postureFindings);
      setScores(calculateScores(postureFindings));

      setDragging(null);
    }
  }, [dragging, landmarks, onPointMoved]);

  // === AUTO-DETECTAR QUANDO IMAGEM CARREGA ===
  useEffect(() => {
    if (selectedImage && imageRef.current && status === "idle") {
      // Esperar imagem carregar completamente
      if (imageRef.current.complete) {
        runDetection();
      }
    }
  }, [selectedImage]);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div style={{ fontFamily: "'Inter', 'Rajdhani', sans-serif" }}>
      {/* === UPLOAD === */}
      {!selectedImage && (
        <div
          onClick={() => fileInputRef.current?.click()}
          style={{
            border: "2px dashed #444",
            borderRadius: 12,
            padding: 48,
            textAlign: "center",
            cursor: "pointer",
            background: "#1a1a2e",
            color: "#aaa",
            transition: "border-color 0.2s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#00e5ff")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#444")}
        >
          <div style={{ fontSize: 48, marginBottom: 12 }}>📸</div>
          <div style={{ fontSize: 16, fontWeight: 600, color: "#fff" }}>
            Envie a foto do aluno
          </div>
          <div style={{ fontSize: 13, marginTop: 8, color: "#888" }}>
            Foto de corpo inteiro — frente, lateral ou costas
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            style={{ display: "none" }}
          />
        </div>
      )}

      {/* === ÁREA DA IMAGEM COM PONTOS === */}
      {selectedImage && (
        <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {/* Imagem + Overlay */}
          <div
            ref={containerRef}
            style={{
              position: "relative",
              flex: "1 1 500px",
              maxWidth: 700,
              borderRadius: 12,
              overflow: "hidden",
              background: "#111",
              touchAction: "none",
            }}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <img
              ref={imageRef}
              src={selectedImage}
              alt={`Avaliação ${clientName}`}
              onLoad={() => {
                if (status === "idle") runDetection();
              }}
              style={{
                width: "100%",
                display: "block",
                userSelect: "none",
                pointerEvents: "none",
              }}
              crossOrigin="anonymous"
            />

            {/* Linha de referência vertical (prumo) */}
            {landmarks.length > 0 && (
              <svg
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                }}
              >
                {/* Linha de prumo C7 → L5 */}
                {(() => {
                  const c7 = landmarks.find((l) => l.id === "c7");
                  const l5 = landmarks.find((l) => l.id === "l5");
                  if (!c7 || !l5) return null;
                  return (
                    <line
                      x1={`${c7.position.x * 100}%`}
                      y1={`${c7.position.y * 100}%`}
                      x2={`${l5.position.x * 100}%`}
                      y2={`${l5.position.y * 100}%`}
                      stroke="#ffb300"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.6}
                    />
                  );
                })()}

                {/* Linha horizontal ombros */}
                {(() => {
                  const oE = landmarks.find((l) => l.id === "ombro_e");
                  const oD = landmarks.find((l) => l.id === "ombro_d");
                  if (!oE || !oD) return null;
                  return (
                    <line
                      x1={`${oE.position.x * 100}%`}
                      y1={`${oE.position.y * 100}%`}
                      x2={`${oD.position.x * 100}%`}
                      y2={`${oD.position.y * 100}%`}
                      stroke="#00e5ff"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.5}
                    />
                  );
                })()}

                {/* Linha horizontal quadril */}
                {(() => {
                  const qE = landmarks.find((l) => l.id === "quadril_e");
                  const qD = landmarks.find((l) => l.id === "quadril_d");
                  if (!qE || !qD) return null;
                  return (
                    <line
                      x1={`${qE.position.x * 100}%`}
                      y1={`${qE.position.y * 100}%`}
                      x2={`${qD.position.x * 100}%`}
                      y2={`${qD.position.y * 100}%`}
                      stroke="#ff2d78"
                      strokeWidth={1.5}
                      strokeDasharray="6 4"
                      opacity={0.5}
                    />
                  );
                })()}
              </svg>
            )}

            {/* Pontos Anatômicos */}
            {landmarks
              .filter((l) => l.category !== "referencia" || l.id === "topo_cabeca")
              .map((landmark) => (
                <div
                  key={landmark.id}
                  onPointerDown={(e) => handlePointerDown(e, landmark.id)}
                  style={{
                    position: "absolute",
                    left: `${landmark.position.x * 100}%`,
                    top: `${landmark.position.y * 100}%`,
                    transform: "translate(-50%, -50%)",
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: severityColors[landmark.severity || "normal"],
                    border: `2px solid ${categoryColors[landmark.category]}`,
                    cursor: "grab",
                    zIndex: dragging === landmark.id ? 100 : 10,
                    boxShadow: `0 0 8px ${categoryColors[landmark.category]}80`,
                    transition: dragging === landmark.id ? "none" : "all 0.15s ease",
                  }}
                  title={`${landmark.label} (${(landmark.confidence * 100).toFixed(0)}% confiança)`}
                >
                  {/* Label */}
                  <div
                    style={{
                      position: "absolute",
                      left: 20,
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "#000c",
                      color: categoryColors[landmark.category],
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "2px 6px",
                      borderRadius: 4,
                      whiteSpace: "nowrap",
                      letterSpacing: "0.5px",
                      fontFamily: "'Rajdhani', sans-serif",
                      textTransform: "uppercase",
                    }}
                  >
                    {landmark.label}
                    {landmark.severity && landmark.severity !== "normal" && (
                      <span style={{ color: severityColors[landmark.severity], marginLeft: 4 }}>
                        ▲
                      </span>
                    )}
                  </div>
                </div>
              ))}

            {/* Status overlay */}
            {(status === "loading" || status === "processing") && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "#000b",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: 14,
                  gap: 12,
                }}
              >
                <div
                  style={{
                    width: 40,
                    height: 40,
                    border: "3px solid #333",
                    borderTopColor: "#00e5ff",
                    borderRadius: "50%",
                    animation: "spin 0.8s linear infinite",
                  }}
                />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
                <span>
                  {status === "loading" ? "Carregando modelo de detecção..." : "Processando landmarks..."}
                </span>
              </div>
            )}

            {/* Trocar foto */}
            <button
              onClick={() => {
                setSelectedImage("");
                setLandmarks([]);
                setFindings([]);
                setStatus("idle");
              }}
              style={{
                position: "absolute",
                top: 8,
                right: 8,
                background: "#000a",
                color: "#fff",
                border: "1px solid #444",
                borderRadius: 6,
                padding: "4px 10px",
                fontSize: 11,
                cursor: "pointer",
              }}
            >
              Trocar foto
            </button>

            {/* Re-detectar */}
            {status === "done" && (
              <button
                onClick={runDetection}
                style={{
                  position: "absolute",
                  top: 8,
                  left: 8,
                  background: "#000a",
                  color: "#00e5ff",
                  border: "1px solid #00e5ff44",
                  borderRadius: 6,
                  padding: "4px 10px",
                  fontSize: 11,
                  cursor: "pointer",
                }}
              >
                ↻ Re-detectar
              </button>
            )}

            {/* Info no rodapé */}
            <div
              style={{
                position: "absolute",
                bottom: 0,
                left: 0,
                right: 0,
                background: "linear-gradient(transparent, #000d)",
                padding: "24px 12px 8px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                fontSize: 11,
                color: "#aaa",
              }}
            >
              <span>
                {clientName} — {viewAngle.toUpperCase()}
              </span>
              <span>
                ✦ Todos os pontos são arrastáveis
              </span>
            </div>
          </div>

          {/* === PAINEL LATERAL: ACHADOS === */}
          {status === "done" && (
            <div style={{ flex: "1 1 280px", maxWidth: 380 }}>
              {/* Scores */}
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "#888",
                    marginBottom: 12,
                    fontWeight: 700,
                  }}
                >
                  nutriON · APEX
                </div>
                <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
                  {[
                    { label: "FRENTE", value: scores.frente, color: "#00e5ff" },
                    { label: "LATERAL", value: scores.lateral, color: "#ffb300" },
                    { label: "COSTAS", value: scores.costas, color: "#b388ff" },
                  ].map((s) => (
                    <div key={s.label} style={{ textAlign: "center" }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: "50%",
                          border: `3px solid ${s.value > 0 ? s.color : "#333"}`,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: 22,
                          fontWeight: 800,
                          color: s.value > 0 ? "#fff" : "#555",
                          fontFamily: "'Rajdhani', sans-serif",
                        }}
                      >
                        {s.value}
                      </div>
                      <div
                        style={{
                          fontSize: 9,
                          letterSpacing: 1.5,
                          color: "#888",
                          marginTop: 4,
                          textTransform: "uppercase",
                        }}
                      >
                        {s.label}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Resumo */}
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "#888",
                    marginBottom: 8,
                    fontWeight: 700,
                  }}
                >
                  Resumo da Avaliação
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", lineHeight: 1.4 }}>
                  {clientName}, foram encontrados{" "}
                  <span style={{ color: findings.filter((f) => f.type === "critico").length > 0 ? "#ff2d78" : "#00e676" }}>
                    {findings.length} ponto(s)
                  </span>{" "}
                  que precisam de atenção.
                </div>
                <div style={{ display: "flex", gap: 16, marginTop: 12 }}>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ff2d78" }}>
                      {findings.filter((f) => f.type === "critico").length}
                    </div>
                    <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>
                      Atenção
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#ffb300" }}>
                      {findings.filter((f) => f.type === "limitrofe").length}
                    </div>
                    <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>
                      Limítrofe
                    </div>
                  </div>
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: 24, fontWeight: 800, color: "#00e676" }}>
                      {landmarks.filter((l) => l.severity === "normal").length}
                    </div>
                    <div style={{ fontSize: 9, color: "#888", textTransform: "uppercase" }}>
                      Normal
                    </div>
                  </div>
                </div>
              </div>

              {/* Achados Clínicos */}
              <div
                style={{
                  background: "#1a1a2e",
                  borderRadius: 12,
                  padding: 16,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "#888",
                    marginBottom: 12,
                    fontWeight: 700,
                  }}
                >
                  Achados Clínicos ({findings.length})
                </div>

                {findings.length === 0 && (
                  <div style={{ color: "#00e676", fontSize: 13, padding: "8px 0" }}>
                    ✓ Nenhum desvio significativo detectado
                  </div>
                )}

                {findings.map((finding) => (
                  <div
                    key={finding.id}
                    style={{
                      background: finding.type === "critico" ? "#ff2d7815" : "#ffb30010",
                      border: `1px solid ${finding.type === "critico" ? "#ff2d7840" : "#ffb30030"}`,
                      borderRadius: 8,
                      padding: 12,
                      marginBottom: 8,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                      <span
                        style={{
                          background: finding.type === "critico" ? "#ff2d78" : "#ffb300",
                          color: "#000",
                          fontSize: 9,
                          fontWeight: 800,
                          padding: "2px 6px",
                          borderRadius: 4,
                          textTransform: "uppercase",
                          letterSpacing: 1,
                        }}
                      >
                        {finding.type === "critico"
                          ? `SEVERO · ${finding.deviation.toFixed(1)}°`
                          : `LIMÍTROFE · ${finding.deviation.toFixed(1)}°`}
                      </span>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 4 }}>
                      {finding.title}
                    </div>
                    <div style={{ fontSize: 12, color: "#aaa", lineHeight: 1.5 }}>
                      {finding.description}
                    </div>
                  </div>
                ))}
              </div>

              {/* Botão gerar protocolo */}
              {findings.length > 0 && (
                <button
                  style={{
                    width: "100%",
                    marginTop: 12,
                    padding: "12px 16px",
                    background: "linear-gradient(135deg, #00e5ff, #0091ea)",
                    color: "#000",
                    border: "none",
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 800,
                    cursor: "pointer",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    fontFamily: "'Rajdhani', sans-serif",
                  }}
                >
                  Gerar Protocolo de Correção →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* === ERRO === */}
      {status === "error" && (
        <div
          style={{
            background: "#ff2d7815",
            border: "1px solid #ff2d7840",
            borderRadius: 8,
            padding: 16,
            marginTop: 12,
            color: "#ff2d78",
            fontSize: 13,
          }}
        >
          <strong>Erro:</strong> {errorMsg}
          <div style={{ marginTop: 8 }}>
            <button
              onClick={runDetection}
              style={{
                background: "#ff2d78",
                color: "#fff",
                border: "none",
                borderRadius: 6,
                padding: "6px 16px",
                cursor: "pointer",
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              Tentar novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ApexAutoLandmarks;
