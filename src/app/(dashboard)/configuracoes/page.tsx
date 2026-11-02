import type { Metadata } from "next";
import { Alert } from "@/components/ui/Alert/Alert";
import { CompanyForm } from "@/features/settings/CompanyForm";
import { getCompanySettings } from "@/services/supabase/settings";
import styles from "./company.module.css";

export const metadata: Metadata = {
  title: "Configurações — Empresa — Ateliê Filhos de Aruanda",
};

// A página lê dados por requisição: rota bloqueante, sem navegação instantânea.
export const instant = false;

/**
 * Tela de dados cadastrais e fiscais da empresa.
 *
 * @returns formulário com os dados atuais
 */
export default async function CompanySettingsPage() {
  const company = await getCompanySettings();

  return (
    <div className={styles.page}>
      {company ? null : (
        <Alert tone="info">
          Nenhum dado cadastrado ainda. Preencha o formulário para habilitar os cálculos de
          precificação.
        </Alert>
      )}

      <CompanyForm company={company} />
    </div>
  );
}
