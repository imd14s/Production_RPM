import styles from "./TextAreaField.module.css";

type TextAreaFieldProps = {
  label: string;
  name: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  rows?: number;
};

/**
 * Campo de texto longo com rótulo e mensagem de erro.
 *
 * @param label texto do rótulo
 * @param name nome do campo enviado no formulário
 * @param defaultValue valor inicial
 * @param error mensagem de validação
 * @param hint texto auxiliar
 * @param placeholder exemplo de preenchimento
 * @param maxLength limite de caracteres
 * @param rows número de linhas visíveis
 * @returns área de texto acessível
 */
export function TextAreaField({
  label,
  name,
  defaultValue,
  error,
  hint,
  placeholder,
  maxLength,
  rows = 3,
}: TextAreaFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
      </label>

      <textarea
        id={name}
        name={name}
        className={`${styles.textarea} ${error ? styles.invalid : ""}`}
        defaultValue={defaultValue}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : hint ? `${name}-hint` : undefined}
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
