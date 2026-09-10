import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ACCENT, Section, copyText } from "./socialUi";
import {
  CTA_PALAVRAS_CHAVE,
  DM_TRIGGERS_PADRAO,
  listarTriggers,
  removerTrigger,
  salvarTrigger,
  type DmTrigger,
} from "@/lib/socialGrowth";

const LINK_DIAG = "https://nutrion.app.br/diagnostico?utm_source=instagram&utm_medium=dm";

export default function DmAutomationPanel() {
  const [triggers, setTriggers] = useState<DmTrigger[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [palavra, setPalavra] = useState("");
  const [mensagem, setMensagem] = useState("");

  const carregar = useCallback(async () => {
    setCarregando(true);
    try {
      setTriggers(await listarTriggers());
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao carregar gatilhos");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => { void carregar(); }, [carregar]);

  const adicionar = async (p: string, m: string) => {
    if (!p.trim() || !m.trim()) return toast.error("Preencha palavra e mensagem");
    try {
      await salvarTrigger(p, m);
      setPalavra("");
      setMensagem("");
      toast.success("Gatilho salvo");
      void carregar();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Falha ao salvar");
    }
  };

  const importarPadrao = async () => {
    for (const t of DM_TRIGGERS_PADRAO) {
      if (triggers.some((x) => x.palavra === t.palavra)) continue;
      await salvarTrigger(t.palavra, t.mensagem.replace("{LINK}", LINK_DIAG));
    }
    toast.success("Gatilhos padrão importados");
    void carregar();
  };

  return (
    <div className="space-y-4">
      <Section title="🤖 Automação de DM por palavra-chave">
        <p className="text-sm text-muted-foreground">
          Quando alguém comentar a palavra-chave, a pessoa recebe a DM. O SOCIAL ON gera os scripts — a ferramenta de
          automação do Instagram (ex.: ManyChat) faz o disparo.
        </p>
        <Button size="sm" variant="outline" onClick={() => void importarPadrao()}>Importar os 5 gatilhos padrão</Button>
      </Section>

      <Section title="✚ Novo gatilho">
        <Input placeholder="Palavra (ex.: MCE)" value={palavra} onChange={(e) => setPalavra(e.target.value.toUpperCase())} />
        <Textarea rows={4} placeholder="Mensagem da DM" value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        <Button onClick={() => void adicionar(palavra, mensagem)} className="gap-2" style={{ background: ACCENT }}>
          <Plus className="w-4 h-4" /> Adicionar gatilho
        </Button>
      </Section>

      {carregando ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Carregando…</p>
      ) : (
        triggers.map((t) => (
          <Section
            key={t.id}
            title={`Palavra: ${t.palavra}`}
            right={
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" className="h-7" onClick={() => copyText(t.mensagem)}>Copiar</Button>
                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => void removerTrigger(t.id).then(carregar)}>
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            }
          >
            <p className="text-sm whitespace-pre-wrap">{t.mensagem}</p>
          </Section>
        ))
      )}

      <Section title="📣 CTAs de palavra-chave pra usar nas legendas">
        <div className="space-y-1">
          {CTA_PALAVRAS_CHAVE.map((c) => (
            <button key={c} type="button" onClick={() => copyText(c)} className="block w-full text-left text-sm rounded-md border px-3 py-2 hover:bg-white/5" style={{ borderColor: "#ffffff12" }}>
              {c}
            </button>
          ))}
        </div>
      </Section>
    </div>
  );
}
