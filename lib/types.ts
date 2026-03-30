// User profile types
export type Goal = "lose_weight" | "gain_muscle" | "eat_balanced" | "manage_condition";

export type Restriction =
  | "vegetarian"
  | "vegan"
  | "gluten_free"
  | "lactose_free"
  | "nut_allergy"
  | "seafood_allergy"
  | "halal"
  | "kosher"
  | "none";

export type Sex = "male" | "female" | "other";

export type ActivityLevel = "sedentary" | "moderate" | "active" | "very_active";

export type UnitSystem = "metric" | "imperial";

export interface UserProfile {
  goal: Goal;
  restrictions: Restriction[];
  sex: Sex;
  age: number;
  weight: number; // stored in kg internally
  height: number; // stored in cm internally
  activityLevel: ActivityLevel;
  unitSystem: UnitSystem;
  tdee: number;
  dailyTarget: number;
  onboardingComplete: boolean;
}

// Nutrition types
export interface NutrientRange {
  min: number;
  max: number;
}

export interface Modification {
  suggestion: string;
  calorie_impact: string;
  removes_allergen?: string;
}

export interface Dish {
  name: string;
  original_name: string;
  description: string;
  price?: string;
  calories: NutrientRange;
  protein: NutrientRange;
  carbs: NutrientRange;
  fat: NutrientRange;
  allergens: string[];
  flags: string[];
  modifications: Modification[];
  score: number;
}

export interface ScanResult {
  id: string;
  menu_language: string;
  restaurant_type: string;
  dishes: Dish[];
  scanned_at: string;
  image_preview?: string; // small thumbnail base64
}

export interface IntakeEstimate {
  total_calories: NutrientRange;
  description: string;
}

// UI state types
export type TrafficLight = "green" | "yellow" | "red";

export type ResultFilter = "all" | "safe" | "green";

export type Theme = "light" | "dark" | "system";

// Macro targets per goal
export interface MacroTargets {
  proteinPct: number; // percentage of daily calories
  carbsPct: number;
  fatPct: number;
}

// Store types
export interface AppState {
  profile: UserProfile | null;
  history: ScanResult[];
  currentScan: ScanResult | null;
  theme: Theme;
  todayIntake: IntakeEstimate | null;

  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  setCurrentScan: (scan: ScanResult) => void;
  addToHistory: (scan: ScanResult) => void;
  loadScanFromHistory: (id: string) => void;
  setTheme: (theme: Theme) => void;
  setTodayIntake: (intake: IntakeEstimate | null) => void;
  clearHistory: () => void;
}
