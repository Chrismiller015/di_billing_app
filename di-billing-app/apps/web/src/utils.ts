// FILE: apps/web/src/utils.ts
export const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(" ");
export const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });
// --- END OF FILE ---