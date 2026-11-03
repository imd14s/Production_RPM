# Spec 030 — Configurações empresariais

**Etapa:** 4
**Status:** Etapa implementada — aguarda validação do usuário no navegador
**Última atualização:** 2026-11-01

## Objetivo

Cadastrar os parâmetros que alimentarão o motor de precificação: dados da empresa,
tributação, canais de venda, meios de pagamento, despesas fixas e mão de obra. Esta
etapa **não calcula preço** — apenas guarda e audita parâmetros.

## Plano da etapa

| Sub-etapa | Entrega | Situação |
|---|---|---|
| 4.1 | Empresa, impostos e histórico de alterações | ✅ Implementada |
| 4.2 | Canais de venda e taxas por canal | ✅ Implementada |
| 4.3 | Meios de pagamento e taxas | ✅ Concluída |
| 4.4 | Despesas fixas e mão de obra | ✅ Concluída |
| 4.5 | Painel de abas e navegação | ✅ Concluída (abas em `SettingsTabs`) |

## Decisões de modelo

| Decisão | Justificativa |
|---|---|
| Dinheiro em centavos inteiros (`bigint`) | elimina erro de ponto flutuante |
| Percentual em `numeric(9,6)` | exato; o motor usará inteiros escalados |
| Empresa em linha única (`id = 1`) | um ateliê, sem cadastros duplicados |
| Taxa como tabela filha | um canal tem várias taxas, não uma coluna |
| Exclusão lógica (`is_active`) | registro usado em cálculo nunca desaparece |
| Auditoria por gatilho (`security definer`) | nenhuma sessão forja histórico |
| Percentual e fixo mutuamente exclusivos | `check` impede registro ambíguo |

## Banco de dados

Migrations (nesta ordem):

1. `20261101170000_create_profiles.sql` — Etapa 2.
2. `20261101190000_create_company_and_tax_settings.sql` — `company_settings`,
   `tax_settings`, `configuration_history`, tipos `company_type`, `tax_regime`,
   `tax_kind`.
3. `20261101200000_create_sales_channels.sql` — `sales_channels`, `channel_fees`,
   tipo `channel_kind`.

### Relações

```
company_settings (1 linha)
tax_settings            ── lista de impostos
sales_channels ──< channel_fees
configuration_history   ── alimentada por gatilho nas tabelas acima
```

### RLS

| Tabela | SELECT | INSERT / UPDATE | DELETE |
|---|---|---|---|
| `company_settings` | autenticado | administrador | ninguém |
| `tax_settings` | autenticado | administrador | ninguém |
| `sales_channels` | autenticado | administrador | ninguém |
| `channel_fees` | autenticado | administrador | ninguém |
| `configuration_history` | administrador | gatilho apenas | ninguém |

### Regras do banco (constraints)

- `company_settings.id = 1` (linha única).
- Nome de imposto e de canal únicos, sem diferença de caixa ou espaços.
- `rate` entre 0 e 100; `amount_cents` ≥ 0; `installments` entre 1 e 24 ou nulo.
- Percentual exige `rate` e proíbe `amount_cents`; valor fixo, o contrário.

## Aplicação

```
src/
├── app/
│   ├── actions/
│   │   ├── settings.ts        saveCompanyAction, saveTaxAction, toggleTaxAction
│   │   └── channels.ts        saveChannelAction, toggleChannelAction, taxas
│   └── (dashboard)/configuracoes/
│       ├── layout.tsx         guarda de administrador + abas
│       ├── page.tsx           Empresa
│       ├── impostos/page.tsx  Impostos
│       └── canais/            lista e detalhe com taxas
├── features/
│   ├── settings/              tipos, parsers, formatação, formulários
│   └── channels/              tipos, parsers, formulários
├── lib/
│   ├── money.ts               reais ↔ centavos
│   ├── percent.ts             percentual ↔ micro-percentual
│   └── validations/
│       ├── settings.ts        empresa e imposto
│       └── channels.ts        canal e taxa
└── services/supabase/
    ├── settings.ts            leitura e gravação
    └── channels.ts            leitura e gravação
```

### Fluxo de escrita

1. Formulário (client) envia Server Action.
2. Ação confirma administrador **no servidor** (`getAdminSession`).
3. Validação em `lib/validations` normaliza entradas (CNPJ sem máscara, percentual
   canônico, dinheiro em centavos).
4. Service grava no Supabase; RLS aplica a regra de novo no banco.
5. `revalidatePath` atualiza a lista.

## Componentes novos nesta etapa

| Componente | Uso |
|---|---|
| `TextField`, `SelectField`, `TextAreaField` | formulários com erro e dica; `TextField` aceita `format` para máscara ao digitar (CNPJ, CEP, telefone) |
| `Alert` | retorno de sucesso/erro das ações |
| `Badge` | situação (ativo/inativo) |

## Testes

| Arquivo | Cobertura |
|---|---|
| `src/lib/money.test.ts` | reais ↔ centavos, separadores, símbolo |
| `src/lib/percent.test.ts` | percentual canônico, micro-percentual, faixa |
| `src/lib/validations/settings.test.ts` | CNPJ (dígitos verificadores), CEP, UF, telefone |
| `src/lib/validations/channels.test.ts` | canal, taxa, parcelas 1–24 |
| `src/features/settings/parse.test.ts` | linha do banco → domínio |
| `src/features/channels/parse.test.ts` | linha do banco → domínio |
| `src/features/settings/format.test.ts` | máscaras de CNPJ, CEP e telefone |
| `src/components/ui/LoadingOverlay/` | cortina de espera que trava a tela durante Server Actions |
| `src/components/ui/PendingButton/` | botão de ações rápidas (ativar/desativar) com bloqueio durante envio |
| `src/components/feedback/FormAlert/` | mensagem da ação: sobe a tela ao topo e desaparece após 6 segundos |
| `src/features/settings/payload.test.ts` | contrato do payload enviado ao banco, campo a campo |
| `src/features/channels/payload.test.ts` | contrato do payload do canal e da taxa |
| `src/lib/navigation.test.ts` | Configurações visível só ao administrador |

