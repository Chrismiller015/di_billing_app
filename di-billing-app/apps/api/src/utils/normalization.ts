export function normalizeBac(input: string | number): string {
  const digits = String(input ?? "").replace(/\D+/g, "");
  if (digits.length <= 6) {
    return digits.padStart(6, "0");
  }
  return digits.slice(-7, -1);
}

export function toWholeDollars(value: unknown): number {
const n = Number(value);
if (!Number.isFinite(n) || !Number.isInteger(n)) {
throw new Error(`Price must be an integer whole dollar: got ${value}`);
}
return n;
}
