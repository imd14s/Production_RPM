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
};

/**
 * Campo de texto com rótulo, dica e mensagem de erro.
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
}: TextFieldProps) {
  const describedBy = error ? `${name}-error` : hint ? `${name}-hint` : undefined;

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
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoComplete={autoComplete}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
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
