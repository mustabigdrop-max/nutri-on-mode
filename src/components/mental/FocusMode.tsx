import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Target, Clock, Ban, Bell, Star } from "lucide-react";

const EVENTS = ["Reunião importante", "Apresentação / pitch", "Prova / concurso", "Dia de trabalho intenso", "Competição esportiva"];
const DURATIONS = [1, 2, 3, 8];

interface Props { mp: any }

const FocusMode = ({ mp }: Props) => {
  const [mode, setMode] = useState<"setup" | "active" | "history">("setup");
  const [eventType, setEventType] = useState("");
  const [customEvent, setCustomEvent] = useState("");
  const [eventTime, setEventTime] = useState("14:00");
  const [duration, setDuration] = useState(2);
  const [protocol, setProtocol] = useState<any>(null);

  const handleActivate = async () => {
    const type = eventType === "Outro" ? customEvent : eventType;
    const result = await mp.activateFocusMode(type, eventTime, duration);
    if (result) { setProtocol(result); setMode("active"); }
  };

  if (mode === "history") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold flex items-center gap-2"><Target className="w-5 h-5 text-[hsl(168,100%,50%)]" /> Histórico</h2>
          <Button variant="outline" size="sm" onClick={() => setMode("setup")}>Novo</Button>
        </div>
        {mp.focusLogs.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Nenhum modo foco registrado ainda.</p>
        ) : (
          mp.focusLogs.map((log: any) => (
            <Card key={log.id} className="bg-card/80">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-sm">{log.event_type}</span>
                  <span className="text-xs text-muted-foreground">{new Date(log.event_date).toLocaleDateString("pt-BR")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{log.event_time?.slice(0, 5)} — {log.duration_hours}h</Badge>
                  {log.performance_score && <Badge className="bg-[hsl(263,70%,58%)]/20 text-[hsl(263,70%,70%)]"><Star className="w-3 h-3 mr-1" />{log.performance_score}/10</Badge>}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    );
  }

  if (mode === "active" && protocol) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="w-16 h-16 rounded-full bg-[hsl(168,100%,50%)]/20 flex items-center justify-center mx-auto mb-2 text-3xl animate-pulse">🎯</div>
          <h2 className="text-lg font-bold">Modo Foco Ativo</h2>
          <p className="text-sm text-muted-foreground">{eventType || customEvent} às {eventTime}</p>
        </div>

        {/* Timeline */}
        {protocol.timeline?.map((item: any, i: number) => (
          <Card key={i} className="bg-card/80 border-[hsl(168,100%,50%)]/10">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Badge className="bg-[hsl(168,100%,50%)]/20 text-[hsl(168,100%,60%)]">{item.time}</Badge>
                <span className="font-medium text-sm">{item.title}</span>
              </div>
              {item.foods?.length > 0 && (
                <div className="mb-1">{item.foods.map((f: string, j: number) => <span key={j} className="text-xs bg-secondary/50 rounded px-2 py-0.5 mr-1 inline-block mb-1">{f}</span>)}</div>
              )}
              {item.supplements?.length > 0 && (
                <div className="mb-1">{item.supplements.map((s: string, j: number) => <span key={j} className="text-xs bg-[hsl(263,70%,58%)]/20 text-[hsl(263,70%,70%)] rounded px-2 py-0.5 mr-1 inline-block mb-1">💊 {s}</span>)}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">{item.rationale}</p>
            </CardContent>
          </Card>
        ))}

        {/* Avoid */}
        {protocol.avoid?.length > 0 && (
          <Card className="border-destructive/20 bg-destructive/5">
            <CardContent className="p-4">
              <p className="font-medium text-sm flex items-center gap-1 mb-2"><Ban className="w-4 h-4 text-destructive" /> Evitar Hoje</p>
              {protocol.avoid.map((a: string, i: number) => <p key={i} className="text-xs text-muted-foreground">🚫 {a}</p>)}
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        {protocol.notifications?.length > 0 && (
          <Card className="bg-card/80">
            <CardContent className="p-4">
              <p className="font-medium text-sm flex items-center gap-1 mb-2"><Bell className="w-4 h-4" /> Lembretes</p>
              {protocol.notifications.map((n: any, i: number) => (
                <p key={i} className="text-xs text-muted-foreground mb-1">⏰ {n.time} — {n.message}</p>
              ))}
            </CardContent>
          </Card>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => setMode("history")}>Ver Histórico</Button>
          <Button className="flex-1 bg-[hsl(168,100%,50%)] text-background" onClick={() => setMode("setup")}>Novo Foco</Button>
        </div>
      </div>
    );
  }

  // Setup
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold flex items-center gap-2"><Target className="w-5 h-5 text-[hsl(168,100%,50%)]" /> Modo Foco</h2>

      <Card className="bg-card/80">
        <CardHeader className="pb-2"><CardTitle className="text-base">Qual é o evento de hoje?</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <RadioGroup value={eventType} onValueChange={setEventType} className="space-y-2">
            {EVENTS.map(e => (
              <div key={e} className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
                <RadioGroupItem value={e} id={`ev-${e}`} /><Label htmlFor={`ev-${e}`} className="text-sm cursor-pointer flex-1">{e}</Label>
              </div>
            ))}
            <div className="flex items-center space-x-2 bg-secondary/50 rounded-lg p-3">
              <RadioGroupItem value="Outro" id="ev-outro" /><Label htmlFor="ev-outro" className="text-sm cursor-pointer">Outro</Label>
            </div>
          </RadioGroup>
          {eventType === "Outro" && <Input placeholder="Descreva o evento" value={customEvent} onChange={e => setCustomEvent(e.target.value)} />}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Horário</Label>
              <Input type="time" value={eventTime} onChange={e => setEventTime(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Duração</Label>
              <Select value={String(duration)} onValueChange={v => setDuration(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DURATIONS.map(d => <SelectItem key={d} value={String(d)}>{d === 8 ? "Dia inteiro" : `${d}h`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button className="w-full bg-[hsl(168,100%,50%)] text-background font-semibold" disabled={!eventType || mp.loading} onClick={handleActivate}>
            {mp.loading ? "Gerando protocolo..." : "⚡ Ativar Modo Foco"}
          </Button>
        </CardContent>
      </Card>

      <Button variant="ghost" className="w-full" onClick={() => setMode("history")}>📋 Ver Histórico de Modos Foco</Button>
    </div>
  );
};

export default FocusMode;
