# Task — Valores base de mercado para taxas, impostos (MEI) e meios de pagamento

**Data:** 2026-11-03
**Branch:** dev
**Status:** Aprovada — valores confirmados pelo responsável
**Fonte de verdade:** `task.md`, seção "Regras fundamentais de precificação"; pesquisa de taxas de mercado em 2026-11-03

---

## 1. Contexto

Para iniciar o cálculo real, a matriz da home e as simulações de precificação precisam
de **valores base** reais (não fictícios) nas configurações de canais, meios de
pagamento e tributos. O responsável pediu: pesquisar os valores de Mercado Livre,
TikTok Shop, Mercado Pago, maquininha e impostos de MEI; adicionar as informações
faltantes e corrigir as que já estão no banco.

Estado atual do banco (conferido em 2026-11-03):

| Configuração | Estado atual | Problema |
|---|---|---|
| Canal "Mercado Livre" | taxa única 8% percentual | Defasada: em 2026 a comissão Clássico varia 10–14% por categoria, e há tarifa fixa por unidade para itens < R$ 79 |
| Imposto "ICMS" | 3% percentual por venda | Errado para MEI: MEI não recolhe ICMS por venda; paga o **DAS fixo mensal** |
| Meio de pagamento "Maquininha" | taxa única 5% | Na prática débito, crédito, Pix e parcelado têm taxas bem diferentes |
| Despesa "luz" | R$ 500/mês | OK — rateia quando houver volume mensal estimado |
| Mão de obra "pintura" | R$ 1.000,00 / 44h | OK — vira custo por minuto no motor |
| Empresa | volume e margens vazios | Pendente preenchimento pelo responsável |

---

## 2. Resultado da pesquisa (conferido em 11/2026)

### 2.1 Mercado Livre (fonte oficial + guias de tarifa 2026)

- **Comissão Clássico:** 10% a 14% conforme a categoria (casa/decoração ~12–14%;
  beleza e cuidado pessoal 14%; artesanato/papelaria 11,5%).
- **Premium:** +5 pontos percentuais (15–19%), com parcelamento sem juros para o
  comprador.
- **Tarifa fixa por unidade** (só itens **abaixo de R$ 79**): R$ 5,50 até R$ 19,99;
  R$ 6,00 de R$ 20 a R$ 78,99; itens < R$ 12,50 pagam 50% do valor da unidade.
  Desde 02/03/2026 o valor pode variar também com peso/dimensões.
- Sem mensalidade; sem custo para anunciar.

### 2.2 TikTok Shop Brasil (em vigor desde 15/07/2026 — fonte oficial da plataforma)

Base de cálculo: preço do item **após desconto do vendedor**, por item vendido.

| Preço do item | Comissão | Taxa fixa por item |
|---|---|---|
| < R$ 50,00 | 10% | R$ 4,00 |
| ≥ R$ 50,00 | 6% | R$ 6,00 |

- **Programa de Taxas de Envio (frete grátis):** +6% sobre o preço, com teto de
  R$ 50,00 por item; **adesão automática** (precisa optar fora para não pagar).
- **Afiliados/criadores:** percentual opcional, definido pelo vendedor.
- Sem mensalidade.

### 2.3 Mercado Pago — recebimento online (Checkout Pro / Link de pagamento)

Fonte: tabela de taxas e tarifas oficial (PDF bacen-landings, vigente 2026).

| Meio | Taxa |
|---|---|
| Pix | 0,99% |
| Cartão de crédito à vista (receber na hora, D0) | 4,98% (4,49% em 14 dias; 3,98% em 30 dias) |
| Saldo em conta Mercado Pago | 4,99% (D0) |
| Boleto | R$ 3,49 |
| Parcelado (vendedor absorve, 12x) | ~22,26% total |

### 2.4 Maquininhas (comparativo oficioso de mercado, 10/2026)

| Operadora | Débito | Crédito à vista | 12x | Pix |
|---|---|---|---|---|
| Mercado Pago Point | 1,25–1,99% | 3,08–4,98% | 11,59–20,39% | 0,49% |
| Stone | 0,79% | 2,69% | 9,50% | 0% |
| SumUp | 0,80% | 2,85% | 9,90% | 0% |
| PagBank | 1,99% | 4,99% | 16,92% | 0,99% |
| InfinitePay | 1,37% | 3,15% | 12,40% | 0% |

Variação por faturamento mensal, bandeira e prazo de recebimento; confirmar no
painel da operadora contratada.

### 2.5 Impostos MEI (fonte oficial: Simples Nacional / Portal do Empreendedor)

O MEI **não recolhe imposto por venda**. Paga o **DAS fixo mensal** (vence dia 20),
independente do faturamento do mês. A maior parte é INSS (5% do salário mínimo).

Salário mínimo 2026: **R$ 1.621,00** (Decreto 12.797/2025).

| Atividade | INSS | ICMS | ISS | DAS mensal 2026 |
|---|---|---|---|---|
| Comércio ou indústria | R$ 81,05 | R$ 1,00 | — | **R$ 82,05** |
| Serviços | R$ 81,05 | — | R$ 5,00 | **R$ 86,05** |
| Comércio e serviços | R$ 81,05 | R$ 1,00 | R$ 5,00 | **R$ 87,05** |

- Limite de faturamento MEI: **R$ 81.000,00/ano**.
- **Modelagem correta no sistema:** o DAS entra como **despesa operacional mensal**
  (em "Despesas"), e o rateio automático divide pelo volume mensal estimado da
  empresa. Não é percentual por venda.

---

## 3. Proposta de mudança no banco

Migration nova (`20261103080000_seed_market_base_fees.sql`), idempotente, que:

1. **Desativa** a taxa "ICMS" (3%) em `tax_settings` com nota explicando que MEI
   recolhe DAS fixo mensal (retenção da linha para histórico, sem exclusão física).
