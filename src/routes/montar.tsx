import { createFileRoute } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Loader2, MessageCircle, Minus, Plus } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

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
  BEVERAGE_CATEGORIES,
  brl,
  DESSERT_ITEMS,
  FINISHINGS,
  INGREDIENTS,
  PASTAS,
  PAYMENT_METHODS,
  PaymentMethod,
  RESTAURANT_WHATSAPP,
  SAUCES,
  SAUTES,
  SHRIMP_PRICE,
  SIZES,
  sizeInfo,
  type SizeId,
  whatsappLink,
} from "@/lib/menu";
import { getStoredUnavailableIngredients } from "@/lib/stock";

export const Route = createFileRoute("/montar")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Monte sua massa — Sr e Sra Massas" },
      {
        name: "description",
        content:
          "Monte sua massa em poucos passos: tamanho, tipo de massa, molhos, ingredientes, camarão, refogado, finalização, bebidas e doces.",
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
  "Molhos",
  "Ingredientes",
  "Camarão",
  "Refogado",
  "Finalização & Nome",
  "Bebidas",
  "Doces",
  "Seus dados & Pagamento",
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

type CartItem = {
  size: SizeId;
  pasta: string;
  sauces: string[];
  ingredients: string[];
  shrimp: boolean;
  saute: string;
  finishing: string[];
  massaLabel: string;
  total: number;
};

function Montar() {
  const [step, setStep] = useState(0);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Estado da massa atual
  const [size, setSize] = useState<SizeId | null>(null);
  const [pasta, setPasta] = useState<string | null>(null);
  const [sauces, setSauces] = useState<string[]>([]);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [shrimp, setShrimp] = useState(false);
  const [saute, setSaute] = useState<string | null>(null);
  const [finishing, setFinishing] = useState<string[]>([]);
  const [massaLabel, setMassaLabel] = useState("");

  // Estado de Bebidas e Doces selecionados (item_id -> quantidade)
  const [beverageCounts, setBeverageCounts] = useState<{ [key: string]: number }>({});
  const [dessertCounts, setDessertCounts] = useState<{ [key: string]: number }>({});

  // Estado da forma de pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // Ingredientes indisponíveis
  const [unavailableIngredients, setUnavailableIngredients] = useState<string[]>([]);

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

  // Carrega e escuta estoque em tempo real
  useEffect(() => {
    setUnavailableIngredients(getStoredUnavailableIngredients());
    const channel = supabase
      .channel("stock-events-montar")
      .on("broadcast", { event: "stock_update" }, (payload: { [key: string]: unknown }) => {
        const payloadData = payload["payload"] as { unavailable?: string[] } | undefined;
        if (payloadData?.unavailable) {
          setUnavailableIngredients(payloadData.unavailable);
        }
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const info = sizeInfo(size);
  const limit = info?.limit ?? 0;
  const currentTotal = (info?.price ?? 0) + (shrimp ? SHRIMP_PRICE : 0);

  const cartTotal = cartItems.reduce((acc, item) => acc + item.total, 0);

  // Calcula total de bebidas
  const beveragesTotal = useMemo(() => {
    let sum = 0;
    for (const cat of BEVERAGE_CATEGORIES) {
      for (const item of cat.items) {
        const count = beverageCounts[item.id] || 0;
        if (count > 0) sum += item.price * count;
      }
    }
    return sum;
  }, [beverageCounts]);

  // Calcula total de doces
  const dessertsTotal = useMemo(() => {
    let sum = 0;
    for (const item of DESSERT_ITEMS) {
      if (item.hasFlavors && item.flavors) {
        for (const f of item.flavors) {
          const count = dessertCounts[`${item.id}_${f}`] || 0;
          if (count > 0) sum += item.price * count;
        }
      } else {
        const count = dessertCounts[item.id] || 0;
        if (count > 0) sum += item.price * count;
      }
    }
    return sum;
  }, [dessertCounts]);

  const deliveryFee = customer.orderType === "entrega" ? 7 : 0;
  const isBuildingItem = size !== null;
  const finalTotal =
    cartTotal + (isBuildingItem ? currentTotal : 0) + beveragesTotal + dessertsTotal + deliveryFee;

  const canAdvance = useMemo(() => {
    switch (step) {
      case 0:
        return !!size;
      case 1:
        return !!pasta;
      case 2:
        return sauces.length > 0;
      case 3:
        return ingredients.length > 0;
      case 5:
        return !!saute;
      case 6:
        return massaLabel.trim().length >= 1;
      case 7: // Bebidas (opcional)
        return true;
      case 8: // Doces (opcional)
        return true;
      case 9: // Seus dados & Pagamento
        return (
          customer.name.trim().length >= 2 &&
          (customer.orderType === "local" ||
            customer.phone.replace(/\D/g, "").length >= 10) &&
          (customer.orderType !== "entrega" ||
            (customer.address.trim() !== "" && customer.neighborhood.trim() !== "")) &&
          !!paymentMethod
        );
      default:
        return true;
    }
  }, [step, size, pasta, sauces, ingredients, saute, massaLabel, customer, paymentMethod]);

  function toggleSauce(sauceName: string) {
    setSauces((prev) =>
      prev.includes(sauceName) ? prev.filter((s) => s !== sauceName) : [...prev, sauceName],
    );
  }

  function toggleIngredient(id: string) {
    if (unavailableIngredients.includes(id)) {
      toast.error("⚠️ Ingrediente esgotado", {
        description: `${id} está temporariamente indisponível hoje.`,
      });
      return;
    }
    setIngredients((prev) => {
      if (prev.includes(id)) return prev.filter((i) => i !== id);
      if (prev.length >= limit) {
        toast.error("Limite atingido", {
          description: "Você atingiu o limite de ingredientes. Remova um para escolher outro.",
        });
        return prev;
      }
      return [...prev, id];
    });
  }

  function updateBeverageCount(itemId: string, delta: number) {
    setBeverageCounts((prev) => {
      const current = prev[itemId] || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: nextVal };
    });
  }

  function updateDessertCount(key: string, delta: number) {
    setDessertCounts((prev) => {
      const current = prev[key] || 0;
      const nextVal = Math.max(0, current + delta);
      if (nextVal === 0) {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      }
      return { ...prev, [key]: nextVal };
    });
  }

  function next() {
    if (!canAdvance) {
      if (step === 6 && !massaLabel.trim()) {
        toast.error("Identificação obrigatória", {
          description: "Por favor, informe para quem é essa massa.",
        });
        return;
      }
      if (step === 9 && !paymentMethod) {
        toast.error("Forma de pagamento obrigatória", {
          description: "Por favor, selecione como deseja pagar.",
        });
        return;
      }
      toast.error("Escolha uma opção para continuar");
      return;
    }
    setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
  }

  function addToCartAndAddAnother() {
    if (!size || !pasta || sauces.length === 0 || !saute || !massaLabel.trim()) {
      toast.error("Termine de montar a massa atual antes de adicionar outra.", {
        description: "Certifique-se de preencher o nome de quem vai comer essa massa.",
      });
      return;
    }
    setCartItems((prev) => [
      ...prev,
      {
        size,
        pasta,
        sauces,
        ingredients,
        shrimp,
        saute,
        finishing,
        massaLabel: massaLabel.trim(),
        total: currentTotal,
      },
    ]);
    setSize(null);
    setPasta(null);
    setSauces([]);
    setIngredients([]);
    setShrimp(false);
    setSaute(null);
    setFinishing([]);
    setMassaLabel("");
    setStep(0);
    window.scrollTo({ top: 0, behavior: "smooth" });
    toast.success("Massa adicionada! Monte a próxima.");
  }

  async function submitOrder() {
    const hasCurrentItem = size && pasta && sauces.length > 0 && saute && massaLabel.trim();
    if (cartItems.length === 0 && !hasCurrentItem) {
      toast.error("Nenhuma massa configurada");
      return;
    }

    setSubmitting(true);

    const allItems: CartItem[] = [...cartItems];
    if (hasCurrentItem) {
      allItems.push({
        size,
        pasta,
        sauces,
        ingredients,
        shrimp,
        saute,
        finishing,
        massaLabel: massaLabel.trim(),
        total: currentTotal,
      });
    }

    // Prepara lista de bebidas para texto
    const beverageList: { name: string; count: number; total: number }[] = [];
    for (const cat of BEVERAGE_CATEGORIES) {
      for (const item of cat.items) {
        const count = beverageCounts[item.id] || 0;
        if (count > 0) {
          const fullName =
            cat.name === item.name || cat.items.length === 1
              ? item.name
              : `${cat.name} — ${item.name}`;
          beverageList.push({ name: fullName, count, total: item.price * count });
        }
      }
    }

    // Prepara lista de doces para texto
    const dessertList: { name: string; count: number; total: number }[] = [];
    for (const item of DESSERT_ITEMS) {
      if (item.hasFlavors && item.flavors) {
        for (const f of item.flavors) {
          const count = dessertCounts[`${item.id}_${f}`] || 0;
          if (count > 0) {
            dessertList.push({
              name: `${item.name} — ${f}`,
              count,
              total: item.price * count,
            });
          }
        }
      } else {
        const count = dessertCounts[item.id] || 0;
        if (count > 0) {
          dessertList.push({ name: item.name, count, total: item.price * count });
        }
      }
    }

    const orderNumbers: number[] = [];
    const paymentLabel =
      PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? "A combinar";

    // Envia cada massa para a tabela do Supabase
    for (let i = 0; i < allItems.length; i++) {
      const item = allItems[i];
      if (!item) continue;
      const extraNotesParts: string[] = [];
      extraNotesParts.push(`[Para: ${item.massaLabel}]`);
      if (paymentMethod) extraNotesParts.push(`[Pagamento: ${paymentLabel}]`);
      if (i === 0) {
        if (beverageList.length > 0) {
          extraNotesParts.push(
            `[Bebidas: ${beverageList.map((b) => `${b.count}x ${b.name}`).join(", ")}]`,
          );
        }
        if (dessertList.length > 0) {
          extraNotesParts.push(
            `[Doces: ${dessertList.map((d) => `${d.count}x ${d.name}`).join(", ")}]`,
          );
        }
      }
      if (customer.notes) extraNotesParts.push(customer.notes);

      try {
        const { data, error } = await supabase.rpc("create_order", {
          p_customer_name: customer.name,
          p_phone: customer.phone,
          p_order_type: customer.orderType,
          p_address: customer.address,
          p_number: customer.number,
          p_complement: customer.complement,
          p_neighborhood: customer.neighborhood,
          p_reference: customer.reference,
          p_size: item.size,
          p_pasta_type: item.pasta,
          p_sauce: item.sauces.join(" + "),
          p_ingredients: item.ingredients,
          p_shrimp: item.shrimp,
          p_saute_type: item.saute,
          p_finishing: item.finishing,
          p_notes: extraNotesParts.join(" "),
        });

        if (!error) {
          const row = (data as { order_number: number }[] | null)?.[0] ?? null;
          if (row) orderNumbers.push(row.order_number);
        }
      } catch (err) {
        console.error("Erro ao criar pedido no Supabase:", err);
      }
    }

    setSubmitting(false);

    // Formatação elegante da mensagem do WhatsApp conforme solicitado
    const massasText = allItems
      .map((item, idx) => {
        return [
          `*Massa ${idx + 1} — ${item.massaLabel}*`,
          `• Tamanho: ${sizeInfo(item.size)?.label}`,
          `• Massa: ${item.pasta}`,
          `• Molhos: ${item.sauces.join(", ")}`,
          `• Adicionais: ${item.ingredients.length ? item.ingredients.join(", ") : "Nenhum"}`,
          item.shrimp ? `• Camarão: Sim (+ ${brl(SHRIMP_PRICE)})` : null,
          `• Refogado: ${item.saute}`,
          `• Finalização: ${item.finishing.length ? item.finishing.join(", ") : "Nenhuma"}`,
          `• Valor: ${brl(item.total)}`,
        ]
          .filter(Boolean)
          .join("\n");
      })
      .join("\n\n");

    const beveragesText =
      beverageList.length > 0
        ? `*🥤 BEBIDAS*\n` +
          beverageList.map((b) => `• ${b.count}x ${b.name} — ${brl(b.total)}`).join("\n")
        : null;

    const dessertsText =
      dessertList.length > 0
        ? `*🍫 DOCES*\n` +
          dessertList.map((d) => `• ${d.count}x ${d.name} — ${brl(d.total)}`).join("\n")
        : null;

    const waMessageParts = [
      `*🍝 NOVO PEDIDO* — Sr e Sra Massas`,
      orderNumbers.length > 0 ? `(Painel: #${orderNumbers.join(", #")})` : null,
      ``,
      `*Cliente:* ${customer.name}`,
      customer.orderType === "entrega"
        ? `*Entrega:* ${customer.address}${customer.number ? `, ${customer.number}` : ""}${customer.complement ? ` - ${customer.complement}` : ""}${customer.neighborhood ? ` - ${customer.neighborhood}` : ""}`
        : customer.orderType === "retirada"
          ? "*Retirada no restaurante*"
          : "*Comer no local*",
      customer.phone ? `*Telefone:* ${customer.phone}` : null,
      customer.notes ? `*Obs. Gerais:* ${customer.notes}` : null,
      ``,
      massasText,
      beveragesText ? `\n${beveragesText}` : null,
      dessertsText ? `\n${dessertsText}` : null,
      ``,
      `*💳 FORMA DE PAGAMENTO*`,
      `${paymentLabel}`,
      ``,
      customer.orderType === "entrega" ? `*🛵 Taxa de entrega:* ${brl(7)}` : null,
      `*💰 TOTAL DO PEDIDO: ${brl(finalTotal)}*`,
    ].filter((line) => line !== null);

    const link = whatsappLink(RESTAURANT_WHATSAPP, waMessageParts.join("\n"));
    window.location.href = link;
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
        <StepProgress steps={STEP_LABELS} current={step} onSelect={setStep} />

        <div key={step} className="animate-rise mt-8">
          {/* ETAPA 0: TAMANHO */}
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

          {/* ETAPA 1: MASSA */}
          {step === 1 ? (
            <StepShell title="Escolha sua massa" subtitle="Uma opção por prato.">
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

          {/* ETAPA 2: MOLHOS (MÚLTIPLA SELEÇÃO) */}
          {step === 2 ? (
            <StepShell
              title="Escolha seus molhos"
              subtitle="Você pode escolher mais de um molho para misturar!"
              badge={
                sauces.length > 0 ? `${sauces.length} selecionado(s)` : "Pelo menos 1 obrigatório"
              }
            >
              <div className="grid gap-3 sm:grid-cols-2">
                {SAUCES.map((s) => (
                  <OptionCard
                    key={s.id}
                    title={s.id}
                    description={s.desc}
                    selected={sauces.includes(s.id)}
                    onClick={() => toggleSauce(s.id)}
                  />
                ))}
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 3: INGREDIENTES */}
          {step === 3 ? (
            <StepShell
              title="Escolha seus ingredientes"
              subtitle="Todos inclusos no preço, dentro do limite do tamanho."
              badge={`${ingredients.length} / ${limit} ingredientes`}
            >
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {INGREDIENTS.map((i) => {
                  const isUnavailable = unavailableIngredients.includes(i.id);
                  return (
                    <div key={i.id} className="relative">
                      <OptionCard
                        compact
                        emoji={i.emoji}
                        title={i.id}
                        selected={ingredients.includes(i.id)}
                        disabled={
                          isUnavailable ||
                          (!ingredients.includes(i.id) && ingredients.length >= limit)
                        }
                        onClick={() => toggleIngredient(i.id)}
                      />
                      {isUnavailable ? (
                        <span className="absolute -top-1.5 -right-1.5 rounded-full bg-red-600 px-2 py-0.5 text-[9px] font-bold text-white shadow">
                          Esgotado
                        </span>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 4: CAMARÃO */}
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

          {/* ETAPA 5: REFOGADO */}
          {step === 5 ? (
            <StepShell title="Como você quer refogar?" subtitle="Uma opção por massa.">
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

          {/* ETAPA 6: FINALIZAÇÃO & NOME OBRIGATÓRIO */}
          {step === 6 ? (
            <StepShell
              title="Finalização e Identificação"
              subtitle="Escolha os toques finais e informe obrigatoriamente de quem é este prato."
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

              <div className="mt-8 rounded-2xl border border-gold/40 bg-gold/5 p-5">
                <Field label="Para quem é essa massa? (OBRIGATÓRIO)">
                  <Input
                    required
                    value={massaLabel}
                    maxLength={50}
                    placeholder="Ex.: Pedro, Maria, Matheus..."
                    className="border-gold/50 bg-background text-base font-semibold"
                    onChange={(e) => setMassaLabel(e.target.value)}
                  />
                </Field>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  A cozinha identificará a embalagem com este nome (Ex:{" "}
                  <strong>Massa {cartItems.length + 1} — {massaLabel || "Pedro"}</strong>).
                </p>
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 7: BEBIDAS (OPCIONAL) */}
          {step === 7 ? (
            <StepShell
              title="Bebidas (Opcional)"
              subtitle="Escolha bebidas para acompanhar seu pedido ou clique em Continuar para pular."
              badge={
                beveragesTotal > 0
                  ? `Bebidas: + ${brl(beveragesTotal)}`
                  : "Etapa opcional"
              }
            >
              <div className="space-y-6">
                {BEVERAGE_CATEGORIES.map((cat) => (
                  <div
                    key={cat.id}
                    className="panel overflow-hidden border border-border/80 p-4 transition-all"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="relative h-28 w-full overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-28 shrink-0">
                        <img
                          src={cat.image}
                          alt={cat.name}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-baseline justify-between">
                          <h3 className="font-display text-lg font-bold text-foreground">
                            {cat.name}
                          </h3>
                          {cat.defaultPrice ? (
                            <span className="font-display text-sm font-bold text-gold">
                              {brl(cat.defaultPrice)}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-3 grid gap-2.5 sm:grid-cols-2">
                          {cat.items.map((item) => {
                            const count = beverageCounts[item.id] || 0;
                            return (
                              <div
                                key={item.id}
                                className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                                  count > 0
                                    ? "border-gold/60 bg-gold/10"
                                    : "border-border/60 bg-secondary/30"
                                }`}
                              >
                                <div>
                                  <p className="text-xs font-semibold text-foreground">
                                    {item.name}
                                  </p>
                                  <p className="text-[11px] text-gold">{brl(item.price)}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                  {count > 0 ? (
                                    <>
                                      <button
                                        type="button"
                                        onClick={() => updateBeverageCount(item.id, -1)}
                                        className="flex size-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-gold/20"
                                      >
                                        <Minus className="size-3.5" />
                                      </button>
                                      <span className="w-5 text-center font-display text-sm font-bold text-gold">
                                        {count}
                                      </span>
                                    </>
                                  ) : null}
                                  <button
                                    type="button"
                                    onClick={() => updateBeverageCount(item.id, 1)}
                                    className="flex size-7 items-center justify-center rounded-lg bg-gold text-background font-bold hover:bg-gold/90 transition-transform active:scale-95"
                                  >
                                    <Plus className="size-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 8: DOCES (OPCIONAL) */}
          {step === 8 ? (
            <StepShell
              title="Doces e Sobremesas (Opcional)"
              subtitle="Que tal um doce para finalizar? Escolha suas opções ou clique em Continuar."
              badge={
                dessertsTotal > 0 ? `Doces: + ${brl(dessertsTotal)}` : "Etapa opcional"
              }
            >
              <div className="grid gap-4 sm:grid-cols-2">
                {DESSERT_ITEMS.map((item) => {
                  if (item.hasFlavors && item.flavors) {
                    return (
                      <div
                        key={item.id}
                        className="panel sm:col-span-2 overflow-hidden border border-border/80 p-4"
                      >
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                          {item.image ? (
                            <div className="relative h-28 w-full overflow-hidden rounded-xl bg-muted sm:h-24 sm:w-28 shrink-0">
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                loading="lazy"
                              />
                            </div>
                          ) : null}
                          <div className="flex-1">
                            <div className="flex items-baseline justify-between">
                              <h3 className="font-display text-lg font-bold text-foreground">
                                {item.name}
                              </h3>
                              <span className="font-display text-sm font-bold text-gold">
                                {brl(item.price)}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              Escolha as unidades por sabor:
                            </p>

                            <div className="mt-3 grid gap-2.5 sm:grid-cols-3">
                              {item.flavors.map((flavor) => {
                                const key = `${item.id}_${flavor}`;
                                const count = dessertCounts[key] || 0;
                                return (
                                  <div
                                    key={flavor}
                                    className={`flex items-center justify-between rounded-xl border p-2.5 transition-colors ${
                                      count > 0
                                        ? "border-gold/60 bg-gold/10"
                                        : "border-border/60 bg-secondary/30"
                                    }`}
                                  >
                                    <div>
                                      <p className="text-xs font-semibold text-foreground">
                                        {flavor}
                                      </p>
                                      <p className="text-[11px] text-gold">{brl(item.price)}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {count > 0 ? (
                                        <>
                                          <button
                                            type="button"
                                            onClick={() => updateDessertCount(key, -1)}
                                            className="flex size-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-gold/20"
                                          >
                                            <Minus className="size-3.5" />
                                          </button>
                                          <span className="w-5 text-center font-display text-sm font-bold text-gold">
                                            {count}
                                          </span>
                                        </>
                                      ) : null}
                                      <button
                                        type="button"
                                        onClick={() => updateDessertCount(key, 1)}
                                        className="flex size-7 items-center justify-center rounded-lg bg-gold text-background font-bold hover:bg-gold/90 transition-transform active:scale-95"
                                      >
                                        <Plus className="size-3.5" />
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  const count = dessertCounts[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      className={`panel flex items-center gap-3.5 p-3.5 border transition-all ${
                        count > 0 ? "border-gold/60 bg-gold/5" : "border-border/70"
                      }`}
                    >
                      {item.image ? (
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-muted">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                          />
                        </div>
                      ) : null}
                      <div className="flex-1">
                        <h4 className="font-display text-sm font-bold text-foreground">
                          {item.name}
                        </h4>
                        <p className="text-xs font-semibold text-gold">{brl(item.price)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        {count > 0 ? (
                          <>
                            <button
                              type="button"
                              onClick={() => updateDessertCount(item.id, -1)}
                              className="flex size-7 items-center justify-center rounded-lg bg-secondary text-foreground hover:bg-gold/20"
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-5 text-center font-display text-sm font-bold text-gold">
                              {count}
                            </span>
                          </>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => updateDessertCount(item.id, 1)}
                          className="flex size-7 items-center justify-center rounded-lg bg-gold text-background font-bold hover:bg-gold/90 transition-transform active:scale-95"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 9: SEUS DADOS & FORMA DE PAGAMENTO */}
          {step === 9 ? (
            <StepShell
              title="Seus dados & Forma de pagamento"
              subtitle="Informe onde entregar e como deseja realizar o pagamento no momento do pedido."
            >
              <div className="grid gap-5">
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
                    description="Levamos até você (+ R$ 7)"
                    selected={customer.orderType === "entrega"}
                    onClick={() => setCustomer({ ...customer, orderType: "entrega" })}
                  />
                </div>

                {customer.orderType === "entrega" ? (
                  <div className="animate-rise grid gap-4 sm:grid-cols-2">
                    <Field label="Endereço">
                      <Input
                        value={customer.address}
                        placeholder="Rua, Avenida..."
                        onChange={(e) => setCustomer({ ...customer, address: e.target.value })}
                      />
                    </Field>
                    <Field label="Número">
                      <Input
                        value={customer.number}
                        placeholder="Nº"
                        onChange={(e) => setCustomer({ ...customer, number: e.target.value })}
                      />
                    </Field>
                    <Field label="Complemento">
                      <Input
                        value={customer.complement}
                        placeholder="Apto, Bloco..."
                        onChange={(e) => setCustomer({ ...customer, complement: e.target.value })}
                      />
                    </Field>
                    <Field label="Bairro">
                      <Input
                        value={customer.neighborhood}
                        placeholder="Bairro"
                        onChange={(e) => setCustomer({ ...customer, neighborhood: e.target.value })}
                      />
                    </Field>
                    <div className="sm:col-span-2">
                      <Field label="Ponto de Referência">
                        <Input
                          value={customer.reference}
                          placeholder="Próximo a..."
                          onChange={(e) => setCustomer({ ...customer, reference: e.target.value })}
                        />
                      </Field>
                    </div>
                  </div>
                ) : null}

                {/* FORMA DE PAGAMENTO (OBRIGATÓRIO) */}
                <div className="mt-2 space-y-3 rounded-2xl border border-gold/30 bg-gold/5 p-4">
                  <div>
                    <Label className="text-xs font-bold tracking-wider text-gold uppercase">
                      Forma de Pagamento (Obrigatório)
                    </Label>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Informe como irá pagar ao receber ou retirar seu pedido:
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
                    {PAYMENT_METHODS.map((pm) => (
                      <button
                        key={pm.id}
                        type="button"
                        onClick={() => setPaymentMethod(pm.id)}
                        className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border p-3 text-center transition-all ${
                          paymentMethod === pm.id
                            ? "border-gold bg-gold/20 text-gold shadow-md"
                            : "border-border/80 bg-secondary/40 text-foreground hover:border-gold/40"
                        }`}
                      >
                        <span className="text-xl">{pm.iconEmoji}</span>
                        <span className="text-xs font-bold">{pm.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <Field label="Observações adicionais (opcional)">
                  <Textarea
                    value={customer.notes}
                    maxLength={400}
                    placeholder="Ex.: Troco para 50, sem cebola, etc."
                    onChange={(e) => setCustomer({ ...customer, notes: e.target.value })}
                  />
                </Field>
              </div>
            </StepShell>
          ) : null}

          {/* ETAPA 10: RESUMO */}
          {step === 10 ? (
            <StepShell title="Resumo do Pedido" subtitle="Confira tudo antes de enviar ao restaurante.">
              <div className="space-y-4">
                {cartItems.map((item, idx) => (
                  <div key={idx} className="panel divide-y divide-border/70 relative">
                    <div className="p-4 bg-gold/5 font-bold text-gold border-b border-border/70 flex justify-between items-center">
                      <span>
                        Massa {idx + 1} — {item.massaLabel}
                      </span>
                      <span>{brl(item.total)}</span>
                    </div>
                    <SummaryRow label="Tamanho" value={sizeInfo(item.size)?.label ?? "-"} />
                    <SummaryRow label="Massa" value={item.pasta ?? "-"} />
                    <SummaryRow label="Molhos" list={item.sauces} />
                    <SummaryRow label="Ingredientes" list={item.ingredients} />
                    {item.shrimp && (
                      <SummaryRow label="Camarão" value="Sim" extra={`+ ${brl(SHRIMP_PRICE)}`} />
                    )}
                    <SummaryRow label="Refogado" value={item.saute ?? "-"} />
                    <SummaryRow label="Finalização" list={item.finishing} />
                  </div>
                ))}

                {isBuildingItem && (
                  <div className="panel divide-y divide-border/70 relative border-gold/50 shadow-gold/10 shadow-lg">
                    <div className="p-4 bg-gold/10 font-bold text-gold border-b border-border/70 flex justify-between items-center">
                      <span>
                        Massa {cartItems.length + 1} — {massaLabel || "Atual"}
                      </span>
                      <span>{brl(currentTotal)}</span>
                    </div>
                    <SummaryRow
                      label="Tamanho"
                      value={info?.label ?? "-"}
                      extra={brl(info?.price ?? 0)}
                    />
                    <SummaryRow label="Massa" value={pasta ?? "-"} />
                    <SummaryRow label="Molhos" list={sauces} />
                    <SummaryRow label="Ingredientes" list={ingredients} />
                    {shrimp && (
                      <SummaryRow label="Camarão" value="Sim" extra={`+ ${brl(SHRIMP_PRICE)}`} />
                    )}
                    <SummaryRow label="Refogado" value={saute ?? "-"} />
                    <SummaryRow label="Finalização" list={finishing} />
                  </div>
                )}

                <Button variant="outline" className="w-full mt-4" onClick={addToCartAndAddAnother}>
                  <Plus className="mr-2" /> ADICIONAR OUTRA MASSA AO PEDIDO
                </Button>

                {/* Resumo de Bebidas e Doces */}
                {(beveragesTotal > 0 || dessertsTotal > 0) && (
                  <div className="panel divide-y divide-border/70">
                    {beveragesTotal > 0 && (
                      <div className="p-4">
                        <p className="text-xs font-bold tracking-wider text-gold uppercase mb-2">
                          🥤 Bebidas Selecionadas
                        </p>
                        <div className="space-y-1 text-sm">
                          {BEVERAGE_CATEGORIES.flatMap((c) => c.items).map((item) => {
                            const count = beverageCounts[item.id] || 0;
                            if (count === 0) return null;
                            return (
                              <div key={item.id} className="flex justify-between">
                                <span>
                                  {count}x {item.name}
                                </span>
                                <span className="font-semibold">{brl(item.price * count)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {dessertsTotal > 0 && (
                      <div className="p-4">
                        <p className="text-xs font-bold tracking-wider text-gold uppercase mb-2">
                          🍫 Doces Selecionados
                        </p>
                        <div className="space-y-1 text-sm">
                          {DESSERT_ITEMS.map((item) => {
                            if (item.hasFlavors && item.flavors) {
                              return item.flavors.map((f) => {
                                const count = dessertCounts[`${item.id}_${f}`] || 0;
                                if (count === 0) return null;
                                return (
                                  <div key={f} className="flex justify-between">
                                    <span>
                                      {count}x {item.name} ({f})
                                    </span>
                                    <span className="font-semibold">{brl(item.price * count)}</span>
                                  </div>
                                );
                              });
                            }
                            const count = dessertCounts[item.id] || 0;
                            if (count === 0) return null;
                            return (
                              <div key={item.id} className="flex justify-between">
                                <span>
                                  {count}x {item.name}
                                </span>
                                <span className="font-semibold">{brl(item.price * count)}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Dados do Cliente e Pagamento */}
                <div className="panel divide-y divide-border/70 mt-6">
                  <div className="p-4 bg-muted/30 font-bold border-b border-border/70">
                    Dados e Entrega
                  </div>
                  <SummaryRow
                    label="Cliente"
                    value={
                      customer.orderType === "local"
                        ? customer.name
                        : `${customer.name} · ${customer.phone}`
                    }
                  />
                  <SummaryRow
                    label="Entrega"
                    value={
                      customer.orderType === "entrega"
                        ? `${customer.address}, ${customer.number} — ${customer.neighborhood}`
                        : customer.orderType === "local"
                          ? "Comer no local"
                          : "Retirada no restaurante"
                    }
                  />
                  <SummaryRow
                    label="Forma de Pagamento"
                    value={
                      PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label ?? "Não informada"
                    }
                  />
                  {customer.orderType === "entrega" && (
                    <SummaryRow label="Taxa de Entrega" value="Fixo" extra={brl(7)} />
                  )}
                  {customer.notes ? <SummaryRow label="Observações" value={customer.notes} /> : null}
                  <div className="flex items-center justify-between p-5">
                    <span className="font-display text-lg font-bold text-foreground">
                      TOTAL DO PEDIDO
                    </span>
                    <span className="font-display text-3xl font-bold text-gradient-gold">
                      {brl(finalTotal)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-6">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <Button
                    variant="gold"
                    size="xl"
                    className="flex-1"
                    disabled={submitting || (cartItems.length === 0 && !isBuildingItem)}
                    onClick={submitOrder}
                  >
                    {submitting ? <Loader2 className="animate-spin" /> : <MessageCircle />}
                    ENVIAR NO WHATSAPP
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

                {/* ⚠️ LEMBRETE FIXO APÓS ENVIAR O PEDIDO */}
                <p className="mt-3 text-center text-xs font-semibold text-gold">
                  ⚠️ Aguarde a confirmação do seu pedido pelo WhatsApp.
                </p>
              </div>
            </StepShell>
          ) : null}
        </div>
      </main>

      {/* Barra fixa de navegação inferior */}
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
            <p className="text-[11px] text-muted-foreground">Total do Pedido</p>
            <p className="font-display text-xl font-bold text-gold">{brl(finalTotal)}</p>
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
