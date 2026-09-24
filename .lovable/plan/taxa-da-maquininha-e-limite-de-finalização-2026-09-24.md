# Taxa da maquininha e limite de finalização

## O que será alterado

### 1. Taxa de crédito: R$ 1,00 → R$ 2,00
- Em `src/lib/menu.ts`:
  - `CREDIT_CARD_FEE` de `1.0` para `2.0`.
  - Texto do aviso no método "Cartão — Crédito": de "(+ R$ 1,00 taxa da maquininha)" para "(+ R$ 2,00 taxa da maquininha)".
- O cálculo do total no pedido já usa `CREDIT_CARD_FEE`, então passa a somar R$ 2,00 automaticamente — sem mexer em mais nada.

### 2. Finalização: limitar a 3 opções
- Em `src/routes/montar.tsx`, etapa "Finalização e Identificação":
  - Ao tentar marcar uma 4ª opção, simplesmente não selecionar (bloqueio silencioso, sem aviso/toast).
  - Não mostrar contador — manter o selo da etapa como está.
  - Desmarcar continua livre (trocar uma opção por outra funciona).

## O que NÃO muda
- Nada no banco de dados / Supabase (sem migração).
- Layout, cores, demais etapas do pedido, painel admin e acompanhamento permanecem iguais.
