import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader as Loader2, LogOut, RefreshCw, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { OrderCard, type AdminOrder } from "@/components/admin/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { brl, STATUS_FLOW, type OrderStatus } from "@/lib/menu";

function AdminErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="panel w-full max-w-md p-8 text-center space-y-4">
        <Logo size={80} className="mx-auto" />
        <h1 className="font-display text-2xl font-bold text-foreground">Painel de Produção</h1>
        <p className="text-sm text-muted-foreground">
          {error?.message || "Ocorreu um erro ao carregar o painel."}
        </p>
        <div className="pt-2 flex flex-col gap-2">
          <Button variant="gold" onClick={() => reset()} className="w-full">
            Tentar novamente
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              void supabase.auth.signOut().then(() => window.location.reload());
            }}
            className="w-full"
          >
            Sair e fazer login novamente
          </Button>
        </div>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/admin")({
  ssr: false,
  errorComponent: AdminErrorComponent,
  head: () => ({
    meta: [
      { title: "Painel de Produção — Sr e Sra Massas" },
      { name: "description", content: "Área restrita da equipe Sr e Sra Massas." },
      { name: "robots", content: "noindex" },
      { property: "og:title", content: "Painel de Produção — Sr e Sra Massas" },
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
    try {
      const { data, error: userError } = await supabase.auth.getUser();
      if (userError || !data?.user) {
        setSignedIn(false);
        setIsStaff(false);
        return;
      }

      setSignedIn(true);
      let { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", data.user.id);

      if (rolesError) {
        console.warn("Erro ao buscar permissões:", rolesError.message);
      }

      if (!roles || roles.length === 0) {
        const { data: claimed, error: claimError } = await supabase.rpc("claim_first_admin");
        if (!claimError && claimed) {
          const res = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
          if (!res.error) {
            roles = res.data;
          }
        }
      }
      setIsStaff((roles ?? []).length > 0);
    } catch (error) {
      setIsStaff(false);
      toast.error("Não foi possível carregar o painel", {
        description: error instanceof Error ? error.message : "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setChecking(false);
    }
  }, []);

  useEffect(() => {
    void check();
    try {
      const { data: sub } = supabase.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT") {
          setSignedIn(false);
          setIsStaff(false);
          setChecking(false);
          return;
        }

        if (event === "SIGNED_IN" || event === "USER_UPDATED") {
          setChecking(true);
          window.setTimeout(() => void check(), 0);
        }
      });
      return () => {
        sub?.subscription?.unsubscribe();
      };
    } catch (e) {
      console.warn("Erro ao registrar onAuthStateChange:", e);
    }
    return undefined;
  }, [check]);

  if (checking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-6 animate-spin text-gold" />
      </div>
    );
  }

  if (!signedIn) return <AdminLogin />;
  if (!isStaff) return <NoAccess />;
  return <Dashboard />;
}

function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6 py-16">
      <div className="panel w-full max-w-sm p-8 text-center">
        <Logo size={80} className="mx-auto" />
        {children}
      </div>
    </div>
  );
}

function AdminLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const user = username.trim().toLowerCase();
    if (!/^[a-z0-9._-]{3,}$/.test(user)) {
      toast.error("Usuário inválido", {
        description: "Use ao menos 3 caracteres: letras, números, ponto, hífen ou underline.",
      });
      return;
    }
    const email = `${user}@srsramassas.app`;
    setLoading(true);
    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          toast.error("Não foi possível entrar", {
            description: "Usuário ou senha incorretos.",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (error) {
          toast.error("Não foi possível criar a conta", {
            description: error.message.toLowerCase().includes("already")
              ? "Este usuário já existe. Faça login."
              : error.message,
          });
          return;
        }
        if (!data.session) {
          const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
          if (signInError) {
            toast.error("Conta criada, mas não foi possível entrar", {
              description: signInError.message,
            });
            return;
          }
        }
        toast.success("Conta criada! Bem-vindo ao painel.");
      }
    } catch (err) {
      toast.error("Erro inesperado ao entrar", {
        description: err instanceof Error ? err.message : "Verifique sua conexão e tente novamente.",
      });
    } finally {
      setLoading(false);
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
            placeholder="ex: cozinha"
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
            minLength={6}
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

function Dashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      setLoading(false);
      if (error) {
        toast.error("Erro ao carregar pedidos", { description: error.message });
        return;
      }
      setOrders((data ?? []) as unknown as AdminOrder[]);
    } catch (e) {
      setLoading(false);
      console.warn("Erro ao buscar pedidos:", e);
    }
  }, []);

  useEffect(() => {
    void load();
    try {
      const channel = supabase
        .channel("orders-admin")
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "orders" },
          (payload) => {
            const row = payload?.new as unknown as AdminOrder;
            if (!row?.id) return;
            setOrders((prev) => [row, ...prev.filter((o) => o?.id !== row.id)]);
            toast.success("Novo pedido recebido!", {
              description: `Pedido #${row.order_number ?? ""} — ${row.customer_name ?? "Cliente"}`,
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
            const row = payload?.new as unknown as AdminOrder;
            if (!row?.id) return;
            setOrders((prev) => prev.map((o) => (o?.id === row.id ? row : o)));
          },
        )
        .subscribe();

      return () => {
        void supabase.removeChannel(channel);
      };
    } catch (e) {
      console.warn("Erro no Realtime do Supabase:", e);
    }
    return undefined;
  }, [load]);

  // Agrupa pedidos do mesmo cliente feitos em janela de 10 minutos
  function groupOrders(list: AdminOrder[]): AdminOrder[][] {
    const groups: AdminOrder[][] = [];
    const used = new Set<string>();
    for (const order of list) {
      if (!order?.id || used.has(order.id)) continue;
      const t = new Date(order.created_at || Date.now()).getTime();
      const group = list.filter((o) => {
        if (!o?.id || used.has(o.id)) return false;
        const ot = new Date(o.created_at || Date.now()).getTime();
        return (
          (o.customer_name || "") === (order.customer_name || "") &&
          (o.phone || "") === (order.phone || "") &&
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
      if (!order?.id) continue;
      const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
      if (error) {
        toast.error("Não foi possível atualizar", { description: error.message });
        return;
      }
    }
    const ids = new Set(orderGroup.map((o) => o.id));
    setOrders((prev) => prev.map((o) => (ids.has(o.id) ? { ...o, status } : o)));
    const nums = orderGroup.map((o) => `#${o?.order_number ?? "?"}`).join(", ");
    toast.success(`Pedido ${nums} atualizado`);
  }

  async function cancelOrder(orderGroup: AdminOrder[]) {
    const ids = orderGroup.map((o) => o.id).filter(Boolean);
    const { error } = await supabase.from("orders").delete().in("id", ids);
    if (error) {
      console.warn("Aviso ao excluir no banco:", error.message);
    }
    const idSet = new Set(ids);
    setOrders((prev) => prev.filter((o) => !idSet.has(o.id)));
    const nums = orderGroup.map((o) => `#${o?.order_number ?? "?"}`).join(", ");
    toast.success(`Pedido ${nums} cancelado e excluído.`);
  }

  async function clearOldOrders() {
    const twoHoursAgoTime = Date.now() - 2 * 60 * 60 * 1000;
    
    // Identifica pedidos que foram concluídos OU têm mais de 2 horas
    const oldOrders = orders.filter((o) => {
      if (!o) return false;
      if (o.status === "concluido") return true;
      const t = new Date(o.created_at || 0).getTime();
      return !isNaN(t) && t < twoHoursAgoTime;
    });

    if (oldOrders.length === 0) {
      toast.info("Nenhum pedido antigo (> 2 horas ou concluído) encontrado.");
      return;
    }

    if (
      !window.confirm(
        `Excluir ${oldOrders.length} pedido(s) antigo(s) com mais de 2 horas ou concluídos? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }

    const idsToDelete = oldOrders.map((o) => o.id).filter(Boolean);
    
    // Tenta remover no banco de dados Supabase
    const { error } = await supabase.from("orders").delete().in("id", idsToDelete);
    if (error) {
      console.warn("Aviso ao excluir do banco:", error.message);
    }

    const deleteSet = new Set(idsToDelete);
    setOrders((prev) => prev.filter((o) => !deleteSet.has(o.id)));
    toast.success(`${oldOrders.length} pedido(s) antigo(s) excluído(s) com sucesso.`);
  }

  const todayTotal = orders
    .filter((o) => {
      if (!o?.created_at) return false;
      const d = new Date(o.created_at);
      return !isNaN(d.getTime()) && d.toDateString() === new Date().toDateString();
    })
    .reduce((sum, o) => sum + Number(o?.total || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[110rem] items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Logo size={44} />
            <div>
              <p className="font-display text-sm font-bold text-gold">PAINEL DE PRODUÇÃO</p>
              <p className="text-xs text-muted-foreground">Sr e Sra Massas</p>
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
              onClick={() => void clearOldOrders()}
              className="gap-1.5 text-xs"
            >
              <Trash2 className="size-3.5" /> Limpar antigos (&gt; 2h)
            </Button>
            <Button variant="goldOutline" size="sm" onClick={() => void supabase.auth.signOut()}>
              <LogOut /> Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[110rem] px-4 py-6 sm:px-6">
        {loading ? (
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-64 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {STATUS_FLOW.map((column) => {
              const columnOrders = orders.filter((o) => o?.status === column.id);
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
                        key={group.map((o) => o?.id).join("-")}
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