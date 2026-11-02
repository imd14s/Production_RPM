import { connection } from "next/server";
import {
  parseInventoryMovementRow,
  parseProductionBatchRow,
  parseProductionConsumptionRow,
} from "@/features/production/parse";
import {
  buildInventoryMovementPayload,
  buildProductionBatchPayload,
  buildProductionConsumptionPayload,
} from "@/features/production/payload";
import type {
  InventoryMovement,
  InventoryMovementInput,
  ProductionBatch,
  ProductionBatchInput,
  ProductionConsumption,
  ProductionConsumptionInput,
} from "@/features/production/types";
import { createClient } from "@/services/supabase/server";

export async function listProductionBatches(): Promise<ProductionBatch[]> {
  await connection();
  const supabase = await createClient();
  const result = await supabase
    .from("production_batches")
    .select("*")
    .order("produced_at", { ascending: false });

  if (result.error) {
    throw new Error(`Não foi possível carregar os lotes. (código ${result.error.code ?? "desconhecido"})`);
  }

  return (result.data ?? [])
    .map(parseProductionBatchRow)
    .filter((item): item is ProductionBatch => item !== null);
}

export async function saveProductionBatch(input: ProductionBatchInput): Promise<ProductionBatch> {
  const supabase = await createClient();
  const payload = buildProductionBatchPayload(input);

  const { data, error } = await supabase
    .from("production_batches")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar o lote. (código ${error.code ?? "desconhecido"})`);
  }

  const parsed = parseProductionBatchRow(data);

  if (!parsed) {
    throw new Error("Lote inválido retornado pelo banco.");
  }

  return parsed;
}

export async function saveProductionConsumption(
  batchId: string,
  input: ProductionConsumptionInput,
): Promise<ProductionConsumption> {
  const supabase = await createClient();
  const payload = buildProductionConsumptionPayload(batchId, input);

  const { data, error } = await supabase
    .from("production_consumption")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar o consumo. (código ${error.code ?? "desconhecido"})`);
  }

  const parsed = parseProductionConsumptionRow(data);

  if (!parsed) {
    throw new Error("Consumo inválido retornado pelo banco.");
  }

  return parsed;
}

export async function listInventoryMovements(): Promise<InventoryMovement[]> {
  await connection();
  const supabase = await createClient();
  const result = await supabase
    .from("inventory_movements")
    .select("*")
    .order("created_at", { ascending: false });

  if (result.error) {
    throw new Error(`Não foi possível carregar as movimentações. (código ${result.error.code ?? "desconhecido"})`);
  }

  return (result.data ?? [])
    .map(parseInventoryMovementRow)
    .filter((item): item is InventoryMovement => item !== null);
}

export async function saveInventoryMovement(input: InventoryMovementInput): Promise<InventoryMovement> {
  const supabase = await createClient();
  const payload = buildInventoryMovementPayload(input);

  const { data, error } = await supabase
    .from("inventory_movements")
    .insert(payload)
    .select("*")
    .single();

  if (error) {
    throw new Error(`Não foi possível salvar a movimentação. (código ${error.code ?? "desconhecido"})`);
  }

  const parsed = parseInventoryMovementRow(data);

  if (!parsed) {
    throw new Error("Movimentação inválida retornada pelo banco.");
  }

  return parsed;
}