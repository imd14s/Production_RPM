import type { Metadata } from "next";
import { SuppliesPanel } from "@/features/supplies/SuppliesPanel";
import { listSupplyDeleteWarnings } from "@/services/supabase/deleteDependencies";
import { listSuppliesWithCost } from "@/services/supabase/supplies";

export const metadata: Metadata = {
  title: "Insumos — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de insumos.
 *
 * @returns lista de insumos com custo atual e formulário de cadastro
 */
export default async function SuppliesPage() {
  const items = await listSuppliesWithCost();
  const warnings = await listSupplyDeleteWarnings(items.map((item) => item.id));

  return <SuppliesPanel items={items} warnings={warnings} />;
}
