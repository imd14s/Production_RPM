"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { saveTaxAction } from "@/app/actions/settings";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import { formatCentsInput } from "@/lib/money";
import { formatPercent } from "@/lib/percent";
import { TAX_KIND_LABELS, type TaxKind, type TaxSetting } from "@/features/settings/types";
import styles from "./TaxForm.module.css";

type TaxFormProps = {
  initial: TaxSetting | null;
  onCancel: () => void;
  onSaved: () => void;
};

const KIND_OPTIONS = [
  { value: "percentual", label: TAX_KIND_LABELS.percentual },
  { value: "fixo", label: TAX_KIND_LABELS.fixo },
];

/**
 * Formulário de criação e edição de um imposto.
 *
 * @param initial imposto em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function TaxForm({ initial, onCancel, onSaved }: TaxFormProps) {
  const [state, formAction, isPending] = useActionState(saveTaxAction, EMPTY_SETTINGS_STATE);
  const [kind, setKind] = useState<TaxKind>(initial?.kind ?? "percentual");
  const isEditing = initial !== null;

  /**
   * Troca o campo de valor conforme o tipo de imposto escolhido.
   *
   * @param event evento de mudança do select
   */
  function handleKindChange(event: ChangeEvent<HTMLSelectElement>) {
    setKind(event.target.value as TaxKind);
  }

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>{isEditing ? "Editar imposto" : "Novo imposto"}</h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      {isEditing ? <input type="hidden" name="id" value={initial.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={initial?.name}
        error={state.errors.name}
        placeholder="Simples Nacional, ICMS, taxa fixa por nota..."
        maxLength={80}
        required
      />

      <SelectField
        label="Tipo"
        name="kind"
        options={KIND_OPTIONS}
        defaultValue={kind}
        error={state.errors.kind}
        onChange={handleKindChange}
        required
      />

      {kind === "percentual" ? (
        <TextField
          label="Percentual (%)"
          name="rate"
          inputMode="decimal"
          defaultValue={initial?.rate ? formatPercent(initial.rate) : ""}
          error={state.errors.rate}
          placeholder="6,5"
          hint="Entre 0 e 100, com até 6 casas decimais."
        />
      ) : (
        <TextField
          label="Valor fixo (R$)"
          name="amount"
          inputMode="decimal"
          defaultValue={
            initial?.amountCents !== null && initial?.amountCents !== undefined
              ? formatCentsInput(initial.amountCents)
              : ""
          }
          error={state.errors.amount}
          placeholder="12,90"
        />
      )}

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={initial?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar imposto" : "Cadastrar imposto"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando imposto..." /> : null}
    </form>
  );
}
