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


---

## [Decisão] - Conversões de unidade por insumo (2026-11-02)

**Problema Identificado:** insumos podem ser comprados/usados em unidades
diferentes da unidade base (ex.: compra em quilograma, uso em grama), e sem
fator de conversão cadastrado a precificação exigiria cálculo manual.

**Causa Raiz:** a Etapa 5.2 fixou uma única unidade por insumo; a subetapa 5.4
precisava registrar fatores sem alterar o motor de custo.

**Correção:** criada a tabela `supply_unit_conversions` (filha de `supplies`)
com `from_unit`, `to_unit`, `factor` (numeric 12,6), exclusão lógica, RLS e
auditoria. UI na página de detalhe do insumo. A integração ao cálculo de custo
fica para a Etapa 6.

**Validação:** typecheck, lint, testes e pre-push verdes (234 testes).

**Lição:** cadastrar o fator como dado (par ordenado de unidades) evita
ambiguidade e mantém a precificação fora do cadastro.

---

## [Bug] - Listas de configurações não refletiam alterações (2026-11-02)

**Problema Identificado:** após cadastrar ou ativar/desativar alguns registros, a
lista, os totais e as contagens de taxas podiam continuar mostrando os dados anteriores
até uma atualização manual da página.

**Causa Raiz:** os painéis clientes recebiam as listas como propriedades renderizadas no
servidor, mas alguns fluxos só limpavam o formulário; outros definiam um callback para
atualizar os dados sem conectá-lo ao formulário de ativação. Despesas e mão de obra não
atualizavam a rota no painel após as ações.

**Correção:** atualizar os dados da rota após gravações bem-sucedidas e após ativar ou
desativar registros nas listas de impostos, canais, taxas de canais, meios e taxas de
pagamento, despesas e mão de obra. A gravação da empresa já revalidava sua rota e não
tem lista associada.

**Validação:** `npm run typecheck`, `npm run lint`, `npm run test` e `./pre-push.sh`
passaram; 38 suítes e 268 testes unitários.

**Lição:** limpar o estado do formulário não atualiza propriedades de Server Components;
após uma mutação bem-sucedida, invalidar os dados e atualizar a rota que os exibe.

---

## [Bug] - Parsers descartavam taxas com percentual numérico (2026-11-02)

**Problema Identificado:** as telas de impostos, taxas de canal e taxas de pagamento
indicavam lista vazia apesar de haver registros ativos no banco.

**Causa Raiz:** consultas Supabase retornam colunas PostgreSQL `numeric` como números
JSON; os parsers aceitavam somente strings para `rate` e retornavam `null`, removendo a
linha da lista. Os testes cobriam somente taxas em string e não verificavam o valor
formatado exibido pela tabela.

**Correção:** o parser compartilhado de percentual passa a aceitar string ou número,
validar a faixa e normalizar para o formato canônico. Os três parsers usam essa função;
testes sem mocks percorrem o formato numérico de banco até o percentual formatado que
cada célula exibe.

**Validação:** testes focados cobriram os 3 parsers com percentuais numéricos e os rótulos
formatados usados nas células, sem mocks; typecheck, lint e `./pre-push.sh` passaram.

## [Bug] - Aquisição não registrava a unidade de compra (2026-11-02)

**Problema Identificado:** o formulário salvava a quantidade digitada sem registrar
em qual unidade o insumo havia sido comprado, e o histórico não mostrava essa medida.

**Causa Raiz:** `supply_prices` não tinha coluna para a unidade original; o cálculo do
custo assumia que toda quantidade já estava na unidade base do insumo.

**Correção:** adicionada migration com backfill para `purchase_unit`, seleção da unidade
no formulário, exibição no histórico e conversão no servidor antes de calcular o
snapshot por unidade base. Conversões ausentes ou conflitantes bloqueiam o salvamento;
conversões recíprocas consistentes são aceitas.

**Validação:** testes unitários sem mocks cobrem parsing, validação, apresentação da
quantidade, conversão direta/inversa, ausência, inatividade e conflito. `npm run
typecheck`, `npm run lint` e `./pre-push.sh` passaram; a execução completa contém 38
suítes e 282 testes aprovados. A migration ainda depende de aplicação manual no Supabase.

**Lição:** unidade de medida precisa acompanhar a quantidade no dado histórico e ser
normalizada antes do snapshot de custo; não deve ser inferida apenas da unidade atual do
cadastro.

## [Decisão] - Conversões métricas automáticas na compra (2026-11-02)

**Problema Identificado:** o cadastro manual de fatores de conversão exigia uma tela
separada até para equivalências universais como quilograma e grama.

