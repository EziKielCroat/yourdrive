/**
 * Single source of truth for plan pricing (EUR) and storage limits (GB).
 * Imported by apps/api and apps/web — keep values here only.
 */
const PLANS = {
  currency: "EUR" as const,
  currencySymbol: "€",
  free: {
    /** Default free-tier storage cap for new accounts */
    storageGb: 30,
  },
  pro: {
    priceEurPerMonth: 5,
    /** Marketing / comparison: Pro tier storage cap */
    storageGb: 50,
  },
  /** Yearly Pro: (monthly × 12) − discount (EUR). */
  yearlyDiscountEur: 10,
  educational: {
    /** Verified @skole.hr bonus on top of free base after email verification */
    bonusGb: 50,
  },
} as const;

function getEducationalTotalGb(): number {
  return PLANS.free.storageGb + PLANS.educational.bonusGb;
}

/** Human-readable tier label from stored limit (float GB) and educational flag. */
function getStorageTierLabel(
  inGB: number,
  hasEducationalBonus: boolean,
): string {
  const r = Math.round(inGB);
  if (hasEducationalBonus && r >= 100) {
    return "100GB Educational Plan (50GB + 50GB School Bonus — legacy)";
  }
  if (hasEducationalBonus && r >= 80) {
    return "80GB Educational Plan (30GB + 50GB School Bonus)";
  }
  if (r >= 150) return "150GB (Pro Plan)";
  if (r >= 100) return "100GB (Plus Plan)";
  if (r === 50 && !hasEducationalBonus) return "50GB (Free Plan — legacy)";
  if (r === 30) return "30GB (Free Plan)";
  return `${r}GB`;
}

export { PLANS, getEducationalTotalGb, getStorageTierLabel };
