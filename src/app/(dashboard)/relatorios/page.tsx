import type { Metadata } from "next";
import { connection } from "next/server";
import { ReportsPanel } from "@/features/reports/ReportsPanel";
import { listProductCatalog } from "@/services/supabase/products";
import { listPricingSimulationsByProduct } from "@/services/supabase/pricing";
import { listSuppliesWithCost } from "@/services/supabase/supplies";

export const metadata: Metadata = {
  title: "Relatórios — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function ReportsPage() {
  await connection();
  const [catalog, supplies] = await Promise.all([
    listProductCatalog(),
    listSuppliesWithCost(),
  ]);

  const productIds = catalog.products.map((product) => product.id);
  const simulationsByProduct = await Promise.all(
    productIds.map(async (id) => ({ productId: id, simulations: await listPricingSimulationsByProduct(id) })),
  );

  const simulations = simulationsByProduct.flatMap((entry) => entry.simulations);

  return (
    <ReportsPanel
      products={catalog.products.map((product) => ({ id: product.id, name: product.name }))}
      supplies={supplies.map((supply) => ({
        id: supply.id,
        name: supply.name,
        kind: supply.kind,
        currentUnitCostCents: supply.currentUnitCostCents,
      }))}
      simulations={simulations}
    />
  );
}