"use client";

import { useState } from "react";
import { useActionState } from "react";
import { saveInventoryMovementAction } from "@/app/actions/production";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextField } from "@/components/ui/TextField/TextField";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import type { InventoryMovement } from "./types";
import styles from "./InventoryPanel.module.css";

type InventoryPanelProps = {
  items: Array<{ id: string; name: string; type: "supply" | "product" }>;
  movements: InventoryMovement[];
};

export function InventoryPanel({ items, movements }: InventoryPanelProps) {
  const [state, formAction, isPending] = useActionState(
    saveInventoryMovementAction,
    EMPTY_SETTINGS_STATE,
  );

  const [selectedType, setSelectedType] = useState<"supply" | "product">("supply");

  const filteredItems = items.filter((item) => item.type === selectedType);

  return (
    <div className={styles.panel}>
      <h1 className={styles.title}>Estoque</h1>
      <p className={styles.hint}>Registre uma movimentação de estoque.</p>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}

      <form className={styles.form} action={formAction} noValidate>
        <SelectField
          label="Tipo de item"
          name="itemType"
          options={[
            { value: "supply", label: "Insumo" },
            { value: "product", label: "Produto" },
          ]}
          defaultValue="supply"
          onChange={(event) => setSelectedType(event.target.value as "supply" | "product")}
        />

        <SelectField
          label="Item"
          name="itemId"
          options={filteredItems.map((item) => ({ value: item.id, label: item.name }))}
          defaultValue=""
          required
        />

        <SelectField
          label="Tipo de movimentação"
          name="movementType"
          options={[
            { value: "entrada", label: "Entrada" },
            { value: "saida", label: "Saída" },
            { value: "consumo", label: "Consumo" },
            { value: "perda", label: "Perda" },
            { value: "ajuste", label: "Ajuste" },
          ]}
          defaultValue="entrada"
          required
        />

        <TextField
          label="Quantidade"
          name="quantity"
          inputMode="decimal"
          defaultValue=""
          required
        />

        <TextField
          label="Custo unitário (R$)"
          name="unitCost"
          inputMode="decimal"
          defaultValue=""
        />

        <TextAreaField label="Observação" name="notes" maxLength={500} />

        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Registrar movimentação"}
        </Button>

        {isPending ? <LoadingOverlay message="Salvando..." /> : null}
      </form>

      <section className={styles.list}>
        <h2 className={styles.subtitle}>Últimas movimentações</h2>
        {movements.length === 0 ? (
          <p className={styles.empty}>Nenhuma movimentação registrada.</p>
        ) : (
          <ul className={styles.movements}>
            {movements.slice(0, 20).map((movement) => (
              <li key={movement.id}>
                {movement.movementType} · {movement.itemType} · {movement.quantity}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}