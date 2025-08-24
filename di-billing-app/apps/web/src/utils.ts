import { formatDistanceToNow as dateFnsFormatDistanceToNow } from 'date-fns';

export const cls = (...xs: (string | false | undefined)[]) => xs.filter(Boolean).join(' ');
export const dollar = (n: number) => n.toLocaleString(undefined, { maximumFractionDigits: 0 });

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount / 100);
}

export function formatDistanceToNow(dateString: string): string {
  if (!dateString) return '';
  return dateFnsFormatDistanceToNow(new Date(dateString), { addSuffix: true });
}
