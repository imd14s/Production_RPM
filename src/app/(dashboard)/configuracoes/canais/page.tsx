import type { Metadata } from "next";
import { ChannelsPanel } from "@/features/channels/ChannelsPanel";
import { listChannelsWithFees } from "@/services/supabase/channels";

export const metadata: Metadata = {
  title: "Configurações — Canais — Ateliê Filhos de Aruanda",
};

/**
 * Tela de canais de venda.
 *
 * @returns lista de canais e formulário de cadastro
 */
export default async function ChannelsSettingsPage() {
  const items = await listChannelsWithFees();

  return <ChannelsPanel items={items} />;
}
