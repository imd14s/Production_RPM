"use client";

import { useActionState, useEffect } from "react";
import { saveSupplyPriceAction } from "@/app/actions/supplies";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import type { Supplier } from "@/features/suppliers/types";
import {
  SUPPLY_UNITS,
  SUPPLY_UNIT_LABELS,
  type SupplyPrice,
  type SupplyUnit,
} from "@/features/supplies/types";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import { formatCentsInput } from "@/lib/money";
import styles from "./AcquisitionForm.module.css";

type AcquisitionFormProps = {
  supplyId: string;
  baseUnit: SupplyUnit;
  price: SupplyPrice | null;
  suppliers: Supplier[];
  onCancel: () => void;
  onSaved: () => void;
};

const SUPPLIER_OPTIONS = (suppliers: Supplier[], selectedId: string | null) =>
  suppliers
    .filter((supplier) => supplier.isActive || supplier.id === selectedId)
    .map((supplier) => ({ value: supplier.id, label: supplier.name }));

const UNIT_OPTIONS = SUPPLY_UNITS.map((unit) => ({
  value: unit,
  label: SUPPLY_UNIT_LABELS[unit],
}));

/**
 * Formulário de criação e edição de uma aquisição de insumo.
 *
 * @param supplyId insumo dono da aquisição
 * @param baseUnit unidade de uso cadastrada no insumo
 * @param price aquisição em edição, ou null para registrar uma nova compra
 * @param suppliers fornecedores para a lista de escolha
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function AcquisitionForm({
  supplyId,
  baseUnit,
  price,
  suppliers,
  onCancel,
  onSaved,
}: AcquisitionFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSupplyPriceAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = price !== null;

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>{isEditing ? "Editar compra" : "Registrar compra"}</h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <input type="hidden" name="supplyId" value={supplyId} />

      {isEditing ? <input type="hidden" name="id" value={price.id} /> : null}

      <TextField
        label="Data da compra"
        name="acquiredOn"
        type="date"
        defaultValue={price?.acquiredOn ?? ""}
        error={state.errors.acquiredOn}
        hint="Vazio usa o dia de hoje."
      />

      <SelectField
        label="Fornecedor"
        name="supplierId"
        options={[
          { value: "", label: "Sem fornecedor (compra avulsa)" },
          ...SUPPLIER_OPTIONS(suppliers, price?.supplierId ?? null),
        ]}
        defaultValue={price?.supplierId ?? ""}
        error={state.errors.supplierId}
      />

      <TextField
        label="Quantidade comprada"
        name="quantity"
        inputMode="decimal"
        defaultValue={price ? String(price.quantity).replace(".", ",") : ""}
        error={state.errors.quantity}
        placeholder="12,5"
        hint="Vírgula aceita."
        required
      />

      <SelectField
        label="Unidade da compra"
        name="purchaseUnit"
        options={UNIT_OPTIONS}
        defaultValue={price?.purchaseUnit ?? baseUnit}
        error={state.errors.purchaseUnit}
        required
      />

      <TextField
        label="Valor pago (R$)"
        name="amount"
        inputMode="decimal"
        defaultValue={price ? formatCentsInput(price.amountCents) : ""}
        error={state.errors.amount}
        placeholder="249,00"
        hint="Total pago naquela compra, sem frete."
        required
      />

      <TextField
        label="Frete (R$)"
        name="freight"
        inputMode="decimal"
        defaultValue={price?.freightCents ? formatCentsInput(price.freightCents) : ""}
        error={state.errors.freight}
        placeholder="0,00"
        hint="Opcional. Entra no custo rateado por unidade."
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={price?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar compra" : "Registrar compra"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando compra..." /> : null}
    </form>
  );
}
