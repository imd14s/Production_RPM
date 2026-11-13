/**
 * Saudação e formatação de data no padrão brasileiro.
 * Funções puras para permitir teste unitário sem depender do fuso do navegador.
 */

/** Fuso oficial usado nas telas do sistema. */
export const DEFAULT_TIME_ZONE = "America/Sao_Paulo";

/**
 * Escolhe a saudação conforme a hora do dia.
 *
 * @param hour hora do dia entre 0 e 23
 * @returns "Bom dia", "Boa tarde" ou "Boa noite"
 */
export function getGreeting(hour: number): string {
  if (!Number.isInteger(hour) || hour < 0 || hour > 23) {
    throw new RangeError("Hour must be an integer between 0 and 23");
  }

  if (hour < 12) {
    return "Bom dia";
  }

  if (hour < 18) {
    return "Boa tarde";
  }

  return "Boa noite";
}

/**
 * Extrai a hora cheia de uma data considerando o fuso informado.
 * Evita depender do fuso do servidor (que roda em UTC na hospedagem).
 *
 * @param date data e hora de referência
 * @param timeZone fuso IANA, padrão America/Sao_Paulo
 * @returns hora entre 0 e 23
 */
export function getHourInTimeZone(date: Date, timeZone: string = DEFAULT_TIME_ZONE): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour: "2-digit",
    hour12: false,
  }).format(date);
  const hour = Number.parseInt(formatted, 10);

  if (Number.isNaN(hour)) {
    throw new RangeError("Could not read the hour from the given date");
  }

  // Alguns ambientes retornam 24 para a meia-noite.
  return hour === 24 ? 0 : hour;
}

/**
 * Formata uma data por extenso em português.
 *
 * @param date data a formatar
 * @param timeZone fuso IANA, padrão America/Sao_Paulo
 * @returns texto como "domingo, 1 de novembro de 2026"
 */
export function formatLongDate(date: Date, timeZone: string = DEFAULT_TIME_ZONE): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

/**
 * Devolve o primeiro nome de um nome completo.
 *
 * @param fullName nome completo
 * @returns primeiro nome ou string vazia
 */
export function getFirstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? "";
}
