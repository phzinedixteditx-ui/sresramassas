import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { changeStockAvailability, type StockRow } from "./stock-repository";
import { MIXED_SAUCE_PRICE } from "./menu";

describe("estoque persistente", () => {
  test("marcar esgotado mantém outros itens e pode ser lido novamente", async () => {
    let row: StockRow | null = { unavailable_items: ["Bacon"], updated_at: "1" };
    const adapter = {
      read: async () => row,
      write: async (items: string[]) => { row = { unavailable_items: items, updated_at: "2" }; return true; },
    };
    assert.deepEqual(await changeStockAvailability(adapter, "Tomate", true), ["Bacon", "Tomate"]);
    assert.deepEqual((await adapter.read())?.unavailable_items, ["Bacon", "Tomate"]);
    assert.deepEqual(await changeStockAvailability(adapter, "Tomate", false), ["Bacon"]);
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
    assert.deepEqual(result, ["Bacon", "Tomate"]);
  });
  test("erro de salvamento não vira confirmação de sucesso", async () => {
    await assert.rejects(changeStockAvailability({ read: async () => null, write: async () => { throw new Error("Falha ao salvar"); } }, "Tomate", true), /Falha ao salvar/);
  });
});

test("molho misturado tem acréscimo de zero reais", () => {
  assert.equal(MIXED_SAUCE_PRICE, 0);
});