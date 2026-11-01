1. Revisão geral do projeto
Ateliê Filhos de Aruanda
Arquitetura definida

Sistema de Gestão e Precificação
Aplicação interna para gestão de custos, produção, estoque e formação de preços.
Next.js

Frontend e servidor integrado


Supabase

Banco e autenticação


Vercel

Hospedagem


CSS Modules

Estilização independente




Diretrizes
- Aplicação privada, sem cadastro público.
- Administração de usuários pelo administrador.
- Sem backend independente.
- Sem Tailwind como metodologia de estilização.
- Sem funcionalidade de exportação de dados para usuários.
- Execução online e desenvolvimento local.
- Infraestrutura inicial utilizando planos gratuitos.

2. Decisões que considero importantes corrigir ou complementar
Antes de entregar o planejamento, existem cinco cuidados que quero deixar explícitos para o agente.

1. Não utilizar o Supabase como se fosse apenas um banco de dados.

Vamos aproveitar também:
- Supabase Auth.
- Row Level Security.
- PostgreSQL.
- Supabase Storage, caso futuramente precisemos armazenar imagens e documentos.
2. Não criar uma API tradicional desnecessariamente.

Operações simples podem utilizar Supabase JS diretamente, com RLS. Operações privilegiadas devem passar pelo servidor Next.js.

3. Cálculos financeiros precisam ficar centralizados.

Não devemos espalhar fórmulas de precificação pelas páginas. O cálculo deve ficar em módulos TypeScript independentes da interface, permitindo testes automatizados.

4. Histórico financeiro não pode ser alterado retroativamente.

Alterar o preço de um insumo não deve modificar o custo histórico de uma venda já registrada. Precisamos armazenar snapshots dos custos, taxas e configurações utilizadas em cada cálculo ou operação.

5. Ambiente local não significa automaticamente ambiente offline.

Podemos executar o Next.js localmente e utilizar o Supabase online. Para trabalhar completamente offline, precisaremos de um banco local e uma estratégia de sincronização, que não deve ser improvisada na primeira versão.
3. Planejamento funcional
Eu dividiria o sistema em módulos independentes, mas interligados.
Prioridade	Módulo	Responsabilidade
P0	Autenticação	Login, usuários e permissões
P0	Configurações	Empresa, tributação e parâmetros
P1	Insumos	Materiais, unidades e fornecedores
P1	Produtos	Produtos, receitas e composições
P1	Precificação	Custos, margens, varejo e atacado
P1	Canais	Marketplaces e taxas de pagamento
P2	Produção	Lotes, tempo e consumo de materiais
P2	Estoque	Entradas, saídas e perdas
P2	Despesas	Custos fixos e rateios
P2	Relatórios	Rentabilidade e indicadores
P3	Vendas	Registro e acompanhamento de vendas
P3	Integrações	Loja virtual e marketplaces

Organização dos produtos
O sistema deverá suportar quatro modalidades principais:
- Fabricado: composição de insumos, mão de obra e despesas.
- Revendido: custo de aquisição, frete de compra e despesas.
- Impressão 3D: material, energia, máquina, tempo, falhas e acabamento.
- Kit ou combo: composição de produtos já cadastrados.
Também deverá permitir subprodutos e componentes reutilizáveis, com prevenção de referências circulares.
Regras fundamentais de precificação
O motor de cálculo deverá considerar:
1. Custo de aquisição dos materiais.
2. Frete de aquisição rateado.
3. Perdas e desperdícios.
4. Mão de obra.
5. Energia e utilização de máquinas.
6. Embalagem.
7. Rateio de despesas operacionais.
8. Impostos.
9. Comissões e taxas de pagamento.
10. Margem de lucro desejada.
O preço será calculado individualmente por canal e modalidade de venda.

A fórmula-base será:
\[
P = \frac{C+F}{1-(T+M)}
\]

Com validação para impedir denominadores nulos ou negativos.

