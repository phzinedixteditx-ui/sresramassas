import { createFileRoute } from "@tanstack/react-router";
import { Check, Loader2, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { brl, STATUS_FLOW, type OrderStatus } from "@/lib/menu";
import { cn } from "@/lib/utils";

type TrackedOrder = {
  order_number: number;
  status: OrderStatus;
  order_type: string;
  total: number;
  created_at: string;
  customer_name: string;
};

export const Route = createFileRoute("/acompanhar")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    pedido: typeof search['pedido'] === "string" ? (search['pedido'] as string) : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Acompanhar pedido — Sr e Sra Massas" },
      {
        name: "description",
        content:
          "Acompanhe em tempo real o preparo do seu pedido no Sr e Sra Massas usando o número do pedido e seu telefone.",
      },
      { property: "og:title", content: "Acompanhar pedido — Sr e Sra Massas" },
      {
        property: "og:description",
        content: "Veja o status do seu pedido: recebido, em preparo, pronto, a caminho e entregue.",
      },
    ],
  }),
  component: Acompanhar,
});

function Acompanhar() {
  const { pedido } = Route.useSearch();
  const [orderNumber, setOrderNumber] = useState(pedido ?? "");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const fetchOrder = useCallback(
    async (silent = false) => {
      const num = parseInt(orderNumber, 10);
      if (!num || phone.replace(/\D/g, "").length < 10) {
        if (!silent) toast.error("Informe o número do pedido e o telefone usado no pedido.");
        return;
      }
      if (!silent) setLoading(true);
      const { data, error } = await supabase.rpc("track_order", {
        p_order_number: num,
        p_phone: phone,
      });
      if (!silent) setLoading(false);
      if (error) {
        if (!silent) toast.error("Não conseguimos buscar seu pedido agora.");
        return;
      }
      const row = (data as TrackedOrder[] | null)?.[0] ?? null;
      if (!row) {
        setOrder(null);
        if (!silent) toast.error("Pedido não encontrado. Confira o número e o telefone.");
        return;
      }
      setOrder(row);
    },
    [orderNumber, phone],
  );

  useEffect(() => {
    if (!order) return;
    const id = setInterval(() => void fetchOrder(true), 8000);
    return () => clearInterval(id);
  }, [order, fetchOrder]);

  const currentIndex = order ? STATUS_FLOW.findIndex((s) => s.id === order.status) : -1;

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-6 py-12">
        <header className="text-center">
          <p className="text-xs tracking-[0.3em] text-gold">ACOMPANHAR</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground">
            Onde está o <span className="text-gradient-gold">seu pedido</span>
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Informe o número do pedido e o telefone usado na hora de pedir.
          </p>
        </header>

        <form
          className="panel mt-8 grid gap-4 p-6 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"
          onSubmit={(e) => {
            e.preventDefault();
            void fetchOrder();
          }}
        >
          <div className="space-y-2">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">Pedido nº</Label>
            <Input
              value={orderNumber}
              inputMode="numeric"
              placeholder="104"
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label className="text-xs tracking-wide text-muted-foreground uppercase">Telefone</Label>
            <Input
              value={phone}
              inputMode="tel"
              placeholder="(00) 00000-0000"
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <Button type="submit" variant="gold" size="lg" disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : <Search />}
            Buscar
          </Button>
        </form>

        {loading ? (
          <div className="panel mt-6 space-y-4 p-6">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : null}

        {order && !loading ? (
          <section className="panel animate-rise mt-6 p-6 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs tracking-[0.25em] text-muted-foreground">PEDIDO</p>
                <p className="font-display text-4xl font-bold text-gradient-gold">
                  #{order.order_number}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {order.customer_name} ·{" "}
                  {order.order_type === "entrega"
                    ? "Entrega"
                    : order.order_type === "local"
                      ? "Comer no local"
                      : "Retirada"}
                </p>
                <p className="font-display text-2xl font-bold text-gold">{brl(Number(order.total))}</p>
              </div>
            </div>

            <ol className="mt-8 space-y-1">
              {STATUS_FLOW.map((s, i) => {
                const done = i <= currentIndex;
                const active = i === currentIndex;
                return (
                  <li key={s.id} className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <span
                        className={cn(
                          "flex size-8 items-center justify-center rounded-full border transition-colors",
                          done
                            ? "border-gold bg-gradient-gold text-primary-foreground"
                            : "border-border text-muted-foreground",
                        )}
                      >
                        {done ? <Check className="size-4" /> : <span className="size-2 rounded-full bg-current" />}
                      </span>
                      {i < STATUS_FLOW.length - 1 ? (
                        <span
                          className={cn("h-8 w-px", done ? "bg-gold/60" : "bg-border")}
                        />
                      ) : null}
                    </div>
                    <span
                      className={cn(
                        "pb-8 text-sm",
                        active
                          ? "font-semibold text-gold"
                          : done
                            ? "text-foreground"
                            : "text-muted-foreground",
                      )}
                    >
                      {statusLabel(s.id)}
                    </span>
                  </li>
                );
              })}
            </ol>
            <p className="text-xs text-muted-foreground">Atualizando automaticamente…</p>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}

function statusLabel(id: OrderStatus) {
  switch (id) {
    case "novo":
      return "Pedido recebido";
    case "em_preparo":
      return "Em preparo";
    case "pronto":
      return "Pronto";
    case "saiu_entrega":
      return "Saiu para entrega";
    default:
      return "Concluído";
  }
}