import jsPDF from "jspdf";

// ── Design tokens ──
const C = {
  bg: [6, 10, 6] as [number, number, number],
  surface: [12, 18, 12] as [number, number, number],
  surface2: [17, 26, 17] as [number, number, number],
  green: [74, 222, 128] as [number, number, number],
  greenDim: [20, 40, 25] as [number, number, number],
  orange: [249, 115, 22] as [number, number, number],
  blue: [96, 165, 250] as [number, number, number],
  purple: [167, 139, 250] as [number, number, number],
  yellow: [251, 191, 36] as [number, number, number],
  red: [239, 68, 68] as [number, number, number],
  text: [240, 253, 244] as [number, number, number],
  textDim: [148, 163, 184] as [number, number, number],
  textMuted: [100, 116, 139] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
};

type RGB = [number, number, number];

function hex(r: number, g: number, b: number) {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

class PremiumPDF {
  private doc: jsPDF;
  private y: number;
  private pageW: number;
  private pageH: number;
  private margin: number;
  private contentW: number;
  private pageNum: number;

  constructor() {
    this.doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    this.pageW = 210;
    this.pageH = 297;
    this.margin = 16;
    this.contentW = this.pageW - this.margin * 2;
    this.y = 0;
    this.pageNum = 1;
  }

  private checkPage(needed: number) {
    if (this.y + needed > this.pageH - 20) {
      this.addFooter();
      this.doc.addPage();
      this.pageNum++;
      this.drawPageBg();
      this.y = 16;
    }
  }

  private drawPageBg() {
    this.doc.setFillColor(...C.bg);
    this.doc.rect(0, 0, this.pageW, this.pageH, "F");
    // subtle corner accent
    this.doc.setFillColor(C.green[0], C.green[1], C.green[2]);
    this.doc.setGState(new (this.doc as any).GState({ opacity: 0.04 }));
    this.doc.circle(this.pageW, 0, 60, "F");
    this.doc.setGState(new (this.doc as any).GState({ opacity: 1 }));
  }

  private addFooter() {
    const footerY = this.pageH - 10;
    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.textMuted);
    this.doc.text(`TrainingON · Motor de Prescrição de Elite`, this.margin, footerY);
    this.doc.text(`${this.pageNum}`, this.pageW - this.margin, footerY, { align: "right" });
    // green line
    this.doc.setDrawColor(...C.green);
    this.doc.setLineWidth(0.3);
    this.doc.line(this.margin, footerY - 3, this.pageW - this.margin, footerY - 3);
  }

  private drawRoundedRect(x: number, y: number, w: number, h: number, r: number, fill: RGB, border?: RGB) {
    this.doc.setFillColor(...fill);
    this.doc.roundedRect(x, y, w, h, r, r, "F");
    if (border) {
      this.doc.setDrawColor(...border);
      this.doc.setLineWidth(0.2);
      this.doc.roundedRect(x, y, w, h, r, r, "S");
    }
  }

  private textBlock(text: string, x: number, maxW: number, fontSize: number, color: RGB, style: "normal" | "bold" = "normal"): number {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", style);
    this.doc.setTextColor(...color);
    const lines = this.doc.splitTextToSize(text, maxW);
    const lineH = fontSize * 0.45;
    return lines.length * lineH;
  }

  private writeText(text: string, x: number, maxW: number, fontSize: number, color: RGB, style: "normal" | "bold" = "normal") {
    this.doc.setFontSize(fontSize);
    this.doc.setFont("helvetica", style);
    this.doc.setTextColor(...color);
    const lines = this.doc.splitTextToSize(text, maxW);
    const lineH = fontSize * 0.45;
    for (const line of lines) {
      this.checkPage(lineH + 1);
      this.doc.text(line, x, this.y);
      this.y += lineH;
    }
  }

  private sectionDivider(label: string, color: RGB = C.green) {
    this.checkPage(12);
    this.y += 4;
    this.doc.setDrawColor(...color);
    this.doc.setLineWidth(0.4);
    this.doc.line(this.margin, this.y, this.margin + 30, this.y);
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...color);
    this.doc.text(label.toUpperCase(), this.margin + 33, this.y + 0.5);
    this.doc.line(this.margin + 33 + this.doc.getTextWidth(label.toUpperCase()) + 3, this.y, this.pageW - this.margin, this.y);
    this.y += 6;
  }

  // ── Public API ──

  generate(protocol: any, clientName: string, meta: { phase: string; level: string; weeks: string; days: string }) {
    this.drawPageBg();

    // ═══ COVER HEADER ═══
    this.y = 20;
    // Green accent bar
    this.drawRoundedRect(this.margin, this.y, this.contentW, 44, 3, C.surface, C.green);
    // Inner gradient effect
    this.drawRoundedRect(this.margin + 0.5, this.y + 0.5, this.contentW - 1, 43, 2.5, C.surface2);

    this.y += 10;
    this.doc.setFontSize(8);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...C.green);
    this.doc.text("TRAININGON · PROTOCOLO DE ELITE", this.margin + 8, this.y);

    this.y += 7;
    const ov = protocol?.block_overview;
    const title = ov?.title || `Protocolo de Treino — ${clientName}`;
    this.doc.setFontSize(16);
    this.doc.setFont("helvetica", "bold");
    this.doc.setTextColor(...C.text);
    const titleLines = this.doc.splitTextToSize(title, this.contentW - 16);
    for (const line of titleLines) {
      this.doc.text(line, this.margin + 8, this.y);
      this.y += 7;
    }

    this.y += 3;
    // Meta badges
    const badges = [
      `👤 ${clientName}`,
      `📋 ${meta.phase}`,
      `📊 ${meta.level}`,
      `⏱ ${meta.weeks} semanas`,
      `📅 ${meta.days}x/sem`,
    ];
    this.doc.setFontSize(7.5);
    this.doc.setFont("helvetica", "normal");
    this.doc.setTextColor(...C.textDim);
    this.doc.text(badges.join("  ·  "), this.margin + 8, this.y);
    this.y += 4;

    // Date
    this.doc.setFontSize(7);
    this.doc.setTextColor(...C.textMuted);
    this.doc.text(`Gerado em ${new Date().toLocaleDateString("pt-BR")}`, this.margin + 8, this.y);

    this.y += 14;

    // ═══ BLOCK OVERVIEW ═══
    if (ov) {
      this.sectionDivider("Visão Geral do Bloco");

      // Info cards row
      const cardW = (this.contentW - 4) / 3;
      const cards = [
        { label: "DURAÇÃO", value: `${ov.duration_weeks} semanas` },
        { label: "DIVISÃO", value: ov.split_type || "—" },
        { label: "DELOAD", value: `Semana ${ov.deload_week}` },
      ];
      cards.forEach((c, i) => {
        const x = this.margin + i * (cardW + 2);
        this.drawRoundedRect(x, this.y, cardW, 14, 2, C.surface2, C.green);
        this.doc.setFontSize(6);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text(c.label, x + 3, this.y + 5);
        this.doc.setFontSize(8.5);
        this.doc.setTextColor(...C.text);
        this.doc.text(c.value, x + 3, this.y + 10.5);
      });
      this.y += 18;

      // Split justification
      if (ov.split_justification) {
        this.drawRoundedRect(this.margin, this.y, this.contentW, 2, 0, C.green);
        this.y += 4;
        this.writeText(ov.split_justification, this.margin + 1, this.contentW - 2, 8.5, C.textDim);
        this.y += 4;
      }

      // Progression model
      if (ov.progression_model) {
        this.checkPage(14);
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text("MODELO DE PROGRESSÃO", this.margin, this.y);
        this.y += 4;
        this.writeText(ov.progression_model, this.margin + 1, this.contentW - 2, 8, C.textDim);
        this.y += 3;
      }

      // Muscle priorities
      if (ov.muscle_priorities?.length) {
        this.checkPage(10 + ov.muscle_priorities.length * 6);
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.orange);
        this.doc.text("PRIORIDADE MUSCULAR", this.margin, this.y);
        this.y += 5;

        ov.muscle_priorities.forEach((mp: any) => {
          this.checkPage(6);
          const priorityColor: RGB = mp.priority === "alta" ? C.orange : mp.priority === "media" ? C.yellow : C.green;
          this.doc.setFillColor(...priorityColor);
          this.doc.circle(this.margin + 2, this.y - 1, 1, "F");
          this.doc.setFontSize(8);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...C.text);
          this.doc.text(mp.muscle, this.margin + 5, this.y);
          this.doc.setFont("helvetica", "normal");
          this.doc.setTextColor(...C.textDim);
          this.doc.text(`${mp.weekly_sets} séries/sem`, this.pageW - this.margin, this.y, { align: "right" });
          this.y += 5;
        });
        this.y += 2;
      }

      // Coach notes
      if (ov.coach_notes) {
        this.checkPage(16);
        this.drawRoundedRect(this.margin, this.y, 2.5, 14, 0.5, C.green);
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text("OBSERVAÇÕES DO COACH", this.margin + 5, this.y + 4);
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...C.textDim);
        const noteLines = this.doc.splitTextToSize(ov.coach_notes, this.contentW - 8);
        let ny = this.y + 8;
        for (const nl of noteLines) {
          this.doc.text(nl, this.margin + 5, ny);
          ny += 3.5;
        }
        this.y = ny + 4;
      }
    }

    // ═══ PHASE PLAN ═══
    const pp = protocol?.phase_plan;
    if (pp) {
      this.sectionDivider("Planejamento de Fases", C.blue);

      if (pp.macrocycle_title) {
        this.doc.setFontSize(10);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.text);
        this.doc.text(pp.macrocycle_title, this.margin, this.y);
        this.y += 5;
      }
      if (pp.current_phase) {
        this.doc.setFontSize(7.5);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text(`▸ Fase Atual: ${pp.current_phase}`, this.margin, this.y);
        this.y += 6;
      }

      pp.phases?.forEach((phase: any, i: number) => {
        this.checkPage(28);
        const phaseColor: RGB = phase.name?.toLowerCase().includes("bulk") ? C.green
          : phase.name?.toLowerCase().includes("cut") ? C.orange
          : phase.name?.toLowerCase().includes("trans") ? C.blue : C.yellow;

        // Phase card
        this.drawRoundedRect(this.margin, this.y, this.contentW, 3, 0, phaseColor);
        this.y += 5;
        this.doc.setFontSize(9);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.text);
        this.doc.text(`Fase ${i + 1}: ${phase.name}`, this.margin + 1, this.y);
        this.doc.setFontSize(7.5);
        this.doc.setTextColor(...C.textMuted);
        this.doc.text(`${phase.duration_weeks} semanas`, this.pageW - this.margin, this.y, { align: "right" });
        this.y += 4;

        if (phase.objective) {
          this.writeText(phase.objective, this.margin + 1, this.contentW - 2, 8, C.textDim);
          this.y += 2;
        }

        const strats = [];
        if (phase.volume_strategy) strats.push(`Volume: ${phase.volume_strategy}`);
        if (phase.intensity_strategy) strats.push(`Intensidade: ${phase.intensity_strategy}`);
        strats.forEach(s => {
          this.writeText(s, this.margin + 1, this.contentW - 2, 7.5, C.textMuted);
          this.y += 1;
        });

        if (phase.criteria_to_advance) {
          this.checkPage(8);
          this.doc.setFontSize(7);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...phaseColor);
          this.doc.text("CRITÉRIO PARA AVANÇAR:", this.margin + 1, this.y);
          this.y += 3.5;
          this.writeText(phase.criteria_to_advance, this.margin + 1, this.contentW - 2, 7.5, C.textDim);
        }

        if (phase.rationale) {
          this.y += 1;
          this.writeText(`Justificativa: ${phase.rationale}`, this.margin + 1, this.contentW - 2, 7, C.textMuted);
        }
        this.y += 5;
      });

      // Deload strategy
      if (pp.deload_strategy) {
        this.checkPage(14);
        this.drawRoundedRect(this.margin, this.y, this.contentW, 2, 0, C.blue);
        this.y += 4;
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.blue);
        this.doc.text("ESTRATÉGIA DE DELOAD", this.margin, this.y);
        this.y += 4;
        this.writeText(pp.deload_strategy, this.margin + 1, this.contentW - 2, 8, C.textDim);
        this.y += 4;
      }

      // Post-deload
      if (pp.post_deload_decision?.scenarios?.length) {
        this.sectionDivider("Decisão Pós-Deload", C.orange);
        if (pp.post_deload_decision.intro) {
          this.writeText(pp.post_deload_decision.intro, this.margin, this.contentW, 8, C.textDim);
          this.y += 3;
        }
        pp.post_deload_decision.scenarios.forEach((sc: any, i: number) => {
          this.checkPage(22);
          const icons = ["📈", "🔄", "🛑", "🔀", "🎯"];
          this.doc.setFontSize(8.5);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...C.text);
          this.doc.text(`${icons[i] || "▸"} ${sc.condition}`, this.margin, this.y);
          this.y += 4;
          this.doc.setFontSize(7.5);
          this.doc.setFont("helvetica", "normal");
          this.doc.setTextColor(...C.textDim);
          if (sc.signal) { this.doc.text(`Sinais: ${sc.signal}`, this.margin + 3, this.y); this.y += 3.5; }
          if (sc.decision) {
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(...C.orange);
            this.doc.text(`Decisão: ${sc.decision}`, this.margin + 3, this.y);
            this.y += 3.5;
          }
          if (sc.action) {
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(...C.textDim);
            this.writeText(`Ação: ${sc.action}`, this.margin + 3, this.contentW - 6, 7.5, C.textDim);
            this.y += 1;
          }
          if (sc.how_next_block_starts) {
            this.writeText(`Próximo bloco: ${sc.how_next_block_starts}`, this.margin + 3, this.contentW - 6, 7.5, C.textMuted);
          }
          this.y += 4;
        });
      }

      if (pp.long_term_note) {
        this.checkPage(14);
        this.drawRoundedRect(this.margin, this.y, 2.5, 10, 0.5, C.green);
        this.doc.setFontSize(7);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text("VISÃO DE LONGO PRAZO", this.margin + 5, this.y + 4);
        this.doc.setFontSize(8);
        this.doc.setFont("helvetica", "normal");
        this.doc.setTextColor(...C.textDim);
        const ltLines = this.doc.splitTextToSize(pp.long_term_note, this.contentW - 8);
        let lty = this.y + 8;
        for (const l of ltLines) { this.doc.text(l, this.margin + 5, lty); lty += 3.5; }
        this.y = lty + 4;
      }
    }

    // ═══ TRAINING DAYS ═══
    if (protocol?.training_days?.length) {
      this.sectionDivider("Prescrição dos Treinos", C.green);

      protocol.training_days.forEach((day: any, dIdx: number) => {
        this.checkPage(20);
        // Day header
        this.drawRoundedRect(this.margin, this.y, this.contentW, 14, 2, C.surface2, C.green);
        this.doc.setFontSize(11);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...C.green);
        this.doc.text(`D${day.day_number || dIdx + 1}`, this.margin + 4, this.y + 9);
        this.doc.setFontSize(9);
        this.doc.setTextColor(...C.text);
        this.doc.text(day.session_title || "", this.margin + 16, this.y + 7);
        // Duration + muscles
        this.doc.setFontSize(7);
        this.doc.setTextColor(...C.textMuted);
        const meta2 = [day.estimated_duration, ...(day.focus_muscles || [])].filter(Boolean).join(" · ");
        this.doc.text(meta2, this.margin + 16, this.y + 11.5);
        this.y += 18;

        // Warmup
        if (day.warmup?.length) {
          this.checkPage(8 + day.warmup.length * 4);
          this.doc.setFontSize(7);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...C.blue);
          this.doc.text("WARM-UP", this.margin + 2, this.y);
          this.y += 4;
          day.warmup.forEach((w: any) => {
            this.doc.setFontSize(7.5);
            this.doc.setFont("helvetica", "normal");
            this.doc.setTextColor(...C.text);
            this.doc.text(`• ${w.name}`, this.margin + 4, this.y);
            this.doc.setTextColor(...C.textDim);
            this.doc.text(`${w.sets}×${w.reps}`, this.pageW - this.margin, this.y, { align: "right" });
            this.y += 4;
          });
          this.y += 2;
        }

        // Exercises
        day.exercises?.forEach((ex: any, eIdx: number) => {
          this.checkPage(24);
          // Exercise header bar
          this.drawRoundedRect(this.margin + 1, this.y, this.contentW - 2, 10, 1.5, C.surface);
          this.doc.setFontSize(7);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...C.green);
          this.doc.text(`${ex.order || eIdx + 1}`, this.margin + 4, this.y + 6.5);
          this.doc.setFontSize(8.5);
          this.doc.setTextColor(...C.text);
          this.doc.text(ex.name || "", this.margin + 10, this.y + 5);
          this.doc.setFontSize(7);
          this.doc.setTextColor(...C.textMuted);
          this.doc.text(ex.muscle_target || "", this.margin + 10, this.y + 8.5);
          if (ex.tempo) {
            this.doc.setTextColor(...C.purple);
            this.doc.text(`Tempo: ${ex.tempo}`, this.pageW - this.margin - 2, this.y + 5, { align: "right" });
          }
          this.y += 13;

          const struct = ex.structure || {};

          // Sets table
          const sets: { type: string; detail: string; color: RGB; rest?: string }[] = [];
          if (struct.feeder_sets?.length) {
            struct.feeder_sets.forEach((f: any, fi: number) => {
              sets.push({ type: `Feeder ${fi + 1}`, detail: `${f.load_percent} × ${f.reps}`, color: C.purple });
            });
          }
          if (struct.top_set) {
            sets.push({
              type: "TOP SET",
              detail: `${struct.top_set.sets}×${struct.top_set.reps} RPE ${struct.top_set.rpe}`,
              color: C.orange,
              rest: struct.top_set.rest,
            });
          }
          if (struct.backoff_sets) {
            sets.push({
              type: "Back-off",
              detail: `${struct.backoff_sets.sets}×${struct.backoff_sets.reps} (${struct.backoff_sets.load_reduction})`,
              color: C.yellow,
              rest: struct.backoff_sets.rest,
            });
          }
          if (struct.work_sets) {
            sets.push({
              type: "Trabalho",
              detail: `${struct.work_sets.sets}×${struct.work_sets.reps} RPE ${struct.work_sets.rpe}`,
              color: C.green,
              rest: struct.work_sets.rest,
            });
          }

          if (sets.length) {
            // Table header
            this.doc.setFillColor(...C.surface2);
            this.doc.rect(this.margin + 2, this.y, this.contentW - 4, 5, "F");
            this.doc.setFontSize(6);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(...C.textMuted);
            this.doc.text("TIPO", this.margin + 5, this.y + 3.5);
            this.doc.text("PRESCRIÇÃO", this.margin + 40, this.y + 3.5);
            this.doc.text("DESCANSO", this.pageW - this.margin - 5, this.y + 3.5, { align: "right" });
            this.y += 6;

            sets.forEach((s) => {
              this.checkPage(6);
              this.doc.setFontSize(7.5);
              this.doc.setFont("helvetica", "bold");
              this.doc.setTextColor(...s.color);
              this.doc.text(s.type, this.margin + 5, this.y + 3);
              this.doc.setFont("helvetica", "bold");
              this.doc.setTextColor(...C.text);
              this.doc.text(s.detail, this.margin + 40, this.y + 3);
              if (s.rest) {
                this.doc.setFont("helvetica", "normal");
                this.doc.setTextColor(...C.textMuted);
                this.doc.text(s.rest, this.pageW - this.margin - 5, this.y + 3, { align: "right" });
              }
              // subtle separator
              this.doc.setDrawColor(30, 40, 30);
              this.doc.setLineWidth(0.1);
              this.doc.line(this.margin + 4, this.y + 5, this.pageW - this.margin - 3, this.y + 5);
              this.y += 6;
            });
            this.y += 1;
          }

          // Execution cues
          if (ex.execution_cues) {
            this.checkPage(10);
            this.doc.setFontSize(6.5);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(...C.green);
            this.doc.text("EXECUÇÃO", this.margin + 4, this.y);
            this.y += 3;
            this.writeText(ex.execution_cues, this.margin + 4, this.contentW - 8, 7.5, C.textDim);
            this.y += 2;
          }

          // Why this exercise
          if (ex.why_this_exercise) {
            this.checkPage(10);
            this.doc.setFontSize(6.5);
            this.doc.setFont("helvetica", "bold");
            this.doc.setTextColor(...C.purple);
            this.doc.text("POR QUE ESTE EXERCÍCIO?", this.margin + 4, this.y);
            this.y += 3;
            this.writeText(ex.why_this_exercise, this.margin + 4, this.contentW - 8, 7, C.textMuted);
            this.y += 2;
          }

          this.y += 2;
        });

        // Session notes
        if (day.session_notes) {
          this.checkPage(12);
          this.drawRoundedRect(this.margin, this.y, 2, 8, 0.5, C.green);
          this.doc.setFontSize(6.5);
          this.doc.setFont("helvetica", "bold");
          this.doc.setTextColor(...C.green);
          this.doc.text("NOTA DA SESSÃO", this.margin + 5, this.y + 3);
          this.doc.setFontSize(7.5);
          this.doc.setFont("helvetica", "normal");
          this.doc.setTextColor(...C.textDim);
          const snLines = this.doc.splitTextToSize(day.session_notes, this.contentW - 8);
          let sny = this.y + 7;
          for (const snl of snLines) { this.doc.text(snl, this.margin + 5, sny); sny += 3.5; }
          this.y = sny + 4;
        }

        this.y += 3;
      });
    }

    // ═══ IMPROVEMENT ALERTS ═══
    if (protocol?.improvement_alerts?.length) {
      this.sectionDivider("Alertas de Melhoria", C.yellow);
      protocol.improvement_alerts.forEach((a: any) => {
        this.checkPage(10);
        const alertColor: RGB = a.severity === "alta" ? C.red : C.yellow;
        this.doc.setFillColor(...alertColor);
        this.doc.circle(this.margin + 2, this.y - 1, 1, "F");
        this.doc.setFontSize(7.5);
        this.doc.setFont("helvetica", "bold");
        this.doc.setTextColor(...alertColor);
        this.doc.text(`[${(a.severity || "").toUpperCase()}] ${a.area}`, this.margin + 5, this.y);
        this.y += 3.5;
        this.writeText(a.message, this.margin + 5, this.contentW - 8, 7.5, C.textDim);
        this.y += 4;
      });
    }

    // Final footer
    this.addFooter();

    return this.doc;
  }

  save(fileName: string) {
    this.doc.save(fileName);
  }
}

export function exportTrainingPDF(protocol: any, clientName: string, meta: { phase: string; level: string; weeks: string; days: string }) {
  const pdf = new PremiumPDF();
  pdf.generate(protocol, clientName, meta);
  pdf.save(`TrainingON_${clientName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
