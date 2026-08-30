// Kit de Palestra — tracker de contatos feitos na palestra (salvo no aparelho).
import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import { ACCENT, Section } from "./socialUi";
import {
  FOLLOWUPS, FOLLOWUP_COLOR, INTERESSES, LectureContact, loadContacts, newContact, saveContacts,
} from "@/lib/lectureConversion";

const inputStyle = { borderColor: `${ACCENT}44` };
const selectStyle = { borderColor: `${ACCENT}44`, background: "#0b0b12", color: "#F5F0E8" };

const LectureNetworkingPanel = ({ tema }: { tema: string }) => {
  const [list, setList] = useState<LectureContact[]>([]);
  const [filtro, setFiltro] = useState("Todos");
  const [draft, setDraft] = useState<LectureContact>(() => newContact(tema));

  useEffect(() => { setList(loadContacts()); }, []);

  const persist = (next: LectureContact[]) => { setList(next); saveContacts(next); };

  const add = () => {
    if (!draft.nome.trim() && !draft.contato.trim()) return;
    persist([{ ...draft, tema }, ...list]);
    setDraft(newContact(tema));
  };

  const patch = (id: string, up: Partial<LectureContact>) =>
    persist(list.map((c) => (c.id === id ? { ...c, ...up } : c)));

  const remove = (id: string) => persist(list.filter((c) => c.id !== id));

  const visiveis = useMemo(
    () => (filtro === "Todos" ? list : list.filter((c) => c.status === filtro)),
    [list, filtro],
  );
  const pendentes = list.filter((c) => c.status === "Pendente").length;

  return (
    <Section title="🤝 Contatos da palestra">
      {pendentes > 0 && (
        <p className="text-xs rounded-md p-2" style={{ background: "#F59E0B18", color: "#F59E0B" }}>
          Você tem {pendentes} contato(s) sem follow-up da palestra {tema}.
        </p>
      )}

      <div className="space-y-2 rounded-lg p-3" style={{ border: `1px solid ${ACCENT}33` }}>
        <div className="grid grid-cols-2 gap-2">
          <input value={draft.nome} onChange={(e) => setDraft({ ...draft, nome: e.target.value })} placeholder="Nome" className="rounded-md p-2 text-sm bg-transparent border" style={inputStyle} />
          <input value={draft.contato} onChange={(e) => setDraft({ ...draft, contato: e.target.value })} placeholder="@instagram / contato" className="rounded-md p-2 text-sm bg-transparent border" style={inputStyle} />
          <select value={draft.interesse} onChange={(e) => setDraft({ ...draft, interesse: e.target.value })} className="rounded-md p-2 text-sm border" style={selectStyle}>
            {INTERESSES.map((i) => <option key={i} value={i}>{i}</option>)}
          </select>
          <select value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value })} className="rounded-md p-2 text-sm border" style={selectStyle}>
            {FOLLOWUPS.map((f) => <option key={f} value={f}>{f}</option>)}
          </select>
        </div>
        <input value={draft.nota} onChange={(e) => setDraft({ ...draft, nota: e.target.value })} placeholder="Nota rápida" className="w-full rounded-md p-2 text-sm bg-transparent border" style={inputStyle} />
        <button type="button" onClick={add} className="w-full py-2 rounded-md text-xs font-semibold flex items-center justify-center gap-1" style={{ background: ACCENT, color: "#020205" }}>
          <UserPlus className="w-3 h-3" /> Adicionar contato
        </button>
      </div>

      <div className="flex flex-wrap gap-1">
        {["Todos", ...FOLLOWUPS].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className="px-2.5 py-1 rounded-full text-[11px] border"
            style={{
              borderColor: filtro === f ? ACCENT : "rgba(255,255,255,0.12)",
              color: filtro === f ? ACCENT : "rgba(255,255,255,0.6)",
              background: filtro === f ? `${ACCENT}18` : "transparent",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {!visiveis.length && <p className="text-xs text-muted-foreground">Nenhum contato registrado ainda.</p>}

      <div className="space-y-2">
        {visiveis.map((c) => (
          <div key={c.id} className="rounded-lg p-3 space-y-1" style={{ border: `1px solid rgba(255,255,255,0.1)`, borderLeft: `4px solid ${FOLLOWUP_COLOR[c.status] || ACCENT}` }}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{c.nome || "Sem nome"}</p>
                <p className="text-[11px] text-muted-foreground">{c.contato} · {c.interesse}</p>
              </div>
              <button type="button" onClick={() => remove(c.id)} aria-label="Excluir contato" className="text-xs" style={{ color: "#EF4444" }}>
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
            {c.nota && <p className="text-xs text-muted-foreground">{c.nota}</p>}
            <select
              value={c.status}
              onChange={(e) => patch(c.id, { status: e.target.value })}
              className="rounded-md p-1.5 text-[11px] border"
              style={{ ...selectStyle, color: FOLLOWUP_COLOR[c.status] || "#F5F0E8" }}
            >
              {FOLLOWUPS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
        <Plus className="w-3 h-3" /> Os contatos ficam salvos neste aparelho.
      </p>
    </Section>
  );
};

export default LectureNetworkingPanel;
