import { createFileRoute } from "@tanstack/react-router";
import { Bell, Loader2, LogOut, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { OrderCard, type AdminOrder } from "@/components/admin/OrderCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { brl, STATUS_FLOW, type OrderStatus } from "@/lib/menu";

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
    const { data } = await supabase.auth.getUser();
    if (!data.user) {
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
    setIsStaff((roles ?? []).length > 0);
    setChecking(false);
  }, []);

  useEffect(() => {
    void check();
    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      void check();
    });
    return () => sub.subscription.unsubscribe();
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

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) toast.error("Não foi possível entrar", { description: error.message });
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/admin` },
      });
      setLoading(false);
      if (error) {
        toast.error("Não foi possível criar a conta", { description: error.message });
        return;
      }
      if (!data.session) {
        toast.success("Confirme seu e-mail para ativar o acesso.");
      }
    }
  }

  return (
    <AdminShell>
      <h1 className="mt-6 font-display text-2xl font-bold text-foreground">Painel do restaurante</h1>
      <p className="mt-1 text-sm text-muted-foreground">Acesso restrito à equipe.</p>
      <form className="mt-8 space-y-4 text-left" onSubmit={submit}>
        <div className="space-y-2">
          <Label className="text-xs tracking-wide text-muted-foreground uppercase">E-mail</Label>
          <Input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="email"
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
  }, []);

  useEffect(() => {
    void load();
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
      void supabase.removeChannel(channel);
    };
  }, [load]);

  async function advance(order: AdminOrder, status: OrderStatus) {
    const { error } = await supabase.from("orders").update({ status }).eq("id", order.id);
    if (error) {
      toast.error("Não foi possível atualizar", { description: error.message });
      return;
    }
    toast.success(`Pedido #${order.order_number} atualizado`);
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
              const columnOrders = orders.filter((o) => o.status === column.id);
              return (
                <section key={column.id} className="flex flex-col gap-3">
                  <div className="flex items-center justify-between rounded-xl border border-border bg-secondary/40 px-4 py-2.5">
                    <span className="text-xs font-semibold tracking-[0.15em] text-foreground uppercase">
                      {column.label}
                    </span>
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold">
                      {columnOrders.length}
                    </span>
                  </div>
                  <div className="space-y-3">
                    {columnOrders.map((order) => (
                      <OrderCard key={order.id} order={order} onAdvance={advance} />
                    ))}
                    {columnOrders.length === 0 ? (
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