import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { ProductsPanel } from "@/features/products/ProductsPanel";
import { getSessionContext } from "@/lib/auth/session";
import { listProductDeleteWarnings } from "@/services/supabase/deleteDependencies";
import { listProductCatalog } from "@/services/supabase/products";

export const metadata: Metadata = {
  title: "Produtos — Ateliê Filhos de Aruanda",
};

export const instant = false;

/**
 * Tela administrativa de produtos e fichas técnicas.
 *
 * @returns catálogo e formulário de produtos
 */
export default async function ProductsPage() {
  const session = await getSessionContext();

  if (session?.profile?.role !== "administrador") {
    redirect("/home");
  }

  const catalog = await listProductCatalog();
  const warnings = await listProductDeleteWarnings(
    catalog.products.map((product) => product.id),
  );

  return <ProductsPanel catalog={catalog} warnings={warnings} />;
}
