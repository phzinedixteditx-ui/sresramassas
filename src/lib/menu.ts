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