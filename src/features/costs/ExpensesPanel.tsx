"use client";

import { useCallback, useState } from "react";
import { toggleOperatingExpenseAction } from "@/app/actions/costs";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { ExpenseForm } from "@/features/costs/ExpenseForm";
import type { OperatingExpense } from "@/features/costs/types";
import { formatCents } from "@/lib/money";
import styles from "./ExpensesPanel.module.css";

type ExpensesPanelProps = {
  items: OperatingExpense[];
};

/**
 * Painel de despesas fixas: formulário de cadastro/edição e lista.
 *
 * @param items despesas fixas da empresa
 * @returns painel com tabela e formulário
 */
export function ExpensesPanel({ items }: ExpensesPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = items.find((item) => item.id === editingId) ?? null;
  const activeTotal = items
    .filter((item) => item.isActive)
    .reduce((total, item) => total + item.amountCents, 0);

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Despesas fixas cadastradas">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma despesa fixa cadastrada ainda. Use o formulário ao lado para a primeira —
            sem elas, o preço não cobre o custo de manter o ateliê.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>
                Despesas fixas · total mensal ativo {formatCents(activeTotal)}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Despesa</th>
                  <th scope="col">Valor mensal</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.isActive ? "" : styles.inactive}>
                    <td data-label="Despesa">{item.name}</td>
                    <td data-label="Valor mensal">{formatCents(item.amountCents)}</td>
                    <td data-label="Situação">
                      {item.isActive ? (
                        <Badge tone="success">Ativa</Badge>
                      ) : (
                        <Badge tone="neutral">Inativa</Badge>
                      )}
                    </td>
                    <td data-label="Ações">
                      <div className={styles.rowActions}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(item.id)}
                        >
                          Editar
                        </Button>

                        <form action={toggleOperatingExpenseAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!item.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              item.isActive
                                ? "Desativando despesa..."
                                : "Ativando despesa..."
                            }
                          >
                            {item.isActive ? "Desativar" : "Ativar"}
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

      <section className={styles.editor} aria-label="Formulário de despesa fixa">
        <ExpenseForm
          key={editing ? editing.id : `novo-${formVersion}`}
          expense={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
