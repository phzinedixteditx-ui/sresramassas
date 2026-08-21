import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "sresramassas_unavailable_ingredients";

/**
 * Lê a lista de ingredientes esgotados do localStorage (e sincroniza via Supabase Channel)
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
 * Salva a lista de ingredientes esgotados e propaga para outros clientes via Realtime Channel
 */
export function saveUnavailableIngredients(unavailable: string[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(unavailable));
    // Notifica em tempo real via broadcast do canal Supabase
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
  } catch (err) {
    console.error("Erro ao salvar ingredientes esgotados:", err);
  }
}
