import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
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
  SHRIMP_PRICE,
  SIZES,
} from "@/lib/menu";
import { fetchUnavailableIngredients, getStoredUnavailableIngredients } from "@/lib/stock";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio — Sr e Sra Massas" },
      {
        name: "description",
        content:
          "Massas, molhos, 21 ingredientes, camarão, refogado, finalizações, bebidas e doces do Sr e Sra Massas. Preços de R$ 24,00 a R$ 27,00.",
      },
      { property: "og:title", content: "Cardápio — Sr e Sra Massas" },
      {
        property: "og:description",
        content: "Conheça todas as opções para montar sua massa no Sr e Sra Massas.",
      },
    ],
  }),
  component: Cardapio,
});

function Section({
  index,
  title,
  children,
}: {
  index: string;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="animate-rise panel p-6 md:p-8">
      <div className="flex items-center gap-3">
        <span className="flex size-8 items-center justify-center rounded-lg bg-gold/12 font-display text-sm font-bold text-gold">
          {index}
        </span>
        <h2 className="font-display text-xl font-bold text-foreground">{title}</h2>
      </div>
      <div className="mt-6">{children}</div>
    </section>
  );
}

function Cardapio() {
  const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);

  useEffect(() => {
    setUnavailableIngredients(getStoredUnavailableIngredients());
    void fetchUnavailableIngredients().then((list) => {
      setUnavailableIngredients(list);
    });

    const channel = supabase
      .channel("stock-realtime-cardapio")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "stock_settings" },
        (payload) => {
          const row = payload.new as { unavailable_items?: string[] } | undefined;
          if (row?.unavailable_items) {
            setUnavailableIngredients(row.unavailable_items);
            if (typeof window !== "undefined") {
              localStorage.setItem("sresramassas_unavailable_ingredients", JSON.stringify(row.unavailable_items));
            }
          }
        },
      )
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

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-12">
        <header className="text-center">
          <p className="text-xs tracking-[0.3em] text-gold">CARDÁPIO</p>
          <h1 className="mt-3 font-display text-4xl font-bold text-foreground">
            Tudo que entra na <span className="text-gradient-gold">sua massa</span>
          </h1>
        </header>

        <Section index="1" title="Tamanhos">
          <div className="grid gap-4 sm:grid-cols-2">
            {SIZES.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-secondary/40 p-5">
                <p className="font-display text-lg font-bold text-foreground uppercase">{s.label}</p>
                <p className="font-display text-3xl font-bold text-gold">{brl(s.price)}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  até {s.limit} ingredientes inclusos
                </p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="2" title="Tipos de massa">
          <div className="grid gap-3 sm:grid-cols-3">
            {PASTAS.map((p) => (
              <div key={p.id} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <p className="font-semibold text-foreground">{p.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">{p.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="3" title="Molhos">
          <div className="grid gap-3 sm:grid-cols-2">
            {SAUCES.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <p className="font-semibold text-foreground">{s.id}</p>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="4" title="Ingredientes">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {INGREDIENTS.map((i) => {
              const isUnavailable = unavailableIngredients.includes(i.id);
              return (
                <div
                  key={i.id}
                  className={`relative flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors ${
                    isUnavailable
                      ? "border-red-500/30 bg-red-950/20 text-muted-foreground"
                      : "border-border bg-secondary/40 text-foreground"
                  }`}
                >
                  {i.emoji.startsWith("/") ? (
                    <img src={i.emoji} alt={i.id} className="size-5 object-contain" />
                  ) : (
                    <span className="text-lg">{i.emoji}</span>
                  )}
                  <span className="text-sm font-medium">{i.id}</span>
                  {isUnavailable ? (
                    <span className="ml-auto rounded bg-red-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                      Esgotado
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </Section>

        <Section index="5" title="Adicional">
          <div className="flex items-center justify-between rounded-2xl border border-gold/40 bg-gold/8 px-5 py-4">
            <span className="font-semibold text-foreground">🍤 Camarão</span>
            <span className="font-display text-xl font-bold text-gold">
              + {brl(SHRIMP_PRICE)}
            </span>
          </div>
        </Section>

        <Section index="6" title="Refogado">
          <div className="grid gap-3 sm:grid-cols-2">
            {SAUTES.map((s) => (
              <div key={s.id} className="rounded-2xl border border-border bg-secondary/40 p-4">
                <p className="font-semibold text-foreground">
                  {s.emoji} {s.id}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section index="7" title="Finalização">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {FINISHINGS.map((f) => (
              <div
                key={f.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5"
              >
                <span className="text-lg">{f.emoji}</span>
                <span className="text-sm text-foreground">{f.id}</span>
              </div>
            ))}
          </div>
        </Section>

        {/* SEÇÃO 8: BEBIDAS */}
        <Section index="8" title="Bebidas">
          <div className="space-y-4">
            {BEVERAGE_CATEGORIES.map((cat) => (
              <div
                key={cat.id}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-2xl border border-border/80 bg-secondary/30 p-4"
              >
                <div className="h-20 w-full sm:w-24 overflow-hidden rounded-xl bg-muted shrink-0">
                  <img
                    src={cat.image}
                    alt={cat.name}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                </div>
                <div className="flex-1 w-full">
                  <div className="flex justify-between items-baseline">
                    <h3 className="font-display font-bold text-foreground">{cat.name}</h3>
                    {cat.defaultPrice ? (
                      <span className="text-sm font-bold text-gold">{brl(cat.defaultPrice)}</span>
                    ) : null}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {cat.items.map((item) => {
                      const isUnavailable =
                        unavailableIngredients.includes(item.id) ||
                        unavailableIngredients.includes(item.name) ||
                        unavailableIngredients.includes(`${cat.name} — ${item.name}`);
                      return (
                        <span
                          key={item.id}
                          className={`rounded-lg border px-2.5 py-1 text-xs transition-colors ${
                            isUnavailable
                              ? "border-red-500/40 bg-red-950/20 text-muted-foreground line-through"
                              : "border-border bg-secondary/80 text-foreground"
                          }`}
                        >
                          {item.name} {cat.items.length > 1 && `(${brl(item.price)})`}
                          {isUnavailable && (
                            <span className="ml-1 text-[10px] text-red-400 no-underline font-bold">
                              (Esgotado)
                            </span>
                          )}
                        </span>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        {/* SEÇÃO 9: DOCES */}
        <Section index="9" title="Doces & Sobremesas">
          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
            {DESSERT_ITEMS.map((item) => {
              if (item.hasFlavors && item.flavors) {
                return (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-secondary/30 p-3.5"
                  >
                    {item.image ? (
                      <div className="size-14 overflow-hidden rounded-xl bg-muted shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    ) : null}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display text-sm font-bold text-foreground">
                        {item.name}
                      </h3>
                      <p className="text-xs font-semibold text-gold">{brl(item.price)}</p>
                      <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {item.flavors.map((f) => {
                          const key = `${item.id}_${f}`;
                          const isUnavailable =
                            unavailableIngredients.includes(key) ||
                            unavailableIngredients.includes(`${item.name} — ${f}`);
                          return (
                            <span
                              key={f}
                              className={`rounded-md border px-2 py-0.5 text-[11px] ${
                                isUnavailable
                                  ? "border-red-500/40 bg-red-950/20 text-muted-foreground line-through"
                                  : "border-border/60 bg-secondary/50 text-foreground"
                              }`}
                            >
                              {f} {isUnavailable && "(Esgotado)"}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }

              const isUnavailable =
                unavailableIngredients.includes(item.id) ||
                unavailableIngredients.includes(item.name);
              return (
                <div
                  key={item.id}
                  className={`flex items-center gap-3 rounded-2xl border p-3.5 transition-colors ${
                    isUnavailable
                      ? "border-red-500/30 bg-red-950/20 opacity-70"
                      : "border-border bg-secondary/30"
                  }`}
                >
                  {item.image ? (
                    <div className="size-14 overflow-hidden rounded-xl bg-muted shrink-0">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ) : null}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3
                        className={`font-display text-sm font-bold ${
                          isUnavailable ? "line-through text-muted-foreground" : "text-foreground"
                        }`}
                      >
                        {item.name}
                      </h3>
                      {isUnavailable ? (
                        <span className="rounded bg-red-600/80 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase">
                          Esgotado
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-semibold text-gold">{brl(item.price)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Section>

        <div className="pt-4 text-center">
          <Button asChild variant="gold" size="xl">
            <Link to="/montar">MONTE SUA MASSA</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}