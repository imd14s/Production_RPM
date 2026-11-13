/**
 * Árvore de composições e prevenção de ciclos.
 * A ficha técnica de um produto pode conter outros produtos (kits e
 * subprodutos), mas nunca um produto que, direta ou indiretamente, contenha o
 * primeiro — senão o custo vira loop infinito.
 */

export type CompositionEdge = {
  productId: string;
  componentProductId: string;
};

/**
 * Detecta se usar `candidateProductId` como componente de `productId` cria ciclo.
 *
 * Percorre, para cada produto candidato, todos os produtos que ele contém
 * (direta ou indiretamente) e verifica se o produto pai aparece no caminho.
 *
 * @param edges arestas existentes de composição (productId → componente)
 * @param productId produto que vai receber o componente
 * @param candidateProductId produto candidato a componente
 * @returns true quando a escolha criaria referência circular
 */
export function createsCompositionCycle(
  edges: CompositionEdge[],
  productId: string,
  candidateProductId: string,
): boolean {
  if (candidateProductId === productId) {
    return true;
  }

  const childrenByParent = new Map<string, string[]>();

  for (const edge of edges) {
    const children = childrenByParent.get(edge.productId) ?? [];

    children.push(edge.componentProductId);
    childrenByParent.set(edge.productId, children);
  }

  const stack = [candidateProductId];
  const visited = new Set<string>();

  while (stack.length > 0) {
    const current = stack.pop() ?? "";

    if (current === productId) {
      return true;
    }

    if (visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const child of childrenByParent.get(current) ?? []) {
      stack.push(child);
    }
  }

  return false;
}
