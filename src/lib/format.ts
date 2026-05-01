export function formatMoney(cents: number, _currency?: string) {
  const amount = (cents / 100).toLocaleString("en-NG", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `₦${amount}`;
}