**Causa Raiz:** a implementação anterior generalizou fatores específicos de insumos
(por exemplo, conteúdo de um pacote) para relações métricas fixas.

**Correção:** removidos a tela, as ações e os serviços de cadastro manual. A aplicação
converte automaticamente quilograma/grama e litro/mililitro em ambas as direções. Para
unidades sem equivalência universal, a compra precisa usar a unidade base do insumo.
A migration histórica da tabela de conversões é preservada, mas deixou de ser usada.

**Validação:** testes unitários sem mocks cobrem conversões métricas nos dois sentidos,
unidade igual e rejeição de unidades incompatíveis. `./pre-push.sh` passou: typecheck,
lint, 38 suítes e 271 testes.

**Lição:** automatizar equivalências físicas universais; não presumir fatores para
embalagens cujo conteúdo depende do produto ou fornecedor.

## [Bug] - Seletor de compra oferecia unidades incompatíveis (2026-11-02)

**Problema Identificado:** o seletor permitia escolher litro para insumo cuja unidade
base era grama; o servidor então rejeitava a gravação ao não ser possível converter
volume em massa sem conhecer a densidade.

**Causa Raiz:** a lista da interface mostrava todas as unidades suportadas, embora o
cálculo de custo só aceite a unidade base ou sua equivalente métrica no mesmo tipo.

**Correção:** o seletor agora oferece kg, gm, L, unidade e outro sem filtrar pela unidade
base. A compra salva quantidade e unidade escolhidas mesmo quando não há conversão
possível. Compras incompatíveis são exibidas no histórico, mas não fornecem custo para
precificação por unidade base. Parsing aceita números vindos do PostgreSQL e o histórico
formata quantidade e unidade em pt-BR.

**Validação:** testes unitários sem mocks cobrem opções compatíveis, payload que preserva
quantidade/unidade originais, leitura de colunas numéricas como string e exibição
formatada. A validação final está registrada na task da correção.

**Lição:** salvar a aquisição e usar seu custo na precificação são etapas distintas; não
bloquear a compra nem atribuir custo incorreto à unidade base.

**Lição:** testar somente o formato canônico não cobre a fronteira real do banco;
testes do parser devem refletir o tipo JSON efetivamente recebido e validar a saída de
apresentação consumida pela tela.

## [Melhoria] - Cadastro de insumo com primeira compra em um formulário (2026-11-02)

**Problema Identificado:** cadastrar um insumo e registrar sua primeira compra exigia
dois formulários e etapas separadas.

**Causa Raiz:** os dados do insumo e os dados da aquisição eram enviados por ações
independentes, sem garantir que ambos fossem persistidos juntos.

**Correção:** o formulário único de novo insumo reúne os dados do insumo e da compra,
sem seção visual separada. Observação fica por último. A função transacional
`create_supply_with_initial_price` persiste ambos com RLS e autorização administrativa.
Edição e compras posteriores mantêm seus fluxos próprios.

**Validação:** `./pre-push.sh` passou após a unificação: typecheck e lint sem avisos;
38 suítes e 279 testes. Não foi feita aplicação remota da migration nesta sessão.

**Lição:** operações que formam um único cadastro completo devem ser validadas juntas e
gravadas atomicamente.

## [Ajuste de interface] - Formulário de insumo sem seção de compra (2026-11-02)

**Problema Identificado:** o cadastro mostrava uma divisão visual e textos de “primeira
compra”, embora os dados pertençam ao mesmo formulário de novo insumo.

**Causa Raiz:** os campos da aquisição tinham sido agrupados em uma seção distinta.

**Correção:** removida a separação visual e os textos de “primeira compra”; os campos
continuam no formulário único. Observação passou para o fim dos campos.

**Validação:** `./pre-push.sh` passou: typecheck e lint sem avisos; 38 suítes e 279 testes.

**Lição:** um único fluxo de cadastro deve ser apresentado sem divisões que sugiram etapas
independentes.

## [Bug] - Coluna da unidade de compra ausente no Supabase (2026-11-02)

**Problema Identificado:** salvar uma compra retornava `PGRST204` para
`purchase_unit`.

**Causa Raiz:** o código e a migration usavam o nome correto
`public.supply_prices.purchase_unit`, mas essa migration ainda não havia sido aplicada
ao banco remoto.

**Correção:** aplicada em transação a migration
`20261102200000_add_purchase_unit_to_supply_prices.sql`. A coluna foi preenchida com a
unidade base nas aquisições existentes e definida como obrigatória; o PostgREST foi
notificado para recarregar o schema.

**Validação:** consulta ao PostgreSQL confirmou a coluna `supply_unit`, `NOT NULL` e
preenchida na única aquisição existente. Consulta REST com a chave pública retornou
HTTP 200 ao selecionar `purchase_unit`, confirmando que o PostgREST reconhece a coluna.

