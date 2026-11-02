import type { Metadata } from "next";
import { Badge } from "@/components/ui/Badge/Badge";
import { Card } from "@/components/ui/Card/Card";
import { getSessionContext } from "@/lib/auth/session";
import { formatLongDate, getFirstName, getGreeting, getHourInTimeZone } from "@/lib/date";
import { buildNavigation, countAvailableModules } from "@/lib/navigation";
import { describeRole } from "@/types/auth";
import styles from "./home.module.css";

export const metadata: Metadata = {
  title: "Início — Ateliê Filhos de Aruanda",
};

// A página lê a sessão por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Página inicial da área restrita.
 * Mostra apenas dados reais da sessão e o que já está disponível no sistema.
 *
 * @returns saudação, dados do perfil e situação dos módulos
 */
export default async function HomePage() {
  const session = await getSessionContext();
  const profile = session?.profile ?? null;
  const role = profile?.role ?? "operador";
  const now = new Date();
  const navigation = buildNavigation(role);
  const totalModules = navigation.available.length + navigation.planned.length;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{formatLongDate(now)}</p>
        <h1 className={styles.title}>
          {getGreeting(getHourInTimeZone(now))}
          {profile ? `, ${getFirstName(profile.fullName)}` : ""}.
        </h1>
        <p className={styles.description}>
          Este é o painel do sistema interno de gestão e precificação do ateliê. Os módulos
          aparecem no menu conforme cada etapa é concluída.
        </p>
      </section>

      <div className={styles.grid}>
        <Card title="Seu acesso">
          <dl className={styles.details}>
            <div className={styles.detail}>
              <dt>Perfil</dt>
              <dd>
                {profile ? <Badge tone="success">{describeRole(profile.role)}</Badge> : "—"}
              </dd>
            </div>

            <div className={styles.detail}>
              <dt>E-mail</dt>
              <dd>{session?.email || "—"}</dd>
            </div>

            <div className={styles.detail}>
              <dt>Situação</dt>
              <dd>
                {profile?.isActive ? (
                  <Badge tone="success">Ativa</Badge>
                ) : (
                  <Badge tone="warning">Inativa</Badge>
                )}
              </dd>
            </div>
          </dl>
        </Card>

        <Card title="Módulos disponíveis">
          <p className={styles.counter}>
            <strong>{countAvailableModules(role)}</strong> de {totalModules} módulos já
            liberados nesta versão.
          </p>

          {navigation.planned.length > 0 ? (
            <>
              <p className={styles.nextTitle}>Em desenvolvimento</p>
              <ul className={styles.plannedList}>
                {navigation.planned.map((item) => (
                  <li key={item.href} className={styles.plannedItem}>
                    <span>{item.label}</span>
                    <Badge tone="neutral">em breve</Badge>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>
      </div>

      <p className={styles.footerNote}>
        Precisa de acesso a outro módulo? Fale com o administrador do sistema.
      </p>
    </div>
  );
}
