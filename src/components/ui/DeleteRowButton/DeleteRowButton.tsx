"use client";

import { useActionState, type FormEvent } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import {
  EMPTY_SETTINGS_STATE,
  type SettingsFormState,
} from "@/features/settings/formState";
import styles from "./DeleteRowButton.module.css";

type DeleteRowButtonProps = {
  /** Server Action que exclui o registro e devolve o estado do formulário. */
  action: (previousState: SettingsFormState, formData: FormData) => Promise<SettingsFormState>;
  /** Identificador do registro na linha. */
  id: string;
  /** Nome exibido do registro, usado na confirmação. */
  label: string;
  /** Tipo do registro em pt-BR (ex.: "taxa", "canal"). */
  entityName: string;
  /** Campos ocultos extras (ex.: channelId, methodId). */
  extraFields?: Record<string, string>;
  /** Texto do botão. Padrão: "Excluir". */
  children?: string;
};

/**
 * Botão de exclusão física com confirmação e retorno de erro na própria linha.
 * Usa Server Action de exclusão e atualiza a lista via `revalidatePath`.
 *
 * @param action ação de exclusão no servidor
 * @param id identificador do registro
 * @param label nome do registro para a mensagem de confirmação
 * @param entityName tipo do registro em pt-BR
 * @param extraFields campos ocultos adicionais enviados na ação
 * @param children rótulo do botão
 * @returns formulário de exclusão com alerta de erro quando houver
 */
export function DeleteRowButton({
  action,
  id,
  label,
  entityName,
  extraFields,
  children = "Excluir",
}: DeleteRowButtonProps) {
  const [state, formAction] = useActionState(action, EMPTY_SETTINGS_STATE);

  /**
   * Pede confirmação antes de enviar a exclusão ao servidor.
   *
   * @param event evento de envio do formulário
   */
  function handleConfirm(event: FormEvent<HTMLFormElement>) {
    const confirmed = window.confirm(
      `Excluir ${entityName} "${label}" permanentemente? Esta ação não pode ser desfeita.`,
    );

    if (!confirmed) {
      event.preventDefault();
    }
  }

  return (
    <span className={styles.wrapper}>
      <form action={formAction} onSubmit={handleConfirm} className={styles.form}>
        <input type="hidden" name="id" value={id} />

        {extraFields
          ? Object.entries(extraFields).map(([name, value]) => (
              <input key={name} type="hidden" name={name} value={value} />
            ))
          : null}

        <PendingButton pendingMessage="Excluindo..." variant="danger" size="sm">
          {children}
        </PendingButton>
      </form>

      {state.status === "error" && state.message ? (
        <Alert tone="error">{state.message}</Alert>
      ) : null}
    </span>
  );
}
