"use client";

import { useActionState, useEffect } from "react";
import { saveLaborCostAction } from "@/app/actions/costs";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import type { LaborCost } from "@/features/costs/types";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import { formatHours } from "@/lib/hours";
import { formatCentsInput } from "@/lib/money";
import styles from "./LaborForm.module.css";

type LaborFormProps = {
  labor: LaborCost | null;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Formulário de criação e edição de um custo de mão de obra.
 *
 * @param labor custo em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function LaborForm({ labor, onCancel, onSaved }: LaborFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveLaborCostAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = labor !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar mão de obra" : "Nova mão de obra"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      {isEditing ? <input type="hidden" name="id" value={labor.id} /> : null}

      <TextField
        label="Pessoa ou função"
        name="name"
        defaultValue={labor?.name}
        error={state.errors.name}
        placeholder="Costureira, rendeira, acabamento..."
        maxLength={120}
        required
      />

      <TextField
        label="Salário mensal (R$)"
        name="wage"
        inputMode="decimal"
        defaultValue={labor ? formatCentsInput(labor.monthlyWageCents) : ""}
        error={state.errors.wage}
        placeholder="2.000,00"
        hint="Somente o valor fixo mensal — o que varia por produção entra no custo da peça."
        required
      />

      <TextField
        label="Horas mensais"
        name="hours"
        inputMode="decimal"
        defaultValue={labor ? formatHours(labor.standardHoursMonth) : ""}
        error={state.errors.hours}
        placeholder="176"
        hint="Referência sobre qual rateio cada hora trabalhada. Aceita vírgula (ex.: 176,5)."
        required
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={labor?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar mão de obra" : "Cadastrar mão de obra"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando mão de obra..." /> : null}
    </form>
  );
}
