import { describe, expect, it } from "vitest";
import { diaEstruturadoDeHoje } from "@/lib/treinoHojeData";
import type { ParsedDay } from "@/lib/parseProtocolMarkdown";

const dia = (numero: number, titulo: string): ParsedDay => ({
  day_number: numero,
  session_title: titulo,
  estimated_duration: "60min",
  muscle_tags: [],
  body: "",
  exercises: [{ order: 1, name: titulo, sets: [] }],
});

describe("diaEstruturadoDeHoje", () => {
  const dias = [
    dia(1, "D1"), dia(2, "D2"), dia(3, "Dorsal e Bíceps"),
    dia(4, "Peitoral, Deltóides e Tríceps"), dia(5, "Posteriores"), dia(6, "Dorsal"),
  ];

  it("usa quinta-feira como D4 sem consultar a divisão antiga da agenda", () => {
    expect(diaEstruturadoDeHoje(dias, 4)?.session_title).toBe("Peitoral, Deltóides e Tríceps");
  });

  it("não reaproveita treino em domingo", () => {
    expect(diaEstruturadoDeHoje(dias, 0)).toBeNull();
  });
});