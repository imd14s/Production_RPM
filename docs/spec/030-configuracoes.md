# Spec 030 — Configurações empresariais

**Etapa:** 4
**Status:** Em andamento — 4.1 (empresa e impostos) e 4.2 (canais e taxas) implementados
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
| 4.3 | Meios de pagamento e taxas | Pendente |
| 4.4 | Despesas fixas e mão de obra | Pendente |

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
| `src/features/settings/payload.test.ts` | contrato do payload enviado ao banco, campo a campo |
| `src/features/channels/payload.test.ts` | contrato do payload do canal e da taxa |
| `src/lib/navigation.test.ts` | Configurações visível só ao administrador |

## Verificação no banco (executada)

- `company_settings` rejeita segunda linha (singleton).
- `tax_settings` e `channel_fees` rejeitam percentual + fixo juntos e percentual > 100.
- Políticas RLS criadas para todas as tabelas novas.

## Pendências

- 4.3: meios de pagamento (Pix, débito, crédito à vista e parcelado) e taxas.
- 4.4: despesas fixas e mão de obra.
- Teste de escrita com sessão real de administrador e de operador no navegador.
