import { buildProductCostDetail } from "./productCostDetail";
import type {
  ProductCostDetailInput,
  ProductCostDetailSupply,
} from "./productCostDetail";

const CANDLE_SUPPLY: ProductCostDetailSupply = {
  id: "s-c vela",
  name: "Vela de cera",
  unit: "caixa",
  unitsPerPackage: 2,
  currentUnitCostCents: 1000,
};

const WICK_SUPPLY: ProductCostDetailSupply = {
  id: "s-pavio",
  name: "Pavio",
  unit: "unidade",
  unitsPerPackage: null,
  currentUnitCostCents: 150,
};

function buildInput(
  overrides: Partial<ProductCostDetailInput> = {},
): ProductCostDetailInput {
  return {
    product: {
      id: "p1",
      name: "Vela artesanal",
      laborMinutes: 30,
      energyCostCents: null,
      machineCostCents: null,
      finishingCostCents: null,
      failureRatePercent: null,
    },
    components: [
      {
        targetType: "supply",
        targetId: CANDLE_SUPPLY.id,
        quantity: 0.5,
        unitCostCents: CANDLE_SUPPLY.currentUnitCostCents,
      },
      {
        targetType: "supply",
        targetId: WICK_SUPPLY.id,
        quantity: 1,
        unitCostCents: WICK_SUPPLY.currentUnitCostCents,
      },
    ],
    supplies: new Map([
      [CANDLE_SUPPLY.id, CANDLE_SUPPLY],
      [WICK_SUPPLY.id, WICK_SUPPLY],
    ]),
    products: new Map(),
    materialCents: 650,
    laborCents: 3000,
    overheadCents: 0,
    totalCents: 3650,
    missing: [],
    ...overrides,
  };
}

describe("buildProductCostDetail", () => {
  it("shows the packaging supply in pieces with the cost of what was used", () => {
    const detail = buildProductCostDetail(buildInput());

    const candleLine = detail.lines[0];

    expect(candleLine.kind).toBe("insumo");
    expect(candleLine.label).toBe("Vela de cera");
    expect(candleLine.quantity).toBe(1);
    expect(candleLine.unit).toBe("unidade");
    expect(candleLine.costCents).toBe(500);
  });

  it("keeps the base unit when the supply has no packaging equivalence", () => {
    const detail = buildProductCostDetail(buildInput());

    const wickLine = detail.lines[1];

    expect(wickLine.quantity).toBe(1);
    expect(wickLine.unit).toBe("unidade");
    expect(wickLine.costCents).toBe(150);
  });

  it("keeps metric supplies in their base unit", () => {
    const resin: ProductCostDetailSupply = {
      id: "s-resina",
      name: "Resina",
      unit: "quilograma",
      unitsPerPackage: null,
      currentUnitCostCents: 4000,
    };

    const detail = buildProductCostDetail(
      buildInput({
        components: [
          {
            targetType: "supply",
            targetId: resin.id,
            quantity: 0.3,
            unitCostCents: resin.currentUnitCostCents,
          },
        ],
        supplies: new Map([[resin.id, resin]]),
        materialCents: 1200,
        totalCents: 4200,
      }),
    );

    expect(detail.lines[0].quantity).toBe(0.3);
    expect(detail.lines[0].unit).toBe("quilograma");
    expect(detail.lines[0].costCents).toBe(1200);
  });

  it("adds the failure, labor and overhead lines", () => {
    const detail = buildProductCostDetail(
      buildInput({
        product: {
          id: "p1",
          name: "Vela artesanal",
          laborMinutes: 30,
          energyCostCents: 200,
          machineCostCents: 100,
          finishingCostCents: 50,
          failureRatePercent: 10,
        },
        materialCents: 715,
        laborCents: 3000,
        overheadCents: 500,
        totalCents: 4565,
      }),
    );

    const byKind = new Map(detail.lines.map((line) => [line.kind, line]));

    expect(byKind.get("perda")?.costCents).toBe(65);
    expect(byKind.get("perda")?.quantity).toBe(10);
    expect(byKind.get("mao_de_obra")?.costCents).toBe(3000);
    expect(byKind.get("energia")?.costCents).toBe(200);
    expect(byKind.get("maquina")?.costCents).toBe(100);
    expect(byKind.get("acabamento")?.costCents).toBe(50);
    expect(byKind.get("despesas")?.costCents).toBe(500);
  });

  it("sums the lines into the manufacturing cost", () => {
    const detail = buildProductCostDetail(
      buildInput({
        product: {
          id: "p1",
          name: "Vela artesanal",
          laborMinutes: 30,
          energyCostCents: 200,
          machineCostCents: null,
          finishingCostCents: null,
          failureRatePercent: 10,
        },
        materialCents: 715,
        laborCents: 3000,
        overheadCents: 500,
        totalCents: 4415,
      }),
    );

    const sum = detail.lines.reduce(
      (total, line) => total + (line.costCents ?? 0),
      0,
    );

    expect(sum).toBe(detail.totalCents);
  });

  it("marks the supply without cost and omits the failure line", () => {
    const detail = buildProductCostDetail(
      buildInput({
        components: [
          {
            targetType: "supply",
            targetId: CANDLE_SUPPLY.id,
            quantity: 0.5,
            unitCostCents: null,
          },
        ],
        materialCents: null,
        laborCents: 3000,
        totalCents: null,
        missing: [CANDLE_SUPPLY.id],
      }),
    );

    expect(detail.lines[0].costCents).toBeNull();
    expect(detail.missing).toEqual(["Vela de cera"]);
    expect(detail.lines.some((line) => line.kind === "perda")).toBe(false);
    expect(detail.totalCents).toBeNull();
  });

  it("shows a subproduct component with the cost of the subproduct", () => {
    const detail = buildProductCostDetail(
      buildInput({
        components: [
          {
            targetType: "product",
            targetId: "p-kit",
            quantity: 2,
            unitCostCents: 2500,
          },
        ],
        products: new Map([["p-kit", { name: "Kit presente" }]]),
        materialCents: 5000,
        totalCents: 8000,
      }),
    );

    expect(detail.lines[0].kind).toBe("subproduto");
    expect(detail.lines[0].label).toBe("Kit presente");
    expect(detail.lines[0].quantity).toBe(2);
    expect(detail.lines[0].costCents).toBe(5000);
  });
});
