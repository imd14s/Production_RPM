import type { Metadata } from "next";
import { SuppliesPanel } from "@/features/supplies/SuppliesPanel";
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

  return <SuppliesPanel items={items} />;
}
