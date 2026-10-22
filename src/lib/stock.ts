import { supabase } from "@/integrations/supabase/client";
import { changeStockAvailability, type StockRow } from "./stock-repository";

const STORAGE_KEY = "sresramassas_unavailable_ingredients";

/**
 * Lê a lista do localStorage imediatamente (para carregamento síncrono instantâneo sem piscar tela)
 */
export function getStoredUnavailableIngredients(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

/**
 * Busca a lista atualizada de estoque diretamente da tabela do Supabase
 */
export async function fetchUnavailableIngredients(): Promise<string[]> {
  try {
    const { data, error } = await (supabase as any)
      .from("stock_settings")
      .select("unavailable_items")
      .eq("id", "unavailable_ingredients")
      .maybeSingle();

    if (!error && data && Array.isArray(data.unavailable_items)) {
      const list = data.unavailable_items as string[];
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
      }
      return list;
    }
  } catch (err) {
    console.error("Erro ao buscar estoque do Supabase:", err);
  }
  return getStoredUnavailableIngredients();
}

/**
 * Salva a lista de ingredientes esgotados no banco do Supabase e no Realtime
 */
export async function saveIngredientAvailability(item: string, unavailable: boolean): Promise<string[]> {
  const table = () => (supabase as any).from("stock_settings");
  const list = await changeStockAvailability({
    read: async () => {
      const { data, error } = await table().select("unavailable_items, updated_at").eq("id", "unavailable_ingredients").maybeSingle();
      if (error) throw error;
      return data as StockRow | null;
    },
    write: async (items, previous) => {
      const row = { id: "unavailable_ingredients", unavailable_items: items, updated_at: new Date().toISOString() };
      const query = previous
        ? table().update(row).eq("id", row.id).eq("updated_at", previous.updated_at)
        : table().insert(row);
      const { data, error } = await query.select("id");
      if (error?.code === "23505") return false;
      if (error) throw error;
      if (!data?.length && previous) return false;
      if (!data?.length) throw new Error("Sem permissão para salvar estoque.");
      return true;
    },
  }, item, unavailable, getStoredUnavailableIngredients());
  cacheStock(list);
  return list;
}

function cacheStock(list: string[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch { /* Cache is optional. */ }
}

export function subscribeToStock(topic: string, onChange: (list: string[]) => void): () => void {
  let revision = 0;
  let active = true;
  const refresh = async () => {
    const version = ++revision;
    const list = await fetchUnavailableIngredients();
    if (active && version === revision) onChange(list);
  };
  onChange(getStoredUnavailableIngredients());
  void refresh();
  const channel = supabase.channel(topic).on("postgres_changes", {
    event: "*", schema: "public", table: "stock_settings", filter: "id=eq.unavailable_ingredients",
  }, (payload) => {
    const row = payload.new as Partial<StockRow>;
    if (!Array.isArray(row.unavailable_items)) return;
    revision++;
    cacheStock(row.unavailable_items);
    onChange(row.unavailable_items);
  }).subscribe((status) => { if (status === "SUBSCRIBED") void refresh(); });
  window.addEventListener("focus", refresh);
  const interval = window.setInterval(() => void refresh(), 30000);
  return () => {
    active = false;
    window.removeEventListener("focus", refresh);
    window.clearInterval(interval);
    void supabase.removeChannel(channel);
  };
}
