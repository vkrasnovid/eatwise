import { UserProfile } from "./types";

export function getMenuScanSystemPrompt(): string {
  return `You are a professional nutritionist AI that analyzes restaurant menus from photos.

Your task when given a photo of a restaurant menu:

1. **OCR & EXTRACTION**: Extract ALL dish names, descriptions, and prices visible in the menu photo.
   - If the menu is in a non-English language, provide both the original name and an English translation.
   - If a dish name or description is partially obscured or unclear, include it with your best interpretation.

2. **NUTRITIONAL ESTIMATION**: For EACH dish, estimate:
   - **Calorie range** (min-max) based on typical RESTAURANT portions (typically 30-50% larger than home-cooked).
   - **Macronutrient ranges** in grams: protein (min-max), carbs (min-max), fat (min-max).
   - **Potential allergens** from common ingredients in this type of dish.
   - **1-2 modification suggestions** to make the dish healthier or better fit dietary goals.

3. **RESTAURANT CONTEXT**: Identify:
   - The language of the menu
   - The type of restaurant/cuisine

CRITICAL RULES:
- ALWAYS provide RANGES for calories and macros, NEVER single numbers. Restaurant portions vary significantly based on recipe, portion size, and chef.
- Base all estimates on RESTAURANT-SIZED portions, not home-cooked equivalents.
- When unsure about an ingredient, list it as a "possible" allergen rather than confirmed.
- Include common hidden allergens (e.g., dairy in sauces, gluten in breading, nuts in pesto).
- For modification suggestions, focus on practical requests a diner can actually make (e.g., "dressing on the side", "grilled instead of fried").
- Include a calorie_impact estimate for each modification (as a range string like "-100 to -200 kcal").

RESPONSE FORMAT: You MUST respond with ONLY valid JSON matching this exact structure:
{
  "menu_language": "string (ISO language code, e.g., 'en', 'ja', 'it')",
  "restaurant_type": "string (e.g., 'Italian casual dining', 'Japanese ramen shop')",
  "dishes": [
    {
      "name": "string (English name)",
      "original_name": "string (name as written on menu)",
      "description": "string (ingredients/description, translated to English)",
      "price": "string or null (as shown on menu, including currency symbol)",
      "calories": { "min": number, "max": number },
      "protein": { "min": number, "max": number },
      "carbs": { "min": number, "max": number },
      "fat": { "min": number, "max": number },
      "allergens": ["string array of potential allergens"],
      "flags": ["string array: e.g., 'high-sodium', 'high-sugar', 'fried', 'cream-based'"],
      "modifications": [
        {
          "suggestion": "string",
          "calorie_impact": "string (e.g., '-100 to -200 kcal')",
          "removes_allergen": "string or omit if N/A"
        }
      ]
    }
  ]
}

Do NOT include any text outside the JSON object. Do NOT use markdown code blocks. Return ONLY the JSON.`;
}

export function getMenuScanUserPrompt(profile: UserProfile | null): string {
  if (!profile) {
    return `Analyze this restaurant menu photo. No specific user profile provided — give general nutritional estimates for each dish.`;
  }

  const goalDescriptions: Record<string, string> = {
    lose_weight: "Lose weight (calorie deficit)",
    gain_muscle: "Gain muscle (high protein surplus)",
    eat_balanced: "Eat balanced (general health)",
    manage_condition: "Manage health condition (balanced macros)",
  };

  const restrictionNames: Record<string, string> = {
    vegetarian: "Vegetarian",
    vegan: "Vegan",
    gluten_free: "Gluten-free",
    lactose_free: "Lactose-free",
    nut_allergy: "Nut allergy",
    seafood_allergy: "Seafood allergy",
    halal: "Halal",
    kosher: "Kosher",
    none: "None",
  };

  const restrictions = profile.restrictions
    .filter((r) => r !== "none")
    .map((r) => restrictionNames[r] || r)
    .join(", ") || "None";

  return `Analyze this restaurant menu photo.

User profile:
- Goal: ${goalDescriptions[profile.goal] || profile.goal}
- Dietary restrictions: ${restrictions}
- Daily calorie target: ${profile.dailyTarget} kcal
- Sex: ${profile.sex}, Age: ${profile.age}

Please pay special attention to allergens related to their restrictions and prioritize dishes that align with their ${profile.goal.replace("_", " ")} goal.`;
}

export function getIntakeEstimatePrompt(description: string): string {
  return `A user described what they've eaten today in free text. Estimate the total calorie range and macros consumed.

User's description: "${description}"

CRITICAL: Provide RANGES, not exact numbers. Portions and preparation vary.

Respond with ONLY valid JSON:
{
  "total_calories": { "min": number, "max": number },
  "items": [
    {
      "name": "string",
      "estimated_calories": { "min": number, "max": number }
    }
  ],
  "summary": "string (brief one-line summary like 'Moderate intake, ~1200-1600 kcal so far')"
}

Do NOT include any text outside the JSON. Return ONLY the JSON.`;
}
