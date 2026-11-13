"use client";

import { Modal } from "@/components/ui/Modal/Modal";
import { formatCents } from "@/lib/money";
import { formatPercentLabel } from "@/lib/percent";
import type { SupplyUnit } from "@/features/supplies/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import type {
  ProductCostDetail,
  ProductCostDetailLine,
} from "@/services/calculations/productCostDetail";
import type {
  MatrixChannel,
  MatrixRow,
  MatrixTax,
} from "@/services/calculations/pricingMatrix";
import { ChannelMarginEditor } from "./ChannelMarginEditor";
import styles from "./ProductCostModal.module.css";

type ProductCostModalProps = {
  /** Detalhamento do custo do produto. */
  detail: ProductCostDetail;
  /** Linha da matriz com os preços sugeridos do produto. */
  row: MatrixRow;
  /** Canais de venda com suas taxas. */
  channels: MatrixChannel[];
  /** Impostos ativos aplicados nos preços. */
  taxes: MatrixTax[];
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
 * Popup com o detalhamento do produto: o valor de cada insumo já dividido pelo
 * que foi usado, os demais custos de fabricação e a sugestão de preço de cada
 * canal, com a margem de lucro editável.
 *
 * @param props detalhamento do custo, linha da matriz, canais e impostos
 * @returns diálogo com o detalhamento
 */
export function ProductCostModal({
  detail,
  row,
  channels,
  taxes,
  onClose,
}: ProductCostModalProps) {
  const componentLines = detail.lines.filter(
    (line) => line.kind === "insumo" || line.kind === "subproduto",
  );
  const otherLines = detail.lines.filter(
    (line) => line.kind !== "insumo" && line.kind !== "subproduto",
  );
  const retailCells = row.cells.filter((cell) => cell.modality === "varejo");
  const wholesaleCell = row.cells.find((cell) => cell.modality === "atacado");

  return (
    <Modal title={`Custo e preço — ${detail.productName}`} onClose={onClose}>
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
                  {line.costCents === null
                    ? "sem custo"
                    : formatCents(line.costCents)}
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

      <h3 className={styles.sectionTitle}>Sugestão de preço por canal</h3>
      <p className={styles.hint}>
        Altere a margem de lucro de cada canal. O preço sugerido é recalculado
        enquanto você digita e passa a valer para a tabela da home depois de
        salvar.
      </p>

      {retailCells.length === 0 ? (
        <p className={styles.empty}>Nenhum canal de venda cadastrado.</p>
      ) : null}

      {retailCells.map((cell) => {
        const channel = channels.find((item) => item.id === cell.channelId);

        if (!channel) {
          return null;
        }

        return (
          <div key={cell.channelId} className={styles.channelBlock}>
            <h4 className={styles.channelName}>{cell.channelName}</h4>
            <ChannelMarginEditor
              productId={row.productId}
              channel={channel}
              taxes={taxes}
              costCents={row.costCents}
              marginPercent={cell.marginPercent}
              priceCents={cell.priceCents}
              reason={cell.reason}
            />
          </div>
        );
      })}

      {wholesaleCell ? (
        <div className={styles.channelBlock}>
          <h4 className={styles.channelName}>{wholesaleCell.channelName}</h4>
          <div className={styles.wholesaleRow}>
            <span>
              Margem {formatPercentLabel(wholesaleCell.marginPercent * 100)} (das
              configurações da empresa)
            </span>
            <span className={styles.wholesalePrice}>
              {wholesaleCell.priceCents === null
                ? (wholesaleCell.reason ?? "—")
                : formatCents(wholesaleCell.priceCents)}
            </span>
          </div>
        </div>
      ) : null}
    </Modal>
  );
}
