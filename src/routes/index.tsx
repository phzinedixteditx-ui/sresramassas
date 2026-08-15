import { createFileRoute, Link } from "@tanstack/react-router";
import { ChefHat, Heart, MessageCircle, ShoppingBag, Sparkles, UtensilsCrossed } from "lucide-react";

import heroImage from "@/assets/hero-massa.jpg";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { brl, PASTAS, SAUCES, SIZES } from "@/lib/menu";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sr e Sra Massas — Monte sua massa do seu jeito" },
      {
        name: "description",
        content:
          "Escolha sua massa, molho, ingredientes e finalização. Peça online no Sr e Sra Massas: sabor que conquista em cada garfada.",
      },
      { property: "og:title", content: "Sr e Sra Massas — Monte sua massa do seu jeito" },
      {
        property: "og:description",
        content: "Massas artesanais montadas por você. Peça online em poucos toques.",
      },
    ],
  }),
  component: Index,
});

const STEPS = [
  { icon: UtensilsCrossed, title: "Escolha o tamanho", text: "Pequeno com 6 ou grande com 8 adicionais." },
  { icon: ChefHat, title: "Monte do seu jeito", text: "Massa, molho, ingredientes e finalização." },
  { icon: MessageCircle, title: "Envie pelo WhatsApp", text: "Confirme e envie seu pedido direto para a cozinha." },
];

function Index() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-14 md:grid-cols-2 md:py-24">
            <div className="animate-rise">
              <div className="mb-6 flex items-center gap-3 md:hidden">
                <Logo size={72} />
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 px-4 py-1.5 text-xs tracking-[0.2em] text-gold">
                <Sparkles className="size-3.5" /> AMOR EM FORMA DE MASSAS
              </span>
              <h1 className="mt-6 font-display text-5xl leading-[1.05] font-bold text-foreground md:text-6xl">
                MONTE SUA <span className="text-gradient-gold">MASSA</span>
                <br />
                DO SEU JEITO
              </h1>
              <p className="mt-5 max-w-md text-base text-muted-foreground">
                Escolha sua massa, molho, ingredientes e finalização.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="gold" size="xl">
                  <Link to="/montar">
                    <ShoppingBag /> COMEÇAR PEDIDO
                  </Link>
                </Button>
                <Button asChild variant="goldOutline" size="xl">
                  <Link to="/cardapio">Ver cardápio</Link>
                </Button>
              </div>
              <div className="mt-10 flex gap-8">
                {SIZES.map((size) => (
                  <div key={size.id}>
                    <p className="text-xs tracking-widest text-muted-foreground uppercase">
                      {size.label}
                    </p>
                    <p className="font-display text-2xl font-bold text-gold">{brl(size.price)}</p>
                    <p className="text-xs text-muted-foreground">até {size.limit} adicionais</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="animate-rise relative [animation-delay:120ms]">
              <div className="absolute inset-0 rounded-[2rem] bg-gradient-gold opacity-20 blur-2xl" />
              <img
                src={heroImage}
                alt="Prato de espaguete ao molho bolonhesa com parmesão e manjericão"
                width={1408}
                height={1408}
                className="relative aspect-square w-full rounded-[2rem] border border-gold/20 object-cover shadow-elegant"
              />
              <div className="panel absolute -bottom-6 left-6 hidden items-center gap-3 px-5 py-4 sm:flex">
                <Logo size={44} />
                <div>
                  <p className="text-xs text-muted-foreground">Sabor que conquista</p>
                  <p className="font-display text-sm font-semibold text-gold">em cada garfada</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-14">
          <div className="grid gap-4 md:grid-cols-3">
            {STEPS.map((step) => (
              <div key={step.title} className="panel p-6">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-gold/12 text-gold">
                  <step.icon className="size-5" />
                </span>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 pb-16">
          <div className="panel overflow-hidden p-8 md:p-12">
            <h2 className="font-display text-3xl font-bold text-foreground">
              Você escolhe, <span className="text-gradient-gold">a gente prepara</span>
            </h2>
            <p className="mt-2 max-w-xl text-sm text-muted-foreground">
              Três massas, quatro molhos, 21 ingredientes e finalizações à sua escolha.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div>
                <p className="text-xs tracking-[0.2em] text-gold">MASSAS</p>
                <ul className="mt-3 space-y-2">
                  {PASTAS.map((p) => (
                    <li key={p.id} className="text-sm text-muted-foreground">
                      <span className="text-foreground">{p.id}</span> — {p.desc}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-xs tracking-[0.2em] text-gold">MOLHOS</p>
                <ul className="mt-3 space-y-2">
                  {SAUCES.map((s) => (
                    <li key={s.id} className="text-sm text-muted-foreground">
                      <span className="text-foreground">{s.id}</span> — {s.desc}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <Button asChild variant="gold" size="lg" className="mt-10">
              <Link to="/montar">
                <Heart /> MONTE SUA MASSA
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
