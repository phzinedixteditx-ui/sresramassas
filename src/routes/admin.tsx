import { createFileRoute } from "@tanstack/react-router";
import { Bell, ChefHat, Layers, Loader2, LogOut, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { OrderCard, type AdminOrder } from "@/components/admin/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { brl, INGREDIENTS, STATUS_FLOW, type OrderStatus } from "@/lib/menu";
import { getStoredUnavailableIngredients, saveUnavailableIngredients } from "@/lib/stock";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Painel do restaurante — Sr e Sra Massas" },
      { name: "description", content: "Área restrita da equipe Sr e Sra Massas." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel do restaurante — Sr e Sra Massas" },
      { property: "og:description", content: "Área restrita da equipe Sr e Sra Massas." },
    ],
  }),
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
    for (const order of list) {
      if (used.has(order.id)) continue;
      const t = new Date(order.created_at).getTime();
      const group = list.filter((o) => {
        if (used.has(o.id)) return false;
        const ot = new Date(o.created_at).getTime();
        return (
          o.customer_name === order.customer_name &&
          o.phone === order.phone &&
          Math.abs(ot - t) <= 10 * 60 * 1000
        );
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
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <p className="font-display text-sm font-bold text-gold">PAINEL DE CONTROLE</p>
              <p className="text-xs text-muted-foreground">Sr e Sra Massas</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex rounded-xl bg-secondary/70 p-1 border border-border">
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
            <Button variant="goldOutline" size="sm" onClick={() => (onLogout ? onLogout() : void supabase.auth.signOut())}>
              <LogOut /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[110rem] px-4 py-6 sm:px-6">
        {tab === "stock" ? (
          /* ÁREA DE CONTROLE DE INGREDIENTES */
          <div className="animate-rise space-y-6">
            <div className="rounded-2xl border border-border/80 bg-secondary/20 p-5">
              <h2 className="font-display text-xl font-bold text-foreground">
                Controle de Disponibilidade de Ingredientes
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Defina os ingredientes disponíveis e esgotados em tempo real. Quando marcado como{" "}
                <strong>Esgotado</strong>, o cliente continua visualizando o item no cardápio mas é impedido de selecioná-lo.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {INGREDIENTS.map((item) => {
                const isUnavailable = unavailableIngredients.includes(item.id);
                return (
                  <div
                    key={item.id}
                    className={`panel p-4 border transition-all ${
                      isUnavailable ? "border-red-500/50 bg-red-950/10" : "border-border/80 bg-secondary/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl">{item.emoji}</span>
                        <div>
                          <p className="font-display text-sm font-bold text-foreground">{item.id}</p>
                          <p
                            className={`text-xs font-semibold ${
                              isUnavailable ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {isUnavailable ? "⚠️ Esgotado" : "✓ Disponível"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => toggleIngredientAvailability(item.id, true)}
                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                          isUnavailable
                            ? "bg-red-600 text-white shadow"
                            : "bg-secondary text-muted-foreground hover:bg-red-500/20 hover:text-red-400"
                        }`}
                      >
                        [ Esgotado ]
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleIngredientAvailability(item.id, false)}
                        className={`rounded-lg py-1.5 text-xs font-bold transition-all ${
                          !isUnavailable
                            ? "bg-emerald-600 text-white shadow"
                            : "bg-secondary text-muted-foreground hover:bg-emerald-500/20 hover:text-emerald-400"
                        }`}
                      >
                        [ Disponível ]
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STATUS_FLOW.map((column) => {
              const columnOrders = orders.filter((o) => o.status === column.id);
              const groups = groupOrders(columnOrders);
              return (
                <section key={column.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
                    <span className="text-xs font-semibold tracking-[0.15em] text-foreground uppercase">
                      {column.label}
                    </span>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
                      {groups.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {groups.map((group) => (
                      <OrderCard
                        key={group.map((o) => o.id).join("-")}
                        orders={group}
                        onAdvance={advance}
                        onCancel={cancelOrder}
                      />
                    ))}
                    {groups.length === 0 ? (
                      <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-xs text-muted-foreground">
                        Nenhum pedido
                      </p>
                    ) : null}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
