"use client";

import { useActionState } from "react";
import { savePricingSimulationAction } from "@/app/actions/pricing";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextField } from "@/components/ui/TextField/TextField";
import type { ChannelWithFees } from "@/features/channels/types";
import type { PaymentMethodWithFees } from "@/features/payments/types";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import styles from "./PricingPanel.module.css";

type PricingPanelProps = {
  products: Array<{ id: string; name: string; kind: string }>;
  channels: ChannelWithFees[];
  payments: PaymentMethodWithFees[];
};

/**
 * Painel de precificação: seleciona produto, canal e modalidade e calcula o preço.
 *
 * @param products produtos cadastrados
 * @param channels canais com taxas
 * @param payments meios de pagamento com taxas
 * @returns formulário de simulação
 */
export function PricingPanel({ products, channels, payments }: PricingPanelProps) {
  const [state, formAction, isPending] = useActionState(
    savePricingSimulationAction,
    EMPTY_SETTINGS_STATE,
  );

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Precificação</h1>
      <p className={styles.hint}>
        Selecione o produto, o canal e a modalidade para calcular o preço recomendado.
      </p>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <form className={styles.form} action={formAction} noValidate>
        <SelectField
          label="Produto"
          name="productId"
          options={products.map((product) => ({ value: product.id, label: product.name }))}
          defaultValue=""
          required
        />

        <SelectField
          label="Canal de venda"
          name="channelId"
          options={channels.map((item) => ({ value: item.channel.id, label: item.channel.name }))}
          defaultValue=""
          required
        />

        <SelectField
          label="Meio de pagamento (opcional)"
          name="paymentMethodId"
          options={[
            { value: "", label: "Nenhum" },
            ...payments.map((item) => ({ value: item.method.id, label: item.method.name })),
          ]}
          defaultValue=""
        />

        <SelectField
          label="Modalidade"
          name="modality"
          options={[
            { value: "varejo", label: "Varejo" },
            { value: "atacado", label: "Atacado" },
          ]}
          defaultValue="varejo"
          required
        />

        <TextField
          label="Margem desejada (%)"
          name="marginPercent"
          inputMode="decimal"
          defaultValue="30"
          hint="Informe um número entre 0 e 100."
          required
        />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Calculando..." : "Calcular preço"}
        </Button>

        {isPending ? <LoadingOverlay message="Calculando preço..." /> : null}
      </form>
    </div>
  );
}