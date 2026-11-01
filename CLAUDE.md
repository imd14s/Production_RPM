# Regras do Agente

> Arquivo de regras para OpenCode (via `AGENTS.md`) e Claude CLI (via `CLAUDE.md`).
> Os dois arquivos descrevem as **mesmas regras**; em caso de divergência, vale o
> `AGENTS.md`, e em caso de conflito com o produto, vale o `task.md`.

---

## 1. Contexto do projeto

Sistema **interno** de gestão, custos e precificação do Ateliê Filhos de Aruanda.
Aplicação privada, sem cadastro público, com login obrigatório e usuários criados pelo
administrador (perfis **administrador** e **operador**).

| Camada | Tecnologia |
|--------|------------|
| Aplicação | Next.js 16 (App Router) — telas e servidor no mesmo projeto |
| Linguagem | TypeScript (`strict`) |
| Dados / Auth | Supabase — PostgreSQL, Auth, RLS, Storage |
| Hospedagem | Vercel |
| Estilo | CSS Modules + CSS convencional |
| Testes | Jest — **somente unitários de lógica** |
| Dinheiro | Centavos inteiros ou decimal seguro |

**Proibido:** Tailwind, backend independente (Express, NestJS, Spring Boot), Prisma nesta
versão, CSS-in-JS, banco proprietário da hospedagem, cadastro público, exportação de
dados para usuários.

A loja virtual é outro projeto. Este repositório é apenas o administrativo.

---

## 2. Comunicação

- Responder em **pt-BR**, em **linguagem de usuário/negócio**.
  - ✅ "O administrador cadastra um insumo e o sistema atualiza o custo do produto"
  - ❌ "Criei `updateSupplyCost()` no `SupplyService`"
- Exceção: arquivos em `./task/`, que devem ser técnicos.
- Ao entregar, listar arquivos criados, comandos executados, testes rodados e pendências.

---

## 3. Padrões de código

| Regra | Descrição |
|-------|-----------|
| Idioma | Código em **inglês**; interface em **pt-BR** |
| Nomenclatura | **camelCase** para variáveis e funções |
| Tamanho mínimo | **4 caracteres** |
| Exceções | `id`, `sku`, `url`, `cep`, `api`, `cpf`, `cnpj`, `gtin` |
| Nomes descritivos | Nunca nomes de uma letra |
| Documentação | **Comente cada função**: o que faz, parâmetros, retorno |
| Tipagem | **Tolerância zero** a `any` e `@ts-ignore` |

---

## 4. Fluxo de trabalho

### 4.1 Planejamento (leitura obrigatória, nesta ordem)

1. `./task.md` — especificação e etapas
2. `./docs/MEMORIA.md` — bugs, decisões e lições (não repita erros)
3. `./docs/MASTER_INDEX.md` — mapa de áreas
4. `./docs/spec/[dominio].md` — spec da funcionalidade
5. `./task/` — tasks e status

Identifique arquivos afetados, riscos e validações necessárias antes de escrever código.

### 4.2 Task

- Criar `./task/YYYY-MM-DD_HH-MM-nome_descritivo.md`.
- Cabeçalho: título, data/hora, agente e status.
- Corpo: objetivo, arquivos afetados, passo a passo técnico, critérios de aceitação.

### 4.3 Execução — **direto na `dev`, sem worktree**

- Trabalhe sempre na branch `dev`; commits diretos nela são permitidos.
- **Nunca** altere `main`; merge para `main` só com autorização.
- **Não** crie worktrees neste projeto.
- Antes de começar: `git checkout dev` e atualizar com o remoto.

### 4.4 Commits

- **Atômicos e pequenos**: uma mudança lógica por commit.
- Mensagens descritivas **em inglês**.
- Nunca commitar `.env.local`, chaves ou `service_role`.

### 4.5 Validação

Após cada mudança:

```bash
npm run typecheck
npm run lint
npm run test
```

Antes de reportar conclusão: `./pre-push.sh` (typecheck + lint + test).

**Zero erros e zero warnings.** Falhas de compilação, tipagem ou lint: corrija
autonomamente até passar. Erros **inesperados** de comportamento: pare, explique e
aguarde instrução — não entre em loop de tentativa e erro.

### 4.6 Code review

Revise criticamente o que produziu: lógica, segurança, tipagem, testes e aderência à
spec. Corrija antes de reportar conclusão.

---

## 5. Arquitetura e fronteiras

```
src/
├── app/            rotas (grupos (auth) e (dashboard)) e Server Actions
├── components/     ui, layout, forms, tables, feedback
├── features/       products, supplies, production, pricing,
│                   inventory, expenses, settings
├── services/       supabase/ (dados) e calculations/ (motor financeiro)
├── lib/            auth, validations, constants, utils
├── hooks/
├── types/
└── styles/         variables.css, typography.css, globals.css
```

- Cada componente visual tem seu par `Componente.tsx` + `Componente.module.css`.
- **Não** misture regra de negócio, acesso a dados e estilo no mesmo arquivo.
- Estilos globais: somente variáveis, reset, tipografia, tokens e tema.
- Regra de negócio reutilizável fica fora de componentes React.

### Acesso a dados e segurança

- Operações comuns: Supabase JS direto, protegido por **RLS**.
- Operações privilegiadas: **Server Actions / Route Handlers** no servidor.
- Nunca exponha `service_role` no navegador; nunca desative RLS.
- A interface não é mecanismo de segurança: autorização é verificada no servidor **e**
  no banco.
- Toda tabela privada tem política RLS; toda ação privilegiada valida o perfil.

---

## 6. Banco de dados e histórico

