import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AcquisitionsPanel } from "@/features/supplies/AcquisitionsPanel";
import { listSuppliers } from "@/services/supabase/suppliers";
import { getSupplyWithPrices } from "@/services/supabase/supplies";
import styles from "./supply.module.css";

export const metadata: Metadata = {
  title: "Insumo — Ateliê Filhos de Aruanda",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A rota depende da sessão e do identificador: sem shell estático.
export const instant = false;

type SupplyDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Tela de compras de um insumo.
 *
 * @param params identificador do insumo na rota
 * @returns painel de aquisições do insumo
 */
export default async function SupplyDetailPage({ params }: SupplyDetailPageProps) {
  const { id } = await params;

  // Identificador inválido não deve chegar ao banco como consulta.
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const data = await getSupplyWithPrices(id);

  if (!data) {
    notFound();
  }

  const suppliers = await listSuppliers();

  return (
    <div className={styles.page}>
      <Link href="/insumos" className={styles.back}>
        ← Voltar aos insumos
      </Link>

      <AcquisitionsPanel supply={data.supply} prices={data.prices} suppliers={suppliers} />
    </div>
  );
}
