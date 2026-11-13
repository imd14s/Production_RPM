import type { Metadata } from "next";
import { SuppliersPanel } from "@/features/suppliers/SuppliersPanel";
import { listSuppliers } from "@/services/supabase/suppliers";

export const metadata: Metadata = {
  title: "Fornecedores — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de fornecedores.
 *
 * @returns lista de fornecedores e formulário de cadastro
 */
export default async function SuppliersPage() {
  const items = await listSuppliers();

  return <SuppliersPanel items={items} />;
}
