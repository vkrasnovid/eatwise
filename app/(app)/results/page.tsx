"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import {
  getTrafficLight,
  getDishTag,
  hasAllergenConflict,
  getConflictingAllergens,
} from "@/lib/scoring";
import { formatCalorieRange } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dish, ResultFilter, TrafficLight } from "@/lib/types";
import {
  ArrowLeft,
  Camera,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Filter,
  Star,
} from "lucide-react";

// ── Traffic light colours ──────────────────────────────────────────────────

const TRAFFIC_DOT: Record<TrafficLight, string> = {
  green: "bg-[#22C55E]",
  yellow: "bg-[#F59E0B]",
  red: "bg-[#EF4444]",
};

const TRAFFIC_BADGE_VARIANT: Record<
  TrafficLight,
  "green" | "yellow" | "red" | "outline"
> = {
  green: "green",
  yellow: "yellow",
  red: "red",
};

const FILTER_OPTIONS: { value: ResultFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "safe", label: "Safe for me" },
  { value: "green", label: "Green only" },
];

// ── Restaurant-type tips ───────────────────────────────────────────────────

const RESTAURANT_TIPS: Record<string, string[]> = {
  italian: [
    "Ask for tomato-based sauces instead of cream sauces to cut fat.",
    "Opt for thin-crust pizza or share a pasta to manage portions.",
    "Grilled fish or chicken dishes are usually the leanest options.",
  ],
  japanese: [
    "Sashimi is high protein and very low in calories.",
    "Miso soup is filling and low-calorie — a great starter.",
    "Avoid tempura if you are watching fat intake.",
  ],
  indian: [
    "Tandoori dishes are grilled and typically lower in fat.",
    "Dal (lentils) is a great plant-based protein source.",
    "Ask for sauces on the side to control how much you use.",
  ],
  mexican: [
    "Grilled fajitas with salsa and guacamole are a solid choice.",
    "Go for corn tortillas over flour — fewer calories.",
    "Watch portion sizes on rice and beans; both are calorie-dense.",
  ],
  chinese: [
    "Steamed dishes are significantly lighter than stir-fried ones.",
    "Ask for sauce on the side — sauces carry most of the sodium.",
    "Hot and sour soup is a low-calorie, filling starter.",
  ],
  american: [
    "Grilled options are almost always lighter than fried equivalents.",
    "Swap fries for a side salad or steamed veg to cut calories.",
    "Dressings and sauces can double the calorie count — use sparingly.",
  ],
  default: [
    "Choose grilled, baked, or steamed dishes over fried ones.",
    "Ask for sauces and dressings on the side so you control the amount.",
    "Vegetables and lean proteins make the best base for any meal.",
  ],
};

function getTips(restaurantType: string): string[] {
  const key = restaurantType.toLowerCase();
  for (const [pattern, tips] of Object.entries(RESTAURANT_TIPS)) {
    if (key.includes(pattern)) return tips;
  }
  return RESTAURANT_TIPS.default;
}

// ── DishCard ──────────────────────────────────────────────────────────────

