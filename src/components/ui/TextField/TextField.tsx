"use client";

import { useState, type ChangeEvent } from "react";
import styles from "./TextField.module.css";

type TextFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  type?: "text" | "email" | "tel";
  inputMode?: "text" | "numeric" | "decimal" | "email" | "tel";
  autoComplete?: string;
  maxLength?: number;
  required?: boolean;
  format?: (value: string) => string;
};

/**
 * Campo de texto com rótulo, dica e mensagem de erro.
 * Quando `format` é informado, o valor é mascarado a cada digitação (CNPJ, CEP,
 * telefone) e continua aceitando conteúdo colado com ou sem pontuação.
 *
 * @param label texto do rótulo
 * @param name nome do campo enviado no formulário
 * @param defaultValue valor inicial
 * @param error mensagem de validação
 * @param hint texto auxiliar
 * @param placeholder exemplo de preenchimento
 * @param type tipo do input
 * @param inputMode teclado sugerido em telas móveis
 * @param autoComplete preenchimento automático do navegador
 * @param maxLength limite de caracteres
 * @param required indica preenchimento obrigatório
 * @param format função de máscara aplicada durante a digitação
 * @returns campo acessível
 */
export function TextField({
  label,
  name,
  defaultValue,
  error,
  hint,
  placeholder,
  type = "text",
  inputMode = "text",
  autoComplete,
  maxLength,
  required = false,
  format,
}: TextFieldProps) {
  const [typedValue, setTypedValue] = useState(defaultValue ?? "");
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

  /**
   * Aplica a máscara (quando existir) sem alterar o que o usuário digitou.
   *
   * @param event evento de digitação do input
   */
  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const nextValue = event.target.value;
    setTypedValue(format ? format(nextValue) : nextValue);
  }

  // Campos com máscara são controlados; os demais seguem não controlados.
  const valueProps = format
    ? { value: typedValue, onChange: handleChange }
    : { defaultValue };

  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </label>

      <input
        id={name}
        name={name}
        type={type}
        inputMode={inputMode}
        className={`${styles.input} ${error ? styles.invalid : ""}`}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...valueProps}
      />

      {hint && !error ? (
        <p className={styles.hint} id={`${name}-hint`}>
          {hint}
        </p>
      ) : null}

      {error ? (
        <p className={styles.error} id={`${name}-error`}>
          {error}
        </p>
      ) : null}
    </div>
  );
}
