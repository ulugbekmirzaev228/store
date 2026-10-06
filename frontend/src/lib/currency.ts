/**
 * Format numeric amount into Uzbek So'm string: "12 500 000 so'm"
 */
export function formatSom(amount: number | string | undefined | null): string {
  if (amount === undefined || amount === null) return "0 so'm";
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return "0 so'm";
  const rounded = Math.round(num);
  return `${rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')} so'm`;
}
