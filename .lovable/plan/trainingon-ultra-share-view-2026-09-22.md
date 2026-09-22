# TrainingON Ultra Share View

## Objetivo
Criar um card compartilhável do treino do dia em formato HUD premium, mantendo o compartilhamento semanal atual separado.

## Implementação
- Criar um novo `WorkoutShareCard` reutilizável com os dados dinâmicos solicitados, silhueta muscular, rings, protocolo, alerta, exercícios e faixa de dados.
- Usar somente dados recebidos pelas propriedades do componente; nenhum valor demonstrativo será tratado como dado real do aluno.
- Adicionar controles externos para exportar PNG, alternar o quadro 390px para Story 1080×1920 e ativar edição direta dos textos.
- Integrar o card à visualização do treino real do dia no TrainingON, mostrando-o somente quando houver treino salvo.
- Preservar o card semanal existente com outro nome para não quebrar o NutriSync.

## Detalhes técnicos
- React, TypeScript, Tailwind e `html2canvas` já instalados.
- Estilos específicos isolados, sem arredondamento e com animações CSS de scan e pulso compatíveis com exportação.
- O modo Story renderiza em escala visual reduzida na tela, mas exporta na resolução 1080×1920.
- Campos ausentes aparecerão como não informados ou serão omitidos, sem inventar números, exercícios ou prescrições.
- Validar tipagem, renderização em desktop/mobile e download do PNG.
