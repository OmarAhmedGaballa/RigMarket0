// Pure helpers (safe to import from client components).

export const DEFAULT_COMMISSION_RATE = 1.5
export const MAX_COMMISSION_RATE = 50

/** Price the buyer pays: the seller's price plus the commission, rounded to a whole pound. */
export function withCommission(sellerPrice: number, ratePercent: number) {
  return Math.round(sellerPrice * (1 + ratePercent / 100))
}

/** "1.5" -> "1.5", "2.00" -> "2": nice to show inside sentences. */
export function formatRate(rate: number) {
  return String(Number(rate.toFixed(2)))
}
