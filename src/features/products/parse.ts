import type {
  Product,
  ProductComponent,
  ProductKind,
} from "@/features/products/types";
import { PRODUCT_KINDS } from "@/features/products/types";
import type { SupplyUnit } from "@/features/supplies/types";

/**
 * Converte um valor desconhecido em registro de campos não tipados.
 *
 * @param databaseRow valor bruto retornado pelo Supabase
 * @returns registro tipado estruturalmente, ou null para valores não-objeto
 */
function asRecord(databaseRow: unknown): Record<string, unknown> | null {
  return typeof databaseRow === "object" && databaseRow !== null
    ? (databaseRow as Record<string, unknown>)
    : null;
}

/**
 * Converte uma linha de `products` para o tipo de domínio.
 *
 * @param databaseRow linha retornada pelo Supabase
 * @returns produto validado ou null quando a linha viola o contrato
 */
export function parseProductRow(databaseRow: unknown): Product | null {
  const candidate = asRecord(databaseRow);

  if (!candidate) {
    return null;
  }

  const id = candidate.id;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const kind = candidate.kind;
  const laborMinutes = candidate.labor_minutes;
  const isActive = candidate.is_active;
  const notes = candidate.notes;

  if (
    typeof id !== "string" ||
    name.length < 2 ||
    name.length > 120 ||
    typeof kind !== "string" ||
    !PRODUCT_KINDS.includes(kind as ProductKind) ||
    typeof isActive !== "boolean" ||
    (laborMinutes !== null &&
      (typeof laborMinutes !== "number" ||
        !Number.isInteger(laborMinutes) ||
        laborMinutes < 0 ||
        laborMinutes > 2880)) ||
    (notes !== null && typeof notes !== "string")
  ) {
    return null;
  }

  return {
    id,
    name,
    kind: kind as ProductKind,
    laborMinutes: typeof laborMinutes === "number" ? laborMinutes : null,
    isActive,
    notes: typeof notes === "string" ? notes : "",
  };
}

/**
 * Converte uma linha de `product_components` e resolve o nome do item associado.
 *
 * @param databaseRow linha retornada pelo Supabase
 * @param targets catálogo de produtos e insumos para resolução dos rótulos
 * @returns componente validado ou null quando a linha viola o contrato
 */
export function parseProductComponentRow(
  databaseRow: unknown,
  targets: {
    products: Map<string, Product>;
    supplies: Map<string, { name: string; unit: SupplyUnit }>;
  },
): ProductComponent | null {
  const candidate = asRecord(databaseRow);

  if (!candidate) {
    return null;
  }

  const id = candidate.id;
  const productId = candidate.product_id;
  const supplyId = candidate.supply_id;
  const componentProductId = candidate.component_product_id;
  const quantity = readQuantity(candidate.quantity);
  const hasSupply = typeof supplyId === "string";
  const hasProduct = typeof componentProductId === "string";

  if (
    typeof id !== "string" ||
    typeof productId !== "string" ||
    quantity === null ||
    (supplyId !== null && typeof supplyId !== "string") ||
    (componentProductId !== null && typeof componentProductId !== "string") ||
    hasSupply === hasProduct
  ) {
    return null;
  }

  if (typeof supplyId === "string") {
    const supply = targets.supplies.get(supplyId);

    return supply
      ? {
          id,
          productId,
          targetType: "supply",
          targetId: supplyId,
          targetName: supply.name,
          unit: supply.unit,
          quantity,
        }
      : null;
  }

  if (typeof componentProductId !== "string") {
    return null;
  }

  const product = targets.products.get(componentProductId);

  return product
    ? {
        id,
        productId,
        targetType: "product",
        targetId: componentProductId,
        targetName: product.name,
        unit: "unidade",
        quantity,
      }
    : null;
}

/**
 * Lê a quantidade numérica positiva retornada pelo banco.
 *
 * @param value valor desconhecido da coluna quantity
 * @returns quantidade válida com no máximo três casas decimais, ou null
 */
function readQuantity(value: unknown): number | null {
  const quantity =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (
    !Number.isFinite(quantity) ||
    quantity <= 0 ||
    quantity > 1_000_000 ||
    Number(quantity.toFixed(3)) !== quantity
  ) {
    return null;
  }

  return quantity;
}
