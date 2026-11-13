import type { Metadata } from "next";
import { LaborPanel } from "@/features/costs/LaborPanel";
import { listLaborCosts } from "@/services/supabase/costs";

export const metadata: Metadata = {
  title: "Configurações — Mão de obra — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de custos de mão de obra.
 *
 * @returns lista de custos e formulário de cadastro
 */
export default async function LaborSettingsPage() {
  const items = await listLaborCosts();

  return <LaborPanel items={items} />;
}
