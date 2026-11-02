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

---

## [Armadilha] - Conexão direta do Supabase é IPv6 e falha na rede local (2026-11-01)

**Problema Identificado:** aplicar a migration via `pg` retornou
`connect ENETUNREACH 2600:1f11:...:5432`.

**Causa Raiz:** `db.<ref>.supabase.co` publica apenas endereço IPv6; a rede local não tem
rota IPv6. O host do pooler (`aws-0-<região>.pooler.supabase.com`) resolve em IPv4, mas
exige a região correta e o usuário `postgres.<ref>`.

**Correção:** enquanto a string do pooler não é informada, a migration é aplicada pelo
SQL Editor do painel. `supabase/README.md` documenta as duas opções.

**Validação:** `npm run build`, `lint` e 33 testes verdes; falta apenas executar o SQL.

**Lição:** para automação em redes IPv4, usar sempre o **Session Pooler**, nunca a conexão
direta.

**Complemento (2026-11-01):** o tenant foi localizado em
`aws-1-ca-central-1.pooler.supabase.com` (usuário `postgres.fohqznrdiyudnquynkdt`). Com a
senha correta, a migration foi aplicada e o pooler passou a ser o `DATABASE_URL` do
projeto.

---

## [Armadilha] - `new URL()` corrompe senha de banco com `@` ou `%` (2026-11-01)

**Problema Identificado:** após reescrever o `DATABASE_URL` com `new URL(value)` e
`url.toString()`, a autenticação passou a falhar com `password authentication failed`. A
senha mudou de 15 para 21 caracteres.

**Causa Raiz:** a senha contém `@`; o parser tratou o trecho depois do `@` como host e
reconstruiu a URL com a credencial quebrada. Não havia backup do arquivo.

**Correção:** reescrever a string manualmente com `encodeURIComponent(senha)`, nunca
passando a senha por `new URL`.

**Validação:** conexão restabelecida e migration aplicada.

**Lição:** credenciais não passam por parser de URL. Ao manipular `DATABASE_URL`,
codifique a senha explicitamente e preserve o valor original fora do git.

---

## [Armadilha] - Desabilitar o provedor Email bloqueia todo login (2026-11-01)

**Problema Identificado:** `POST /auth/v1/token` retornou
`422 email_provider_disabled` mesmo com usuário válido.

**Causa Raiz:** ao tentar impedir cadastro público, o provedor **Email** foi desligado por
completo. Isso remove o login por e-mail/senha, não apenas o cadastro.

**Correção:** manter o provedor **Email** habilitado e desligar apenas
**"Allow new users to sign up"**.

**Validação:** `GET /auth/v1/settings` deve mostrar `external.email: true` e
`disable_signup: true`.

**Lição:** em Supabase, "desabilitar cadastro" e "desabilitar provedor" são chaves
diferentes; a primeira é `disable_signup`, a segunda derruba o login.

---

## [Decisão] - `profiles` é somente leitura para a aplicação (2026-11-01)

**Problema Identificado:** com a gestão de usuários no painel, políticas de escrita em
`profiles` dariam ao app um poder que ele não precisa.

**Causa Raiz:** a spec inicial previa que o administrador alterasse perfis dentro do
sistema.

**Correção:** RLS apenas com `select` (próprio perfil e, para administrador, todos). Sem
`insert`, `update` ou `delete`. O painel do Supabase usa credencial administrativa e não é
afetado por RLS.

**Validação:** migration `20261101170000_create_profiles.sql` e spec 010.

**Lição:** privilégio mínimo também vale para RLS: se a interface não escreve, o banco não
deve permitir escrita.

---

## [Decisão] - Menu lateral derivado de catálogo único (2026-11-01)

**Problema Identificado:** a Etapa 3 pede navegação para módulos que ainda não existem.
Links para rotas inexistentes geram 404 e contrariam a regra de não ter botão sem função.

