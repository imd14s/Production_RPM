"use client";

import { useActionState, useEffect } from "react";
import { saveUnitConversionAction } from "@/app/actions/supplies";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import type { SupplyUnitConversion } from "@/features/supplies/types";
import {
  SUPPLY_UNITS,
  SUPPLY_UNIT_LABELS,
} from "@/features/supplies/types";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import styles from "./UnitConversionForm.module.css";

type UnitConversionFormProps = {
  supplyId: string;
  conversion: SupplyUnitConversion | null;
  onCancel: () => void;
  onSaved: () => void;
};

/**
 * Formulário de criação e edição de uma conversão de unidade.
 *
 * @param supplyId insumo dono da conversão
 * @param conversion conversão em edição, ou null para cadastrar
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function UnitConversionForm({
  supplyId,
  conversion,
  onCancel,
  onSaved,
}: UnitConversionFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveUnitConversionAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = conversion !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  const unitOptions = SUPPLY_UNITS.map((unit) => ({
    value: unit,
    label: SUPPLY_UNIT_LABELS[unit],
  }));

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar conversão" : "Cadastrar conversão"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <input type="hidden" name="supplyId" value={supplyId} />
      {isEditing ? <input type="hidden" name="id" value={conversion.id} /> : null}

      <SelectField
        label="Unidade de origem"
        name="fromUnit"
        options={unitOptions}
        defaultValue={conversion?.fromUnit ?? ""}
        error={state.errors.fromUnit}
        required
      />

      <SelectField
        label="Unidade de destino"
        name="toUnit"
        options={unitOptions}
        defaultValue={conversion?.toUnit ?? ""}
        error={state.errors.toUnit}
        required
      />

      <TextField
        label="Fator de conversão"
        name="factor"
        inputMode="decimal"
        defaultValue={conversion ? String(conversion.factor).replace(".", ",") : ""}
        error={state.errors.factor}
        placeholder="1000"
        hint="Quantas unidades de destino existem em uma unidade de origem."
        required
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={conversion?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar conversão" : "Cadastrar conversão"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando conversão..." /> : null}
    </form>
  );
}