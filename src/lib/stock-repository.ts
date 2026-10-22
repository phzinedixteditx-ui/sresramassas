export type StockRow = { unavailable_items: string[]; updated_at: string };
export type StockAdapter = {
  read: () => Promise<StockRow | null>;
  write: (items: string[], previous: StockRow | null) => Promise<boolean>;
};

// Compare-and-set keeps changes from different tabs from replacing each other.
export async function changeStockAvailability(
  adapter: StockAdapter,
  item: string,
  unavailable: boolean,
  initialItems: string[] = [],
): Promise<string[]> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const previous = await adapter.read();
    const items = previous?.unavailable_items ?? initialItems;
    const next = unavailable ? [...new Set([...items, item])] : items.filter((id) => id !== item);
    if (await adapter.write(next, previous)) return next;
  }
  throw new Error("O estoque mudou em outro painel. Tente novamente.");
}