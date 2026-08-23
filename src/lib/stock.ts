import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "sresramassas_unavailable_ingredients";

/**
 * Lê a lista do localStorage imediatamente (para carregamento síncrono instantâneo sem piscar tela)
 */
export function getStoredUnavailableIngredients(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
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
export async function saveUnavailableIngredients(unavailable: string[]): Promise<void> {
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unavailable));
    } catch {}
  }

  // 1. Salva na tabela do Supabase (para persistir para qualquer cliente que abrir o site)
  try {
    await (supabase as any).from("stock_settings").upsert(
      {
        id: "unavailable_ingredients",
        unavailable_items: unavailable,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );
  } catch (err) {
    console.error("Erro ao persistir estoque no Supabase:", err);
  }

  // 2. Notifica em tempo real via broadcast do canal Supabase
  try {
    const channel = supabase.channel("stock-events");
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        void channel.send({
          type: "broadcast",
          event: "stock_update",
          payload: { unavailable },
        });
      }
    });
  } catch {}
}
