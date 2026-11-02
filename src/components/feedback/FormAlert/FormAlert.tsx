"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert/Alert";
import type { SettingsFormState } from "@/features/settings/formState";

type FormAlertProps = {
  state: SettingsFormState;
  /** Duração em milissegundos antes de a mensagem desaparecer. */
  timeoutMs?: number;
};

/**
 * Mensagem de retorno de uma Server Action.
 * Sobe a tela para o topo quando chega e desaparece sozinha após alguns segundos.
 * A visibilidade é derivada do estado da ação: nada de estado novo sincronizado
 * em efeito.
 *
 * @param state estado devolvido pela ação do formulário
 * @param timeoutMs tempo de exibição, padrão 6 segundos
 * @returns alerta temporário, ou nada quando não há mensagem visível
 */
export function FormAlert({ state, timeoutMs = 6000 }: FormAlertProps) {
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);
  const isIdle = state.status === "idle";
  const submissionKey = `${state.status}::${state.message}`;
  const visible = !isIdle && dismissedKey !== submissionKey;

  useEffect(() => {
    if (!visible) {
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });

    const timer = window.setTimeout(() => setDismissedKey(submissionKey), timeoutMs);

    return () => window.clearTimeout(timer);
  }, [visible, submissionKey, timeoutMs]);

  if (!visible) {
    return null;
  }

  return (
    <Alert tone={state.status === "success" ? "success" : "error"}>
      {state.message}
    </Alert>
  );
}
