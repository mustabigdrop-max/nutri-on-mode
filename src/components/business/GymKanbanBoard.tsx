import { useMemo, useState } from "react";
import { GYM_STATUSES, Gym, GymStatus, gymPhone, statusMeta } from "@/lib/gymBusiness";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, GripVertical, MessageCircle, Pencil } from "lucide-react";

/** Colunas do funil operacional (kanban) */
export const KANBAN_COLUMNS: GymStatus[] = [
  "nao_contactada",
  "prospectada",
  "visitada",
  "em_negociacao",
  "fechada",
];

interface Props {
  gyms: Gym[];
  onMove: (gym: Gym, status: GymStatus) => void;
  onEdit?: (gym: Gym) => void;
  onWhatsApp?: (gym: Gym) => void;
}

export default function GymKanbanBoard({ gyms, onMove, onEdit, onWhatsApp }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<GymStatus | null>(null);

  const byStatus = useMemo(() => {
    const map = new Map<GymStatus, Gym[]>();
    KANBAN_COLUMNS.forEach((s) => map.set(s, []));
    gyms.forEach((g) => {
      const key = (KANBAN_COLUMNS.includes(g.status) ? g.status : "nao_contactada") as GymStatus;
      map.get(key)!.push(g);
    });
    return map;
  }, [gyms]);

  const drop = (status: GymStatus) => {
    setOverCol(null);
    const gym = gyms.find((g) => g.id === dragId);
    setDragId(null);
    if (gym && gym.status !== status) onMove(gym, status);
  };

  const shift = (gym: Gym, dir: -1 | 1) => {
    const i = KANBAN_COLUMNS.indexOf(gym.status);
    const next = KANBAN_COLUMNS[Math.min(KANBAN_COLUMNS.length - 1, Math.max(0, i + dir))];
    if (next && next !== gym.status) onMove(gym, next);
  };

  return (
    <div className="overflow-x-auto pb-2">
      <div className="flex gap-3 min-w-max">
        {KANBAN_COLUMNS.map((status) => {
          const meta = statusMeta(status);
          const items = byStatus.get(status) ?? [];
          const active = overCol === status;
          return (
            <div
              key={status}
              onDragOver={(e) => { e.preventDefault(); setOverCol(status); }}
              onDragLeave={() => setOverCol((c) => (c === status ? null : c))}
              onDrop={(e) => { e.preventDefault(); drop(status); }}
              className={`w-[260px] shrink-0 rounded-xl border bg-card/40 p-2 transition-colors ${
                active ? "ring-2 ring-offset-0" : ""
              }`}
              style={{
                borderColor: `${meta.color}${active ? "aa" : "33"}`,
                boxShadow: active ? `0 0 0 2px ${meta.color}55 inset` : undefined,
              }}
            >
              <div className="flex items-center justify-between px-1 pb-2">
                <span className="text-xs font-semibold" style={{ color: meta.color }}>
                  {meta.dot} {meta.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-muted-foreground">{items.length}</span>
              </div>

              <div className="space-y-2 min-h-[80px]">
                {items.length === 0 && (
                  <p className="text-[11px] text-muted-foreground text-center py-6">
                    Arraste uma academia para cá
                  </p>
                )}
                {items.map((g) => (
                  <div
                    key={g.id}
                    draggable
                    onDragStart={() => setDragId(g.id)}
                    onDragEnd={() => { setDragId(null); setOverCol(null); }}
                    className={`rounded-lg border bg-background/80 p-2.5 cursor-grab active:cursor-grabbing space-y-1.5 ${
                      dragId === g.id ? "opacity-50" : ""
                    }`}
                    style={{ borderColor: `${meta.color}33` }}
                  >
                    <div className="flex items-start gap-1.5">
                      <GripVertical className="w-3.5 h-3.5 mt-0.5 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold truncate">{g.name}</p>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {[g.neighborhood || g.city, g.estimated_members ? `~${g.estimated_members} alunos` : null]
                            .filter(Boolean)
                            .join(" · ") || "Sem dados"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button size="icon" variant="ghost" className="h-7 w-7"
                        aria-label="Voltar etapa" disabled={KANBAN_COLUMNS.indexOf(g.status) === 0}
                        onClick={() => shift(g, -1)}>
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button size="icon" variant="ghost" className="h-7 w-7"
                        aria-label="Avançar etapa"
                        disabled={KANBAN_COLUMNS.indexOf(g.status) === KANBAN_COLUMNS.length - 1}
                        onClick={() => shift(g, 1)}>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                      {onWhatsApp && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="WhatsApp"
                          disabled={!gymPhone(g)} onClick={() => onWhatsApp(g)}>
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {onEdit && (
                        <Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Editar"
                          onClick={() => onEdit(g)}>
                          <Pencil className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-[11px] text-muted-foreground mt-2">
        Arraste os cards entre as colunas — no celular use as setas. Academias recusadas ficam na visão em lista.
      </p>
    </div>
  );
}
