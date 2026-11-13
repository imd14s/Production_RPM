import { translateAuthError } from "./messages";

describe("translateAuthError", () => {
  it("maps invalid credentials to a generic message", () => {
    expect(translateAuthError("Invalid login credentials")).toBe(
      "E-mail ou senha inválidos.",
    );
  });

  it("is case and whitespace insensitive", () => {
    expect(translateAuthError("  INVALID LOGIN CREDENTIALS ")).toBe(
      "E-mail ou senha inválidos.",
    );
  });

  it("maps unconfirmed email", () => {
    expect(translateAuthError("Email not confirmed")).toBe(
      "Confirme seu e-mail antes de entrar.",
    );
  });

  it("falls back to a safe message", () => {
    expect(translateAuthError("unexpected internal failure")).toBe(
      "Não foi possível entrar. Tente novamente.",
    );
  });
});
