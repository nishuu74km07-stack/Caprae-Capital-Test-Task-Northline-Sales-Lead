export function digitsOnly(phone: string): string {
  return phone.replace(/\D/g, "");
}

export function nationalDigits(phone: string): string {
  const digits = digitsOnly(phone);
  if (digits.length === 11 && digits.startsWith("1")) return digits.slice(1);
  return digits.length === 10 ? digits : "";
}

export function isValidUsPhone(phone: string): boolean {
  const digits = nationalDigits(phone);
  return digits.length === 10 && digits[0] !== "0" && digits[0] !== "1";
}

export function formatPhone(phone: string): string {
  const digits = nationalDigits(phone);
  if (!digits) return phone.trim() || "—";
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
