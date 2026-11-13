# Task — Reposicionamento do objetivo: precificação como planilha e remoção de produção/estoque

**Data:** 2026-11-03
**Branch:** dev
**Status:** Concluída — código, migrations aplicadas ao Supabase e documentação atualizadas
**Fonte de verdade:** `task.md`, respostas do responsável em 2026-11-03

---

## 1. Contexto

O sistema cresceu além do objetivo principal. A necessidade real é uma **planilha de
cálculo de preço**, não um ERP de produção/estoque:

- cadastrar insumos com quantidade e valor;
- montar produtos a partir desses insumos;
- configurar impostos e taxas de plataformas/serviços (Mercado Livre, TikTok,
  loja física, maquininha, etc.);
- calcular o **custo de fabricação** e o **preço sugerido** para cliente direto
  (varejo) e comerciante (atacado);
- saber, quando um insumo muda de preço, se o preço do produto deve mudar e
  qual valor vender em cada plataforma.

Decisões do responsável em 2026-11-03:

1. O custo de fabricação inclui mão de obra e despesas rateadas **apenas quando
   informados** (há produtos fabricados e produtos revendidos).
2. A análise de impacto de mudança de insumo deve ser **automática**.
3. Os módulos de **produção e estoque** devem ser **removidos**.
4. A matriz de preços por plataforma deve ser a **página principal (home)**, em
   formato de **tabela informativa**.

---

## 2. Objetivo da task

Reposicionar o sistema para o objetivo real:

- completar o custo de fabricação (material + mão de obra + despesas rateadas,
  quando informados);
- remover produção e estoque do código, da navegação e, após validação, do banco;
- criar, na home, uma tabela informativa com o preço sugerido por plataforma;
- criar análise automática do impacto de mudança de preço de insumo;
- manter o motor financeiro como única fonte de verdade dos cálculos.

---

## 3. Escopo

### Dentro do escopo

- Ajuste do motor de custo de produto para incluir mão de obra e despesas
  rateadas quando houver dados.
- Adição de **volume mensal estimado** para rateio de despesas operacionais.
- Adição de **margem padrão por modalidade** (varejo/atacado) para a matriz
  automática.
- Remoção dos módulos de produção e estoque.
- Criação da matriz de preços por plataforma na home.
- Criação da análise automática de impacto de insumo.
- Atualização de documentação e status.

### Fora do escopo

- Controle de unidade de produto produzido.
- Exportação de dados.
- Testes de componente, integração ou E2E.
- Integração com loja virtual ou marketplaces.
- Cadastro/gestão de usuários (permanece no painel do Supabase).

---

## 4. Ambiguidades identificadas e decisões assumidas

### 4.1 Rateio de despesas sem produção real

Como produção/estoque serão removidos, não haverá volume real de produção.
**Decisão assumida:** usar um **volume mensal estimado** configurável na empresa.
Se não informado, as despesas operacionais **não** são rateadas (custo 0), em vez
de bloquear o cálculo.

**O que é rateio:** despesas operacionais mensais (aluguel, energia, internet,
etc.) são custos fixos do mês. Para saber quanto cada unidade de produto "carrega"
dessas despesas, divide-se o total mensal pelo volume de unidades produzidas ou
vendidas no mês. O resultado é o **custo de despesas por unidade**. Exemplo:
R$ 1.000,00 de despesas no mês ÷ 500 unidades estimadas = R$ 2,00 de despesa
rateada por unidade. Esse valor entra no custo de fabricação do produto.

**Ponto a confirmar:** o volume estimado deve ser global (empresa) ou por produto?
*(Confirmado em 2026-11-03: global, na empresa.)*

### 4.2 Margem usada na matriz automática

A matriz da home precisa de uma margem para calcular o preço sugerido.
**Decisão assumida:** usar a margem da **última simulação** do produto para
aquele canal/modalidade; se não existir, usar a **margem padrão** configurável.

### 4.3 Critério de "devo mudar o preço?"

Não existe regra de negócio explícita de tolerância.
**Decisão assumida:** sempre exibir a variação de custo e o novo preço sugerido;
marcar o produto como **"revisar"** sempre que houver diferença entre o custo
atual e o último snapshot. Threshold numérico pode ser adicionado depois.

### 4.4 Mão de obra

Somente entra no custo se o produto tiver `laborMinutes > 0` **e** existir
configuração de salário/horas em `labor_costs`. Caso contrário, 0.

### 4.5 Despesas operacionais

Somente entram se houver despesas ativas **e** volume mensal estimado > 0.
Caso contrário, 0.

### 4.6 Impressão 3D

A especificação original prevê energia, máquina, tempo, falhas e acabamento.
**Decisão assumida nesta entrega:** tratar esses valores como **custos informados
manualmente por produto** (campos opcionais), sem modelagem detalhada de falhas.
Modelagem avançada de falhas fica para etapa posterior.

**Ponto a confirmar:** os campos de custo de impressão 3D entram nesta entrega ou
em uma task separada? *(Confirmado em 2026-11-03: entram nesta entrega — energia,
máquina e acabamento como custos diretos por unidade; taxa de falha amplia o
custo de material.)*

### 4.7 Remoção de produção/estoque no banco

As tabelas podem já estar aplicadas e conter dados.
**Decisão assumida:** remover código e navegação primeiro; criar migration de
`drop` apenas após conferir se as tabelas estão vazias ou após backup.

**Ponto a confirmar:** drop das tabelas ou apenas desativação das rotas?
*(Confirmado em 2026-11-03: drop. Executado após verificar que as tabelas estavam
vazias; migration `20261103070000_drop_production_and_inventory.sql` aplicada ao
Supabase via pooler.)*

### 4.8 Tamanho da matriz na home

