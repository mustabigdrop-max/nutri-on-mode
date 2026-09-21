import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Activity, BookOpen, Dumbbell, LayoutGrid, Scale, Sparkle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { KINESIS_ATLAS, buscarExercicio } from "@/lib/kinesisAtlas";
import { KINESIS_LAB } from "@/lib/kinesisMuscleLab";
import {
  ASSIMETRIA_POR_GRUPO, MAPA_UNILATERAL, PROTOCOLO_ASSIMETRIA, prescreverAssimetria,
} from "@/lib/kinesisAsymmetry";
import { TABELA_VOLUME, prescreverVolume } from "@/lib/kinesisVolume";
import { conteudoParaMarkdown, gerarConteudoKinesis, type FonteConteudo } from "@/lib/kinesisContent";
import { BADGE_COR, FORMATO_LABEL, type DeficitKinesis, type FormatoConteudo, type NivelKinesis } from "@/lib/kinesisTypes";

const BG = "#0a0f0a";
const FG = "#f0fdf4";
const ACCENT = "#4ade80";
const MUTED = "#9ca3af";
const HEAD = { fontFamily: "'Space Grotesk', sans-serif" };

const card = { background: "rgba(255,255,255,0.03)", border: "1px solid rgba(74,222,128,0.14)" };

