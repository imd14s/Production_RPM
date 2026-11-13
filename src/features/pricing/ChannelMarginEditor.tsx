"use client";

import { useState, useTransition } from "react";
import { saveProductChannelMarginAction } from "@/app/actions/pricing";
import { Button } from "@/components/ui/Button/Button";
import { formatCents } from "@/lib/money";
import { formatPercentLabel } from "@/lib/percent";
import type {
  MatrixChannel,
  MatrixTax,
} from "@/services/calculations/pricingMatrix";
import { previewChannelPriceCents } from "@/services/calculations/pricingMatrix";
import styles from "./ChannelMarginEditor.module.css";

type ChannelMarginEditorProps = {
  /** Produto cuja margem está sendo alterada. */
  productId: string;
  /** Canal de venda com as taxas aplicadas. */
  channel: MatrixChannel;
  /** Impostos ativos, aplicados no preço. */
  taxes: MatrixTax[];
  /** Custo completo do produto, em centavos. */
  costCents: number | null;
  /** Margem em uso pelo canal, em decimal (0.3 = 30%). */
  marginPercent: number;
  /** Preço sugerido atual do canal, em centavos. */
  priceCents: number | null;
  /** Motivo da indisponibilidade do preço, quando houver. */
  reason: string | null;
};

/**
 * Converte a margem em decimal para o texto do campo (0.3 = "30").
 *
 * @param marginPercent margem em decimal
 * @returns texto do campo, sem casas desnecessárias
 */
function formatMarginInput(marginPercent: number): string {
  return String(Math.round(marginPercent * 10000) / 100);
}

/**
 * Converte o texto digitado em margem decimal.
 *
 * @param value texto do campo (ex.: "30" ou "12,5")
 * @returns margem em decimal, ou null quando o texto é inválido
 */
function parseMarginInput(value: string): number | null {
  const normalized = value.trim().replace(",", ".");

  if (normalized === "") {
    return null;
  }

  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    return null;
  }

  return parsed / 100;
}

/**
 * Campo de margem de lucro de um canal, com a prévia do preço sugerido.
 *
 * A prévia é recalculada enquanto o responsável digita, com o mesmo motor da
 * matriz da home. "Salvar" grava uma nova simulação de preço do canal.
 *
 * @param props produto, canal, impostos, custo e margem em uso
 * @returns campo de margem com preço sugerido e botão de salvar
 */
export function ChannelMarginEditor({
  productId,
  channel,
  taxes,
  costCents,
  marginPercent,
  priceCents,
  reason,
}: ChannelMarginEditorProps) {
  const [marginText, setMarginText] = useState(
    formatMarginInput(marginPercent),
  );
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const parsedMargin = parseMarginInput(marginText);
  const preview =
    parsedMargin === null
      ? null
      : previewChannelPriceCents({
          costCents,
          channel,
          taxes,
          marginPercent: parsedMargin,
        });

  function handleSave() {
    setMessage(null);

    startTransition(async () => {
      const result = await saveProductChannelMarginAction(
        productId,
        channel.id,
        marginText,
      );

      setMessage(result.message);
    });
  }

  const feesText = preview
    ? [
        preview.variablePercent > 0
          ? `${formatPercentLabel(preview.variablePercent * 100)} de taxas`
          : null,
        preview.fixedFeesCents > 0 ? `${formatCents(preview.fixedFeesCents)} fixos` : null,
      ]
        .filter((text): text is string => text !== null)
        .join(" + ")
    : "";

  return (
    <div className={styles.editor}>
      <div className={styles.field}>
        <label className={styles.label} htmlFor={`margin-${channel.id}`}>
          Margem de lucro
        </label>
        <div className={styles.inputRow}>
          <input
            id={`margin-${channel.id}`}
            className={styles.input}
            type="text"
            inputMode="decimal"
            value={marginText}
            onChange={(event) => {
              setMarginText(event.target.value);
              setMessage(null);
            }}
            aria-describedby={`margin-hint-${channel.id}`}
          />
          <span className={styles.unit}>%</span>
        </div>
        <p className={styles.hint} id={`margin-hint-${channel.id}`}>
          {feesText === "" ? "Sem taxas ativas neste canal." : `Taxas: ${feesText}`}
        </p>
      </div>

      <div className={styles.priceBox}>
        <span className={styles.priceLabel}>Preço sugerido</span>
        <span className={styles.priceValue}>
          {preview !== null && preview.priceCents !== null
            ? formatCents(preview.priceCents)
            : (reason ?? "—")}
        </span>
        {preview !== null && priceCents !== null && preview.priceCents !== priceCents ? (
          <span className={styles.priceHint}>
            Atual: {formatCents(priceCents)}
          </span>
        ) : null}
      </div>

      <Button
        type="button"
        onClick={handleSave}
        disabled={isPending || parsedMargin === null}
      >
        {isPending ? "Salvando..." : "Salvar"}
      </Button>

      {message !== null ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