**Alternativas avaliadas:** (a) criar páginas vazias "em construção" — gera tela fictícia;
(b) esconder módulos futuros — o usuário perde a visão do plano; (c) catálogo com
`available`.

**Correção:** `src/lib/navigation.ts` concentra o catálogo. Item `available: true` vira
link; `available: false` é renderizado como texto com etiqueta "em breve". A contagem de
módulos da tela inicial e o filtro por perfil saem da mesma fonte.

**Validação:** `src/lib/navigation.test.ts` cobre rota ativa, subrota, visibilidade por
perfil e separação entre disponíveis e planejados.

**Lição:** navegação é dado, não marcação repetida em cada tela. Um catálogo único evita
menu e página inicial contando coisas diferentes.

---

## [Armadilha] - Hora do servidor em UTC engana a saudação (2026-11-01)

**Problema Identificado:** a primeira versão da tela inicial usava `new Date().getHours()`
no servidor. Em produção (Vercel) o servidor roda em UTC: às 20h de Brasília o sistema
diria "Boa noite" corretamente por acaso, mas às 9h diria "Boa tarde".

**Causa Raiz:** `getHours()` depende do fuso do processo, não do usuário.

**Correção:** `getHourInTimeZone(date, "America/Sao_Paulo")` via `Intl.DateTimeFormat`, e
`formatLongDate` recebe o mesmo fuso. Teste cobre conversão de UTC para São Paulo e o caso
de meia-noite.

**Validação:** `src/lib/date.test.ts` (conversão, meia-noite, hora inválida).

**Lição:** data e hora exibidas ao usuário sempre declaram fuso. Nunca confie no fuso do
ambiente de execução — em hospedagem ele costuma ser UTC.

---

## [Decisão] - Taxa de canal é tabela filha, não coluna (2026-11-01)

**Problema Identificado:** um canal de venda tem várias taxas (comissão, frete,
adicional de anúncio), cada uma com condição de pagamento própria.

**Alternativas avaliadas:** colunas `fee_percentual`/`fee_fixo` no canal — não comporta
mais de uma taxa nem condição por faixa de parcelas.

**Correção:** `channel_fees` como filha de `sales_channels`, com `installments` opcional
(nulo = vale para qualquer condição). Mesma estrutura será replicada para
`payment_fees` na 4.3.

**Validação:** migration `20261101200000` e testes de validação de taxa.

**Lição:** quando o requisito diz "taxas configuráveis", o plural pede tabela filha.

---

## [Armadilha] - Importar constante do módulo errado passa no build e falha em runtime (2026-11-01)

**Problema Identificado:** `CHANNEL_KINDS` foi importado de `features/settings/types`,
onde não existe. `undefined.includes` estourou no primeiro teste de validação.

**Causa Raiz:** dois módulos de tipos com nomes parecidos (`settings` e `channels`) e
import automático apontando para o arquivo errado. TypeScript só acusaria em
`strict` se o tipo não existisse — a constante existia em outro módulo com o mesmo
nome do esperado pela leitura apressada.

**Correção:** importar de `@/features/channels/types`. O teste de validação pegou o
erro antes da tela existir.

**Validação:** `src/lib/validations/channels.test.ts` (10 testes).

**Lição:** módulos de tipos de domínios irmãos são terreno de importação confusa;
o teste unitário da validação é quem segura esse tipo de escorregão.

---

## [Armadilha] - Cliente Supabase usa `Date.now()` e quebra o pré-render (2026-11-01)

**Problema Identificado:** ao navegar para `/home` e `/configuracoes`, o console do
navegador exibia `Next.js encountered the unstable value Date.now() while prerendering`
com origem em `DashboardLayout`. A tela funcionava, mas o overlay de erro insistia.

**Causa Raiz:** com Cache Components ativo, o Next tenta pré-renderizar o shell de cada
rota. O cliente Supabase (`@supabase/ssr`) compara `expires_at` com `Date.now()` ao
validar a sessão — e relógio não pode rodar dentro de pré-render, nem com
`instant = false` (que só desliga a validação de navegação, não o pré-render).

