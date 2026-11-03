"use client";

import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import type { MatrixRow } from "@/services/calculations/pricingMatrix";
import styles from "./PricingMatrix.module.css";

type PricingMatrixProps = {
  rows: MatrixRow[];
  impactedProductIds: string[];
};

/** Chave estável para a linha de atacado direto, que não tem canal associado. */
const WHOLESALE_ROW_KEY = "atacado-direto";

function formatMoney(cents: number | null): string {
  if (cents === null) {
    return "—";
  }

  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

/**
 * Tabela informativa de preços sugeridos por produto e plataforma.
 *
 * @param rows linhas da matriz
 * @param impactedProductIds produtos com custo alterado desde o último snapshot
 * @returns tabela de precificação
 */
export function PricingMatrix({ rows, impactedProductIds }: PricingMatrixProps) {
  if (rows.length === 0) {
    return (
      <Card title="Matriz de preços por plataforma">
        <p className={styles.empty}>Nenhum produto cadastrado.</p>
      </Card>
    );
  }

  return (
    <Card title="Matriz de preços por plataforma">
      <p className={styles.hint}>
        Valores sugeridos com base no custo atual de fabricação. As plataformas
        vendem no varejo; o atacado é venda direta ao comerciante, com
        recebimento combinado com o comprador (ex.: Pix ou crediário). Em
        simulação, o meio de pagamento pode alterar o preço final.
      </p>

      {rows.map((row) => (
        <section key={row.productId} className={styles.product}>
          <header className={styles.productHeader}>
            <h3 className={styles.productName}>{row.productName}</h3>
            <span className={styles.cost}>
              Custo de fabricação: {formatMoney(row.costCents)}
            </span>
            {impactedProductIds.includes(row.productId) ? (
              <Badge tone="warning">Revisar preço</Badge>
            ) : null}
            {row.missing.length > 0 ? (
              <Badge tone="warning">Custo incompleto</Badge>
            ) : null}
          </header>

          <table className={styles.table}>
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Margem</th>
                <th>Preço sugerido</th>
              </tr>
            </thead>
            <tbody>
              {row.cells.map((cell, index) => (
                <tr
                  key={`${index}-${cell.channelId ?? WHOLESALE_ROW_KEY}`}
                  className={
                    cell.modality === "atacado" ? styles.wholesaleRow : undefined
                  }
                >
                  <td>{cell.channelName}</td>
                  <td>{(cell.marginPercent * 100).toFixed(1).replace(".", ",")} %</td>
                  <td>
                    {cell.priceCents !== null
                      ? formatMoney(cell.priceCents)
                      : cell.reason ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </Card>
  );
}
