import {
  isValidCnpj,
  onlyDigits,
  readText,
  validateCompanySettings,
  validateTaxSettings,
} from "./settings";

const VALID_COMPANY = {
  legalName: "Ateliê Filhos de Aruanda LTDA",
  tradeName: "Ateliê Filhos de Aruanda",
  document: "11.222.333/0001-81",
  companyType: "ltda",
  taxRegime: "simples_nacional",
  cnae: "3299-0/99",
  stateRegistration: "123456789",
  municipalRegistration: "",
  email: "contato@aruanda.com.br",
  phone: "(11) 98888-7777",
  street: "Rua das Flores",
  number: "100",
  complement: "",
  district: "Centro",
  city: "São Paulo",
  state: "sp",
  zipCode: "01001-000",
};

describe("isValidCnpj", () => {
  it("accepts a valid cnpj", () => {
    expect(isValidCnpj("11222333000181")).toBe(true);
  });

  it("rejects wrong check digits", () => {
    expect(isValidCnpj("11222333000182")).toBe(false);
  });

  it("rejects repeated digits and wrong length", () => {
    expect(isValidCnpj("00000000000000")).toBe(false);
    expect(isValidCnpj("1122233300018")).toBe(false);
  });
});

describe("onlyDigits", () => {
  it("strips masks", () => {
    expect(onlyDigits("(11) 98888-7777")).toBe("11988887777");
    expect(onlyDigits("01001-000")).toBe("01001000");
  });
});

describe("readText", () => {
  it("trims strings and ignores other types", () => {
    expect(readText({ name: "  valor  " }, "name")).toBe("valor");
    expect(readText({ name: 10 }, "name")).toBe("");
    expect(readText({}, "name")).toBe("");
  });
});

describe("validateCompanySettings", () => {
  it("normalizes a valid company", () => {
    const result = validateCompanySettings(VALID_COMPANY);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.document).toBe("11222333000181");
      expect(result.data.state).toBe("SP");
      expect(result.data.zipCode).toBe("01001000");
      expect(result.data.phone).toBe("11988887777");
    }
  });

  it("rejects an invalid cnpj", () => {
    const result = validateCompanySettings({ ...VALID_COMPANY, document: "11.222.333/0001-82" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.document).toBe("CNPJ inválido.");
    }
  });

  it("requires the company type and tax regime", () => {
    const result = validateCompanySettings({
      ...VALID_COMPANY,
      companyType: "desconhecido",
      taxRegime: "",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.companyType).toBeDefined();
      expect(result.errors.taxRegime).toBeDefined();
    }
  });

  it("rejects malformed optional fields", () => {
    const result = validateCompanySettings({
      ...VALID_COMPANY,
      email: "sem-arroba",
      phone: "123",
      state: "SPX",
      zipCode: "123",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.email).toBeDefined();
      expect(result.errors.phone).toBeDefined();
      expect(result.errors.state).toBeDefined();
      expect(result.errors.zipCode).toBeDefined();
    }
  });

  it("accepts an empty optional address", () => {
    const result = validateCompanySettings({
      ...VALID_COMPANY,
      street: "",
      number: "",
      district: "",
      city: "",
      state: "",
      zipCode: "",
      email: "",
      phone: "",
      cnae: "",
    });

    expect(result.ok).toBe(true);
  });
});

describe("validateTaxSettings", () => {
  it("normalizes a percentage tax", () => {
    const result = validateTaxSettings({
      name: "Simples Nacional",
      kind: "percentual",
      rate: "6,5",
      amount: "",
      notes: "",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.rate).toBe("6.500000");
      expect(result.data.amountCents).toBeNull();
    }
  });

  it("normalizes a fixed tax", () => {
    const result = validateTaxSettings({
      name: "Taxa fixa",
      kind: "fixo",
      rate: "",
      amount: "12,90",
      notes: "por nota",
    });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.amountCents).toBe(1290);
      expect(result.data.rate).toBeNull();
    }
  });

  it("requires a value for the chosen kind", () => {
    const result = validateTaxSettings({
      name: "ICMS",
      kind: "percentual",
      rate: "abc",
      amount: "10,00",
    });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.rate).toBeDefined();
    }
  });

  it("rejects unknown kinds and short names", () => {
    const result = validateTaxSettings({ name: "a", kind: "outro", rate: "1", amount: "" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
      expect(result.errors.kind).toBeDefined();
    }
  });
});
