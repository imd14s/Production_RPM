import {
  NAVIGATION_ITEMS,
  buildNavigation,
  canSeeItem,
  countAvailableModules,
  isActiveRoute,
} from "./navigation";

describe("isActiveRoute", () => {
  it("matches the exact route", () => {
    expect(isActiveRoute("/home", "/home")).toBe(true);
  });

  it("matches sub routes", () => {
    expect(isActiveRoute("/produtos", "/produtos/123")).toBe(true);
  });

  it("does not match unrelated routes", () => {
    expect(isActiveRoute("/home", "/insumos")).toBe(false);
    expect(isActiveRoute("/produtos", "/produtos-antigos")).toBe(false);
  });
});

describe("canSeeItem", () => {
  const settings = NAVIGATION_ITEMS.find((item) => item.href === "/configuracoes")!;
  const home = NAVIGATION_ITEMS.find((item) => item.href === "/home")!;

  it("hides admin items from operators", () => {
    expect(canSeeItem(settings, "operador")).toBe(false);
  });

  it("shows admin items to administrators", () => {
    expect(canSeeItem(settings, "administrador")).toBe(true);
  });

  it("shows public items to everyone", () => {
    expect(canSeeItem(home, "operador")).toBe(true);
  });
});

describe("buildNavigation", () => {
  it("splits available and planned items", () => {
    const navigation = buildNavigation("operador");

    expect(navigation.available.map((item) => item.href)).toEqual(["/home"]);
    expect(navigation.planned.length).toBeGreaterThan(0);
  });

  it("hides planned admin settings from operators", () => {
    const navigation = buildNavigation("operador");

    expect(navigation.planned.some((item) => item.href === "/configuracoes")).toBe(false);
  });

  it("shows planned admin settings to administrators", () => {
    const navigation = buildNavigation("administrador");

    expect(navigation.planned.some((item) => item.href === "/configuracoes")).toBe(true);
  });
});

describe("countAvailableModules", () => {
  it("counts only available modules", () => {
    expect(countAvailableModules("administrador")).toBe(1);
  });
});
