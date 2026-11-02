/**
 * Tipos das despesas fixas e da mão de obra.
 * Não há enum de domínio nesta família: só natureza textual do registro.
 * (Ver migration 20261101220000.)
 */

export type OperatingExpense = {
  id: string;
  name: string;
  amountCents: number;
  isActive: boolean;
  notes: string;
};

export type OperatingExpenseInput = {
  name: string;
  amountCents: number;
  notes: string;
};

export type LaborCost = {
  id: string;
  name: string;
  monthlyWageCents: number;
  standardHoursMonth: number;
  isActive: boolean;
  notes: string;
};

export type LaborCostInput = {
  name: string;
  monthlyWageCents: number;
  standardHoursMonth: number;
  notes: string;
};
