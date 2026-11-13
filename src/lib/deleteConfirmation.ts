/**
 * Monta a mensagem de confirmação da exclusão física, avisando o que será
 * removido junto. Função pura: sem acesso a banco ou interface.
 */

/**
 * Texto de confirmação exibido antes de excluir um registro.
 *
 * @param entityName tipo do registro em pt-BR (ex.: "insumo")
 * @param label nome do registro
 * @param warnings avisos sobre o que será removido junto
 * @returns mensagem completa de confirmação
 */
export function buildDeleteConfirmation(
  entityName: string,
  label: string,
  warnings: string[] = [],
): string {
  const base = `Excluir ${entityName} "${label}" permanentemente? Esta ação não pode ser desfeita.`;

  if (warnings.length === 0) {
    return base;
  }

  const list = warnings.map((warning) => `- ${warning}`).join("\n");

  return `${base}\n\nO que também será removido:\n${list}`;
}