**Correção:** `await connection()` (de `next/server`) como primeira instrução de **toda
função que lê o Supabase durante renderização**, não apenas no layout: `getSessionContext`
e as funções de leitura em `services/supabase/`. O Next pré-renderiza cada segmento
individualmente (partial prefetching), então corrigir só o layout da raiz fez o erro
migrar para `SettingsLayout`. Em Server Actions a chamada resolve na hora, sem efeito.

**Validação:** `grep "Date.now\|unstable value"` no log do servidor após acessar
`/home`, `/configuracoes`, `/configuracoes/impostos` e `/configuracoes/canais`:
zero ocorrências; build e testes segue verdes.

**Lição:** bibliotecas de terceiros podem esconder chamadas de relógio. Com Cache
Components, a proteção pertence à função que acessa os dados — não à rota —
porque os segmentos são pré-renderizados isoladamente.

---

## [Armadilha] - `connection()` fora de `<Suspense>` exige rota bloqueante na página (2026-11-01)

**Problema Identificado:** após centralizar `await connection()` nos leitores de
dados, o Next passou a acusar `Next.js encountered uncached data during
prerendering or a navigation` em `/configuracoes` — a chamada estava fora de
`<Suspense>` e a página não declarava `instant = false`.

**Causa:** `instant = false` declarado no *layout* não alcança o segmento da
*página*: cada segmento é pré-renderizado isoladamente e precisa declarar
sozinho que é bloqueante.

**Correção:** `export const instant = false` em cada página que lê dados
(`/home`, `/configuracoes`, `/impostos`, `/canais`; `[id]` e `login` já tinham).
A mensagem de erro do Next lista as três saídas (Suspense, cache, bloqueio) —
neste sistema a escolha é bloqueio: dados de sessão e de banco mudam a tela
inteira, placeholder não agrega.

**Validação:** `grep "uncached data\|Date.now\|unstable value"` no log após
acessar todas as rotas: zero ocorrências.

**Lição:** a configuração de segmento vale **por segmento**. Página nova que lê
banco ou sessão nasce com `instant = false`.

---

## [Armadilha] - Falha silenciosa na gravação escondia o erro real (2026-11-01)

**Problema Identificado:** ao salvar a empresa, a tela voltou vazia com "Nenhum dado
cadastrado ainda" e nada foi gravado — sem explicar o motivo. O banco, testado
diretamente com a role `authenticated` e os claims do usuário, aceitou o mesmo insert.

**Causa Raiz:** dois fatores somados. (1) O serviço devolvia mensagem genérica sem o
código do erro do Supabase, impossibilitando o diagnóstico. (2) A quebra de pré-render
(`Date.now`) durante a revalidação fazia a atualização da tela falhar e o navegador
caía de volta numa recarga completa, apagando o formulário não controlado.

**Correção:** mensagens de erro dos serviços passam a incluir o código
(`(código 42501)`, por exemplo) e o pré-render foi interrompido em todas as leituras
(entrada anterior). Com o fluxo estável, qualquer falha real aparece no alerta vermelho
com o código para diagnóstico imediato.

**Validação:** inserção simulada como o usuário real no banco: `is_admin()` verdadeiro,
insert aceito, linha visível.

**Lição:** quando algo falha sem explicação, checar primeiro (a) se o erro está sendo
engolido por uma mensagem genérica e (b) se um erro de renderização anterior não está
derrubando a atualização da tela.

---

## [Decisão] - Máscara na digitação, dígitos no banco (2026-11-01)

**Problema Identificado:** CNPJ, telefone e CEP eram salvos como dígitos, mas o campo não
formatava enquanto o usuário digitava e não ficava claro o formato aceito.

**Correção:** `TextField` ganhou a prop opcional `format` (função pura, testada em
`features/settings/format.ts`). O campo vira controlado somente quando tem máscara.
A validação continua aceitando entrada com ou sem pontuação — tudo é reduzido a dígitos
antes de ir ao banco.

