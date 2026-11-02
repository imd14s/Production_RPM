import { createsCompositionCycle } from "./cycle";

const EDGES = [
  { productId: "kit", componentProductId: "subproduto" },
  { productId: "subproduto", componentProductId: "blusa" },
  { productId: "blusa", componentProductId: "" }, // aresta sintética: blusa não tem produto
].filter((edge) => edge.componentProductId);

describe("createsCompositionCycle", () => {
  it("rejects a product choosing itself", () => {
    expect(createsCompositionCycle(EDGES, "blusa", "blusa")).toBe(true);
  });

  it("rejects a component that indirectly contains the target", () => {
    // kit contém subproduto; subproduto contém blusa → voltar blusa a criar ciclo
    expect(createsCompositionCycle(EDGES, "blusa", "subproduto")).toBe(true);
    expect(createsCompositionCycle(EDGES, "blusa", "kit")).toBe(true);
  });

  it("distinguishes unrelated products from a new indirect cycle", () => {
    expect(createsCompositionCycle(EDGES, "kit", "blusa")).toBe(false);
    expect(createsCompositionCycle(EDGES, "subproduto", "kit")).toBe(true);
  });

  it("works on an empty graph", () => {
    expect(createsCompositionCycle([], "novo-1", "novo-2")).toBe(false);
  });
});
