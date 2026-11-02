"use client";

import { useActionState, useEffect } from "react";
import { saveSupplyAction } from "@/app/actions/supplies";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import type { Supply } from "@/features/supplies/types";
import {
  SUPPLY_KINDS,
  SUPPLY_KIND_LABELS,
  SUPPLY_PURCHASE_UNITS,
  SUPPLY_PURCHASE_UNIT_LABELS,
  SUPPLY_UNITS,
  SUPPLY_UNIT_LABELS,
} from "@/features/supplies/types";
import styles from "./SupplyForm.module.css";

type SupplyFormProps = {
  supply: Supply | null;
  onCancel: () => void;
  onSaved: () => void;
};

const KIND_OPTIONS = SUPPLY_KINDS.map((value) => ({
  value,
  label: SUPPLY_KIND_LABELS[value],
}));

const UNIT_OPTIONS = SUPPLY_UNITS.map((value) => ({
  value,
  label: SUPPLY_UNIT_LABELS[value],
}));

/**
 * Formulário de criação e edição de um insumo.
 *
 * @param supply insumo em edição, ou null para cadastrar um novo
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function SupplyForm({ supply, onCancel, onSaved }: SupplyFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveSupplyAction,
    EMPTY_SETTINGS_STATE,
  );
  const isEditing = supply !== null;
  const defaultPurchaseUnit =
    supply && SUPPLY_PURCHASE_UNITS.includes(supply.unit) ? supply.unit : "unidade";

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar insumo" : "Novo insumo"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      {isEditing ? <input type="hidden" name="id" value={supply.id} /> : null}

      <TextField
        label="Nome"
        name="name"
        defaultValue={supply?.name}
        error={state.errors.name}
        placeholder="Tecido bolso, botão de madeira, filamento PLA..."
        maxLength={120}
        required
      />

      <SelectField
        label="Categoria"
        name="kind"
        options={KIND_OPTIONS}
        defaultValue={supply?.kind ?? "materia_prima"}
        error={state.errors.kind}
        required
      />

      <SelectField
        label="Unidade de medida"
        name="unit"
        options={UNIT_OPTIONS}
        defaultValue={supply?.unit ?? "unidade"}
        error={state.errors.unit}
        hint="Como você compra e usa: metro, grama, unidade, pacote..."
        required
      />

      {!isEditing ? (
        <>
          <SelectField
            label="Unidade da compra"
            name="purchaseUnit"
            options={SUPPLY_PURCHASE_UNITS.map((value) => ({
              value,
              label: SUPPLY_PURCHASE_UNIT_LABELS[value],
            }))}
            defaultValue={defaultPurchaseUnit}
            error={state.errors.purchaseUnit}
            required
          />

          <TextField
            label="Quantidade comprada"
            name="quantity"
            inputMode="decimal"
            error={state.errors.quantity}
            placeholder="5"
            hint="Número com até 3 casas decimais (ex: 2,5)."
            required
          />

          <TextField
            label="Valor pago (R$)"
            name="amount"
            inputMode="decimal"
            error={state.errors.amount}
            placeholder="25,00"
            hint="Total da compra, sem frete."
            required
          />

          <TextField
            label="Frete (R$)"
            name="freight"
            inputMode="decimal"
            error={state.errors.freight}
            placeholder="0,00"
            hint="Opcional. Entra no custo rateado por unidade."
          />

          <TextField
            label="Data da compra"
            name="acquiredOn"
            type="date"
            error={state.errors.acquiredOn}
            hint="Vazio usa o dia de hoje."
          />
        </>
      ) : null}

      {isEditing ? (
        <p className={styles.tip}>
          O custo por unidade nasce das compras registradas na página do insumo.
        </p>
      ) : null}

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={supply?.notes}
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
              ? "Salvar insumo"
              : "Cadastrar insumo"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando insumo..." /> : null}
    </form>
  );
}
