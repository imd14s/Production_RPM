import type { Metadata } from "next";
import { ChannelsPanel } from "@/features/channels/ChannelsPanel";
import { listChannelsWithFees } from "@/services/supabase/channels";

export const metadata: Metadata = {
  title: "Configurações — Canais — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de canais de venda.
 *
 * @returns lista de canais e formulário de cadastro
 */
export default async function ChannelsSettingsPage() {
  const items = await listChannelsWithFees();

  return <ChannelsPanel items={items} />;
}
