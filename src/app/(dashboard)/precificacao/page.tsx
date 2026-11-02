import type { Metadata } from "next";
import { connection } from "next/server";
import { PricingPanel } from "@/features/pricing/PricingPanel";
import { listProductCatalog } from "@/services/supabase/products";
import { listChannelsWithFees } from "@/services/supabase/channels";
import { listPaymentMethodsWithFees } from "@/services/supabase/payments";

export const metadata: Metadata = {
  title: "Precificação — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function PricingPage() {
  await connection();
  const [catalog, channels, payments] = await Promise.all([
    listProductCatalog(),
    listChannelsWithFees(),
    listPaymentMethodsWithFees(),
  ]);

  const products = catalog.products.map((product) => ({
    id: product.id,
    name: product.name,
    kind: product.kind,
  }));

  return (
    <div>
      <PricingPanel products={products} channels={channels} payments={payments} />
    </div>
  );
}