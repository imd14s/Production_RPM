"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge/Badge";
import { buildNavigation, isActiveRoute } from "@/lib/navigation";
import type { UserRole } from "@/types/auth";
import styles from "./Sidebar.module.css";

type SidebarProps = {
  role: UserRole;
};

/**
 * Menu lateral com os módulos disponíveis e a lista de módulos planejados.
 * Em telas pequenas vira um painel deslizante controlado pelo botão de menu.
 *
 * @param role perfil do usuário, usado para filtrar itens restritos
 * @returns navegação lateral
 */
export function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const navigation = buildNavigation(role);

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
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
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
