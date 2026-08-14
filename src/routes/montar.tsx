import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, MessageCircle, PartyPopper } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { Logo } from "@/components/brand/Logo";
import { OptionCard } from "@/components/order/OptionCard";
import { StepProgress } from "@/components/order/StepProgress";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import {
  brl,
  FINISHINGS,
  INGREDIENTS,
  PASTAS,
  RESTAURANT_WHATSAPP,
  RESTAURANT_WHATSAPP_LABEL,
  SAUCES,
  SAUTES,
  SHRIMP_PRICE,
  SIZES,
  sizeInfo,
  type SizeId,
  whatsappLink,
} from "@/lib/menu";

export const Route = createFileRoute("/montar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Monte sua massa — Sr e Sra Massas" },
      {
        name: "description",
        content:
          "Monte sua massa em poucos passos: tamanho, tipo de massa, molho, ingredientes, camarão, refogado e finalização.",
      },
      { property: "og:title", content: "Monte sua massa — Sr e Sra Massas" },
      {
        property: "og:description",
        content: "Peça online sua massa personalizada no Sr e Sra Massas.",
      },
    ],
  }),
  component: Montar,
});

const STEP_LABELS = [
  "Tamanho",
  "Massa",
  "Molho",
  "Ingredientes",
  "Camarão",
  "Refogado",
  "Finalização",
  "Seus dados",
  "Resumo",
];

type Customer = {
  name: string;
  phone: string;
  orderType: "retirada" | "entrega" | "local";
  address: string;
  number: string;
  complement: string;
  neighborhood: string;
  reference: string;
  notes: string;
};

