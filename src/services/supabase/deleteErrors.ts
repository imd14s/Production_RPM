/**
 * Trecho do erro devolvido pelo PostgREST usado na tradução de mensagens.
 */
type DeleteErrorLike = {
  /** Código do erro no Postgres (ex.: "23503" para violação de chave estrangeira). */
  code?: string | null;
};

/**
 * Converte erro de exclusão do Supabase em mensagem amigável em pt-BR.
 * Código 23503 = violação de chave estrangeira (registro em uso/histórico).
 *
 * @param error erro devolvido pelo cliente Supabase
 * @param entityLabel tipo do registro em pt-BR com artigo (ex.: "o canal de venda")
 * @returns mensagem pronta para exibição ao administrador
 */
export function mapDeleteError(error: DeleteErrorLike, entityLabel: string): string {
  if (error.code === "23503") {
    return `Não é possível excluir: ${entityLabel} está em uso ou possui registros vinculados.`;
  }

  return `Não foi possível excluir ${entityLabel}. (código ${error.code ?? "desconhecido"})`;
}

