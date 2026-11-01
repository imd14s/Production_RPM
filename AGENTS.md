# Instruções do Agente — Ateliê Filhos de Aruanda

> Sistema **interno** de gestão, custos e precificação.
> `./task.md` é a **fonte de verdade** do produto. Este arquivo só define *como* trabalhar.
> Em qualquer conflito, **`task.md` vence**.

---

## 1. Escopo e stack (não negociável)

Aplicação web **privada** (sem cadastro público), com login obrigatório e usuários
administrados pelo administrador. Perfis: **administrador** e **operador**.

| Camada | Tecnologia |
|--------|------------|
| Aplicação | Next.js (App Router) — frontend e servidor no mesmo projeto |
| Linguagem | TypeScript |
| Dados / Auth | Supabase (PostgreSQL, Auth, RLS, Storage quando necessário) |
| Hospedagem | Vercel |
| Estilo | CSS Modules + CSS convencional |
| Versionamento | Git + GitHub |
| Dinheiro | Centavos inteiros ou decimal seguro — nunca float sem tratamento |

**Proibido como padrão:** Tailwind, backend independente (Express/NestJS/Spring Boot),
Prisma nesta primeira versão, CSS-in-JS, banco proprietário da hospedagem, cadastro
público, exportação de dados para usuários.

Este repositório é o sistema **administrativo**. A loja virtual é projeto separado e
não deve ser misturada aqui.

---

## 2. Leitura obrigatória antes de qualquer alteração

Leia silenciosamente, nesta ordem:

1. **`./task.md`** — especificação do produto e plano por etapas
2. **`./docs/MEMORIA.md`** — bugs, decisões e lições aprendidas (nunca repita erros)
3. **`./docs/MASTER_INDEX.md`** — mapa de áreas (dados, servidor, telas, cálculos)
4. **`./docs/spec/[dominio].md`** — spec da funcionalidade afetada
5. **`./task/`** — tasks e status atual

> Esses arquivos ainda **não existem**: são criados na **Etapa 1 (Fundação)**.
> Enquanto não existirem, trabalhe apenas com `task.md` e reporte a ausência — não
> invente documentação paralela.

---

## 3. Fluxo de trabalho

### 3.1 Planejamento
1. Ler a cadeia da seção 2
2. Identificar arquivos afetados, riscos e dependências
3. Criar a task em `./task/YYYY-MM-DD_HH-MM-nome_descritivo.md` (detalhe técnico é
   permitido e esperado na task)
4. Apresentar o plano e aguardar aprovação antes de executar

### 3.2 Execução — **direto na `dev`, sem worktree**
- Trabalhe **sempre na branch `dev`**. Commits diretos na `dev` são permitidos.
- **Nunca** altere `main`. **Nunca** faça merge para `main` sem autorização.
- **Não** crie worktrees. Fluxo single-agent é o padrão deste projeto.
- Antes de começar: `git checkout dev` e garantir que está atualizada.

### 3.3 Commits (obrigatórios)
- Commits **atômicos e pequenos**: uma mudança lógica = um commit.
- Mensagens descritivas **em inglês** (ex.: `add pricing calculation module`).
- Nunca commitar credenciais, `.env` real ou chaves do Supabase.

### 3.4 Validação (obrigatória)
Após **cada** mudança:
1. `npm run typecheck`
2. `npm run lint`
3. Testes impactados (`npm test` / alvo específico)

Antes de reportar conclusão: rodar `./pre-push.sh`.
Se o script ainda não existir, registre isso como pendência — **não** crie versão
alternativa silenciosa.

**Zero erros e zero warnings.** Corrija autonomamente falhas de compilação, tipagem e
linter (loop silencioso). Erros **inesperados** de comportamento: pare, explique e
aguarde instrução — não entre em loop de tentativa e erro.

---

## 4. Padrões de código

