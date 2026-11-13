import styles from "./LoadingOverlay.module.css";

type LoadingOverlayProps = {
  message?: string;
};

/**
 * Cortina de espera das ações que aguardam o servidor.
 * Cobre a tela inteira para impedir cliques repetidos enquanto a ação roda.
 *
 * @param message texto exibido junto ao indicador de progresso
 * @returns sobreposição com indicador de carregamento
 */
export function LoadingOverlay({ message = "Processando..." }: LoadingOverlayProps) {
  return (
    <div className={styles.overlay} role="status" aria-live="assertive">
      <div className={styles.box}>
        <span className={styles.spinner} aria-hidden="true" />
        <p className={styles.message}>{message}</p>
      </div>
    </div>
  );
}