function DishCard({
  dish,
  userRestrictions,
  goal,
  rank,
}: {
  dish: Dish;
  userRestrictions: string[];
  goal: string;
  rank?: number; // 1-based position for Top-3 display
}) {
  const [expanded, setExpanded] = useState(false);

  const light = getTrafficLight(dish.score);
  const tag = getDishTag(dish, goal as Parameters<typeof getDishTag>[1]);
  const conflicts = getConflictingAllergens(
    dish.allergens,
    userRestrictions as Parameters<typeof getConflictingAllergens>[1]
  );

  return (
    <button
      onClick={() => setExpanded((v) => !v)}
      className={[
        "w-full text-left rounded-2xl border transition-all duration-200 active:scale-[0.99]",
        "bg-white dark:bg-gray-900",
        rank
          ? "border-primary/25 dark:border-primary/35 shadow-sm"
          : "border-gray-200 dark:border-gray-800 hover:shadow-sm",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
      ].join(" ")}
    >
      {/* Collapsed row */}
      <div className="flex items-center gap-3 p-4">
        {/* Rank badge (Top-3 only) */}
        {rank && (
          <div className="h-7 w-7 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary">{rank}</span>
          </div>
        )}

        {/* Traffic light dot */}
        <span
          className={`h-3 w-3 rounded-full flex-shrink-0 ${TRAFFIC_DOT[light]}`}
          aria-label={`${light} traffic light`}
        />

        {/* Name + calorie range */}
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-text dark:text-gray-50 truncate leading-snug">
            {dish.name}
          </p>
          <p className="text-xs text-text-muted dark:text-gray-500 mt-0.5">
            {formatCalorieRange(dish.calories.min, dish.calories.max)}
          </p>
        </div>

        {/* Dish tag badge */}
        <Badge
          variant={TRAFFIC_BADGE_VARIANT[light]}
          className="flex-shrink-0"
        >
          {tag}
        </Badge>

        {/* Chevron */}
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-gray-400 flex-shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
        )}
      </div>

      {/* Expanded details */}
      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-gray-100 dark:border-gray-800 pt-3 animate-fade-in">
          {/* Description */}
          {dish.description && (
            <p className="text-xs text-text-muted dark:text-gray-400 leading-relaxed">
              {dish.description}
            </p>
          )}

          {/* Macro grid */}
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Protein",
                min: dish.protein.min,
                max: dish.protein.max,
                unit: "g",
                color: "text-blue-600 dark:text-blue-400",
              },
              {
                label: "Carbs",
                min: dish.carbs.min,
                max: dish.carbs.max,
                unit: "g",
                color: "text-amber-600 dark:text-amber-400",
              },
              {
                label: "Fat",
                min: dish.fat.min,
                max: dish.fat.max,
                unit: "g",
                color: "text-purple-600 dark:text-purple-400",
              },
              {
                label: "Calories",
                min: dish.calories.min,
                max: dish.calories.max,
                unit: "kcal",
                color: "text-text dark:text-gray-300",
              },
            ].map((macro) => (
              <div
                key={macro.label}
                className="rounded-xl bg-gray-50 dark:bg-gray-800 px-2 py-2.5 text-center"
              >
                <p className="text-[10px] text-text-muted dark:text-gray-500 uppercase tracking-wider leading-none">
                  {macro.label}
                </p>
                <p
                  className={`text-xs font-semibold ${macro.color} mt-1 leading-snug`}
                >
                  {macro.min}–{macro.max}
                  {macro.unit === "g" ? "g" : ""}
                </p>
              </div>
            ))}
          </div>

          {/* Allergens */}
          {dish.allergens.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Allergens
              </p>
              <div className="flex flex-wrap gap-1.5">
                {dish.allergens.map((a) => (
                  <Badge
                    key={a}
                    variant={
                      conflicts.includes(a.toLowerCase()) ? "red" : "outline"
                    }
                  >
                    {a}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Modifications */}
          {dish.modifications && dish.modifications.length > 0 && (
            <div>
              <p className="text-[10px] font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Suggested modifications
              </p>
              <div className="space-y-1.5">
                {dish.modifications.map((mod, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-primary-50 dark:bg-primary-900/20 px-3 py-2"
                  >
                    <p className="text-xs text-text dark:text-gray-300">
                      {mod.suggestion}
                    </p>
                    <p className="text-[10px] text-text-muted dark:text-gray-500 mt-0.5">
                      {mod.calorie_impact}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </button>
  );
}

// ── ResultsPage ───────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const currentScan = useStore((s) => s.currentScan);
  const profile = useStore((s) => s.profile);

  const [filter, setFilter] = useState<ResultFilter>("all");

  const userRestrictions = useMemo(
    () => profile?.restrictions ?? [],
    [profile?.restrictions]
  );
  const goal = profile?.goal ?? "eat_balanced";

  // Sort dishes by score descending
  const sortedDishes = useMemo<Dish[]>(() => {
    if (!currentScan) return [];
    return [...currentScan.dishes].sort((a, b) => b.score - a.score);
  }, [currentScan]);

  const top3 = sortedDishes.slice(0, 3);

  const filteredDishes = useMemo<Dish[]>(() => {
    return sortedDishes.filter((dish) => {
      if (filter === "safe") {
        return !hasAllergenConflict(
          dish.allergens,
          userRestrictions as Parameters<typeof hasAllergenConflict>[1]
        );
      }
      if (filter === "green") {
        return getTrafficLight(dish.score) === "green";
      }
      return true;
    });
  }, [sortedDishes, filter, userRestrictions]);

  // Collect all unique conflicting allergens across the menu
  const conflictingAllergenNames = useMemo<string[]>(() => {
    if (!currentScan || userRestrictions.length === 0) return [];
    const all: string[] = [];
    for (const dish of currentScan.dishes) {
      const c = getConflictingAllergens(
        dish.allergens,
        userRestrictions as Parameters<typeof getConflictingAllergens>[1]
      );
      all.push(...c);
    }
    return Array.from(new Set(all));
  }, [currentScan, userRestrictions]);

  const conflictingDishCount = useMemo<number>(() => {
    if (!currentScan || userRestrictions.length === 0) return 0;
    return currentScan.dishes.filter((d) =>
      hasAllergenConflict(
        d.allergens,
        userRestrictions as Parameters<typeof hasAllergenConflict>[1]
      )
    ).length;
  }, [currentScan, userRestrictions]);

  const tips = currentScan
    ? getTips(currentScan.restaurant_type)
    : RESTAURANT_TIPS.default;

  // ── Empty / no scan state ────────────────────────────────────────────────

  if (!currentScan || currentScan.dishes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
        <div className="h-16 w-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Camera className="h-8 w-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-bold text-text dark:text-white mb-2">
          No results yet
        </h2>
        <p className="text-sm text-text-muted dark:text-gray-400 mb-6 max-w-[260px]">
          Scan a restaurant menu to get personalised recommendations.
        </p>
        <Button onClick={() => router.push("/scan")}>
          <Camera className="h-4 w-4 mr-2" />
          Scan a menu
        </Button>
      </div>
    );
  }

  // ── Results view ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-950 pb-28">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
        <button
          onClick={() => router.push("/scan")}
          className="flex items-center gap-1.5 text-text-muted dark:text-gray-400 text-sm mb-2 -ml-0.5 hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to scan
        </button>
        <p className="text-xs text-text-muted dark:text-gray-500 capitalize">
          {currentScan.restaurant_type}
        </p>
        <h1 className="text-xl font-bold text-text dark:text-white">
          Your results
        </h1>
      </div>

      <div className="px-5 py-5 max-w-lg mx-auto space-y-6">
        {/* ── Allergen warning banner ── */}
        {conflictingAllergenNames.length > 0 && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 flex items-start gap-3 animate-fade-in">
            <AlertTriangle className="h-5 w-5 text-[#EF4444] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-[#EF4444]">
                Allergen alert
              </p>
              <p className="text-xs text-red-600 dark:text-red-400/90 mt-0.5 leading-relaxed">
                {conflictingDishCount} dish
                {conflictingDishCount !== 1 ? "es" : ""} contain{" "}
                <span className="font-semibold">
                  {conflictingAllergenNames.join(", ")}
                </span>
                . Always confirm with your waiter.
              </p>
            </div>
          </div>
        )}

        {/* ── Top 3 section ── */}
        {top3.length > 0 && (
          <section>
            <CardHeader className="px-0 pt-0 pb-3">
              <CardTitle className="flex items-center gap-2 text-base text-text dark:text-white">
                <Star className="h-5 w-5 text-[#F59E0B] fill-[#F59E0B]" />
                Top {top3.length} for you
              </CardTitle>
            </CardHeader>
            <div className="space-y-2.5">
              {top3.map((dish, i) => (
                <DishCard
                  key={`top-${dish.name}-${i}`}
                  dish={dish}
                  userRestrictions={userRestrictions}
                  goal={goal}
                  rank={i + 1}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Full menu section ── */}
        <section>
          {/* Section heading */}
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-base font-bold text-text dark:text-white flex-1">
              Full menu
            </h2>
            <Filter className="h-4 w-4 text-text-muted dark:text-gray-500" />
          </div>

          {/* Filter tabs */}
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-3">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setFilter(opt.value)}
                className={[
                  "flex-1 py-2 text-xs font-semibold transition-colors",
                  filter === opt.value
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-900 text-text-muted dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
                ].join(" ")}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Dish count */}
          <p className="text-xs text-text-muted dark:text-gray-500 mb-3">
            {filteredDishes.length} dish
            {filteredDishes.length !== 1 ? "es" : ""}
          </p>

          {/* Dish list */}
          <div className="space-y-2">
            {filteredDishes.map((dish, i) => (
              <DishCard
                key={`menu-${dish.name}-${i}`}
                dish={dish}
                userRestrictions={userRestrictions}
                goal={goal}
              />
            ))}
          </div>

          {/* Empty filter state */}
          {filteredDishes.length === 0 && (
            <div className="text-center py-10">
              <p className="text-sm text-text-muted dark:text-gray-400 mb-3">
                No dishes match this filter.
              </p>
              <button
                onClick={() => setFilter("all")}
                className="text-sm font-semibold text-primary hover:text-primary-600 transition-colors"
              >
                Show all dishes
              </button>
            </div>
          )}
        </section>

        {/* ── General tips ── */}
        <Card className="border-0 shadow-sm dark:bg-gray-900">
          <CardContent className="py-4 space-y-3">
            <p className="text-xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wide">
              Tips for{" "}
              <span className="capitalize">{currentScan.restaurant_type}</span>
            </p>
            <div className="space-y-2.5">
              {tips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <span className="mt-1 h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </span>
                  <p className="text-sm text-text dark:text-gray-300 leading-snug">
                    {tip}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ── Scan another CTA ── */}
        <Button
          size="lg"
          variant="secondary"
          className="w-full"
          onClick={() => router.push("/scan")}
        >
          <Camera className="h-4 w-4 mr-2" />
          Scan another menu
        </Button>
      </div>
    </div>
  );
}
