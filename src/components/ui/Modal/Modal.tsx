"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import styles from "./Modal.module.css";

type ModalProps = {
  /** Título do diálogo, exibido no topo e lido por leitores de tela. */
  title: string;
  /** Executado quando o usuário fecha o diálogo. */
  onClose: () => void;
  /** Conteúdo do diálogo. */
  children: ReactNode;
};

/**
 * Diálogo modal sobreposto à página.
 *
 * Fecha pela tecla Escape, pelo clique na sobreposição e pelo botão de
 * fechar. Enquanto aberto, o foco fica no painel e a página não rola; ao
 * fechar, o foco volta para o elemento que abriu o diálogo.
 *
 * @param props título, ação de fechamento e conteúdo
 * @returns diálogo sobreposto
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef(onClose);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const originalOverflow = document.body.style.overflow;

    panelRef.current?.focus();
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeRef.current();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = originalOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  function handleOverlayMouseDown(event: React.MouseEvent<HTMLDivElement>) {
    if (event.target === event.currentTarget) {
      onClose();
    }
  }

  return (
    <div className={styles.overlay} onMouseDown={handleOverlayMouseDown}>
      <div
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        ref={panelRef}
      >
        <header className={styles.header}>
          <h2 className={styles.title} id={titleId}>
            {title}
          </h2>
          <button
            type="button"
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Fechar"
          >
            ×
          </button>
        </header>

        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
