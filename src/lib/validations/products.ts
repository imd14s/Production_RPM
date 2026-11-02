import { parseQuantityInput } from "@/lib/quantity";
import { readText } from "@/lib/validations/settings";
import type {
  ProductComponentInput,
  ProductInput,
  ProductKind,
} from "@/features/products/types";
import { PRODUCT_KINDS } from "@/features/products/types";

export type ProductValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: Record<string, string> };

/**
 * Valida e normaliza os dados de um produto e da sua composição.
 *
 * @param inputData campos não confiáveis do formulário
 * @returns dados prontos para gravação ou mensagens por campo
 */
export function validateProduct(
  inputData: Record<string, unknown>,
): ProductValidationResult {
  const errors: Record<string, string> = {};
  const name = readText(inputData, "name");
  const kindText = readText(inputData, "kind");
  const notes = readText(inputData, "notes");
  const laborText = readText(inputData, "laborMinutes");
  const kind = kindText as ProductKind;
  const laborMinutes = laborText === "" ? null : Number(laborText);
  const rawComponents = inputData.components;
  const components =
    rawComponents === undefined || typeof rawComponents === "string"
      ? parseComponents(typeof rawComponents === "string" ? rawComponents : "")
      : { ok: false as const, message: "A composição enviada é inválida." };

  if (name.length < 2 || name.length > 120) {
    errors.name = "Informe o nome do produto (2 a 120 caracteres).";
  }

  if (!PRODUCT_KINDS.includes(kind)) {
    errors.kind = "Escolha a modalidade do produto.";
  }

  if (
    laborText !== "" &&
    (!Number.isInteger(laborMinutes) ||
      laborMinutes === null ||
      laborMinutes < 0 ||
      laborMinutes > 2880)
  ) {
    errors.laborMinutes = "Informe um tempo inteiro entre 0 e 2.880 minutos.";
  }

  if (notes.length > 500) {
    errors.notes = "Observação deve ter até 500 caracteres.";
  }

  if (!components.ok) {
    errors.components = components.message;
  } else if (
    kind === "kit" &&
    (components.value.length === 0 ||
      components.value.some((component) => component.targetType !== "product"))
  ) {
    errors.components = "Um kit precisa ter ao menos um componente do tipo produto.";
  }

  if (Object.keys(errors).length > 0 || !components.ok) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      name,
      kind,
      laborMinutes,
      notes,
      components: components.value,
    },
  };
}

/**
 * Converte a composição JSON do formulário em componentes tipados.
 *
 * @param value JSON serializado pelo formulário
 * @returns componentes validados ou mensagem de erro
 */
function parseComponents(
  value: string,
):
  | { ok: true; value: ProductComponentInput[] }
  | { ok: false; message: string } {
  if (value === "") {
    return { ok: true, value: [] };
  }

  let parsed: unknown;

  try {
    parsed = JSON.parse(value);
  } catch {
    return { ok: false, message: "A composição enviada é inválida." };
  }

  if (!Array.isArray(parsed)) {
    return { ok: false, message: "A composição enviada é inválida." };
  }

  const components: ProductComponentInput[] = [];

  for (const entry of parsed) {
    if (typeof entry !== "object" || entry === null) {
      return { ok: false, message: "Revise os itens da composição." };
    }

    const candidate = entry as Record<string, unknown>;
    const targetType = candidate.targetType;
    const supplyId = candidate.supplyId;
    const productId = candidate.productId;
    const quantityText =
      typeof candidate.quantity === "number" || typeof candidate.quantity === "string"
        ? String(candidate.quantity)
        : "";
    const quantity = parseQuantityInput(quantityText);

    if (
      quantity === null ||
      (targetType !== "supply" && targetType !== "product")
    ) {
      return { ok: false, message: "Revise os itens e as quantidades da composição." };
    }

    if (targetType === "supply") {
      if (!isUuid(supplyId) || productId !== null) {
        return { ok: false, message: "Revise os insumos da composição." };
      }

      components.push({ targetType, supplyId, quantity });
      continue;
    }

    if (!isUuid(productId) || supplyId !== null) {
      return { ok: false, message: "Revise os produtos da composição." };
    }

    components.push({ targetType, productId, quantity });
  }

  return { ok: true, value: components };
}

/**
 * Confirma que um valor tem o formato textual de UUID.
 *
 * @param value campo recebido do formulário
 * @returns true para UUID canônico
 */
export function isUuid(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  );
}