**Lição:** ao alterar o payload enviado ao Supabase, confirmar no banco remoto a
aplicação da migration correspondente e validar a coluna também pela API PostgREST.

## [Decisão] - Reposicionamento como planilha de precificação (2026-11-03)

**Problema Identificado:** o sistema herdava módulos de produção e estoque de um
planejamento anterior; o responsável definiu que a ferramenta é uma **planilha de
cálculo de preço** (insumos → produto → custo completo → preço por plataforma).

**Alternativas:** manter produção/estoque e derivar rateios do histórico real, ou
remover e usar volume **estimado** da empresa. Escolhida a segunda: sem produção
real, rateio por histórico é impossível, e o estimado satisfaz o objetivo de
planilha. Impacto de mudança de preço de insumo é automático, comparando o custo
atual com o último `cost_snapshots` (flag "Revisar preço" para qualquer diferença,
sem limite mínimo).

**Correção:** módulos de produção/estoque removidos (código, rotas, navegação e
tabelas); matriz de preços por canal movida para a **home**; `resolveProductCost`
agora soma mão de obra, despesas rateadas e custos diretos de impressão 3D
(energia, máquina, acabamento e taxa de falha) — todos apenas quando informados,
permitindo também produtos **revendidos**. `/task.md` e specs atualizadas.

**Validação:** typecheck, lint (sem avisos), 285 testes unitários e build passam;
migrations `20261102230000`–`20261103073000` aplicadas ao Supabase via pooler em
transação, com RPC validada pelo PostgREST (401 "apenas administradores" para
anônimo = função reconhecida com a nova assinatura).

**Lições:**
- Migrations não aplicadas podem ser ajustadas: a `20261102230000` tentava remover
  função inexistente no banco remoto (`drop function` sem `if exists`) e falhou;
  ajustada para `drop function if exists` porque nunca fora aplicada em nenhum
  ambiente. Migration **aplicada** continua intocável.
- Antes de dropar tabelas, verificar se estão vazias — `production_batches`,
  `production_consumption` e `inventory_movements` estavam com 0 linhas.
- O rateio de despesas entra **uma vez por produto final** (chamada de nível
  superior do resolvedor); o cache guarda o custo **sem** overhead para que um
  produto usado como componente de kit não cobre o rateio em dobro.
- O script de aplicação de migrations precisa carregar `pg` do `node_modules`
  do projeto quando executado de fora (ex.: `/tmp`).

## [Bug] - Duplicação de linhas de taxa ao reaplicar migration de dados (2026-11-03)

**Problema Identificado:** após aplicar
`20261103080000_seed_market_base_fees.sql` pelo script ad-hoc de pooler, o script
foi executado uma segunda vez para conferir a saída completa; as 5 linhas novas de
`payment_fees` foram inseridas duas vezes (guarda `not exists` não enxergou a
primeira onda), enquanto canais, métodos e despesas ficaram únicos.

**Causa Raiz:** reexecução manual do script de aplicação — a migration de dados é
idempotente apenas no papel quando compostas por `insert ... where not exists`; a
segunda execução rodou contra um estado em que a guarda não garantia unicidade
(sem constraint UNIQUE declarativa em `label` + `method_id`). A lição anterior
dizia "migration não aplicada pode ser ajustada"; re-aplicação **não** é
verificação — é uma segunda escrita.

**Correção:** `delete` das linhas duplicadas mantendo a onda mais antiga
(created_at menor) por `(method_id, label)`, em transação única; conferência após
a limpeza mostrou exatamente uma linha por etiqueta (Pix 0,49%, Débito 1,99%,
Crédito 4,98%, Pix online 0,99%, Crédito D0 4,98%).

**Validação:** consulta de contagem por `(method_id, label)` retornou 1 para cada
etiqueta; canais, meios, despesas e impostos restantes conferidos um a um.

**Lições:**
- Script ad-hoc de aplicação deve ser executado **uma única vez por migration**;
  conferência é feita por consulta, nunca re-aplicando.
- Para seeds de dados, preferir `on conflict do nothing` com **constraint
  declarativa** (índice único em expressão ou coluna) em vez de `not exists`.
- As taxas do Mercado Livre 2026: comissão por categoria (Clássico 10–14%,
  Premium +5 p.p.) + tarifa por unidade apenas para itens < R$ 79 — um
  percentual único de "8%" está defasado.
- TikTok Shop Brasil (desde 15/07/2026): < R$ 50 → 10% + R$ 4,00/item;
  ≥ R$ 50 → 6% + R$ 6,00/item; Programa de Taxas de Envio +6% com adesão
  automática.
