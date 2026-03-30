import { Dish, Goal, MacroTargets, NutrientRange, Restriction, TrafficLight } from "./types";
import { getMacroTargets } from "./nutrition";

/**
 * Map user restriction names to allergen strings used in dish data
 */
const RESTRICTION_ALLERGEN_MAP: Record<string, string[]> = {
  gluten_free: ["gluten", "wheat"],
  lactose_free: ["dairy", "milk", "lactose"],
  nut_allergy: ["nuts", "peanuts", "tree nuts", "almonds", "cashews", "walnuts"],
  seafood_allergy: ["seafood", "fish", "shellfish", "shrimp", "crab"],
  vegetarian: ["meat", "poultry", "beef", "pork", "chicken", "lamb"],
  vegan: ["meat", "poultry", "beef", "pork", "chicken", "lamb", "dairy", "milk", "eggs", "honey"],
};

/**
 * Check if a dish contains any allergens matching user restrictions
 */
export function hasAllergenConflict(
  dishAllergens: string[],
  restrictions: Restriction[]
): boolean {
  const lowerAllergens = dishAllergens.map((a) => a.toLowerCase());
  for (const restriction of restrictions) {
    const mapped = RESTRICTION_ALLERGEN_MAP[restriction];
    if (!mapped) continue;
    for (const allergen of mapped) {
      if (lowerAllergens.some((a) => a.includes(allergen))) {
        return true;
      }
    }
  }
  return false;
}

/**
 * Get conflicting allergens for a dish given user restrictions
 */
export function getConflictingAllergens(
  dishAllergens: string[],
  restrictions: Restriction[]
): string[] {
  const conflicts: string[] = [];
  const lowerAllergens = dishAllergens.map((a) => a.toLowerCase());

  for (const restriction of restrictions) {
    const mapped = RESTRICTION_ALLERGEN_MAP[restriction];
    if (!mapped) continue;
    for (const allergen of mapped) {
      const found = lowerAllergens.find((a) => a.includes(allergen));
      if (found) {
        conflicts.push(found);
      }
    }
  }
  return Array.from(new Set(conflicts));
}

/**
 * Calculate a 0.0-1.0 score for a dish based on user profile match
 */
export function scoreDish(
  dish: Dish,
  goal: Goal,
  restrictions: Restriction[],
  dailyTarget: number,
  remainingCalories?: number
): number {
  let score = 0.5; // Start at midpoint

  // 1. Allergen penalty (heavy)
  if (hasAllergenConflict(dish.allergens, restrictions)) {
    score -= 0.4;
  }

  // 2. Calorie fit
  const targetMeal = remainingCalories || dailyTarget / 3; // Assume 3 meals
  const avgCalories = (dish.calories.min + dish.calories.max) / 2;
  const calorieFit = 1 - Math.min(1, Math.abs(avgCalories - targetMeal) / targetMeal);
  score += calorieFit * 0.2;

  // 3. Macro fit based on goal
  const macros = getMacroTargets(goal);
  score += macroFitScore(dish, macros, dailyTarget) * 0.2;

  // 4. Modification potential bonus
  if (dish.modifications && dish.modifications.length > 0) {
    score += 0.05;
  }

  // 5. Goal-specific adjustments
  if (goal === "lose_weight") {
    // Prefer lower calorie dishes
    if (avgCalories < targetMeal * 0.8) score += 0.05;
    if (avgCalories > targetMeal * 1.3) score -= 0.1;
  }

  if (goal === "gain_muscle") {
    // Prefer high protein dishes
    const avgProtein = (dish.protein.min + dish.protein.max) / 2;
    if (avgProtein > 30) score += 0.1;
  }

  return Math.max(0, Math.min(1, score));
}

function macroFitScore(
  dish: Dish,
  macros: MacroTargets,
  dailyTarget: number
): number {
  // Per-meal target (1/3 of daily)
  const mealCal = dailyTarget / 3;

  const targetProteinG = (mealCal * macros.proteinPct) / 100 / 4;
  const targetCarbsG = (mealCal * macros.carbsPct) / 100 / 4;
  const targetFatG = (mealCal * macros.fatPct) / 100 / 9;

  const avgProtein = (dish.protein.min + dish.protein.max) / 2;
  const avgCarbs = (dish.carbs.min + dish.carbs.max) / 2;
  const avgFat = (dish.fat.min + dish.fat.max) / 2;

  const proteinFit = 1 - Math.min(1, Math.abs(avgProtein - targetProteinG) / (targetProteinG || 1));
  const carbsFit = 1 - Math.min(1, Math.abs(avgCarbs - targetCarbsG) / (targetCarbsG || 1));
  const fatFit = 1 - Math.min(1, Math.abs(avgFat - targetFatG) / (targetFatG || 1));

  return (proteinFit + carbsFit + fatFit) / 3;
}

/**
 * Determine traffic light color from score
 */
export function getTrafficLight(score: number): TrafficLight {
  if (score >= 0.6) return "green";
  if (score >= 0.35) return "yellow";
  return "red";
}

/**
 * Get a label tag for the dish based on its properties
 */
export function getDishTag(dish: Dish, goal: Goal): string {
  const avgProtein = (dish.protein.min + dish.protein.max) / 2;
  const avgCarbs = (dish.carbs.min + dish.carbs.max) / 2;
  const avgFat = (dish.fat.min + dish.fat.max) / 2;
  const avgCal = (dish.calories.min + dish.calories.max) / 2;

  if (avgProtein > 30 && goal === "gain_muscle") return "High protein";
  if (avgCal < 400) return "Light choice";
  if (avgProtein > 25) return "High protein";
  if (avgCarbs < 20) return "Low carb";
  if (avgFat < 10) return "Low fat";
  if (avgCal < 500) return "Moderate";
  return "Hearty";
}
