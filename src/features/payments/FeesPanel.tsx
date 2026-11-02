"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { togglePaymentFeeAction } from "@/app/actions/payments";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { FeeForm } from "@/features/payments/FeeForm";
import { type PaymentFee, type PaymentMethod, TAX_KIND_LABELS } from "@/features/payments/types";
import { formatCents } from "@/lib/money";
import { formatPercentLabel } from "@/lib/percent";
import styles from "./FeesPanel.module.css";

type FeesPanelProps = {
  method: PaymentMethod;
  fees: PaymentFee[];
};

/**
 * Painel de taxas de um meio de pagamento.
 *
 * @param method meio de pagamento dono das taxas
 * @param fees taxas ativas e inativas do meio
 * @returns tabela de taxas e formulário
 */
export function FeesPanel({ method, fees }: FeesPanelProps) {
  const router = useRouter();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação e atualiza os dados.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
    router.refresh();
  }, [router]);

  /**
   * Atualiza as taxas depois de ativar ou desativar uma delas.
   *
   * @param formData identificador da taxa, meio e estado desejado
   * @returns conclusão da ação e da atualização da tela
   */
  const handleToggle = useCallback(
    async (formData: FormData) => {
      await togglePaymentFeeAction(formData);
      router.refresh();
    },
    [router],
  );

  const editing = fees.find((fee) => fee.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label={`Taxas do meio ${method.name}`}>
        {fees.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma taxa cadastrada para este meio de pagamento. Sem taxa, o preço calculado
            com ele será igual ao custo completo mais a margem.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Taxas de {method.name}</caption>
              <thead>
                <tr>
                  <th scope="col">Taxa</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Parcelas</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {fees.map((fee) => (
                  <tr key={fee.id} className={fee.isActive ? "" : styles.inactive}>
                    <td data-label="Taxa">{fee.label}</td>
                    <td data-label="Tipo">{TAX_KIND_LABELS[fee.kind]}</td>
                    <td data-label="Valor">
                      {fee.kind === "percentual"
                        ? formatPercentLabel(fee.rate ?? "0")
                        : formatCents(fee.amountCents ?? 0)}
                    </td>
                    <td data-label="Parcelas">{fee.installments ?? "Qualquer"}</td>
                    <td data-label="Situação">
                      {fee.isActive ? (
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
                          onClick={() => setEditingId(fee.id)}
                        >
                          Editar
                        </Button>

                        <form action={handleToggle}>
                          <input type="hidden" name="id" value={fee.id} />
                          <input type="hidden" name="methodId" value={method.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!fee.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              fee.isActive ? "Desativando taxa..." : "Ativando taxa..."
                            }
                          >
                            {fee.isActive ? "Desativar" : "Ativar"}
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

      <section className={styles.editor} aria-label="Formulário de taxa">
        <FeeForm
          key={editing ? editing.id : `novo-${formVersion}`}
          methodId={method.id}
          fee={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