O sistema deverá trabalhar com dinheiro em centavos (inteiros) ou precisão decimal adequada, nunca utilizando operações financeiras baseadas diretamente em números de ponto flutuante sem tratamento.
4. Arquitetura de pastas
Esta é a organização que eu entregaria ao agente como padrão obrigatório:
src/
│
├── app/
│   ├── (auth)/
│   │   └── login/
│   │
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── home/
│   │   ├── produtos/
│   │   ├── insumos/
│   │   ├── producao/
│   │   ├── estoque/
│   │   ├── precificacao/
│   │   ├── despesas/
│   │   ├── fornecedores/
│   │   ├── relatorios/
│   │   └── configuracoes/
│   │
│   ├── actions/
│   │
│   └── layout.tsx
│
├── components/
│   ├── ui/
│   ├── layout/
│   ├── forms/
│   ├── tables/
│   └── feedback/
│
├── features/
│   ├── products/
│   ├── supplies/
│   ├── production/
│   ├── pricing/
│   ├── inventory/
│   ├── expenses/
│   └── settings/
│
├── services/
│   ├── supabase/
│   └── calculations/
│
├── lib/
│   ├── auth/
│   ├── validations/
│   ├── constants/
│   └── utils/
│
├── hooks/
│
├── types/
│
└── styles/
    ├── globals.css
    ├── variables.css
    └── typography.css


Cada página e componente visual deverá ter seus arquivos separados:
products/
├── ProductList.tsx
├── ProductList.module.css
├── ProductForm.tsx
├── ProductForm.module.css
└── components/
    ├── ProductCard.tsx
    └── ProductCard.module.css


Não devemos misturar regras de negócio, consultas ao banco e estilização dentro de um único componente.
5. Modelo inicial de banco de dados
O agente deve projetar o banco antes de implementar os módulos.

As principais entidades serão:
Grupo	Tabelas
Usuários	profiles, roles
Empresa	company_settings, tax_settings
Canais	sales_channels, channel_fees
Pagamentos	payment_methods, payment_fees
Insumos	supplies, supply_prices
Fornecedores	suppliers
Produtos	products, product_components
Produção	production_batches, production_consumption
Custos	labor_costs, operating_expenses
Estoque	inventory_movements
Precificação	pricing_profiles, pricing_simulations
Histórico	cost_snapshots, configuration_history

Algumas regras de modelagem:
- Identificadores UUID.
- Relacionamentos com chaves estrangeiras.
- Exclusão lógica quando houver histórico relacionado.
- Datas de criação e atualização.
- Histórico de preços de aquisição.
- Snapshot de custos nas simulações e vendas.
- RLS em todas as tabelas privadas.
- Restrições para impedir quantidades e valores inválidos.
Não quero que o agente crie todas essas tabelas de uma só vez sem analisar os relacionamentos. Primeiro deverá produzir o diagrama e validar a estrutura.
6. Plano de execução por etapas
1. Fundação do projeto
   
   Configurar Next.js, TypeScript, CSS Modules, ESLint, organização de pastas, variáveis de ambiente e Git.
   Primeiro objetivo
2. Supabase e autenticação
   
   Configurar projeto, conexão, tabelas de usuários, login, sessões, RLS e cadastro administrativo.
3. Identidade visual e estrutura
   
   Criar sidebar, cabeçalho, dashboard, navegação, componentes, tabelas, formulários, modais e notificações.
4. Configurações empresariais
   
   Cadastro da empresa, regime tributário, impostos, canais, meios de pagamento e despesas.
5. Cadastro de insumos e produtos
   
   Implementar unidades de medida, fornecedores, fichas técnicas, componentes e modalidades de produtos.
6. Motor de precificação
   
   Implementar fórmulas, impostos, taxas, margens, varejo, atacado e simulações por canal. Criar testes automatizados.
7. Produção e estoque
   
   Implementar lotes, consumo real, perdas, impressão 3D, movimentações e saldo de estoque.
