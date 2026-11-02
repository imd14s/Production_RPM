"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActiveRoute } from "@/lib/navigation";
import styles from "./SettingsTabs.module.css";

const SETTINGS_TABS = [
  { label: "Empresa", href: "/configuracoes" },
  { label: "Impostos", href: "/configuracoes/impostos" },
  { label: "Canais", href: "/configuracoes/canais" },
  { label: "Pagamentos", href: "/configuracoes/pagamentos" },
];

/**
 * Navegação entre as seções de configurações.
 * Ganha mais abas conforme novas áreas entrarem no menu.
 *
 * @returns abas com a seção atual destacada
 */
export function SettingsTabs() {
  const pathname = usePathname();

  return (
    <nav className={styles.tabs} aria-label="Seções de configurações">
      {SETTINGS_TABS.map((tab) => {
        const active = isActiveRoute(tab.href, pathname);

        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={active ? `${styles.tab} ${styles.active}` : styles.tab}
            aria-current={active ? "page" : undefined}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
