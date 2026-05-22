/**
 * Format a price stored as integer kyats into a display string.
 * e.g.  5000  → "5,000 MMK"
 *       0     → "Free"
 */
export function formatMMK(priceInKyats: number): string {
  if (priceInKyats === 0) return 'Free'
  return `${priceInKyats.toLocaleString('en-US')} MMK`
}

/**
 * Format a revenue/amount value stored as kyats (whole numbers).
 * Always shows the currency, even for 0.
 * e.g.  1500000 → "1,500,000 MMK"
 */
export function formatMMKAmount(kyats: number): string {
  return `${kyats.toLocaleString('en-US')} MMK`
}

/**
 * Parse a MMK display value entered by the user into an integer (kyats).
 * Strips commas, spaces, and the "MMK" suffix before parsing.
 */
export function parseMMK(raw: string): number {
  const cleaned = raw.replace(/[,\s]/g, '').replace(/MMK$/i, '')
  const parsed = parseInt(cleaned, 10)
  return isNaN(parsed) ? 0 : Math.max(0, parsed)
}
