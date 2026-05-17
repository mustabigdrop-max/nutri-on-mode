// ───────────────────────────────────────────────────────────────────────────────
// Blocos UI aditivos para PlanoAlimentarIA (não remove nada do existente).
// ───────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  Trophy, Activity, Stethoscope, BadgeCheck, BookMarked,
  Zap as ZapIcon, FileOutput, ChevronDown, ChevronRight, X, Plus, Trash2, AlertTriangle,
} from "lucide-react";
import {
  CATEGORIAS_ESPORTE, CONDICOES_CLINICAS_GROUPS, ESTRATEGIAS_RECUPERACAO,
  TIPOS_INTRA_TREINO, NIVEIS_ESTRESSE, IDIOMAS_PDF, FORMATOS_MEDIDA,
  NIVEIS_DETALHE, ITENS_INCLUIR_PDF, ESPECIALIDADES_PROFISSIONAL,
  type IdentidadeProfissional, type IntraTreinoCfg,
  type PdfCfg, type RecuperacaoCfg, type ModoEspecialExtras,
} from "./planoAlimentarConstants";

// Tokens (subset, alinhado ao componente principal)
const T = {
  bg2: "#0A0A12", bg3: "#020205", card: "#06060c",
  border: "#00C89622", border2: "#00C89633",
  green: "#00C896", greenBg: "#00C8960A",
  text: "#F5F0E8", muted: "#888888", muted2: "#2A2A2A",
  red: "#ff4444", amber: "#D4A732", gold: "#B8922A",
  fontMono: "'Space Mono', monospace",
};

// ─── helpers ──────────────────────────────────────────────────────────────────
const labelMono: React.CSSProperties = {
  fontFamily: T.fontMono, fontSize: 9, color: "#888888",
  textTransform: "uppercase", letterSpacing: "0.2em",
  display: "block", marginBottom: 6,
};
const inputBase: React.CSSProperties = {
  width: "100%", background: T.bg2, border: "1px solid #00C89615",
  borderRadius: 0, padding: "10px 14px", color: T.text, fontSize: 12,
  outline: "none", fontFamily: T.fontMono,
};

function ToggleHeader({
  icon, title, accent = T.gold, open, onClick, sub,
}: { icon: React.ReactNode; title: string; accent?: string; open: boolean; onClick: () => void; sub?: string }) {
  return (
    <button onClick={onClick} type="button" style={{
      width: "100%", textAlign: "left", background: "transparent", border: "none",
      cursor: "pointer", padding: 0, display: "flex", alignItems: "center", gap: 10,
    }}>
      <div style={{ width: 24, height: 2, background: accent }} />
      <span style={{ color: accent }}>{icon}</span>
      <span style={{
        fontFamily: T.fontMono, fontSize: 10, fontWeight: 700,
        color: `${accent}AA`, textTransform: "uppercase", letterSpacing: "0.22em",
      }}>{title}</span>
      {sub && <span style={{ fontSize: 10, color: T.muted, fontStyle: "italic", marginLeft: 4 }}>{sub}</span>}
      <span style={{ marginLeft: "auto", color: T.muted }}>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </span>
    </button>
  );
}

function Chip({ label, active, onClick, danger }: { label: string; active: boolean; onClick: () => void; danger?: boolean }) {
  const c = danger ? T.red : T.green;
  return (
    <button onClick={onClick} type="button" style={{
      padding: "6px 12px", borderRadius: 16, fontSize: 11, fontFamily: "inherit", cursor: "pointer",
      border: `1px solid ${active ? c : T.border2}`,
      background: active ? `${c}15` : T.bg3,
      color: active ? c : T.muted, fontWeight: active ? 600 : 400, transition: "all .15s",
    }}>{active ? "✓ " : ""}{label}</button>
  );
}

function SectionBox({ accent = T.gold, children }: { accent?: string; children: React.ReactNode }) {
  return (
    <div style={{
      marginBottom: 16, padding: "16px 20px",
      background: "rgba(184,146,42,0.02)",
      borderLeft: `2px solid ${accent}55`,
    }}>{children}</div>
  );
}