8. Relatórios e validação
   
   Indicadores, histórico, comparações, testes de integração e revisão de segurança.
9. Publicação
   
   Configurar Vercel, domínio privado, variáveis de produção, backups e monitoramento dos limites gratuitos.
Regra para o agente: concluir, testar e documentar uma etapa antes de avançar para a seguinte. Não gerar um projeto inteiro com dezenas de telas fictícias apenas para aparentar conclusão.
7. Documento de execução para o agente
Preparei abaixo o briefing que servirá como instrução principal de desenvolvimento. Ele contém as decisões arquiteturais, regras, prioridades e critérios de qualidade.
ATELIÊ FILHOS DE ARUANDA
Especificação técnica e plano de desenvolvimento
Projeto: Sistema interno de gestão, custos e precificação
Versão: 1.0
Idioma: Português brasileiro
Moeda: BRL (R$)

1. Objetivo
Desenvolver uma aplicação web privada para gerenciamento de produtos, insumos, fornecedores, produção, estoque, despesas e formação de preços do Ateliê Filhos de Aruanda.

A aplicação deverá atender produtos artesanais, artigos religiosos, velas, guias, produtos de impressão 3D, revenda e kits.

O objetivo principal é permitir o cadastro de produtos e suas composições, calcular automaticamente os custos envolvidos e apresentar preços recomendados para varejo e atacado, considerando diferentes canais de venda.
2. Stack tecnológica obrigatória
- Next.js com App Router.
- TypeScript.
- Supabase PostgreSQL.
- Supabase Auth.
- Supabase Row Level Security (RLS).
- Supabase JS.
- Vercel.
- CSS Modules.
- CSS convencional.
- Git e GitHub.
Não utilizar como padrão:
- Tailwind CSS.
- Backend independente em Express, NestJS ou Spring Boot.
- Prisma nesta primeira versão.
- Banco de dados proprietário da hospedagem.
- CSS-in-JS.
3. Arquitetura
Utilizar Next.js como aplicação integrada de frontend e servidor.

Operações comuns poderão utilizar Supabase JS diretamente, protegidas por RLS.

Operações administrativas privilegiadas deverão utilizar Server Actions ou Route Handlers executados no servidor.

Nunca expor chaves secretas do Supabase no navegador.

Toda operação deverá respeitar autenticação e autorização.
4. Identidade e interface
Construir uma interface administrativa moderna, profissional, minimalista e responsiva.

Utilizar CSS Modules para páginas e componentes.

Cada componente visual deverá possuir seus próprios arquivos TSX e CSS Module.

Manter estilos globais somente para:
- Variáveis CSS.
- Cores.
- Tipografia.
- Reset.
- Temas.
- Tokens de espaçamento.
- Elementos globais.
Utilizar componentes reutilizáveis para:
- Botões.
- Inputs.
- Selects.
- Tabelas.
- Modais.
- Cards.
- Notificações.
- Formulários.
- Paginação.
- Filtros.
Não misturar regras de negócio com apresentação visual.
5. Autenticação e permissões
Utilizar Supabase Auth.

