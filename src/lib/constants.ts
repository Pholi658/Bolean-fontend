// Carried over from the original prototype's mock data — placeholder support
// contact until the real number is provided.
export const ADMIN_WHATSAPP = "26659000000";
export const ADMIN_WHATSAPP_DISPLAY = "+266 5900 0000";

export function openWhatsApp(phone: string, message: string) {
  window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
}
