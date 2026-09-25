import { AxiosError } from "axios";

/**
 * Exact `detail` strings the FastAPI backend (Flagger_app) is known to
 * return, mapped to copy that's safe to show a user. Anything not listed
 * here falls back to GENERIC_ERROR_MESSAGE — we never render a raw backend
 * message, since backend wording can change or leak implementation detail.
 */
/**
 * The backend's generic wording for a duplicate-face rejection during
 * biometric registration — deliberately vague on its side (it never says
 * "duplicate" to avoid confirming a match to whoever's attempting it), but
 * the frontend knows exactly what this specific string means and can be
 * direct about the one real path forward: manual registration via admin.
 */
const DUPLICATE_FACE_DETAIL =
  "Registration could not be completed at this time. Please wait, expect response within 24hrs";

const KNOWN_ERROR_MESSAGES: Record<string, string> = {
  "Invalid email or password": "The email or password you entered is incorrect.",
  "Phone number already registered": "An account with that phone number already exists.",
  "Email already registered": "An account with that email already exists.",
  "Invalid Lesotho phone number.": "Enter a valid Lesotho phone number (+266 followed by 8 digits).",
  "Invalid or expired token": "Your session has expired. Please log in again.",
  "Invalid token payload": "Your session has expired. Please log in again.",
  "User not found": "Your session has expired. Please log in again.",
  "Failed to process image file uploads.": "We couldn't process that image. Please try again.",
  "Could not securely process biometric data. Please try again.":
    "We couldn't process your photo securely. Please try again.",
  "Request already pending": "You've already requested access to this profile — waiting for them to approve it.",
  "You already have access": "You already have access to this profile.",
  [DUPLICATE_FACE_DETAIL]:
    "We couldn't verify your identity automatically — this usually happens when our system flags a possible match with an existing account. Retrying won't help. Contact admin below and we'll complete your registration manually.",
};

export const GENERIC_ERROR_MESSAGE = "Something went wrong. Please try again.";
export const RATE_LIMIT_MESSAGE = "Too many attempts. Please wait before trying again.";

function detailToMessage(detail: string): string {
  if (KNOWN_ERROR_MESSAGES[detail]) return KNOWN_ERROR_MESSAGES[detail];
  // Backend sometimes prefixes quality-check rejections, e.g.
  // "Selfie quality rejection: Image quality is too low for reliable recognition."
  if (detail.startsWith("Selfie quality rejection:")) {
    return "Image too dark or blurry. Please retake in better lighting.";
  }
  return GENERIC_ERROR_MESSAGE;
}

/** True when this is specifically the duplicate-face registration rejection. */
export function isDuplicateFaceError(error: unknown): boolean {
  return error instanceof AxiosError && error.response?.data?.detail === DUPLICATE_FACE_DETAIL;
}

/** Turns any error from the API client into a message that's safe to show the user. */
export function  getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    if (error.response?.status === 429) return RATE_LIMIT_MESSAGE;

    const detail = error.response?.data?.detail;
    if (typeof detail === "string") return detailToMessage(detail);

    // FastAPI validation errors (422) come back as detail: [{msg, loc, ...}]
    if (Array.isArray(detail) && detail.length > 0 && typeof detail[0]?.msg === "string") {
      return GENERIC_ERROR_MESSAGE;
    }
  }
  return GENERIC_ERROR_MESSAGE;
}

/** Logs the raw error for debugging — development only, never in production. */
export function logErrorInDev(context: string, error: unknown): void {
  if (process.env.NODE_ENV === "development") {
    // eslint-disable-next-line no-console
    console.error(`[${context}]`, error);
  }
}
