import { assertRowDeleted, mapDeleteError } from "@/services/supabase/deleteErrors";

describe("mapDeleteError", () => {
  it("traduz violação de chave estrangeira em mensagem de registro em uso", () => {
    const message = mapDeleteError({ code: "23503" }, "o produto");

    expect(message).toBe(
      "Não é possível excluir: o produto está em uso ou possui registros vinculados.",
    );
  });

  it("traduz erros genéricos com o código devolvido", () => {
    const message = mapDeleteError({ code: "42501" }, "o canal de venda");

    expect(message).toBe("Não foi possível excluir o canal de venda. (código 42501)");
  });

  it("informa código desconhecido quando o Supabase não devolve código", () => {
    const message = mapDeleteError({}, "o insumo");

    expect(message).toBe("Não foi possível excluir o insumo. (código desconhecido)");
  });
});

describe("assertRowDeleted", () => {
  it("não lança quando a exclusão devolveu a linha removida", () => {
    expect(() => assertRowDeleted([{ id: "abc" }], "o produto")).not.toThrow();
  });

  it("lança quando nenhuma linha foi removida (RLS sem DELETE ou registro ausente)", () => {
    expect(() => assertRowDeleted([], "o produto")).toThrow(
      "Não foi possível excluir o produto: registro não encontrado ou sem permissão para excluir.",
    );
  });

  it("lança quando o Supabase devolveu null", () => {
    expect(() => assertRowDeleted(null, "a despesa fixa")).toThrow(
      "Não foi possível excluir a despesa fixa: registro não encontrado ou sem permissão para excluir.",
    );
  });

  it("lança quando o retorno não é uma lista", () => {
    expect(() => assertRowDeleted(undefined, "o insumo")).toThrow(
      "Não foi possível excluir o insumo: registro não encontrado ou sem permissão para excluir.",
    );
  });
});
