import { supabase } from "@/integrations/supabase/client";

const STORAGE_KEY = "sresramassas_unavailable_ingredients";

/**
 * Mapeamentos de chaves legadas para compatibilidade retroativa
 */
const LEGACY_ALIASES: Record<string, string> = {
  "azeitona preta": "azeitona comum",
};

/**
 * Normaliza uma chave de estoque para comparação segura e consistente
 */
export function normalizeStockKey(key: string): string {
  if (!key) return "";
  const cleaned = key
    .trim()
    .toLowerCase()
    .replace(/[—–]/g, "-") // Transforma em-dash e en-dash em hífen padrão
    .replace(/\s+/g, " ");
  return LEGACY_ALIASES[cleaned] || cleaned;
}

/**
 * Verifica se um item está indisponível na lista
 */
export function isItemUnavailable(
  identifiers: string | (string | undefined | null)[] | undefined | null,
  unavailableList: string[]
): boolean {
  if (!identifiers || !unavailableList || unavailableList.length === 0) return false;
  const list = Array.isArray(identifiers) ? identifiers : [identifiers];
  const targets = list
    .filter((id): id is string => Boolean(id && typeof id === "string" && id.trim().length > 0))
    .map(normalizeStockKey);

  if (targets.length === 0) return false;

  return unavailableList.some((item) => {
    const norm = normalizeStockKey(item);
    return targets.includes(norm);
  });
}

/**
 * Remove todas as variações/apelidos de um item da lista de indisponíveis
 */
export function removeItemFromUnavailable(
  identifiers: string | (string | undefined | null)[] | undefined | null,
  unavailableList: string[]
): string[] {
  if (!unavailableList || unavailableList.length === 0) return [];
  if (!identifiers) return [...unavailableList];

  const list = Array.isArray(identifiers) ? identifiers : [identifiers];
  const targetSet = new Set(
    list
      .filter((id): id is string => Boolean(id && typeof id === "string" && id.trim().length > 0))
      .map(normalizeStockKey)
  );

  return unavailableList.filter((item) => !targetSet.has(normalizeStockKey(item)));
}

/**
 * Adiciona um item à lista de indisponíveis com seu ID canônico, limpando apelidos antigos
 */
export function addItemToUnavailable(
  canonicalId: string,
  allItemIdentifiers: string | (string | undefined | null)[] | undefined | null,
  unavailableList: string[]
): string[] {
  const cleaned = removeItemFromUnavailable(allItemIdentifiers, unavailableList);
  return Array.from(new Set([...cleaned, canonicalId.trim()]));
}

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

// Timestamp do último salvamento iniciado localmente
let lastLocalSaveTimestamp = 0;

// Fila serializada de salvamento para evitar race conditions no Supabase
let isSaving = false;
let pendingSave: string[] | null = null;
const savingListeners = new Set<(saving: boolean) => void>();

function notifySaving(status: boolean) {
  savingListeners.forEach((fn) => {
    try {
      fn(status);
    } catch {}
  });
}

export function onStockSavingChange(listener: (saving: boolean) => void): () => void {
  savingListeners.add(listener);
  listener(isSaving);
  return () => {
    savingListeners.delete(listener);
  };
}

export function getLastLocalSaveTimestamp(): number {
  return lastLocalSaveTimestamp;
}

export function isRecentLocalEdit(windowMs = 3000): boolean {
  return Date.now() - lastLocalSaveTimestamp < windowMs;
}

/**
 * Busca a lista atualizada de estoque diretamente da tabela do Supabase
 */
export async function fetchUnavailableIngredients(): Promise<string[]> {
  // Se o usuário acabou de alterar algo localmente, não sobrescrevemos com dados que podem estar desatualizados em trânsito
  if (isRecentLocalEdit(3000)) {
    return getStoredUnavailableIngredients();
  }

  try {
    const { data, error } = await (supabase as any)
      .from("stock_settings")
      .select("unavailable_items")
      .eq("id", "unavailable_ingredients")
      .maybeSingle();

    if (!error && data && Array.isArray(data.unavailable_items)) {
      const list = data.unavailable_items as string[];
      if (!isRecentLocalEdit(3000)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
        }
        return list;
      }
    }
  } catch (err) {
    console.error("Erro ao buscar estoque do Supabase:", err);
  }
  return getStoredUnavailableIngredients();
}

/**
 * Salva a lista de ingredientes esgotados no banco do Supabase e no Realtime via fila atômica
 */
export async function saveUnavailableIngredients(unavailable: string[]): Promise<void> {
  lastLocalSaveTimestamp = Date.now();

  // 1. Atualização otimista e imediata no localStorage
  if (typeof window !== "undefined") {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(unavailable));
    } catch {}
  }

  // 2. Se já estiver salvando, apenas atualiza o ponteiro de próximo salvamento
  if (isSaving) {
    pendingSave = unavailable;
    return;
  }

  isSaving = true;
  notifySaving(true);

  try {
    let currentToSave: string[] | null = unavailable;

    while (currentToSave !== null) {
      const dataToSave = currentToSave;
      currentToSave = null;
      pendingSave = null;

      // Upsert no banco Supabase
      const { error } = await (supabase as any).from("stock_settings").upsert(
        {
          id: "unavailable_ingredients",
          unavailable_items: dataToSave,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "id" },
      );

      if (error) {
        console.error("Erro ao persistir estoque no Supabase:", error);
        // Retry único rápido
        await new Promise((r) => setTimeout(r, 500));
        await (supabase as any).from("stock_settings").upsert(
          {
            id: "unavailable_ingredients",
            unavailable_items: dataToSave,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "id" },
        );
      }

      // Notifica canais de broadcast para outros clientes conectados
      try {
        const channel = supabase.channel("stock-events");
        channel.subscribe((status) => {
          if (status === "SUBSCRIBED") {
            void channel.send({
              type: "broadcast",
              event: "stock_update",
              payload: { unavailable: dataToSave },
            });
          }
        });
      } catch {}

      // Se durante o upsert o usuário fez outro clique, processa a lista mais recente
      if (pendingSave !== null) {
        currentToSave = pendingSave;
        pendingSave = null;
      }
    }
  } finally {
    isSaving = false;
    notifySaving(false);
  }
}

/**
 * Inscreve um componente para receber atualizações de estoque em tempo real
 * (ignora ecos de alterações feitas localmente pelo próprio usuário nos últimos 3 segundos)
 */
export function subscribeToStockRealtime(
  channelName: string,
  onUpdate: (unavailableList: string[]) => void,
): () => void {
  const channel = supabase
    .channel(channelName)
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "stock_settings" },
      (payload) => {
        // Echo suppression: se foi alterado localmente nos últimos 3 segundos, ignora eco
        if (isRecentLocalEdit(3000)) return;

        const row = payload.new as { unavailable_items?: string[] } | undefined;
        if (row?.unavailable_items && Array.isArray(row.unavailable_items)) {
          if (typeof window !== "undefined") {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(row.unavailable_items));
          }
          onUpdate(row.unavailable_items);
        }
      },
    )
    .on("broadcast", { event: "stock_update" }, (payload: { [key: string]: unknown }) => {
      if (isRecentLocalEdit(3000)) return;

      const payloadData = payload["payload"] as { unavailable?: string[] } | undefined;
      if (payloadData?.unavailable && Array.isArray(payloadData.unavailable)) {
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payloadData.unavailable));
        }
        onUpdate(payloadData.unavailable);
      }
    })
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
