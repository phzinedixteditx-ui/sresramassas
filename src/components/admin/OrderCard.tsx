import { Bike, Check, ChefHat, Clock, MessageCircle, PackageCheck, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brl, whatsappLink, type OrderStatus } from "@/lib/menu";

function formatDateTime(iso?: string | null) {
  if (!iso) return "--/-- --:--";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "--/-- --:--";
  return d.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  if (diffMs < 0) return "Agora";
  const mins = Math.floor(diffMs / (60 * 1000));
  if (mins < 1) return "Agora";
  if (mins < 60) return `Há ${mins} min`;
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  return `Há ${hours}h${remainingMins > 0 ? ` ${remainingMins}m` : ""}`;
}

export type AdminOrder = {
  id: string;
  order_number: number;
  customer_name: string;
  phone: string;
  order_type: "retirada" | "entrega" | "local";
  address: string | null;
  number: string | null;
  complement: string | null;
  neighborhood: string | null;
  reference: string | null;
  size: string;
  base_price: number;
  pasta_type: string;
  sauce: string;
  ingredients: string[];
  shrimp: boolean;
  shrimp_price: number;
  saute_type: string;
  finishing: string[];
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

const NEXT: Record<string, { status: OrderStatus; label: string; icon: typeof Check }> = {
  novo: { status: "em_preparo", label: "COMEÇAR PREPARO", icon: ChefHat },
  em_preparo: { status: "pronto", label: "MARCAR COMO PRONTO", icon: PackageCheck },
  pronto: { status: "saiu_entrega", label: "SAIU PARA ENTREGA", icon: Bike },
  saiu_entrega: { status: "concluido", label: "CONCLUIR PEDIDO", icon: Check },
};

export function OrderCard({
  orders,
  onAdvance,
  onCancel,
}: {
  orders: AdminOrder[];
  onAdvance: (orders: AdminOrder[], status: OrderStatus) => void;
  onCancel: (orders: AdminOrder[]) => void;
}) {
  const first = orders[0];
  if (!first) return null;

  const rawStatus = (first.status || "novo").toLowerCase();
  const next = NEXT[rawStatus] || null;
  const nextForPickup =
    first.order_type !== "entrega" && rawStatus === "pronto"
      ? { status: "concluido" as OrderStatus, label: "CONCLUIR PEDIDO", icon: Check }
      : next;

  const groupTotal = orders.reduce((acc, o) => acc + Number(o?.total || 0), 0);
  const orderNums = orders.map((o) => `#${o?.order_number ?? "?"}`).join(", ");
  const customerName = first.customer_name || "Cliente";

  return (
    <article className="animate-rise panel p-4">
      {/* Header do cliente */}
      <header className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">{orderNums}</p>
          <p className="font-display text-base font-bold text-foreground">{customerName}</p>
          
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Clock className="size-3 text-gold" /> {formatDateTime(first.created_at)}
            </span>
            {timeAgo(first.created_at) ? (
              <span className="rounded-full border border-gold/30 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                {timeAgo(first.created_at)}
              </span>
            ) : null}
          </div>

          {first.phone ? (
            <a
              className="mt-1 inline-flex items-center gap-1 text-xs text-gold underline-offset-4 hover:underline"
              href={whatsappLink(first.phone, `Olá ${customerName}, aqui é do Sr e Sra Massas sobre o seu pedido ${orderNums}.`)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-3" /> {first.phone}
            </a>
          ) : null}
        </div>

        <div className="flex flex-col items-end gap-2">
          <button
            type="button"
            className="rounded-full bg-red-500/10 p-1.5 text-red-500 transition-colors hover:bg-red-500/20"
            title="Cancelar e remover pedido"
            onClick={() => {
              const nums = orders.map((o) => `#${o?.order_number ?? "?"}`).join(", ");
              if (window.confirm(`Cancelar o(s) pedido(s) ${nums} de ${customerName}? Eles serão excluídos do painel.`)) {
                onCancel(orders);
              }
            }}
          >
            <X className="size-4" />
          </button>
          <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] tracking-wide text-gold uppercase font-medium">
            {first.order_type === "local" ? "no local" : (first.order_type || "retirada")}
          </span>
        </div>
      </header>

      {/* Massas do pedido */}
      <div className="mt-3 space-y-3 border-t border-border/70 pt-3">
        {orders.map((order, idx) => {
          if (!order) return null;
          const ingredientsList = Array.isArray(order.ingredients) ? order.ingredients : [];
          const finishingList = Array.isArray(order.finishing) ? order.finishing : [];
          
          return (
            <div key={order.id || idx} className="space-y-1.5 text-xs">
              {orders.length > 1 && (
                <p className="font-display text-[10px] font-bold tracking-widest text-gold uppercase">
                  — Massa {idx + 1}
                </p>
              )}
              <p className="font-display text-sm font-bold text-foreground uppercase">
                {order.size || "Massa"} · {order.pasta_type || "Tradicional"}
              </p>
              <Line label="Molho" value={order.sauce} />
              <Line label="Refogado" value={order.saute_type} />
              {ingredientsList.length > 0 ? (
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Ingredientes</p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground">
                    {ingredientsList.map((i) => (
                      <li key={i}>✓ {i}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {order.shrimp ? (
                <p className="font-semibold text-gold">✓ CAMARÃO + {brl(Number(order.shrimp_price || 0))}</p>
              ) : null}
              {finishingList.length > 0 ? (
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Finalização</p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground">
                    {finishingList.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Endereço */}
      {first.order_type === "entrega" ? (
        <div className="mt-3 rounded-lg border border-gold/40 bg-gold/8 px-2.5 py-2 text-xs">
          <p className="text-[10px] tracking-[0.15em] text-gold uppercase font-bold">Endereço de entrega</p>
          <p className="mt-1 font-medium text-foreground">
            {first.address || "Endereço não informado"}
            {first.number ? `, ${first.number}` : ""}
            {first.complement ? ` · ${first.complement}` : ""}
          </p>
          {first.neighborhood ? <p className="text-foreground">Bairro: {first.neighborhood}</p> : null}
          {first.reference ? <p className="text-muted-foreground">Ref.: {first.reference}</p> : null}
          {first.phone ? (
            <a
              className="mt-1 inline-block text-gold underline-offset-4 hover:underline"
              href={whatsappLink(first.phone)}
              target="_blank"
              rel="noreferrer"
            >
              WhatsApp: {first.phone}
            </a>
          ) : null}
        </div>
      ) : null}

      {first.notes ? (
        <p className="mt-2 text-xs rounded-lg border border-gold/30 bg-gold/8 px-2 py-1.5 text-foreground">
          <span className="text-gold font-bold">OBS:</span> {first.notes}
        </p>
      ) : null}

      {/* Total */}
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
          Total {orders.length > 1 ? `(${orders.length} massas)` : ""}
        </span>
        <span className="font-display text-xl font-bold text-gold">{brl(groupTotal)}</span>
      </div>

      {nextForPickup && nextForPickup.icon ? (
        <Button
          variant="gold"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onAdvance(orders, nextForPickup.status)}
        >
          {(() => {
            const Icon = nextForPickup.icon;
            return <Icon className="size-4 mr-1.5" />;
          })()}
          <span>{nextForPickup.label}</span>
        </Button>
      ) : null}
    </article>
  );
}

function Line({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <p className="flex justify-between gap-2">
      <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </p>
  );
}