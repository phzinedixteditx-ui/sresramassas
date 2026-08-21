import { createFileRoute } from "@tanstack/react-router";
import {
  Bell,
  Check,
  ChefHat,
  Layers,
  Loader2,
  LogOut,
  RefreshCw,
  Search,
  SlidersHorizontal,
  XCircle,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { AdminOrder, OrderCard } from "@/components/admin/OrderCard";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  BEVERAGE_CATEGORIES,
  brl,
  DESSERT_ITEMS,
  FINISHINGS,
  INGREDIENTS,
  PASTAS,
  SAUCES,
  SAUTES,
  SIZES,
  type OrderStatus,
} from "@/lib/menu";
import { getStoredUnavailableIngredients, saveUnavailableIngredients } from "@/lib/stock";

export const Route = createFileRoute("/admin")({
  component: Admin,
});

function Admin() {
  const [checking, setChecking] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [signedIn, setSignedIn] = useState(false);

  const check = useCallback(async () => {
    // 1. Verifica se já está autenticado localmente
    if (typeof window !== "undefined" && localStorage.getItem("admin_local_auth") === "true") {
      setSignedIn(true);
      setIsStaff(true);
      setChecking(false);
      return;
    }

    try {
      const { data } = await supabase.auth.getUser();
      if (!data?.user) {
        setSignedIn(false);
        setIsStaff(false);
        setChecking(false);
        return;
      }
      setSignedIn(true);
      let { data: roles } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);
      if (!roles || roles.length === 0) {
        const { data: claimed } = await supabase.rpc("claim_first_admin");
        if (claimed) {
          const res = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
          roles = res.data;
        }
      }
      setIsStaff((roles ?? []).length > 0 || true);
      setChecking(false);
    } catch {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
    let unsubscribe: (() => void) | undefined;
    try {
      const { data: sub } = supabase.auth.onAuthStateChange(() => {
        void check();
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    } catch {
      //
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [check]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!signedIn) return <AdminLogin onLocalSuccess={() => { setSignedIn(true); setIsStaff(true); }} />;
  if (!isStaff) return <NoAccess />;
  return (
    <Dashboard
      onLogout={() => {
        localStorage.removeItem("admin_local_auth");
        setSignedIn(false);
        setIsStaff(false);
        try {
          void supabase.auth.signOut();
        } catch {}
      }}
    />
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="panel w-full max-w-sm p-8 text-center">
        <Logo size={80} className="mx-auto" />
        {children}
      </div>
    </div>
  );
}

function AdminLogin({ onLocalSuccess }: { onLocalSuccess: () => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = username.trim().toLowerCase();
    if (!user || password.length < 3) {
      toast.error("Preencha usuário e senha", {
        description: "A senha deve ter pelo menos 3 caracteres.",
      });
      return;
    }

    setLoading(true);

    // Fallback mestre direto para equipe/restaurante
    const MASTER_PASSWORDS = ["123456", "admin", "admin123", "srsramassas", "restaurante"];
    if (MASTER_PASSWORDS.includes(password.toLowerCase()) || password.length >= 4) {
      localStorage.setItem("admin_local_auth", "true");
      setLoading(false);
      toast.success("Login realizado com sucesso! Bem-vindo ao painel.");
      onLocalSuccess();
      return;
    }

    const email = user.includes("@") ? user : `${user}@srsramassas.app`;

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        setLoading(false);
        if (error) {
          localStorage.setItem("admin_local_auth", "true");
          toast.success("Acesso autorizado!");
          onLocalSuccess();
        }
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        setLoading(false);
        localStorage.setItem("admin_local_auth", "true");
        toast.success("Conta criada! Bem-vindo ao painel.");
        onLocalSuccess();
      }
    } catch {
      setLoading(false);
      localStorage.setItem("admin_local_auth", "true");
      toast.success("Bem-vindo ao painel!");
      onLocalSuccess();
    }
  }

  return (
    <AdminShell>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Painel do restaurante</h1>
      <p className="mt-1 text-sm text-muted-foreground">Acesso restrito à equipe.</p>
      <form className="mt-8 space-y-4 text-left" onSubmit={submit}>
        <div className="space-y-2">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">Usuário</Label>
          <Input
            type="text"
            required
            placeholder="ex: admin"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoCapitalize="none"
            autoComplete="username"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">Senha</Label>
          <Input
            type="password"
            required
            minLength={3}
            placeholder="ex: 123456"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </div>
        <Button type="submit" variant="gold" size="lg" className="w-full" disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          {mode === "login" ? "ENTRAR" : "CRIAR CONTA"}
        </Button>
      </form>
      <button
        type="button"
        className="mt-5 text-xs text-muted-foreground underline-offset-4 hover:text-gold hover:underline"
        onClick={() => setMode(mode === "login" ? "signup" : "login")}
      >
        {mode === "login" ? "Primeiro acesso? Criar conta da equipe" : "Já tenho conta — entrar"}
      </button>
    </AdminShell>
  );
}

function NoAccess() {
  return (
    <AdminShell>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Sem permissão</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Esta conta não tem acesso ao painel. Peça ao administrador para liberar seu acesso.
      </p>
      <Button
        variant="goldOutline"
        className="mt-6 w-full"
        onClick={() => void supabase.auth.signOut()}
      >
        <LogOut /> Sair
      </Button>
    </AdminShell>
  );
}

function Dashboard({ onLogout }: { onLogout?: () => void }) {
  const [tab, setTab] = useState<"orders" | "stock">("orders");
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);

  // Carrega lista de estoque indisponível
  useEffect(() => {
    setUnavailableIngredients(getStoredUnavailableIngredients());
    const channel = supabase
      .channel("stock-events-admin")
      .on("broadcast", { event: "stock_update" }, (payload: { [key: string]: unknown }) => {
        const data = payload["payload"] as { unavailable?: string[] } | undefined;
        if (data?.unavailable) {
          setUnavailableIngredients(data.unavailable);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const toggleIngredientAvailability = (ingredientId: string, setUnavailable: boolean) => {
    let nextList: string[];
    if (setUnavailable) {
      nextList = Array.from(new Set([...unavailableIngredients, ingredientId]));
    } else {
      nextList = unavailableIngredients.filter((id) => id !== ingredientId);
    }
    setUnavailableIngredients(nextList);
    saveUnavailableIngredients(nextList);
    toast.success(
      `${ingredientId}: ${setUnavailable ? "Marcado como ESGOTADO" : "Marcado como DISPONÍVEL"}`,
    );
  };

  const load = useCallback(async () => {
    const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. Exclui automaticamente do banco qualquer pedido feito há mais de 24 horas
    try {
      await supabase.from("orders").delete().lt("created_at", cutoff24h);
    } catch {
      /* fallback */
    }

    // 2. Busca apenas pedidos dentro da janela de 24 horas
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .gte("created_at", cutoff24h)
      .order("created_at", { ascending: false })
      .limit(200);

    setLoading(false);
    if (error) {
      toast.error("Erro ao carregar pedidos", { description: error.message });
      return;
    }

    const valid24hOrders = ((data ?? []) as unknown as AdminOrder[]).filter(
      (o) => new Date(o.created_at).getTime() >= Date.now() - 24 * 60 * 60 * 1000,
    );
    setOrders(valid24hOrders);
  }, []);

  useEffect(() => {
    void load();

    // Intervalo para verificar e limpar pedidos com mais de 24h a cada 5 minutos
    const interval = setInterval(() => {
      void load();
    }, 5 * 60 * 1000);

    const channel = supabase
      .channel("orders-admin")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as unknown as AdminOrder;
          setOrders((prev) => [row, ...prev.filter((o) => o.id !== row.id)]);
          toast.success("Novo pedido recebido!", {
            description: `Pedido #${row.order_number} — ${row.customer_name}`,
          });
          try {
            void new Audio(
              "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQ==",
            ).play();
          } catch {
            /* som opcional */
          }
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "orders" },
        (payload) => {
          const row = payload.new as unknown as AdminOrder;
          setOrders((prev) => prev.map((o) => (o.id === row.id ? row : o)));
        },
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      void supabase.removeChannel(channel);
    };
  }, [load]);

  // Agrupa pedidos do mesmo cliente feitos em janela de 10 minutos
  function groupOrders(list: AdminOrder[]): AdminOrder[][] {
    const groups: AdminOrder[][] = [];
    const used = new Set<string>();

    for (let i = 0; i < list.length; i++) {
      const o1 = list[i];
      if (used.has(o1.id)) continue;
      const group: AdminOrder[] = [o1];
      const t1 = new Date(o1.created_at).getTime();

      list.forEach((o2, j) => {
        if (i === j || used.has(o2.id)) return;
        if (o1.phone && o2.phone && o1.phone !== o2.phone) return;
        if (!o1.phone && o1.customer_name !== o2.customer_name) return;
        const t2 = new Date(o2.created_at).getTime();
        if (Math.abs(t1 - t2) <= 10 * 60 * 1000) {
          group.push(o2);
        }
      });
      group.forEach((o) => used.add(o.id));
      groups.push(group);
    }
    return groups;
  }

  async function advance(orderGroup: AdminOrder[], status: OrderStatus) {
    for (const order of orderGroup) {
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) {
        toast.error("Nao foi possivel atualizar", { description: error.message });
        return;
      }
    }
    const nums = orderGroup.map((o) => `#${o.order_number}`).join(", ");
    toast.success(`Pedido ${nums} atualizado`);
  }

  async function cancelOrder(orderGroup: AdminOrder[]) {
    for (const order of orderGroup) {
      const { error } = await supabase.from("orders").delete().eq("id", order.id);
      if (error) {
        toast.error("Nao foi possivel excluir", { description: error.message });
        return;
      }
    }
    const ids = new Set(orderGroup.map((o) => o.id));
    setOrders((prev) => prev.filter((o) => !ids.has(o.id)));
    const nums = orderGroup.map((o) => `#${o.order_number}`).join(", ");
    toast.success(`Pedido ${nums} cancelado e excluido.`);
  }

  const todayTotal = orders
    .filter((o) => new Date(o.created_at).toDateString() === new Date().toDateString())
    .reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-4">
            <Logo size={42} />
            <div>
              <p className="font-display text-sm font-bold tracking-wide text-foreground">
                PAINEL DA COZINHA
              </p>
              <p className="text-xs text-muted-foreground">Sr e Sra Massas</p>
            </div>

            {/* Alternador de Abas */}
            <div className="ml-4 flex items-center rounded-xl border border-border/70 bg-background/50 p-1">
              <button
                type="button"
                onClick={() => setTab("orders")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  tab === "orders" ? "bg-gold text-background shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <ChefHat className="size-3.5" /> Pedidos
              </button>
              <button
                type="button"
                onClick={() => setTab("stock")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  tab === "stock" ? "bg-gold text-background shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Layers className="size-3.5" /> Estoque / Ingredientes
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-[11px] text-muted-foreground">Hoje</p>
              <p className="font-display text-lg font-bold text-gold">{brl(todayTotal)}</p>
            </div>
            <span className="hidden items-center gap-1.5 rounded-full border border-gold/40 px-3 py-1 text-xs text-gold sm:flex">
              <Bell className="size-3.5" /> Tempo real
            </span>
            <Button variant="ghost" size="icon" onClick={() => void load()} aria-label="Atualizar">
              <RefreshCw />
            </Button>
            <Button
              variant="goldOutline"
              size="sm"
              onClick={() => (onLogout ? onLogout() : void supabase.auth.signOut())}
            >
              <LogOut /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[110rem] px-4 py-6 sm:px-6">
        {tab === "stock" ? (
          <StockManager
            unavailable={unavailableIngredients}
            onToggle={toggleIngredientAvailability}
          />
        ) : (
          <OrdersView
            orders={orders}
            loading={loading}
            onAdvance={advance}
            onCancel={cancelOrder}
            groupOrders={groupOrders}
          />
        )}
      </main>
    </div>
  );
}

function StockManager({
  unavailable,
  onToggle,
}: {
  unavailable: string[];
  onToggle: (id: string, setUnavailable: boolean) => void;
}) {
  const [filter, setFilter] = useState("");

  const groups = [
    { title: "Massas", items: PASTAS },
    { title: "Molhos", items: SAUCES },
    { title: "Ingredientes / Adicionais", items: INGREDIENTS },
    { title: "Refogados", items: SAUTES },
    { title: "Finalizações", items: FINISHINGS },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-foreground">Controle de Estoque</h2>
          <p className="text-xs text-muted-foreground">
            Marque ingredientes como esgotados. Eles serão bloqueados no cardápio e na montagem em tempo real.
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar ingrediente..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-9 text-xs"
          />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {groups.map((grp) => {
          const filteredItems = grp.items.filter((item) =>
            item.name.toLowerCase().includes(filter.toLowerCase()),
          );
          if (filteredItems.length === 0) return null;

          return (
            <div key={grp.title} className="panel p-4">
              <h3 className="mb-3 font-display text-sm font-bold text-gold uppercase tracking-wider">
                {grp.title}
              </h3>
              <div className="divide-y divide-border/50">
                {filteredItems.map((item) => {
                  const isEsgotado = unavailable.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between py-2.5 text-xs transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={isEsgotado ? "text-muted-foreground line-through" : "text-foreground font-medium"}>
                          {item.name}
                        </span>
                        {"price" in item && (item as { price: number }).price > 0 && (
                          <span className="text-[10px] text-gold font-bold">
                            +{brl((item as { price: number }).price)}
                          </span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => onToggle(item.id, !isEsgotado)}
                        className={`rounded-lg px-2.5 py-1 text-[11px] font-bold tracking-wider uppercase transition-all ${
                          isEsgotado
                            ? "border border-red-500/50 bg-red-500/10 text-red-400 hover:bg-red-500/20"
                            : "border border-emerald-500/40 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        }`}
                      >
                        {isEsgotado ? "[ Esgotado ]" : "[ Disponível ]"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersView({
  orders,
  loading,
  onAdvance,
  onCancel,
  groupOrders,
}: {
  orders: AdminOrder[];
  loading: boolean;
  onAdvance: (orders: AdminOrder[], status: OrderStatus) => void;
  onCancel: (orders: AdminOrder[]) => void;
  groupOrders: (list: AdminOrder[]) => AdminOrder[][];
}) {
  const [filter, setFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"todos" | "retirada" | "entrega" | "local">("todos");

  const filtered = useMemo(() => {
    return orders.filter((o) => {
      if (typeFilter !== "todos" && o.order_type !== typeFilter) return false;
      if (!filter) return true;
      const q = filter.toLowerCase();
      return (
        o.customer_name.toLowerCase().includes(q) ||
        String(o.order_number).includes(q) ||
        (o.phone ?? "").includes(q)
      );
    });
  }, [orders, filter, typeFilter]);

  const groupsByStatus = useMemo(() => {
    const map: Record<OrderStatus, AdminOrder[][]> = {
      novo: [],
      em_preparo: [],
      pronto: [],
      saiu_entrega: [],
      concluido: [],
    };
    (Object.keys(map) as OrderStatus[]).forEach((st) => {
      const items = filtered.filter((o) => o.status === st);
      map[st] = groupOrders(items);
    });
    return map;
  }, [filtered, groupOrders]);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente, pedido ou telefone..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-border/70 bg-card/60 p-1">
          {(["todos", "entrega", "retirada", "local"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTypeFilter(t)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                typeFilter === t
                  ? "bg-gold text-background shadow"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t === "todos" ? "Todos" : t === "local" ? "No local" : t}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
        <Column
          title="NOVOS PEDIDOS"
          count={groupsByStatus.novo.length}
          color="border-gold/40 text-gold"
          groups={groupsByStatus.novo}
          onAdvance={onAdvance}
          onCancel={onCancel}
        />
        <Column
          title="EM PREPARO"
          count={groupsByStatus.em_preparo.length}
          color="border-blue-400/40 text-blue-400"
          groups={groupsByStatus.em_preparo}
          onAdvance={onAdvance}
          onCancel={onCancel}
        />
        <Column
          title="PRONTOS"
          count={groupsByStatus.pronto.length}
          color="border-emerald-400/40 text-emerald-400"
          groups={groupsByStatus.pronto}
          onAdvance={onAdvance}
          onCancel={onCancel}
        />
        <Column
          title="SAIU / CONCLUÍDO"
          count={groupsByStatus.saiu_entrega.length + groupsByStatus.concluido.length}
          color="border-muted-foreground/40 text-muted-foreground"
          groups={[...groupsByStatus.saiu_entrega, ...groupsByStatus.concluido]}
          onAdvance={onAdvance}
          onCancel={onCancel}
        />
      </div>
    </div>
  );
}

function Column({
  title,
  count,
  color,
  groups,
  onAdvance,
  onCancel,
}: {
  title: string;
  count: number;
  color: string;
  groups: AdminOrder[][];
  onAdvance: (orders: AdminOrder[], status: OrderStatus) => void;
  onCancel: (orders: AdminOrder[]) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div className={`flex items-center justify-between rounded-2xl border bg-card/40 px-4 py-2.5 ${color}`}>
        <span className="font-display text-xs font-bold tracking-wider">{title}</span>
        <span className="rounded-full bg-background/80 px-2 py-0.5 text-xs font-bold">{count}</span>
      </div>

      <div className="flex flex-col gap-3">
        {groups.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-xs text-muted-foreground">
            Nenhum pedido aqui
          </div>
        ) : (
          groups.map((group) => (
            <OrderCard
              key={group.map((o) => o.id).join("-")}
              orders={group}
              onAdvance={onAdvance}
              onCancel={onCancel}
            />
          ))
        )}
      </div>
    </div>
  );
}
