# Task — Matriz da home: plataformas só vendem varejo; atacado é venda direta

**Data:** 2026-11-03
**Branch:** dev
**Status:** Concluída — decisões confirmadas pelo responsável
**Fonte de verdade:** feedback do responsável em 2026-11-03 sobre o primeiro resultado da matriz

---

## 1. Contexto

A matriz atual gera uma linha por **canal × modalidade** (varejo e atacado em cada
plataforma). O responsável esclareceu a regra do negócio:

> "Atacado só é vendido diretamente. Ele seria uma linha, não uma coluna que
> geraria uma linha para cada plataforma. Todas as plataformas só vendem varejo;
> o atacado seria outra plataforma."

Ou seja: **marketplaces e canais vendem apenas varejo**. O **atacado** não passa
por elas — é venda direta ao comerciante, sem comissão de plataforma.

---

## 2. Objetivo

Respeitar a regra da matriz da home:

- para cada produto, **uma linha por plataforma ativa** (todas de **varejo**);
- **uma única linha "Atacado (venda direta)"** por produto, sem taxa de canal
  (direta, sem plataforma) — impostos continuam considerados;
- a coluna **"Modalidade" sai da tabela** (deixa de existir como coluna; a
  modalidade fica implícita no rótulo das linhas).

Estado antes (Vela, custo R$ 5,60): 10 linhas — 2 por.platforma + repetições.
Depois: 6 linhas — 5 plataformas (varejo) + 1 atacado direta.

---

## 3. Escopo

### Dentro

- `buildPricingMatrix` (motor puro, `src/services/calculations/pricingMatrix.ts`):
  - linha de varejo por canal ativo: margem da última simulação
    (produto + canal + varejo) > margem padrão de varejo > 30%;
  - linha "Atacado (venda direta)": **sem taxas de canal** (channelFees vazias);
    margem da última simulação de **atacado do produto, qualquer canal** >
    margem padrão de atacado > 20%;
  - impostos ativos continuam aplicados em todas as linhas (inclusive atacado);
  - produto com custo incompleto: célula sem preço com motivo "Custo incompleto"
    em todas as linhas, como hoje.
- `PricingMatrix.tsx` + CSS:
  - cabeçalho da tabela: **Plataforma | Margem | Preço sugerido**;
  - linha "Atacado (venda direta)" com separação visual (não é uma plataforma),
    ex. borda superior mais forte;
  - nota da matriz mantida ("Meio de pagamento pode alterar o preço final" —
    na simulação por canal; no atacado direto vale o meio combinado, ex. Pix).
- Atualização dos testes unitários da matriz para o novo contrato — **as regras
  mudam a pedido do responsável** (contrato antigo imposto por plataforma ×
  modalidade está substituído); autorização solicitada no plano.
- Documentação: `docs/spec/070-precificacao.md` (seção da matriz) e `MEMORIA.md`
  com a decisão de negócio.

### Fora

- Nenhuma mudança no motor de preço por canal (`calculateChannelPriceCents`) —
  ele continua genérico (canal + modalidade) para as simulações de
  `/precificacao`.
- Nenhuma mudança de banco.
- Renome/criação de canais.

---

## 4. Resultado esperado (exemplo Vela, custo R$ 5,60)

| Plataforma | Margem | Preço sugerido |
|---|---|---|
| Loja física | 30,0% | R$ 8,00 |
| Mercado Livre | 30,0% | R$ 20,00 |
| Site próprio | 30,0% | R$ 8,00 |
| TikTok Shop | 30,0% | R$ 16,00 |
| WhatsApp / Pix direto | 30,0% | R$ 8,00 |
| **Atacado (venda direta)** | 20,0% | R$ 7,00 |

(Valores ilustrativos conforme taxas atuais: sem imposto ativo, atacado direto
= custo ÷ (1 − 0,20).)

---

## 5. Observação

- As simulações de `/precificacao` ganham agora um uso claro: para atacado,
  simular em qualquer canal serve como registro da **margem** negociada — a
  matriz usa essa margem na linha direta. Se o responsável preferir que a linha
  de atacado use **apenas** a margem padrão (e ignore simulações), registrar aqui.

---

## 6. Decisões confirmadas (2026-11-03, pelo responsável)

1. Formato aprovado: uma linha de **varejo por plataforma** + **única linha
   "Atacado (venda direta)"** sem comissão de plataforma; coluna "Modalidade"
   sai da tabela.
2. Margem do atacado: **apenas a margem padrão da empresa** (contingência 20%);
   simulações de atacado **não** alteram a linha. O recebimento no atacado é
   combinado com o comprador — **Pix ou crediário** — e não altera o preço
   base da matriz.

## 7. Execução e critérios de aceite

| Item | Situação |
|---|---|
| `pricingMatrix.ts` reescrito (varejo por canal + atacado direto, margem padrão) | ✅ |
| Lista de atacado com `channelFees` vazio e impostos ativos mantidos | ✅ |
| `PricingMatrix.tsx` sem coluna "Modalidade", com linha de atacado destacada | ✅ |
| Testes reescritos para o contrato novo (10 testes, autorização do responsável) | ✅ |
| `spec 070` atualizada + `MEMORIA.md` com a decisão | ✅ |
| `./pre-push.sh` verde (typecheck, lint, testes completos) | ✅ |

- Motor de preço por canal (`calculateChannelPriceCents`) intacto — as
  simulações de `/precificacao` continuam suportando varejo e atacado.
- Nenhuma mudança de banco; nenhum canal renomeado ou criado.
