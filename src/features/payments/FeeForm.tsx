"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { savePaymentFeeAction } from "@/app/actions/payments";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import {
  type PaymentFee,
  type TaxKind,
  TAX_KIND_LABELS,
} from "@/features/payments/types";
import { formatCentsInput } from "@/lib/money";
import { formatPercent } from "@/lib/percent";
import styles from "./FeeForm.module.css";

type FeeFormProps = {
  methodId: string;
  fee: PaymentFee | null;
  onCancel: () => void;
  onSaved: () => void;
};

const KIND_OPTIONS = [
  { value: "percentual", label: TAX_KIND_LABELS.percentual },
  { value: "fixo", label: TAX_KIND_LABELS.fixo },
];

const INSTALLMENTS_OPTIONS = [
  { value: "", label: "Qualquer quantidade" },
  { value: "1", label: "À vista (1)" },
  { value: "2", label: "2 parcelas" },
  { value: "3", label: "3 parcelas" },
  { value: "4", label: "4 parcelas" },
  { value: "5", label: "5 parcelas" },
  { value: "6", label: "6 parcelas" },
  { value: "10", label: "10 parcelas" },
  { value: "12", label: "12 parcelas" },
];

/**
 * Formulário de criação e edição de uma taxa de meio de pagamento.
 *
 * @param methodId meio de pagamento dono da taxa
 * @param fee taxa em edição, ou null para cadastrar uma nova
 * @param onCancel ação de cancelar a edição
 * @param onSaved ação executada após salvar com sucesso
 * @returns formulário com validação no servidor
 */
export function FeeForm({ methodId, fee, onCancel, onSaved }: FeeFormProps) {
  const [state, formAction, isPending] = useActionState(
    savePaymentFeeAction,
    EMPTY_SETTINGS_STATE,
  );
  const [kind, setKind] = useState<TaxKind>(fee?.kind ?? "percentual");
  const isEditing = fee !== null;

  /**
   * Troca o campo de valor conforme o tipo de taxa escolhido.
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
      <h3 className={styles.title}>{isEditing ? "Editar taxa" : "Nova taxa"}</h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <input type="hidden" name="methodId" value={methodId} />

      {isEditing ? <input type="hidden" name="id" value={fee.id} /> : null}

      <TextField
        label="Identificação"
        name="label"
        defaultValue={fee?.label}
        error={state.errors.label}
        placeholder="Taxa da maquininha, taxa do Pix, parcelamento..."
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
          defaultValue={fee?.rate ? formatPercent(fee.rate) : ""}
          error={state.errors.rate}
          placeholder="4,99"
          hint="Entre 0 e 100, com até 6 casas decimais."
        />
      ) : (
        <TextField
          label="Valor fixo (R$)"
          name="amount"
          inputMode="decimal"
          defaultValue={
            fee?.amountCents !== null && fee?.amountCents !== undefined
              ? formatCentsInput(fee.amountCents)
              : ""
          }
          error={state.errors.amount}
          placeholder="0,80"
        />
      )}

      <SelectField
        label="Condição de pagamento"
        name="installments"
        options={INSTALLMENTS_OPTIONS}
        defaultValue={fee?.installments ? String(fee.installments) : ""}
        error={state.errors.installments}
        hint="Deixe 'Qualquer' quando a taxa vale para todas as condições."
      />

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={fee?.notes}
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
          {isPending ? "Salvando..." : isEditing ? "Salvar taxa" : "Cadastrar taxa"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando taxa..." /> : null}
    </form>
  );
}
