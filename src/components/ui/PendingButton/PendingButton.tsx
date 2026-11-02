"use client";

import { useFormStatus } from "react-dom";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button/Button";
import { LoadingOverlay } from "@/components/ui/LoadingOverlay/LoadingOverlay";

type PendingButtonProps = {
  children: ReactNode;
  pendingMessage?: string;
  variant?: "primary" | "secondary" | "ghost";
  size?: "md" | "sm";
};

/**
 * Botão de envio que bloqueia a tela com indicador de progresso enquanto a ação
 * do formulário aguarda o servidor, impedindo cliques repetidos.
 * Precisa estar dentro de um `<form>` para enxergar o estado de envio.
 *
 * @param children conteúdo do botão
 * @param pendingMessage texto exibido na cortina de espera
 * @param variant aparência do botão
 * @param size tamanho do botão
 * @returns botão com bloqueio durante o envio
 */
export function PendingButton({
  children,
  pendingMessage = "Processando...",
  variant = "ghost",
  size = "sm",
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  return (
    <>
      <Button type="submit" variant={variant} size={size} disabled={pending}>
        {children}
      </Button>

      {pending ? <LoadingOverlay message={pendingMessage} /> : null}
    </>
  );
}
