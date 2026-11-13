import type { ChangeEventHandler } from "react";
import styles from "./SelectField.module.css";

type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  name: string;
  options: SelectOption[];
  defaultValue?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  onChange?: ChangeEventHandler<HTMLSelectElement>;
};

/**
 * Campo de seleção com rótulo e mensagem de erro.
 *
 * @param label texto do rótulo
 * @param name nome do campo enviado no formulário
 * @param options valores disponíveis
 * @param defaultValue opção selecionada inicialmente
 * @param error mensagem de validação
 * @param hint texto auxiliar
 * @param required indica preenchimento obrigatório
 * @param onChange ação executada quando a seleção muda
 * @returns select acessível
 */
export function SelectField({
  label,
  name,
  options,
  defaultValue,
  error,
  hint,
  required = false,
  onChange,
}: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={name}>
        {label}
        {required ? <span className={styles.required}>*</span> : null}
      </label>

      <select
        id={name}
        name={name}
        className={`${styles.select} ${error ? styles.invalid : ""}`}
        defaultValue={defaultValue}
        required={required}
        onChange={onChange}
        aria-invalid={error ? true : undefined}
        aria-describedby={
          error ? `${name}-error` : hint ? `${name}-hint` : undefined
        }
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

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
