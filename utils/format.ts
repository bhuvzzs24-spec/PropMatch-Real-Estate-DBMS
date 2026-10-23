const inr = new Intl.NumberFormat('en-IN');

function trim(v: number): string {
  return Number(v.toFixed(2)).toString();
}

export function formatINR(n: number): string {
  return '\u20B9' + inr.format(Math.round(n));
}

// 8500000 -> "85 L", 12000000 -> "1.2 Cr"
export function formatShortINR(n: number): string {
  if (n >= 1e7) return `\u20B9${trim(n / 1e7)} Cr`;
  if (n >= 1e5) return `\u20B9${trim(n / 1e5)} L`;
  return formatINR(n);
}

export function formatPrice(price: number, listingType: 'SALE' | 'RENT'): string {
  return listingType === 'RENT' ? `${formatINR(price)}/mo` : formatINR(price);
}

export function formatShortPrice(price: number, listingType: 'SALE' | 'RENT'): string {
  return listingType === 'RENT' ? `${formatINR(price)}/mo` : formatShortINR(price);
}

export function formatArea(areaSqft: number): string {
  return `${inr.format(areaSqft)} sqft`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

// Value for <input type="datetime-local"> in the user's local time zone
export function toDateTimeLocalValue(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

// Only allow same-site relative redirects after login
export function safeNext(next: string | null | undefined): string {
  if (next && next.startsWith('/') && !next.startsWith('//')) return next;
  return '/';
}
