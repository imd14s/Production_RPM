import type { ButtonHTMLAttributes, ReactNode } from "react";
import styles from "./Button.module.css";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "md" | "sm";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

/**
 * Botão padrão do sistema.
 *
 * @param variant aparência (primary, secondary ou ghost)
 * @param size altura do botão
 * @param children conteúdo do botão
 * @returns elemento button com os estilos do design system
 */
export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...rest
}: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className]
    .filter(Boolean)
    .join(" ");

  return (
    <button className={classes} {...rest}>
      {children}
    </button>
  );
}
