import { formatCents, formatCentsInput, parseAmountToCents } from "./money";

describe("parseAmountToCents", () => {
  it("parses brazilian format", () => {
    expect(parseAmountToCents("1.234,56")).toBe(123456);
  });

  it("parses dot as decimal separator", () => {
    expect(parseAmountToCents("1234.56")).toBe(123456);
  });

  it("parses integers as whole reais", () => {
    expect(parseAmountToCents("1234")).toBe(123400);
    expect(parseAmountToCents("0")).toBe(0);
  });

  it("accepts currency symbol and spaces", () => {
    expect(parseAmountToCents("R$ 12,90")).toBe(1290);
  });

  it("treats a single digit after comma as decimals", () => {
    expect(parseAmountToCents("12,3")).toBe(1230);
  });

  it("treats three digits after dot as thousands", () => {
    expect(parseAmountToCents("1.234")).toBe(123400);
  });

  it("rejects empty and non numeric input", () => {
    expect(parseAmountToCents("")).toBeNull();
    expect(parseAmountToCents("   ")).toBeNull();
    expect(parseAmountToCents("abc")).toBeNull();
    expect(parseAmountToCents("-10,00")).toBeNull();
  });
});

describe("formatCents", () => {
  it("formats cents as brazilian currency", () => {
    expect(formatCents(123456)).toBe("R$ 1.234,56");
    expect(formatCents(0)).toBe("R$ 0,00");
    expect(formatCents(5)).toBe("R$ 0,05");
  });

  it("formats negative values", () => {
    expect(formatCents(-2590)).toBe("-R$ 25,90");
  });
});

describe("formatCentsInput", () => {
  it("formats cents for form fields", () => {
    expect(formatCentsInput(123456)).toBe("1234,56");
    expect(formatCentsInput(0)).toBe("0,00");
  });
});
