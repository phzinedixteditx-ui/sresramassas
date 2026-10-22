import { describe, expect, test } from "bun:test";
import { changeStockAvailability, type StockRow } from "./stock-repository";
import { MIXED_SAUCE_PRICE } from "./menu";

describe("estoque persistente", () => {
  test("marcar esgotado mantém outros itens e pode ser lido novamente", async () => {
    let row: StockRow | null = { unavailable_items: ["Bacon"], updated_at: "1" };
    const adapter = {
      read: async () => row,
      write: async (items: string[]) => { row = { unavailable_items: items, updated_at: "2" }; return true; },
    };
    expect(await changeStockAvailability(adapter, "Tomate", true)).toEqual(["Bacon", "Tomate"]);
    expect((await adapter.read())?.unavailable_items).toEqual(["Bacon", "Tomate"]);
    expect(await changeStockAvailability(adapter, "Tomate", false)).toEqual(["Bacon"]);
  });
  test("não perde alteração concorrente de outro painel", async () => {
    let row: StockRow = { unavailable_items: [], updated_at: "1" };
    let writes = 0;
    const result = await changeStockAvailability({
      read: async () => row,
      write: async (items) => {
        writes++;
        if (writes === 1) { row = { unavailable_items: ["Bacon"], updated_at: "2" }; return false; }
        row = { unavailable_items: items, updated_at: "3" }; return true;
      },
    }, "Tomate", true);
    expect(result).toEqual(["Bacon", "Tomate"]);
  });
  test("erro de salvamento não vira confirmação de sucesso", async () => {
    await expect(changeStockAvailability({ read: async () => null, write: async () => { throw new Error("Falha ao salvar"); } }, "Tomate", true)).rejects.toThrow("Falha ao salvar");
  });
});

test("molho misturado tem acréscimo de zero reais", () => {
  expect(MIXED_SAUCE_PRICE).toBe(0);
});