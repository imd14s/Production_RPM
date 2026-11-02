"use client";

import { useActionState, useEffect } from "react";
import { saveSupplyPriceAction } from "@/app/actions/supplies";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import {
  SUPPLY_PURCHASE_UNITS,
  SUPPLY_PURCHASE_UNIT_LABELS,
  type Supply,
} from "@/features/supplies/types";
import styles from "./SimpleAcquisitionForm.module.css";

type SimpleAcquisitionFormProps = {
  supply: Supply;
  onSaved: () => void;
};

const PURCHASE_OPTIONS = SUPPLY_PURCHASE_UNITS.map((value) => ({
  value,
  label: SUPPLY_PURCHASE_UNIT_LABELS[value],
}));

/**
 * Formulário simples para registrar uma compra posterior de um insumo existente.
 *
 * @param supply insumo que receberá a compra
 * @param onSaved ação executada após o sucesso
 * @returns formulário de aquisição
 */
export function SimpleAcquisitionForm({
  supply,
  onSaved,
}: SimpleAcquisitionFormProps) {
  const [state, formAction, isPending] = useActionState(saveSupplyPriceAction, EMPTY_SETTINGS_STATE);

  useEffect(() => {
    if (state.status === "success") onSaved();
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>Registrar compra de {supply.name}</h3>
      {state.status !== "idle" ? <FormAlert state={state} /> : null}
      <input type="hidden" name="supplyId" value={supply.id} />

      <SelectField
        label="Unidade da compra"
        name="purchaseUnit"
        options={PURCHASE_OPTIONS}
        defaultValue={
          SUPPLY_PURCHASE_UNITS.includes(supply.unit) ? supply.unit : "outro"
        }
        hint="Como comprou: litro, quilograma, grama..."
        required
      />

      <TextField
        label="Quantidade comprada"
        name="quantity"
        inputMode="decimal"
        placeholder="5"
        hint="Número com até 3 casas decimais (ex: 2,5)"
        required
      />

      <TextField
        label="Valor pago (R$)"
        name="amount"
        inputMode="decimal"
        placeholder="25,00"
        hint="Total da compra, sem frete"
        required
      />

      <TextField
        label="Frete (R$)"
        name="freight"
        inputMode="decimal"
        placeholder="0,00"
        required={false}
      />

      <TextField
        label="Data da compra"
        name="acquiredOn"
        type="date"
        required
      />

      <div className={styles.actions}>
        <Button type="submit" size="md" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar compra"}
        </Button>
      </div>
    </form>
  );
}
