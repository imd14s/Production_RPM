import { parseSupplierRow } from "./parse";
import { buildSupplierPayload } from "./payload";

const SUPPLIER_ROW = {
  id: "a2b2c3d4-0000-4000-8000-000000000001",
  name: "Tecidos Aurora",
  document: "11222333000181",
  phone: "11988887777",
  email: "contato@aurora.com.br",
  is_active: true,
  notes: "Entrega às terças",
};

describe("parseSupplierRow", () => {
  it("maps snake case to camel case", () => {
    const supplier = parseSupplierRow(SUPPLIER_ROW);

    expect(supplier).toEqual({
      id: SUPPLIER_ROW.id,
      name: "Tecidos Aurora",
      document: "11222333000181",
      phone: "11988887777",
      email: "contato@aurora.com.br",
      isActive: true,
      notes: "Entrega às terças",
    });
  });

  it("tolerates null optional columns", () => {
    const supplier = parseSupplierRow({
      ...SUPPLIER_ROW,
      document: null,
      phone: null,
      email: null,
      notes: null,
    });

    expect(supplier?.document).toBe("");
    expect(supplier?.phone).toBe("");
    expect(supplier?.email).toBe("");
    expect(supplier?.notes).toBe("");
  });

  it("rejects broken rows", () => {
    expect(parseSupplierRow({ ...SUPPLIER_ROW, name: "" })).toBeNull();
    expect(parseSupplierRow({ ...SUPPLIER_ROW, is_active: "sim" })).toBeNull();
    expect(parseSupplierRow(null)).toBeNull();
  });
});

describe("buildSupplierPayload", () => {
  it("maps supplier fields to database columns", () => {
    const payload = buildSupplierPayload({
      name: "Tecidos Aurora",
      document: "11222333000181",
      phone: "11988887777",
      email: "contato@aurora.com.br",
      notes: "Entrega às terças",
    });

    expect(payload).toEqual({
      name: "Tecidos Aurora",
      document: "11222333000181",
      phone: "11988887777",
      email: "contato@aurora.com.br",
      notes: "Entrega às terças",
    });
  });

  it("never sends empty strings to nullable columns", () => {
    const payload = buildSupplierPayload({
      name: "Feira do bairro",
      document: "",
      phone: "",
      email: "",
      notes: "",
    });

    expect(payload.document).toBeNull();
    expect(payload.phone).toBeNull();
    expect(payload.email).toBeNull();
    expect(payload.notes).toBeNull();
  });
});
