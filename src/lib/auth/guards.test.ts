import {
  HOME_ROUTE,
  LOGIN_ROUTE,
  isPublicRoute,
  resolveRedirect,
  validateLoginInput,
} from "./guards";

describe("isPublicRoute", () => {
  it("treats the login route as public", () => {
    expect(isPublicRoute(LOGIN_ROUTE)).toBe(true);
    expect(isPublicRoute("/login/recuperar")).toBe(true);
  });

  it("treats dashboard routes as private", () => {
    expect(isPublicRoute("/home")).toBe(false);
    expect(isPublicRoute("/insumos")).toBe(false);
  });
});

describe("resolveRedirect", () => {
  it("sends anonymous users to login", () => {
    expect(resolveRedirect({ hasSession: false, pathname: "/home" })).toBe(LOGIN_ROUTE);
    expect(resolveRedirect({ hasSession: false, pathname: "/" })).toBe(LOGIN_ROUTE);
  });

  it("keeps anonymous users on the login page", () => {
    expect(resolveRedirect({ hasSession: false, pathname: LOGIN_ROUTE })).toBeNull();
  });

  it("keeps anonymous users on the sign out route", () => {
    expect(resolveRedirect({ hasSession: false, pathname: "/auth/signout" })).toBeNull();
  });

  it("allows sign out even with an active session", () => {
    expect(resolveRedirect({ hasSession: true, pathname: "/auth/signout" })).toBeNull();
  });

  it("sends authenticated users away from login", () => {
    expect(resolveRedirect({ hasSession: true, pathname: LOGIN_ROUTE })).toBe(HOME_ROUTE);
  });

  it("lets authenticated users reach private routes", () => {
    expect(resolveRedirect({ hasSession: true, pathname: "/home" })).toBeNull();
  });
});

describe("validateLoginInput", () => {
  it("normalizes the email", () => {
    expect(validateLoginInput({ email: "  Admin@Example.COM ", password: "secret123" })).toEqual({
      valid: true,
      email: "admin@example.com",
    });
  });

  it("rejects malformed emails", () => {
    const result = validateLoginInput({ email: "admin@", password: "secret123" });

    expect(result.valid).toBe(false);
  });

  it("rejects short passwords", () => {
    const result = validateLoginInput({ email: "admin@example.com", password: "123" });

    expect(result.valid).toBe(false);
  });
});