- MEI não recolhe imposto por venda: o DAS fixo mensal (R$ 82,05 comércio/
  indústria em 2026, INSS 5% do mínimo R$ 1.621,00 + ICMS R$ 1,00) entra como
  **despesa operacional** para rateio — a taxa percentual "ICMS" foi desativada.

## [Decisão] - Plataformas só vendem varejo; atacado é venda direta na matriz (2026-11-03)

**Problema Identificado:** a matriz da home gerava uma linha por
**canal × modalidade**, mostrando "Mercado Livre — Atacado", "TikTok Shop —
Atacado" etc. O responsável esclareceu que o atacado **não acontece nas
plataformas** — é venda direta ao comerciante, então repetir atacado por
plataforma representava vendas que não existem.

**Alternativas:** modelar o atacado como canal próprio no banco (poluiria o
cadastro de canais com um canal "falso", tipo de enum inexistente) ou tratá-lo
como regra da matriz no motor (linhas de varejo por canal + uma linha única
"atacado direto" sem taxas de canal). Escolhida a segunda: a regra é de
apresentação/negócio, o cadastro de canais continua fiel aos canais reais.

**Correção:** `pricingMatrix.ts` gera uma linha de varejo por canal ativo e uma
única linha `Atacado (venda direta)` com `channelFees` vazio; impostos ativos
permanecem em todas as linhas; a margem do atacado usa **apenas a margem
padrão** da empresa (contingência 20%) — simulações de atacado não alteram a
linha. Componente perdeu a coluna "Modalidade" e ganhou separação visual da
linha de atacado direto; 10 testes da matriz reescritos para o contrato novo.

**Validação:** suite `pricingMatrix.test.ts` verde (10 testes), typecheck e
lint limpos, motor de preço por canal intocado (simulações continuam suportando
varejo e atacado).

**Lições:**
- "Atacado por plataforma" incorporava o canal no lugar errado: a plataforma é
  o canal do **varejo**; o atacado acontece fora das plataformas, direto ao
  comerciante.
- Margem do atacado direto vem de negociação com o comprador; o registro fino
  continua nas simulações, mas a matriz base usa só o padrão configurado.
- Nas plataformas, o preço entre canais difere apenas pelas taxas de cada
  plataforma (comissão + tarifa por unidade).

---

## [Decisão] - Valores base de mercado gravados para o cálculo real (2026-11-03)

**Problema Identificado:** a matriz da home e as simulações exigiam taxas reais
de canal, meio de pagamento e tributos; o banco tinha apenas placeholders
(Mercado Livre 8%, ICMS 3%, maquininha 5%).

**Alternativas:** deixar o responsável cadastrar manualmente tudo pela interface
(lento, sujeito a erro) ou gravar os valores pesquisados via migration de dados
(erro corrigível e registrada). Escolhida a migration
`20261103080000_seed_market_base_fees.sql` (idempotente, sem exclusão física —
linhas substituídas ficam inativas com nota).

**Correção:** canais criados (TikTok Shop, Site próprio, Loja física,
WhatsApp/Pix direto), Mercado Livre corrigido (comissão Clássico 12% + tarifa
fixa R$ 6,00 por unidade), maquininha desmembrada (Point: Pix 0,49%, débito
1,99%, crédito à vista 4,98%), Mercado Pago online (Pix 0,99%, crédito à vista
4,98%), DAS-MEI como despesa de R$ 82,05/mês. Tabela completa e fontes em
`docs/spec/030-configuracoes.md`, seção "Valores base de mercado".

**Validação:** migration aplicada via pooler e estado do banco conferido linha a
linha (impostos, canais, taxas, meios, despesas).

**Lições:**
- Os valores pesquisados são **base de mercado** (novembro/2026), não garantia
  contratual: comissões variam por categoria do produto, faturamento e prazo de
  recebimento — conferir no painel do canal antes de fixar preços.
- Percentuais do sistema usam formato micro-percentual ("12.000000"); o SQL da
  migration aceita `12` e o Postgres normaliza.

---

## [Decisão] - Home reorganizada como tabela produto × plataforma (2026-11-11)

**Problema Identificado:** a home exibia um bloco por produto com tabela
interna (plataforma | margem | preço), o que forçava rolagem vertical e
dificultava comparar o mesmo canal entre produtos.

**Alternativas:** (a) manter blocos por produto; (b) tabela única com uma
linha por produto e uma coluna por canal. Escolhida a **(b)**, mantendo
`buildPricingMatrix` intacto — mudança só de apresentação
(`PricingMatrix.tsx` + CSS).

