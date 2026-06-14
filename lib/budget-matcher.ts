/**
 * Budget Compatibility Engine
 *
 * Scores how well a destination's typical cost matches the user's selected budget.
 * Used as one of three factors in the final recommendation score.
 *
 * score = visualMatch × 0.4 + budgetMatch × 0.3 + seasonMatch × 0.3
 *
 * Pure code — no AI involved.
 */

interface DestinationCost {
  /** Average daily spend per person in USD (accommodation + food + transport + activities) */
  dailyCost: {
    budget:   number // backpacker / hostel style
    moderate: number // mid-range hotel, sit-down meals
    luxury:   number // 5-star, fine dining, private tours
  }
  /** Relative price tier compared to global average (1 = cheapest, 4 = most expensive) */
  priceTier: 1 | 2 | 3 | 4
}

// Cost database
// All 24 countries used in destination-matcher.ts.
// Daily cost figures (USD/person) are realistic averages as of 2024.

const DESTINATION_COSTS: Record<string, DestinationCost> = {
  US: { dailyCost: { budget: 100, moderate: 220, luxury: 500 }, priceTier: 4 },
  JP: { dailyCost: { budget: 70,  moderate: 150, luxury: 400 }, priceTier: 3 },
  TH: { dailyCost: { budget: 35,  moderate: 80,  luxury: 250 }, priceTier: 1 },
  FR: { dailyCost: { budget: 90,  moderate: 200, luxury: 550 }, priceTier: 4 },
  AU: { dailyCost: { budget: 90,  moderate: 180, luxury: 450 }, priceTier: 4 },
  ES: { dailyCost: { budget: 60,  moderate: 130, luxury: 350 }, priceTier: 3 },
  IT: { dailyCost: { budget: 70,  moderate: 150, luxury: 400 }, priceTier: 3 },
  BR: { dailyCost: { budget: 45,  moderate: 90,  luxury: 280 }, priceTier: 2 },
  MX: { dailyCost: { budget: 40,  moderate: 85,  luxury: 260 }, priceTier: 1 },
  IN: { dailyCost: { budget: 25,  moderate: 60,  luxury: 200 }, priceTier: 1 },
  GR: { dailyCost: { budget: 65,  moderate: 130, luxury: 380 }, priceTier: 2 },
  TR: { dailyCost: { budget: 40,  moderate: 90,  luxury: 280 }, priceTier: 1 },
  ID: { dailyCost: { budget: 35,  moderate: 80,  luxury: 250 }, priceTier: 1 }, // Bali
  MA: { dailyCost: { budget: 35,  moderate: 75,  luxury: 230 }, priceTier: 1 },
  AE: { dailyCost: { budget: 120, moderate: 280, luxury: 700 }, priceTier: 4 }, // Dubai
  CH: { dailyCost: { budget: 130, moderate: 280, luxury: 650 }, priceTier: 4 },
  PT: { dailyCost: { budget: 55,  moderate: 110, luxury: 320 }, priceTier: 2 },
  VN: { dailyCost: { budget: 25,  moderate: 55,  luxury: 180 }, priceTier: 1 },
  PE: { dailyCost: { budget: 35,  moderate: 75,  luxury: 220 }, priceTier: 1 },
  HR: { dailyCost: { budget: 70,  moderate: 140, luxury: 380 }, priceTier: 3 },
  NZ: { dailyCost: { budget: 85,  moderate: 180, luxury: 450 }, priceTier: 4 },
  SG: { dailyCost: { budget: 80,  moderate: 180, luxury: 500 }, priceTier: 4 },
  ZA: { dailyCost: { budget: 45,  moderate: 100, luxury: 300 }, priceTier: 2 },
  KE: { dailyCost: { budget: 50,  moderate: 120, luxury: 400 }, priceTier: 2 },
}

// User budget → USD/day target range
// Maps the user's selected label to a realistic expected daily spend range.

type BudgetLabel = "low" | "budget" | "standard" | "medium" | "premium" | "high" | "luxury"

const BUDGET_RANGES: Record<BudgetLabel, { min: number; max: number; target: number }> = {
  low:      { min: 0,   max: 80,   target: 50  },
  budget:   { min: 0,   max: 80,   target: 50  },
  standard: { min: 60,  max: 200,  target: 120 },
  medium:   { min: 60,  max: 200,  target: 120 },
  premium:  { min: 150, max: 400,  target: 260 },
  high:     { min: 150, max: 400,  target: 260 },
  luxury:   { min: 300, max: 9999, target: 500 },
}

// Scoring function
/**
 * Score how well a destination's cost matches the user's budget.
 * Returns 0–100.
 *
 * Logic:
 *  - Perfect value: destination's moderate cost ≤ user's max → high score
 *  - Great value:   destination's budget cost ≤ user's target → bonus for savings
 *  - Over budget:   destination's moderate cost > user max → penalised proportionally
 *  - Luxury match:  user chose luxury and destination has luxury tier → full score
 */
export function scoreBudgetCompatibility(
  countryCode: string,
  userBudget?: string
): number {
  if (!userBudget) return 65 // neutral when no budget provided

  const costs = DESTINATION_COSTS[countryCode]
  if (!costs) return 65

  const label = userBudget.toLowerCase() as BudgetLabel
  const range = BUDGET_RANGES[label] ?? BUDGET_RANGES.medium

  const { min, max, target } = range
  const destModerate = costs.dailyCost.moderate
  const destBudget   = costs.dailyCost.budget
  const destLuxury   = costs.dailyCost.luxury

  // Luxury user → score by luxury tier match
  if (label === "luxury") {
    if (costs.priceTier === 4) return 95
    if (costs.priceTier === 3) return 80
    if (costs.priceTier === 2) return 65
    return 50
  }

  // Budget/low user → score how affordable the destination is
  if (label === "low" || label === "budget") {
    if (destBudget <= target)          return 95
    if (destBudget <= max)             return 80
    if (destModerate <= max)           return 60
    return 30 // destination is over budget
  }

  // Standard/medium/premium user → score around moderate cost
  const overBudgetRatio = destModerate / max

  if (overBudgetRatio <= 0.7)  return 95 // great value
  if (overBudgetRatio <= 0.9)  return 88
  if (overBudgetRatio <= 1.0)  return 82
  if (overBudgetRatio <= 1.15) return 70 // slightly over
  if (overBudgetRatio <= 1.35) return 55 // noticeably over
  return 35 // well over budget
}

/**
 * Return the recommended budget tier label for a country.
 */
export function getDestinationBudgetLabel(countryCode: string): string {
  const costs = DESTINATION_COSTS[countryCode]
  if (!costs) return "Moderate"
  switch (costs.priceTier) {
    case 1: return "Budget-friendly"
    case 2: return "Moderate"
    case 3: return "Mid-premium"
    case 4: return "Premium / Luxury"
    default: return "Moderate"
  }
}

/**
 * Return the estimated daily cost range for a country and budget level.
 */
export function getDailyCostEstimate(
  countryCode: string,
  userBudget: string
): string {
  const costs = DESTINATION_COSTS[countryCode]
  if (!costs) return "Varies"

  const label = userBudget.toLowerCase()
  if (label === "low" || label === "budget") {
    return `~$${costs.dailyCost.budget}/day`
  }
  if (label === "luxury") {
    return `~$${costs.dailyCost.luxury}+/day`
  }
  return `~$${costs.dailyCost.moderate}/day`
}