| Regra | Descrição |
|-------|-----------|
| Idioma | Código em **inglês**; interface e textos em **pt-BR** |
| Nomenclatura | **camelCase** para variáveis e funções |
| Tamanho mínimo | Nomes com **no mínimo 4 caracteres** |
| Exceções | `id`, `sku`, `url`, `cep`, `api`, `cpf`, `cnpj`, `gtin` |
| Nomes descritivos | Nunca use nomes de uma letra |
| Documentação | **Comente cada função**: o que faz, parâmetros, retorno |
| Tipagem | **Tolerância zero** a `any` e `@ts-ignore` |

---

## 5. Arquitetura e fronteiras

```
src/
├── app/            rotas (grupos (auth) e (dashboard)) e Server Actions
├── components/     ui, layout, forms, tables, feedback (compartilhados)
├── features/       products, supplies, production, pricing, inventory, expenses, settings
├── services/       supabase/ (acesso a dados) e calculations/ (motor financeiro)
├── lib/            auth, validations, constants, utils
├── hooks/
├── types/
└── styles/         globals.css, variables.css, typography.css
```

Regras:
- Cada componente visual tem seu par `Componente.tsx` + `Componente.module.css`.
- **Não** misture regra de negócio, consulta ao banco e estilo no mesmo arquivo.
- Estilos globais servem **somente** para variáveis, reset, tipografia, tokens e tema.
- Toda regra de negócio reutilizável fica fora de componentes React.

### Acesso a dados
- Operações comuns: **Supabase JS direto**, protegido por RLS.
- Operações privilegiadas (administração de usuários, alterações sensíveis):
  **Server Actions / Route Handlers** no servidor.
- **Nunca** exponha `service_role` no navegador. **Nunca** desative RLS para facilitar
  o desenvolvimento. A interface não é mecanismo de segurança — a autorização é
  verificada no servidor **e** no banco.

---

## 6. Dados e histórico

Antes de qualquer migration:
1. Modelo entidade-relacionamento
2. Chaves primárias e estrangeiras
3. Relacionamentos (inclusive prevenção de referência circular em kits/componentes)
4. Políticas RLS
5. Planejamento do histórico financeiro
6. Integridade referencial
7. Documentação da migration

Padrões: **UUID**, `created_at`/`updated_at`, FKs, constraints contra valores e
quantidades inválidos, **exclusão lógica** quando houver histórico relacionado, **RLS em
todas as tabelas privadas**.

**Imutabilidade histórica:** alterar preço de insumo não pode mudar custo de venda já
registrada. Guarde *snapshots* de custos, taxas e configurações usados em cada cálculo
ou operação. **Nunca** altere uma migration já aplicada sem estratégia de migração.

**Não** crie todas as tabelas de uma vez: valide o diagrama antes.

---

## 7. Motor financeiro (regra crítica)

- Vive em `src/services/calculations/`, **independente da interface** e testável.
- Nenhuma fórmula em componente, página ou Server Action.
- Fórmula-base: `Preço = (Custo completo + Taxas fixas) / (1 - Percentuais variáveis - Margem)`.
- Valide o denominador **antes** de dividir: `≤ 0` ou nulo é erro explícito, nunca NaN/Infinity.
- Regras fiscais são **configuráveis**. Nunca assuma alíquota universal.
- Preço calculado individualmente por **canal** e **modalidade** (varejo/atacado).

Testes obrigatórios: custo de fabricação, revenda, kits, impressão 3D, rateios,
impostos, taxas fixas, taxas percentuais, varejo, atacado, descontos, margem negativa e
denominador inválido.

---

## 8. Testes

| Camada | Onde | Foco |
|--------|------|------|
| Unit | `src/**/*.test.ts(x)` — Jest + Testing Library | Componente e funções isoladas, motor de cálculo |
| Integration | `src/**/*.integration.test.tsx` — MSW (futuro) | Contrato de dados sem backend real |
| E2E | `tests-e2e/*.spec.ts` — Playwright | Login, RBAC, rotas privadas, fluxo completo |

- Testes e specs são **fonte de verdade**: teste falhou → corrija a implementação.
- **Nunca** altere um teste existente para fazê-lo passar. Se precisar, explique o
  motivo e aguarde autorização.
