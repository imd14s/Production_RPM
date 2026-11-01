"use client";

import { useActionState } from "react";
import { saveCompanyAction } from "@/app/actions/settings";
import { Alert } from "@/components/ui/Alert/Alert";
import { Button } from "@/components/ui/Button/Button";
import { SelectField } from "@/components/ui/SelectField/SelectField";
import { TextField } from "@/components/ui/TextField/TextField";
import { EMPTY_SETTINGS_STATE } from "@/features/settings/formState";
import { formatCnpj, formatPhone, formatZipCode } from "@/features/settings/format";
import {
  COMPANY_TYPES,
  COMPANY_TYPE_LABELS,
  TAX_REGIMES,
  TAX_REGIME_LABELS,
  type CompanySettings,
} from "@/features/settings/types";
import styles from "./CompanyForm.module.css";

type CompanyFormProps = {
  company: CompanySettings | null;
};

const COMPANY_TYPE_OPTIONS = COMPANY_TYPES.map((value) => ({
  value,
  label: COMPANY_TYPE_LABELS[value],
}));

const TAX_REGIME_OPTIONS = TAX_REGIMES.map((value) => ({
  value,
  label: TAX_REGIME_LABELS[value],
}));

/**
 * Formulário único com os dados cadastrais e fiscais do ateliê.
 *
 * @param company configuração atual, ou null quando ainda não cadastrada
 * @returns formulário com validação no servidor
 */
export function CompanyForm({ company }: CompanyFormProps) {
  const [state, formAction, isPending] = useActionState(saveCompanyAction, EMPTY_SETTINGS_STATE);

  return (
    <form className={styles.form} action={formAction} noValidate>
      {state.status !== "idle" ? (
        <Alert tone={state.status === "success" ? "success" : "error"}>{state.message}</Alert>
      ) : null}

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Identificação</legend>

        <div className={styles.grid}>
          <TextField
            label="Razão social"
            name="legalName"
            defaultValue={company?.legalName}
            error={state.errors.legalName}
            required
            maxLength={160}
          />

          <TextField
            label="Nome fantasia"
            name="tradeName"
            defaultValue={company?.tradeName}
            error={state.errors.tradeName}
            required
            maxLength={160}
          />

          <TextField
            label="CNPJ"
            name="document"
            defaultValue={company ? formatCnpj(company.document) : ""}
            error={state.errors.document}
            hint="Somente números e dígitos verificadores válidos."
            inputMode="numeric"
            maxLength={18}
            required
          />

          <SelectField
            label="Tipo de empresa"
            name="companyType"
            options={COMPANY_TYPE_OPTIONS}
            defaultValue={company?.companyType ?? "mei"}
            error={state.errors.companyType}
            required
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Tributação</legend>

        <div className={styles.grid}>
          <SelectField
            label="Regime tributário"
            name="taxRegime"
            options={TAX_REGIME_OPTIONS}
            defaultValue={company?.taxRegime ?? "mei"}
            error={state.errors.taxRegime}
            required
          />

          <TextField
            label="CNAE principal"
            name="cnae"
            defaultValue={company?.cnae}
            error={state.errors.cnae}
            hint="Exemplo: 3299-0/99"
            maxLength={20}
          />

          <TextField
            label="Inscrição estadual"
            name="stateRegistration"
            defaultValue={company?.stateRegistration}
            error={state.errors.stateRegistration}
            maxLength={20}
          />

          <TextField
            label="Inscrição municipal"
            name="municipalRegistration"
            defaultValue={company?.municipalRegistration}
            error={state.errors.municipalRegistration}
            maxLength={20}
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Contato</legend>

        <div className={styles.grid}>
          <TextField
            label="E-mail"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            defaultValue={company?.email}
            error={state.errors.email}
            maxLength={120}
          />

          <TextField
            label="Telefone"
            name="phone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            defaultValue={company ? formatPhone(company.phone) : ""}
            error={state.errors.phone}
            maxLength={16}
          />
        </div>
      </fieldset>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>Endereço</legend>

        <div className={styles.grid}>
          <TextField
            label="CEP"
            name="zipCode"
            inputMode="numeric"
            autoComplete="postal-code"
            defaultValue={company ? formatZipCode(company.zipCode) : ""}
            error={state.errors.zipCode}
            maxLength={9}
          />

          <TextField
            label="Logradouro"
            name="street"
            autoComplete="address-line1"
            defaultValue={company?.street}
            error={state.errors.street}
            maxLength={160}
          />

          <TextField
            label="Número"
            name="number"
            defaultValue={company?.number}
            error={state.errors.number}
            maxLength={20}
          />

          <TextField
            label="Complemento"
            name="complement"
            autoComplete="address-line2"
            defaultValue={company?.complement}
            error={state.errors.complement}
            maxLength={80}
          />

          <TextField
            label="Bairro"
            name="district"
            defaultValue={company?.district}
            error={state.errors.district}
            maxLength={80}
          />

          <TextField
            label="Cidade"
            name="city"
            autoComplete="address-level2"
            defaultValue={company?.city}
            error={state.errors.city}
            maxLength={80}
          />

          <TextField
            label="UF"
            name="state"
            autoComplete="address-level1"
            defaultValue={company?.state}
            error={state.errors.state}
            hint="Duas letras, exemplo: SP"
            maxLength={2}
          />
        </div>
      </fieldset>

      <div className={styles.actions}>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Salvando..." : "Salvar dados"}
        </Button>
      </div>
    </form>
  );
}
