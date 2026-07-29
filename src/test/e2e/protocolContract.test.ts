/**
 * E2E offline (roda sempre no CI) — usa fixtures capturadas de respostas REAIS
 * da Edge Function `generate-training-protocol` (protocolo completo, esqueleto e dia isolado).
 *
 * Garante duas coisas:
 *  1. Contrato de dados: o payload tem a estrutura que a UI espera.
 *  2. Renderização: o parser central nunca deixa JSON cru vazar para a tela.
 */
import { describe, it, expect } from "vitest";
import { parseProtocolText } from "@/lib/parseProtocolText";
import {
  validateFullProtocol,
  validateSkeleton,
  validateTrainingDay,
  exerciseSetBlocks,
} from "@/lib/protocolContract";


import fullFixture from "../fixtures/protocol/full-protocol.json";
import skeletonFixture from "../fixtures/protocol/skeleton.json";
import day1Fixture from "../fixtures/protocol/day-1.json";
import day2Fixture from "../fixtures/protocol/day-2.json";

describe("E2E · contrato do protocolo (fixtures reais)", () => {
  it("protocolo completo respeita o contrato", () => {
    const r = validateFullProtocol((fullFixture as any).protocol);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("esqueleto respeita o contrato", () => {
    const r = validateSkeleton((skeletonFixture as any).skeleton);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it.each([
    ["dia 1", day1Fixture],
    ["dia 2", day2Fixture],
  ])("%s isolado respeita o contrato", (_label, fixture) => {
    const r = validateTrainingDay((fixture as any).day);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
  });

  it("esqueleto e dias isolados formam um protocolo completo válido", () => {
    const sk = (skeletonFixture as any).skeleton;
    const merged = {
      block_overview: sk.block_overview,
      improvement_alerts: sk.improvement_alerts ?? [],
      training_days: [(day1Fixture as any).day, (day2Fixture as any).day],
    };
    const r = validateFullProtocol(merged, { source: "fractionated" });
    expect(r.errors).toEqual([]);

  });
});

describe("E2E · renderização (parseProtocolText)", () => {
  const protocol = (fullFixture as any).protocol;

  it("aceita o payload como objeto e como string JSON, sem vazar markdown", () => {
    for (const input of [protocol, JSON.stringify(protocol)]) {
      const { json, markdown } = parseProtocolText(input as any);
      expect(markdown).toBeNull();
      expect(json?.block_overview).toBeTruthy();
      expect(json?.training_days?.length).toBe(protocol.training_days.length);
    }
  });

  it("aceita payload com cercas de código e cabeçalho de texto", () => {
    const wrapped = "Aqui está o protocolo:\n```json\n" + JSON.stringify(protocol) + "\n```";
    const { json, markdown } = parseProtocolText(wrapped);
    expect(markdown).toBeNull();
    expect(json?.training_days?.length).toBe(protocol.training_days.length);
  });

  it("JSON truncado (falha de max_tokens) nunca vaza como markdown", () => {
    const truncated = JSON.stringify(protocol).slice(0, 4000);
    const { json, markdown } = parseProtocolText(truncated);
    expect(json).toBeNull();
    expect(markdown).toBeNull();
  });

  it("todo dia renderizável tem título e ao menos um exercício com séries", () => {
    const { json } = parseProtocolText(protocol);
    for (const day of json.training_days) {
      expect(String(day.session_title).length).toBeGreaterThan(0);
      expect(day.exercises.length).toBeGreaterThan(0);
      expect(exerciseSetBlocks(day.exercises[0]).length).toBeGreaterThan(0);
    }
  });

});