**Validação:** testes de `formatCnpj`, `formatPhone`, `formatZipCode` incluem valores
colados completos e digitação parcial.

**Lição:** máscara é preocupação do campo, não da validação: o banco sempre recebe a
forma canônica (só dígitos), e a formatação pode evoluir sem tocar em regra de negócio.

---

## [Decisão] - Teste de payload como contrato de gravação (2026-11-01)

**Problema Identificado:** a pergunta "os inputs estão sendo salvos?" não tinha resposta
automatizada — nada provava que o formulário chega ao banco com todos os campos.

**Correção:** construtores de payload puros (`buildCompanyPayload`, `buildTaxPayload`,
`buildChannelPayload`, `buildChannelFeePayload`) com teste que compara o objeto inteiro
campo a campo, incluindo a conversão de string vazia para `null` nas colunas opcionais.
Os serviços só montam o payload e enviam.

**Validação:** `features/settings/payload.test.ts` e `features/channels/payload.test.ts`.

**Lição:** teste full-stack exigiria sessão real — fora do escopo de testes unitários.
O contrato testável é a fronteira pura: formulário validado → payload do banco.

---

## [Decisão] - Componentes de tabela, modal e notificação adiados (2026-11-01)

**Problema Identificado:** a Etapa 3 do `task.md` menciona tabelas, formulários, modais e
notificações, mas nenhuma tela desta etapa precisa deles.

**Correção:** criar apenas `Button`, `Badge`, `Card` e os componentes de layout. Tabela,
modal, formulário genérico e notificações entram junto com a primeira tela real que os use
(Etapa 4 em diante).

**Validação:** spec 020 registra o escopo e o motivo.

**Lição:** componente sem consumidor é código morto. A ordem correta é tela real →
componente necessário, não o contrário.

---

## [Armadilha] - Expectativas iniciais de testes de produto estavam incorretas (2026-11-02)

**Problema Identificado:** os testes não passavam para a soma do custo material e para
uma composição que cria ciclo indireto.

**Causa Raiz:** o esperado do custo ignorava uma linha de 200 centavos; o caso de ciclo
testava `subproduto → kit` quando já existia `kit → subproduto`.

**Correção:** com autorização, corrigidos somente os dois resultados esperados e a
descrição do teste de ciclo. A lógica de custo material também passou a rejeitar entradas
fora da precisão/intervalo e totais acima de `Number.MAX_SAFE_INTEGER`.

**Validação:** o typecheck, o lint e 223 testes unitários passaram; `npm run build` também
gerou a rota `/produtos`.

**Lição:** revisar os valores e as arestas de um teste antes de ajustar a implementação;
testes de domínio precisam representar a matemática e o grafo que declaram.

---

## [Decisão] - Cadastro de produtos com ficha técnica transacional (2026-11-02)

**Problema Identificado:** a subetapa 5.3 tinha apenas a migration inicial e funções
isoladas; ainda não havia cadastro, validação completa ou garantia atômica da composição.

**Causa Raiz:** o trabalho anterior parou antes de conectar banco, Server Actions,
validações, navegação e interface.

**Correção:** criados tipos, validações, tela `/produtos`, ações administrativas e uma RPC
invoker para gravar produto e componentes na mesma transação. A migration complementar
protege a árvore contra ciclos concorrentes e exige componentes do tipo produto em kits.
RLS e auditoria existentes foram mantidas; preço de venda permaneceu fora do escopo.

**Validação:** `npm run typecheck`, `npm run lint`, `npm run test -- --ci`,
`npm run build` e `./pre-push.sh`; as migrations foram revisadas, mas não aplicadas ao
Supabase nesta tarefa.

**Lição:** validar ciclos na interface melhora a mensagem, mas a integridade deve ser
garantida no banco e a gravação da ficha precisa ser atômica.


