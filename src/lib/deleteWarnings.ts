/**
 * Monta o texto de aviso das dependências que serão removidas junto com o
 * registro excluído. Funções puras: sem acesso a banco ou interface.
 */

/**
 * Formata a contagem de registros removidos em cascata.
 *
 * @param count quantidade de registros afetados
 * @param singular rótulo no singular (ex.: "custo registrado do produto")
 * @param plural rótulo no plural (ex.: "custos registrados do produto")
 * @param gender gênero do rótulo, para concordar com o verbo
 * @returns frase com a contagem e o rótulo
 */
export function formatCountedRemoval(
  count: number,
  singular: string,
  plural: string,
  gender: "masculino" | "feminino" = "masculino",
): string {
  if (count <= 0) {
    return "";
  }

  if (count === 1) {
    return gender === "feminino"
      ? `1 ${singular} será apagada`
      : `1 ${singular} será apagado`;
  }

  return gender === "feminino"
    ? `${count} ${plural} serão apagadas`
    : `${count} ${plural} serão apagados`;
}

/**
 * Avisos de um insumo usado em fichas técnicas de produtos.
 *
 * @param productNames nomes dos produtos cuja ficha técnica usa o insumo
 * @returns lista de avisos em pt-BR
 */
export function buildSupplyWarnings(productNames: string[]): string[] {
  if (productNames.length === 0) {
    return [];
  }

  const names = productNames.join(", ");

  return productNames.length === 1
    ? [`a ficha técnica do produto ${names} deixa de usar este insumo`]
    : [`as fichas técnicas dos produtos ${names} deixam de usar este insumo`];
}

/**
 * Avisos de um produto com custo registrado, simulações ou uso como kit.
 *
 * @param costSnapshotCount quantidade de custos registrados do produto
 * @param simulationCount quantidade de simulações de precificação do produto
 * @param kitNames nomes dos produtos que usam este produto como componente
 * @returns lista de avisos em pt-BR
 */
export function buildProductWarnings(input: {
  costSnapshotCount: number;
  simulationCount: number;
  kitNames: string[];
}): string[] {
  const warnings: string[] = [];

  const costWarning = formatCountedRemoval(
    input.costSnapshotCount,
    "custo registrado do produto",
    "custos registrados do produto",
  );

  if (costWarning) {
    warnings.push(costWarning);
  }

  const simulationWarning = formatCountedRemoval(
    input.simulationCount,
    "simulação de precificação",
    "simulações de precificação",
    "feminino",
  );

  if (simulationWarning) {
    warnings.push(simulationWarning);
  }

  if (input.kitNames.length > 0) {
    const names = input.kitNames.join(", ");

    warnings.push(
      input.kitNames.length === 1
        ? `o produto sai da ficha técnica do kit ${names}`
        : `o produto sai da ficha técnica dos kits ${names}`,
    );
  }

  return warnings;
}

/**
 * Avisos de um canal de venda ou meio de pagamento usado em simulações.
 *
 * @param simulationCount quantidade de simulações de precificação
 * @returns lista de avisos em pt-BR
 */
export function buildSimulationWarnings(simulationCount: number): string[] {
  const warning = formatCountedRemoval(
    simulationCount,
    "simulação de precificação",
    "simulações de precificação",
    "feminino",
  );

  return warning ? [warning] : [];
}
