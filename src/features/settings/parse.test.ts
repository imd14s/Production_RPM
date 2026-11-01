import { parseCompanyRow, parseTaxRow } from "./parse";

const COMPANY_ROW = {
  id: 1,
  legal_name: "Ateliê Filhos de Aruanda LTDA",
  trade_name: "Ateliê Filhos de Aruanda",
  document: "11222333000181",
  company_type: "ltda",
  tax_regime: "simples_nacional",
  cnae: "3299-0/99",
  state_registration: "123456789",
  municipal_registration: "",
  email: "contato@aruanda.com.br",
  phone: "11988887777",
  street: "Rua das Flores",
  number: "100",
  complement: "",
  district: "Centro",
  city: "São Paulo",
  state: "SP",
  zip_code: "01001000",
};

describe("parseCompanyRow", () => {
  it("maps snake case to camel case", () => {
    const company = parseCompanyRow(COMPANY_ROW);

    expect(company).not.toBeNull();
    expect(company?.legalName).toBe("Ateliê Filhos de Aruanda LTDA");
    expect(company?.companyType).toBe("ltda");
    expect(company?.zipCode).toBe("01001000");
  });

  it("rejects rows with unknown enums", () => {
    expect(parseCompanyRow({ ...COMPANY_ROW, company_type: "sa" })).toBeNull();
    expect(parseCompanyRow({ ...COMPANY_ROW, tax_regime: "fora" })).toBeNull();
  });

  it("rejects empty names and non objects", () => {
    expect(parseCompanyRow(null)).toBeNull();
    expect(parseCompanyRow({ ...COMPANY_ROW, legal_name: "" })).toBeNull();
    expect(parseCompanyRow({ ...COMPANY_ROW, trade_name: "  " })).toBeNull();
  });
});

describe("parseTaxRow", () => {
  const PERCENT_ROW = {
    id: "1f0d2c6e-0d3f-4f3f-9c1a-6f7f0f0f0f0f",
    name: "Simples Nacional",
    kind: "percentual",
    rate: "6.500000",
    amount_cents: null,
    is_active: true,
    notes: "",
  };

  it("parses a percentage tax", () => {
    const tax = parseTaxRow(PERCENT_ROW);

    expect(tax).toEqual({
      id: PERCENT_ROW.id,
      name: "Simples Nacional",
      kind: "percentual",
      rate: "6.500000",
      amountCents: null,
      isActive: true,
      notes: "",
    });
  });

  it("parses a fixed tax", () => {
    const tax = parseTaxRow({
      ...PERCENT_ROW,
      kind: "fixo",
      rate: null,
      amount_cents: 1290,
    });

    expect(tax?.amountCents).toBe(1290);
    expect(tax?.rate).toBeNull();
  });

  it("rejects inconsistent rows", () => {
    expect(parseTaxRow({ ...PERCENT_ROW, rate: null })).toBeNull();
    expect(parseTaxRow({ ...PERCENT_ROW, kind: "outro" })).toBeNull();
    expect(parseTaxRow({ ...PERCENT_ROW, is_active: "sim" })).toBeNull();
    expect(parseTaxRow({ ...PERCENT_ROW, name: "" })).toBeNull();
  });
});