Muitos produtos × canais pode gerar tabela muito larga.
**Decisão assumida:** exibir, para cada produto, uma tabela compacta de
canais/modalidades (linhas = canal + modalidade), evitando colunas dinâmicas.

---

## 5. Etapas propostas

### Etapa A — Completar o custo de fabricação

| Subtarefa | Entrega |
|---|---|
| A1 | Migration: adicionar `monthly_output_units` e margens padrão em `company_settings` (ou tabela de configuração de precificação). |
| A2 | Validações e UI em `/configuracoes` para volume mensal estimado e margens padrão. |
| A3 | Ajustar `resolveProductCost` para calcular mão de obra quando houver minutos e configuração de salário. |
| A4 | Ajustar `getProductCostBreakdown` para somar mão de obra + despesas rateadas + custos de impressão 3D quando informados. |
| A5 | Reutilizar `allocateMonthlyCostPerUnitCents` e `sumMonthlyOverheadCents`. |
| A6 | Testes unitários para os novos caminhos de custo. |

### Etapa B — Remover produção e estoque

| Subtarefa | Entrega |
|---|---|
| B1 | Remover rotas `/producao` e `/estoque`. |
| B2 | Remover itens de navegação. |
| B3 | Remover `features/production`, `features/inventory`, actions e services relacionados. |
| B4 | Remover imports e referências. |
| B5 | Atualizar `MASTER_INDEX.md` e specs. |
| B6 | Criar migration de drop das tabelas `production_batches`, `production_consumption`, `inventory_movements` após verificação de dados. |
| B7 | Validar build e testes. |

### Etapa C — Matriz de preços na home

| Subtarefa | Entrega |
|---|---|
| C1 | Criar função pura para calcular a matriz (produto × canal × modalidade). |
| C2 | Criar componente de tabela informativa na home. |
| C3 | Exibir custo de fabricação, preço sugerido varejo/atacado e variação vs. último snapshot. |
| C4 | Marcar produtos com impacto de insumo (custo mudou). |
| C5 | Testes unitários da função de matriz. |

### Etapa D — Análise automática de impacto de insumo

| Subtarefa | Entrega |
|---|---|
| D1 | Função pura: comparar custo atual do produto com último snapshot e retornar variação + recomendação. |
| D2 | Exibir impacto na home e, quando houver, no cadastro do produto. |
| D3 | Revalidar home após salvar insumo. |
| D4 | Testes unitários. |

### Etapa E — Documentação

| Subtarefa | Entrega |
|---|---|
| E1 | Atualizar `MASTER_INDEX.md`. |
| E2 | Atualizar specs 030, 040, 060, 070, 080, 100. |
| E3 | Registrar decisões em `MEMORIA.md`. |

---

## 6. Arquivos provavelmente afetados

### Motor de cálculo

- `src/services/calculations/productCost.ts`
- `src/services/calculations/productCostResolver.ts`
- `src/services/supabase/pricing.ts`
- `src/services/supabase/settings.ts` ou `costs.ts`

### Configurações

- `src/features/settings/*`
- `src/lib/validations/settings.ts`
- `src/app/(dashboard)/configuracoes/page.tsx`
- migration de `company_settings`

### Remoção de produção/estoque

- `src/app/(dashboard)/producao/page.tsx`
- `src/app/(dashboard)/estoque/page.tsx`
- `src/features/production/*`
- `src/app/actions/production.ts`
- `src/services/supabase/production.ts`
- `src/lib/navigation.ts`

### Home / matriz / impacto

- `src/app/(dashboard)/home/page.tsx`
- novo componente de matriz em `src/features/pricing/` ou `src/features/reports/`
- nova função de matriz em `src/services/calculations/`
- `src/services/supabase/pricing.ts` (leitura de snapshots)

### Documentação

- `docs/MASTER_INDEX.md`
- `docs/spec/*.md`
- `docs/MEMORIA.md`

---

## 7. Riscos

- Remoção de produção/estoque pode quebrar imports e testes existentes.
- Drop de tabelas é destrutivo; exige verificação de dados e backup.
- Matriz pode ficar pesada com muitos produtos/canais; considerar paginação ou
  filtro.
- Margem padrão pode não refletir a realidade; por isso a última simulação tem
  prioridade.
- Alteração do custo de fabricação pode mudar preços já simulados; isso é
  esperado e deve ser comunicado ao usuário.

---

## 8. Critérios de aceite

- [x] Home exibe tabela informativa com custo de fabricação e preço sugerido por
      plataforma (varejo e atacado), para administradores.
- [x] Custo de fabricação inclui mão de obra, despesas rateadas e custos diretos
      de impressão 3D quando informados.
- [x] Produção e estoque removidos do menu e das rotas (`navigation.ts` com
      9 → 7 módulos de administrador).
- [x] Impacto de mudança de insumo exibido automaticamente ("Revisar preço").
- [x] `npm run typecheck`, `npm run lint`, `npm run test` e `npm run build`
      verdes.
- [x] `./pre-push.sh` verde.
- [x] Migrations aplicadas ao Supabase (via pooler, em transação):
      `20261102230000`, `20261103070000`, `20261103071000`, `20261103072000` e
      `20261103073000`; PostgREST notificado e RPC validada (401 de RLS para
      anônimo).

---

## 9. Validação executada

- 285 testes unitários em 40 suítes (motor de custo, matriz, impacto, validações).
- Typecheck e lint sem erros nem avisos; build de produção concluído.
- Banco remoto: tabelas de produção/estoque e `supply_prices` ausentes; colunas
  novas presentes; insumos migrados com custo por unidade correto
  (Cera Coco R$ 6,00/L; po madeira R$ 33,00/kg).

---

## 10. Observação

Plano aprovado e implementado em 2026-11-03, conforme decisões registradas nas
seções 4 e 8.