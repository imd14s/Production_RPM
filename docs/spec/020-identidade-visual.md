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
│       └── Card/        bloco de conteúdo
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

- Acima de 900px: menu fixo de 256px e conteúdo ao lado.
- Até 900px: menu deslizante fora da tela, aberto por um botão de menu no canto
  superior esquerdo, com sobreposição que fecha ao clique e ao navegar.
- O botão declara `aria-expanded` e `aria-controls`; o link ativo recebe
  `aria-current="page"`.

## Tela inicial

`/home` exibe apenas dados reais:

1. Saudação conforme a hora em `America/Sao_Paulo` e data por extenso.
2. Cartão **Seu acesso**: perfil, e-mail e situação da conta.
3. Cartão **Módulos disponíveis**: contagem derivada do catálogo e a lista do que
   está em desenvolvimento.

Não há indicadores financeiros, gráficos ou números simulados — nada disso existe no
banco ainda.

## Fuso horário

O servidor roda em UTC. `getHourInTimeZone` converte para `America/Sao_Paulo` antes de
escolher a saudação, e `formatLongDate` formata data também nesse fuso. Sem isso, "Bom
dia" apareceria à noite para o usuário brasileiro.

## Componentes: escopo desta etapa

| Componente | Usado por |
|---|---|
| `Button` | login e cabeçalho |
| `Badge` | perfil, situação da conta, módulos planejados |
| `Card` | tela inicial |
| `Sidebar`, `AppHeader`, `AppShell` | área restrita |

**Adiados de propósito:** tabela, modal, formulário genérico e notificações só nascem
quando a primeira tela real precisar deles (Etapa 4/5). Criar agora produziria código
morto, contrariando a regra de não montar interface fictícia para aparentar conclusão.

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
