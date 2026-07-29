import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { parseProtocolText } from "@/lib/parseProtocolText";

const full = JSON.parse(readFileSync("/tmp/e2e/full.json", "utf8"));

describe("e2e protocolo real", () => {
  it("payload da edge function renderiza como JSON estruturado", () => {
    const p = full.protocol;
    const asString = JSON.stringify(p);
    for (const input of [p, asString]) {
      const { json, markdown } = parseProtocolText(input as any);
      expect(markdown).toBeNull();
      expect(json?.block_overview).toBeTruthy();
      expect(json?.training_days?.length).toBe(4);
      expect(json.training_days.every((d: any) => d.exercises?.length > 0)).toBe(true);
    }
  });
});
