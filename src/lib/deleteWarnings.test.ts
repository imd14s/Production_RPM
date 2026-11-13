import {
  buildProductWarnings,
  buildSimulationWarnings,
  buildSupplyWarnings,
  formatCountedRemoval,
} from "@/lib/deleteWarnings";

describe("formatCountedRemoval", () => {
  it("usa o singular quando há um registro", () => {
    expect(formatCountedRemoval(1, "custo registrado do produto", "custos registrados do produto")).toBe(
      "1 custo registrado do produto será apagado",
    );
  });

  it("usa o plural quando há mais de um registro", () => {
    expect(formatCountedRemoval(3, "custo registrado do produto", "custos registrados do produto")).toBe(
      "3 custos registrados do produto serão apagados",
    );
  });

  it("devolve texto vazio quando não há dependências", () => {
    expect(formatCountedRemoval(0, "custo registrado do produto", "custos registrados do produto")).toBe(
      "",
    );
  });
});

describe("buildSupplyWarnings", () => {
  it("avisa que a ficha técnica do produto deixa de usar o insumo", () => {
    expect(buildSupplyWarnings(["Vela"])).toEqual([
      "a ficha técnica do produto Vela deixa de usar este insumo",
    ]);
  });

  it("usa o plural quando mais de um produto usa o insumo", () => {
    expect(buildSupplyWarnings(["Vela", "Sabonete"])).toEqual([
      "as fichas técnicas dos produtos Vela, Sabonete deixam de usar este insumo",
    ]);
  });

  it("não avisa quando nenhum produto usa o insumo", () => {
    expect(buildSupplyWarnings([])).toEqual([]);
  });
});

describe("buildProductWarnings", () => {
  it("avisa sobre custo registrado, simulações e uso como kit", () => {
    expect(
      buildProductWarnings({
        costSnapshotCount: 2,
        simulationCount: 1,
        kitNames: ["Kit Vela"],
      }),
    ).toEqual([
      "2 custos registrados do produto serão apagados",
      "1 simulação de precificação será apagada",
      "o produto sai da ficha técnica do kit Kit Vela",
    ]);
  });

  it("não avisa quando o produto não tem histórico nem uso como kit", () => {
    expect(
      buildProductWarnings({
        costSnapshotCount: 0,
        simulationCount: 0,
        kitNames: [],
      }),
    ).toEqual([]);
  });

  it("usa o plural de kits quando mais de um produto usa como componente", () => {
    const warnings = buildProductWarnings({
      costSnapshotCount: 0,
      simulationCount: 0,
      kitNames: ["Kit Vela", "Kit Presente"],
    });

    expect(warnings).toEqual([
      "o produto sai da ficha técnica dos kits Kit Vela, Kit Presente",
    ]);
  });
});

describe("buildSimulationWarnings", () => {
  it("avisa quantas simulações serão apagadas", () => {
    expect(buildSimulationWarnings(2)).toEqual([
      "2 simulações de precificação serão apagadas",
    ]);
  });

  it("não avisa quando não há simulações", () => {
    expect(buildSimulationWarnings(0)).toEqual([]);
  });
});
