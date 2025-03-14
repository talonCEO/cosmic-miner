
/**
 * Format a number with commas as thousands separators and optionally abbreviate large numbers
 */
export function formatNumber(num: number, abbreviate: boolean = false): string {
  if (abbreviate && num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (abbreviate && num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  
  return new Intl.NumberFormat().format(Math.floor(num));
}
