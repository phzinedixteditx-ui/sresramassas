import { Bike, Check, ChefHat, Clock, MessageCircle, PackageCheck, X } from "lucide-react";

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
  saute_type: string;
  finishing: string[];
  notes: string | null;
  total: number;
  status: OrderStatus;
  created_at: string;
};

const NEXT: Record<OrderStatus, { status: OrderStatus; label: string; icon: typeof Check } | null> = {
  novo: { status: "em_preparo", label: "COMECAR PREPARO", icon: ChefHat },
  em_preparo: { status: "pronto", label: "MARCAR COMO PRONTO", icon: PackageCheck },
  pronto: { status: "saiu_entrega", label: "SAIU PARA ENTREGA", icon: Bike },
  saiu_entrega: { status: "concluido", label: "CONCLUIR PEDIDO", icon: Check },
  concluido: null,
};

function getMassaLabel(order: AdminOrder): string | null {
  const match = order.notes?.match(/\[Para:\s*([^\]]+)\]/);
  return match && match[1] ? match[1].trim() : null;
}

function cleanNotes(notes: string | null): string | null {
  if (!notes) return null;
  // Remove tags [Para: ...] para exibir apenas observações gerais ou extras
  const cleaned = notes.replace(/\[Para:\s*[^\]]+\]/g, "").trim();
  return cleaned.length > 0 ? cleaned : null;
}

function formatOrderDateTime(dateString: string): string {
  try {
    const d = new Date(dateString);
    const date = d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
    const time = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    return `${date} às ${time}`;
  } catch {
    return "";
  }
}

export function OrderCard({
  orders,
  onAdvance,
  onCancel,
}: {
  orders: AdminOrder[];
  onAdvance: (orders: AdminOrder[], status: OrderStatus) => void;
  onCancel: (orders: AdminOrder[]) => void;
}) {
  if (!orders || orders.length === 0 || !orders[0]) return null;
  const first = orders[0];
  const status = first.status;
  const next = NEXT[status];
  const nextForPickup =
    first.order_type !== "entrega" && status === "pronto"
      ? { status: "concluido" as OrderStatus, label: "CONCLUIR PEDIDO", icon: Check }
      : next;

  const groupTotal = orders.reduce((acc, o) => acc + Number(o.total), 0);
  const orderNums = orders.map((o) => `#${o.order_number}`).join(", ");
  const formattedDateTime = formatOrderDateTime(first.created_at);

  return (
    <article className="animate-rise panel p-4">
      {/* Header do cliente */}
      <header className="flex items-start justify-between gap-2">
        <div>
          <div className="flex flex-wrap items-center gap-1.5 text-[10px] tracking-wider text-muted-foreground uppercase">
            <span className="font-bold text-gold">{orderNums}</span>
            {formattedDateTime ? (
              <>
                <span>•</span>
                <span className="inline-flex items-center gap-1 text-foreground/80 font-medium normal-case">
                  <Clock className="size-3 text-gold" /> {formattedDateTime}
                </span>
              </>
            ) : null}
          </div>
          <p className="font-display text-base font-bold text-foreground mt-0.5">{first.customer_name}</p>
          {first.phone ? (
            <a
              className="mt-0.5 inline-flex items-center gap-1 text-xs text-gold underline-offset-4 hover:underline"
              href={whatsappLink(first.phone, `Ola ${first.customer_name}, aqui e do Sr e Sra Massas sobre o seu pedido.`)}
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
              const nums = orders.map((o) => `#${o.order_number}`).join(", ");
              if (window.confirm(`Cancelar o(s) pedido(s) ${nums} de ${first.customer_name}? Eles serao excluidos do painel.`)) {
                onCancel(orders);
              }
            }}
          >
            <X className="size-4" />
          </button>
          <span className="rounded-full border border-gold/40 px-2 py-0.5 text-[10px] tracking-wide text-gold uppercase">
            {first.order_type === "local" ? "no local" : first.order_type}
          </span>
        </div>
      </header>

      {/* Massas do pedido com identificação obrigatória */}
      <div className="mt-3 space-y-3.5 border-t border-border/70 pt-3">
        {orders.map((order, idx) => {
          const person = getMassaLabel(order);
          return (
            <div key={order.id} className="space-y-1.5 text-xs rounded-xl bg-secondary/30 p-2.5 border border-border/50">
              <div className="flex items-center justify-between border-b border-border/50 pb-1.5">
                <p className="font-display text-xs font-bold tracking-wide text-gold uppercase">
                  Massa {idx + 1} {person ? `— ${person}` : ""}
                </p>
                <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                  {order.size}
                </span>
              </div>
              <p className="font-display text-sm font-bold text-foreground uppercase mt-1">
                {order.pasta_type}
              </p>
              <Line label="Molho(s)" value={order.sauce} />
              <Line label="Refogado" value={order.saute_type} />
              {order.ingredients.length ? (
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Ingredientes</p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground font-medium">
                    {order.ingredients.map((i) => (
                      <li key={i}>✓ {i}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {order.shrimp ? (
                <p className="font-semibold text-gold">✓ CAMARAO + {brl(Number(order.shrimp_price))}</p>
              ) : null}
              {order.finishing.length ? (
                <div>
                  <p className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">Finalizacao</p>
                  <ul className="mt-1 grid grid-cols-2 gap-x-2 text-foreground">
                    {order.finishing.map((f) => (
                      <li key={f}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Endereco */}
      {first.order_type === "entrega" ? (
        <div className="mt-3 rounded-lg border border-gold/40 bg-gold/8 px-2.5 py-2 text-xs">
          <p className="text-[10px] tracking-[0.15em] text-gold uppercase">Endereco de entrega</p>
          <p className="mt-1 font-medium text-foreground">
            {first.address}
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
              Whatsapp: {first.phone}
            </a>
          ) : null}
        </div>
      ) : null}

      {/* Observações e Pagamento / Extras */}
      {(() => {
        const obs = cleanNotes(first.notes);
        return obs ? (
          <p className="mt-2 text-xs rounded-lg border border-gold/30 bg-gold/8 px-2 py-1.5 text-foreground">
            <span className="text-gold font-semibold">INFO / OBS:</span> {obs}
          </p>
        ) : null;
      })()}

      {/* Total */}
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-[10px] tracking-[0.15em] text-muted-foreground uppercase">
          Total {orders.length > 1 ? `(${orders.length} massas)` : ""}
        </span>
        <span className="font-display text-xl font-bold text-gold">{brl(groupTotal)}</span>
      </div>

      {nextForPickup ? (
        <Button
          variant="gold"
          size="sm"
          className="mt-3 w-full"
          onClick={() => onAdvance(orders, nextForPickup.status)}
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