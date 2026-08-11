import { Link } from "@tanstack/react-router";

import { Logo } from "@/components/brand/Logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border/70 bg-background">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-6 py-10 text-center">
        <Logo size={64} />
        <p className="font-display text-sm tracking-[0.2em] text-gold">
          SABOR QUE CONQUISTA EM CADA GARFADA
        </p>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/cardapio">Cardápio</Link>
          <Link to="/montar">Monte sua Massa</Link>
          <Link to="/acompanhar">Acompanhar</Link>
        </div>
        <p className="text-xs text-muted-foreground">
          © {new Date().getFullYear()} Sr e Sra Massas — Mais que massas, criamos novas experiências.
        </p>
      </div>
    </footer>
  );
}