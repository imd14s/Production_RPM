# Memória do Projeto

Registro permanente de decisões, bugs, lições e workarounds.
Consulte no início de toda sessão e registre toda descoberta relevante.

Formato:

```
## [Tipo] - [Título descritivo] (YYYY-MM-DD)
**Problema Identificado:**
**Causa Raiz:**
**Correção:**
**Validação:**
**Lição:**
```

---

## [Decisão] - Projeto administrativo separado da loja virtual (2026-11-01)

**Problema Identificado:** risco de misturar cadastro público de produtos com dados
sensíveis de custos, fornecedores, margens e impostos.

**Causa Raiz:** a loja já existe em outro projeto Next.js e tem público próprio.

**Correção:** este repositório contém somente o sistema administrativo interno. A loja
permanece separada; integração futura será por contrato explícito, não por código
compartilhado.

**Validação:** estrutura de pastas e rotas criadas apenas para o administrativo.

**Lição:** separar os dois produtos desde o início evita vazamento de dados de custo e
permissões administrativas no site público.

---

## [Decisão] - Fluxo de trabalho direto na `dev`, sem worktrees (2026-11-01)

**Problema Identificado:** as regras antigas exigiam worktrees para qualquer alteração,
o que adiciona cerimônia desnecessária em um projeto tocado por um único agente.

**Causa Raiz:** as regras foram herdadas de um projeto multi-agente com backend Java.

**Correção:** trabalho direto na branch `dev`, com commits atômicos obrigatórios. A
branch `main` permanece intocada e merge para ela exige autorização.

**Validação:** `AGENTS.md` e `CLAUDE.md` atualizados; branch `dev` criada.

**Lição:** simplificar o fluxo não pode significar abandonar histórico — commits pequenos
seguem obrigatórios.

---

## [Decisão] - Somente testes unitários de lógica (2026-11-01)

**Problema Identificado:** as regras anteriores previam três camadas (unit, integração
com MSW e E2E com Playwright) sem que houvesse backend próprio.

**Causa Raiz:** herança de um projeto com backend Spring Boot e automação de navegador.

**Correção:** a v1 usa apenas testes unitários com Jest, cobrindo lógica pura (motor de
cálculo, validações, utilitários). Testes de componente, integração e E2E ficam fora do
escopo até decisão contrária.

**Validação:** `npm run test` executa `src/lib/utils/currency.test.ts` com 10 casos.

**Lição:** testar a lógica onde ela vive — em módulos puros — dá a maior cobertura com o
menor custo de manutenção.

---

## [Armadilha] - `create-next-app` recusa diretório com maiúsculas (2026-11-01)

**Problema Identificado:** `npx create-next-app .` falhou com "name can no longer contain
capital letters" porque o diretório se chama `Production_RPM`.

**Causa Raiz:** o nome do pacote é derivado do nome da pasta e o npm exige minúsculas.

**Correção:** o projeto foi gerado em um diretório temporário com nome válido
(`atelie-admin`) e os arquivos foram copiados para cá. O `package.json` foi renomeado
para `atelie-filhos-de-aruanda`.

**Validação:** `npm run build` e `npm test` executam normalmente.

**Lição:** o nome da pasta do repositório não precisa ser igual ao nome do pacote npm.

---

## [Decisão] - Fundação com Next.js 16, App Router e CSS Modules (2026-11-01)

**Problema Identificado:** necessidade de uma base mínima, sem telas fictícias, que
prove stack, tipagem, lint, testes e validação automatizada.

**Causa Raiz:** primeira etapa do plano em `task.md`.

**Correção:** projeto criado com Next.js 16.4.3, React 19, TypeScript strict, ESLint,
Jest (unitário) e CSS Modules. Sem Tailwind e sem backend independente. Estilos globais
restritos a tokens, tipografia e reset em `src/styles/`.

**Validação:** `./pre-push.sh` roda tipagem, lint e testes; `npm run build` gera a rota
`/` como estática.

**Lição:** a fundação só está pronta quando o pipeline local roda de ponta a ponta.

---

## [Decisão] - Identidade visual "Aruanda Gestão — Natural & Moderno" (2026-11-01)

**Problema Identificado:** a fundação nasceu com paleta provisória (roxo), sem relação com
o uso real do sistema — sessões longas de cadastro, tabelas e leitura de números.

**Causa Raiz:** etapa 1 tinha como objetivo apenas validar a stack.

**Correção:** adotada a paleta definida em `visual.md`: verde petróleo `#174D43` como cor
de ação, verde natural `#39866B`, âmbar `#D5A044` para destaques pontuais, fundo suave
`#F4F6F2` e texto grafite esverdeado `#25352F`. Tokens atualizados em
`src/styles/variables.css`; modo escuro adiado.

**Validação:** `npm run build`, `npm run lint` e `npm run test` continuam verdes.

**Lição:** a identidade define os tokens antes das telas; telas devem consumir variáveis,
nunca cores literais.

---

## [Decisão] - Gestão de usuários fora da aplicação (2026-11-01)

**Problema Identificado:** a especificação original previa que o administrador criasse e
convidesse usuários dentro do sistema, o que exigiria `service_role` no servidor e uma
tela de gestão de identidade.

**Causa Raiz:** conveniência de centralizar tudo em uma única interface.

**Correção:** a criação, redefinição de senha, desativação e definição de perfil passam a
ser feitas **no painel do Supabase**, pelo responsável do projeto. A aplicação apenas
autentica, mantém sessão e lê o perfil em `profiles` respeitando RLS.

**Consequências:**

- `SUPABASE_SERVICE_ROLE_KEY` deixa de existir no `.env.local` — a aplicação usa somente
  a chave publicável.
- Não há telas de cadastro, convite, troca de senha ou gestão de usuários.
- O cadastro público continua desabilitado no Supabase.
- `DATABASE_URL` fica apenas para migrations; o runtime não a utiliza.

**Validação:** spec `docs/spec/010-autenticacao.md` e regras do agente atualizadas.

**Lição:** tirar a gestão de identidade da aplicação elimina a credencial mais perigosa do
sistema — não há como vazar o que não existe no código.


