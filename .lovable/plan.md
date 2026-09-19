# Texto sempre completo nos slides

## Objetivo
Garantir que títulos, textos, fontes e rótulos nunca apareçam com letras faltando, palavras cortadas ou texto fora da área do slide.

## Implementação
- Trocar a compressão horizontal de texto por redução proporcional do tamanho da fonte.
- Fazer textos longos quebrarem linha e reduzirem gradualmente até caberem na largura e altura disponíveis.
- Aplicar a proteção aos modelos Clássico, Tech Científico, Biomecânica e demais carrosséis que usam a base compartilhada.
- Preservar palavras completas sempre que houver espaço; termos longos e links serão quebrados de forma legível, sem sumir.
- Manter rodapé, fontes e demais elementos dentro das áreas reservadas.

## Validação
- Testar títulos longos, parágrafos densos, fontes extensas e rótulos em ambos os estilos.
- Confirmar que não há achatamento, corte lateral, corte inferior ou sobreposição com o rodapé.
