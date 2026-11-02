"use client";

import { useCallback, useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { UnitConversionForm } from "@/features/supplies/UnitConversionForm";
import { toggleUnitConversionAction } from "@/app/actions/supplies";
import type { Supply } from "@/features/supplies/types";
import type { SupplyUnitConversion } from "@/features/supplies/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import styles from "./UnitConversionsPanel.module.css";

type UnitConversionsPanelProps = {
  supply: Supply;
  conversions: SupplyUnitConversion[];
};

/**
 * Painel de conversões de unidade de um insumo.
 *
 * @param supply insumo dono das conversões
 * @param conversions conversões cadastradas
 * @returns tabela de conversões e formulário
 */
export function UnitConversionsPanel({
  supply,
  conversions,
}: UnitConversionsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = conversions.find((item) => item.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label={`Conversões do insumo ${supply.name}`}>
        {conversions.length === 0 ? (
          <p className={styles.empty}>
            Nenhuma conversão cadastrada. Sem conversão, quantidades em outras
            unidades não são convertidas automaticamente.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>
                Conversões de {supply.name}
              </caption>
              <thead>
                <tr>
                  <th scope="col">De</th>
                  <th scope="col">Para</th>
                  <th scope="col">Fator</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {conversions.map((conversion) => (
                  <tr key={conversion.id} className={conversion.isActive ? "" : styles.inactive}>
                    <td data-label="De">
                      {SUPPLY_UNIT_LABELS[conversion.fromUnit]}
                    </td>
                    <td data-label="Para">
                      {SUPPLY_UNIT_LABELS[conversion.toUnit]}
                    </td>
                    <td data-label="Fator">{String(conversion.factor).replace(".", ",")}</td>
                    <td data-label="Situação">
                      {conversion.isActive ? (
                        <Badge tone="success">Ativa</Badge>
                      ) : (
                        <Badge tone="neutral">Inativa</Badge>
                      )}
                    </td>
                    <td data-label="Ações">
                      <div className={styles.actions}>
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          onClick={() => setEditingId(conversion.id)}
                        >
                          Editar
                        </Button>

                        <form action={toggleUnitConversionAction}>
                          <input type="hidden" name="id" value={conversion.id} />
                          <input type="hidden" name="supplyId" value={supply.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!conversion.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              conversion.isActive
                                ? "Desativando conversão..."
                                : "Ativando conversão..."
                            }
                          >
                            {conversion.isActive ? "Desativar" : "Ativar"}
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

      <section className={styles.editor} aria-label="Formulário de conversão">
        <UnitConversionForm
          key={editing ? editing.id : `nova-${formVersion}`}
          supplyId={supply.id}
          conversion={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}