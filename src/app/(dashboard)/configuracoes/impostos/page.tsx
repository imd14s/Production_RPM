import type { Metadata } from "next";
import { TaxSettingsPanel } from "@/features/settings/TaxSettingsPanel";
import { listTaxSettings } from "@/services/supabase/settings";

export const metadata: Metadata = {
  title: "Configurações — Impostos — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de impostos configuráveis.
 *
 * @returns lista de impostos e formulário de cadastro
 */
export default async function TaxSettingsPage() {
  const taxes = await listTaxSettings();

  return <TaxSettingsPanel items={taxes} />;
}
