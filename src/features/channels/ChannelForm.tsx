"use client";

import { useActionState, useEffect } from "react";
import { saveChannelAction } from "@/app/actions/channels";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import {
  CHANNEL_KINDS,
  CHANNEL_KIND_LABELS,
  type Channel,
} from "@/features/channels/types";
import styles from "./ChannelForm.module.css";

type ChannelFormProps = {
  channel: Channel | null;
  onCancel: () => void;
  onSaved: () => void;
};

const KIND_OPTIONS = CHANNEL_KINDS.map((value) => ({
  value,
  label: CHANNEL_KIND_LABELS[value],
}));

/**
 * Formulário de criação e edição de um canal de venda.
 *
 * @param channel canal em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function ChannelForm({ channel, onCancel, onSaved }: ChannelFormProps) {
  const [state, formAction, isPending] = useActionState(saveChannelAction, EMPTY_SETTINGS_STATE);
  const isEditing = channel !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>{isEditing ? "Editar canal" : "Novo canal"}</h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <p className={styles.tip}>
        A comissão e o frete do canal são definidos depois, em «Gerenciar taxas»,
        na lista acima.
      </p>

      {isEditing ? <input type="hidden" name="id" value={channel.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={channel?.name}
        error={state.errors.name}
        placeholder="Mercado Livre, Site próprio, Loja de rua..."
        maxLength={80}
        required
      />

      <SelectField
        label="Tipo"
        name="kind"
        options={KIND_OPTIONS}
        defaultValue={channel?.kind ?? "outro"}
        error={state.errors.kind}
        required
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={channel?.notes}
        error={state.errors.notes}
        maxLength={500}
      />

      <div className={styles.actions}>
        {isEditing ? (
          <Button type="button" variant="secondary" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}

        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : isEditing ? "Salvar canal" : "Cadastrar canal"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando canal..." /> : null}
    </form>
  );
}
