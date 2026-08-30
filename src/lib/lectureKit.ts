// Kit de Palestra — tipos, normalização e exportações (PPTX / PDF / texto).
// O roteiro chega do motor de geração em JSON; aqui ele vira estrutura estável
// (tipo de slide, tempo, referência) e ganha os formatos que o palestrante usa
// de verdade: PowerPoint pra projetar e PDF pra levar impresso.

export type SlideType =
  | "ABERTURA" | "GANCHO" | "PROBLEMA" | "CONTEUDO" | "DADO"
  | "HISTORIA" | "INTERACAO" | "PROVA" | "CTA" | "FECHAMENTO" | "QRCODE";

export interface LectureSlide {
  id: string;
  tipo: SlideType;
  bloco: string;
  titulo: string;
  bullets: string[];
  fala: string;
  tempoMin: number;
  referencia: string;
}

export interface LectureKit {
  titulo: string;
  subtitulo: string;
  ganchoAbertura: string;
  agenda: string[];
  slides: LectureSlide[];
  citacoes: string[];
  encerramento: string;
}

export const SLIDE_TYPES: SlideType[] = [
  "ABERTURA", "GANCHO", "PROBLEMA", "CONTEUDO", "DADO",
  "HISTORIA", "INTERACAO", "PROVA", "CTA", "QRCODE", "FECHAMENTO",
];

export const TYPE_COLOR: Record<SlideType, string> = {
  ABERTURA: "#B8922A",
  GANCHO: "#EF4444",
  PROBLEMA: "#F97316",
  CONTEUDO: "#00D4FF",
  DADO: "#22C55E",
  HISTORIA: "#A855F7",
  INTERACAO: "#FACC15",
  PROVA: "#38BDF8",
  CTA: "#22C55E",
  QRCODE: "#94A3B8",
  FECHAMENTO: "#B8922A",
};

export const TYPE_LABEL: Record<SlideType, string> = {
  ABERTURA: "Abertura",
  GANCHO: "Gancho",
  PROBLEMA: "Problema",
  CONTEUDO: "Conteúdo",
  DADO: "Dado",
  HISTORIA: "História",
  INTERACAO: "Interação",
  PROVA: "Prova",
  CTA: "CTA",
  QRCODE: "QR Code",
  FECHAMENTO: "Fechamento",
};

const uid = () => Math.random().toString(36).slice(2, 10);

const asArray = (v: unknown): string[] =>
  Array.isArray(v) ? v.map((x) => String(x ?? "").trim()).filter(Boolean) : [];

const normType = (raw: unknown, index: number, total: number): SlideType => {
  const t = String(raw ?? "").toUpperCase().replace(/[^A-Z]/g, "");
  const map: Record<string, SlideType> = {
    ABERTURA: "ABERTURA", GANCHO: "GANCHO", PROBLEMA: "PROBLEMA", CONTEUDO: "CONTEUDO",
    DADO: "DADO", DADOS: "DADO", HISTORIA: "HISTORIA", INTERACAO: "INTERACAO",
    PROVA: "PROVA", CTA: "CTA", QRCODE: "QRCODE", FECHAMENTO: "FECHAMENTO",
    ENCERRAMENTO: "FECHAMENTO",
  };
  if (map[t]) return map[t];
  if (index === 0) return "ABERTURA";
  if (index === total - 1) return "FECHAMENTO";
  return "CONTEUDO";
};

/** Aceita tanto o formato novo quanto o antigo (bloco/titulo_slide) do motor. */
export function normalizeKit(raw: any, opts: { handle?: string; qrLink?: string } = {}): LectureKit {
  const rawSlides: any[] = Array.isArray(raw?.slides) ? raw.slides : [];
  const total = rawSlides.length;
  const slides: LectureSlide[] = rawSlides.map((s, i) => normalizeSlide(s, i, total));

  const kit: LectureKit = {
    titulo: String(raw?.titulo || "Palestra"),
    subtitulo: String(raw?.subtitulo || ""),
    ganchoAbertura: String(raw?.gancho_abertura || ""),
    agenda: asArray(raw?.agenda),
    slides,
    citacoes: asArray(raw?.citacoes_chave),
    encerramento: String(raw?.encerramento_cta || ""),
  };

  return withSpecialSlides(kit, opts);
}

export function normalizeSlide(s: any, i: number, total: number): LectureSlide {
  return {
    id: uid(),
    tipo: normType(s?.tipo ?? s?.bloco, i, total),
    bloco: String(s?.bloco || "GERAL").toUpperCase(),
    titulo: String(s?.titulo_slide || s?.titulo || `Slide ${i + 1}`),
    bullets: asArray(s?.bullets).slice(0, 4),
    fala: String(s?.fala_do_palestrante || s?.fala || ""),
    tempoMin: Math.max(1, Math.round(Number(s?.tempo_min) || 2)),
    referencia: String(s?.referencia || s?.dado_cientifico || ""),
  };
}

