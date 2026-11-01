import { parseProfile } from "./auth";

describe("parseProfile", () => {
  it("maps a valid row", () => {
    expect(
      parseProfile({ full_name: "  Maria Silva ", role: "administrador", is_active: true }),
    ).toEqual({ fullName: "Maria Silva", role: "administrador", isActive: true });
  });

  it("accepts the operator role", () => {
    const profile = parseProfile({ full_name: "João", role: "operador", is_active: false });

    expect(profile?.role).toBe("operador");
    expect(profile?.isActive).toBe(false);
  });

  it("rejects unknown roles", () => {
    expect(parseProfile({ full_name: "João", role: "root", is_active: true })).toBeNull();
  });

  it("rejects missing or too short names", () => {
    expect(parseProfile({ role: "operador", is_active: true })).toBeNull();
    expect(parseProfile({ full_name: " J ", role: "operador", is_active: true })).toBeNull();
  });

  it("rejects non boolean activation flags", () => {
    expect(parseProfile({ full_name: "João", role: "operador", is_active: "yes" })).toBeNull();
  });

  it("rejects empty rows", () => {
    expect(parseProfile(null)).toBeNull();
    expect(parseProfile(undefined)).toBeNull();
  });
});
