import { formatCnpj, formatPhone, formatZipCode } from "./format";

describe("formatCnpj", () => {
  it("formats a complete cnpj", () => {
    expect(formatCnpj("11222333000181")).toBe("11.222.333/0001-81");
  });

  it("formats partial values while typing", () => {
    expect(formatCnpj("1122")).toBe("11.22");
    expect(formatCnpj("11222333")).toBe("11.222.333");
  });

  it("ignores extra characters and letters", () => {
    expect(formatCnpj("11a2223330001819999")).toBe("11.222.333/0001-81");
  });
});

describe("formatZipCode", () => {
  it("formats the zip code", () => {
    expect(formatZipCode("01001000")).toBe("01001-000");
    expect(formatZipCode("01001")).toBe("01001");
  });
});

describe("formatPhone", () => {
  it("formats landline and mobile numbers", () => {
    expect(formatPhone("1133334444")).toBe("(11) 3333-4444");
    expect(formatPhone("11988887777")).toBe("(11) 98888-7777");
  });
});