Requisitos:
- Login obrigatório.
- Cadastro público desabilitado.
- Somente administrador poderá convidar usuários.
- Perfis de administrador e operador.
- Possibilidade de ampliar permissões futuramente.
- Controle de sessões.
- Proteção das rotas privadas.
- Políticas RLS em todas as tabelas privadas.
- Verificação de autorização no servidor para ações privilegiadas.
A interface não deverá ser considerada mecanismo de segurança. As permissões deverão ser verificadas também no banco.
6. Módulos funcionais
Configurações empresariais
- Dados da empresa.
- Tipo de empresa.
- Regime tributário.
- Parâmetros fiscais.
- CNAE e classificações fiscais pertinentes.
- Impostos configuráveis.
- Histórico de alterações.
- Despesas fixas.
- Mão de obra.
- Configurações de produção.
Canais de venda
- Mercado Livre.
- TikTok Shop.
- Site próprio.
- Loja física.
- Mercado Pago.
- Pix.
- Débito.
- Crédito à vista.
- Crédito parcelado.
- WhatsApp.
Cada canal deverá possuir taxas configuráveis, incluindo percentuais, valores fixos, condições de pagamento e despesas adicionais.
Insumos
- Nome.
- Categoria.
- Unidade de medida.
- Quantidade comprada.
- Valor de aquisição.
- Frete.
- Fornecedor.
- Histórico de preços.
- Conversões de unidades.
- Estoque mínimo futuramente.
Produtos
Suportar:
- Fabricação própria.
- Revenda.
- Impressão 3D.
- Produtos compostos.
- Kits e combos.
Permitir fichas técnicas com múltiplos componentes e subprodutos.
Produção
- Tempo de fabricação.
- Quantidade produzida.
- Consumo de materiais.
- Perdas.
- Mão de obra.
- Energia.
- Depreciação de máquinas.
- Custos de acabamento.
- Produção em lotes.
Precificação
Calcular automaticamente:
- Custo dos insumos.
- Mão de obra.
- Despesas operacionais.
- Perdas.
- Impostos.
- Comissões.
- Taxas de pagamento.
- Custo completo.
- Preço mínimo.
- Preço de varejo.
- Preço de atacado.
- Lucro líquido estimado.
- Margem percentual.
Permitir simulações por canal, quantidade e margem desejada.
Estoque
- Entrada de materiais.
- Saída de materiais.
- Consumo na produção.
- Produtos acabados.
- Perdas.
- Ajustes.
- Histórico de movimentações.
Relatórios
- Produtos mais rentáveis.
- Produtos com menor margem.
- Custos por categoria.
- Comparação entre canais.
- Evolução de preços de insumos.
- Rentabilidade estimada.
- Desempenho de vendas, quando o módulo de vendas for implementado.
7. Motor financeiro
Criar um módulo independente de cálculos financeiros em TypeScript.

Não implementar fórmulas diretamente nos componentes React.

Utilizar a fórmula-base:

Preço = (Custo completo + Taxas fixas) / (1 - Percentuais variáveis - Margem desejada).

Validar os denominadores e impedir resultados inválidos.

Utilizar precisão decimal adequada para operações financeiras.

Criar testes automatizados para:
- Custos de produção.
- Custos de revenda.
- Kits.
- Impressão 3D.
- Rateios.
- Impostos.
- Taxas fixas.
- Taxas percentuais.
- Varejo.
- Atacado.
- Descontos.
- Margens negativas.
As regras fiscais deverão ser configuráveis e não deverão assumir alíquotas universais.
8. Banco de dados
Antes de criar as migrations:
1. Elaborar o modelo entidade-relacionamento.
2. Identificar chaves primárias e estrangeiras.
3. Definir relacionamentos.
4. Definir políticas RLS.
5. Planejar histórico financeiro.
6. Planejar integridade referencial.
7. Documentar as migrations.
Utilizar UUID e timestamps.

