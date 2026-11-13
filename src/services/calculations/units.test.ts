import {
  convertQuantity,
  convertStandardQuantity,
  convertToBaseUnit,
  listConvertibleUnits,
} from "./units";

describe("convertQuantity", () => {
  it("converts using the factor", () => {
    expect(convertQuantity(2, 1000)).toBe(2000);
  });

  it("handles fractional factors", () => {
    expect(convertQuantity(1, 0.001)).toBe(0.001);
  });

  it("rejects invalid inputs", () => {
    expect(convertQuantity(0, 1000)).toBeNull();
    expect(convertQuantity(2, 0)).toBeNull();
    expect(convertQuantity(NaN, 1000)).toBeNull();
    expect(convertQuantity(2, NaN)).toBeNull();
  });
});

describe("convertStandardQuantity", () => {
  it("converts metric mass and volume units in both directions", () => {
    expect(convertStandardQuantity(2, "quilograma", "grama")).toBe(2000);
    expect(convertStandardQuantity(500, "grama", "quilograma")).toBe(0.5);
    expect(convertStandardQuantity(2, "litro", "mililitro")).toBe(2000);
    expect(convertStandardQuantity(500, "mililitro", "litro")).toBe(0.5);
  });

  it("keeps identical units and rejects incompatible units", () => {
    expect(convertStandardQuantity(3, "pacote", "pacote")).toBe(3);
    expect(convertStandardQuantity(2, "pacote", "unidade")).toBeNull();
    expect(convertStandardQuantity(2, "quilograma", "litro")).toBeNull();
    expect(convertStandardQuantity(0, "quilograma", "grama")).toBeNull();
  });

  it("base maior: litro recebe ml (menor convertido para maior)", () => {
    expect(convertStandardQuantity(500, "mililitro", "litro")).toBe(0.5);
    expect(convertStandardQuantity(5, "litro", "litro")).toBe(5);
  });

  it("base maior: grama recebe kg (maior convertido para menor)", () => {
    expect(convertStandardQuantity(2, "quilograma", "grama")).toBe(2000);
    expect(convertStandardQuantity(1, "grama", "grama")).toBe(1);
  });
});

describe("listConvertibleUnits", () => {
  it("oferece a unidade métrica equivalente", () => {
    expect(listConvertibleUnits("quilograma", null)).toEqual(["grama"]);
    expect(listConvertibleUnits("grama", null)).toEqual(["quilograma"]);
    expect(listConvertibleUnits("litro", null)).toEqual(["mililitro"]);
    expect(listConvertibleUnits("mililitro", null)).toEqual(["litro"]);
  });

  it("oferece unidade quando a caixa tem unidades informadas", () => {
    expect(listConvertibleUnits("caixa", 12)).toEqual(["unidade"]);
    expect(listConvertibleUnits("pacote", 5)).toEqual(["unidade"]);
  });

  it("não oferece unidade quando a caixa não tem unidades informadas", () => {
    expect(listConvertibleUnits("caixa", null)).toEqual([]);
  });

  it("não oferece alternativa para unidades sem equivalência", () => {
    expect(listConvertibleUnits("metro", null)).toEqual([]);
    expect(listConvertibleUnits("unidade", 10)).toEqual([]);
  });
});

describe("convertToBaseUnit", () => {
  it("mantém a quantidade quando a unidade é a base", () => {
    expect(convertToBaseUnit(0.3, "quilograma", "quilograma", null)).toBe(0.3);
  });

  it("converte para a unidade base métrica", () => {
    expect(convertToBaseUnit(300, "grama", "quilograma", null)).toBe(0.3);
    expect(convertToBaseUnit(500, "mililitro", "litro", null)).toBe(0.5);
    expect(convertToBaseUnit(1, "quilograma", "grama", null)).toBe(1000);
  });

  it("converte unidades de embalagem para a caixa", () => {
    expect(convertToBaseUnit(12, "unidade", "caixa", 12)).toBe(1);
    expect(convertToBaseUnit(6, "unidade", "caixa", 12)).toBe(0.5);
    expect(convertToBaseUnit(5, "unidade", "pacote", 10)).toBe(0.5);
  });

  it("arredonda para três casas decimais", () => {
    expect(convertToBaseUnit(1, "unidade", "caixa", 3)).toBe(0.333);
  });

  it("recusa conversão sem equivalência ou sem unidades por embalagem", () => {
    expect(convertToBaseUnit(2, "caixa", "unidade", 12)).toBeNull();
    expect(convertToBaseUnit(1, "unidade", "caixa", null)).toBeNull();
    expect(convertToBaseUnit(2, "quilograma", "litro", null)).toBeNull();
    expect(convertToBaseUnit(0, "grama", "quilograma", null)).toBeNull();
  });
});
