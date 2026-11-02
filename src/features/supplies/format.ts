import { SUPPLY_UNIT_LABELS, type SupplyUnit } from "./types";

/**
 * Formata a quantidade e a unidade original de uma compra para o histórico.
 *
 * @param quantity quantidade registrada na compra
 * @param unit unidade informada no momento da compra
 * @returns quantidade decimal em formato pt-BR seguida da unidade
 */
export function formatAcquisitionQuantity(quantity: number, unit: SupplyUnit): string {
  const formattedQuantity = new Intl.NumberFormat("pt-BR", {
    maximumFractionDigits: 3,
  }).format(quantity);

  return `${formattedQuantity} ${SUPPLY_UNIT_LABELS[unit].toLowerCase()}`;
}
