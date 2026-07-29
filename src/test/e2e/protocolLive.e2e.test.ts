/**
 * E2E LIVE — chama a Edge Function `generate-training-protocol` de verdade.
 *
 * Só roda quando RUN_LIVE_E2E=1 (evita gastar créditos de IA em todo push).
 * No CI, dispare com:
 *   RUN_LIVE_E2E=1 VITE_SUPABASE_URL=... VITE_SUPABASE_PUBLISHABLE_KEY=... bun run test:e2e:live
 */
import { describe, it, expect } from "vitest";
import {
  validateFullProtocol,
  validateSkeleton,
  validateTrainingDay,
} from "@/lib/protocolContract";
import dayRequest from "../fixtures/protocol/day-request.json";

const LIVE = process.env.RUN_LIVE_E2E === "1";
const BASE = process.env.VITE_SUPABASE_URL;
const KEY = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;
const ENDPOINT = `${BASE}/functions/v1/generate-training-protocol`;

async function callFn(body: unknown) {
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${KEY}`,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  let json: any = null;
  try { json = JSON.parse(text); } catch { /* deixa null para o assert falhar com contexto */ }
  return { status: res.status, json, text };
}

const suite = LIVE && BASE && KEY ? describe : describe.skip;

// Campos exatamente como a Edge Function os lê (buildStructuredPrompt)
const athlete = {
  clientName: "E2E Bot",
  phase: "bulking",
  muscles: ["Peito", "Costas", "Quadríceps", "Ombros"],
  level: "intermediario",
  weeks: 4,
  days: 4,
  sessionDuration: "60min",
  equipment: "Academia completa",
};


suite("E2E LIVE · generate-training-protocol", () => {
  it(
    "protocolo completo retorna JSON válido e estruturado",
    async () => {
      const { status, json, text } = await callFn({ tab: "protocolo", ...athlete });
      expect(status, text.slice(0, 500)).toBe(200);
      const r = validateFullProtocol(json?.protocol);
      expect(r.errors).toEqual([]);
    },
    240_000,
  );

  it(
    "esqueleto retorna JSON válido",
    async () => {
      const { status, json, text } = await callFn({ mode: "skeleton", ...athlete });
      expect(status, text.slice(0, 500)).toBe(200);
      const r = validateSkeleton(json?.skeleton);
      expect(r.errors).toEqual([]);
    },
    90_000,
  );

  it(
    "dia isolado retorna JSON válido e completo (sem truncamento)",
    async () => {
      const { status, json, text } = await callFn(dayRequest);
      expect(status, text.slice(0, 500)).toBe(200);
      const r = validateTrainingDay(json?.day);
      expect(r.errors).toEqual([]);
    },
    90_000,
  );
});
