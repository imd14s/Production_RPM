"use client";

import type { PricingSimulation } from "@/features/pricing/types";
import styles from "./ReportsPanel.module.css";

type ReportsPanelProps = {
  products: Array<{ id: string; name: string }>;
  supplies: Array<{ id: string; name: string; kind: string; currentUnitCostCents: number | null }>;
  simulations: PricingSimulation[];
};

/**
 * Painel de relatórios: indicadores de rentabilidade, custos por categoria
 * e comparação de canais.
 *
 * @param products produtos cadastrados
 * @param supplies insumos com custo atual
 * @param simulations simulações de precificação
 * @returns indicadores
 */
export function ReportsPanel({ products, supplies, simulations }: ReportsPanelProps) {
  const totalSimulations = simulations.length;
  const averagePrice =
    simulations.length > 0
      ? simulations.reduce((sum, simulation) => sum + simulation.priceCents, 0) / simulations.length
      : 0;

  const costsByKind = supplies.reduce<Record<string, number>>((accumulator, supply) => {
    const kind = supply.kind;
    const cost = supply.currentUnitCostCents ?? 0;
    accumulator[kind] = (accumulator[kind] ?? 0) + cost;
    return accumulator;
  }, {});

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Relatórios</h1>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Indicadores gerais</h2>
        <ul className={styles.list}>
          <li>Produtos cadastrados: {products.length}</li>
          <li>Insumos cadastrados: {supplies.length}</li>
          <li>Simulações de preço: {totalSimulations}</li>
          <li>Preço médio simulado: R$ {(averagePrice / 100).toFixed(2).replace(".", ",")}</li>
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Custos por categoria de insumo</h2>
        <ul className={styles.list}>
          {Object.entries(costsByKind).map(([kind, total]) => (
            <li key={kind}>
              {kind}: R$ {(total / 100).toFixed(2).replace(".", ",")}
            </li>
          ))}
        </ul>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Últimas simulações</h2>
        {simulations.length === 0 ? (
          <p className={styles.empty}>Nenhuma simulação registrada.</p>
        ) : (
          <ul className={styles.list}>
            {simulations.slice(0, 10).map((simulation) => (
              <li key={simulation.id}>
                Produto {simulation.productId} · {simulation.modality} · R${" "}
                {(simulation.priceCents / 100).toFixed(2).replace(".", ",")}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}