/** Garante CTA, QR Code e Fechamento no fim do roteiro. */
function withSpecialSlides(kit: LectureKit, opts: { handle?: string; qrLink?: string }): LectureKit {
  const slides = [...kit.slides];
  const handle = (opts.handle || "diogo.mell0").replace("@", "");
  const has = (t: SlideType) => slides.some((s) => s.tipo === t);

  if (!has("CTA")) {
    slides.push({
      id: uid(), tipo: "CTA", bloco: "GERAL",
      titulo: "Próximo passo",
      bullets: [`Me segue em @${handle}`, "Conheça o nutriON", "Mentoria e consultoria"],
      fala: kit.encerramento || "Se isso fez sentido pra você, o próximo passo é simples: me segue, chama no direct e me conta qual desses pontos você vai aplicar essa semana.",
      tempoMin: 1, referencia: "",
    });
  }
  if (!has("QRCODE")) {
    slides.push({
      id: uid(), tipo: "QRCODE", bloco: "GERAL",
      titulo: "Fica com a gente",
      bullets: [`@${handle}`, opts.qrLink || `https://instagram.com/${handle}`],
      fala: "Aponta a câmera do celular agora — leva 5 segundos e você continua tendo acesso a esse conteúdo.",
      tempoMin: 1, referencia: "",
    });
  }
  if (!has("FECHAMENTO")) {
    slides.push({
      id: uid(), tipo: "FECHAMENTO", bloco: "GERAL",
      titulo: "Transformação é sistema.",
      bullets: [],
      fala: "Fica com essa frase: transformação é sistema. Obrigado.",
      tempoMin: 1, referencia: "",
    });
  }
  return { ...kit, slides: renumber(slides) };
}

export const renumber = (slides: LectureSlide[]) => slides.map((s) => ({ ...s }));

export const totalMinutes = (slides: LectureSlide[]) =>
  slides.reduce((acc, s) => acc + (s.tempoMin || 0), 0);

export function timeByType(slides: LectureSlide[]) {
  const map = new Map<SlideType, number>();
  slides.forEach((s) => map.set(s.tipo, (map.get(s.tipo) || 0) + (s.tempoMin || 0)));
  return [...map.entries()].sort((a, b) => b[1] - a[1]);
}

export const speakerText = (kit: LectureKit) =>
  kit.slides
    .map((s, i) => `${String(i + 1).padStart(2, "0")} · ${s.titulo}\n${s.fala}`)
    .join("\n\n");

export const slidesText = (kit: LectureKit) =>
  kit.slides
    .map((s, i) => [`SLIDE ${String(i + 1).padStart(2, "0")} — ${s.titulo}`, ...s.bullets.map((b) => `• ${b}`)].join("\n"))
    .join("\n\n");

export const fullText = (kit: LectureKit) => {
  const lines: string[] = [kit.titulo, kit.subtitulo, ""];
  if (kit.ganchoAbertura) lines.push(`GANCHO: ${kit.ganchoAbertura}`, "");
  if (kit.agenda.length) lines.push("AGENDA:", ...kit.agenda.map((a) => `• ${a}`), "");
  kit.slides.forEach((s, i) => {
    lines.push(`--- SLIDE ${String(i + 1).padStart(2, "0")} · ${TYPE_LABEL[s.tipo]} · ${s.tempoMin} min ---`);
    lines.push(s.titulo);
    s.bullets.forEach((b) => lines.push(`• ${b}`));
    if (s.fala) lines.push("", `Fala: ${s.fala}`);
    if (s.referencia) lines.push(`Referência: ${s.referencia}`);
    lines.push("");
  });
  if (kit.citacoes.length) lines.push("FONTES:", ...kit.citacoes.map((c) => `• ${c}`));
  return lines.join("\n");
};

const slug = (t: string) => t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").slice(0, 40) || "palestra";

