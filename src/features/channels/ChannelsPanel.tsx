"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { toggleChannelAction } from "@/app/actions/channels";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { ChannelForm } from "@/features/channels/ChannelForm";
import { CHANNEL_KIND_LABELS, type ChannelWithFees } from "@/features/channels/types";
import styles from "./ChannelsPanel.module.css";

type ChannelsPanelProps = {
  items: ChannelWithFees[];
};

/**
 * Painel de canais de venda: formulário de cadastro/edição e lista com taxas.
 *
 * @param items canais com as taxas agrupadas
 * @returns painel com tabela e formulário
 */
export function ChannelsPanel({ items }: ChannelsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Volta o formulário para o modo de criação.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editing = items.find((item) => item.channel.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Canais cadastrados">
        {items.length === 0 ? (
          <p className={styles.empty}>
            Nenhum canal cadastrado ainda. Use o formulário ao lado para o primeiro.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Canais de venda</caption>
              <thead>
                <tr>
                  <th scope="col">Canal</th>
                  <th scope="col">Tipo</th>
                  <th scope="col">Taxas ativas</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {items.map(({ channel, fees }) => {
                  const activeFees = fees.filter((fee) => fee.isActive).length;

                  return (
                    <tr key={channel.id} className={channel.isActive ? "" : styles.inactive}>
                      <td data-label="Canal">{channel.name}</td>
                      <td data-label="Tipo">{CHANNEL_KIND_LABELS[channel.kind]}</td>
                      <td data-label="Taxas ativas">
                        <Link
                          href={`/configuracoes/canais/${channel.id}`}
                          className={styles.feesLink}
                        >
                          Gerenciar taxas ({activeFees})
                        </Link>
                      </td>
                      <td data-label="Situação">
                        {channel.isActive ? (
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
                            onClick={() => setEditingId(channel.id)}
                          >
                            Editar
                          </Button>

                          <form action={toggleChannelAction}>
                            <input type="hidden" name="id" value={channel.id} />
                            <input
                              type="hidden"
                              name="isActive"
                              value={String(!channel.isActive)}
                            />
                            <PendingButton
                              pendingMessage={
                                channel.isActive
                                  ? "Desativando canal..."
                                  : "Ativando canal..."
                              }
                            >
                              {channel.isActive ? "Desativar" : "Ativar"}
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

      <section className={styles.editor} aria-label="Formulário de canal">
        <ChannelForm
          key={editing ? editing.channel.id : `novo-${formVersion}`}
          channel={editing?.channel ?? null}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}
