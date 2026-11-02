import { buildCompanyPayload, buildTaxPayload } from "./payload";

const COMPANY_INPUT = {
  legalName: "Ateliê Filhos de Aruanda LTDA",
  tradeName: "Ateliê Filhos de Aruanda",
  document: "11222333000181",
  companyType: "ltda" as const,
  taxRegime: "simples_nacional" as const,
  cnae: "3299-0/99",
  stateRegistration: "123456789",
  municipalRegistration: "",
  email: "contato@aruanda.com.br",
  phone: "11988887777",
  street: "Rua das Flores",
  number: "100",
  complement: "",
  district: "Centro",
  city: "São Paulo",
  state: "SP",
  zipCode: "01001000",
};

describe("buildCompanyPayload", () => {
  it("maps every field to the database column", () => {
    const payload = buildCompanyPayload(COMPANY_INPUT, "user-1");

    expect(payload).toEqual({
      id: 1,
      legal_name: "Ateliê Filhos de Aruanda LTDA",
      trade_name: "Ateliê Filhos de Aruanda",
      document: "11222333000181",
      company_type: "ltda",
      tax_regime: "simples_nacional",
      cnae: "3299-0/99",
      state_registration: "123456789",
      municipal_registration: null,
      email: "contato@aruanda.com.br",
      phone: "11988887777",
      street: "Rua das Flores",
      number: "100",
      complement: null,
      district: "Centro",
      city: "São Paulo",
      state: "SP",
      zip_code: "01001000",
      updated_by: "user-1",
    });
  });

  it("keeps the singleton id and stores the responsible user", () => {
    const payload = buildCompanyPayload(COMPANY_INPUT, "user-2");

    expect(payload.id).toBe(1);
    expect(payload.updated_by).toBe("user-2");
  });

  it("never sends empty strings to optional columns", () => {
    const payload = buildCompanyPayload(
      {
        ...COMPANY_INPUT,
        cnae: "",
        email: "",
        phone: "",
        street: "",
        number: "",
        district: "",
        city: "",
        state: "",
        zipCode: "",
        complement: "  ",
      },
      "user-1",
    );

    expect(payload.cnae).toBeNull();
    expect(payload.email).toBeNull();
    expect(payload.phone).toBeNull();
    expect(payload.street).toBeNull();
    expect(payload.number).toBeNull();
    expect(payload.district).toBeNull();
    expect(payload.city).toBeNull();
    expect(payload.state).toBeNull();
    expect(payload.zip_code).toBeNull();
    // complemento com espaços é mantido (o banco valida o tamanho)
    expect(payload.complement).toBe("  ");
  });
});

describe("buildTaxPayload", () => {
  it("maps a percentage tax", () => {
    const payload = buildTaxPayload({
      name: "Simples Nacional",
      kind: "percentual",
      rate: "6.500000",
      amountCents: null,
      notes: "",
    });

    expect(payload).toEqual({
      name: "Simples Nacional",
      kind: "percentual",
      rate: "6.500000",
      amount_cents: null,
      notes: null,
    });
  });

  it("maps a fixed tax with cents", () => {
    const payload = buildTaxPayload({
      name: "Taxa fixa",
      kind: "fixo",
      rate: null,
      amountCents: 1290,
      notes: "por nota",
    });

    expect(payload.amount_cents).toBe(1290);
    expect(payload.rate).toBeNull();
    expect(payload.notes).toBe("por nota");
  });
});
