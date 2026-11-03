"use client";

import { useActionState, useEffect, useState, type ChangeEvent } from "react";
import { saveProductAction } from "@/app/actions/products";
import { FormAlert } from "@/components/feedback/FormAlert/FormAlert";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";
import { TextAreaField } from "@/components/ui/TextAreaField/TextAreaField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import type {
  ProductCatalog,
  ProductKind,
  ProductWithComponents,
} from "@/features/products/types";
import { PRODUCT_KINDS, PRODUCT_KIND_LABELS } from "@/features/products/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import styles from "./ProductForm.module.css";

type ProductFormProps = {
  product: ProductWithComponents | null;
  products: ProductCatalog["products"];
  supplies: ProductCatalog["supplies"];
  onCancel: () => void;
  onSaved: () => void;
};

type ProductComponentDraft = {
  targetType: "supply" | "product";
  targetId: string;
  quantity: string;
};

/**
 * Formulário de produto e composição enviado a uma Server Action validada.
 *
 * @param product produto em edição, ou null para novo cadastro
 * @param products produtos candidatos a subproduto ou componente de kit
 * @param supplies insumos candidatos para a ficha técnica
 * @param onCancel ação para abandonar a edição
 * @param onSaved ação após a gravação bem-sucedida
 * @returns formulário de produto e componentes
 */
