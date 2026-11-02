import type { Metadata } from "next";
import { connection } from "next/server";
import { ProductionPanel } from "@/features/production/ProductionPanel";
import { listProductCatalog } from "@/services/supabase/products";

export const metadata: Metadata = {
  title: "Produção — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function ProductionPage() {
  await connection();
  const catalog = await listProductCatalog();

  const products = catalog.products.map((product) => ({
    id: product.id,
    name: product.name,
  }));

  return <ProductionPanel products={products} />;
}