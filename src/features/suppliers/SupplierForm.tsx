"use client";

import { useActionState, useEffect } from "react";
import { saveSupplierAction } from "@/app/actions/suppliers";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import type { Supplier } from "@/features/suppliers/types";
import { formatCpfOrCnpj, formatPhone } from "@/features/suppliers/format";
import styles from "./SupplierForm.module.css";

type SupplierFormProps = {
  supplier: Supplier | null;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Formulário de criação e edição de um fornecedor.
 *
 * @param supplier fornecedor em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function SupplierForm({ supplier, onCancel, onSaved }: SupplierFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSupplierAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = supplier !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar fornecedor" : "Novo fornecedor"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      {isEditing ? <input type="hidden" name="id" value={supplier.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={supplier?.name}
        error={state.errors.name}
        placeholder="Tecidos Aurora, feira do bairro..."
        maxLength={120}
        required
      />

      <TextField
        label="CPF ou CNPJ"
        name="document"
        inputMode="numeric"
        defaultValue={supplier?.document ? formatCpfOrCnpj(supplier.document) : ""}
        error={state.errors.document}
        hint="Opcional. Pode digitar ou colar com ou sem pontuação; os dígitos são conferidos."
        maxLength={18}
        format={formatCpfOrCnpj}
      />

      <TextField
        label="Telefone"
        name="phone"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        defaultValue={supplier?.phone ? formatPhone(supplier.phone) : ""}
        error={state.errors.phone}
        hint="Opcional. Com DDD; 8 ou 9 dígitos."
        maxLength={16}
        format={formatPhone}
      />

      <TextField
        label="E-mail"
        name="email"
        type="email"
        autoComplete="email"
        defaultValue={supplier?.email}
        error={state.errors.email}
        hint="Opcional."
        maxLength={120}
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={supplier?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar fornecedor" : "Cadastrar fornecedor"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando fornecedor..." /> : null}
    </form>
  );
}