Criar histórico de custos e snapshots para impedir que alterações futuras modifiquem resultados históricos.
9. Estrutura de pastas
Organizar por funcionalidades, mantendo separação entre:
- app: rotas e páginas.
- components: componentes compartilhados.
- features: funcionalidades e componentes específicos.
- services: acesso a dados e cálculos.
- lib: configurações, validações e utilitários.
- hooks: hooks React.
- types: tipagens.
- styles: estilos globais.
Cada página e componente deverá manter seu CSS Module separado.
10. Desenvolvimento por etapas
ETAPA 1 — Fundação:
- Inicialização do Next.js.
- Configuração TypeScript.
- Configuração CSS Modules.
- Estrutura de diretórios.
- Git.
- Variáveis de ambiente.
ETAPA 2 — Supabase:
- Configuração.
- Autenticação.
- Perfis.
- RLS.
- Cadastro administrativo.
ETAPA 3 — Interface:
- Layout administrativo.
- Sidebar.
- Cabeçalho.
- Dashboard inicial.
- Componentes compartilhados.
ETAPA 4 — Configurações:
- Empresa.
- Tributação.
- Canais.
- Taxas.
- Pagamentos.
- Despesas.
ETAPA 5 — Cadastros:
- Insumos.
- Fornecedores.
- Produtos.
- Composições.
ETAPA 6 — Precificação:
- Motor financeiro.
- Simulações.
- Varejo.
- Atacado.
- Comparação por canal.
ETAPA 7 — Operação:
- Produção.
- Estoque.
- Perdas.
- Despesas.
ETAPA 8 — Relatórios:
- Indicadores.
- Histórico.
- Rentabilidade.
- Testes gerais.
ETAPA 9 — Publicação:
- Vercel.
- Supabase produção.
- Domínio.
- Variáveis de ambiente.
- Backups.
- Monitoramento.
11. Regras de desenvolvimento
- Não criar funcionalidades fictícias.
- Não utilizar dados simulados como se fossem reais.
- Não deixar botões sem funcionalidade.
- Não duplicar regras de negócio.
- Não misturar CSS com lógica de negócio.
- Não colocar credenciais no código-fonte.
- Não desabilitar RLS para facilitar desenvolvimento.
- Não implementar cálculos fiscais sem parâmetros configuráveis.
- Não alterar migrations já aplicadas sem estratégia de migração.
- Criar testes para os cálculos financeiros.
- Documentar decisões técnicas.
- Validar cada etapa antes de prosseguir.
12. Entregáveis
O agente deverá produzir:
1. Projeto Next.js funcional.
2. Estrutura de pastas documentada.
3. Modelo de banco de dados.
4. Migrations SQL.
5. Políticas RLS.
6. Autenticação funcional.
7. Interface administrativa.
8. Motor de precificação testado.
9. Documentação de instalação local.
10. Documentação de configuração da Vercel e Supabase.
13. Primeira tarefa do agente
Não desenvolver todo o sistema imediatamente.

Primeiro:
1. Inspecionar o repositório e o ambiente existente.
2. Verificar se existe uma aplicação anterior que precisa ser preservada.
3. Apresentar a arquitetura final.
4. Apresentar a árvore de diretórios.
5. Criar o modelo entidade-relacionamento inicial.
6. Apresentar o plano de migrations e segurança.
7. Identificar dependências e configurações necessárias.
8. Implementar somente a fundação do projeto e autenticação após validar a arquitetura.
Ao concluir a primeira etapa, apresentar os arquivos criados, comandos executados, testes realizados e pendências.

Objetivo final: construir uma aplicação sustentável, modular, segura e preparada para acompanhar o crescimento do Ateliê Filhos de Aruanda.




8. Como eu iniciaria com o agente
Não mandaria o agente construir todos os módulos de uma vez.

Minha sequência seria:
Primeiro ciclo de desenvolvimento
1
Inspecionar e preparar o repositório

Verificar ambiente, versões, estrutura e preservar projetos existentes.

2
Criar a fundação Next.js

TypeScript, App Router, CSS Modules, layout e componentes básicos.

3
Conectar o Supabase

Auth, profiles, políticas RLS e administrador inicial.

4
Construir o modelo de dados

Relacionamentos, entidades, migrations e histórico.

5
Começar os módulos operacionais

Insumos, produtos e motor de precificação.

9. Um ponto importante sobre o projeto existente
Como o Ateliê já possui uma loja virtual em Next.js, eu manteria o sistema administrativo de custos como um projeto independente da loja pública.

Isso evita misturar:
- Cadastro público de produtos.
- Gestão interna de custos.
- Informações de fornecedores.
- Preços de aquisição.
- Margens e impostos.
- Permissões administrativas.
Os dois sistemas poderão compartilhar informações futuramente por integração, mas não precisam compartilhar o mesmo código ou banco desde o início.

A marca continua sendo a mesma; a aplicação administrativa será um produto interno separado.