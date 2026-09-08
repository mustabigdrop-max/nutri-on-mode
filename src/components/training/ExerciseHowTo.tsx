import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, X, MessageCircle, Loader2, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { loadExerciseGuide, type ExerciseGuide } from "@/lib/exerciseGuide";

const AMBER = "#EF9F27";
const TEAL = "#5DCAA5";
const TEXT = "#e8f0ff";
const DIM = "#9aa5b8";
const CARD = "rgba(255,255,255,0.03)";
const BORDER = "rgba(255,255,255,0.08)";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginTop: 8 }}>
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.08em",
          textTransform: "uppercase",
          color: TEAL,
          fontWeight: 700,
          marginBottom: 8,
        }}
      >
        {title}
      </div>
      {children}
    </div>
  );
}

function ActionButton({
  onClick,
  children,
  color,
}: {
  onClick: () => void;
  children: React.ReactNode;
  color: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        minHeight: 44,
        padding: "0 14px",
        borderRadius: 8,
        border: `1px solid ${color}66`,
        background: "transparent",
        color,
        fontSize: 13,
        fontWeight: 600,
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}

function GuideView({ guide }: { guide: ExerciseGuide }) {
  return (
    <div>
      {(guide.aparelho || guide.ajuste || guide.pegada) && (
        <Section title="Preparação">
          <div style={{ display: "grid", gap: 8 }}>
            {guide.aparelho && (
              <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5 }}>
                <strong style={{ color: DIM, fontWeight: 600 }}>Aparelho: </strong>
                {guide.aparelho}
              </div>
            )}
            {guide.ajuste && (
              <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5 }}>
                <strong style={{ color: DIM, fontWeight: 600 }}>Ajuste: </strong>
                {guide.ajuste}
              </div>
            )}
            {guide.pegada && (
              <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5 }}>
                <strong style={{ color: DIM, fontWeight: 600 }}>Pegada: </strong>
                {guide.pegada}
              </div>
            )}
          </div>
        </Section>
      )}

      {!!guide.passos?.length && (
        <Section title="Execução passo a passo">
          <div style={{ display: "grid", gap: 12 }}>
            {guide.passos.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 10 }}>
                <div
                  style={{
                    width: 24,
                    height: 24,
                    flexShrink: 0,
                    borderRadius: 999,
                    background: "rgba(93,202,165,0.12)",
                    border: `1px solid ${TEAL}55`,
                    color: TEAL,
                    fontSize: 12,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i + 1}
                </div>
                <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5 }}>{p}</div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {!!guide.erros?.length && (
        <Section title="Erros comuns">
          <div style={{ display: "grid", gap: 12 }}>
            {guide.erros.map((e, i) => (
              <div key={i}>
                <div style={{ fontSize: 15, color: "#ff6b6b", lineHeight: 1.5 }}>✕ {e.erro}</div>
                {e.correcao && (
                  <div style={{ fontSize: 15, color: TEAL, lineHeight: 1.5, marginTop: 2 }}>→ {e.correcao}</div>
                )}
              </div>
            ))}
          </div>
        </Section>
      )}

      {!!guide.musculos?.length && (
        <Section title="Ativação muscular">
          <div style={{ display: "grid", gap: 10 }}>
            {guide.musculos.map((m, i) => {
              const principal = m.tipo === "principal";
              const color = principal ? AMBER : TEAL;
              return (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: TEXT }}>
                    <span>
                      <span style={{ color: DIM, fontSize: 11, textTransform: "uppercase", marginRight: 6 }}>
                        {principal ? "Principal" : "Secundário"}
                      </span>
                      {m.nome}
                    </span>
                    <span style={{ color }}>{m.ativacao}%</span>
                  </div>
                  <div
                    style={{
                      height: 8,
                      borderRadius: 999,
                      background: "rgba(255,255,255,0.07)",
                      marginTop: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ width: `${m.ativacao}%`, height: "100%", background: color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Section>
      )}

      {guide.dica_coach && (
        <div
          style={{
            marginTop: 8,
            padding: 12,
            background: "rgba(239,159,39,0.07)",
            borderLeft: `2px solid ${AMBER}`,
            borderRadius: 8,
          }}
        >
          <div style={{ fontSize: 10, letterSpacing: "0.08em", color: AMBER, fontWeight: 700, marginBottom: 4 }}>
            DICA DO COACH
          </div>
          <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5, fontStyle: "italic" }}>{guide.dica_coach}</div>
        </div>
      )}
    </div>
  );
}