const Chip = ({ ativo, children, onClick }: { ativo: boolean; children: React.ReactNode; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all text-left"
    style={{
      background: ativo ? "rgba(74,222,128,0.15)" : "rgba(255,255,255,0.04)",
      border: `1px solid ${ativo ? ACCENT : "rgba(74,222,128,0.12)"}`,
      color: ativo ? ACCENT : MUTED,
    }}
  >
    {children}
  </button>
);

const Badge = ({ texto }: { texto: keyof typeof BADGE_COR }) => (
  <span
    className="text-[10px] px-2 py-0.5 rounded-full tracking-widest"
    style={{ color: BADGE_COR[texto], border: `1px solid ${BADGE_COR[texto]}55` }}
  >
    {texto}
  </span>
);

const Secao = ({ titulo, children }: { titulo: string; children: React.ReactNode }) => (
  <div className="rounded-xl p-4 space-y-2" style={card}>
    <div className="text-[10px] tracking-widest" style={{ color: ACCENT }}>{titulo}</div>
    <div className="text-sm space-y-2" style={{ color: FG }}>{children}</div>
  </div>
);

const KinesisPage = () => {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [exId, setExId] = useState(KINESIS_ATLAS[0].id);
  const [grupoLab, setGrupoLab] = useState(KINESIS_LAB[0].grupo);
  const [subIdx, setSubIdx] = useState(0);
  const [grupoAss, setGrupoAss] = useState(ASSIMETRIA_POR_GRUPO[1].grupo);
  const [lado, setLado] = useState<"D" | "E">("E");
  const [delta, setDelta] = useState(12);
  const [grupoVol, setGrupoVol] = useState(TABELA_VOLUME[1].grupo);
  const [nivel, setNivel] = useState<NivelKinesis>("intermediario");
  const [deficit, setDeficit] = useState<DeficitKinesis>("ATIVACAO");
  const [prioritario, setPrioritario] = useState(true);
  const [fonteConteudo, setFonteConteudo] = useState<FonteConteudo>({ tipo: "EXERCICIO", ref: KINESIS_ATLAS[0].id });
  const [formato, setFormato] = useState<FormatoConteudo>("CARROSSEL_EDUCATIVO");

  const ex = buscarExercicio(exId)!;
  const dossie = KINESIS_LAB.find((d) => d.grupo === grupoLab)!;
  const sub = dossie.subgrupos[Math.min(subIdx, dossie.subgrupos.length - 1)];
  const volume = prescreverVolume(grupoVol, nivel, deficit, prioritario);
  const assimetria = prescreverAssimetria(grupoAss, lado, delta, volume?.series_semana ?? 10);
  const conteudo = useMemo(() => gerarConteudoKinesis(fonteConteudo, formato), [fonteConteudo, formato]);

  const atlasFiltrado = KINESIS_ATLAS.filter(
    (e) => !busca || `${e.exercicio} ${e.grupo_primario}`.toLowerCase().includes(busca.toLowerCase()),
  );

  const copiar = async () => {
    if (!conteudo) return;
    try {
      await navigator.clipboard.writeText(conteudoParaMarkdown(conteudo));
      toast({ title: "Conteúdo copiado", description: "Cole no Social ON para a produção visual." });
    } catch {
      toast({ title: "Não foi possível copiar", variant: "destructive" });
    }
  };

  const baixar = () => {
    if (!conteudo) return;
    const blob = new Blob([conteudoParaMarkdown(conteudo)], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `kinesis-${conteudo.titulo.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="min-h-screen" style={{ background: BG, color: FG }}>
      <header className="border-b px-4 py-4" style={{ borderColor: "rgba(74,222,128,0.12)" }}>
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/coach/trainingon")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <Activity className="w-6 h-6" style={{ color: ACCENT }} />
          <div>
            <h1 className="text-xl font-bold" style={HEAD}>KINESIS</h1>
            <p className="text-xs" style={{ color: MUTED }}>
              Base de ciência do exercício — execução, subgrupos, assimetrias, volume e conteúdo
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <Tabs defaultValue="atlas">
          <TabsList className="w-full grid grid-cols-5" style={{ background: "rgba(255,255,255,0.03)" }}>
            <TabsTrigger value="atlas" className="text-[11px] gap-1"><Dumbbell className="w-3 h-3" /> Atlas</TabsTrigger>
            <TabsTrigger value="lab" className="text-[11px] gap-1"><LayoutGrid className="w-3 h-3" /> Laboratório</TabsTrigger>
            <TabsTrigger value="assimetria" className="text-[11px] gap-1"><Scale className="w-3 h-3" /> Assimetrias</TabsTrigger>
            <TabsTrigger value="volume" className="text-[11px] gap-1"><BookOpen className="w-3 h-3" /> Volume</TabsTrigger>
            <TabsTrigger value="conteudo" className="text-[11px] gap-1"><Sparkle className="w-3 h-3" /> Conteúdo</TabsTrigger>
          </TabsList>

          {/* 1 — ATLAS DE EXERCÍCIOS */}
          <TabsContent value="atlas" className="space-y-4 pt-4">
            <Input
              placeholder="Buscar exercício ou grupo..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
            />
            <div className="flex flex-wrap gap-2">
              {atlasFiltrado.map((e) => (
                <Chip key={e.id} ativo={e.id === exId} onClick={() => setExId(e.id)}>{e.exercicio}</Chip>
              ))}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="text-lg font-bold" style={{ ...HEAD, color: ACCENT }}>{ex.exercicio}</h2>
                <Button
                  size="sm"
                  style={{ background: ACCENT, color: BG }}
                  onClick={() => { setFonteConteudo({ tipo: "EXERCICIO", ref: ex.id }); toast({ title: "Selecionado no gerador de conteúdo" }); }}
                >
                  Gerar conteúdo
                </Button>
              </div>
              <p className="text-xs" style={{ color: MUTED }}>
                {ex.grupo_primario} · {ex.classificacao.tipo} · {ex.classificacao.padrao_motor} · nível mínimo {ex.classificacao.nivel_minimo}
              </p>

              <Secao titulo="ÊNFASE POR VARIAÇÃO">
                {Object.entries(ex.subgrupo_enfase).map(([k, v]) => (
                  <div key={k}>· <b>{k.replace(/_/g, " ")}</b>: {v}</div>
                ))}
              </Secao>

              <Secao titulo="EXECUÇÃO">
                <div><b>Posição inicial:</b> {ex.execucao.posicao_inicial}</div>
                <div><b>Concêntrica:</b> {ex.execucao.fase_concentrica}</div>
                <div><b>Excêntrica:</b> {ex.execucao.fase_excentrica}</div>
                <div><b>Respiração:</b> {ex.execucao.respiracao}</div>
                <div><b>Amplitude:</b> {ex.execucao.amplitude_ideal}</div>
                <div><b>Tempo:</b> padrão {ex.execucao.tempo_recomendado.padrao} · ativação {ex.execucao.tempo_recomendado.ativacao} · força {ex.execucao.tempo_recomendado.forca}</div>
              </Secao>

              <Secao titulo="CUES OBRIGATÓRIOS">
                <div>· {ex.cues_coaching.cue_primario}</div>
                <div>· {ex.cues_coaching.cue_secundario}</div>
                <div>· {ex.cues_coaching.cue_ajuste}</div>
                <div>· {ex.cues_coaching.cue_conexao_mente_musculo}</div>
              </Secao>

              <Secao titulo="ERROS COMUNS">
                {ex.erros_comuns.map((e) => (
                  <div key={e.erro} className="pb-2">
                    <div style={{ color: "#D8402E" }}>✗ {e.erro}</div>
                    <div className="text-xs" style={{ color: MUTED }}>Consequência: {e.consequencia}</div>
                    <div className="text-xs">Correção: {e.correcao}</div>
                    <div className="text-xs" style={{ color: MUTED }}>Sinal visual: {e.indicador_visual}</div>
                  </div>
                ))}
              </Secao>

              <Secao titulo="VARIAÇÕES — QUANDO USAR E QUANDO NÃO">
                {ex.variacoes_e_quando_usar.map((v) => (
                  <div key={v.variacao} className="pb-2">
                    <div style={{ color: ACCENT }}>{v.variacao}</div>
                    <div className="text-xs">{v.diferenca}</div>
                    <div className="text-xs"><b>Usar quando:</b> {v.quando}</div>
                    <div className="text-xs" style={{ color: MUTED }}><b>Evitar:</b> {v.contra}</div>
                  </div>
                ))}
              </Secao>

              <Secao titulo="PRESCRIÇÃO POR OBJETIVO">
                {Object.entries(ex.prescricao_por_objetivo).map(([obj, p]) => (
                  <div key={obj} className="text-xs">
                    <b>{obj.replace(/_/g, " ")}:</b> {p.series} séries × {p.reps} · RPE {p.rpe} · descanso {p.descanso}
                    {p.nota ? ` — ${p.nota}` : ""}
                  </div>
                ))}
              </Secao>

              <Secao titulo="ATIVAÇÃO MUSCULAR">
                <div className="flex items-center gap-2 mb-1"><Badge texto={ex.emg.badge} /></div>
                {ex.emg.ativacao.map((a) => (
                  <div key={a.musculo} className="text-xs">· {a.musculo}: {a.nivel}</div>
                ))}
                <div className="text-xs" style={{ color: MUTED }}>Fonte: {ex.emg.fonte}</div>
                {ex.emg.nota && <div className="text-xs" style={{ color: MUTED }}>{ex.emg.nota}</div>}
              </Secao>
            </div>
          </TabsContent>

          {/* 2 — LABORATÓRIO MUSCULAR */}
          <TabsContent value="lab" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {KINESIS_LAB.map((d) => (
                <Chip key={d.grupo} ativo={d.grupo === grupoLab} onClick={() => { setGrupoLab(d.grupo); setSubIdx(0); }}>
                  {d.grupo}
                </Chip>
              ))}
            </div>
            <Secao titulo="ANATOMIA">{dossie.anatomia_resumo}</Secao>
            <Secao titulo="PRINCÍPIO DE DESENVOLVIMENTO">{dossie.principio_geral}</Secao>

            <div className="flex flex-wrap gap-2">
              {dossie.subgrupos.map((s, i) => (
                <Chip key={s.subgrupo} ativo={i === subIdx} onClick={() => setSubIdx(i)}>{s.subgrupo}</Chip>
              ))}
            </div>

            <Secao titulo={sub.subgrupo.toUpperCase()}>
              <div><b>Função:</b> {sub.funcao}</div>
              <div><b>Princípio:</b> {sub.principio}</div>
              <div><b>Cue-chave:</b> {sub.cue_chave}</div>
              <div><b>Volume dedicado:</b> {sub.volume_recomendado}</div>
              {sub.erro_comum && <div><b>Erro comum:</b> {sub.erro_comum}</div>}
              {sub.nota_apex && <div style={{ color: "#EF9F27" }}><b>APEX:</b> {sub.nota_apex}</div>}
              <div className="pt-1">
                <b>Exercícios prioritários:</b>
                {sub.exercicios_prioritarios.map((e) => <div key={e} className="text-xs">· {e}</div>)}
              </div>
              <Button
                size="sm"
                className="mt-2"
                style={{ background: ACCENT, color: BG }}
                onClick={() => { setFonteConteudo({ tipo: "SUBGRUPO", grupo: dossie.grupo, subgrupo: sub.subgrupo }); toast({ title: "Selecionado no gerador de conteúdo" }); }}
              >
                Gerar conteúdo
              </Button>
            </Secao>

            {dossie.treino_exemplo && (
              <Secao titulo="TREINO EXEMPLO">
                <div className="text-xs" style={{ color: MUTED }}>{dossie.treino_exemplo.contexto}</div>
                {dossie.treino_exemplo.exercicios.map((e) => (
                  <div key={e.ordem} className="text-xs">
                    {e.ordem}. {e.exercicio} — {e.series_reps} <span style={{ color: MUTED }}>({e.nota})</span>
                  </div>
                ))}
                <div className="text-xs" style={{ color: ACCENT }}>{dossie.treino_exemplo.volume_total}</div>
                <div className="text-xs" style={{ color: MUTED }}>{dossie.treino_exemplo.nota}</div>
              </Secao>
            )}

            <Secao titulo="TEMAS DE CONTEÚDO DESTE GRUPO">
              {dossie.temas_conteudo.map((t) => <div key={t} className="text-xs">· {t}</div>)}
            </Secao>
          </TabsContent>

          {/* 3 — CORREÇÃO DE ASSIMETRIAS */}
          <TabsContent value="assimetria" className="space-y-4 pt-4">
            <Secao titulo="PROTOCOLO UNIVERSAL">
              {PROTOCOLO_ASSIMETRIA.map((f) => (
                <div key={f.fase} className="pb-2">
                  <div style={{ color: ACCENT }}>FASE {f.fase} — {f.nome}</div>
                  {f.passos.map((p) => <div key={p} className="text-xs">→ {p}</div>)}
                </div>
              ))}
            </Secao>

            <div className="flex flex-wrap gap-2">
              {ASSIMETRIA_POR_GRUPO.map((p) => (
                <Chip key={p.grupo} ativo={p.grupo === grupoAss} onClick={() => setGrupoAss(p.grupo)}>{p.grupo}</Chip>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-3" style={card}>
                <div className="text-[10px] tracking-widest" style={{ color: MUTED }}>LADO FRACO</div>
                <div className="flex gap-2 mt-2">
                  <Chip ativo={lado === "E"} onClick={() => setLado("E")}>Esquerdo</Chip>
                  <Chip ativo={lado === "D"} onClick={() => setLado("D")}>Direito</Chip>
                </div>
              </div>
              <div className="rounded-xl p-3" style={card}>
                <div className="text-[10px] tracking-widest" style={{ color: MUTED }}>DELTA ENTRE LADOS (%)</div>
                <Input
                  type="number"
                  value={delta}
                  min={0}
                  max={40}
                  onChange={(e) => setDelta(Number(e.target.value) || 0)}
                  className="mt-2"
                  style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(74,222,128,0.15)" }}
                />
              </div>
            </div>

            <Secao titulo={`PRESCRIÇÃO — ${assimetria.grupo} (${assimetria.status})`}>
              <div className="text-xs" style={{ color: MUTED }}>
                Lado {assimetria.lado_fraco} é {assimetria.delta_pct}% mais fraco · correção estimada em {assimetria.duracao_estimada}
              </div>
              {assimetria.regras.map((r) => <div key={r} className="text-xs">→ {r}</div>)}
              <div className="pt-1"><b>Exercícios:</b> {assimetria.exercicios.join(" · ")}</div>
              <div className="text-xs" style={{ color: MUTED }}>{assimetria.reavaliacao}</div>
              <Button
                size="sm"
                className="mt-2"
                style={{ background: ACCENT, color: BG }}
                onClick={() => { setFonteConteudo({ tipo: "ASSIMETRIA", grupo: grupoAss }); toast({ title: "Selecionado no gerador de conteúdo" }); }}
              >
                Gerar conteúdo
              </Button>
            </Secao>

            <Secao titulo="MAPA BILATERAL → UNILATERAL">
              {MAPA_UNILATERAL.map((m) => (
                <div key={m.bilateral} className="text-xs">{m.bilateral} → <span style={{ color: ACCENT }}>{m.unilateral}</span></div>
              ))}
            </Secao>
          </TabsContent>

          {/* 4 — PRESCRIÇÃO DE VOLUME */}
          <TabsContent value="volume" className="space-y-4 pt-4">
            <div className="flex flex-wrap gap-2">
              {TABELA_VOLUME.map((t) => (
                <Chip key={t.grupo} ativo={t.grupo === grupoVol} onClick={() => setGrupoVol(t.grupo)}>{t.grupo}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["iniciante", "intermediario", "avancado"] as NivelKinesis[]).map((n) => (
                <Chip key={n} ativo={n === nivel} onClick={() => setNivel(n)}>{n}</Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {(["MANUTENCAO", "ATIVACAO", "VOLUME", "BIOMECANICO", "ESTETICO", "ASSIMETRIA"] as DeficitKinesis[]).map((d) => (
                <Chip key={d} ativo={d === deficit} onClick={() => setDeficit(d)}>{d}</Chip>
              ))}
            </div>
            <Chip ativo={prioritario} onClick={() => setPrioritario((v) => !v)}>
              {prioritario ? "Grupo prioritário" : "Grupo em manutenção"}
            </Chip>

            {volume ? (
              <Secao titulo="PRESCRIÇÃO">
                <div className="text-2xl font-bold" style={{ ...HEAD, color: ACCENT }}>{volume.series_semana} séries/semana</div>
                <div className="text-xs" style={{ color: MUTED }}>
                  Faixa do nível: MEV {volume.faixa.mev} → MRV {volume.faixa.mrv}
                </div>
                <div className="text-xs">Regra aplicada: {volume.regra}</div>
                <div className="text-xs">
                  Distribuição: {volume.sessoes_sugeridas} sessão(ões) · {volume.series_por_sessao} séries por sessão (máx. 10)
                </div>
                <div className="text-xs">{volume.frequencia_nota}</div>
                {volume.tecnica_obrigatoria && (
                  <div className="text-xs" style={{ color: "#EF9F27" }}>Técnica obrigatória: {volume.tecnica_obrigatoria}</div>
                )}
              </Secao>
            ) : null}

            <Secao titulo="TABELA MEV → MRV (SÉRIES EFETIVAS/SEMANA)">
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ color: MUTED }}>
                      <th className="text-left py-1">Grupo</th>
                      <th className="text-left py-1">Iniciante</th>
                      <th className="text-left py-1">Intermediário</th>
                      <th className="text-left py-1">Avançado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {TABELA_VOLUME.map((t) => (
                      <tr key={t.grupo} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                        <td className="py-1">{t.grupo}</td>
                        <td className="py-1">{t.faixas.iniciante.mev} → {t.faixas.iniciante.mrv}</td>
                        <td className="py-1">{t.faixas.intermediario.mev} → {t.faixas.intermediario.mrv}</td>
                        <td className="py-1">{t.faixas.avancado.mev} → {t.faixas.avancado.mrv}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Secao>
          </TabsContent>

          {/* 5 — GERADOR DE CONTEÚDO */}
          <TabsContent value="conteudo" className="space-y-4 pt-4">
            <Secao titulo="1. DE ONDE VEM O CONTEÚDO">
              <div className="flex flex-wrap gap-2">
                <Chip ativo={fonteConteudo.tipo === "EXERCICIO"} onClick={() => setFonteConteudo({ tipo: "EXERCICIO", ref: exId })}>
                  Exercício do Atlas
                </Chip>
                <Chip
                  ativo={fonteConteudo.tipo === "SUBGRUPO"}
                  onClick={() => setFonteConteudo({ tipo: "SUBGRUPO", grupo: dossie.grupo, subgrupo: dossie.subgrupos[0].subgrupo })}
                >
                  Subgrupo do Laboratório
                </Chip>
                <Chip ativo={fonteConteudo.tipo === "ASSIMETRIA"} onClick={() => setFonteConteudo({ tipo: "ASSIMETRIA", grupo: grupoAss })}>
                  Protocolo de assimetria
                </Chip>
              </div>

              {fonteConteudo.tipo === "EXERCICIO" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {KINESIS_ATLAS.map((e) => (
                    <Chip
                      key={e.id}
                      ativo={fonteConteudo.ref === e.id}
                      onClick={() => setFonteConteudo({ tipo: "EXERCICIO", ref: e.id })}
                    >
                      {e.exercicio}
                    </Chip>
                  ))}
                </div>
              )}

              {fonteConteudo.tipo === "SUBGRUPO" && (
                <div className="space-y-2 pt-1">
                  <div className="flex flex-wrap gap-2">
                    {KINESIS_LAB.map((d) => (
                      <Chip
                        key={d.grupo}
                        ativo={fonteConteudo.grupo === d.grupo}
                        onClick={() => setFonteConteudo({ tipo: "SUBGRUPO", grupo: d.grupo, subgrupo: d.subgrupos[0].subgrupo })}
                      >
                        {d.grupo}
                      </Chip>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(KINESIS_LAB.find((d) => d.grupo === fonteConteudo.grupo)?.subgrupos ?? []).map((s) => (
                      <Chip
                        key={s.subgrupo}
                        ativo={fonteConteudo.subgrupo === s.subgrupo}
                        onClick={() => setFonteConteudo({ tipo: "SUBGRUPO", grupo: fonteConteudo.grupo, subgrupo: s.subgrupo })}
                      >
                        {s.nome}
                      </Chip>
                    ))}
                  </div>
                </div>
              )}

              {fonteConteudo.tipo === "ASSIMETRIA" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {ASSIMETRIA_POR_GRUPO.map((a) => (
                    <Chip
                      key={a.grupo}
                      ativo={fonteConteudo.grupo === a.grupo}
                      onClick={() => setFonteConteudo({ tipo: "ASSIMETRIA", grupo: a.grupo })}
                    >
                      {a.grupo}
                    </Chip>
                  ))}
                </div>
              )}
            </Secao>

            <Secao titulo="2. FORMATO">
              <div className="flex flex-wrap gap-2">
                {(Object.keys(FORMATO_LABEL) as FormatoConteudo[]).map((f) => (
                  <Chip key={f} ativo={f === formato} onClick={() => setFormato(f)}>{FORMATO_LABEL[f]}</Chip>
                ))}
              </div>
              <div className="pt-2 text-xs" style={{ color: MUTED }}>
                {conteudo ? conteudo.titulo : "Sem material cadastrado para esta combinação."}
              </div>
            </Secao>

            {conteudo && (
              <>
                <div className="flex gap-2">
                  <Button size="sm" style={{ background: ACCENT, color: BG }} onClick={copiar}>Copiar para o Social ON</Button>
                  <Button size="sm" variant="outline" onClick={baixar}>Baixar .md</Button>
                </div>

                {conteudo.aviso && (
                  <div className="rounded-xl p-3 text-xs" style={{ background: "rgba(232,160,32,0.08)", border: "1px solid rgba(232,160,32,0.3)", color: "#EF9F27" }}>
                    {conteudo.aviso}
                  </div>
                )}

                <Secao titulo="HOOK">{conteudo.hook}</Secao>

                {conteudo.slides.length > 0 && (
                  <Secao titulo="SLIDES">
                    {conteudo.slides.map((s) => (
                      <div key={s.slide} className="pb-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px]" style={{ color: MUTED }}>SLIDE {s.slide} · {s.tipo}</span>
                          {s.badge && <Badge texto={s.badge} />}
                        </div>
                        <div className="whitespace-pre-line text-sm">{s.texto}</div>
                        {s.visual && <div className="text-[11px]" style={{ color: MUTED }}>Visual: {s.visual}</div>}
                      </div>
                    ))}
                  </Secao>
                )}

                {conteudo.roteiro && (
                  <Secao titulo="ROTEIRO">
                    {conteudo.roteiro.map((r) => (
                      <div key={r.bloco} className="text-sm pb-1">
                        <span style={{ color: ACCENT }}>{r.tempo} — {r.bloco}: </span>{r.texto}
                      </div>
                    ))}
                  </Secao>
                )}

                {conteudo.stories && (
                  <Secao titulo="STORIES">
                    {conteudo.stories.map((s) => (
                      <div key={s.story} className="text-sm pb-1">
                        <span style={{ color: ACCENT }}>Story {s.story}: </span>{s.texto}
                        {s.interacao && <div className="text-xs" style={{ color: MUTED }}>{s.interacao}</div>}
                      </div>
                    ))}
                  </Secao>
                )}

                <Secao titulo="LEGENDA">
                  <div className="whitespace-pre-line text-sm">{conteudo.legenda}</div>
                </Secao>

                {conteudo.fontes.length > 0 && (
                  <Secao titulo="FONTES">
                    {conteudo.fontes.map((f) => <div key={f} className="text-xs">· {f}</div>)}
                  </Secao>
                )}
              </>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default KinesisPage;
