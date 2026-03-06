import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useCommunity } from "@/hooks/useCommunity";
import { useSupport } from "@/hooks/useSupport";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Search,
  MessageCircle,
  Users,
  HelpCircle,
  Send,
  ChevronRight,
  Headphones,
  Sparkles,
  LogIn,
  LogOut,
  Clock,
  CheckCircle2,
  Loader2,
  BookOpen,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ReactMarkdown from "react-markdown";

interface FaqArticle {
  id: string;
  category: string;
  question: string;
  answer: string;
  tags: string[];
}

const categoryLabels: Record<string, string> = {
  geral: "Geral",
  conta: "Conta",
  nutrição: "Nutrição",
  técnico: "Técnico",
};

const SupportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // FAQ state
  const [faqs, setFaqs] = useState<FaqArticle[]>([]);
  const [faqSearch, setFaqSearch] = useState("");
  const [aiAnswer, setAiAnswer] = useState("");
  const [aiSearching, setAiSearching] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Community
  const {
    groups,
    myGroupIds,
    messages: communityMessages,
    activeGroupId,
    setActiveGroupId,
    joinGroup,
    leaveGroup,
    sendMessage: sendCommunityMessage,
  } = useCommunity();
  const [communityInput, setCommunityInput] = useState("");

  // Support
  const {
    tickets,
    activeTicket,
    setActiveTicket,
    messages: supportMessages,
    createTicket,
    sendMessage: sendSupportMessage,
  } = useSupport();
  const [supportSubject, setSupportSubject] = useState("");
  const [supportInput, setSupportInput] = useState("");
  const [showNewTicket, setShowNewTicket] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadFaqs = async () => {
      const { data } = await supabase
        .from("faq_articles")
        .select("*")
        .order("sort_order");
      setFaqs((data as FaqArticle[]) ?? []);
    };
    loadFaqs();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [communityMessages, supportMessages]);

  // Filtered FAQs
  const filteredFaqs = faqSearch.length > 1
    ? faqs.filter(
        (f) =>
          f.question.toLowerCase().includes(faqSearch.toLowerCase()) ||
          f.answer.toLowerCase().includes(faqSearch.toLowerCase()) ||
          f.tags.some((t) => t.toLowerCase().includes(faqSearch.toLowerCase()))
      )
    : faqs;

  // AI FAQ search
  const handleAiSearch = async () => {
    if (!faqSearch.trim() || faqSearch.length < 3) return;
    setAiSearching(true);
    setAiAnswer("");
    try {
      const { data, error } = await supabase.functions.invoke("faq-search", {
        body: { query: faqSearch, faqs },
      });
      if (error) throw error;
      setAiAnswer(data.answer || "Não encontrei uma resposta.");
    } catch {
      toast({ title: "Erro na busca", variant: "destructive" });
    }
    setAiSearching(false);
  };

  const handleSendCommunity = async () => {
    if (!communityInput.trim() || !activeGroupId) return;
    await sendCommunityMessage(activeGroupId, communityInput.trim());
    setCommunityInput("");
  };

  const handleCreateTicket = async () => {
    if (!supportSubject.trim() || !supportInput.trim()) return;
    const ticketId = await createTicket(supportSubject.trim(), supportInput.trim());
    if (ticketId) {
      setActiveTicket(ticketId);
      setShowNewTicket(false);
      setSupportSubject("");
      setSupportInput("");
      toast({ title: "✅ Ticket criado! Tempo de resposta < 4h" });
    }
  };

  const handleSendSupport = async () => {
    if (!supportInput.trim() || !activeTicket) return;
    await sendSupportMessage(activeTicket, supportInput.trim());
    setSupportInput("");
  };

  const statusIcons: Record<string, any> = {
    open: Clock,
    in_progress: Loader2,
    resolved: CheckCircle2,
  };

  const statusLabels: Record<string, string> = {
    open: "Aberto",
    in_progress: "Em andamento",
    resolved: "Resolvido",
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-xl border-b border-border p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold font-heading">Suporte & Comunidade</h1>
            <p className="text-xs text-muted-foreground">Ajuda, FAQ e grupos</p>
          </div>
          <Headphones className="ml-auto h-5 w-5 text-accent" />
        </div>
      </div>

      <div className="max-w-lg mx-auto pb-24">
        <Tabs defaultValue="faq" className="w-full">
          <TabsList className="w-full grid grid-cols-3 m-4 bg-secondary">
            <TabsTrigger value="faq" className="text-xs gap-1">
              <BookOpen className="h-3 w-3" /> FAQ
            </TabsTrigger>
            <TabsTrigger value="community" className="text-xs gap-1">
              <Users className="h-3 w-3" /> Comunidade
            </TabsTrigger>
            <TabsTrigger value="support" className="text-xs gap-1">
              <Headphones className="h-3 w-3" /> Suporte
            </TabsTrigger>
          </TabsList>

          {/* === FAQ TAB === */}
          <TabsContent value="faq" className="px-4 space-y-4">
            {/* Search bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={faqSearch}
                onChange={(e) => setFaqSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAiSearch()}
                placeholder="Buscar na base de conhecimento..."
                className="pl-10 bg-secondary border-border"
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleAiSearch}
                disabled={aiSearching || faqSearch.length < 3}
                className="absolute right-1 top-1/2 -translate-y-1/2"
              >
                {aiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              </Button>
            </div>

            {/* AI Answer */}
            <AnimatePresence>
              {aiAnswer && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-xs font-semibold text-primary">Resposta da IA</span>
                      </div>
                      <div className="text-sm prose prose-sm prose-invert max-w-none">
                        <ReactMarkdown>{aiAnswer}</ReactMarkdown>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            {/* FAQ List */}
            <div className="space-y-2">
              {Object.entries(categoryLabels).map(([cat, label]) => {
                const catFaqs = filteredFaqs.filter((f) => f.category === cat);
                if (catFaqs.length === 0) return null;
                return (
                  <div key={cat}>
                    <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">{label}</p>
                    {catFaqs.map((faq) => (
                      <Card
                        key={faq.id}
                        className="bg-card border-border mb-2 cursor-pointer"
                        onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-2">
                            <HelpCircle className="h-4 w-4 text-primary shrink-0" />
                            <p className="text-sm font-medium flex-1">{faq.question}</p>
                            <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${expandedFaq === faq.id ? "rotate-90" : ""}`} />
                          </div>
                          <AnimatePresence>
                            {expandedFaq === faq.id && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-3 pt-3 border-t border-border"
                              >
                                <p className="text-sm text-muted-foreground">{faq.answer}</p>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                );
              })}
            </div>
          </TabsContent>

          {/* === COMMUNITY TAB === */}
          <TabsContent value="community" className="px-4 space-y-4">
            {!activeGroupId ? (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">Participe de grupos por objetivo</p>
                {groups.map((group) => {
                  const isMember = myGroupIds.includes(group.id);
                  return (
                    <Card key={group.id} className="bg-card border-border">
                      <CardContent className="p-4 flex items-center gap-3">
                        <span className="text-3xl">{group.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm">{group.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{group.description}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">{group.member_count} membros</p>
                        </div>
                        <div className="flex flex-col gap-1">
                          {isMember ? (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-xs"
                                onClick={() => setActiveGroupId(group.id)}
                              >
                                <MessageCircle className="h-3 w-3 mr-1" /> Abrir
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-xs text-muted-foreground"
                                onClick={() => leaveGroup(group.id)}
                              >
                                <LogOut className="h-3 w-3 mr-1" /> Sair
                              </Button>
                            </>
                          ) : (
                            <Button
                              size="sm"
                              className="text-xs bg-primary text-primary-foreground"
                              onClick={() => joinGroup(group.id)}
                            >
                              <LogIn className="h-3 w-3 mr-1" /> Entrar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="space-y-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setActiveGroupId(null)}
                  className="text-xs"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Voltar aos grupos
                </Button>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <span>{groups.find((g) => g.id === activeGroupId)?.emoji}</span>
                      {groups.find((g) => g.id === activeGroupId)?.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-64 overflow-y-auto space-y-2 mb-3">
                      {communityMessages.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-8">
                          Nenhuma mensagem ainda. Seja o primeiro! 👋
                        </p>
                      )}
                      {communityMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-2 rounded-lg text-sm ${
                            msg.user_id === user?.id
                              ? "bg-primary/10 ml-8"
                              : "bg-secondary mr-8"
                          }`}
                        >
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(msg.created_at), "HH:mm", { locale: ptBR })}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={communityInput}
                        onChange={(e) => setCommunityInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendCommunity()}
                        placeholder="Escreva uma mensagem..."
                        className="bg-secondary border-border text-sm"
                      />
                      <Button size="icon" onClick={handleSendCommunity} className="bg-primary text-primary-foreground">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* === SUPPORT TAB === */}
          <TabsContent value="support" className="px-4 space-y-4">
            {!activeTicket && !showNewTicket ? (
              <div className="space-y-3">
                <Button
                  onClick={() => setShowNewTicket(true)}
                  className="w-full bg-primary text-primary-foreground"
                >
                  <MessageCircle className="h-4 w-4 mr-2" /> Abrir novo ticket
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Tempo médio de resposta: &lt; 4 horas
                </p>

                {tickets.length === 0 && (
                  <div className="text-center py-8">
                    <Headphones className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Nenhum ticket aberto</p>
                  </div>
                )}

                {tickets.map((ticket) => {
                  const StatusIcon = statusIcons[ticket.status] || Clock;
                  return (
                    <Card
                      key={ticket.id}
                      className="bg-card border-border cursor-pointer hover:border-primary/30 transition-colors"
                      onClick={() => setActiveTicket(ticket.id)}
                    >
                      <CardContent className="p-3 flex items-center gap-3">
                        <StatusIcon className={`h-5 w-5 shrink-0 ${
                          ticket.status === "resolved" ? "text-accent" : "text-primary"
                        } ${ticket.status === "in_progress" ? "animate-spin" : ""}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{ticket.subject}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {format(new Date(ticket.created_at), "dd/MM HH:mm")} · {statusLabels[ticket.status]}
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : showNewTicket ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
                <Button variant="ghost" size="sm" onClick={() => setShowNewTicket(false)} className="text-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" /> Voltar
                </Button>
                <Card className="bg-card border-border">
                  <CardHeader>
                    <CardTitle className="text-sm">Novo ticket de suporte</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <Input
                        value={supportSubject}
                        onChange={(e) => setSupportSubject(e.target.value)}
                        placeholder="Assunto do ticket"
                        className="bg-secondary border-border"
                      />
                    </div>
                    <div>
                      <Textarea
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        placeholder="Descreva sua dúvida ou problema..."
                        className="bg-secondary border-border"
                        rows={4}
                      />
                    </div>
                    <Button onClick={handleCreateTicket} className="w-full bg-primary text-primary-foreground">
                      <Send className="h-4 w-4 mr-2" /> Enviar ticket
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="space-y-3">
                <Button variant="ghost" size="sm" onClick={() => setActiveTicket(null)} className="text-xs">
                  <ArrowLeft className="h-3 w-3 mr-1" /> Voltar aos tickets
                </Button>
                <Card className="bg-card border-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      {tickets.find((t) => t.id === activeTicket)?.subject}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-3">
                    <div className="h-64 overflow-y-auto space-y-2 mb-3">
                      {supportMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`p-3 rounded-lg text-sm ${
                            msg.sender_type === "user"
                              ? "bg-primary/10 ml-8"
                              : msg.sender_type === "ai"
                              ? "bg-accent/10 mr-8"
                              : "bg-secondary mr-8"
                          }`}
                        >
                          <p className="text-[10px] font-medium text-muted-foreground mb-1">
                            {msg.sender_type === "user" ? "Você" : msg.sender_type === "ai" ? "🤖 IA" : "👤 Suporte"}
                          </p>
                          <p>{msg.content}</p>
                          <p className="text-[10px] text-muted-foreground mt-1">
                            {format(new Date(msg.created_at), "dd/MM HH:mm")}
                          </p>
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        value={supportInput}
                        onChange={(e) => setSupportInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSendSupport()}
                        placeholder="Responder..."
                        className="bg-secondary border-border text-sm"
                      />
                      <Button size="icon" onClick={handleSendSupport} className="bg-primary text-primary-foreground">
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default SupportPage;
