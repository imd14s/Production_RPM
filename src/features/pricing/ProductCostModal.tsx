"use client";

import { Modal } from "@/components/ui/Modal/Modal";
import { formatCents } from "@/lib/money";
import type { SupplyUnit } from "@/features/supplies/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import type {
  ProductCostDetail,
  ProductCostDetailLine,
} from "@/services/calculations/productCostDetail";
import styles from "./ProductCostModal.module.css";

type ProductCostModalProps = {
  /** Detalhamento do custo do produto. */
  detail: ProductCostDetail;
  /** Executado quando o usuário fecha o popup. */
  onClose: () => void;
};

/**
 * Formata uma quantidade com até três casas decimais em pt-BR.
 *
 * @param quantity quantidade a formatar
 * @returns texto com vírgula decimal
 */
function formatQuantity(quantity: number): string {
  return new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 3 }).format(
    quantity,
  );
}

/**
 * Formata a unidade de exibição de uma linha.
 *
 * @param unit unidade da linha
 * @returns rótulo da unidade em pt-BR
 */
function formatUnit(unit: string): string {
  return SUPPLY_UNIT_LABELS[unit as SupplyUnit] ?? unit;
}

/**
 * Formata a quantidade de uma linha com sua unidade.
 *
 * @param line linha do detalhamento
 * @returns texto da quantidade ou travessão quando a linha não tem quantidade
 */
function formatLineQuantity(line: ProductCostDetailLine): string {
  if (line.quantity === null) {
    return "—";
  }

  return `${formatQuantity(line.quantity)} ${formatUnit(line.unit ?? "unidade")}`;
}

/**
 * Popup com o detalhamento do custo de um produto: o valor de cada insumo já
 * dividido pelo que foi usado, os demais custos de fabricação e o total.
 *
 * @param props detalhamento do custo e ação de fechamento
 * @returns diálogo com o detalhamento
 */
export function ProductCostModal({ detail, onClose }: ProductCostModalProps) {
  const componentLines = detail.lines.filter(
    (line) => line.kind === "insumo" || line.kind === "subproduto",
  );
  const otherLines = detail.lines.filter(
    (line) => line.kind !== "insumo" && line.kind !== "subproduto",
  );

  return (
    <Modal title={`Custo do produto — ${detail.productName}`} onClose={onClose}>
      <p className={styles.hint}>
        Valores por 1 unidade do produto. O custo de cada insumo já considera
        apenas a quantidade usada nesta peça.
      </p>

      {detail.missing.length > 0 ? (
        <p className={styles.warning}>
          Custo incompleto: {detail.missing.join(", ")} sem custo cadastrado.
        </p>
      ) : null}

      <h3 className={styles.sectionTitle}>Insumos e componentes</h3>

      {componentLines.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Quantidade usada</th>
              <th scope="col">Custo</th>
            </tr>
          </thead>
          <tbody>
            {componentLines.map((line) => (
              <tr key={line.key}>
                <td>{line.label}</td>
                <td>{formatLineQuantity(line)}</td>
                <td className={styles.cost}>
                  {line.costCents === null ? "sem custo" : formatCents(line.costCents)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className={styles.empty}>Este produto não usa insumos.</p>
      )}

      {otherLines.length > 0 ? (
        <>
          <h3 className={styles.sectionTitle}>Outros custos</h3>
          <table className={styles.table}>
            <thead>
              <tr>
                <th scope="col">Custo</th>
                <th scope="col">Base</th>
                <th scope="col">Valor</th>
              </tr>
            </thead>
            <tbody>
              {otherLines.map((line) => (
                <tr key={line.key}>
                  <td>{line.label}</td>
                  <td>{formatLineQuantity(line)}</td>
                  <td className={styles.cost}>
                    {line.costCents === null
                      ? "sem custo"
                      : formatCents(line.costCents)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      ) : null}

      <div className={styles.totalRow}>
        <span className={styles.totalLabel}>Custo de fabricação</span>
        <span className={styles.totalValue}>
          {detail.totalCents === null ? "—" : formatCents(detail.totalCents)}
        </span>
      </div>
    </Modal>
  );
}
