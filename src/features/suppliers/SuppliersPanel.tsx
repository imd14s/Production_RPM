"use client";

import { useCallback, useState } from "react";
import { toggleSupplierAction } from "@/app/actions/suppliers";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { SupplierForm } from "@/features/suppliers/SupplierForm";
import type { Supplier } from "@/features/suppliers/types";
import { formatCpfOrCnpj, formatPhone } from "@/features/suppliers/format";
import styles from "./SuppliersPanel.module.css";

type SuppliersPanelProps = {
  items: Supplier[];
};

/**
 * Painel de fornecedores: formulário de cadastro/edição e lista.
 *
 * @param items fornecedores da empresa
 * @returns painel com tabela e formulário
 */
export function SuppliersPanel({ items }: SuppliersPanelProps) {
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

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Fornecedores cadastrados">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhum fornecedor cadastrado ainda. Use o formulário ao lado para o primeiro — as
            compras de insumo vão registrar quem forneceu.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Fornecedores</caption>
              <thead>
                <tr>
                  <th scope="col">Fornecedor</th>
                  <th scope="col">Documento</th>
                  <th scope="col">Telefone</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className={item.isActive ? "" : styles.inactive}>
                    <td data-label="Fornecedor">
                      {item.name}
                      {item.email ? (
                        <span className={styles.subText}>{item.email}</span>
                      ) : null}
                    </td>
                    <td data-label="Documento">
                      {item.document ? formatCpfOrCnpj(item.document) : "—"}
                    </td>
                    <td data-label="Telefone">
                      {item.phone ? formatPhone(item.phone) : "—"}
                    </td>
                    <td data-label="Situação">
                      {item.isActive ? (
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
                          onClick={() => setEditingId(item.id)}
                        >
                          Editar
                        </Button>

                        <form action={toggleSupplierAction}>
                          <input type="hidden" name="id" value={item.id} />
                          <input
                            type="hidden"
                            name="isActive"
                            value={String(!item.isActive)}
                          />
                          <PendingButton
                            pendingMessage={
                              item.isActive
                                ? "Desativando fornecedor..."
                                : "Ativando fornecedor..."
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

      <section className={styles.editor} aria-label="Formulário de fornecedor">
        <SupplierForm
          key={editing ? editing.id : `novo-${formVersion}`}
          supplier={editing}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