- Integration/E2E não podem usar `jest.mock` de serviço — isso recria a regra de negócio
  em TypeScript e divergência silenciosa.

---

## 9. Documentação

- Toda mudança de regra de negócio, dependência ou configuração atualiza a spec
  correspondente em `./docs/spec/` **na mesma entrega**.
- `./docs/MEMORIA.md` recebe imediatamente: bugs (causa raiz, correção, validação),
  decisões arquiteturais (alternativas e motivo), lições e workarounds.
- Formato de entrada: `## [Tipo] - [Título] (YYYY-MM-DD)` com Problema, Causa, Correção,
  Validação, Lição.
- Não marque tarefa como concluída com spec desatualizada.

---

## 10. Comunicação

- Responder em **pt-BR**, em **linguagem de negócio** ("o administrador gera a etiqueta",
  não "implementei `generateLabel()`").
- Exceção: arquivos de `./task/`, que devem ser técnicos.
- Ao concluir uma etapa: listar arquivos criados, comandos executados, testes rodados e
  pendências.

---

## 11. Hierarquia de fontes de verdade

```
schema + migrations + RLS (banco)
  → testes do motor financeiro
    → services/calculations e domínio
      → testes de componentes
        → components / features / telas
```

---

## 12. Regras estritas

| # | Regra |
|---|-------|
| 1 | Trabalhar **somente na `dev`**, sem worktree; `main` intocada |
| 2 | Commits atômicos, pequenos e obrigatórios |
| 3 | Typecheck, lint e testes após cada mudança; `pre-push.sh` antes de concluir |
| 4 | Nunca alterar testes existentes sem autorização explícita |
| 5 | Nunca alterar arquivos de configuração (`eslint`, `tsconfig`, `pre-push.sh`) sem autorização |
| 6 | Zero `any` e zero `@ts-ignore` |
| 7 | Nunca desativar RLS nem expor chaves secretas |
| 8 | Nenhum cálculo financeiro fora de `services/calculations` |
| 9 | Nunca alterar migration aplicada sem estratégia de migração |
| 10 | Nenhuma tela fictícia, botão sem função ou dado simulado apresentado como real |
| 11 | Concluir, testar e documentar uma etapa antes de iniciar a seguinte |

---

## 13. Skills

Carregue a skill antes de implementar, quando ela existir:

| Skill | Quando usar |
|-------|-------------|
| `tdd-ddt` | Testes TDD/DDT, motor de cálculo |
| `ui-ux-engineering` | Componentes, layouts, UI/UX |
| `frontend-architecture-guard` | Novos módulos ou reestruturação |
| `api-security-enforcer` | Server Actions, autenticação, dados sensíveis |
| `lgpd-compliance-ecommerce` | Dados pessoais e cookies |
| `pipeline-guardian` | CI/CD e pipelines |
| `make-docs` | Documentação técnica |

> Skills de backend Java/Spring e de frete/marketplace **não se aplicam** a este projeto.

---

## 14. Etapas de entrega

A ordem oficial está em `./task.md` (Fundação → Supabase/Auth → Interface →
Configurações → Cadastros → Precificação → Produção/Estoque → Relatórios →
Publicação). **Não** desenvolva o sistema inteiro de uma vez e **não** avance de etapa
sem validar a anterior.

---

## Apêndice — Conflitos resolvidos em relação à versão anterior deste arquivo

| Regra anterior | Situação | Motivo |
|----------------|----------|--------|
| "Nunca commitar na `dev`; usar worktrees" | **Substituída** | Decisão do projeto: fluxo single-agent direto na `dev` |
| "Backend Java/Spring + Clean Architecture + `mvn`" | **Removida** | `task.md` proíbe backend independente |
| "Hierarquia: tests backend (API) → backend" | **Adaptada** | Não existe API separada; a verdade é schema + motor de cálculo |
| "Skills `backend-clean-arch-guard`, `api-melhor-envio`" | **Removidas** | Sem backend próprio e sem integração de frete |
| "Nunca modificar `dev` e `main`" | **Ajustada** | `dev` é a branch de trabalho; `main` permanece protegida |
