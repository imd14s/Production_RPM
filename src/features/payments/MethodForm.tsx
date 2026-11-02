"use client";

import { useActionState, useEffect } from "react";
import { savePaymentMethodAction } from "@/app/actions/payments";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import {
  type PaymentMethod,
  PAYMENT_METHOD_KINDS,
  PAYMENT_METHOD_KIND_LABELS,
} from "@/features/payments/types";
import styles from "./MethodForm.module.css";

type MethodFormProps = {
  method: PaymentMethod | null;
  onCancel: () => void;
  onSaved: () => void;
};

const KIND_OPTIONS = PAYMENT_METHOD_KINDS.map((value) => ({
  value,
  label: PAYMENT_METHOD_KIND_LABELS[value],
}));

/**
 * Formulário de criação e edição de um meio de pagamento.
 *
 * @param method meio em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function MethodForm({ method, onCancel, onSaved }: MethodFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePaymentMethodAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = method !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar meio de pagamento" : "Novo meio de pagamento"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <p className={styles.tip}>
        A taxa da maquininha, do cartão ou do Pix (quando houver — no Pix, o comum
        é 0%) é definida depois, em «Gerenciar taxas», na lista acima.
      </p>

      {isEditing ? <input type="hidden" name="id" value={method.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={method?.name}
        error={state.errors.name}
        placeholder="Pix do ateliê, maquininha Stone, cartão de crédito..."
        maxLength={80}
        required
      />

      <SelectField
        label="Tipo"
        name="kind"
        options={KIND_OPTIONS}
        defaultValue={method?.kind ?? "outro"}
        error={state.errors.kind}
        required
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={method?.notes}
        error={state.errors.notes}
        maxLength={500}
      />

      <div className={styles.actions}>
        {isEditing ? (
          <Button type="button" variant="secondary" size="md" onClick={onCancel}>
            Cancelar
          </Button>
        ) : null}

        <Button type="submit" size="md" disabled={isPending}>
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar meio de pagamento"
              : "Cadastrar meio de pagamento"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando meio de pagamento..." /> : null}
    </form>
  );
}
