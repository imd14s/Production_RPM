import type { SupplyUnit } from "@/features/supplies/types";

export type ProductKind = "fabricado" | "revenda" | "impressao_3d" | "kit";

export type Product = {
  id: string;
  name: string;
  kind: ProductKind;
  laborMinutes: number | null;
  energyCostCents: number | null;
  machineCostCents: number | null;
  finishingCostCents: number | null;
  failureRatePercent: number | null;
  isActive: boolean;
  notes: string;
};

export type ProductComponentInput =
  | {
      targetType: "supply";
      supplyId: string;
      quantity: number;
    }
  | {
      targetType: "product";
      productId: string;
      quantity: number;
    };

export type ProductComponent = {
  id: string;
  productId: string;
  targetType: "supply" | "product";
  targetId: string;
  targetName: string;
  unit: SupplyUnit | "unidade";
  quantity: number;
};

export type ProductWithComponents = Product & {
  components: ProductComponent[];
};

export type ProductCatalog = {
  products: ProductWithComponents[];
  supplies: {
    id: string;
    name: string;
    unit: SupplyUnit;
    isActive: boolean;
  }[];
};

export type ProductInput = {
  name: string;
  kind: ProductKind;
  laborMinutes: number | null;
  energyCostCents: number | null;
  machineCostCents: number | null;
  finishingCostCents: number | null;
  failureRatePercent: number | null;
  notes: string;
  components: ProductComponentInput[];
};

export type ProductCompositionEdge = {
  productId: string;
  componentProductId: string;
};

export const PRODUCT_KINDS: ProductKind[] = [
  "fabricado",
  "revenda",
  "impressao_3d",
  "kit",
];

export const PRODUCT_KIND_LABELS: Record<ProductKind, string> = {
  fabricado: "Fabricado",
  revenda: "Revenda",
  impressao_3d: "Impressão 3D",
  kit: "Kit ou combo",
};
