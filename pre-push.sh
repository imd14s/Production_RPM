#!/usr/bin/env bash
#
# Validação obrigatória antes de reportar conclusão ou enviar código.
# Executa tipagem, linter e testes unitários. Falha rápido no primeiro erro.

set -euo pipefail

echo "→ typecheck"
npm run typecheck

echo "→ lint"
npm run lint

echo "→ tests"
npm run test -- --ci

echo "✓ validação concluída"
