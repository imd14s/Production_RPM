import { describeRole } from "./auth";

describe("describeRole", () => {
  it("labels the administrator role", () => {
    expect(describeRole("administrador")).toBe("Administrador");
  });

  it("labels the operator role", () => {
    expect(describeRole("operador")).toBe("Operador");
  });
});
