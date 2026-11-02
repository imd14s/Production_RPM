"use client";

import { useActionState } from "react";
import { saveProductionBatchAction } from "@/app/actions/production";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextField } from "@/components/ui/TextField/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import styles from "./ProductionPanel.module.css";

type ProductionPanelProps = {
  products: Array<{ id: string; name: string }>;
};

export function ProductionPanel({ products }: ProductionPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveProductionBatchAction,
    EMPTY_SETTINGS_STATE,
  );

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Produção</h1>
      <p className={styles.hint}>Registre um lote de produção.</p>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <form className={styles.form} action={formAction} noValidate>
        <SelectField
          label="Produto"
          name="productId"
          options={products.map((product) => ({ value: product.id, label: product.name }))}
          defaultValue=""
          required
        />

        <TextField
          label="Quantidade produzida"
          name="quantityProduced"
          inputMode="decimal"
          defaultValue=""
          required
        />

        <TextField
          label="Data da produção"
          name="producedAt"
          type="date"
          defaultValue=""
        />

        <TextField
          label="Minutos de mão de obra (real)"
          name="laborMinutesActual"
          inputMode="numeric"
          defaultValue="0"
        />

        <TextField
          label="Energia (R$)"
          name="energyCost"
          inputMode="decimal"
          defaultValue=""
        />

        <TextField
          label="Máquina (R$)"
          name="machineCost"
          inputMode="decimal"
          defaultValue=""
        />

        <TextField
          label="Acabamento (R$)"
          name="finishingCost"
          inputMode="decimal"
          defaultValue=""
        />

        <TextAreaField label="Observação" name="notes" maxLength={500} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Registrar lote"}
        </Button>

        {isPending ? <LoadingOverlay message="Salvando lote..." /> : null}
      </form>
    </div>
  );
}