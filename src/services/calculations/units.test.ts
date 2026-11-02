import {
  convertQuantity,
  convertStandardQuantity,
  getCompatibleStandardUnits,
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
});

describe("getCompatibleStandardUnits", () => {
  it("offers only the base unit and its metric equivalent", () => {
    expect(getCompatibleStandardUnits("grama")).toEqual(["grama", "quilograma"]);
    expect(getCompatibleStandardUnits("mililitro")).toEqual(["mililitro", "litro"]);
    expect(getCompatibleStandardUnits("metro")).toEqual(["metro"]);
    expect(getCompatibleStandardUnits("pacote")).toEqual(["pacote"]);
  });
});