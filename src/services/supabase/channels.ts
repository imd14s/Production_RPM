import { connection } from "next/server";
import {
  parseChannelFeeRow,
  parseChannelRow,
} from "@/features/channels/parse";
import {
  buildChannelFeePayload,
  buildChannelPayload,
} from "@/features/channels/payload";
import type {
  Channel,
  ChannelFee,
  ChannelFeeInput,
  ChannelInput,
  ChannelWithFees,
} from "@/features/channels/types";
import { createClient } from "@/services/supabase/server";

export type { ChannelWithFees };

/**
 * Carrega os canais com suas taxas agrupadas.
 * `connection()` interrompe o pré-render: o cliente Supabase usa relógio interno.
 *
 * @returns canais ativos primeiro, com as taxas de cada um
 */
export async function listChannelsWithFees(): Promise<ChannelWithFees[]> {
  await connection();
  const supabase = await createClient();

  const [channelsResult, feesResult] = await Promise.all([
    supabase
      .from("sales_channels")
      .select("*")
      .order("is_active", { ascending: false })
      .order("name", { ascending: true }),
    supabase
      .from("channel_fees")
      .select("*")
      .order("is_active", { ascending: false })
      .order("label", { ascending: true }),
  ]);

  if (channelsResult.error) {
    throw new Error(`Não foi possível carregar os canais de venda. (código ${channelsResult.error.code ?? "desconhecido"})`);
  }

  if (feesResult.error) {
    throw new Error("Não foi possível carregar as taxas dos canais.");
  }

  const channels = (channelsResult.data ?? [])
    .map(parseChannelRow)
    .filter((item): item is Channel => item !== null);

  const fees = (feesResult.data ?? [])
    .map(parseChannelFeeRow)
    .filter((item): item is ChannelFee => item !== null);

  return channels.map((channel) => ({
    channel,
    fees: fees.filter((fee) => fee.channelId === channel.id),
  }));
}

/**
 * Carrega um canal específico com as suas taxas.
 *
 * @param id identificador do canal
 * @returns canal com taxas, ou null quando não existe
 */
export async function getChannelWithFees(id: string): Promise<ChannelWithFees | null> {
  await connection();
  const supabase = await createClient();

  const { data: channelData, error: channelError } = await supabase
    .from("sales_channels")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (channelError) {
    throw new Error(`Não foi possível carregar o canal de venda. (código ${channelError.code ?? "desconhecido"})`);
  }

  const channel = parseChannelRow(channelData);

  if (!channel) {
    return null;
  }

  const { data: feesData, error: feesError } = await supabase
    .from("channel_fees")
    .select("*")
    .eq("channel_id", id)
    .order("is_active", { ascending: false })
    .order("label", { ascending: true });

  if (feesError) {
    throw new Error(`Não foi possível carregar as taxas do canal. (código ${feesError.code ?? "desconhecido"})`);
  }

  const fees = (feesData ?? [])
    .map(parseChannelFeeRow)
    .filter((item): item is ChannelFee => item !== null);

  return { channel, fees };
}

/**
 * Cria ou atualiza um canal de venda.
 *
 * @param id identificador do canal, ou null para criar
 * @param input valores já validados
 */
export async function saveChannel(id: string | null, input: ChannelInput): Promise<void> {
  const supabase = await createClient();
  const payload = buildChannelPayload(input);

  const { error } = id
    ? await supabase.from("sales_channels").update(payload).eq("id", id)
    : await supabase.from("sales_channels").insert(payload);

  if (error) {
    throw new Error(
      error.code === "23505"
        ? "Já existe um canal com esse nome."
        : "Não foi possível salvar o canal de venda.",
    );
  }
}

/**
 * Ativa ou desativa um canal.
 *
 * @param id identificador do canal
 * @param isActive nova situação
 */
export async function setChannelActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sales_channels")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a situação do canal. (código ${error.code ?? "desconhecido"})`);
  }
}

/**
 * Cria ou atualiza uma taxa de canal.
 *
 * @param id identificador da taxa, ou null para criar
 * @param channelId canal dono da taxa (usado na criação)
 * @param input valores já validados
 */
export async function saveChannelFee(
  id: string | null,
  channelId: string,
  input: ChannelFeeInput,
): Promise<void> {
  const supabase = await createClient();
  const payload = buildChannelFeePayload(channelId, input);

  const { error } = id
    ? await supabase.from("channel_fees").update(payload).eq("id", id)
    : await supabase.from("channel_fees").insert(payload);

  if (error) {
    throw new Error(`Não foi possível salvar a taxa do canal. (código ${error.code ?? "desconhecido"})`);
  }
}

/**
 * Ativa ou desativa uma taxa de canal.
 *
 * @param id identificador da taxa
 * @param isActive nova situação
 */
export async function setChannelFeeActive(id: string, isActive: boolean): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("channel_fees")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) {
    throw new Error(`Não foi possível alterar a situação da taxa. (código ${error.code ?? "desconhecido"})`);
  }
}