/** PowerPoint 16:9 com fundo escuro e identidade do palestrante. */
export async function exportPptx(kit: LectureKit, handle: string) {
  const [{ default: PptxGenJS }, QR] = await Promise.all([
    import("pptxgenjs"),
    import("qrcode"),
  ]);
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_16x9";
  const BG = "0A0A0F";
  const GOLD = "B8922A";
  const at = (handle || "diogo.mell0").replace("@", "");

  for (const [i, s] of kit.slides.entries()) {
    const slide = pptx.addSlide();
    slide.background = { color: BG };
    const accent = TYPE_COLOR[s.tipo].replace("#", "");
    slide.addShape("rect", { x: 0, y: 0, w: 0.12, h: 5.63, fill: { color: accent } });

    if (s.tipo === "ABERTURA") {
      slide.addText(kit.titulo, { x: 0.8, y: 1.6, w: 8.6, h: 1.6, fontSize: 40, bold: true, color: "FFFFFF", fontFace: "Arial" });
      slide.addText(kit.subtitulo || `@${at}`, { x: 0.8, y: 3.2, w: 8.6, h: 0.6, fontSize: 20, color: GOLD, fontFace: "Arial" });
    } else if (s.tipo === "QRCODE") {
      const link = s.bullets.find((b) => b.startsWith("http")) || `https://instagram.com/${at}`;
      const dataUrl = await QR.toDataURL(link, { margin: 1, width: 600, color: { dark: "#0A0A0F", light: "#FFFFFF" } });
      slide.addText(s.titulo, { x: 0.8, y: 0.7, w: 8.6, h: 0.9, fontSize: 32, bold: true, color: "FFFFFF", fontFace: "Arial" });
      slide.addImage({ data: dataUrl, x: 3.7, y: 1.7, w: 2.6, h: 2.6 });
      slide.addText(`@${at}`, { x: 0.8, y: 4.5, w: 8.6, h: 0.5, fontSize: 20, color: GOLD, align: "center", fontFace: "Arial" });
    } else {
      slide.addText(s.titulo, { x: 0.8, y: 0.7, w: 8.6, h: 1.0, fontSize: 32, bold: true, color: "FFFFFF", fontFace: "Arial" });
      if (s.bullets.length) {
        slide.addText(s.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
          x: 0.9, y: 1.9, w: 8.4, h: 2.6, fontSize: 22, color: "E5E7EB", lineSpacingMultiple: 1.3, fontFace: "Arial",
        });
      }
      if (s.referencia) {
        slide.addText(s.referencia, { x: 0.9, y: 4.5, w: 6.5, h: 0.4, fontSize: 12, italic: true, color: "9CA3AF", fontFace: "Arial" });
      }
    }

    if (s.tipo !== "ABERTURA") {
      slide.addText(`@${at}`, { x: 7.9, y: 4.95, w: 1.6, h: 0.35, fontSize: 11, color: GOLD, align: "right", fontFace: "Arial" });
      slide.addText(String(i + 1).padStart(2, "0"), { x: 0.35, y: 4.95, w: 0.8, h: 0.35, fontSize: 11, color: "6B7280", fontFace: "Arial" });
    }
    if (s.fala) slide.addNotes(s.fala);
  }

  await pptx.writeFile({ fileName: `palestra-${slug(kit.titulo)}.pptx` });
}

/** PDF do roteiro completo com a fala do palestrante — pra imprimir. */
export async function exportPdf(kit: LectureKit, handle: string) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  const M = 48;
  let y = M;

  const nl = (h: number) => {
    if (y + h > H - M) { doc.addPage(); y = M; }
  };
  const write = (text: string, size: number, style: "normal" | "bold" | "italic", color: [number, number, number]) => {
    doc.setFont("helvetica", style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, W - M * 2);
    lines.forEach((l: string) => { nl(size + 6); doc.text(l, M, y); y += size + 4; });
  };

  write(kit.titulo, 22, "bold", [17, 17, 17]);
  if (kit.subtitulo) write(kit.subtitulo, 12, "normal", [90, 90, 90]);
  write(`@${(handle || "diogo.mell0").replace("@", "")} · ${totalMinutes(kit.slides)} min`, 10, "normal", [140, 140, 140]);
  y += 10;
  if (kit.ganchoAbertura) { write("GANCHO DE ABERTURA", 10, "bold", [140, 140, 140]); write(kit.ganchoAbertura, 12, "italic", [40, 40, 40]); y += 8; }

  kit.slides.forEach((s, i) => {
    y += 12; nl(60);
    write(`SLIDE ${String(i + 1).padStart(2, "0")} · ${TYPE_LABEL[s.tipo].toUpperCase()} · ${s.tempoMin} min`, 9, "bold", [150, 120, 30]);
    write(s.titulo, 15, "bold", [17, 17, 17]);
    s.bullets.forEach((b) => write(`•  ${b}`, 11, "normal", [50, 50, 50]));
    if (s.fala) { y += 4; write(s.fala, 11, "italic", [70, 70, 70]); }
    if (s.referencia) write(s.referencia, 9, "normal", [130, 130, 130]);
  });

  if (kit.citacoes.length) {
    y += 16; write("FONTES", 10, "bold", [140, 140, 140]);
    kit.citacoes.forEach((c) => write(`•  ${c}`, 9, "normal", [90, 90, 90]));
  }

  doc.save(`roteiro-palestra-${slug(kit.titulo)}.pdf`);
}
