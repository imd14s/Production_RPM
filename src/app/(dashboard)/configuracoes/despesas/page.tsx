import type { Metadata } from "next";
import { ExpensesPanel } from "@/features/costs/ExpensesPanel";
import { listOperatingExpenses } from "@/services/supabase/costs";

export const metadata: Metadata = {
  title: "Configurações — Despesas fixas — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de despesas fixas mensais.
 *
 * @returns lista de despesas e formulário de cadastro
 */
export default async function ExpenseSettingsPage() {
  const items = await listOperatingExpenses();

  return <ExpensesPanel items={items} />;
}