## Verificação no banco (executada)

- Suíte atual (167 testes): parser, payloads, validações e horas de todas as
  famílias.
- `tax_settings`, `channel_fees` e `payment_fees` rejeitam percentual + fixo
  juntos e percentual acima de 100.
- `operating_expenses`/`labor_costs` rejeitam valor zero e horas fora de faixa
  (0–438).

- `company_settings` rejeita segunda linha (singleton).
- `tax_settings` e `channel_fees` rejeitam percentual + fixo juntos e percentual > 100.
- Políticas RLS criadas para todas as tabelas novas.

## Pendências

- Teste de escrita com sessão real de administrador e de operador no navegador.

## Interação

- **Ação de gravação (formulários):** enquanto a Server Action roda, um
  `LoadingOverlay` cobre a tela com indicador de progresso, impedindo cliques
  repetidos. Ao terminar, a mensagem aparece no topo da tela — a rolagem sobe
  automaticamente — e desaparece sozinha após 6 segundos.
- **Ação rápida (ativar/desativar):** o botão envolto em `PendingButton` fica
  desabilitado e a mesma cortina bloqueia a tela até a ação terminar.
- **Atualização das listas:** após gravação bem-sucedida ou ativação/desativação,
  os painéis atualizam os dados do servidor. Totais e contagens de taxas são
  recalculados com os dados atualizados, sem recarga manual da página.
- **Percentuais recebidos do banco:** parsers aceitam percentuais `numeric` serializados
  como número ou texto, validam a faixa e normalizam para seis casas decimais antes
  da formatação pt-BR nas tabelas.
- **Testes de exibição percentual:** testes unitários sem mocks percorrem uma linha
  numérica recebida do banco pelo parser e verificam o mesmo texto final produzido pela
  função usada nas células de impostos, canais e pagamentos.
- **Rotas de dados:** cada página que lê sessão ou banco declara
  `export const instant = false` (rota bloqueante, sem navegação instantânea).

---

## Meios de pagamento (4.3)

- Tabelas: `payment_methods` (linha por meio — Pix, débito, crédito, carteira
  digital, outro) e `payment_fees` (taxas de processamento, filhas do meio).
  Migration `20261101210000_create_payment_methods.sql`.
- A taxa da maquininha/gateway fica no **meio de pagamento** (global); a comissão
  por canal fica em `channel_fees`. Nada duplica a mesma taxa nos dois lugares.
- Mesmas regras das taxas de canal: percentual **ou** fixo (nunca os dois),
  parcelas opcionais 1–24, exclusão lógica, RLS e gatilhos de auditoria idênticos.
- Telas: `/configuracoes/pagamentos` (lista + formulário) e
  `/configuracoes/pagamentos/[id]` (taxas do meio). Aba "Pagamentos" no topo.
- Serviços em `services/supabase/payments.ts`; ações em `app/actions/payments.ts`;
  validações em `lib/validations/payments.ts` (testadas); parser e payload de
  `features/payments` (testados campo a campo).

---

## Despesas fixas e mão de obra (4.4)

- Tabelas: `operating_expenses` (nome + valor mensal em centavos) e `labor_costs`
  (pessoa ou função + salário mensal em centavos + horas mensais de referência,
  até 438 h). Migration `20261101220000_create_operating_expenses_and_labor_costs.sql`.
- Sem tabela filha nesta família: registro de linha única e exclusão lógica.
  A hora trabalhada (salário ÷ horas) é derivada na Etapa 6, não aqui.
- Telas: `/configuracoes/despesas` (com total mensal ativo no cabeçalho da tabela)
  e `/configuracoes/mao-de-obra`. Abas "Despesas" e "Mão de obra" no topo.
- Serviços em `services/supabase/costs.ts`; ações em `app/actions/costs.ts`;
  validações em `lib/validations/costs.ts`; converter horas em `lib/hours.ts`
  (vírgula aceita, "176,5"); parser e payload de `features/costs` (testados).
- Constraints no banco: valor maior que zero e horas entre 0 e 438 — rejeitados
  na migração testados com insert de 0 e 500.

---

## Precificação e rateio na configuração da empresa

A partir do reposicionamento do sistema (2026-11-03), `company_settings` também
guarda os parâmetros do rateio e das margens padrão:

| Coluna | Conteúdo |
|---|---|
| `monthly_output_units` | Volume mensal **estimado** de unidades, usado para ratear as despesas operacionais por unidade |
| `default_retail_margin` | Margem padrão de varejo (percentual 0–100) usada na matriz automática |
| `default_wholesale_margin` | Margem padrão de atacado (percentual 0–100) usada na matriz automática |

Regras:

- O sistema **não controla produção real**. Sem gravação do volume, é
  impossível ratear: nesse caso as despesas **não** entram no custo (0), em vez
  de bloquear o cálculo.
- A prioridade na matriz da home é: **última simulação do produto > margem
  padrão > valores de contingência (30% varejo / 20% atacado)**.
- Migration `20261103071000_add_cost_settings_to_company.sql` (aplicada ao
  Supabase em 2026-11-03).
- Formulário: seção "Precificação e rateio" no cadastro da empresa.
- Validação: `lib/validations/settings.ts` — volume inteiro > 0; margens entre
  0 e 100; campos opcionais ficam nulos quando vazios.
