import { parseAmountToCents } from "@/lib/money";
import { parseQuantityInput } from "@/lib/quantity";
import { readText } from "@/lib/validations/settings";
import { convertToBaseUnit } from "@/services/calculations/units";
import type {
  ProductComponentInput,
  ProductInput,
  ProductKind,
} from "@/features/products/types";
import { PRODUCT_KINDS } from "@/features/products/types";
import type { SupplyUnit } from "@/features/supplies/types";

export type ProductValidationResult =
  | { ok: true; data: ProductInput }
  | { ok: false; errors: Record<string, string> };

/**
 * Unidade base de um insumo e a equivalência de sua embalagem.
 */
export type SupplyUnitContext = {
  /** Unidade em que a compra e o custo do insumo foram registrados. */
  unit: SupplyUnit;
  /** Quantas unidades cabem na caixa ou pacote, quando informado. */
  unitsPerPackage: number | null;
};

/**
 * Contexto de unidades dos insumos, indexado pelo identificador.
 */
export type SupplyUnitContexts = Map<string, SupplyUnitContext>;

/**
 * Valida e normaliza os dados de um produto e da sua composição.
 *
 * @param inputData campos não confiáveis do formulário
 * @param supplyContexts unidade base de cada insumo, para converter a quantidade
 * @returns dados prontos para gravação ou mensagens por campo
 */
export function validateProduct(
  inputData: Record<string, unknown>,
  supplyContexts: SupplyUnitContexts = new Map(),
): ProductValidationResult {
  const errors: Record<string, string> = {};
  const name = readText(inputData, "name");
  const kindText = readText(inputData, "kind");
  const notes = readText(inputData, "notes");
  const laborText = readText(inputData, "laborMinutes");
  const energyText = readText(inputData, "energyCost");
  const machineText = readText(inputData, "machineCost");
  const finishingText = readText(inputData, "finishingCost");
  const failureRateText = readText(inputData, "failureRate");
  const kind = kindText as ProductKind;
  const laborMinutes = laborText === "" ? null : Number(laborText);
  const energyCostCents = energyText === "" ? null : parseAmountToCents(energyText);
  const machineCostCents = machineText === "" ? null : parseAmountToCents(machineText);
  const finishingCostCents = finishingText === "" ? null : parseAmountToCents(finishingText);
  const failureRatePercent = failureRateText === "" ? null : Number(failureRateText.replace(",", "."));
  const rawComponents = inputData.components;
  const components =
    rawComponents === undefined || typeof rawComponents === "string"
      ? parseComponents(
          typeof rawComponents === "string" ? rawComponents : "",
          supplyContexts,
        )
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

  if (energyText !== "" && energyCostCents === null) {
    errors.energyCost = "Informe um valor válido.";
  }

  if (machineText !== "" && machineCostCents === null) {
    errors.machineCost = "Informe um valor válido.";
  }

  if (finishingText !== "" && finishingCostCents === null) {
    errors.finishingCost = "Informe um valor válido.";
  }

  if (
    failureRateText !== "" &&
    (!Number.isFinite(failureRatePercent) ||
      failureRatePercent === null ||
      failureRatePercent < 0 ||
      failureRatePercent > 100)
  ) {
    errors.failureRate = "Informe um percentual entre 0 e 100.";
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
      energyCostCents,
      machineCostCents,
      finishingCostCents,
      failureRatePercent,
      notes,
      components: components.value,
    },
  };
}

/**
 * Converte a composição JSON do formulário em componentes tipados.
 *
 * A quantidade pode ser informada em unidade equivalente à base do insumo
 * (grama para quilograma, unidade para caixa); aqui ela é convertida para a
 * unidade base, que é a única gravada.
 *
 * @param value JSON serializado pelo formulário
 * @param supplyContexts unidade base de cada insumo
 * @returns componentes validados ou mensagem de erro
 */
function parseComponents(
  value: string,
  supplyContexts: SupplyUnitContexts,
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
    const unitText = candidate.unit;
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

      const context = supplyContexts.get(supplyId);

      if (!context) {
        // Sem o contexto da unidade, a quantidade é mantida como foi digitada.
        // Quem chama com o contexto (a ação do servidor) garante a conversão.
        components.push({ targetType, supplyId, quantity });
        continue;
      }

      const unit = typeof unitText === "string" ? (unitText as SupplyUnit) : context.unit;
      const baseQuantity = convertToBaseUnit(
        quantity,
        unit,
        context.unit,
        context.unitsPerPackage,
      );

      if (baseQuantity === null) {
        return {
          ok: false,
          message: "Revise a unidade da quantidade: ela não corresponde ao insumo.",
        };
      }

      components.push({ targetType, supplyId, quantity: baseQuantity });
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
