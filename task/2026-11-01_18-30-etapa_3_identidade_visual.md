# Etapa 3 — Identidade visual e estrutura

**Data:** 2026-11-01 18:30
**Branch:** `dev`
**Status:** Concluída

## Objetivo

Criar o esqueleto visual definitivo da área restrita (menu lateral, cabeçalho,
conteúdo) e os componentes básicos reutilizáveis, respeitando `visual.md` e a regra de
não construir tela fictícia.

## Contexto

Login validado manualmente pelo responsável. A aplicação está conectada ao projeto
Supabase `fohqznrdiyudnquynkdt`; `profiles` existe com RLS e o usuário
`eversond14s@gmail.com` está como `administrador`.

## Decisões

1. **Menu derivado de um catálogo único.** `src/lib/navigation.ts` declara os módulos
   com `available: boolean`. Enquanto não existe rota, o item aparece como texto com
   etiqueta "em breve", nunca como link. Isso evita 404 e botão sem função.
2. **Sidebar é client component.** Precisa de `usePathname` para marcar o item ativo e
   de estado local para o modo móvel. O restante do layout permanece no servidor.
3. **Fuso explícito.** O servidor roda em UTC; saudação e data usam
   `America/Sao_Paulo` para não cumprimentar errado.
4. **Componentes adiados.** Tabela, modal, formulário genérico e notificações ficam
   para a primeira tela que realmente precisar deles (Etapa 4/5), evitando código
   morto.
5. **Nenhum número inventado.** A tela inicial mostra apenas sessão e catálogo de
   módulos.

## Arquivos criados

| Arquivo | Papel |
|---|---|
| `src/components/ui/Button/{Button.tsx,Button.module.css}` | botão primário/secundário/ghost |
| `src/components/ui/Badge/{Badge.tsx,Badge.module.css}` | etiqueta de estado |
| `src/components/ui/Card/{Card.tsx,Card.module.css}` | bloco de conteúdo |
| `src/components/layout/Sidebar/{Sidebar.tsx,Sidebar.module.css}` | menu lateral e modo móvel |
| `src/components/layout/AppHeader/{AppHeader.tsx,AppHeader.module.css}` | usuário, perfil e saída |
| `src/components/layout/AppShell/{AppShell.tsx,AppShell.module.css}` | composição do layout |
| `src/lib/date.ts` + teste | saudação, fuso e data por extenso |
| `src/lib/navigation.ts` + teste | catálogo de módulos e visibilidade por perfil |

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `src/app/(dashboard)/layout.tsx` | passou a usar `AppShell` |
| `src/app/(dashboard)/home/page.tsx` | cartões de acesso e módulos, saudação com fuso |
| `src/app/(dashboard)/home/home.module.css` | novo grid e lista de módulos |
| `src/app/(auth)/login/LoginForm.tsx` | usa `Button` |
| `src/app/(auth)/login/LoginForm.module.css` | `.submit` apenas largura total |

## Arquivos removidos

| Arquivo | Motivo |
|---|---|
| `src/app/(dashboard)/layout.module.css` | estilos absorvidos por `AppShell`, `Sidebar` e `AppHeader` |

## Validação

```
npm run typecheck  → ok
npm run lint       → ok
npm test           → 55 testes, 7 suítes
npm run build      → ok (/home e /login dinâmicas, proxy ativo)
GET /login         → 200
GET /home (sem sessão) → 307 /login
```

Validação visual final depende do navegador do responsável.

## Pendências

- Conferir o layout no navegador (desktop e janela estreita).
- Próxima etapa: configurações empresariais (Etapa 4).
