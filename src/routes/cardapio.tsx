import { createFileRoute, Link } from "@tanstack/react-router";

import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { brl, FINISHINGS, INGREDIENTS, PASTAS, SAUCES, SAUTES, SHRIMP_PRICE, SIZES } from "@/lib/menu";

export const Route = createFileRoute("/cardapio")({
  head: () => ({
    meta: [
      { title: "Cardápio — Sr e Sra Massas" },
      {
        name: "description",
        content:
          "Massas, molhos, 21 ingredientes, camarão, refogado e finalizações do Sr e Sra Massas. Preços de R$ 24,00 a R$ 27,00.",
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
            {INGREDIENTS.map((i) => (
              <div
                key={i.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-secondary/40 px-3 py-2.5"
              >
                <span className="text-lg">{i.emoji}</span>
                <span className="text-sm text-foreground">{i.id}</span>
              </div>
            ))}
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

        <div className="pt-2 text-center">
          <Button asChild variant="gold" size="xl">
            <Link to="/montar">MONTE SUA MASSA</Link>
          </Button>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}