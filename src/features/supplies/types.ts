/**
 * Tipos e rótulos dos insumos e das aquisições.
 * Enums vivem no banco (ver migration 20261102110000).
 */

export type SupplyKind = "materia_prima" | "revenda" | "impressao_3d" | "embalagem" | "outro";

export type SupplyUnit =
  | "unidade"
  | "metro"
  | "grama"
  | "quilograma"
  | "mililitro"
  | "litro"
  | "pacote"
  | "caixa"
  | "outro";

export type Supply = {
  id: string;
  name: string;
  kind: SupplyKind;
  unit: SupplyUnit;
  isActive: boolean;
  notes: string;
};

export type SupplyInput = {
  name: string;
  kind: SupplyKind;
  unit: SupplyUnit;
  notes: string;
};

export type SupplyPrice = {
  id: string;
  supplyId: string;
  supplierId: string | null;
  acquiredOn: string;
  quantity: number;
  amountCents: number;
  freightCents: number;
  unitCostCents: number;
  notes: string;
};

export type SupplyPriceInput = {
  supplierId: string | null;
  acquiredOn: string;
  quantity: number;
  amountCents: number;
  freightCents: number;
  notes: string;
};

export type SupplyWithCost = {
  supply: Supply;
  /** Custo por unidade da aquisição mais recente, sem frete zerado. */
  currentUnitCostCents: number | null;
  /** Data (ISO curto) da aquisição mais recente, quando existe. */
  lastAcquiredOn: string | null;
  /** Quantidade de aquisições registradas. */
  acquisitionCount: number;
};

export type SupplyWithPrices = {
  supply: Supply;
  prices: SupplyPrice[];
};

export const SUPPLY_KIND_LABELS: Record<SupplyKind, string> = {
  materia_prima: "Matéria-prima",
  revenda: "Revenda",
  impressao_3d: "Impressão 3D",
  embalagem: "Embalagem",
  outro: "Outro",
};

export const SUPPLY_KINDS: SupplyKind[] = [
  "materia_prima",
  "revenda",
  "impressao_3d",
  "embalagem",
  "outro",
];

export const SUPPLY_UNIT_LABELS: Record<SupplyUnit, string> = {
  unidade: "Unidade",
  metro: "Metro",
  grama: "Grama",
  quilograma: "Quilograma",
  mililitro: "Mililitro",
  litro: "Litro",
  pacote: "Pacote",
  caixa: "Caixa",
  outro: "Outro",
};

export const SUPPLY_UNITS: SupplyUnit[] = [
  "unidade",
  "metro",
  "grama",
  "quilograma",
  "mililitro",
  "litro",
  "pacote",
  "caixa",
  "outro",
];
