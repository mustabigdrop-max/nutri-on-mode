# Plano: Expansão Aditiva do /coach/plano-alimentar

Vou estender `src/components/coach/PlanoAlimentarIA.tsx` adicionando 9 blocos novos **sem remover nada**. Edge function `gerar-plano-alimentar-ia` recebe os novos campos via prompt aditivo (sem quebrar contrato existente).

## Estrutura de implementação

### Estado novo (form state)
Adicionar ao state existente:
- `categoriaEsporte`, `protocoloEsporte` (derivado)
- `nivelEstresse`, `estrategiasRecuperacao[]`, `hrvMonitorado`, `hrvMedio`, `lesaoAtiva`, `lesaoDesc`
- `condicoesClinicas[]`
- `identidadeProfissional { nome, registro, especialidade, consultorio, cidade, exibirNoPdf }`
- `intraTreino { ativo, tipos[], cho_hora, sodio_litro }`
- `pdfConfig { idioma, formatoMedidas, nivelDetalhe, itensIncluir[] }`
- `modoEspecialCampos` (campos contextuais por modo: combate/endurance/peak/feminino)

### Constantes (arquivo novo)
`src/components/coach/planoAlimentarConstants.ts` — listas grandes:
- `CATEGORIAS_ESPORTE` (grupos + opções + protocolo + tags por esporte)
- `CONDICOES_CLINICAS` (grupos)
- `ESTRATEGIAS_RECUPERACAO`, `TIPOS_INTRA_TREINO`
- `IDIOMAS_PDF`, `FORMATOS_MEDIDA`, `NIVEIS_DETALHE`, `ITENS_INCLUIR_PDF`

### Blocos UI (ordem de inserção)

| Bloco | Posição | Default |
|---|---|---|
| 5. Identidade Profissional | TOPO, antes Dados Paciente | collapsed |
| 6. Meus Templates | abaixo header, antes form | sempre visível |
| 1. Categoria Esporte + Protocolo Card | após Modalidade de treino | expandido |
| 2. Modo Especial expandido | dentro Modo Especial existente | inline |
| 3. Protocolo Recuperação | após Protocolo Cardio | collapsed |
| 7. Nutrição Intra-treino | após Protocolo Cardio | collapsed |
| 4. Condições Clínicas | após Observações Clínicas | collapsed |
| 8. Config PDF | antes botão Gerar Plano | collapsed |
| 9. Comparativo Histórico | aba Histórico | inline |

### Persistência
- **Templates (Bloco 6):** `localStorage['nutrion_coach_templates']`, máx 10, schema `{id, nome, criadoEm, snapshot: formState}`
- **Identidade Profissional (Bloco 5):** colunas novas em `coach_profiles` via migração:
  - `professional_signature_name`, `professional_registry`, `professional_specialty`, `clinic_name`, `clinic_city`, `show_signature_on_pdf`
  - Carregar via `useCoachProfile`, salvar via `supabase.from('coach_profiles').update(...)` no blur/save manual

### Integração no Prompt (edge function)
Em `handleGerarPlano`, construir `novoContexto` string e concatenar ao prompt enviado para `gerar-plano-alimentar-ia`. Edge function não precisa mudanças — recebe contexto extra no campo `contextoAdicional` (ou anexado em `observacoes` se não existir).

### Comparativo (Bloco 9)
Em aba Histórico:
- Dois `<select>` para escolher 2 planos da lista
- Render lado a lado: TDEE, macros (P/C/G), kcal, fase, data
- Delta com cor: `#00C896` (aumento) / `#ff4444` (redução)

### Estilo
- Reusar tokens `T.*` existentes (cor primária Amber #B8922A, bg #0A0A12)
- Border-left 2px cor primária, headers Space Mono, ícones Lucide (`Trophy`, `Activity`, `Stethoscope`, `BadgeCheck`, `BookMarked`, `Zap`, `FileOutput`)
- Alertas clínicos: border `#ff444422`, bg `#ff44440A`, cor `#ff4444`

## Detalhes técnicos

**Arquivos a editar/criar:**
1. `src/components/coach/planoAlimentarConstants.ts` (novo) — todas as listas
2. `src/components/coach/PlanoAlimentarIA.tsx` — state + UI + prompt integration
3. Migração Supabase — colunas em `coach_profiles`
4. `src/hooks/useCoachProfile.ts` — incluir novos campos no tipo

**Não modificar:**
- Edge function `gerar-plano-alimentar-ia` (recebe contexto via campo já existente)
- Estrutura/lógica do form atual
- Validações existentes

**Verificação final:** confirmar que clicar "Gerar Plano" sem preencher novos campos ainda funciona (todos opcionais, defaults vazios).

## Decisão a confirmar

O componente `PlanoAlimentarIA.tsx` já é muito grande (>6700 linhas). Vou:
- **Adicionar inline** (mantém tudo num lugar, mais fácil de revisar)

Se preferir extrair em sub-componentes (`<BlocoIdentidade/>`, `<BlocoTemplates/>` etc) avise antes — adiciona ~1h de refactor mas melhora manutenibilidade.
