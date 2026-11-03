import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { PricingMatrix } from "@/features/pricing/PricingMatrix";
import { getSessionContext } from "@/lib/auth/session";
import { formatLongDate, getFirstName, getGreeting, getHourInTimeZone } from "@/lib/date";
import { buildNavigation, countAvailableModules } from "@/lib/navigation";
import { buildPricingMatrix } from "@/services/calculations/pricingMatrix";
import { analyzePriceImpact } from "@/services/calculations/priceImpact";
import { listChannelsWithFees } from "@/services/supabase/pricing";
import { getCompanySettings, listTaxSettings } from "@/services/supabase/settings";
import { listProductCatalog } from "@/services/supabase/products";
import { getProductCostBreakdown, listCostSnapshotsByProduct, listPricingSimulationsByProduct } from "@/services/supabase/pricing";
import { describeRole } from "@/types/auth";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Início — Ateliê Filhos de Aruanda",
};

export const instant = false;

export default async function HomePage() {
  const session = await getSessionContext();
  const profile = session?.profile ?? null;
  const role = profile?.role ?? "operador";
  const now = new Date();
  const navigation = buildNavigation(role);
  const totalModules = navigation.available.length + navigation.planned.length;

  let matrixRows: ReturnType<typeof buildPricingMatrix> = [];
  let impactedProductIds: string[] = [];

  if (role === "administrador") {
    const [catalog, channels, taxes, company] = await Promise.all([
      listProductCatalog(),
      listChannelsWithFees(),
      listTaxSettings(),
      getCompanySettings(),
    ]);

    const productsWithCostData = await Promise.all(
      catalog.products.map(async (product) => {
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

    const simulationsByProduct = await Promise.all(
      catalog.products.map(async (product) => ({
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

    matrixRows = buildPricingMatrix({
      products: productsWithCost,
      channels: channels.map((channel) => ({
        id: channel.channel.id,
        name: channel.channel.name,
        fees: channel.fees.map((fee) => ({
          kind: fee.kind,
          rate: fee.rate,
          amountCents: fee.amountCents,
          isActive: fee.isActive,
        })),
      })),
      taxes: taxes.map((tax) => ({
        kind: tax.kind,
        rate: tax.rate,
        amountCents: tax.amountCents,
        isActive: tax.isActive,
      })),
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
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{formatLongDate(now)}</p>
        <h1 className={styles.title}>
          {getGreeting(getHourInTimeZone(now))}
          {profile ? `, ${getFirstName(profile.fullName)}` : ""}.
        </h1>
        <p className={styles.description}>
          Este é o painel do sistema interno de gestão e precificação do ateliê. Os módulos
          aparecem no menu conforme cada etapa é concluída.
        </p>
      </section>

      <div className={styles.grid}>
        <Card title="Seu acesso">
          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>Perfil</dt>
              <dd>
                {profile ? <Badge tone="success">{describeRole(profile.role)}</Badge> : "—"}
              </dd>
            </div>

            <div className={styles.detail}>
              <dt>E-mail</dt>
              <dd>{session?.email || "—"}</dd>
            </div>

            <div className={styles.detail}>
              <dt>Situação</dt>
              <dd>
                {profile?.isActive ? (
                  <Badge tone="success">Ativa</Badge>
                ) : (
                  <Badge tone="warning">Inativa</Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Módulos disponíveis">
          <p className={styles.counter}>
            <strong>{countAvailableModules(role)}</strong> de {totalModules} módulos já
            liberados nesta versão.
          </p>

          {navigation.planned.length > 0 ? (
            <>
              <p className={styles.nextTitle}>Em desenvolvimento</p>
              <ul className={styles.plannedList}>
                {navigation.planned.map((item) => (
                  <li key={item.href} className={styles.plannedItem}>
                    <span>{item.label}</span>
                    <Badge tone="neutral">em breve</Badge>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      </div>

      {role === "administrador" ? (
        <PricingMatrix rows={matrixRows} impactedProductIds={impactedProductIds} />
      ) : null}

      <p className={styles.footerNote}>
        Precisa de acesso a outro módulo? Fale com o administrador do sistema.
      </p>
    </div>
  );
}
