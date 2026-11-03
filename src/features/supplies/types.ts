/**
 * Tipos e rótulos dos insumos. Enums vivem no banco.
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
  quantity: number | null;
  acquiredOn: string | null;
  amountCents: number | null;
  freightCents: number | null;
  currentUnitCostCents: number | null;
  isActive: boolean;
  notes: string;
};

export type SupplyInput = {
  name: string;
  kind: SupplyKind;
  unit: SupplyUnit;
  quantity: number;
  acquiredOn: string;
  amountCents: number;
  freightCents: number;
  notes: string;
};

export type SupplyWithCost = Supply;

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
