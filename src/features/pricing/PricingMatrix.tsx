"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { formatCents } from "@/lib/money";
import { formatPercentLabel } from "@/lib/percent";
import type { MatrixPriceCell, MatrixRow } from "@/services/calculations/pricingMatrix";
import type { ProductCostDetail } from "@/services/calculations/productCostDetail";
import { ProductCostModal } from "./ProductCostModal";
import styles from "./PricingMatrix.module.css";

type PricingMatrixProps = {
  rows: MatrixRow[];
  impactedProductIds: string[];
  /** Detalhamento de custo de cada produto, indexado pelo identificador. */
  details: Record<string, ProductCostDetail>;
};

/**
 * Extrai as colunas de preço da primeira linha: uma por plataforma (varejo)
 * e a última de atacado direto. Todas as linhas compartilham a mesma ordem
 * de células, montada por `buildPricingMatrix`.
 *
 * @param rows linhas da matriz
 * @returns lista ordenada de células-cabeçalho
 */
function extractPriceColumns(rows: MatrixRow[]): MatrixPriceCell[] {
  return rows[0]?.cells ?? [];
}

/**
 * Formata o preço sugerido de uma célula da matriz.
 *
 * @param cell célula com preço ou motivo de indisponibilidade
 * @returns valor em reais ou o motivo exibido
 */
function formatCellPrice(cell: MatrixPriceCell): string {
  if (cell.priceCents !== null) {
    return formatCents(cell.priceCents);
  }

  return cell.reason ?? "—";
}

/**
 * Formata a margem da célula (fração 0..1) como percentual de exibição,
 * com no máximo 2 casas decimais e sem ruído de ponto flutuante.
 *
 * @param marginFraction margem em decimal (0.3 → 30%)
 * @returns rótulo pronto, ex.: "30 %" ou "33,33 %"
 */
function formatMarginLabel(marginFraction: number): string {
  const percentValue = Math.round(marginFraction * 10000) / 100;

  return formatPercentLabel(percentValue);
}

/**
 * Tabela informativa: cada linha é um produto; as colunas mostram o custo de
 * fabricação e o preço sugerido em cada plataforma (varejo) e no atacado direto.
 *
 * Clicar no nome do produto abre o detalhamento do custo, com o valor de cada
 * insumo já dividido pela quantidade usada nesta peça.
 *
 * @param rows linhas da matriz
 * @param impactedProductIds produtos com custo alterado desde o último snapshot
 * @param details detalhamento de custo por produto
 * @returns tabela de precificação
 */
export function PricingMatrix({
  rows,
  impactedProductIds,
  details,
}: PricingMatrixProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  );

  if (rows.length === 0) {
    return (
      <Card title="Preços por produto e plataforma">
        <p className={styles.empty}>Nenhum produto cadastrado.</p>
      </Card>
    );
  }

  const priceColumns = extractPriceColumns(rows);
  const selectedDetail =
    selectedProductId === null ? undefined : details[selectedProductId];

  return (
    <Card title="Preços por produto e plataforma">
      <p className={styles.hint}>
        Valores sugeridos com base no custo atual de fabricação. As plataformas
        vendem no varejo; o atacado é venda direta ao comerciante, com
        recebimento combinado com o comprador (ex.: Pix ou crediário). Em
        simulação, o meio de pagamento pode alterar o preço final.
      </p>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className={styles.caption}>
            Produtos ativos, custo de fabricação e preço sugerido por canal
          </caption>
          <thead>
            <tr>
              <th scope="col">Produto</th>
              <th scope="col">Custo de fabricação</th>
              {priceColumns.map((column) => (
                <th
                  key={`header-${column.channelId ?? "atacado"}`}
                  scope="col"
                  className={
                    column.modality === "atacado" ? styles.wholesaleColumn : undefined
                  }
                >
                  {column.channelName}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.productId}>
                <td data-label="Produto">
                  <button
                    type="button"
                    className={styles.productName}
                    onClick={() => setSelectedProductId(row.productId)}
                  >
                    {row.productName}
                  </button>
                  {impactedProductIds.includes(row.productId) ||
                  row.missing.length > 0 ? (
                    <span className={styles.badges}>
                      {impactedProductIds.includes(row.productId) ? (
                        <Badge tone="warning">Revisar preço</Badge>
                      ) : null}
                      {row.missing.length > 0 ? (
                        <Badge tone="warning">Custo incompleto</Badge>
                      ) : null}
                    </span>
                  ) : null}
                </td>
                <td data-label="Custo de fabricação">
                  {row.costCents !== null ? formatCents(row.costCents) : "—"}
                </td>
                {row.cells.map((cell, columnIndex) => (
                  <td
                    key={`${row.productId}-${columnIndex}-${cell.channelId ?? "atacado"}`}
                    data-label={cell.channelName}
                    className={
                      cell.modality === "atacado" ? styles.wholesaleColumn : undefined
                    }
                  >
                    <span className={styles.price}>{formatCellPrice(cell)}</span>
                    <span className={styles.margin}>
                      margem {formatMarginLabel(cell.marginPercent)}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedDetail ? (
        <ProductCostModal
          detail={selectedDetail}
          onClose={() => setSelectedProductId(null)}
        />
      ) : null}
    </Card>
  );
}