**Correção:** colunas Produto (nome + etiquetas), Custo de fabricação, uma
coluna por canal ativo (varejo, com preço e margem) e coluna de Atacado
(venda direta) destacada. Responsivo com `data-label` (mesmo padrão dos
painéis). Specs `020` e `070` atualizadas na mesma entrega.

**Validação:** `npm run typecheck`, `npm run lint` e 289 testes verdes.

**Lição:** comparar preços entre canais pede **produto nas linhas e canais nas
colunas**; o motor de cálculo já devolve células por canal na mesma ordem — a
tabela só precisa transpor a apresentação.

---

## [Decisão] - Gaveta de menu em todas as telas e tabela da home a 80% (2026-11-11)

**Problema Identificado:** o hambúrguer só existia até 900px (coluna fixa de
256px acima disso); a tabela da home ficava presa em `max-width: 1200px` do
shell e as margens exibiam `numeric(9,6)` cru (ex.: `33,333333 %`) ou ruído de
multiplicação por 100.

**Alternativas:** (a) manter sidebar fixa no desktop; (b) gaveta em qualquer
largura com conteúdo full-width. Escolhida a **(b)** para liberar largura
horizontal e atender o pedido de tabela a 80% da tela.

**Correção:**
- `Sidebar`: drawer sempre (fora da tela sem `.open`), overlay, `Escape`,
  fecho automático na troca de rota e `aria-hidden` quando fechado;
- `AppShell`: conteúdo sem `max-width: 1200px`; `AppHeader` reserva
  `padding-left: 64px` para o botão fixo;
- `PricingMatrix`: `width: 80%` (mín. 720px, rolagem se preciso; 100% no
  mobile em cartões) e margem formatada com `Math.round(x * 10000) / 100`
  (2 casas, sem float sujo).

**Validação:** `npm run typecheck`, `npm run lint` e `pre-push.sh` verdes.

**Lição:** em tabela densa, **formatar percentual de exibição é papel da
apresentação** — arredondar para 2 casas na camada de UI evita vazar a
precisão de armazenamento (`numeric(9,6)`) sem tocar no motor.

---

## [Decisão] - CRUD completo com exclusão física (lixeira) (2026-11-11)

**Problema Identificado:** painéis tinham criação, edição e toggle
(Ativar/Desativar), mas nenhuma forma de remover registro — decisão antiga
proibia DELETE na interface. O responsável pediu lixeira em todo cadastro.

**Alternativas:** (a) manter só exclusão lógica; (b) DELETE físico com
confirmação, mantendo toggle. Escolhida a **(b)**.

**Correção:**
- Migration `20261111090000_allow_admin_delete_domain_rows.sql`: policies e
  `grant delete` para admin em taxas, canais, meios, impostos, despesas, mão
  de obra, fornecedores, insumos, conversões e produtos (`company_settings`
  permanece sem DELETE);
- componente `DeleteRowButton` (confirmação + `Alert` de erro na linha) e
  variante `danger` em `Button`/`PendingButton`;
- `deleteX` nos services (traduz `23503` via `mapDeleteError`) e
  `deleteXAction` nas Server Actions (`getAdminSession` + `revalidatePath`);
- botão de lixeira em 10 painéis; `rowActions` com `flex-wrap`.

**Restrições preservadas:** FKs RESTRICT (simulações, snapshots, composições,
insumos de fornecedor) bloqueiam exclusão no banco — histórico financeiro não é
apagado em cascata.

**Validação:** `./pre-push.sh` (typecheck, lint, jest). Migration aplicada no
Supabase em 2026-11-13 (ver entrada de bug abaixo).

**Lição:** exclusão física de **configuração** é segura quando o histórico
financeiro mora em tabelas separadas com RESTRICT; o erro `23503` é o contrato
— a UI só precisa traduzi-lo.

---

## [Bug] - Exclusão silenciosa: RLS sem policy de DELETE (2026-11-13)

**Problema identificado:** o botão "Excluir" confirmava a exclusão, mas a linha
continuava na lista e **nenhum erro era exibido** — em produtos, insumos,
fornecedores, impostos, canais, taxas, meios de pagamento, despesas e mão de obra.

**Causa raiz:** a migration `20261111090000_allow_admin_delete_domain_rows.sql`
(policies `*_delete_admin` + `grant delete`) estava implementada e versionada, mas
**não aplicada no Supabase**. Verificado em `pg_policies`: existia apenas
`product_components_delete_admin`. Sem policy de DELETE, o Postgres aplica o RLS
e o PostgREST responde **HTTP 200, `error: null`, zero linhas** — o service só
olhava `error`, a action devolvia `status: "success"` e o `DeleteRowButton`
renderizava alerta apenas para `error`. Três fatores se somaram: migration
pendente, services sem `.select()` (sem como detectar "0 linhas") e ausência de
feedback de sucesso.

