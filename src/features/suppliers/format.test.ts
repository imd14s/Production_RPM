import { formatCnpj, formatPhone } from "@/features/settings/format";
import { formatCpfOrCnpj } from "./format";

describe("formatCpfOrCnpj", () => {
  it("masks as CPF while digits are few or exactly eleven", () => {
    expect(formatCpfOrCnpj("123456")).toBe("123.456");
    expect(formatCpfOrCnpj("12345678901")).toBe("123.456.789-01");
  });

  it("masks as CNPJ when digits pass eleven", () => {
    expect(formatCpfOrCnpj("112223330001")).toBe("11.222.333/0001");
    expect(formatCpfOrCnpj("11222333000181")).toBe(
      formatCnpj("11222333000181"),
    );
  });

  it("ignores pasted punctuation and limits length", () => {
    expect(formatCpfOrCnpj("123.456.789-01 ")).toBe("123.456.789-01");
    expect(formatCpfOrCnpj("1122233300018112233")).toHaveLength(
      "11.222.333/0001-81".length,
    );
  });
});

describe("formatPhone reexport", () => {
  it("keeps the shared phone mask working", () => {
    expect(formatPhone("11988887777")).toBe("(11) 98888-7777");
  });
});
