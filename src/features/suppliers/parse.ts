import type { Supplier } from "@/features/suppliers/types";

/**
 * Converte uma linha de `suppliers` no tipo de domínio.
 *
 * @param row linha retornada pelo Supabase
 * @returns fornecedor tipado ou null quando o registro não segue o contrato
 */
export function parseSupplierRow(row: unknown): Supplier | null {
  if (typeof row !== "object" || row === null) {
    return null;
  }

  const candidate = row as Record<string, unknown>;
  const id = candidate.id;
  const name = typeof candidate.name === "string" ? candidate.name.trim() : "";
  const isActive = candidate.isActive ?? candidate.is_active;
  const document = typeof candidate.document === "string" ? candidate.document : "";
  const phone = typeof candidate.phone === "string" ? candidate.phone : "";
  const email = typeof candidate.email === "string" ? candidate.email : "";

  if (typeof id !== "string" || name.length < 2 || name.length > 120) {
    return null;
  }

  if (typeof isActive !== "boolean") {
    return null;
  }

  return {
    id,
    name,
    document,
    phone,
    email,
    isActive,
    notes: typeof candidate.notes === "string" ? candidate.notes : "",
  };
}
