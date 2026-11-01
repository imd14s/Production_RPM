import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChannelFeesPanel } from "@/features/channels/ChannelFeesPanel";
import { getChannelWithFees } from "@/services/supabase/channels";
import styles from "./channel.module.css";

export const metadata: Metadata = {
  title: "Configurações — Taxas do canal — Ateliê Filhos de Aruanda",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A rota depende da sessão e do identificador: sem shell estático.
export const instant = false;

type ChannelDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Tela de taxas de um canal de venda.
 *
 * @param params identificador do canal na rota
 * @returns painel de taxas do canal
 */
export default async function ChannelDetailPage({ params }: ChannelDetailPageProps) {
  const { id } = await params;

  // Identificador inválido não deve chegar ao banco como consulta.
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const data = await getChannelWithFees(id);

  if (!data) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/configuracoes/canais" className={styles.back}>
        ← Voltar aos canais
      </Link>

      <ChannelFeesPanel channel={data.channel} fees={data.fees} />
    </div>
  );
}
