"use client";

import { useCallback, useState } from "react";
import { deleteProductAction, toggleProductAction } from "@/app/actions/products";
import { Badge } from "@/components/ui/Badge/Badge";
import { Button } from "@/components/ui/Button/Button";
import { DeleteRowButton } from "@/components/ui/DeleteRowButton/DeleteRowButton";
import { PendingButton } from "@/components/ui/PendingButton/PendingButton";
import { ProductForm } from "@/features/products/ProductForm";
import type { ProductCatalog, ProductWithComponents } from "@/features/products/types";
import { PRODUCT_KIND_LABELS } from "@/features/products/types";
import { SUPPLY_UNIT_LABELS } from "@/features/supplies/types";
import type { DeleteWarnings } from "@/services/supabase/deleteDependencies";
import styles from "./ProductsPanel.module.css";

type ProductsPanelProps = {
  catalog: ProductCatalog;
  /** Avisos de dependências por produto, exibidos na confirmação de exclusão. */
  warnings?: DeleteWarnings;
};

/**
 * Painel de produtos com ficha técnica e controles de situação.
 *
 * @param catalog produtos com composições e insumos disponíveis
 * @param warnings avisos de dependências por produto
 * @returns lista de produtos e formulário de cadastro/edição
 */
export function ProductsPanel({ catalog, warnings }: ProductsPanelProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formVersion, setFormVersion] = useState(0);

  /**
   * Retorna o formulário ao modo de criação após cancelar ou salvar.
   */
  const resetForm = useCallback(() => {
    setEditingId(null);
    setFormVersion((version) => version + 1);
  }, []);

  const editingProduct =
    catalog.products.find((product) => product.id === editingId) ?? null;

  return (
    <div className={styles.panel}>
      <section className={styles.list} aria-label="Produtos cadastrados">
        {catalog.products.length === 0 ? (
          <p className={styles.empty}>
            Nenhum produto cadastrado. Use o formulário para criar o primeiro e
            registrar sua ficha técnica.
          </p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <caption className={styles.caption}>Produtos</caption>
              <thead>
                <tr>
                  <th scope="col">Produto</th>
                  <th scope="col">Modalidade</th>
                  <th scope="col">Composição por unidade</th>
                  <th scope="col">Situação</th>
                  <th scope="col">Ações</th>
                </tr>
              </thead>
              <tbody>
                {catalog.products.map((product) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    onEdit={() => setEditingId(product.id)}
                    warnings={warnings?.[product.id]}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className={styles.editor} aria-label="Formulário de produto">
        <ProductForm
          key={editingProduct ? editingProduct.id : `novo-${formVersion}`}
          product={editingProduct}
          products={catalog.products}
          supplies={catalog.supplies}
          onCancel={resetForm}
          onSaved={resetForm}
        />
      </section>
    </div>
  );
}

type ProductRowProps = {
  product: ProductWithComponents;
  onEdit: () => void;
  /** Avisos de dependências do produto, exibidos na confirmação de exclusão. */
  warnings?: string[];
};

/**
 * Apresenta produto, componentes e ações disponíveis para o administrador.
 *
 * @param product produto e ficha técnica
 * @param onEdit abre o produto no formulário
 * @param warnings avisos de dependências do produto
 * @returns linha da tabela de produtos
 */
function ProductRow({ product, onEdit, warnings }: ProductRowProps) {
  return (
    <tr className={product.isActive ? "" : styles.inactive}>
      <td data-label="Produto">
        {product.name}
        {product.laborMinutes !== null ? (
          <span className={styles.subText}>
            Mão de obra: {product.laborMinutes} min/unidade
          </span>
        ) : null}
      </td>
      <td data-label="Modalidade">{PRODUCT_KIND_LABELS[product.kind]}</td>
      <td data-label="Composição por unidade">
        {product.components.length > 0 ? (
          <ul className={styles.componentList}>
            {product.components.map((component) => (
              <li key={component.id}>
                {formatQuantity(component.quantity)} {SUPPLY_UNIT_LABELS[component.unit] ??
                  component.unit}{" "}
                × {component.targetName}
              </li>
            ))}
          </ul>
        ) : (
          <span className={styles.missing}>Sem componentes</span>
        )}
      </td>
      <td data-label="Situação">
        {product.isActive ? (
          <Badge tone="success">Ativo</Badge>
        ) : (
          <Badge tone="neutral">Inativo</Badge>
        )}
      </td>
      <td data-label="Ações">
        <div className={styles.rowActions}>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onEdit}
          >
            Editar
          </Button>

          <form action={toggleProductAction}>
            <input type="hidden" name="id" value={product.id} />
            <input
              type="hidden"
              name="isActive"
              value={String(!product.isActive)}
            />
            <PendingButton
              pendingMessage={
                product.isActive ? "Desativando produto..." : "Ativando produto..."
              }
            >
              {product.isActive ? "Desativar" : "Ativar"}
            </PendingButton>
          </form>

          <DeleteRowButton
            action={deleteProductAction}
            id={product.id}
            label={product.name}
            entityName="produto"
            warnings={warnings}
          />
        </div>
      </td>
    </tr>
  );
}

/**
 * Exibe quantidade fracionária com vírgula e até três casas decimais.
 *
 * @param quantity quantidade de insumo ou produto
 * @returns texto formatado para pt-BR
 */
function formatQuantity(quantity: number): string {
  return new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(quantity);
}
