import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FeesPanel } from "@/features/payments/FeesPanel";
import { getPaymentMethodWithFees } from "@/services/supabase/payments";
import styles from "./method.module.css";

export const metadata: Metadata = {
  title: "Configurações — Taxas do meio de pagamento — Ateliê Filhos de Aruanda",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A rota depende da sessão e do identificador: sem shell estático.
export const instant = false;

type MethodDetailPageProps = {
  params: Promise<{ id: string }>;
};

/**
 * Tela de taxas de um meio de pagamento.
 *
 * @param params identificador do meio na rota
 * @returns painel de taxas do meio
 */
export default async function PaymentMethodDetailPage({ params }: MethodDetailPageProps) {
  const { id } = await params;

  // Identificador inválido não deve chegar ao banco como consulta.
  if (!UUID_PATTERN.test(id)) {
    notFound();
  }

  const data = await getPaymentMethodWithFees(id);

  if (!data) {
    notFound();
  }

  return (
    <div className={styles.page}>
      <Link href="/configuracoes/pagamentos" className={styles.back}>
        ← Voltar aos meios de pagamento
      </Link>

      <FeesPanel method={data.method} fees={data.fees} />
    </div>
  );
}