// ─── BLOCO 5 — IDENTIDADE DO PROFISSIONAL ─────────────────────────────────────
export function BlocoIdentidade({
  value, onChange,
}: { value: IdentidadeProfissional; onChange: (v: IdentidadeProfissional) => void }) {
  const [open, setOpen] = useState(false);
  const upd = (k: keyof IdentidadeProfissional, v: any) => onChange({ ...value, [k]: v });
  return (
    <SectionBox accent={T.gold}>
      <ToggleHeader icon={<BadgeCheck size={12} strokeWidth={2} />} title="Identidade do profissional" open={open} onClick={() => setOpen(o => !o)} sub="(exibida no plano gerado)" />
      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 12 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelMono}>Nome profissional</label>
              <input style={inputBase} placeholder="Dr. / Dra. / Coach / Nutri..." value={value.nome} onChange={e => upd("nome", e.target.value)} />
            </div>
            <div>
              <label style={labelMono}>Registro profissional</label>
              <input style={inputBase} placeholder="CRN-X 00000 / CREF 000000..." value={value.registro} onChange={e => upd("registro", e.target.value)} />
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelMono}>Especialidade</label>
              <select style={{ ...inputBase, appearance: "none" }} value={value.especialidade} onChange={e => upd("especialidade", e.target.value)}>
                {ESPECIALIDADES_PROFISSIONAL.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelMono}>Consultório / Empresa</label>
              <input style={inputBase} placeholder="Nome do consultório ou empresa..." value={value.consultorio} onChange={e => upd("consultorio", e.target.value)} />
            </div>
          </div>
          <div>
            <label style={labelMono}>Cidade / País</label>
            <input style={inputBase} placeholder="Ex: São Paulo / Brasil" value={value.cidade} onChange={e => upd("cidade", e.target.value)} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 4 }}>
            <button type="button" onClick={() => upd("exibirNoPdf", !value.exibirNoPdf)} style={{
              width: 44, height: 22, borderRadius: 999, position: "relative",
              background: value.exibirNoPdf ? T.gold : T.bg3,
              border: `1px solid ${value.exibirNoPdf ? T.gold : T.border2}`,
              cursor: "pointer", padding: 0,
            }}>
              <div style={{
                width: 16, height: 16, borderRadius: "50%",
                background: value.exibirNoPdf ? "#0a0f0a" : T.muted,
                position: "absolute", top: 2, left: value.exibirNoPdf ? 24 : 2,
              }} />
            </button>
            <span style={{ fontSize: 11, color: T.muted }}>Exibir no PDF gerado (assinatura + registro)</span>
          </div>
          <div style={{ fontSize: 10, color: T.muted2, fontStyle: "italic" }}>
            Os dados são salvos localmente neste dispositivo e pré-preenchidos nas próximas sessões.
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 6 — TEMPLATES SALVOS ───────────────────────────────────────────────
export type CoachTemplate = { id: string; nome: string; criadoEm: string; snapshot: any };
export function BlocoTemplates({
  templates, onApply, onSaveNew, onDelete,
}: {
  templates: CoachTemplate[];
  onApply: (t: CoachTemplate) => void;
  onSaveNew: (nome: string) => void;
  onDelete: (id: string) => void;
}) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [nome, setNome] = useState("");
  const limitReached = templates.length >= 10;
  return (
    <SectionBox accent={T.gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 24, height: 2, background: T.gold }} />
        <BookMarked size={12} strokeWidth={2} color={T.gold} />
        <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 700, color: `${T.gold}AA`, textTransform: "uppercase", letterSpacing: "0.22em" }}>
          Meus templates
        </span>
        <span style={{ marginLeft: "auto", fontSize: 10, color: T.muted2 }}>{templates.length}/10</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <button
          type="button"
          onClick={() => { if (!limitReached) setShowSaveModal(true); }}
          disabled={limitReached}
          style={{
            padding: "6px 12px", borderRadius: 2, fontSize: 11, cursor: limitReached ? "not-allowed" : "pointer",
            border: `1px dashed ${T.gold}55`, background: "transparent",
            color: limitReached ? T.muted2 : T.gold, fontFamily: T.fontMono,
            display: "inline-flex", alignItems: "center", gap: 6, letterSpacing: "0.1em", textTransform: "uppercase",
          }}>
          <Plus size={11} /> Novo template
        </button>
        {templates.map(t => (
          <div key={t.id} style={{
            display: "inline-flex", alignItems: "center", gap: 6,
            padding: "6px 6px 6px 12px", borderRadius: 2, fontSize: 11,
            border: `1px solid ${T.gold}33`, color: `${T.gold}DD`, background: "#B8922A05",
            fontFamily: T.fontMono, letterSpacing: "0.06em",
          }}>
            <button type="button" onClick={() => onApply(t)} style={{
              background: "transparent", border: "none", color: "inherit", cursor: "pointer", padding: 0, fontFamily: "inherit", fontSize: 11,
            }}>{t.nome}</button>
            <button type="button" onClick={() => onDelete(t.id)} title="Deletar" style={{
              background: "transparent", border: "none", color: T.muted, cursor: "pointer", padding: "2px 4px",
            }}><X size={12} /></button>
          </div>
        ))}
      </div>

      {showSaveModal && (
        <div onClick={() => setShowSaveModal(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div onClick={e => e.stopPropagation()} style={{ background: T.bg2, border: `1px solid ${T.gold}55`, padding: 20, maxWidth: 420, width: "100%" }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text, marginBottom: 14, fontFamily: T.fontMono, letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Salvar template
            </div>
            <label style={labelMono}>Nome do template</label>
            <input autoFocus style={inputBase} placeholder="Ex: Hipertrofia masculino 80kg" value={nome} onChange={e => setNome(e.target.value)} />
            <div style={{ display: "flex", gap: 8, marginTop: 14, justifyContent: "flex-end" }}>
              <button type="button" onClick={() => setShowSaveModal(false)} style={{ padding: "8px 14px", background: T.bg3, border: `1px solid ${T.border2}`, color: T.muted, fontSize: 11, cursor: "pointer", fontFamily: T.fontMono, letterSpacing: "0.1em", textTransform: "uppercase" }}>
                Cancelar
              </button>
              <button type="button" disabled={!nome.trim()} onClick={() => { onSaveNew(nome.trim()); setNome(""); setShowSaveModal(false); }} style={{
                padding: "8px 14px", background: T.gold, border: `1px solid ${T.gold}`, color: "#0a0a12",
                fontSize: 11, cursor: nome.trim() ? "pointer" : "not-allowed", fontFamily: T.fontMono, fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase", opacity: nome.trim() ? 1 : 0.5,
              }}>Salvar</button>
            </div>
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 1 — CATEGORIA DE ESPORTE + PROTOCOLO ───────────────────────────────
export function BlocoCategoriaEsporte({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const all = CATEGORIAS_ESPORTE.flatMap(g => g.options);
  const selected = all.find(o => o.v === value);
  return (
    <SectionBox accent={T.gold}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <div style={{ width: 24, height: 2, background: T.gold }} />
        <Trophy size={12} strokeWidth={2} color={T.gold} />
        <span style={{ fontFamily: T.fontMono, fontSize: 10, fontWeight: 700, color: `${T.gold}AA`, textTransform: "uppercase", letterSpacing: "0.22em" }}>
          Categoria de esporte
        </span>
      </div>
      <select
        style={{ ...inputBase, appearance: "none", marginBottom: selected?.protocolo ? 14 : 0 }}
        value={value} onChange={e => onChange(e.target.value)}
      >
        <option value="">— Selecionar esporte / modalidade específica —</option>
        {CATEGORIAS_ESPORTE.map(g => (
          <optgroup key={g.grupo} label={g.grupo}>
            {g.options.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
          </optgroup>
        ))}
      </select>
      {selected?.protocolo && (
        <div style={{ padding: "12px 14px", background: "linear-gradient(135deg, #B8922A10, transparent)", border: `1px solid ${T.gold}33` }}>
          <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8, fontWeight: 700 }}>
            Protocolo específico do esporte · {selected.l}
          </div>
          <div style={{ fontSize: 12, color: T.text, lineHeight: 1.6, marginBottom: 10 }}>{selected.protocolo.texto}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {selected.protocolo.tags.map(tg => (
              <span key={tg} style={{
                fontFamily: T.fontMono, fontSize: 9, padding: "3px 8px", borderRadius: 2,
                background: "#B8922A1A", color: T.gold, border: `1px solid ${T.gold}33`,
                letterSpacing: ".08em", textTransform: "uppercase",
              }}>{tg}</span>
            ))}
          </div>
        </div>
      )}
      {value === "ginastica_ritmica" && (
        <div style={{
          marginTop: 12,
          padding: "10px 12px",
          border: "1px solid #ff444422",
          background: "#ff44440A",
          display: "flex",
          alignItems: "flex-start",
          gap: 8,
        }}>
          <AlertTriangle size={14} color={T.red} style={{ marginTop: 1, flexShrink: 0 }} />
          <span style={{
            fontFamily: T.fontMono, fontSize: 7, color: T.red,
            textTransform: "uppercase", letterSpacing: "0.18em", lineHeight: 1.6,
          }}>
            ATENÇÃO: Ginástica Rítmica tem alto risco de RED-S, amenorreia e transtornos alimentares. A IA aplicará protocolo de proteção energética mínima de 45kcal/kg de massa magra.
          </span>
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 3 — PROTOCOLO DE RECUPERAÇÃO ───────────────────────────────────────
export function BlocoRecuperacao({
  value, onChange,
}: { value: RecuperacaoCfg; onChange: (v: RecuperacaoCfg) => void }) {
  const [open, setOpen] = useState(false);
  const upd = (k: keyof RecuperacaoCfg, v: any) => onChange({ ...value, [k]: v });
  const toggleEst = (s: string) => {
    const cur = value.estrategias || [];
    upd("estrategias", cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
  };
  return (
    <SectionBox accent={T.gold}>
      <ToggleHeader icon={<Activity size={12} strokeWidth={2} />} title="Protocolo de recuperação" open={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <div>
            <label style={labelMono}>Nível de estresse</label>
            <select style={{ ...inputBase, appearance: "none" }} value={value.nivelEstresse} onChange={e => upd("nivelEstresse", e.target.value)}>
              {NIVEIS_ESTRESSE.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
            </select>
          </div>
          <div>
            <label style={labelMono}>Estratégia de recuperação</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ESTRATEGIAS_RECUPERACAO.map(s => (
                <Chip key={s} label={s} active={value.estrategias.includes(s)} onClick={() => toggleEst(s)} />
              ))}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => upd("hrvMonitorado", !value.hrvMonitorado)} style={{
              width: 44, height: 22, borderRadius: 999, position: "relative",
              background: value.hrvMonitorado ? T.green : T.bg3,
              border: `1px solid ${value.hrvMonitorado ? T.green : T.border2}`,
              cursor: "pointer", padding: 0,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: value.hrvMonitorado ? "#0a0f0a" : T.muted, position: "absolute", top: 2, left: value.hrvMonitorado ? 24 : 2 }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>HRV monitorado</span>
            {value.hrvMonitorado && (
              <input
                type="number" style={{ ...inputBase, width: 200, marginLeft: 8 }}
                placeholder="HRV médio últimos 7d (ms)"
                value={value.hrvMedio} onChange={e => upd("hrvMedio", e.target.value)}
              />
            )}
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: value.lesaoAtiva ? 10 : 0 }}>
              <button type="button" onClick={() => upd("lesaoAtiva", !value.lesaoAtiva)} style={{
                width: 44, height: 22, borderRadius: 999, position: "relative",
                background: value.lesaoAtiva ? T.red : T.bg3,
                border: `1px solid ${value.lesaoAtiva ? T.red : T.border2}`,
                cursor: "pointer", padding: 0,
              }}>
                <div style={{ width: 16, height: 16, borderRadius: "50%", background: value.lesaoAtiva ? "#0a0f0a" : T.muted, position: "absolute", top: 2, left: value.lesaoAtiva ? 24 : 2 }} />
              </button>
              <span style={{ fontSize: 12, color: T.muted }}>Lesão ativa</span>
            </div>
            {value.lesaoAtiva && (
              <textarea
                style={{ ...inputBase, minHeight: 80, resize: "vertical" }}
                placeholder="Descreva a lesão e restrições atuais..."
                value={value.lesaoDesc} onChange={e => upd("lesaoDesc", e.target.value)}
              />
            )}
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 7 — NUTRIÇÃO INTRA-TREINO ──────────────────────────────────────────
export function BlocoIntraTreino({
  value, onChange,
}: { value: IntraTreinoCfg; onChange: (v: IntraTreinoCfg) => void }) {
  const [open, setOpen] = useState(false);
  const upd = (k: keyof IntraTreinoCfg, v: any) => onChange({ ...value, [k]: v });
  const toggleTipo = (s: string) => {
    const cur = value.tipos || [];
    upd("tipos", cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
  };
  return (
    <SectionBox accent={T.gold}>
      <ToggleHeader icon={<ZapIcon size={12} strokeWidth={2} />} title="Nutrição intra-treino" open={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button type="button" onClick={() => upd("ativo", !value.ativo)} style={{
              width: 44, height: 22, borderRadius: 999, position: "relative",
              background: value.ativo ? T.green : T.bg3,
              border: `1px solid ${value.ativo ? T.green : T.border2}`,
              cursor: "pointer", padding: 0,
            }}>
              <div style={{ width: 16, height: 16, borderRadius: "50%", background: value.ativo ? "#0a0f0a" : T.muted, position: "absolute", top: 2, left: value.ativo ? 24 : 2 }} />
            </button>
            <span style={{ fontSize: 12, color: T.muted }}>Usa nutrição intra-treino</span>
          </div>
          {value.ativo && (
            <>
              <div>
                <label style={labelMono}>Tipo de intra</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {TIPOS_INTRA_TREINO.map(s => (
                    <Chip key={s} label={s} active={value.tipos.includes(s)} onClick={() => toggleTipo(s)} />
                  ))}
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={labelMono}>CHO intra (g/hora)</label>
                  <input type="number" style={inputBase} placeholder="ex: 60" value={value.choHora} onChange={e => upd("choHora", e.target.value)} />
                </div>
                <div>
                  <label style={labelMono}>Sódio intra (mg/litro)</label>
                  <input type="number" style={inputBase} placeholder="ex: 800" value={value.sodioLitro} onChange={e => upd("sodioLitro", e.target.value)} />
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 4 — CONDIÇÕES CLÍNICAS ─────────────────────────────────────────────
export function BlocoCondicoesClinicas({
  value, onChange,
}: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (s: string) => onChange(value.includes(s) ? value.filter(x => x !== s) : [...value, s]);
  return (
    <SectionBox accent={T.gold}>
      <ToggleHeader icon={<Stethoscope size={12} strokeWidth={2} />} title="Condições clínicas" open={open} onClick={() => setOpen(o => !o)} sub={value.length ? `(${value.length} selecionada${value.length > 1 ? "s" : ""})` : ""} />
      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          {CONDICOES_CLINICAS_GROUPS.map(g => (
            <div key={g.grupo}>
              <div style={{ fontFamily: T.fontMono, fontSize: 9, color: T.muted, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 8 }}>
                {g.grupo}
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {g.itens.map(it => <Chip key={it} label={it} active={value.includes(it)} onClick={() => toggle(it)} danger />)}
              </div>
            </div>
          ))}
          {value.length > 0 && (
            <div style={{
              padding: "10px 12px", border: `1px solid ${T.red}22`, background: `${T.red}0A`,
              color: T.red, fontFamily: T.fontMono, fontSize: 9, letterSpacing: ".06em",
              display: "flex", alignItems: "center", gap: 8,
            }}>
              <AlertTriangle size={12} />
              ATENÇÃO: condições selecionadas requerem ajustes específicos — a IA aplicará restrições adequadas.
            </div>
          )}
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 8 — CONFIGURAÇÃO DO PDF ────────────────────────────────────────────
export function BlocoPdfConfig({
  value, onChange,
}: { value: PdfCfg; onChange: (v: PdfCfg) => void }) {
  const [open, setOpen] = useState(false);
  const upd = (k: keyof PdfCfg, v: any) => onChange({ ...value, [k]: v });
  const toggleItem = (s: string) => {
    const cur = value.incluir || [];
    upd("incluir", cur.includes(s) ? cur.filter(x => x !== s) : [...cur, s]);
  };
  return (
    <SectionBox accent={T.gold}>
      <ToggleHeader icon={<FileOutput size={12} strokeWidth={2} />} title="Configuração do plano gerado" open={open} onClick={() => setOpen(o => !o)} />
      {open && (
        <div style={{ marginTop: 14, display: "grid", gap: 14 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label style={labelMono}>Idioma</label>
              <select style={{ ...inputBase, appearance: "none" }} value={value.idioma} onChange={e => upd("idioma", e.target.value)}>
                {IDIOMAS_PDF.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelMono}>Formato</label>
              <select style={{ ...inputBase, appearance: "none" }} value={value.formato} onChange={e => upd("formato", e.target.value)}>
                {FORMATOS_MEDIDA.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
            <div>
              <label style={labelMono}>Nível de detalhe</label>
              <select style={{ ...inputBase, appearance: "none" }} value={value.detalhe} onChange={e => upd("detalhe", e.target.value)}>
                {NIVEIS_DETALHE.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label style={labelMono}>Incluir no plano</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {ITENS_INCLUIR_PDF.map(s => <Chip key={s} label={s} active={value.incluir.includes(s)} onClick={() => toggleItem(s)} />)}
            </div>
          </div>
        </div>
      )}
    </SectionBox>
  );
}

// ─── BLOCO 2 — MODO ESPECIAL: campos extras condicionais ─────────────────────
export function BlocoModoEspecialExtras({
  modo, value, onChange,
}: { modo: string; value: ModoEspecialExtras; onChange: (v: ModoEspecialExtras) => void }) {
  const upd = (k: keyof ModoEspecialExtras, v: any) => onChange({ ...value, [k]: v });
  if (!["combate", "endurance_pre", "peak_strength", "feminino_hormonal"].includes(modo)) return null;
  return (
    <div style={{ marginTop: 14, padding: 14, borderRadius: 8, background: T.bg3, border: `1px solid ${T.gold}33` }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
        Campos adicionais · {modo}
      </div>
      {modo === "combate" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          <div><label style={labelMono}>Peso atual (kg)</label><input type="number" style={inputBase} value={value.pesoAtual || ""} onChange={e => upd("pesoAtual", e.target.value)} /></div>
          <div><label style={labelMono}>Categoria alvo (kg)</label><input type="number" style={inputBase} value={value.categoriaAlvo || ""} onChange={e => upd("categoriaAlvo", e.target.value)} /></div>
          <div><label style={labelMono}>Dias até pesagem</label><input type="number" style={inputBase} value={value.diasPesagem || ""} onChange={e => upd("diasPesagem", e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label style={labelMono}>Protocolo de corte</label>
            <select style={{ ...inputBase, appearance: "none" }} value={value.protocoloCorte || "combinado"} onChange={e => upd("protocoloCorte", e.target.value as any)}>
              <option value="desidratacao">Desidratação controlada</option>
              <option value="restricao_cho">Restrição de carboidrato</option>
              <option value="combinado">Combinado</option>
            </select>
          </div>
          <div><label style={labelMono}>Horas entre pesagem e luta</label><input type="number" style={inputBase} value={value.horasPesagemLuta || ""} onChange={e => upd("horasPesagemLuta", e.target.value)} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!value.reidratacao} onChange={e => upd("reidratacao", e.target.checked)} />
            <span style={{ fontSize: 11, color: T.muted }}>Reidratação pós-pesagem</span>
          </div>
        </div>
      )}
      {modo === "endurance_pre" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelMono}>Distância da prova</label><input style={inputBase} placeholder="ex: 42k" value={value.distanciaProva || ""} onChange={e => upd("distanciaProva", e.target.value)} /></div>
          <div><label style={labelMono}>Data da prova</label><input type="date" style={inputBase} value={value.dataProva || ""} onChange={e => upd("dataProva", e.target.value)} /></div>
          <div>
            <label style={labelMono}>Carb loading</label>
            <select style={{ ...inputBase, appearance: "none" }} value={value.carbLoading || "48h"} onChange={e => upd("carbLoading", e.target.value as any)}>
              <option value="24h">24h</option><option value="48h">48h</option><option value="72h">72h</option>
            </select>
          </div>
          <div>
            <label style={labelMono}>Tipo intra-prova</label>
            <select style={{ ...inputBase, appearance: "none" }} value={value.tipoIntra || "mix"} onChange={e => upd("tipoIntra", e.target.value as any)}>
              <option value="geis">Géis</option><option value="banana">Banana</option>
              <option value="tamara">Tâmara</option><option value="mix">Mix</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!value.nutricaoIntra} onChange={e => upd("nutricaoIntra", e.target.checked)} />
            <span style={{ fontSize: 11, color: T.muted }}>Nutrição intra-prova</span>
          </div>
        </div>
      )}
      {modo === "peak_strength" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div><label style={labelMono}>Categorias de peso</label><input style={inputBase} value={value.categoriasPeso || ""} onChange={e => upd("categoriasPeso", e.target.value)} /></div>
          <div><label style={labelMono}>Nº tentativas no dia</label><input type="number" style={inputBase} value={value.numTentativas || ""} onChange={e => upd("numTentativas", e.target.value)} /></div>
          <div><label style={labelMono}>Horário das provas</label><input style={inputBase} placeholder="ex: 09:00 / 13:00" value={value.horarioProvas || ""} onChange={e => upd("horarioProvas", e.target.value)} /></div>
          <div><label style={labelMono}>Alimentação entre provas</label><input style={inputBase} value={value.alimentacaoEntre || ""} onChange={e => upd("alimentacaoEntre", e.target.value)} /></div>
        </div>
      )}
      {modo === "feminino_hormonal" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <div>
            <label style={labelMono}>Fase do ciclo</label>
            <select style={{ ...inputBase, appearance: "none" }} value={value.faseCicloExt || "folicular"} onChange={e => upd("faseCicloExt", e.target.value as any)}>
              <option value="menstrual">Menstrual</option><option value="folicular">Folicular</option>
              <option value="ovulatoria">Ovulatória</option><option value="lutea">Lútea</option>
            </select>
          </div>
          <div><label style={labelMono}>Sintomas predominantes</label><input style={inputBase} value={value.sintomas || ""} onChange={e => upd("sintomas", e.target.value)} /></div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!value.contraceptivo} onChange={e => upd("contraceptivo", e.target.checked)} />
            <span style={{ fontSize: 11, color: T.muted }}>Usa contraceptivo</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="checkbox" checked={!!value.menopausa} onChange={e => upd("menopausa", e.target.checked)} />
            <span style={{ fontSize: 11, color: T.muted }}>Em menopausa</span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── BLOCO 9 — COMPARATIVO DE PLANOS (histórico) ──────────────────────────────
function extractKcal(p: any): number {
  if (!p) return 0;
  const r = p?.resumo || p?.plano?.resumo;
  if (!r) return 0;
  const k = r.calorias_totais ?? r.calorias ?? r.kcal ?? r.kcal_total ?? 0;
  return Number(k) || 0;
}
function extractMacros(p: any): { p: number; c: number; g: number } {
  const r = p?.resumo || p?.plano?.resumo || {};
  const macros = r.macros || r;
  return {
    p: Number(macros.proteina ?? macros.p ?? 0) || 0,
    c: Number(macros.carboidrato ?? macros.c ?? 0) || 0,
    g: Number(macros.gordura ?? macros.g ?? 0) || 0,
  };
}
function extractFase(p: any): string {
  return p?.fase_periodizacao || p?.plano?.fase_periodizacao || p?.fasePeriodizacao || "—";
}
function delta(a: number, b: number) {
  const d = b - a;
  const pct = a > 0 ? (d / a) * 100 : 0;
  return { d, pct };
}
function DeltaPill({ a, b, unit = "" }: { a: number; b: number; unit?: string }) {
  const { d, pct } = delta(a, b);
  if (d === 0) return <span style={{ fontSize: 10, color: T.muted }}>—</span>;
  const c = d > 0 ? "#00C896" : "#ff4444";
  return (
    <span style={{ fontSize: 10, color: c, fontWeight: 700 }}>
      {d > 0 ? "▲" : "▼"} {Math.abs(d).toFixed(0)}{unit} ({pct > 0 ? "+" : ""}{pct.toFixed(1)}%)
    </span>
  );
}

export function BlocoComparativoHistorico({
  history,
}: { history: any[] }) {
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  if (!history || history.length < 2) return null;
  const planoA = history.find(h => h.id === a);
  const planoB = history.find(h => h.id === b);
  return (
    <div style={{ marginTop: 16, padding: 14, border: `1px solid ${T.gold}33`, background: "#B8922A05" }}>
      <div style={{ fontFamily: T.fontMono, fontSize: 10, color: T.gold, letterSpacing: ".18em", textTransform: "uppercase", marginBottom: 12, fontWeight: 700 }}>
        Comparativo de evolução
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        <select style={{ ...inputBase, appearance: "none" }} value={a} onChange={e => setA(e.target.value)}>
          <option value="">— Plano anterior —</option>
          {history.map(h => <option key={h.id} value={h.id}>{(h.patient_name || "?")} · {new Date(h.created_at).toLocaleDateString("pt-BR")}</option>)}
        </select>
        <select style={{ ...inputBase, appearance: "none" }} value={b} onChange={e => setB(e.target.value)}>
          <option value="">— Plano atual —</option>
          {history.map(h => <option key={h.id} value={h.id}>{(h.patient_name || "?")} · {new Date(h.created_at).toLocaleDateString("pt-BR")}</option>)}
        </select>
      </div>
      {planoA && planoB && (() => {
        const ka = extractKcal(planoA.plano), kb = extractKcal(planoB.plano);
        const ma = extractMacros(planoA.plano), mb = extractMacros(planoB.plano);
        const row = (label: string, va: any, vb: any, deltaNode?: React.ReactNode) => (
          <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}`, fontSize: 11 }}>
            <span style={{ color: T.muted, fontFamily: T.fontMono, fontSize: 9, textTransform: "uppercase", letterSpacing: ".12em" }}>{label}</span>
            <span style={{ color: T.text }}>{va}</span>
            <span style={{ color: T.text }}>{vb}</span>
            <span>{deltaNode}</span>
          </div>
        );
        return (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "120px 1fr 1fr 140px", gap: 10, fontSize: 9, color: T.muted, fontFamily: T.fontMono, textTransform: "uppercase", letterSpacing: ".15em", paddingBottom: 6, borderBottom: `1px solid ${T.gold}33`, marginBottom: 4 }}>
              <span>Métrica</span><span>Anterior</span><span>Atual</span><span>Δ</span>
            </div>
            {row("kcal", `${ka}`, `${kb}`, <DeltaPill a={ka} b={kb} unit=" kcal" />)}
            {row("Proteína", `${ma.p}g`, `${mb.p}g`, <DeltaPill a={ma.p} b={mb.p} unit="g" />)}
            {row("Carbo", `${ma.c}g`, `${mb.c}g`, <DeltaPill a={ma.c} b={mb.c} unit="g" />)}
            {row("Gordura", `${ma.g}g`, `${mb.g}g`, <DeltaPill a={ma.g} b={mb.g} unit="g" />)}
            {row("Fase", extractFase(planoA.plano), extractFase(planoB.plano))}
            {row("Data", new Date(planoA.created_at).toLocaleDateString("pt-BR"), new Date(planoB.created_at).toLocaleDateString("pt-BR"))}
          </div>
        );
      })()}
    </div>
  );
}
