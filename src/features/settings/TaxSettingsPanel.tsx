"use client";

import { useCallback, useState } from "react";
import { toggleTaxAction } from "@/app/actions/settings";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { TaxForm } from "@/features/settings/TaxForm";
import { TAX_KIND_LABELS, type TaxSetting } from "@/features/settings/types";
import { formatCents } from "@/lib/money";
import { formatPercent } from "@/lib/percent";
import styles from "./TaxSettingsPanel.module.css";

type TaxSettingsPanelProps = {
  items: TaxSetting[];
};

/**
 * Painel de impostos: formulário de cadastro/edição e lista completa.
 *
 * @param items impostos ativos e inativos, ordenados por nome
 * @returns painel com tabela e formulário
 */
export function TaxSettingsPanel({ items }: TaxSettingsPanelProps) {
  const [editing, setEditing] = useState<TaxSetting | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditing(null);
    setFormVersion((version) => version + 1);
  }, []);

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Impostos cadastrados">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhum imposto cadastrado ainda. Use o formulário ao lado para o primeiro.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Impostos configuráveis</caption>
              <thead>
                <tr>
                  <th scope="col">Nome</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Valor</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((tax) => (
                  <tr key={tax.id} className={tax.isActive ? "" : styles.inactive}>
                    <td data-label="Nome">{tax.name}</td>
                    <td data-label="Tipo">{TAX_KIND_LABELS[tax.kind]}</td>
                    <td data-label="Valor">
                      {tax.kind === "percentual"
                        ? `${formatPercent(tax.rate ?? "0")} %`
                        : formatCents(tax.amountCents ?? 0)}
                    </td>
                    <td data-label="Situação">
                      {tax.isActive ? (
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
                          onClick={() => setEditing(tax)}
                        >
                          Editar
                        </Button>

                        <form action={toggleTaxAction}>
                          <input type="hidden" name="id" value={tax.id} />
                          <input type="hidden" name="isActive" value={String(!tax.isActive)} />
                          <Button type="submit" variant="ghost" size="sm">
                            {tax.isActive ? "Desativar" : "Ativar"}
                          </Button>
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

      <section className={styles.editor} aria-label="Formulário de imposto">
        <TaxForm
          key={editing ? editing.id : `novo-${formVersion}`}
          initial={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
