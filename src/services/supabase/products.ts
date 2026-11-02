import { connection } from "next/server";
import {
  parseProductComponentRow,
  parseProductRow,
} from "@/features/products/parse";
import { buildProductPayload } from "@/features/products/payload";
import type {
  ProductCatalog,
  ProductCompositionEdge,
  ProductInput,
} from "@/features/products/types";
import { parseSupplyRow } from "@/features/supplies/parse";
import { createClient } from "@/services/supabase/server";

/**
 * Carrega produtos, composições e insumos disponíveis para edição.
 * `connection()` impede que a leitura do cliente Supabase rode durante pré-render.
 *
 * @returns catálogo validado para a tela administrativa
 */
export async function listProductCatalog(): Promise<ProductCatalog> {
  await connection();
  const supabase = await createClient();
  const [productsResult, componentsResult, suppliesResult] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true }),
    supabase.from("product_components").select("*"),
    supabase
      .from("supplies")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true }),
  ]);

  if (productsResult.error) {
    throw new Error(
      `Não foi possível carregar os produtos. (código ${productsResult.error.code ?? "desconhecido"})`,
    );
  }

  if (componentsResult.error) {
    throw new Error(
      `Não foi possível carregar as composições. (código ${componentsResult.error.code ?? "desconhecido"})`,
    );
  }

  if (suppliesResult.error) {
    throw new Error(
      `Não foi possível carregar os insumos para composição. (código ${suppliesResult.error.code ?? "desconhecido"})`,
    );
  }

  const products = (productsResult.data ?? []).map(parseProductRow);
  const supplies = (suppliesResult.data ?? []).map(parseSupplyRow);

  if (products.some((product) => product === null)) {
    throw new Error("O catálogo contém um produto fora do formato esperado.");
  }

  if (supplies.some((supply) => supply === null)) {
    throw new Error("O catálogo contém um insumo fora do formato esperado.");
  }

  const validProducts = products.filter((product) => product !== null);
  const validSupplies = supplies.filter((supply) => supply !== null);
  const productById = new Map(validProducts.map((product) => [product.id, product]));
  const supplyById = new Map(
    validSupplies.map((supply) => [
      supply.id,
      { name: supply.name, unit: supply.unit },
    ]),
  );
  const components = (componentsResult.data ?? []).map((databaseRow) =>
    parseProductComponentRow(databaseRow, {
      products: productById,
      supplies: supplyById,
    }),
  );

  if (components.some((component) => component === null)) {
    throw new Error("Uma composição referencia um produto ou insumo inválido.");
  }

  const validComponents = components.filter((component) => component !== null);

  return {
    products: validProducts.map((product) => ({
      ...product,
      components: validComponents.filter(
        (component) => component.productId === product.id,
      ),
    })),
    supplies: validSupplies.map((supply) => ({
      id: supply.id,
      name: supply.name,
      unit: supply.unit,
      isActive: supply.isActive,
    })),
  };
}

/**
 * Carrega as relações entre produtos usadas para detectar ciclos antes de gravar.
 *
 * @returns arestas produto → produto da composição
 */
export async function listProductCompositionEdges(): Promise<ProductCompositionEdge[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("product_components")
    .select("product_id, component_product_id");

  if (error) {
    throw new Error(
      `Não foi possível validar a composição dos produtos. (código ${error.code ?? "desconhecido"})`,
    );
  }

  const edges: ProductCompositionEdge[] = [];

  for (const databaseRow of data ?? []) {
    if (databaseRow.component_product_id === null) {
      continue;
    }

    if (
      typeof databaseRow.product_id !== "string" ||
      typeof databaseRow.component_product_id !== "string"
    ) {
      throw new Error("O catálogo contém uma relação de produtos inválida.");
    }

    edges.push({
      productId: databaseRow.product_id,
      componentProductId: databaseRow.component_product_id,
    });
  }

  return edges;
}

/**
 * Grava produto e composição pela função transacional do banco.
 *
 * @param productId identificador do produto em edição, ou null para criar
 * @param input dados validados
 * @returns identificador do produto gravado
 */
export async function saveProduct(
  productId: string | null,
  input: ProductInput,
): Promise<string> {
  const supabase = await createClient();
  const payload = buildProductPayload(productId, input);
  const { data, error } = await supabase.rpc(
    "save_product_with_components",
    payload,
  );

  if (error) {
    if (error.code === "23505") {
      throw new Error("Já existe um produto com esse nome.");
    }

    if (error.code === "23514") {
      throw new Error(
        error.message.includes("circular")
          ? "A composição criaria uma referência circular."
          : error.message,
      );
    }

    throw new Error(
      `Não foi possível salvar o produto. (código ${error.code ?? "desconhecido"})`,
    );
  }

  if (typeof data !== "string") {
    throw new Error("O banco não confirmou o produto gravado.");
  }

  return data;
}

/**
 * Ativa ou desativa logicamente um produto.
 *
 * @param productId identificador do produto
 * @param isActive nova situação
 */
export async function setProductActive(
  productId: string,
  isActive: boolean,
): Promise<void> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ is_active: isActive })
    .eq("id", productId)
    .select("id")
    .maybeSingle();

  if (error) {
    throw new Error(
      `Não foi possível alterar a situação do produto. (código ${error.code ?? "desconhecido"})`,
    );
  }

  if (!data) {
    throw new Error("O produto não foi encontrado.");
  }
}
