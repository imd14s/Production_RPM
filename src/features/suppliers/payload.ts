import type { SupplierInput } from "@/features/suppliers/types";

/**
 * Monta o payload de gravação de um fornecedor no formato do banco.
 *
 * @param input fornecedor já validado
 * @returns payload pronto para insert/update
 */
export function buildSupplierPayload(input: SupplierInput): Record<string, unknown> {
  return {
    name: input.name,
    document: input.document || null,
    phone: input.phone || null,
    email: input.email || null,
    notes: input.notes || null,
  };
}
