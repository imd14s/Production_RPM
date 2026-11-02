import { validateSupplier } from "./suppliers";

const VALID_SUPPLIER = {
  name: "Tecidos Aurora",
  document: "11.222.333/0001-81",
  phone: "(11) 98888-7777",
  email: "contato@aurora.com.br",
  notes: "",
};

describe("validateSupplier", () => {
  it("normalizes a valid CNPJ supplier", () => {
    const result = validateSupplier(VALID_SUPPLIER);

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.name).toBe("Tecidos Aurora");
      expect(result.data.document).toBe("11222333000181");
      expect(result.data.phone).toBe("11988887777");
    }
  });

  it("accepts a valid CPF instead of CNPJ", () => {
    const result = validateSupplier({ ...VALID_SUPPLIER, document: "111.444.777-35" });

    expect(result.ok).toBe(true);

    if (result.ok) {
      expect(result.data.document).toBe("11144477735");
    }
  });

  it("allows an empty document for informal purchases", () => {
    const result = validateSupplier({
      name: "Feira do bairro",
      document: "",
      phone: "",
      email: "",
      notes: "",
    });

    expect(result.ok).toBe(true);
  });

  it("rejects invalid check digits", () => {
    const cnpj = validateSupplier({ ...VALID_SUPPLIER, document: "11.222.333/0001-80" });

    expect(cnpj.ok).toBe(false);

    if (!cnpj.ok) {
      expect(cnpj.errors.document).toBeDefined();
    }

    const cpf = validateSupplier({ ...VALID_SUPPLIER, document: "111.444.777-34" });

    expect(cpf.ok).toBe(false);

    if (!cpf.ok) {
      expect(cpf.errors.document).toBeDefined();
    }

    const short = validateSupplier({ ...VALID_SUPPLIER, document: "999" });

    expect(short.ok).toBe(false);
  });

  it("rejects invalid phone and email", () => {
    const phone = validateSupplier({ ...VALID_SUPPLIER, phone: "11988887777" });

    expect(phone.ok).toBe(true); // 11 dígitos com DDD

    const badPhone = validateSupplier({ ...VALID_SUPPLIER, phone: "88887877" });

    expect(badPhone.ok).toBe(false);

    if (!badPhone.ok) {
      expect(badPhone.errors.phone).toBeDefined();
    }

    const badEmail = validateSupplier({ ...VALID_SUPPLIER, email: "sem-arroba" });

    expect(badEmail.ok).toBe(false);

    if (!badEmail.ok) {
      expect(badEmail.errors.email).toBeDefined();
    }
  });

  it("requires a name", () => {
    const result = validateSupplier({ ...VALID_SUPPLIER, name: "a" });

    expect(result.ok).toBe(false);

    if (!result.ok) {
      expect(result.errors.name).toBeDefined();
    }
  });
});
