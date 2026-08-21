export type SizeId = "pequeno" | "grande";

export const SIZES: { id: SizeId; label: string; price: number; limit: number }[] = [
  { id: "pequeno", label: "Pequeno", price: 24, limit: 6 },
  { id: "grande", label: "Grande", price: 27, limit: 8 },
];

export const SHRIMP_PRICE = 10;

/** WhatsApp oficial do restaurante (somente dígitos, com DDI) */
export const RESTAURANT_WHATSAPP = "5531999101195";
export const RESTAURANT_WHATSAPP_LABEL = "+55 31 99910-1195";

export function whatsappLink(phone: string, message?: string) {
  const digits = phone.replace(/\D/g, "");
  const withDdi = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withDdi}${message ? `?text=${encodeURIComponent(message)}` : ""}`;
}

export const PASTAS = [
  { id: "Penne", desc: "Tubos curtos, perfeitos para molhos encorpados" },
  { id: "Talharim", desc: "Fitas largas e sedosas, clássicas da casa" },
  { id: "Espaguete", desc: "O fio tradicional que todo mundo ama" },
];

export const SAUCES = [
  { id: "Molho Branco", desc: "Cremoso, delicado e aveludado" },
  { id: "Bolonhesa", desc: "Carne moída apurada no tomate" },
  { id: "Ao Sugo", desc: "Tomate fresco, alho e manjericão" },
  { id: "Misturado", desc: "Branco + bolonhesa na medida certa" },
];

export const INGREDIENTS: { id: string; emoji: string }[] = [
  { id: "Tomate", emoji: "🍅" },
  { id: "Palmito", emoji: "🌱" },
  { id: "Milho", emoji: "🌽" },
  { id: "Calabresa", emoji: "🌶️" },
  { id: "Bacon", emoji: "🥓" },
  { id: "Presunto", emoji: "🍖" },
  { id: "Peito de peru", emoji: "🦃" },
  { id: "Queijo branco", emoji: "🧀" },
  { id: "Queijo parmesão", emoji: "🧀" },
  { id: "Queijo mussarela", emoji: "🧀" },
  { id: "Passas", emoji: "🍇" },
  { id: "Cebola", emoji: "🧅" },
  { id: "Alho-poró", emoji: "🥬" },
  { id: "Carne seca", emoji: "🥩" },
  { id: "Salsa", emoji: "🌿" },
  { id: "Brócolis", emoji: "🥦" },
  { id: "Frango", emoji: "🍗" },
  { id: "Ovo de codorna", emoji: "🥚" },
  { id: "Azeitona preta", emoji: "🫒" },
  { id: "Azeitona comum", emoji: "🫒" },
  { id: "Ervilha", emoji: "🟢" },
];

export const SAUTES = [
  { id: "Na manteiga", emoji: "🧈", desc: "Sabor clássico e marcante" },
  { id: "No azeite", emoji: "🫗", desc: "Leve, aromático e italiano" },
];

export const FINISHINGS = [
  { id: "Queijo ralado", emoji: "🧀" },
  { id: "Orégano", emoji: "🌿" },
  { id: "Manjericão", emoji: "🌱" },
  { id: "Alho frito", emoji: "🧄" },
  { id: "Pimenta calabresa", emoji: "🌶️" },
  { id: "Azeite", emoji: "🫒" },
];

// --- BEBIDAS ---
export type BeverageItem = {
  id: string;
  name: string;
  price: number;
};

export type BeverageCategory = {
  id: string;
  name: string;
  image: string;
  defaultPrice?: number;
  items: BeverageItem[];
};

export const BEVERAGE_CATEGORIES: BeverageCategory[] = [
  {
    id: "long_neck",
    name: "Long neck",
    image: "/images/long-neck.jpg",
    items: [
      { id: "heineken", name: "Heineken", price: 14 },
      { id: "stella", name: "Stella", price: 12 },
      { id: "eisenbahn", name: "Eisenbahn", price: 12 },
      { id: "corona", name: "Corona", price: 15 },
      { id: "ice", name: "Ice", price: 10 },
    ],
  },
  {
    id: "refri_600",
    name: "Refrigerante 600 ml",
    image: "/images/refri-600.jpg",
    defaultPrice: 10,
    items: [
      { id: "coca_600_zero", name: "Coca-Cola Zero", price: 10 },
      { id: "coca_600", name: "Coca-Cola", price: 10 },
      { id: "fanta_600", name: "Fanta", price: 10 },
      { id: "fanta_uva_600", name: "Fanta Uva", price: 10 },
      { id: "sprite_600", name: "Sprite", price: 10 },
    ],
  },
  {
    id: "refri_mini",
    name: "Refrigerante Mini",
    image: "/images/refri-mini.jpg",
    defaultPrice: 4,
    items: [
      { id: "coca_mini_zero", name: "Coca-Cola Zero", price: 4 },
      { id: "coca_mini", name: "Coca-Cola", price: 4 },
      { id: "guarana_mini_zero", name: "Guaraná Zero", price: 4 },
      { id: "guarana_mini", name: "Guaraná", price: 4 },
    ],
  },
  {
    id: "agua_sem_gas",
    name: "Água sem gás",
    image: "/images/agua-sem-gas.jpg",
    defaultPrice: 4,
    items: [{ id: "agua_sem_gas", name: "Água sem gás", price: 4 }],
  },
  {
    id: "agua_com_gas",
    name: "Água com gás",
    image: "/images/agua-com-gas.jpg",
    defaultPrice: 5,
    items: [{ id: "agua_com_gas", name: "Água com gás", price: 5 }],
  },
  {
    id: "gatorade",
    name: "Gatorade / Powerade",
    image: "/images/gatorade.jpg",
    defaultPrice: 9,
    items: [
      { id: "gatorade_uva", name: "Uva", price: 9 },
      { id: "gatorade_limao", name: "Limão", price: 9 },
      { id: "gatorade_laranja", name: "Laranja", price: 9 },
      { id: "gatorade_frutas_tropicais", name: "Frutas tropicais", price: 9 },
    ],
  },
  {
    id: "h2oh",
    name: "H2OH! Limoneto",
    image: "/images/h2oh.jpg",
    defaultPrice: 8,
    items: [{ id: "h2oh_limoneto", name: "H2OH! Limoneto", price: 8 }],
  },
  {
    id: "red_bull",
    name: "Red Bull",
    image: "/images/red-bull.jpg",
    defaultPrice: 13,
    items: [{ id: "red_bull_tradicional", name: "Red Bull", price: 13 }],
  },
  {
    id: "suco_del_valle",
    name: "Suco Del Valle",
    image: "/images/suco-del-valle.jpg",
    defaultPrice: 7,
    items: [
      { id: "del_valle_maracuja", name: "Maracujá", price: 7 },
      { id: "del_valle_goiaba", name: "Goiaba", price: 7 },
      { id: "del_valle_uva", name: "Uva", price: 7 },
    ],
  },
];

// --- DOCES ---
export type DessertItem = {
  id: string;
  name: string;
  price: number;
  image?: string; // Opcional (Patê e Pavê SEM imagem)
  hasFlavors?: boolean;
  flavors?: string[];
};

export const DESSERT_ITEMS: DessertItem[] = [
  {
    id: "laka",
    name: "Laka",
    price: 4.5,
    image: "/images/laka.jpg",
  },
  {
    id: "prestigio",
    name: "Prestígio",
    price: 4.5,
    image: "/images/prestigio.jpg",
  },
  {
    id: "trento",
    name: "Trento",
    price: 4.5,
    image: "/images/trento.jpg",
  },
  {
    id: "batom",
    name: "Batom",
    price: 3.5,
    image: "/images/batom.jpg",
  },
  {
    id: "halls",
    name: "Halls",
    price: 3.5,
    image: "/images/halls.jpg",
  },
  {
    id: "trident",
    name: "Trident",
    price: 4.0,
    image: "/images/trident.jpg",
  },
  {
    id: "mentos",
    name: "Mentos",
    price: 4.0,
    image: "/images/mentos.jpg",
  },
  {
    id: "pave",
    name: "Pavê",
    price: 10.0,
    image: "/images/PAVE.jpg",
    hasFlavors: true,
    flavors: ["Amendoim", "Coco", "Morango"],
  },
];

// --- FORMAS DE PAGAMENTO ---
export type PaymentMethod = "pix" | "cartao_credito" | "cartao_debito" | "dinheiro";

export const PAYMENT_METHODS: { id: PaymentMethod; label: string; group: string; iconEmoji: string }[] = [
  { id: "pix", label: "Pix", group: "Pix", iconEmoji: "⚡" },
  { id: "cartao_credito", label: "Cartão — Crédito", group: "Cartão", iconEmoji: "💳" },
  { id: "cartao_debito", label: "Cartão — Débito", group: "Cartão", iconEmoji: "💳" },
  { id: "dinheiro", label: "Dinheiro", group: "Dinheiro", iconEmoji: "💵" },
];

export const STATUS_FLOW = [
  { id: "novo", label: "Novo" },
  { id: "em_preparo", label: "Em preparo" },
  { id: "pronto", label: "Pronto" },
  { id: "saiu_entrega", label: "Saiu para entrega" },
  { id: "concluido", label: "Concluído" },
] as const;

export type OrderStatus = (typeof STATUS_FLOW)[number]["id"];

export function sizeInfo(size: SizeId | null) {
  return SIZES.find((s) => s.id === size) ?? null;
}

export function brl(value: number) {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}
