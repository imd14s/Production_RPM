import { buildDeleteConfirmation } from "@/lib/deleteConfirmation";

describe("buildDeleteConfirmation", () => {
  it("monta a confirmação simples quando não há dependências", () => {
    expect(buildDeleteConfirmation("insumo", "Cera Coco")).toBe(
      'Excluir insumo "Cera Coco" permanentemente? Esta ação não pode ser desfeita.',
    );
  });

  it("lista o que será removido junto com o registro", () => {
    const message = buildDeleteConfirmation("insumo", "Cera Coco", [
      "a ficha técnica do produto Vela deixa de usar este insumo",
    ]);

    expect(message).toBe(
      'Excluir insumo "Cera Coco" permanentemente? Esta ação não pode ser desfeita.\n\nO que também será removido:\n- a ficha técnica do produto Vela deixa de usar este insumo',
    );
  });

  it("lista todos os avisos quando há mais de um", () => {
    const message = buildDeleteConfirmation("produto", "Vela", [
      "1 custo registrado do produto será apagado",
      "2 simulações de precificação serão apagadas",
    ]);

    expect(message).toContain("- 1 custo registrado do produto será apagado");
    expect(message).toContain("- 2 simulações de precificação serão apagadas");
  });
});