2. **Insere o DAS-MEI como despesa operacional** (nome "DAS-MEI — imposto mensal") —
   valor conforme atividade informada pelo responsável.
3. **Corrige o canal "Mercado Livre":**
   - fee percentual "Comissão Clássico" (12% ou valor escolhido, conforme faixa);
   - fee fixa "Tarifa por unidade (itens < R$ 79)" R$ 6,00;
   - a taxa de 8% atual é desativada (não excluída), com nota.
4. **Criar canal "TikTok Shop"** com:
   - fee percentual (6% para itens ≥ R$ 50 — valor conforme escolha) e
   - fee fixa "Tarifa por item" (R$ 6,00 ou R$ 4,00 conforme faixa),
   - nota com a outra faixa e o Programa de Taxas de Envio (6%, adesão automática).
5. **Criar canal "Loja física"** — sem taxa de canal própria (0%); o custo vem do
   meio de pagamento (maquininha).
6. **Criar canal "Pix direto / WhatsApp"** — taxa de canal 0%; recebimento via Pix
   sem custo.
7. **Meios de pagamento** — substituir a taxa única da "Maquininha" (5%) por linhas
   separadas:

   | Meio | Linha | Valor (a escolher conforme operadora) |
   |---|---|---|
   | Pix (maquininha/QR) | percentual | 0,49% (Point) / 0% (Stone/SumUp) |
   | Débito | percentual | 1,25–1,99% conforme operadora |
   | Crédito à vista | percentual | 3,08–4,99% conforme operadora |
   | Crédito parcelado 12x | percentual, `installments` 12 | 9,50–20,39% conforme operadora |
   | Pix direto (chave) | novo método, 0% |
   | Mercado Pago online | novo método: Pix 0,99%; crédito à vista 4,98% |

8. **Documentação:** nova seção "Valores base de mercado (11/2026)" em
   `docs/spec/030-configuracoes.md` com a tabela pesquisada, links e a data de
   conferência; recomendação de conferir o painel do canal antes de decisões de
   preço (taxas variam por categoria, reputação, faturamento e bandeira).

---

## 4. Decisões (resolvidas em 2026-11-03 pelo responsável)

1. **Maquininha usada:** Mercado Pago Point → Pix 0,49%; Débito 1,99%;
   Crédito à vista 4,98% (recebimento na hora). Parcelado presencial não
   configurado — cadastrar depois se houver venda parcelada.
2. **Atividade do MEI:** comércio ou indústria → DAS-MEI **R$ 82,05/mês**
   (INSS R$ 81,05 + ICMS R$ 1,00), dentro de "Despesas" para rateio automático.
3. **Anúncio no Mercado Livre:** Clássico → comissão base **12%** (nota com a
   faixa 10–14 por categoria e Premium +5 p.p.).
4. **Faixa no TikTok Shop:** abaixo de R$ 50 → **10% + R$ 4,00 por item**
   (nota com a faixa ≥ R$ 50: 6% + R$ 6,00 e o Programa de Taxas de Envio 6%).
5. **Canais criados:** TikTok Shop (marketplace), Site próprio (site_proprio,
   recebimento via Mercado Pago online), Loja física (loja_fisica, via
   Maquininha) e Pix direto/WhatsApp (whatsapp, sem custo).

---

## 5. Execução e critérios de aceite

| Item | Situação |
|---|---|
| Pesquisa de tarifas 2026 (ML, TikTok, Mercado Pago online, Point, MEI/DAS) | ✅ |
| Migration `20261103080000_seed_market_base_fees.sql` criada e aplicada via pooler | ✅ |
| Banco conferido linha a linha (impostos, canais, taxas, meios, despesas) | ✅ |
| Duplicatas de `payment_fees` da reaplicação do script removidas (5 linhas; mantida a onda antiga) | ✅ |
| Documentação com fontes e data (`spec 030`, `supabase/README.md`, `MEMORIA.md`) | ✅ |
| `./pre-push.sh` verde (sem código alterado) | ✅ |

Resultado gravado no Supabase:

- ICMS 3% **desativado** com nota (MEI recolhe DAS fixo mensal, cadastrado
  em Despesas: "DAS-MEI — imposto mensal", R$ 82,05).
- Mercado Livre: comissão Clássico **12%** + tarifa fixa **R$ 6,00/unidade**
  (itens < R$ 79); taxa antiga de 8% inativa com nota.
- TikTok Shop: comissão **10%** + tarifa fixa **R$ 4,00/item** (base itens
  < R$ 50; notas com a faixa ≥ R$ 50 e o Programa de Taxas de Envio).
- Site próprio, Loja física e WhatsApp/Pix direto criados sem taxa do canal
  (o custo fica nos meios de pagamento).
- Maquininha (Point): Pix **0,49%**, Débito **1,99%**, Crédito à vista **4,98%**;
  taxa única de 5% inativa com nota.
- Mercado Pago online: Pix **0,99%**, Crédito à vista (D0) **4,98%**.
- Pix direto (chave): novo meio, sem taxa.

## 6. Observações técnicas

- Percentuais entram em `rate` no formato micro-percentual da aplicação
  ("12.000000"); valores fixos por unidade em `amount_cents`.
- As tarifas fixas de item (ML/TikTok) são somadas em `fixedFeesCents` corretamente
  porque cada simulação calcula **uma unidade**.
- A matriz da home usa as taxas de canal ativas + impostos ativos; o meio de
  pagamento é escolhido na simulação.
- Faixas de preço (ex.: ML < R$ 79, TikTok < R$ 50) não são modeladas por linha —
  o produto deve ser configurado na faixa em que costuma vender; as notas da taxa
  registram a regra da outra faixa.
