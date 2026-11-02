"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toggleSupplyAction } from "@/app/actions/supplies";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { SupplyForm } from "@/features/supplies/SupplyForm";
import type { SupplyWithCost } from "@/features/supplies/types";
import { SUPPLY_KIND_LABELS } from "@/features/supplies/types";
import { formatCents } from "@/lib/money";
import styles from "./SuppliesPanel.module.css";

type SuppliesPanelProps = {
  items: SupplyWithCost[];
};

/**
 * Painel de insumos: formulário de cadastro/edição e lista com custo atual.
 *
 * @param items insumos com o custo mais recente por unidade
 * @returns painel com tabela e formulário
 */
export function SuppliesPanel({ items }: SuppliesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = items.find((item) => item.supply.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Insumos cadastrados">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhum insumo cadastrado ainda. Use o formulário ao lado para o primeiro — depois
            registre as compras na página dele para informar o custo por unidade.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Insumos</caption>
              <thead>
                <tr>
                  <th scope="col">Insumo</th>
                  <th scope="col">Categoria</th>
                  <th scope="col">Unidade</th>
                  <th scope="col">Custo por unidade</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ supply, currentUnitCostCents, lastAcquiredOn, acquisitionCount }) => (
                  <tr key={supply.id} className={supply.isActive ? "" : styles.inactive}>
                    <td data-label="Insumo">{supply.name}</td>
                    <td data-label="Categoria">{SUPPLY_KIND_LABELS[supply.kind]}</td>
                    <td data-label="Unidade">
                      <Link
                        href={`/insumos/${supply.id}`}
                        className={styles.pricesLink}
                      >
                        {lastAcquiredOn
                          ? `${acquisitionCount} compra${acquisitionCount === 1 ? "" : "s"}`
                          : "Sem compras"}
                      </Link>
                    </td>
                    <td data-label="Custo por unidade">
                      {currentUnitCostCents !== null ? (
                        formatCents(currentUnitCostCents)
                      ) : (
                        <span className={styles.missing}>Registre a 1ª compra</span>
                      )}
                    </td>
                    <td data-label="Situação">
                      {supply.isActive ? (
                        <Badge tone="success">Ativo</Badge>
                      ) : (
                        <Badge tone="neutral">Inativo</Badge>
                      )}
                    </td>
                    <td data-label="Ações">
                      <div className={styles.rowActions}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(supply.id)}
                        >
                          Editar
                        </Button>

                        <form action={toggleSupplyAction}>
                          <input type="hidden" name="id" value={supply.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!supply.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              supply.isActive
                                ? "Desativando insumo..."
                                : "Ativando insumo..."
                            }
                          >
                            {supply.isActive ? "Desativar" : "Ativar"}
                          </PendingButton>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.editor} aria-label="Formulário de insumo">
        <SupplyForm
          key={editing ? editing.supply.id : `novo-${formVersion}`}
          supply={editing?.supply ?? null}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