function QuestionBox({
  exerciseName,
  dayLabel,
  onDone,
}: {
  exerciseName: string;
  dayLabel?: string;
  onDone: () => void;
}) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);

  const send = async () => {
    const q = text.trim();
    if (q.length < 3) return;
    setSending(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) throw new Error("Faça login para enviar a dúvida.");
      const { data: link } = await supabase
        .from("coach_patients")
        .select("coach_user_id")
        .eq("patient_user_id", uid)
        .limit(1)
        .maybeSingle();
      const { error } = await supabase.from("exercise_questions").insert({
        user_id: uid,
        coach_user_id: (link as any)?.coach_user_id ?? null,
        exercise_name: exerciseName,
        day_label: dayLabel || null,
        question: q,
      });
      if (error) throw error;
      toast.success("Dúvida enviada para o coach.");
      setText("");
      onDone();
    } catch (e) {
      toast.error((e as Error).message || "Não foi possível enviar a dúvida.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ marginTop: 8, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12 }}>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        placeholder={`Sua dúvida sobre ${exerciseName}...`}
        style={{
          width: "100%",
          background: "rgba(0,0,0,0.35)",
          border: `1px solid ${BORDER}`,
          borderRadius: 8,
          color: TEXT,
          fontSize: 15,
          padding: 10,
          resize: "vertical",
        }}
      />
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <button
          type="button"
          onClick={send}
          disabled={sending || text.trim().length < 3}
          style={{
            minHeight: 44,
            padding: "0 16px",
            borderRadius: 8,
            border: "none",
            background: AMBER,
            color: "#0A0A0A",
            fontWeight: 700,
            fontSize: 13,
            opacity: sending || text.trim().length < 3 ? 0.5 : 1,
            cursor: "pointer",
          }}
        >
          {sending ? "Enviando..." : "Enviar para o coach"}
        </button>
        <ActionButton onClick={onDone} color={DIM}>
          Cancelar
        </ActionButton>
      </div>
    </div>
  );
}

export function ExerciseHowTo({
  exerciseName,
  muscleTarget,
  tempo,
  dayLabel,
}: {
  exerciseName: string;
  muscleTarget?: string | null;
  tempo?: string | null;
  dayLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [asking, setAsking] = useState(false);
  const [loading, setLoading] = useState(false);
  const [guide, setGuide] = useState<ExerciseGuide | null>(null);
  const [answers, setAnswers] = useState<{ question: string; answer: string }[]>([]);

  const toggle = async () => {
    if (open) {
      setOpen(false);
      return;
    }
    setOpen(true);
    if (!guide && !loading) {
      setLoading(true);
      try {
        const g = await loadExerciseGuide({ name: exerciseName, muscleTarget, tempo });
        setGuide(g);
        const { data: auth } = await supabase.auth.getUser();
        if (auth.user?.id) {
          const { data } = await supabase
            .from("exercise_questions")
            .select("question, answer")
            .eq("user_id", auth.user.id)
            .eq("exercise_name", exerciseName)
            .not("answer", "is", null)
            .order("created_at", { ascending: false })
            .limit(5);
          setAnswers(((data as any[]) || []).map((r) => ({ question: r.question, answer: r.answer })));
        }
      } catch (e) {
        toast.error((e as Error).message || "Não foi possível carregar o guia.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <ActionButton onClick={toggle} color={TEAL}>
          {open ? <X style={{ width: 14, height: 14 }} /> : <Play style={{ width: 14, height: 14 }} />}
          {open ? "Fechar" : "Como fazer"}
        </ActionButton>
        <ActionButton onClick={() => setAsking((v) => !v)} color={AMBER}>
          <MessageCircle style={{ width: 14, height: 14 }} />
          Dúvida
        </ActionButton>
      </div>

      <AnimatePresence initial={false}>
        {asking && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <QuestionBox exerciseName={exerciseName} dayLabel={dayLabel} onDone={() => setAsking(false)} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
            <div style={{ overflow: "hidden" }}>
              {loading && (
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: DIM, fontSize: 13, padding: "12px 0" }}>
                  <Loader2 className="animate-spin" style={{ width: 14, height: 14 }} />
                  Montando o guia deste exercício...
                </div>
              )}
              {guide && <GuideView guide={guide} />}
              {answers.map((a, i) => (
                <div
                  key={i}
                  style={{
                    marginTop: 8,
                    padding: 12,
                    background: "rgba(93,202,165,0.06)",
                    border: `1px solid ${TEAL}33`,
                    borderRadius: 8,
                  }}
                >
                  <div style={{ fontSize: 10, letterSpacing: "0.08em", color: TEAL, fontWeight: 700, marginBottom: 4 }}>
                    RESPOSTA DO COACH
                  </div>
                  <div style={{ fontSize: 13, color: DIM, marginBottom: 4 }}>{a.question}</div>
                  <div style={{ fontSize: 15, color: TEXT, lineHeight: 1.5 }}>{a.answer}</div>
                </div>
              ))}
              {guide && (
                <div style={{ marginTop: 10 }}>
                  <ActionButton onClick={() => setOpen(false)} color={DIM}>
                    <X style={{ width: 14, height: 14 }} /> Fechar
                  </ActionButton>
                </div>
              )}
              {!loading && !guide && (
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: DIM, fontSize: 13, padding: "8px 0" }}>
                  <Check style={{ width: 14, height: 14 }} /> Toque novamente para tentar carregar o guia.
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
