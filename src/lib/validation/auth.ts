import { z } from "zod";

/**
 * Mirrors app/utils/phone_normalization.py: strips spaces/dashes/parens,
 * accepts a bare "5XXXXXXX"/"6XXXXXXX" number, a "266..." or "+266..."
 * prefixed one, and normalizes all of them to "+266[56]XXXXXXX". The
 * backend is still the source of truth — this only spares the user a
 * round trip for an obviously malformed number.
 */
export function normalizeLesothoPhone(raw: string): string | null {
  const stripped = raw.replace(/[\s\-()]/g, "");
  let candidate = stripped;

  if (candidate.startsWith("266")) {
    candidate = `+${candidate}`;
  } else if (/^[56]\d{7}$/.test(candidate)) {
    candidate = `+266${candidate}`;
  }

  return /^\+266[56]\d{7}$/.test(candidate) ? candidate : null;
}

const phoneSchema = z
  .string()
  .min(1, "Phone number is required")
  .transform((val, ctx) => {
    const normalized = normalizeLesothoPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Lesotho number: +266 followed by 8 digits starting with 5 or 6.",
      });
      return z.NEVER;
    }
    return normalized;
  });

const optionalPhoneSchema = z
  .string()
  .optional()
  .transform((val, ctx) => {
    if (!val) return undefined;
    const normalized = normalizeLesothoPhone(val);
    if (!normalized) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Enter a valid Lesotho number: +266 followed by 8 digits starting with 5 or 6.",
      });
      return z.NEVER;
    }
    return normalized;
  });

// Backend (UserRegister.password) only enforces min 8 / max 128 — the
// number + special character rule below is a client-side strengthening on
// top of that, per the security spec. The backend remains authoritative;
// we never rely on this alone.
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password must be at most 128 characters")
  .refine((val) => /\d/.test(val), "Password must contain at least one number")
  .refine((val) => /[^A-Za-z0-9]/.test(val), "Password must contain at least one special character");

export const loginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerStep1Schema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name must be at most 100 characters"),
    phone_number: phoneSchema,
    same_as_phone: z.boolean().default(false),
    whatsapp_number: optionalPhoneSchema,
    email: z.string().min(1, "Email is required").email("Enter a valid email address"),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });
export type RegisterStep1Values = z.infer<typeof registerStep1Schema>;

export function passwordStrength(password: string): { score: number; label: string } {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  const labels = ["Too weak", "Weak", "Fair", "Strong"] as const;
  return { score, label: labels[Math.max(0, score - 1)] ?? "Too weak" };
}
