"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { AcquisitionForm } from "@/features/supplies/AcquisitionForm";
import type { Supplier } from "@/features/suppliers/types";
import type { Supply, SupplyPrice } from "@/features/supplies/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import { formatAcquisitionQuantity } from "@/features/supplies/format";
import { formatCents } from "@/lib/money";
import styles from "./AcquisitionsPanel.module.css";

type AcquisitionsPanelProps = {
  supply: Supply;
  prices: SupplyPrice[];
  suppliers: Supplier[];
};

/**
 * Painel de compras de um insumo: histórico completo e formulário.
 * A compra mais recente define o custo por unidade usado na precificação.
 *
 * @param supply insumo dono das compras
 * @param prices aquisições do insumo, mais recentes primeiro
 * @param suppliers fornecedores disponíveis para a lista de escolha
 * @returns tabela de aquisições e formulário
 */
export function AcquisitionsPanel({ supply, prices, suppliers }: AcquisitionsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = prices.find((price) => price.id === editingId) ?? null;
  const latest = prices[0] ?? null;
  const latestUnitLabel = latest
    ? SUPPLY_UNIT_LABELS[latest.purchaseUnit].toLowerCase()
    : SUPPLY_UNIT_LABELS[supply.unit].toLowerCase();

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label={`Compras do insumo ${supply.name}`}>
        {prices.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma compra registrada. Sem compra, o insumo não tem custo por unidade e o
            produto que o usa não pode ser precificado.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>
                Compras de {supply.name} · custo da última compra por {latestUnitLabel}{" "}
                {formatCents(latest?.unitCostCents ?? 0)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Data</th>
                  <th scope="col">Fornecedor</th>
                  <th scope="col">Quantidade comprada</th>
                  <th scope="col">Valor da compra</th>
                  <th scope="col">Frete</th>
                  <th scope="col">Custo por unidade comprada</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {prices.map((price, index) => (
                  <tr key={price.id} className={index === 0 ? "" : styles.older}>
                    <td data-label="Data">
                      {index === 0 ? <Badge tone="success">Atual</Badge> : price.acquiredOn}
                    </td>
                    <td data-label="Fornecedor">
                      {price.supplierId
                        ? (suppliers.find((supplier) => supplier.id === price.supplierId)?.name ??
                          "Fornecedor removido")
                        : "Compra avulsa"}
                    </td>
                    <td data-label="Quantidade comprada">
                      {formatAcquisitionQuantity(price.quantity, price.purchaseUnit)}
                    </td>
                    <td data-label="Valor da compra">{formatCents(price.amountCents)}</td>
                    <td data-label="Frete">
                      {price.freightCents > 0 ? formatCents(price.freightCents) : "—"}
                    </td>
                    <td data-label="Custo por unidade comprada">
                      {formatCents(price.unitCostCents)} /{" "}
                      {SUPPLY_UNIT_LABELS[price.purchaseUnit].toLowerCase()}
                    </td>
                    <td data-label="Ações">
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        onClick={() => setEditingId(price.id)}
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.editor} aria-label="Formulário de compra">
        <AcquisitionForm
          key={editing ? editing.id : `nova-${formVersion}`}
          supplyId={supply.id}
          baseUnit={supply.unit}
          price={editing}
          suppliers={suppliers}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
