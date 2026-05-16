## Objetivo
Elevar todo o visual do sistema nutriON ao nível "Jarvis" (dark, holográfico, técnico) sem alterar nenhuma rota, hook, edge function, lógica de dados ou componente de formulário funcional. Apenas estilo.

## Escopo (somente camada de apresentação)

### 1. Fundação global
- `index.html`: garantir import do Google Fonts com Rajdhani 600/700 + Space Mono 400/700 (já presente — confirmar pesos).
- `src/index.css`:
  - Atualizar tokens HSL: `--background` → #020205, `--foreground` → #F5F0E8, `--primary` → #B8922A, `--accent` → #00D4FF, `--destructive` → #ff4444, `--border` → #B8922A com baixa opacidade.
  - Novos tokens: `--gold-line`, `--gold-soft`, `--cyan-line`, `--danger-line`, `--ink-warm`, `--ink-dim`.
  - Novas variáveis de fonte: `--font-jarvis: 'Rajdhani'`, `--font-tech: 'Space Mono'`.
  - Utility classes: `.font-jarvis`, `.font-tech`, `.tech-label` (uppercase + letter-spacing 0.2em), `.num-display` (Rajdhani 700), `.jarvis-card` (radius 0, border `#B8922A1F`), `.jarvis-bar` (track 3px), `.hex-bg` (grade hexagonal sutil), scrollbar hidden global, skeleton `#B8922A08`.
  - Keyframes: `barFill`, `dotPulse`, `softGlow`.
- `tailwind.config.ts`: adicionar `fontFamily.jarvis`, `fontFamily.tech`, cores `gold-line`, `cyan-line`, `ink-warm`, `ink-dim`, `danger-line`. Manter tokens existentes para retrocompatibilidade.

### 2. Background canvas (somente dashboard)
- Novo `src/components/dashboard/JarvisBackdrop.tsx`: grade hexagonal canvas (opacity 0.015 ouro) + 40 partículas lentas gold/cyan opacity ≤0.08. Componente leve, `pointer-events-none`, posição `fixed inset-0 -z-10`.

### 3. Dashboard (`src/pages/Index.tsx` + componentes em `src/components/dashboard/`)
- Topbar: `rgba(2,2,5,0.95)` + `backdrop-blur(12px)`, border-bottom `#B8922A18`, logo "NUTRI" + "ON" dourado em Rajdhani, badge "COCKPIT" Space Mono 6px, status "SISTEMA ATIVO" com dot ciano pulsante. Trocar emojis por Lucide.
- Layout grid 3 colunas (200px / 1fr / 180px) com separadores `1px #B8922A08`.
- Painel esquerdo: card de perfil + lista de métricas com barras animadas (TDEE/Prot/Carb/Gord/Streak/XP). Cores conforme spec. Item ativo com linha lateral 2px ouro.
- Centro hero: saudação tech, card "Modo Desafio" sem emoji, anel SVG de kcal 130px (track `#0F0F14`, fill ciano com `strokeDashoffset` animado, centro Rajdhani 28px, % topo Space Mono ciano), 3 rows ao lado.
- Centro macros: 3 barras 3px (gold/cyan/red) com label tech.
- Cards inferiores 2x2 (NutriSync, Fase, Pull, Comparativo) `radius:0`, borders sutis, ícones Lucide.
- Painel direito: APEX Score grande Rajdhani 48px ciano, 4 mini barras, diagnóstico semanal, idade biológica, "MCE ATIVO" com dot.

### 4. Lab (`src/pages/LabPage.tsx` + `src/components/lab/*`)
- Topbar Lab: "NUTRION LAB" Rajdhani + Lucide `Microscope`, subtítulo Space Mono, border-bottom `#00D4FF0A`.
- Tabs horizontais scrolláveis: ativa border-bottom 2px ouro + bg `#B8922A08`; Dr. VERTEX / Ergo em ciano quando ativos.
- Card agente APEX: border `#B8922A18`, bg `#B8922A04`, ícone `FlaskConical`, badge "ONLINE" pulsante ciano.
- Chat/respostas: bg `#020205`, mensagens APEX com border-left 2px ouro, texto Space Mono 8px line-height 1.9, tags científicas com border ciano.
- Input: border `#B8922A22`, focus ouro, botão enviar fundo ouro + `Send`, mic com border ouro.

### 5. Coach Dashboard (`src/pages/CoachDashboardPage.tsx` + `src/components/coach/*`)
- Topbar Coach: "nutriON Coach" Rajdhani, badge "Coach Pro" border ouro, nome em Space Mono.
- 4 cards de métricas com border-top colorido (gold/cyan/red/gold), valor Rajdhani 24px, ícones Lucide.
- Botões de ação: primário fundo ouro/texto `#020205` Rajdhani; secundários border ouro suave.
- Tabs com mesma linguagem do Lab.
- Lista de alunos: border-bottom `#0A0A0F`, hover bg `#B8922A04`, avatar com border ouro + iniciais Rajdhani, score com cor dinâmica (≥70 ciano, ≥40 ouro, <40 vermelho), badge "Em risco" com dot pulsante.
- Coluna alertas: border-left ouro, título tech, items com border vermelho suave; estado vazio Space Mono.
- Parceiros: items com border ouro, badges ON_PLUS / Ativo.

### 6. Regras transversais
- Trocar emojis por Lucide nos componentes tocados (dashboard, lab, coach topbars/cards).
- Border-radius 0 em cards principais, 2px em badges/inputs (override pontual via classe `jarvis-card`).
- Transições `0.2s` em hover, `1.5s` em barras.
- Scrollbars escondidas globalmente via CSS.
- Skeleton/loader usa `#B8922A08`.

## Fora de escopo (não tocar)
- Rotas, hooks, edge functions, lógica de dados, formulários, validações, RLS, business rules.
- Landing page hero (já entregue).
- Módulos não citados (training, nutrisync internals, peptide vault, etc.) — herdam tokens globais via `index.css`/Tailwind sem edição direta.

## Arquivos previstos
- Editar: `src/index.css`, `tailwind.config.ts`, `index.html` (se faltar peso), `src/pages/Index.tsx`, `src/pages/LabPage.tsx`, `src/pages/CoachDashboardPage.tsx`, componentes diretos de dashboard/lab/coach topbar e listas.
- Criar: `src/components/dashboard/JarvisBackdrop.tsx`.

## Validação
- Build limpo (sem TS errors).
- Inspeção visual rápida via screenshot do dashboard, /lab e /coach-dashboard para confirmar paleta, fontes e ausência de emojis nas áreas tocadas.