function Montar() {
  const [step, setStep] = useState(0);
  const [size, setSize] = useState<SizeId | null>(null);
  const [pasta, setPasta] = useState<string | null>(null);
  const [sauce, setSauce] = useState<string | null>(null);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [shrimp, setShrimp] = useState(false);
  const [saute, setSaute] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<string[]>([]);
  const [customer, setCustomer] = useState<Customer>({
    name: "",
    phone: "",
    orderType: "retirada",
    address: "",
    number: "",
    complement: "",
    neighborhood: "",
    reference: "",
    notes: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  const info = sizeInfo(size);
  const limit = info?.limit ?? 0;
  const total = (info?.price ?? 0) + (shrimp ? SHRIMP_PRICE : 0);

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return !!size;
      case 1:
        return !!pasta;
      case 2:
        return !!sauce;
      case 3:
        return ingredients.length > 0;
      case 5:
        return !!saute;
      case 7:
        return (
          customer.name.trim().length >= 2 &&
          (customer.orderType === "local" ||
            customer.phone.replace(/\D/g, "").length >= 10) &&
          (customer.orderType !== "entrega" ||
            (customer.address.trim() !== "" && customer.neighborhood.trim() !== ""))
        );
      default:
        return true;
    }
  }, [step, size, pasta, sauce, ingredients, saute, customer]);

  function toggleIngredient(id: string) {
    setIngredients((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= limit) {
        toast.error("Limite atingido", {
          description: "Você atingiu o limite de ingredientes. Remova um ingrediente para escolher outro.",
        });
        return prev;
      }
      return [...prev, id];
    });
  }

  function next() {
    if (!canAdvance) {
      toast.error("Escolha uma opção para continuar");
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  async function submitOrder() {
    if (!size || !pasta || !sauce || !saute) return;
    setSubmitting(true);
    const { data, error } = await supabase.rpc("create_order", {
      p_customer_name: customer.name,
      p_phone: customer.phone,
      p_order_type: customer.orderType,
      p_address: customer.address,
      p_number: customer.number,
      p_complement: customer.complement,
      p_neighborhood: customer.neighborhood,
      p_reference: customer.reference,
      p_size: size,
      p_pasta_type: pasta,
      p_sauce: sauce,
      p_ingredients: ingredients,
      p_shrimp: shrimp,
      p_saute_type: saute,
      p_finishing: finishing,
      p_notes: customer.notes,
    });
    setSubmitting(false);

    if (error) {
      toast.error("Não foi possível enviar o pedido", { description: error.message });
      return;
    }
    const row = (data as { order_number: number }[] | null)?.[0] ?? null;
    setOrderNumber(row ? row.order_number : null);
    toast.success("Pedido enviado para a cozinha!");
  }

  if (orderNumber !== null) {
    const waMessage = [
      `*Pedido #${orderNumber}* — Sr e Sra Massas`,
      `Cliente: ${customer.name}`,
      customer.orderType === "entrega"
        ? `Entrega: ${customer.address}${customer.number ? `, ${customer.number}` : ""}${customer.complement ? ` - ${customer.complement}` : ""}${customer.neighborhood ? ` - ${customer.neighborhood}` : ""}`
        : customer.orderType === "retirada"
          ? "Retirada no local"
          : "Comer no local",
      "",
      `Tamanho: ${sizeInfo(size)?.label ?? size}`,
      `Massa: ${pasta}`,
      `Molho: ${sauce}`,
      `Ingredientes: ${ingredients.length ? ingredients.join(", ") : "nenhum"}`,
      shrimp ? `Camarão: sim (+${brl(SHRIMP_PRICE)})` : null,
      `Refogado: ${saute}`,
      finishing.length ? `Finalização: ${finishing.join(", ")}` : null,
      customer.notes ? `Obs.: ${customer.notes}` : null,
      "",
      `Total: ${brl(total)}`,
    ]
      .filter(Boolean)
      .join("\n");

    return (
      <div className="min-h-screen bg-background">
        <SiteHeader />
        <main className="mx-auto flex max-w-xl flex-col items-center px-6 py-16 text-center">
          <Logo size={96} />
          <span className="mt-8 flex size-14 items-center justify-center rounded-full bg-gold/15 text-gold">
            <PartyPopper className="size-7" />
          </span>
          <h1 className="animate-rise mt-6 font-display text-3xl font-bold text-foreground">
            Pedido confirmado!
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Recebemos seu pedido e a cozinha já foi avisada.
          </p>
          <div className="panel mt-8 w-full p-8">
            <p className="text-xs tracking-[0.25em] text-muted-foreground">SEU PEDIDO</p>
            <p className="font-display text-5xl font-bold text-gradient-gold">#{orderNumber}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              Guarde este número — use ele junto do seu telefone para acompanhar o status.
            </p>
            <p className="mt-4 font-display text-2xl font-bold text-gold">{brl(total)}</p>
          </div>
          <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row">
            <Button asChild variant="gold" size="lg" className="flex-1">
              <a
                href={whatsappLink(RESTAURANT_WHATSAPP, waMessage)}
                target="_blank"
                rel="noreferrer"
              >
                <MessageCircle /> ENVIAR NO WHATSAPP
              </a>
            </Button>
            <Button asChild variant="gold" size="lg" className="flex-1">
              <Link to="/acompanhar" search={{ pedido: String(orderNumber) }}>
                ACOMPANHAR PEDIDO
              </Link>
            </Button>
            <Button asChild variant="goldOutline" size="lg" className="flex-1">
              <Link to="/">Voltar ao início</Link>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            Dúvidas? Fale com a gente no WhatsApp {RESTAURANT_WHATSAPP_LABEL}
          </p>
        </main>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <StepProgress steps={STEP_LABELS} current={step} onSelect={setStep} />

        <div key={step} className="animate-rise mt-8">
          {step === 0 ? (
            <StepShell
              title="Escolha o tamanho"
              subtitle="O tamanho define quantos ingredientes você leva sem custo."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {SIZES.map((s) => (
                  <OptionCard
                    key={s.id}
                    title={s.label.toUpperCase()}
                    description={`Até ${s.limit} adicionais inclusos`}
                    price={brl(s.price)}
                    selected={size === s.id}
                    onClick={() => {
                      setSize(s.id);
                      setIngredients((prev) => prev.slice(0, s.limit));
                    }}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 1 ? (
            <StepShell title="Escolha sua massa" subtitle="Uma opção por pedido.">
              <div className="grid gap-3 sm:grid-cols-3">
                {PASTAS.map((p) => (
                  <OptionCard
                    key={p.id}
                    title={p.id}
                    description={p.desc}
                    selected={pasta === p.id}
                    onClick={() => setPasta(p.id)}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 2 ? (
            <StepShell title="Escolha seu molho" subtitle="Uma opção por pedido.">
              <div className="grid gap-3 sm:grid-cols-2">
                {SAUCES.map((s) => (
                  <OptionCard
                    key={s.id}
                    title={s.id}
                    description={s.desc}
                    selected={sauce === s.id}
                    onClick={() => setSauce(s.id)}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 3 ? (
            <StepShell
              title="Escolha seus ingredientes"
              subtitle="Todos inclusos no preço, dentro do limite do tamanho."
              badge={`${ingredients.length} / ${limit} ingredientes`}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {INGREDIENTS.map((i) => (
                  <OptionCard
                    key={i.id}
                    compact
                    emoji={i.emoji}
                    title={i.id}
                    selected={ingredients.includes(i.id)}
                    disabled={!ingredients.includes(i.id) && ingredients.length >= limit}
                    onClick={() => toggleIngredient(i.id)}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 4 ? (
            <StepShell
              title="Quer adicionar camarão?"
              subtitle="Adicional pago — não conta no limite de ingredientes."
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <OptionCard
                  emoji="🍤"
                  title="Adicionar camarão"
                  description="Camarões salteados na manteiga"
                  price={`+ ${brl(SHRIMP_PRICE)}`}
                  selected={shrimp}
                  onClick={() => setShrimp(true)}
                />
                <OptionCard
                  title="Sem camarão"
                  description="Seguir sem adicional"
                  selected={!shrimp}
                  onClick={() => setShrimp(false)}
                />
              </div>
            </StepShell>
          ) : null}

          {step === 5 ? (
            <StepShell title="Como você quer refogar?" subtitle="Uma opção por pedido.">
              <div className="grid gap-3 sm:grid-cols-2">
                {SAUTES.map((s) => (
                  <OptionCard
                    key={s.id}
                    emoji={s.emoji}
                    title={s.id}
                    description={s.desc}
                    selected={saute === s.id}
                    onClick={() => setSaute(s.id)}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 6 ? (
            <StepShell
              title="Escolha sua finalização"
              subtitle="Pode escolher quantas quiser."
              badge={`${finishing.length} selecionadas`}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {FINISHINGS.map((f) => (
                  <OptionCard
                    key={f.id}
                    compact
                    emoji={f.emoji}
                    title={f.id}
                    selected={finishing.includes(f.id)}
                    onClick={() =>
                      setFinishing((prev) =>
                        prev.includes(f.id) ? prev.filter((x) => x !== f.id) : [...prev, f.id],
                      )
                    }
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {step === 7 ? (
            <StepShell title="Seus dados" subtitle="Para prepararmos e entregarmos certinho.">
              <div className="grid gap-4">
                <div
                  className={
                    customer.orderType === "local" ? "grid gap-4" : "grid gap-4 sm:grid-cols-2"
                  }
                >
                  <Field label="Nome">
                    <Input
                      value={customer.name}
                      maxLength={80}
                      placeholder="Seu nome"
                      onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                    />
                  </Field>
                  {customer.orderType === "local" ? null : (
                  <Field label="Telefone / WhatsApp">
                    <Input
                      value={customer.phone}
                      maxLength={20}
                      inputMode="tel"
                      placeholder="(00) 00000-0000"
                      onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                    />
                  </Field>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <OptionCard
                    title="Retirada"
                    description="Buscar no restaurante"
                    selected={customer.orderType === "retirada"}
                    onClick={() => setCustomer({ ...customer, orderType: "retirada" })}
                  />
                  <OptionCard
                    title="Comer no local"
                    description="Servimos na mesa"
                    selected={customer.orderType === "local"}
                    onClick={() => setCustomer({ ...customer, orderType: "local" })}
                  />
                  <OptionCard
                    title="Entrega"
                    description="Levamos até você"
                    selected={customer.orderType === "entrega"}
                    onClick={() => setCustomer({ ...customer, orderType: "entrega" })}
                  />
                </div>

                {customer.orderType === "entrega" ? (
                  <div className="animate-rise grid gap-4 sm:grid-cols-2">
                    <Field label="Endereço">
                      <Input
                        value={customer.address}
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      />
                    </Field>
                    <Field label="Número">
                      <Input
                        value={customer.number}
                        onChange={(e) => setCustomer({ ...customer, number: e.target.value })}
                      />
                    </Field>
                    <Field label="Complemento">
                      <Input
                        value={customer.complement}
                        onChange={(e) => setCustomer({ ...customer, complement: e.target.value })}
                      />
                    </Field>
                    <Field label="Bairro">
                      <Input
                        value={customer.neighborhood}
                        onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Referência">
                        <Input
                          value={customer.reference}
                          onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                ) : null}

                <Field label="Observações do pedido">
                  <Textarea
                    value={customer.notes}
                    maxLength={400}
                    placeholder="Ex.: não colocar cebola."
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  />
                </Field>
              </div>
            </StepShell>
          ) : null}

          {step === 8 ? (
            <StepShell title="Seu macarrão" subtitle="Confira tudo antes de confirmar.">
              <div className="panel divide-y divide-border/70">
                <SummaryRow label="Tamanho" value={info?.label ?? "-"} extra={brl(info?.price ?? 0)} />
                <SummaryRow label="Massa" value={pasta ?? "-"} />
                <SummaryRow label="Molho" value={sauce ?? "-"} />
                <SummaryRow label="Ingredientes" list={ingredients} />
                <SummaryRow
                  label="Camarão"
                  value={shrimp ? "Sim" : "Não"}
                  extra={shrimp ? `+ ${brl(SHRIMP_PRICE)}` : undefined}
                />
                <SummaryRow label="Refogado" value={saute ?? "-"} />
                <SummaryRow label="Finalização" list={finishing} />
                <SummaryRow
                  label="Cliente"
                  value={
                    customer.orderType === "local"
                      ? customer.name
                      : `${customer.name} · ${customer.phone}`
                  }
                />
                <SummaryRow
                  label="Pedido"
                  value={
                    customer.orderType === "entrega"
                      ? `${customer.address}, ${customer.number} — ${customer.neighborhood}`
                      : customer.orderType === "local"
                        ? "Comer no local"
                        : "Retirada no restaurante"
                  }
                />
                {customer.notes ? <SummaryRow label="Observações" value={customer.notes} /> : null}
                <div className="flex items-center justify-between p-5">
                  <span className="font-display text-lg font-bold text-foreground">TOTAL</span>
                  <span className="font-display text-3xl font-bold text-gradient-gold">
                    {brl(total)}
                  </span>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  variant="gold"
                  size="xl"
                  className="flex-1"
                  disabled={submitting}
                  onClick={submitOrder}
                >
                  {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle2 />}
                  CONFIRMAR PEDIDO
                </Button>
                <Button
                  variant="goldOutline"
                  size="xl"
                  className="flex-1"
                  onClick={() => setStep(0)}
                  disabled={submitting}
                >
                  EDITAR PEDIDO
                </Button>
              </div>
            </StepShell>
          ) : null}
        </div>
      </main>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/95 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button
            variant="ghost"
            size="lg"
            onClick={() => setStep((s) => Math.max(0, s - 1))}
            disabled={step === 0}
          >
            <ArrowLeft />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="flex-1 text-right sm:text-left">
            <p className="text-[11px] text-muted-foreground">Total</p>
            <p className="font-display text-xl font-bold text-gold">{brl(total)}</p>
          </div>
          {step < STEP_LABELS.length - 1 ? (
            <Button variant="gold" size="lg" onClick={next} disabled={!canAdvance}>
              Continuar <ArrowRight />
            </Button>
          ) : null}
        </div>
      </div>
      <SiteFooter />
    </div>
  );
}

function StepShell({
  title,
  subtitle,
  badge,
  children,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-5 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {badge ? (
          <span className="rounded-full border border-gold/40 bg-gold/10 px-3 py-1 text-xs font-medium text-gold">
            {badge}
          </span>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs tracking-wide text-muted-foreground uppercase">{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  list,
  extra,
}: {
  label: string;
  value?: string;
  list?: string[];
  extra?: string | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-6 p-5">
      <span className="text-xs tracking-[0.15em] text-muted-foreground uppercase">{label}</span>
      <div className="text-right">
        {value ? <p className="text-sm font-medium text-foreground">{value}</p> : null}
        {list ? (
          list.length ? (
            <ul className="space-y-0.5 text-sm text-foreground">
              {list.map((item) => (
                <li key={item}>• {item}</li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">Nenhum</p>
          )
        ) : null}
        {extra ? <p className="text-sm font-semibold text-gold">{extra}</p> : null}
      </div>
    </div>
  );
}