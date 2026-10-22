export const AV_ICONS = ["tree", "star", "gift", "snow", "bell", "ball", "cane", "mitten", "snowman", "moon", "heart", "ginger"];
export const AV_COLORS = ["#3e5643", "#b8684f", "#d4a359", "#8e3b46", "#6f9bb4", "#6d5a7d"];

export const FANDOMS = ["Marvel", "DC", "Гаррі Поттер", "Зоряні війни", "Володар перснів", "Відьмак", "Disney / Pixar", "Studio Ghibli", "Аніме", "Манга / манхва", "K-pop", "BL / яой", "Genshin Impact", "Minecraft", "Pokémon", "Шерлок", "Друзі", "Дивні дива"];
export const MERCH = ["Акрилові фігурки", "Чібі-акрилки", "Фігурки", "Колекційні картки", "Плюші", "Брелоки", "Значки", "Постери та арти", "Стікери", "Книги / манга / комікси", "Лего", "Настільні ігри", "Одяг та аксесуари", "Косметика та догляд", "Солодощі", "Декор для дому", "Канцелярія", "Рандомні дрібнички"];
export const CARRIERS = ["Нова пошта", "Укрпошта", "Meest", "Інше"];

export const Q = {
  fandoms: "Фандоми, які вас цікавлять",
  fandomsText: "Ще фандоми та деталі",
  chars: "Улюблені персонажі та пейринги",
  merch: "Що любите отримувати",
  wishes: "Конкретні побажання та вішліст",
  links: "Посилання на бажані речі",
  avoid: "Що ТОЧНО не хочете отримати",
  fio: "ПІБ",
  city: "Місто",
  carrier: "Служба доставки",
  branch: "Відділення, поштомат або індекс",
  phone: "Номер телефону",
  question: "Питання до організаторів",
};

/** Base path of the app (the Webflow Cloud mount, e.g. "/app"), without trailing slash. */
export const BASE = (import.meta.env.BASE_URL || "/").replace(/\/+$/, "");
export const u = (p: string) => `${BASE}${p.startsWith("/") ? p : "/" + p}`;

export function validAvatar(icon?: string | null, color?: string | null) {
  if (icon && color && AV_ICONS.includes(icon) && AV_COLORS.includes(color)) return { icon, color };
  return null;
}

export function randAvatar() {
  return {
    icon: AV_ICONS[Math.floor(Math.random() * AV_ICONS.length)],
    color: AV_COLORS[Math.floor(Math.random() * AV_COLORS.length)],
  };
}

export function initials(n?: string | null) {
  return (n || "?")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();
}

export function fmtDate(d?: string | null) {
  if (!d) return "дата не вказана";
  const months = ["січня", "лютого", "березня", "квітня", "травня", "червня", "липня", "серпня", "вересня", "жовтня", "листопада", "грудня"];
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(d);
  if (!m) return d;
  return `${parseInt(m[3], 10)} ${months[parseInt(m[2], 10) - 1] ?? ""}`;
}

export function ago(t?: number | null) {
  if (!t) return "";
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return "щойно";
  if (m < 60) return m + " хв тому";
  const h = Math.round(m / 60);
  if (h < 24) return h + " год тому";
  return Math.round(h / 24) + " дн. тому";
}

export function genCode() {
  const a = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let s = "";
  for (const b of bytes) s += a[b % a.length];
  return s;
}

export const emailOk = (e: string) => /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e);

export function str(fd: FormData, k: string, max = 2000) {
  const v = fd.get(k);
  return typeof v === "string" ? v.trim().slice(0, max) : "";
}

export function inviteText(g: any) {
  return `Привіт! Запрошую тебе в Таємного Санту «${g.name}».

Бюджет: ${g.budget || "на власний розсуд"}
Обмін подарунками: ${fmtDate(g.date)}

1. Відкрий сайт Evergreen за посиланням, яке я надсилаю разом із цим повідомленням.
2. Натисни «Приєднатися за кодом» і введи код: ${g.code}
3. Заповни коротку анкету про подарунок.
${g.note ? "\n" + g.note + "\n" : ""}
До зустрічі! ${g.owner_name || ""}`;
}

/** Only allow in-app redirect targets like "/create" or "/join?code=AB12CD". */
export function safeNext(n: string | null | undefined, fallback = "/cabinet") {
  if (n && /^\/[a-z]+(\/[A-Z0-9]{6})?(\?code=[A-Z0-9]{6})?$/.test(n)) return n;
  return fallback;
}
