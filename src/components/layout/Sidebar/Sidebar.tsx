"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { buildNavigation, isActiveRoute } from "@/lib/navigation";
import type { UserRole } from "@/types/auth";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  role: UserRole;
};

/**
 * Menu lateral com os módulos disponíveis, em formato de gaveta controlada
 * pelo botão de menu hambúrguer (todas as larguras de tela).
 *
 * @param role perfil do usuário, usado para filtrar itens restritos
 * @returns navegação lateral
 */
export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navigation = buildNavigation(role);
  const [lastPathname, setLastPathname] = useState(pathname);

  if (pathname !== lastPathname) {
    setLastPathname(pathname);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  /**
   * Fecha o menu móvel após navegar.
   */
  function closeMenu() {
    setIsOpen(false);
  }

  return (
    <>
      <button
        type="button"
        className={styles.toggle}
        aria-expanded={isOpen}
        aria-controls="app-sidebar"
        aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span className={styles.toggleBar} />
        <span className={styles.toggleBar} />
        <span className={styles.toggleBar} />
      </button>

      {isOpen ? (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Fechar menu"
          onClick={closeMenu}
        />
      ) : null}

      <aside
        id="app-sidebar"
        className={isOpen ? `${styles.sidebar} ${styles.open}` : styles.sidebar}
        aria-hidden={isOpen ? "false" : "true"}
      >
        <div className={styles.brand}>
          <span className={styles.brandMark}>A</span>
          <div>
            <p className={styles.brandName}>Ateliê Filhos de Aruanda</p>
            <p className={styles.brandHint}>Gestão e precificação</p>
          </div>
        </div>

        <nav className={styles.nav} aria-label="Módulos do sistema">
          <ul className={styles.list}>
            {navigation.available.map((item) => {
              const isActive = isActiveRoute(item.href, pathname);

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.link} ${isActive ? styles.active : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={closeMenu}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {navigation.planned.length > 0 ? (
            <>
              <p className={styles.sectionTitle}>Próximos módulos</p>
              <ul className={styles.list}>
                {navigation.planned.map((item) => (
                  <li key={item.href} className={styles.planned}>
                    <span>{item.label}</span>
                    <Badge tone="neutral">em breve</Badge>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </nav>
      </aside>
    </>
  );
}