**Correção:**
- migration aplicada no Supabase (12 policies `*_delete_admin` verificadas);
- os 10 `deleteX` passaram a usar `.delete().eq(...).select("id")` e a validar o
  resultado com `assertRowDeleted` — exclusão sem linha é erro explícito;
- `mapDeleteError` recebeu rótulo completo com artigo ("o produto", "a despesa
  fixa") para mensagens em pt-BR corretas;
- `DeleteRowButton` passou a exibir o estado de sucesso e a chamar
  `router.refresh()` após a exclusão.

**Validação:** sessão real de administrador criada via API de autenticação do
Supabase e chamada REST idêntica à da aplicação — DELETE existente remove 1
linha, DELETE sem permissão remove 0, DELETE de id inexistente devolve HTTP 200
com `[]` (caso agora convertido em erro). `npm run typecheck`, `npm run lint`,
`npm test` (296 testes) e `./pre-push.sh` verdes.

**Lição:** **RLS sem policy não é erro — é silêncio.** Qualquer escrita que possa
ser filtrada por política precisa ler as linhas afetadas (`.select()`) e tratar
"zero linhas" como falha; confiar apenas em `error` faz a aplicação afirmar
sucesso sobre uma operação que não ocorreu. E, em projeto com agente
autônomo, **migration versionada não é migration aplicada**: a verificação tem
de ser feita no banco (`pg_policies`), não no repositório.

---

## [Decisão] - Exclusão em cascata com aviso de dependências (2026-11-13)

**Problema identificado:** depois de destravar a lixeira, excluir um insumo
usado na ficha técnica de um produto era barrado pelo banco (FK
`product_components_supply_id_fkey` com `ON DELETE NO ACTION`) e a mensagem
era genérica: "está em uso ou possui registros vinculados" — sem dizer onde.

**Alternativas:** (a) manter o bloqueio e detalhar a mensagem; (b) excluir em
cascata e avisar o que será removido junto. Escolhida a **(b)**, por decisão do
responsável: a lixeira deve limpar o registro e o que depende dele, e quem
precisa preservar histórico usa a desativação lógica.

**Correção:**
- migration `20261113100000_allow_cascade_delete_domain_dependencies.sql`:
  `ON DELETE CASCADE` em ficha técnica (insumo e kit), custo registrado
  (`cost_snapshots`) e simulações de precificação (`pricing_simulations`);
- serviço `services/supabase/deleteDependencies.ts`: lê as dependências dos
  registros listados na tela (2–4 consultas por página, sem N+1);
- textos puros em `lib/deleteWarnings.ts` e `lib/deleteConfirmation.ts`: a
  confirmação passa a listar "o que também será removido";
- `DeleteRowButton` recebe as dependências e mostra o aviso antes de excluir;
- avisos ligados em insumos, produtos, canais e meios de pagamento.

**Consequência aceita:** o custo registrado e as simulações de precificação
ligados ao registro são apagados junto — a regra de imutabilidade histórica
vale para **alterar** custo, não para a lixeira; a desativação lógica segue
disponível como caminho seguro.

**Validação:** sessão real de administrador e exclusão pela interface — insumo
com composição excluído, composição removida junto e aviso da ficha técnica
presente no payload do servidor. `npm run typecheck`, `npm run lint`,
`npm test` (310 testes) e `./pre-push.sh` verdes.

**Lição:** **"em uso" sem dizer onde é um erro de UX, não de banco.** O banco
responde "não posso" sem contexto; a aplicação precisa traduzir a dependência
em linguagem de negócio ("a ficha técnica do produto Vela deixa de usar este
insumo"). E quando a exclusão passa a cascatear, o aviso deixa de ser
obrigação de erro e vira **parte da confirmação** — o administrador decide
sabendo o preço da operação.

---

## [Decisão] - Unidade da quantidade na ficha técnica e equivalência de caixa (2026-11-13)

**Problema Identificado:** o administrador informava na ficha técnica a
quantidade de insumo **na unidade em que ele pensa** (por exemplo, "6 unidades"
de um insumo que se compra em caixa) e o sistema gravava "6 caixas", inflando o
custo do produto em 12 vezes. Não havia onde registrar que uma caixa contém 12
unidades.

**Causa Raiz:** o formulário de produto aceitava apenas a quantidade, sem
unidade, e `product_components.quantity` é gravada na unidade base do insumo.
Faltava (a) o seletor de unidade na linha da composição e (b) a equivalência
de caixa/pacote no cadastro do insumo. A função `convertStandardQuantity`
existia em `services/calculations/units.ts` desde a subetapa 5.4, mas era
código morto: nenhuma tela ou action a usava.

**Correção:**
- migration `20261113110000_add_units_per_package_to_supplies.sql`: coluna
  `supplies.units_per_package` (`numeric(12,6)`), com checks de valor positivo
  e de uso apenas em `caixa`/`pacote`;
- campo "Unidades por caixa/pacote" no formulário de insumo, exibido apenas
  quando a unidade é caixa ou pacote;
- `services/calculations/units.ts`: `listConvertibleUnits`,
  `convertToBaseUnit` e `roundQuantity` (três casas);
- `lib/validations/products.ts`: `validateProduct` recebe os contextos de
  unidade dos insumos e converte a quantidade para a unidade base antes de
  devolver a composição validada;
- `services/supabase/supplies.ts`: `listSupplyUnitContexts` entrega unidade
  base e equivalência; `app/actions/products.ts` carrega os contextos, valida e
  recusa insumo inexistente;
- `features/products/ProductForm.tsx`: seletor de unidade por linha, rótulo
  "Quantidade por unidade do produto" e texto de equivalência.

**Alternativas:** (a) gravar a unidade junto da quantidade em
`product_components` — exigiria migration da tabela, novo formato para as RPCs
de costing e mudança no motor de custo; (b) converter apenas na exibição —
continuaria gravando quantidade errada e contaminaria o custo. Escolhida a
**conversão na entrada**, com a base sempre gravada.

**Consequência aceita:** a unidade escolhida não fica gravada; o histórico da
composição depende da quantidade final e do custo do insumo, que já é snapshot.
Supplies em caixa **sem** equivalência registrada continuam válidos: a
ficha técnica aceita apenas a própria unidade base.

**Validação:** `npm run typecheck`, `npm run lint`, `npm test` (328 testes)
verdes. Teste real pela interface (Server Actions): insumo em caixa com 12
unidades por caixa cadastrado, produto gravado com "6 unidades" e
`product_components.quantity = 0.5` na unidade base; unidade incompatível
(litro em insumo de caixa) recusada com mensagem de negócio. Migration
aplicada e conferida no Supabase (`information_schema` e `pg_constraint`).

**Lição:** **"quantidade sem unidade é um bug silencioso de custo.** A unidade
não é decoração do formulário: ela precisa ser escolhida por quem opera e
traduzida para a unidade base **antes** de gravar. E a equivalência de
embalagem pertence ao **insumo** (é dado do fornecedor/compra), não ao
produto — por isso o cadastro do insumo guarda "12 unidades por caixa" e o
produto só escolhe a unidade em que está pensando.

---

## [Decisão] - Popup de custo do produto na home com insumo já dividido (2026-11-13)

**Problema Identificado:** a home mostra o custo de fabricação por produto, mas
não como esse custo foi montado. O responsável não conseguia conferir se a
ficha técnica estava correta sem fazer a conta de cabeça — em especial quando
o insumo é comprado em caixa e o produto usa peças ("2 velas por R$ 10,00,
usei 1 vela: quanto deu?").

**Causa Raiz:** o motor já calculava o custo de cada linha da ficha técnica
(`calculateLineCostCents`), mas esse resultado ficava perdido dentro do total:
`getProductCostBreakdown` devolvia apenas material, mão de obra, rateio e
total. Não havia, além disso, nenhum componente de diálogo no projeto — o
modal genérico tinha sido adiado por falta de consumidor.

**Correção:**
- `src/services/calculations/productCostDetail.ts`: `buildProductCostDetail`
  monta o detalhamento (linhas de insumo, perda, mão de obra, custos diretos e
  rateio) a partir do custo já resolvido, sem consulta extra ao banco;
- `src/services/calculations/productCostResolver.ts`: as linhas de composição
  passam a trazer `targetType` e `targetId`, para que o detalhamento saiba
  se a linha é insumo ou subproduto;
- `src/components/ui/Modal/Modal.tsx`: primeiro diálogo genérico do projeto,
  com `role="dialog"`, fechamento por `Escape`/sobreposição/botão, foco no
  painel ao abrir e retorno ao elemento de origem ao fechar;
- `src/features/pricing/ProductCostModal.tsx`: popup com insumos, demais
  custos e total;
- `src/features/pricing/PricingMatrix.tsx`: o nome do produto virou botão que
  abre o popup.

**Regra de exibição (decisão do responsável):** o custo do insumo aparece
**já dividido pelo que foi usado**, e a quantidade é mostrada na unidade em
que o responsável pensa. Insumo com equivalência de caixa/pacote aparece em
peças (1 vela, R$ 5,00); sem equivalência, na unidade base (0,02 kg,
R$ 1,20). A soma das linhas é igual ao "Custo de fabricação" da matriz.

**Validação:** `npm run typecheck`, `npm run lint`, `npm test` (335 testes) e
`./pre-push.sh` verdes. Teste real no servidor com sessão de administrador:
insumo em caixa com 2 peças por R$ 10,00 e produto que usa 1 peça — o payload
da home traz `quantity: 1`, `unit: "unidade"` e `costCents: 500` para a linha
do insumo, e o total do produto (R$ 8,80) confere com a soma das linhas
(material R$ 5,00 + mão de obra R$ 3,80). Temporários removidos.

**Lição:** **"custo total sem as parcelas não é conferível."** Mostrar só o
total obriga o responsável a refazer a conta para confiar no número. E a
**unidade de exibição** é uma decisão de negócio disfarçada de formatação:
mostrar "0,5 Caixa" em vez de "1 Vela" é a diferença entre a tela ser
legível e a tela obrigar o usuário a converter de cabeça. Também: **adiar
componente genérico por falta de consumidor é certo — mas o adiamento tem
data de revisão**, e o consumidor apareceu quando o popup de custo entrou.

---

## [Decisão] - Margem de lucro por canal ajustada no popup do produto (2026-11-13)

**Problema Identificado:** a home mostrava o preço sugerido por canal, mas a
margem em uso vinha de uma simulação antiga ou da margem padrão da empresa —
sem caminho para ajustá-la sem sair da home. O responsável pediu: popup com os
demais custos e a sugestão de preço, com um campo para alterar a margem de
lucro de cada canal, e a linha inteira do produto clicável.

**Causa Raiz:** o preço já era calculado por canal (`buildPricingMatrix`), mas
a margem era apenas **lida** de `pricing_simulations` — não existia nenhuma
ação que a gravasse a partir da home. O cálculo da matriz também estava
espalhado: cada canal refazia a soma das taxas dentro do laço.

**Correção:**
- `previewChannelPriceCents` (`services/calculations/pricingMatrix.ts`): cálculo
  único de preço por canal, devolvendo também o resumo das taxas (percentual
  somado e taxas fixas). A matriz passou a usar essa função — antes ela tinha
  o cálculo duplicado;
- `saveProductChannelMarginAction` (`app/actions/pricing.ts`): grava a margem
  como **nova simulação de preço (varejo)** do canal, com o custo congelado em
  snapshot — exatamente o caminho de `/precificacao`. Sem tabela nova;
- `ChannelMarginEditor` (`features/pricing`): campo de margem com prévia do
  preço **enquanto o responsável digita**, usando o mesmo motor da matriz;
- `ProductCostModal`: seção "Sugestão de preço por canal", com margem, preço
  e taxas de cada canal; o atacado (venda direta) aparece só para consulta,
  porque a margem dele vem das configurações da empresa e
  `pricing_simulations.channel_id` é obrigatório;
- `PricingMatrix`: a linha inteira passou a ser clicável (o nome continua
  sendo `<button>` para teclado).

**Consequência aceita:** cada ajuste de margem cria uma linha nova em
`pricing_simulations` (tabela append-only) e um snapshot de custo. É o mesmo
comportamento da tela de precificação: o histórico guarda as decisões de
preço. Como o snapshot registra o custo atual, a etiqueta "Revisar preço" é
reavaliada no momento do ajuste — o preço acabou de ser recalculado com o
custo vigente.

**Validação:** `npm run typecheck`, `npm run lint`, `npm test` (339 testes) e
`./pre-push.sh` verdes. Teste real no servidor: produto com custo de R$ 20,00
no canal "Loja física" — margem inicial 30%; ao salvar 45%, a simulação foi
gravada (`margin_percent = 0,45`, `price_cents = 5000`) e a home passou a
mostrar a margem 0,45 e o preço 5000, o mesmo valor devolvido pela Server
Action. Margem de 150% recusada com "Informe uma margem de lucro entre 0 e
100%.".

**Lição:** **"quando a tela mostra um número, ela deve oferecer o caminho para
corrigir o número."** A matriz exibia a margem de cada canal como resultado de
regra alheia (simulação antiga, padrão da empresa, contingência) — sem edição,
o responsável não tinha governança sobre o próprio preço. E a correção foi
**reaproveitar a estrutura existente** (`pricing_simulations`) em vez de criar
uma tabela nova: a decisão de preço já tinha histórico e lugar; só faltava a
porta de entrada. Duas telas que calculam o mesmo preço precisam do **mesmo
motor** — por isso a prévia do popup e a matriz compartilham
`previewChannelPriceCents`, e o número mostrado ao digitar é o mesmo que vai
para a tabela.


