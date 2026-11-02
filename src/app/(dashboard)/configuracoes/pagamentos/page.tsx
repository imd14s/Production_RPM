import type { Metadata } from "next";
import { MethodsPanel } from "@/features/payments/MethodsPanel";
import { listPaymentMethodsWithFees } from "@/services/supabase/payments";

export const metadata: Metadata = {
  title: "Configurações — Pagamentos — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de meios de pagamento.
 *
 * @returns lista de meios e formulário de cadastro
 */
export default async function PaymentSettingsPage() {
  const items = await listPaymentMethodsWithFees();

  return <MethodsPanel items={items} />;
}
