"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toggleLaborCostAction } from "@/app/actions/costs";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { LaborForm } from "@/features/costs/LaborForm";
import type { LaborCost } from "@/features/costs/types";
import { formatHours } from "@/lib/hours";
import { formatCents } from "@/lib/money";
import styles from "./LaborPanel.module.css";

type LaborPanelProps = {
  items: LaborCost[];
};

/**
 * Painel de mão de obra: formulário de cadastro/edição e lista.
 *
 * @param items custos de mão de obra da empresa
 * @returns painel com tabela e formulário
 */
export function LaborPanel({ items }: LaborPanelProps) {
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
   * Atualiza a lista depois de ativar ou desativar um custo de mão de obra.
   *
   * @param formData identificador e estado desejado do custo
   * @returns conclusão da ação e da atualização da tela
   */
  const handleToggle = useCallback(
    async (formData: FormData) => {
      await toggleLaborCostAction(formData);
      router.refresh();
    },
    [router],
  );

  const editing = items.find((item) => item.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Mão de obra cadastrada">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma mão de obra cadastrada ainda. Cadastre as pessoas do ateliê com o salário
            mensal e as horas de referência — o rateio nasce delas.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Mão de obra</caption>
              <thead>
                <tr>
                  <th scope="col">Pessoa ou função</th>
                  <th scope="col">Salário mensal</th>
                  <th scope="col">Horas mensais</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.isActive ? "" : styles.inactive}>
                    <td data-label="Pessoa ou função">{item.name}</td>
                    <td data-label="Salário mensal">{formatCents(item.monthlyWageCents)}</td>
                    <td data-label="Horas mensais">{formatHours(item.standardHoursMonth)}</td>
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

                        <form action={handleToggle}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!item.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              item.isActive ? "Desativando..." : "Ativando..."
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

      <section className={styles.editor} aria-label="Formulário de mão de obra">
        <LaborForm
          key={editing ? editing.id : `novo-${formVersion}`}
          labor={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
