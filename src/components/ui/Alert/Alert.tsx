import type { ReactNode } from "react";
import styles from "./Alert.module.css";

type AlertTone = "success" | "error" | "info";

type AlertProps = {
  tone?: AlertTone;
  children: ReactNode;
};

/**
 * Mensagem de retorno de uma ação, com leitura por leitor de tela.
 *
 * @param tone tom da mensagem (sucesso, erro ou informação)
 * @param children texto exibido
 * @returns caixa de mensagem
 */
export function Alert({ tone = "info", children }: AlertProps) {
  return (
    <p className={`${styles.alert} ${styles[tone]}`} role={tone === "error" ? "alert" : "status"}>
      {children}
    </p>
  );
}
