"use client";

import { useActionState } from "react";
import { signInAction, type SignInState } from "@/app/actions/auth";
import { Button } from "@/components/ui/Button/Button";
import styles from "./LoginForm.module.css";

const INITIAL_STATE: SignInState = { error: "" };

/**
 * Formulário de login com estado de erro e bloqueio durante o envio.
 *
 * @returns formulário acessível de e-mail e senha
 */
export function LoginForm() {
  const [state, formAction, isPending] = useActionState(signInAction, INITIAL_STATE);

  return (
    <form className={styles.form} action={formAction} noValidate>
      <label className={styles.field}>
        <span className={styles.label}>E-mail</span>
        <input
          className={styles.input}
          type="email"
          name="email"
          autoComplete="email"
          required
          disabled={isPending}
        />
      </label>

      <label className={styles.field}>
        <span className={styles.label}>Senha</span>
        <input
          className={styles.input}
          type="password"
          name="password"
          autoComplete="current-password"
          required
          disabled={isPending}
        />
      </label>

      {state.error ? (
        <p className={styles.error} role="alert">
          {state.error}
        </p>
      ) : null}

      <Button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "Entrando..." : "Entrar"}
      </Button>
    </form>
  );
}
