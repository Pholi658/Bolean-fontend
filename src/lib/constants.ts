import { logErrorInDev } from "@/lib/errors";

const rawAdminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP;

if (!rawAdminWhatsApp && typeof window !== "undefined") {
  logErrorInDev("constants", "NEXT_PUBLIC_ADMIN_WHATSAPP is not set");
}

/** Digits only, no "+" — the format wa.me/tel: links need. */
export const ADMIN_WHATSAPP = rawAdminWhatsApp ?? "";

/** "26662338327" -> "+266 6233 8327" — Lesotho numbers are a 3-digit
 *  country code plus an 8-digit local number; displayed as two groups of 4
 *  so it reads the same way phone numbers are shown everywhere else in the
 *  app, without needing a second env var that could drift out of sync with
 *  the raw one above. */
function formatAdminPhoneDisplay(raw: string): string {
  if (raw.length < 4) return raw;
  const countryCode = raw.slice(0, 3);
  const local = raw.slice(3);
  const groups = [local.slice(0, 4), local.slice(4)].filter(Boolean);
  return `+${countryCode} ${groups.join(" ")}`;
}

export const ADMIN_WHATSAPP_DISPLAY = formatAdminPhoneDisplay(ADMIN_WHATSAPP);

export function openWhatsApp(phone: string, message: string) {
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
}
