import { describe, expect, it } from "vitest";
import { toEditableProtocol, serializeEditableProtocol } from "./workoutEditorModel";
import { parseProtocolToDays } from "./parseProtocolMarkdown";
import { buildWorkoutShareData } from "./workoutShareAdapter";

const structured = JSON.stringify({
  block_overview: { title: "Cutting", split_type: "PPL" },
  training_days: [
    {
      day_number: 1,
      session_title: "Push A — Peitoral",
      estimated_duration: "75min",
      session_notes: "Foco no peitoral superior",
      warmup: [{ name: "Mobilidade torácica", sets: "2", reps: "10" }],
      exercises: [
        { order: 1, name: "Supino inclinado", muscle_target: "Peitoral superior", sets: "4", reps: "8-10", rpe: "8", rir: "2", rest: "120s" },
      ],
    },
  ],
});

describe("workoutEditorModel", () => {
  it("lê o formato estruturado sem perder campos", () => {
    const model = toEditableProtocol(structured);
    expect(model.wasStructured).toBe(true);
    expect(model.days).toHaveLength(1);
    const exercise = model.days[0].exercises[0];
    expect(exercise).toMatchObject({ name: "Supino inclinado", sets: "4", reps: "8-10", rpe: "8", rir: "2", rest: "120s" });
    expect(model.extra.block_overview).toBeTruthy();
  });

  it("mantém o round-trip e alimenta o card", () => {
    const model = toEditableProtocol(structured);
    const serialized = serializeEditableProtocol(model);
    expect(JSON.parse(serialized).block_overview.title).toBe("Cutting");
    const parsed = parseProtocolToDays(serialized);
    expect(parsed.isStructured).toBe(true);
    const card = buildWorkoutShareData(parsed.days[0], { phase: "cutting", weeks: "16" });
    expect(card.dayCode).toBe("D1");
    expect(card.stats.series).toBe(4);
    expect(card.stats.rpe).toBe(8);
    expect(card.exercises[0].name).toBe("Supino inclinado");
    expect(card.warmup).toContain("Mobilidade torácica");
  });

  it("não inventa dados quando o campo está vazio", () => {
    const model = toEditableProtocol("texto livre sem estrutura");
    expect(model.days).toHaveLength(0);
    const serialized = serializeEditableProtocol({ extra: {}, wasStructured: false, days: [] });
    expect(JSON.parse(serialized).training_days).toEqual([]);
  });
});
