import type { Metadata } from "next";
import { connection } from "next/server";
import { InventoryPanel } from "@/features/production/InventoryPanel";
import { listSupplies } from "@/services/supabase/supplies";
import { listProductCatalog } from "@/services/supabase/products";
import { listInventoryMovements } from "@/services/supabase/production";

export const metadata: Metadata = {
  title: "Estoque — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function InventoryPage() {
  await connection();
  const [supplies, catalog, movements] = await Promise.all([
    listSupplies(),
    listProductCatalog(),
    listInventoryMovements(),
  ]);

  const items = [
    ...supplies.map((supply) => ({ id: supply.id, name: supply.name, type: "supply" as const })),
    ...catalog.products.map((product) => ({ id: product.id, name: product.name, type: "product" as const })),
  ];

  return <InventoryPanel items={items} movements={movements} />;
}