/**
 * Tipos e rótulos das configurações empresariais.
 * Os mesmos valores existem como enums no banco (ver migration 20261101190000).
 */

export type CompanyType = "mei" | "me" | "eireli" | "ltda" | "outro";

export type TaxRegime =
  | "mei"
  | "simples_nacional"
  | "lucro_presumido"
  | "lucro_real"
  | "outro";

export type TaxKind = "percentual" | "fixo";

export type CompanySettings = {
  legalName: string;
  tradeName: string;
  document: string;
  companyType: CompanyType;
  taxRegime: TaxRegime;
  cnae: string;
  stateRegistration: string;
  municipalRegistration: string;
  email: string;
  phone: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  monthlyOutputUnits: number | null;
  defaultRetailMargin: number | null;
  defaultWholesaleMargin: number | null;
};

export type TaxSettingInput = {
  name: string;
  kind: TaxKind;
  rate: string | null;
  amountCents: number | null;
  notes: string;
};

export type TaxSetting = TaxSettingInput & {
  id: string;
  isActive: boolean;
};

export const COMPANY_TYPE_LABELS: Record<CompanyType, string> = {
  mei: "MEI",
  me: "ME",
  eireli: "EIRELI",
  ltda: "LTDA",
  outro: "Outro",
};

export const TAX_REGIME_LABELS: Record<TaxRegime, string> = {
  mei: "MEI",
  simples_nacional: "Simples Nacional",
  lucro_presumido: "Lucro Presumido",
  lucro_real: "Lucro Real",
  outro: "Outro",
};

export const TAX_KIND_LABELS: Record<TaxKind, string> = {
  percentual: "Percentual",
  fixo: "Valor fixo",
};

export const COMPANY_TYPES: CompanyType[] = ["mei", "me", "eireli", "ltda", "outro"];

export const TAX_REGIMES: TaxRegime[] = [
  "mei",
  "simples_nacional",
  "lucro_presumido",
  "lucro_real",
  "outro",
];
