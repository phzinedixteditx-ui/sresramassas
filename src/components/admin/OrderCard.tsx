import { Bike, Check, ChefHat, MessageCircle, PackageCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { brl, whatsappLink, type OrderStatus } from "@/lib/menu";

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
  delivery_fee: number;
  saute_type: string;
  finishing: string[];
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

const NEXT: Record<OrderStatus, { status: OrderStatus; label: string; icon: typeof Check } | null> = {
  novo: { status: "em_preparo", label: "COMEÇAR PREPARO", icon: ChefHat },
  em_preparo: { status: "pronto", label: "MARCAR COMO PRONTO", icon: PackageCheck },
  pronto: { status: "saiu_entrega", label: "SAIU PARA ENTREGA", icon: Bike },
  saiu_entrega: { status: "concluido", label: "CONCLUIR PEDIDO", icon: Check },
  concluido: null,
};

export function OrderCard({
  order,
  onAdvance,
}: {
  order: AdminOrder;
  onAdvance: (order: AdminOrder, status: OrderStatus) => void;
}) {
  const next = NEXT[order.status];
  const nextForPickup =
    order.order_type !== "entrega" && order.status === "pronto"
      ? { status: "concluido" as OrderStatus, label: "CONCLUIR PEDIDO", icon: Check }
      : next;

  return (
    <article className="animate-rise panel p-4">
      <header className="flex items-start justify-between gap-2">
        <div>
          <p className="font-display text-lg font-bold text-gold">#{order.order_number}</p>
          <p className="text-sm font-medium text-foreground">{order.customer_name}</p>
          {order.phone ? (
            <a
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold underline-offset-4 hover:underline"
              href={whatsappLink(order.phone, `Olá ${order.customer_name}, aqui é do Sr e Sra Massas sobre o pedido #${order.order_number}.`)}
              target="_blank"
              rel="noreferrer"
            >
              <MessageCircle className="size-3" /> {order.phone}
            </a>
          ) : null}
        </div>
        <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] tracking-wide text-gold uppercase">
          {order.order_type === "local" ? "no local" : order.order_type}
        </span>
      </header>

      <div className="mt-3 space-y-2 border-t border-border/70 pt-3 text-xs">
        <p className="font-display text-sm font-bold text-foreground uppercase">
          {order.size} · {order.pasta_type}
        </p>
        <Line label="Molho" value={order.sauce} />
        <Line label="Refogado" value={order.saute_type} />
        {order.ingredients.length ? (
          <div>
            <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              Ingredientes
            </p>
            <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground">
              {order.ingredients.map((i) => (
                <li key={i}>✓ {i}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {order.shrimp ? (
          <p className="font-semibold text-gold">
            ✓ CAMARÃO + {brl(Number(order.shrimp_price))}
          </p>
        ) : null}
        {order.finishing.length ? (
          <div>
            <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
              Finalização
            </p>
            <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground">
              {order.finishing.map((f) => (
                <li key={f}>✓ {f}</li>
              ))}
            </ul>
          </div>
        ) : null}
        {order.order_type === "entrega" ? (
          <div className="rounded-lg border border-gold/40 bg-gold/8 px-2.5 py-2">
            <p className="text-[10px] tracking-[0.15em] text-gold uppercase">
              Endereço de entrega
            </p>
            <p className="mt-1 font-medium text-foreground">
              {order.address}
              {order.number ? `, ${order.number}` : ""}
              {order.complement ? ` · ${order.complement}` : ""}
            </p>
            {order.neighborhood ? (
              <p className="text-foreground">Bairro: {order.neighborhood}</p>
            ) : null}
            {order.reference ? (
              <p className="text-muted-foreground">Ref.: {order.reference}</p>
            ) : null}
            {order.phone ? (
              <a
                className="mt-1 inline-block text-gold underline-offset-4 hover:underline"
                href={whatsappLink(order.phone)}
                target="_blank"
                rel="noreferrer"
              >
                📞 {order.phone}
              </a>
            ) : null}
            <p className="mt-1 font-semibold text-gold">Taxa de entrega: {brl(Number(order.delivery_fee))}</p>
          </div>
        ) : null}
        {order.notes ? (
          <p className="rounded-lg border border-gold/30 bg-gold/8 px-2 py-1.5 text-foreground">
            <span className="text-gold">OBS:</span> {order.notes}
          </p>
        ) : null}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Total</span>
        <span className="font-display text-xl font-bold text-gold">{brl(Number(order.total))}</span>
      </div>

      {nextForPickup ? (
        <Button
          variant="gold"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onAdvance(order, nextForPickup.status)}
        >
          <nextForPickup.icon /> {nextForPickup.label}
        </Button>
      ) : null}
    </article>
  );
}

function Line({ label, value }: { label: string; value: string }) {
  return (
    <p className="flex justify-between gap-2">
      <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      <span className="text-foreground">{value}</span>
    </p>
  );
}