export function ProductForm({
  product,
  products,
  supplies,
  onCancel,
  onSaved,
}: ProductFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveProductAction,
    EMPTY_SETTINGS_STATE,
  );
  const [kind, setKind] = useState<ProductKind>(product?.kind ?? "fabricado");
  const [components, setComponents] = useState<ProductComponentDraft[]>(() =>
    product
      ? product.components.map((component) => ({
          targetType: component.targetType,
          targetId: component.targetId,
          quantity: String(component.quantity),
        }))
      : [],
  );
  const isEditing = product !== null;
  const productOptions = products.filter(
    (candidate) => candidate.id !== product?.id,
  );
  const productById = new Map(products.map((candidate) => [candidate.id, candidate]));
  const supplyById = new Map(supplies.map((supply) => [supply.id, supply]));

  useEffect(() => {
    if (state.status === "success") {
      onSaved();
    }
  }, [state.status, onSaved]);

  /**
   * Adiciona uma linha de componente com destino e quantidade iniciais.
   */
  function addComponent() {
    const targetType =
      kind === "kit" || supplies.length === 0 ? "product" : "supply";
    const targetId =
      targetType === "supply"
        ? supplies[0]?.id ?? ""
        : productOptions[0]?.id ?? "";

    setComponents((current) => [
      ...current,
      { targetType, targetId, quantity: "1" },
    ]);
  }

  /**
   * Atualiza o tipo ou destino selecionado para uma linha.
   *
   * @param index posição da linha de composição
   * @param value valor codificado como tipo e identificador
   */
  function updateTarget(index: number, value: string) {
    if (value === "") {
      setComponents((current) =>
        current.map((component, componentIndex) =>
          componentIndex === index
            ? { ...component, targetId: "" }
            : component,
        ),
      );

      return;
    }

    const separatorIndex = value.indexOf(":");
    const targetType = value.slice(0, separatorIndex);
    const targetId = value.slice(separatorIndex + 1);

    if (
      separatorIndex < 0 ||
      (targetType !== "supply" && targetType !== "product")
    ) {
      return;
    }

    setComponents((current) =>
      current.map((component, componentIndex) =>
        componentIndex === index
          ? {
              ...component,
              targetType,
              targetId,
            }
          : component,
      ),
    );
  }

  /**
   * Atualiza o texto da quantidade de uma linha.
   *
   * @param index posição da linha de composição
   * @param quantity quantidade digitada
   */
  function updateQuantity(index: number, quantity: string) {
    setComponents((current) =>
      current.map((component, componentIndex) =>
        componentIndex === index ? { ...component, quantity } : component,
      ),
    );
  }

  /**
   * Remove uma linha de componente da ficha técnica.
   *
   * @param index posição da linha removida
   */
  function removeComponent(index: number) {
    setComponents((current) => [
      ...current.slice(0, index),
      ...current.slice(index + 1),
    ]);
  }

  /**
   * Atualiza a modalidade e mantém os itens existentes para validação explícita.
   *
   * @param event evento de alteração do campo de modalidade
   */
  function handleKindChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextKind = event.target.value as ProductKind;

    if (PRODUCT_KINDS.includes(nextKind)) {
      setKind(nextKind);
    }
  }

  const componentsPayload = JSON.stringify(
    components.map((component) => ({
      targetType: component.targetType,
      supplyId: component.targetType === "supply" ? component.targetId : null,
      productId: component.targetType === "product" ? component.targetId : null,
      quantity: component.quantity,
    })),
  );

  return (
    <form className={styles.form} action={formAction} noValidate>
      <h3 className={styles.title}>
        {isEditing ? "Editar produto" : "Novo produto"}
      </h3>

      {state.status !== "idle" ? <FormAlert state={state} /> : null}
      {isEditing ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="components" value={componentsPayload} />

      <TextField
        label="Nome"
        name="name"
        defaultValue={product?.name}
        error={state.errors.name}
        placeholder="Blusa artesanal, vela aromática, combo..."
        maxLength={120}
        required
      />

      <div className={styles.field}>
        <label className={styles.label} htmlFor="kind">
          Modalidade <span className={styles.required}>*</span>
        </label>
        <select
          id="kind"
          name="kind"
          className={`${styles.select} ${state.errors.kind ? styles.invalid : ""}`}
          value={kind}
          onChange={handleKindChange}
          aria-invalid={state.errors.kind ? true : undefined}
          aria-describedby={state.errors.kind ? "kind-error" : undefined}
          required
        >
          {PRODUCT_KINDS.map((productKind) => (
            <option key={productKind} value={productKind}>
              {PRODUCT_KIND_LABELS[productKind]}
            </option>
          ))}
        </select>
        {state.errors.kind ? (
          <p className={styles.error} id="kind-error">
            {state.errors.kind}
          </p>
        ) : null}
      </div>

      <TextField
        label="Mão de obra por unidade (minutos)"
        name="laborMinutes"
        defaultValue={
          product?.laborMinutes === null || product?.laborMinutes === undefined
            ? ""
            : String(product.laborMinutes)
        }
        error={state.errors.laborMinutes}
        hint="Opcional. Informe um número inteiro de 0 a 2.880 minutos."
        inputMode="numeric"
        maxLength={4}
      />

      <TextField
        label="Energia por unidade (R$)"
        name="energyCost"
        defaultValue={
          product?.energyCostCents == null ? "" : (product.energyCostCents / 100).toFixed(2).replace(".", ",")
        }
        error={state.errors.energyCost}
        hint="Opcional. Custos de impressão 3D."
        inputMode="decimal"
      />

      <TextField
        label="Máquina por unidade (R$)"
        name="machineCost"
        defaultValue={
          product?.machineCostCents == null ? "" : (product.machineCostCents / 100).toFixed(2).replace(".", ",")
        }
        error={state.errors.machineCost}
        hint="Opcional. Depreciação por unidade."
        inputMode="decimal"
      />

      <TextField
        label="Acabamento por unidade (R$)"
        name="finishingCost"
        defaultValue={
          product?.finishingCostCents == null ? "" : (product.finishingCostCents / 100).toFixed(2).replace(".", ",")
        }
        error={state.errors.finishingCost}
        hint="Opcional."
        inputMode="decimal"
      />

      <TextField
        label="Taxa de falha (%)"
        name="failureRate"
        defaultValue={
          product?.failureRatePercent == null ? "" : String(product.failureRatePercent)
        }
        error={state.errors.failureRate}
        hint="Opcional. Percentual de perda na impressão 3D."
        inputMode="decimal"
      />

      <fieldset className={styles.composition}>
        <legend className={styles.legend}>Ficha técnica</legend>
        <p className={styles.hint}>
          Informe a quantidade usada por unidade do produto. Conversões de
          unidade e cálculo de custos são etapas posteriores.
        </p>

        {components.map((component, index) => {
          const targetExists =
            component.targetType === "supply"
              ? supplyById.has(component.targetId)
              : productById.has(component.targetId);
          const value =
            component.targetId && targetExists
              ? `${component.targetType}:${component.targetId}`
              : "";

          return (
            <div className={styles.componentRow} key={`component-${index}`}>
              <div className={styles.componentFields}>
                <div className={styles.field}>
                  <label
                    className={styles.label}
                    htmlFor={`component-type-${index}`}
                  >
                    Componente
                  </label>
                  <select
                    id={`component-type-${index}`}
                    className={styles.select}
                    value={value}
                    onChange={(event) => updateTarget(index, event.target.value)}
                    aria-label={`Componente ${index + 1}`}
                  >
                    <option value="">Escolha um item</option>
                    <optgroup label="Insumos">
                      {supplies.map((supply) => (
                        <option
                          key={supply.id}
                          value={`supply:${supply.id}`}
                          disabled={kind === "kit"}
                        >
                          {supply.name}
                          {supply.isActive ? "" : " (inativo)"}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label="Produtos">
                      {productOptions.map((candidate) => (
                        <option
                          key={candidate.id}
                          value={`product:${candidate.id}`}
                        >
                          {candidate.name}
                          {candidate.isActive ? "" : " (inativo)"}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                <div className={styles.field}>
                  <label
                    className={styles.label}
                    htmlFor={`component-quantity-${index}`}
                  >
                    Quantidade
                  </label>
                  <input
                    id={`component-quantity-${index}`}
                    className={`${styles.input} ${
                      state.errors.components ? styles.invalid : ""
                    }`}
                    type="text"
                    inputMode="decimal"
                    value={component.quantity}
                    onChange={(event) =>
                      updateQuantity(index, event.target.value)
                    }
                    maxLength={14}
                    aria-label={`Quantidade do componente ${index + 1}`}
                    aria-describedby={
                      state.errors.components ? "components-error" : undefined
                    }
                  />
                </div>
              </div>

              <span className={styles.componentUnit}>
                {component.targetType === "supply"
                  ? SUPPLY_UNIT_LABELS[
                      supplyById.get(component.targetId)?.unit ?? "unidade"
                    ]
                  : "unidade"}
              </span>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeComponent(index)}
              >
                Remover
              </Button>

              {component.targetType === "product" &&
              component.targetId === product?.id ? (
                <p className={styles.error}>O produto não pode conter a si mesmo.</p>
              ) : null}
            </div>
          );
        })}

        {state.errors.components ? (
          <p className={styles.error} id="components-error">
            {state.errors.components}
          </p>
        ) : null}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={addComponent}
          disabled={
            kind === "kit"
              ? productOptions.length === 0
              : supplies.length === 0 && productOptions.length === 0
          }
        >
          Adicionar componente
        </Button>
      </fieldset>

      <TextAreaField
        label="Observação"
        name="notes"
        defaultValue={product?.notes}
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
          {isPending
            ? "Salvando..."
            : isEditing
              ? "Salvar produto"
              : "Cadastrar produto"}
        </Button>
      </div>

      {isPending ? <LoadingOverlay message="Salvando produto..." /> : null}
    </form>
  );
}
