# Spec 020 — Identidade visual e estrutura

**Etapa:** 3
**Status:** Implementado
**Última atualização:** 2026-11-01

## Objetivo

Dar ao sistema a estrutura visual permanente — menu lateral, cabeçalho, área de
conteúdo — e um conjunto pequeno de componentes reutilizáveis, sem criar telas
fictícias nem controles sem função. A identidade segue `visual.md`.

## Estrutura

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell/    estrutura da área restrita
│   │   ├── AppHeader/   identificação do usuário e saída
│   │   └── Sidebar/     menu lateral (cliente, controla o modo móvel)
│   └── ui/
│       ├── Badge/       etiqueta de estado
│       ├── Button/      botão padrão
│       ├── Card/        bloco de conteúdo
│       └── Modal/       diálogo sobreposto (popup de detalhe)
└── lib/
    ├── date.ts          saudação, hora e data por extenso
    └── navigation.ts    catálogo de módulos e regras de visibilidade
```

Cada componente tem seu par `Componente.tsx` + `Componente.module.css`. Nenhum arquivo
mistura regra de negócio, acesso a dados e estilo.

## Layout da área restrita

`(dashboard)/layout.tsx` valida sessão e perfil no servidor e monta o `AppShell`:

| Elemento | Conteúdo |
|---|---|
| Menu lateral | marca do ateliê, módulo ativo e lista de módulos planejados |
| Cabeçalho | nome do usuário, etiqueta do perfil e botão **Sair** |
| Conteúdo | largura máxima de 1200px, centralizado |

### Regra de navegação

`lib/navigation.ts` é a única fonte do menu. Cada item declara `available`:

- `available: true` → vira link clicável.
- `available: false` → aparece **sem link**, com etiqueta "em breve".

Essa divisão existe para cumprir a regra de não ter botão sem função: um módulo só
ganha link quando a tela realmente existir. O contador da tela inicial ("X de N
módulos liberados") é derivado desse catálogo, não é número digitado à mão.

Itens com `minimumRole: "administrador"` só aparecem para administradores — filtro
aplicado por `buildNavigation`, coberto por teste.

### Comportamento responsivo

- Menu sempre em **gaveta** (drawer) controlada pelo botão hambúrguer fixo no
  canto superior esquerdo, em **qualquer largura** de tela (decisão do
  responsável, 2026-11-11): o conteúdo ocupa a largura disponível sem coluna
  fixa de menu.
- O painel desliza de fora da tela, com sobreposição que fecha ao clique, ao
  navegar e à tecla `Escape`.
- O botão declara `aria-expanded` e `aria-controls`; a gaveta fechada usa
  `aria-hidden`; o link ativo recebe `aria-current="page"`.

## Tela inicial

`/home` é a **planilha de preços do ateliê** (decisão do responsável, 2026-11-03):

1. **Tabela de preços por produto e plataforma** — para administradores, uma
   única tabela com uma **linha por produto ativo**: nome, custo atual de
   fabricação e uma **coluna por plataforma** (varejo) mais a coluna de
   atacado direto, cada célula com preço sugerido e margem aplicada (no
   máximo 2 casas decimais). Etiquetas "Revisar preço" e "Custo incompleto"
   na coluna do produto; a coluna de atacado é destacada. A tabela ocupa
   **80% da largura do conteúdo** no desktop (mínimo 720px, com rolagem
   horizontal se necessário) e vira cartões com rótulo por célula
   (`data-label`) em telas estreitas.
2. Nota de rodapé indicando onde pedir acesso quando faltar algum módulo.

A saudação com data por extenso ("Bom dia, eversond14s") os cartões **Seu
acesso** e **Módulos disponíveis** foram **removidos** a pedido do responsável —
essas informações vivem no cabeçalho do painel (usuário, perfil, saída) e na
navegação lateral. Não há indicadores financeiros, gráficos ou números
simulados — nada é exibido além do que existe no banco.

## Fuso horário

O fuso `America/Sao_Paulo` (utilitários em `src/lib/date`) permanece disponível
para as telas que precisarem de data formatada; a tela inicial não exibe mais
data nem saudação.

## Componentes: escopo desta etapa

| Componente | Usado por |
|---|---|
| `Button` |登录 e cabeçalho |
| `Badge` | matriz de preços, cabeçalho, módulos planejados nas configurações |
| `Card` | matriz de preços e painéis das configurações |
| `Modal` | popup de detalhamento do custo do produto (home) |
| `Sidebar`, `AppHeader`, `AppShell` | área restrita |

**Adiados de propósito:** tabela, formulário genérico e notificações só nascem
quando a primeira tela real precisar deles (Etapa 4/5). Criar agora produziria
código morto, contrariando a regra de não montar interface fictícia para
aparentar conclusão.

### Diálogo modal

`src/components/ui/Modal/Modal.tsx` é o primeiro diálogo genérico do projeto
(nasceu com o popup de custo do produto, na home, em 2026-11-13):

- `role="dialog"`, `aria-modal="true"` e `aria-labelledby` apontando para o
  título;
- fecha pela tecla `Escape`, pelo clique na sobreposição e pelo botão de
  fechar;
- o foco entra no painel ao abrir e volta ao elemento de origem ao fechar;
- a rolagem do body fica travada enquanto o diálogo está aberto;
- a sobreposição usa `--z-modal` e o painel reaproveita os tokens de superfície,
  borda, raio e sombra do sistema.

## Testes (unitários de lógica)

- `src/lib/date.test.ts`: faixas de saudação, hora inválida, conversão de fuso, data por
  extenso, primeiro nome.
- `src/lib/navigation.test.ts`: rota ativa e subrota, visibilidade por perfil, separação
  entre disponíveis e planejados, contagem de módulos.

## Critérios de aceite

| Critério | Situação |
|---|---|
| Menu lateral com marca, item ativo e módulos futuros | ✅ |
| Cabeçalho com usuário, perfil e saída funcional | ✅ |
| Layout responsivo com menu deslizante | ✅ |
| Nenhum link aponta para tela inexistente | ✅ |
| Contagem de módulos derivada do catálogo | ✅ |
| Saudação no fuso brasileiro | ✅ |
| `typecheck`, `lint`, testes e `build` | ✅ |