Antes de qualquer migration:

1. Modelo entidade-relacionamento
2. Chaves primárias e estrangeiras
3. Relacionamentos (incluindo prevenção de referência circular em kits)
4. Políticas RLS
5. Estratégia do histórico financeiro
6. Integridade referencial
7. Documentação da migration

Padrões: **UUID**, `created_at`/`updated_at`, FKs, constraints contra valores e
quantidades inválidos, **exclusão lógica** quando houver histórico, RLS em tudo.

**Imutabilidade:** alterar o preço de um insumo não pode mudar o custo de uma venda já
registrada. Guarde snapshots de custos, taxas e configurações por cálculo/operação.
Nunca altere migration já aplicada sem estratégia de migração.

Não crie todas as tabelas de uma vez: valide o diagrama primeiro.

---

## 7. Motor financeiro

- Local: `src/services/calculations/` — independente da interface e testável.
- Fórmula: `Preço = (Custo completo + Taxas fixas) / (1 - Percentuais variáveis - Margem)`.
- Valide o denominador **antes** de dividir: `≤ 0` ou nulo é erro explícito, nunca
  `NaN` ou `Infinity`.
- Alíquotas e taxas são **configuráveis**; nunca assuma valores universais.
- Preço calculado por **canal** e **modalidade** (varejo/atacado).
- Nenhuma fórmula em componente, página ou Server Action.

Casos de teste obrigatórios: fabricação, revenda, kits, impressão 3D, rateios, impostos,
taxas fixas, taxas percentuais, varejo, atacado, descontos, margem negativa e
denominador inválido.

---

## 8. Testes — somente unitários, de lógica

| Item | Regra |
|------|-------|
| Ferramenta | Jest |
| Arquivos | `src/**/*.test.ts` |
| Ambiente | `node` |
| Alvo | Lógica pura (cálculos, validações, conversões, utilitários) |

**Fora de escopo:** testes de componente (Testing Library), integração (MSW) e E2E
(Playwright). Não instale essas ferramentas sem autorização.

**Ciclo:**

1. Ler a spec
2. Escrever o teste
3. Rodar (falha esperada)
4. Implementar
5. Rodar (verde)
6. Refatorar

Testes e specs são **fonte de verdade**: quando um teste falha, corrija a implementação.
**Nunca** altere um teste existente para fazê-lo passar sem explicar o motivo e obter
autorização. Não use mocks que reimplementem regra de negócio.

---

## 9. Documentação e memória

- Toda mudança de regra, dependência ou configuração atualiza a spec em `./docs/spec/`
  **na mesma entrega**.
- `./docs/MEMORIA.md` é o registro permanente. Formato:

```
## [Tipo] - [Título descritivo] (YYYY-MM-DD)
**Problema Identificado:**
**Causa Raiz:**
**Correção:**
**Validação:**
**Lição:**
```

- Registre: bugs, decisões arquiteturais, lições aprendidas e workarounds.
- Não marque task como concluída com spec desatualizada.

---

## 10. Hierarquia de fontes de verdade

```
schema + migrations + RLS (banco)
  → testes do motor financeiro
    → services/calculations e domínio
      → testes de componentes
        → components / features / telas
```

---

## 11. Regras estritas

| # | Regra |
|---|-------|
| 1 | Trabalhar **somente na `dev`**, sem worktree; `main` intocada |
| 2 | Commits atômicos, pequenos e obrigatórios |
| 3 | Typecheck, lint e testes após cada mudança; `pre-push.sh` antes de concluir |
| 4 | Nunca alterar testes existentes sem autorização explícita |
| 5 | Nunca alterar arquivos de configuração (`eslint`, `tsconfig`, `jest.config.ts`, `pre-push.sh`) sem autorização |
| 6 | Zero `any` e zero `@ts-ignore` |
| 7 | Nunca desativar RLS nem expor chaves secretas |
| 8 | Nenhum cálculo financeiro fora de `services/calculations` |
| 9 | Nunca alterar migration aplicada sem estratégia de migração |
| 10 | Nenhuma tela fictícia, botão sem função ou dado simulado apresentado como real |
| 11 | Concluir, testar e documentar uma etapa antes de iniciar a seguinte |
| 12 | Testes são **somente unitários de lógica**; sem E2E, integração ou teste de componente sem autorização |

---

## 12. Skills

Carregue antes de implementar, quando existirem:

| Skill | Quando usar |
|-------|-------------|
| `tdd-ddt` | Testes TDD/DDT e motor de cálculo |
| `ui-ux-engineering` | Componentes, layouts, UI/UX |
| `frontend-architecture-guard` | Novos módulos ou reestruturação |
| `api-security-enforcer` | Server Actions, autenticação, dados sensíveis |
| `lgpd-compliance-ecommerce` | Dados pessoais e cookies |
| `pipeline-guardian` | CI/CD e pipelines |
| `make-docs` | Documentação técnica |

> Skills de backend Java/Spring e de frete/marketplace não se aplicam a este projeto.

---

## 13. Base de decisão e tratamento de erros

- Decida com base no projeto (`task.md`, specs, código, testes) e em documentação oficial
  atualizada. Não invente APIs, versões ou comportamentos.
- Documentação insuficiente: peça links ou informações ao usuário; não prossiga por
  suposição.
- Erro inesperado: pare, explique e aguarde. Erros de compilação, tipagem e lint seguem o
  protocolo de auto-correção da seção 4.5.
- A Etapa 1 está concluída; a próxima é a **Etapa 2 — Supabase e autenticação**. Não
  avance de etapa sem validar a anterior.
