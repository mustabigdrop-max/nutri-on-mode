import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  ArrowLeft,
  Bell,
  Loader2,
  Dumbbell,
  Utensils,
  Pill,
  Syringe,
  ChevronDown,
  ChevronUp,
  MessageSquare,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "@/hooks/use-toast";

type Envio = {
  id: string;
  coach_id: string;
  destinatario_id: string;
  tipo_destinatario: string;
  tipo_conteudo: string[];
  conteudo_ids: Record<string, string[]> | null;
  observacao: string | null;
  status: string;
  created_at: string;
};

type CoachInfo = { name: string; avatar?: string | null; userId?: string };

const TIPO_LABEL: Record<string, { label: string; icon: any }> = {
  treino: { label: "Treino", icon: Dumbbell },
  plano_alimentar: { label: "Dieta", icon: Utensils },
  suplementacao: { label: "Suplementação", icon: Pill },
  peptideos: { label: "Peptídeos", icon: Syringe },
  protocolo_completo: { label: "Protocolo Completo", icon: Dumbbell },
  material_educativo: { label: "Material Educativo", icon: Utensils },
  modelo_prescricao: { label: "Modelo de Prescrição", icon: Pill },
};

const TABLE_FOR_TIPO: Record<string, string> = {
  treino: "training_protocols",
  plano_alimentar: "daily_nutrition_protocol",
  suplementacao: "lab_protocols",
  peptideos: "peptide_search_history",
};

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  if (h < 1) return "agora";
  if (h < 24) return `há ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "há 1 dia" : `há ${d} dias`;
}

export default function MeusProtocolosPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [envios, setEnvios] = useState<Envio[]>([]);
  const [coaches, setCoaches] = useState<Record<string, CoachInfo>>({});
  const [readMap, setReadMap] = useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = useState<string | null>(null);
  const [contentCache, setContentCache] = useState<Record<string, any>>({});

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);

      const { data: envData } = await supabase
        .from("protocolo_envios")
        .select("*")
        .eq("destinatario_id", user.id)
        .order("created_at", { ascending: false });

      const list = (envData || []) as Envio[];
      setEnvios(list);

      // Coaches
      const coachIds = Array.from(new Set(list.map((e) => e.coach_id)));
      if (coachIds.length) {
        const { data: cps } = await supabase
          .from("coach_profiles")
          .select("id, user_id, professional_name, avatar_url")
          .in("id", coachIds);
        const map: Record<string, CoachInfo> = {};
        const userIds = (cps || []).map((c) => c.user_id);
        const { data: profs } = userIds.length
          ? await supabase.from("profiles").select("user_id, full_name").in("user_id", userIds)
          : { data: [] as any[] };
        for (const c of cps || []) {
          const prof = profs?.find((p: any) => p.user_id === c.user_id);
          map[c.id] = {
            name: c.professional_name || prof?.full_name || "Coach",
            avatar: c.avatar_url,
            userId: c.user_id,
          };
        }
        setCoaches(map);
      }

      // Notificações lidas (por reference_id = id do envio)
      const ids = list.map((e) => e.id);
      if (ids.length) {
        const { data: notifs } = await supabase
          .from("coach_notifications")
          .select("reference_id, read")
          .eq("recipient_user_id", user.id)
          .in("reference_id", ids);
        const rm: Record<string, boolean> = {};
        for (const n of notifs || []) {
          if (n.reference_id) rm[n.reference_id] = !!n.read;
        }
        setReadMap(rm);
      }

      setLoading(false);
    };
    load();
  }, [user]);

  const unreadCount = useMemo(
    () => envios.filter((e) => readMap[e.id] === false).length,
    [envios, readMap]
  );

  const markRead = async (envioId: string) => {
    if (!user) return;
    if (readMap[envioId] !== false) return;
    await supabase
      .from("coach_notifications")
      .update({ read: true })
      .eq("recipient_user_id", user.id)
      .eq("reference_id", envioId);
    setReadMap((prev) => ({ ...prev, [envioId]: true }));
  };

  const loadContent = async (envio: Envio) => {
    if (contentCache[envio.id] || !user) return;
    const result: Record<string, any> = {};
    for (const tipo of envio.tipo_conteudo) {
      const table = TABLE_FOR_TIPO[tipo];
      if (!table) continue;
      const ids = envio.conteudo_ids?.[tipo];
      if (ids?.length) {
        const { data } = await (supabase as any).from(table).select("*").in("id", ids);
        result[tipo] = data || [];
      } else {
        // fallback: busca o mais recente do aluno
        const { data } = await (supabase as any)
          .from(table)
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);
        result[tipo] = data || [];
      }
    }
    setContentCache((prev) => ({ ...prev, [envio.id]: result }));
  };

  const toggleExpand = async (envio: Envio) => {
    const isOpening = expanded !== envio.id;
    setExpanded(isOpening ? envio.id : null);
    if (isOpening) {
      await markRead(envio.id);
      await loadContent(envio);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card px-4 py-4 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Meus Protocolos</h1>
              <p className="text-xs text-muted-foreground">
                {envios.length} {envios.length === 1 ? "protocolo recebido" : "protocolos recebidos"}
              </p>
            </div>
          </div>
          <div className="relative">
            <Bell className="w-5 h-5 text-muted-foreground" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 bg-destructive rounded-full text-[10px] font-bold text-destructive-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-3">
        {envios.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Bell className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Você ainda não recebeu nenhum protocolo do seu coach.</p>
            </CardContent>
          </Card>
        ) : (
          envios.map((envio, i) => {
            const coach = coaches[envio.coach_id];
            const isUnread = readMap[envio.id] === false;
            const isOpen = expanded === envio.id;
            return (
              <motion.div
                key={envio.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                <Card
                  className={`cursor-pointer transition-colors ${
                    isUnread ? "border-primary/50 bg-primary/5" : "hover:border-primary/30"
                  }`}
                >
                  <CardContent className="p-4" onClick={() => toggleExpand(envio)}>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                          {coach?.name?.charAt(0)?.toUpperCase() || "C"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-semibold text-foreground text-sm truncate">
                              {coach?.name || "Coach"}
                            </p>
                            {isUnread && (
                              <Badge className="text-[10px] bg-primary text-primary-foreground">
                                Novo
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{relTime(envio.created_at)}</p>
                        </div>
                      </div>
                      {isOpen ? (
                        <ChevronUp className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>

                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {envio.tipo_conteudo.map((t) => {
                        const meta = TIPO_LABEL[t];
                        const Icon = meta?.icon || Dumbbell;
                        return (
                          <Badge key={t} variant="outline" className="text-[10px] gap-1">
                            <Icon className="w-3 h-3" />
                            {meta?.label || t}
                          </Badge>
                        );
                      })}
                    </div>
                  </CardContent>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden border-t border-border"
                      >
                        <div className="p-4 space-y-4">
                          {envio.observacao && (
                            <div className="rounded-lg bg-primary/10 border border-primary/30 p-3 flex gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs shrink-0">
                                {coach?.name?.charAt(0)?.toUpperCase() || "C"}
                              </div>
                              <div className="flex-1">
                                <p className="text-[10px] uppercase tracking-wide text-primary font-semibold mb-1 flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  Mensagem do coach
                                </p>
                                <p className="text-sm text-foreground whitespace-pre-wrap">
                                  {envio.observacao}
                                </p>
                              </div>
                            </div>
                          )}

                          <ContentTabs envio={envio} content={contentCache[envio.id]} />
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </Card>
              </motion.div>
            );
          })
        )}
      </main>
    </div>
  );
}

function ContentTabs({ envio, content }: { envio: Envio; content: Record<string, any> | undefined }) {
  const tipos = envio.tipo_conteudo.filter((t) => TIPO_LABEL[t]);
  if (!tipos.length) return null;

  if (!content) {
    return (
      <div className="flex justify-center py-6">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Tabs defaultValue={tipos[0]} className="w-full">
      <TabsList className="w-full justify-start overflow-x-auto">
        {tipos.map((t) => {
          const meta = TIPO_LABEL[t];
          const Icon = meta?.icon || Dumbbell;
          return (
            <TabsTrigger key={t} value={t} className="text-xs gap-1">
              <Icon className="w-3.5 h-3.5" />
              {meta?.label || t}
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tipos.map((t) => (
        <TabsContent key={t} value={t} className="mt-3">
          <ContentRenderer tipo={t} items={content[t] || []} />
        </TabsContent>
      ))}
    </Tabs>
  );
}

function ContentRenderer({ tipo, items }: { tipo: string; items: any[] }) {
  if (!items.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-sm text-muted-foreground">
          Nenhum conteúdo de {TIPO_LABEL[tipo]?.label || tipo} disponível.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item: any, idx: number) => (
        <Card key={item.id || idx}>
          <CardContent className="p-4 space-y-2">
            {item.title && <p className="font-semibold text-foreground">{item.title}</p>}
            {item.name && !item.title && <p className="font-semibold text-foreground">{item.name}</p>}
            {item.created_at && (
              <p className="text-[10px] text-muted-foreground">
                {new Date(item.created_at).toLocaleDateString("pt-BR")}
              </p>
            )}
            {item.description && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.description}</p>
            )}
            {item.notes && (
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{item.notes}</p>
            )}
            {item.content && (
              <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 rounded p-3">
                {typeof item.content === "string"
                  ? item.content
                  : JSON.stringify(item.content, null, 2)}
              </div>
            )}
            {item.protocol && (
              <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 rounded p-3">
                {typeof item.protocol === "string"
                  ? item.protocol
                  : JSON.stringify(item.protocol, null, 2)}
              </div>
            )}
            {item.meals && (
              <div className="text-xs text-foreground bg-muted/30 rounded p-3 overflow-auto">
                <pre className="whitespace-pre-wrap">{JSON.stringify(item.meals, null, 2)}</pre>
              </div>
            )}
            {item.query && (
              <div className="text-sm">
                <span className="text-muted-foreground">Pesquisa: </span>
                <span className="text-foreground">{item.query}</span>
              </div>
            )}
            {item.result && (
              <div className="text-sm text-foreground whitespace-pre-wrap bg-muted/30 rounded p-3 max-h-64 overflow-auto">
                {typeof item.result === "string"
                  ? item.result
                  : JSON.stringify(item.result, null, 2)}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
