import type { Metadata } from "next";
import { PricingMatrix } from "@/features/pricing/PricingMatrix";
import { getSessionContext } from "@/lib/auth/session";
import { buildPricingMatrix } from "@/services/calculations/pricingMatrix";
import type {
  MatrixChannel,
  MatrixTax,
} from "@/services/calculations/pricingMatrix";
import type { ProductCostDetail } from "@/services/calculations/productCostDetail";
import { analyzePriceImpact } from "@/services/calculations/priceImpact";
import {
  getProductCostBreakdown,
  listChannelsWithFees,
  listCostSnapshotsByProduct,
  listPricingSimulationsByProduct,
} from "@/services/supabase/pricing";
import { getCompanySettings, listTaxSettings } from "@/services/supabase/settings";
import { listProductCatalog } from "@/services/supabase/products";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Início — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function HomePage() {
  const session = await getSessionContext();
  const role = session?.profile?.role ?? "operador";

  let matrixRows: ReturnType<typeof buildPricingMatrix> = [];
  let impactedProductIds: string[] = [];
  let matrixChannels: MatrixChannel[] = [];
  let matrixTaxes: MatrixTax[] = [];
  const details: Record<string, ProductCostDetail> = {};

  if (role === "administrador") {
    const [catalog, channels, taxes, company] = await Promise.all([
      listProductCatalog(),
      listChannelsWithFees(),
      listTaxSettings(),
      getCompanySettings(),
    ]);

    const activeProducts = catalog.products.filter(
      (product) => product.isActive,
    );

    const productsWithCostData = await Promise.all(
      activeProducts.map(async (product) => {
        const cost = await getProductCostBreakdown(product.id);
        return {
          product,
          cost,
        };
      }),
    );

    const productsWithCost = productsWithCostData.map(({ product, cost }) => ({
      id: product.id,
      name: product.name,
      costCents: cost.totalCents,
      missing: cost.missing,
    }));

    for (const { product, cost } of productsWithCostData) {
      details[product.id] = cost.detail;
    }

    const simulationsByProduct = await Promise.all(
      activeProducts.map(async (product) => ({
        productId: product.id,
        simulations: await listPricingSimulationsByProduct(product.id),
      })),
    );

    const simulations = simulationsByProduct.flatMap((entry) =>
      entry.simulations.map((simulation) => ({
        productId: simulation.productId,
        channelId: simulation.channelId,
        modality: simulation.modality,
        marginPercent: simulation.marginPercent,
        createdAt: simulation.createdAt,
      })),
    );

    matrixChannels = channels.map((channel) => ({
      id: channel.channel.id,
      name: channel.channel.name,
      fees: channel.fees.map((fee) => ({
        kind: fee.kind,
        rate: fee.rate,
        amountCents: fee.amountCents,
        isActive: fee.isActive,
      })),
    }));

    matrixTaxes = taxes.map((tax) => ({
      kind: tax.kind,
      rate: tax.rate,
      amountCents: tax.amountCents,
      isActive: tax.isActive,
    }));

    matrixRows = buildPricingMatrix({
      products: productsWithCost,
      channels: matrixChannels,
      taxes: matrixTaxes,
      simulations,
      defaultRetailMarginPercent: company?.defaultRetailMargin ?? null,
      defaultWholesaleMarginPercent: company?.defaultWholesaleMargin ?? null,
    });

    const impacted = await Promise.all(
      productsWithCostData.map(async ({ product, cost }) => {
        const snapshots = await listCostSnapshotsByProduct(product.id);
        const baseline = snapshots.length > 0 ? snapshots[0].costCents : null;
        const impact = analyzePriceImpact(cost.totalCents, baseline);
        return impact.impacted ? product.id : null;
      }),
    );

    impactedProductIds = impacted.filter((id): id is string => id !== null);
  }

  return (
    <div className={styles.page}>
      {role === "administrador" ? (
        <PricingMatrix
          rows={matrixRows}
          impactedProductIds={impactedProductIds}
          details={details}
          channels={matrixChannels}
          taxes={matrixTaxes}
        />
      ) : null}

      <p className={styles.footerNote}>
        Precisa de acesso a outro módulo? Fale com o administrador do sistema.
      </p>
    </div>
  );
}
