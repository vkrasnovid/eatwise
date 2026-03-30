import { ActivityLevel, Goal, MacroTargets, Sex, UserProfile } from "./types";

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  moderate: 1.375,
  active: 1.55,
  very_active: 1.725,
};

/**
 * Calculate Basal Metabolic Rate using Mifflin-St Jeor equation
 * Weight in kg, height in cm, age in years
 */
export function calculateBMR(
  sex: Sex,
  weight: number,
  height: number,
  age: number
): number {
  const base = 10 * weight + 6.25 * height - 5 * age;
  if (sex === "male") return base + 5;
  if (sex === "female") return base - 161;
  // For "other", average of male and female
  return base - 78;
}

/**
 * Calculate Total Daily Energy Expenditure
 */
export function calculateTDEE(
  sex: Sex,
  weight: number,
  height: number,
  age: number,
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(sex, weight, height, age);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

/**
 * Calculate daily calorie target based on goal
 */
export function calculateDailyTarget(tdee: number, goal: Goal): number {
  switch (goal) {
    case "lose_weight":
      return tdee - 500;
    case "gain_muscle":
      return tdee + 300;
    case "eat_balanced":
    case "manage_condition":
      return tdee;
  }
}

/**
 * Get macro targets (as percentage of daily calories) based on goal
 */
export function getMacroTargets(goal: Goal): MacroTargets {
  switch (goal) {
    case "lose_weight":
      return { proteinPct: 35, carbsPct: 35, fatPct: 30 };
    case "gain_muscle":
      return { proteinPct: 35, carbsPct: 45, fatPct: 20 };
    case "eat_balanced":
      return { proteinPct: 25, carbsPct: 50, fatPct: 25 };
    case "manage_condition":
      return { proteinPct: 25, carbsPct: 45, fatPct: 30 };
  }
}

/**
 * Convert macro percentages to gram ranges for a given calorie target
 */
export function macroGramsFromTarget(
  dailyTarget: number,
  macros: MacroTargets
): { protein: number; carbs: number; fat: number } {
  return {
    protein: Math.round((dailyTarget * macros.proteinPct) / 100 / 4), // 4 cal/g
    carbs: Math.round((dailyTarget * macros.carbsPct) / 100 / 4), // 4 cal/g
    fat: Math.round((dailyTarget * macros.fatPct) / 100 / 9), // 9 cal/g
  };
}

/**
 * Calculate full profile nutrition data
 */
export function calculateProfileNutrition(
  profile: Pick<UserProfile, "sex" | "weight" | "height" | "age" | "activityLevel" | "goal">
) {
  const tdee = calculateTDEE(
    profile.sex,
    profile.weight,
    profile.height,
    profile.age,
    profile.activityLevel
  );
  const dailyTarget = calculateDailyTarget(tdee, profile.goal);
  return { tdee, dailyTarget };
}
