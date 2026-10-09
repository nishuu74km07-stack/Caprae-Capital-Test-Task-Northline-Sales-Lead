import type { EmailCheck } from "./types";

const ROLE_LOCALS = new Set(["info", "sales", "contact", "hello", "office", "admin", "support", "team"]);
const DISPOSABLE_DOMAINS = new Set(["mailinator.com", "guerrillamail.com", "tempmail.com", "10minutemail.com"]);

export function checkEmail(email: string): EmailCheck {
  const trimmed = email.trim();
  const validShape = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(trimmed);
  if (!validShape) {
    return { valid: false, roleAccount: false, note: "This address is not usable. Check it before anyone dials." };
  }

  const [local, domain] = trimmed.toLowerCase().split("@");
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { valid: false, roleAccount: false, note: "Disposable domain. Do not treat this as the owner." };
  }
  if (ROLE_LOCALS.has(local)) {
    return {
      valid: true,
      roleAccount: true,
      note: "Generic inbox. Ask for the owner before you count this as a direct line.",
    };
  }
  return { valid: true, roleAccount: false, note: "Looks like a direct address." };
}
