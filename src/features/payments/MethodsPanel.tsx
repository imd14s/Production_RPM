"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { togglePaymentMethodAction } from "@/app/actions/payments";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { MethodForm } from "@/features/payments/MethodForm";
import {
  type PaymentMethodWithFees,
  PAYMENT_METHOD_KIND_LABELS,
} from "@/features/payments/types";
import styles from "./MethodsPanel.module.css";

type MethodsPanelProps = {
  items: PaymentMethodWithFees[];
};

/**
 * Painel de meios de pagamento: formulário de cadastro/edição e lista com taxas.
 *
 * @param items meios de pagamento com as taxas agrupadas
 * @returns painel com tabela e formulário
 */
export function MethodsPanel({ items }: MethodsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = items.find((item) => item.method.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Meios de pagamento cadastrados">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhum meio de pagamento cadastrado ainda. Use o formulário ao lado para o
            primeiro — Pix, débito, crédito e afins.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Meios de pagamento</caption>
              <thead>
                <tr>
                  <th scope="col">Meio</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Taxas ativas</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ method, fees }) => {
                  const activeFees = fees.filter((fee) => fee.isActive).length;

                  return (
                    <tr key={method.id} className={method.isActive ? "" : styles.inactive}>
                      <td data-label="Meio">{method.name}</td>
                      <td data-label="Tipo">{PAYMENT_METHOD_KIND_LABELS[method.kind]}</td>
                      <td data-label="Taxas ativas">
                        <Link
                          href={`/configuracoes/pagamentos/${method.id}`}
                          className={styles.feesLink}
                        >
                          Gerenciar taxas ({activeFees})
                        </Link>
                      </td>
                      <td data-label="Situação">
                        {method.isActive ? (
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
                            onClick={() => setEditingId(method.id)}
                          >
                            Editar
                          </Button>

                          <form action={togglePaymentMethodAction}>
                            <input type="hidden" name="id" value={method.id} />
                            <input
                              type="hidden"
                              name="isActive"
                              value={String(!method.isActive)}
                            />
                            <PendingButton
                              pendingMessage={
                                method.isActive
                                  ? "Desativando meio de pagamento..."
                                  : "Ativando meio de pagamento..."
                              }
                            >
                              {method.isActive ? "Desativar" : "Ativar"}
                            </PendingButton>
                          </form>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.editor} aria-label="Formulário de meio de pagamento">
        <MethodForm
          key={editing ? editing.method.id : `novo-${formVersion}`}
          method={editing?.method ?? null}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
