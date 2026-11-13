import {
  buildProductWarnings,
  buildSimulationWarnings,
  buildSupplyWarnings,
} from "@/lib/deleteWarnings";
import { createClient } from "@/services/supabase/server";

/**
 * Avisos de dependências por registro, prontos para a confirmação de exclusão.
 * A chave é o identificador do registro e o valor são os avisos em pt-BR.
 */
export type DeleteWarnings = Record<string, string[]>;

/**
 * Lê uma linha do banco como registro de campos legíveis.
 *
 * @param row linha devolvida pelo Supabase
 * @returns registro com campos ou null quando a linha não é um objeto
 */
function readRow(row: unknown): Record<string, unknown> | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  return row as Record<string, unknown>;
}

/**
 * Converte o resultado de uma consulta em lista de registros legíveis.
 *
 * @param data dados devolvidos pelo Supabase
 * @returns lista de registros
 */
function readRows(data: unknown): Record<string, unknown>[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data
    .map(readRow)
    .filter((row): row is Record<string, unknown> => row !== null);
}

/**
 * Lê um identificador de uma linha do banco.
 *
 * @param row linha do banco
 * @param column nome da coluna
 * @returns identificador ou string vazia
 */
function readId(row: Record<string, unknown>, column: string): string {
  const value = row[column];

  return typeof value === "string" ? value : "";
}

/**
 * Agrupa avisos por registro, ignorando registros sem dependências.
 *
 * @param entries dependências com o identificador do registro e o aviso
 * @returns mapa de avisos por identificador
 */
function groupWarnings(
  entries: { id: string; warning: string }[],
): DeleteWarnings {
  const warnings: DeleteWarnings = {};

  for (const entry of entries) {
    if (!entry.warning) {
      continue;
    }

    warnings[entry.id] = warnings[entry.id]
      ? [...warnings[entry.id], entry.warning]
      : [entry.warning];
  }

  return warnings;
}

/**
 * Lista os produtos cuja ficha técnica usa os insumos informados.
 *
 * @param supplyIds identificadores dos insumos
 * @returns mapa de avisos por insumo
 */
export async function listSupplyDeleteWarnings(
  supplyIds: string[],
): Promise<DeleteWarnings> {
  if (supplyIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const componentsResult = await supabase
    .from("product_components")
    .select("supply_id, product_id")
    .in("supply_id", supplyIds);

  const components = readRows(componentsResult.data);

  if (components.length === 0) {
    return {};
  }

  const productIds = [
    ...new Set(
      components
        .map((component) => readId(component, "product_id"))
        .filter((id) => id !== ""),
    ),
  ];
  const productsResult = await supabase
    .from("products")
    .select("id, name")
    .in("id", productIds);

  const productNames = new Map(
    readRows(productsResult.data).map((product) => [
      readId(product, "id"),
      readId(product, "name"),
    ]),
  );

  const namesBySupply = new Map<string, string[]>();

  for (const component of components) {
    const supplyId = readId(component, "supply_id");
    const name = productNames.get(readId(component, "product_id"));

    if (!supplyId || !name) {
      continue;
    }

    const current = namesBySupply.get(supplyId) ?? [];

    if (!current.includes(name)) {
      namesBySupply.set(supplyId, [...current, name]);
    }
  }

  return groupWarnings(
    [...namesBySupply.entries()].map(([id, names]) => ({
      id,
      warning: buildSupplyWarnings(names).join("\n"),
    })),
  );
}

/**
 * Lista o custo registrado, as simulações e os kits ligados aos produtos.
 *
 * @param productIds identificadores dos produtos
 * @returns mapa de avisos por produto
 */
export async function listProductDeleteWarnings(
  productIds: string[],
): Promise<DeleteWarnings> {
  if (productIds.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const [snapshotsResult, simulationsResult, kitResult] = await Promise.all([
    supabase
      .from("cost_snapshots")
      .select("id, product_id")
      .in("product_id", productIds),
    supabase
      .from("pricing_simulations")
      .select("id, product_id")
      .in("product_id", productIds),
    supabase
      .from("product_components")
      .select("component_product_id, product_id")
      .in("component_product_id", productIds),
  ]);

  const snapshots = readRows(snapshotsResult.data);
  const simulations = readRows(simulationsResult.data);
  const kitComponents = readRows(kitResult.data);

  const kitProductIds = [
    ...new Set(
      kitComponents
        .map((item) => readId(item, "product_id"))
        .filter((id) => id !== ""),
    ),
  ];
  const kitsResult = await supabase
    .from("products")
    .select("id, name")
    .in("id", kitProductIds);

  const kitNames = new Map(
    readRows(kitsResult.data).map((kit) => [
      readId(kit, "id"),
      readId(kit, "name"),
    ]),
  );

  const kitsByProduct = new Map<string, string[]>();

  for (const item of kitComponents) {
    const componentId = readId(item, "component_product_id");
    const name = kitNames.get(readId(item, "product_id"));

    if (!componentId || !name) {
      continue;
    }

    const current = kitsByProduct.get(componentId) ?? [];

    if (!current.includes(name)) {
      kitsByProduct.set(componentId, [...current, name]);
    }
  }

  return groupWarnings(
    productIds.map((id) => ({
      id,
      warning: buildProductWarnings({
        costSnapshotCount: countByProduct(snapshots, id),
        simulationCount: countByProduct(simulations, id),
        kitNames: kitsByProduct.get(id) ?? [],
      }).join("\n"),
    })),
  );
}

/**
 * Lista as simulações de precificação dos canais informados.
 *
 * @param channelIds identificadores dos canais
 * @returns mapa de avisos por canal
 */
export async function listChannelDeleteWarnings(
  channelIds: string[],
): Promise<DeleteWarnings> {
  return listSimulationWarnings("channel_id", channelIds);
}

/**
 * Lista as simulações de precificação dos meios de pagamento informados.
 *
 * @param methodIds identificadores dos meios de pagamento
 * @returns mapa de avisos por meio de pagamento
 */
export async function listPaymentMethodDeleteWarnings(
  methodIds: string[],
): Promise<DeleteWarnings> {
  return listSimulationWarnings("payment_method_id", methodIds);
}

/**
 * Conta as simulações de precificação por registro.
 *
 * @param column coluna que referencia o registro ("channel_id" ou "payment_method_id")
 * @param ids identificadores dos registros
 * @returns mapa de avisos por registro
 */
async function listSimulationWarnings(
  column: "channel_id" | "payment_method_id",
  ids: string[],
): Promise<DeleteWarnings> {
  if (ids.length === 0) {
    return {};
  }

  const supabase = await createClient();
  const result = await supabase
    .from("pricing_simulations")
    .select(`id, ${column}`)
    .in(column, ids);

  const simulations = readRows(result.data);
  const countById = new Map<string, number>();

  for (const simulation of simulations) {
    const id = readId(simulation, column);

    if (!id) {
      continue;
    }

    countById.set(id, (countById.get(id) ?? 0) + 1);
  }

  return groupWarnings(
    ids.map((id) => ({
      id,
      warning: buildSimulationWarnings(countById.get(id) ?? 0).join("\n"),
    })),
  );
}

/**
 * Conta os registros de uma lista que pertencem a um produto.
 *
 * @param rows linhas com `product_id`
 * @param productId identificador do produto
 * @returns quantidade de linhas do produto
 */
function countByProduct(
  rows: Record<string, unknown>[],
  productId: string,
): number {
  return rows.filter((row) => readId(row, "product_id") === productId).length;
}
