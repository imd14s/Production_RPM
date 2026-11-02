# Etapa 8 — Relatórios e validação

**Data de Criação:** 2026-11-02 15:00
**Agente:** OpenCode — Beam Free
**Status:** ✅ Implementada no código
**Etapa:** 8 de 9 (ver `task.md`)

## Objetivo

Implementar a tela de relatórios com indicadores de rentabilidade, custos por
categoria, comparação entre canais e evolução de preços de insumos.

## Sub-etapas propostas

1. 8.1 Modelagem de consultas e agregações.
2. 8.2 Indicadores de rentabilidade.
3. 8.3 Custos por categoria.
4. 8.4 Comparação entre canais.
5. 8.5 Evolução de preços de insumos.
6. 8.6 UI `/relatorios`.

## Áreas afetadas

- `src/app/(dashboard)/relatorios/`
- `src/features/reports/` (a criar)
- `src/services/supabase/`
- `docs/spec/100-relatorios.md`

## Pendências

- Definir agregações no servidor vs. cliente.
- Confirmar se relatórios são persistidos ou on demand.