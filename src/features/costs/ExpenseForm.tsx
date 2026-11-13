"use client";

import { useActionState, useEffect } from "react";
import { saveOperatingExpenseAction } from "@/app/actions/costs";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import type { OperatingExpense } from "@/features/costs/types";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import { formatCentsInput } from "@/lib/money";
import styles from "./ExpenseForm.module.css";

type ExpenseFormProps = {
  expense: OperatingExpense | null;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Formulário de criação e edição de uma despesa fixa.
 *
 * @param expense despesa em edição, ou null para cadastrar uma nova
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function ExpenseForm({ expense, onCancel, onSaved }: ExpenseFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveOperatingExpenseAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = expense !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar despesa fixa" : "Nova despesa fixa"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      {isEditing ? <input type="hidden" name="id" value={expense.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={expense?.name}
        error={state.errors.name}
        placeholder="Aluguel, luz, internet..."
        maxLength={120}
        required
      />

      <TextField
        label="Valor mensal (R$)"
        name="amount"
        inputMode="decimal"
        defaultValue={expense ? formatCentsInput(expense.amountCents) : ""}
        error={state.errors.amount}
        placeholder="1.200,00"
        hint="Valor usado por mês no rateio do custo."
        required
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={expense?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar despesa" : "Cadastrar despesa"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando despesa fixa..." /> : null}
    </form>
  );
}
