"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { calculateProfileNutrition } from "@/lib/nutrition";
import { useStore } from "@/lib/store";
import { Goal, Restriction, Sex, ActivityLevel, UnitSystem } from "@/lib/types";
import { kgToLbs, lbsToKg, cmToFtIn, ftInToCm } from "@/lib/utils";

// ─── Step 1 data ─────────────────────────────────────────────────────────────

const GOALS: { value: Goal; label: string; description: string; emoji: string }[] = [
  { value: "lose_weight", label: "Lose weight", description: "Calorie deficit", emoji: "🔥" },
  { value: "gain_muscle", label: "Gain muscle", description: "High protein", emoji: "💪" },
  { value: "eat_balanced", label: "Eat balanced", description: "General health", emoji: "🥗" },
  {
    value: "manage_condition",
    label: "Manage condition",
    description: "Diabetes, cholesterol",
    emoji: "❤️",
  },
];

// ─── Step 2 data ─────────────────────────────────────────────────────────────

const RESTRICTIONS: { value: Restriction; label: string; emoji: string }[] = [
  { value: "vegetarian", label: "Vegetarian", emoji: "🌿" },
  { value: "vegan", label: "Vegan", emoji: "🌱" },
  { value: "gluten_free", label: "Gluten-free", emoji: "🌾" },
  { value: "lactose_free", label: "Lactose-free", emoji: "🥛" },
  { value: "nut_allergy", label: "Nut allergy", emoji: "🥜" },
  { value: "seafood_allergy", label: "Seafood allergy", emoji: "🦐" },
  { value: "halal", label: "Halal", emoji: "☪️" },
  { value: "kosher", label: "Kosher", emoji: "✡️" },
  { value: "none", label: "None", emoji: "✓" },
];

// ─── Step 3 data ─────────────────────────────────────────────────────────────

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: "sedentary", label: "Sedentary", description: "Little or no exercise" },
  { value: "moderate", label: "Moderate", description: "Exercise 3–5 days/week" },
  { value: "active", label: "Active", description: "Exercise 6–7 days/week" },
  { value: "very_active", label: "Very Active", description: "Hard exercise daily" },
];

// ─── Progress indicator ───────────────────────────────────────────────────────

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Step {step} of 3
        </span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          {Math.round((step / 3) * 100)}%
        </span>
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      <div className="flex justify-between mt-2">
        {([1, 2, 3] as const).map((s) => (
          <div
            key={s}
            className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-all duration-300 ${
              s <= step
                ? "bg-primary text-white"
                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
            }`}
          >
            {s}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Checkmark icon ───────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg className="h-full w-full text-white" viewBox="0 0 20 20" fill="currentColor">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

// ─── Radio dot ────────────────────────────────────────────────────────────────

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div
      className={`h-5 w-5 shrink-0 rounded-full border-2 transition-all ${
        selected ? "border-primary bg-primary" : "border-gray-300 dark:border-gray-600"
      }`}
    >
      {selected && <CheckIcon />}
    </div>
  );
}

// ─── Step 1 — Goal ────────────────────────────────────────────────────────────

function StepGoal({
  selected,
  onSelect,
  onNext,
}: {
  selected: Goal | null;
  onSelect: (g: Goal) => void;
  onNext: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
        What&apos;s your goal?
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        We&apos;ll personalise your daily targets based on this.
      </p>

      <div className="space-y-3 mb-8">
        {GOALS.map((goal) => (
          <button
            key={goal.value}
            onClick={() => onSelect(goal.value)}
            className={`w-full flex items-center gap-4 rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
              selected === goal.value
                ? "border-primary bg-primary/5 dark:bg-primary/10"
                : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
            }`}
          >
            <span className="text-2xl">{goal.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 dark:text-gray-50">{goal.label}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{goal.description}</p>
            </div>
            <RadioDot selected={selected === goal.value} />
          </button>
        ))}
      </div>

      <Button size="lg" className="w-full" disabled={!selected} onClick={onNext}>
        Continue
      </Button>
    </div>
  );
}

// ─── Step 2 — Restrictions ────────────────────────────────────────────────────

function StepRestrictions({
  selected,
  onToggle,
  onNext,
  onBack,
}: {
  selected: Restriction[];
  onToggle: (r: Restriction) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
        Dietary restrictions
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Select all that apply. We&apos;ll flag unsafe dishes.
      </p>

      <div className="grid grid-cols-2 gap-3 mb-8">
        {RESTRICTIONS.map((r) => {
          const isSelected = selected.includes(r.value);
          return (
            <button
              key={r.value}
              onClick={() => onToggle(r.value)}
              className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 active:scale-[0.98] ${
                r.value === "none" ? "col-span-2" : ""
              } ${
                isSelected
                  ? "border-primary bg-primary/5 dark:bg-primary/10"
                  : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <span className="text-xl">{r.emoji}</span>
              <span
                className={`text-sm font-medium ${
                  isSelected ? "text-primary" : "text-gray-800 dark:text-gray-200"
                }`}
              >
                {r.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          className="flex-[2]"
          disabled={selected.length === 0}
          onClick={onNext}
        >
          Continue
        </Button>
      </div>
    </div>
  );
}

// ─── Step 3 — Basic params ────────────────────────────────────────────────────

interface StepParamsProps {
  sex: Sex | null;
  setSex: (v: Sex) => void;
  age: string;
  setAge: (v: string) => void;
  // metric weight (kg)
  weightKg: string;
  setWeightKg: (v: string) => void;
  // imperial weight (lbs)
  weightLbs: string;
  setWeightLbs: (v: string) => void;
  // metric height (cm)
  heightCm: string;
  setHeightCm: (v: string) => void;
  // imperial height
  heightFt: string;
  setHeightFt: (v: string) => void;
  heightIn: string;
  setHeightIn: (v: string) => void;
  activityLevel: ActivityLevel | null;
  setActivityLevel: (v: ActivityLevel) => void;
  unitSystem: UnitSystem;
  setUnitSystem: (v: UnitSystem) => void;
  onFinish: () => void;
  onBack: () => void;
  isSubmitting: boolean;
}

function StepParams({
  sex,
  setSex,
  age,
  setAge,
  weightKg,
  setWeightKg,
  weightLbs,
  setWeightLbs,
  heightCm,
  setHeightCm,
  heightFt,
  setHeightFt,
  heightIn,
  setHeightIn,
  activityLevel,
  setActivityLevel,
  unitSystem,
  setUnitSystem,
  onFinish,
  onBack,
  isSubmitting,
}: StepParamsProps) {
  const isMetric = unitSystem === "metric";

  const weightOk = isMetric
    ? weightKg.trim() !== "" && Number(weightKg) > 0
    : weightLbs.trim() !== "" && Number(weightLbs) > 0;

  const heightOk = isMetric
    ? heightCm.trim() !== "" && Number(heightCm) > 0
    : heightFt.trim() !== "" && Number(heightFt) >= 0 && heightIn.trim() !== "" && Number(heightIn) >= 0;

  const isValid =
    sex !== null &&
    age.trim() !== "" &&
    Number(age) >= 10 &&
    Number(age) <= 120 &&
    activityLevel !== null &&
    weightOk &&
    heightOk;

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">About you</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Used to calculate your personalised calorie target.
      </p>

      <div className="space-y-5">
        {/* Unit system toggle */}
        <div className="flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Units:</span>
          <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {(["metric", "imperial"] as UnitSystem[]).map((u) => (
              <button
                key={u}
                onClick={() => setUnitSystem(u)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  unitSystem === u
                    ? "bg-primary text-white"
                    : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                {u === "metric" ? "kg / cm" : "lbs / ft"}
              </button>
            ))}
          </div>
        </div>

        {/* Sex */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Sex
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SEX_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setSex(opt.value)}
                className={`rounded-xl border-2 py-3 text-sm font-medium transition-all duration-200 active:scale-[0.98] ${
                  sex === opt.value
                    ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div>
          <label
            htmlFor="age"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Age
          </label>
          <Input
            id="age"
            type="number"
            inputMode="numeric"
            min={10}
            max={120}
            placeholder="e.g. 28"
            value={age}
            onChange={(e) => setAge(e.target.value)}
          />
        </div>

        {/* Weight */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Weight{" "}
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              ({isMetric ? "kg" : "lbs"})
            </span>
          </label>
          {isMetric ? (
            <Input
              type="number"
              inputMode="decimal"
              min={20}
              max={300}
              placeholder="e.g. 70"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
            />
          ) : (
            <Input
              type="number"
              inputMode="decimal"
              min={44}
              max={660}
              placeholder="e.g. 154"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
            />
          )}
        </div>

        {/* Height */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Height{" "}
            <span className="text-gray-400 dark:text-gray-500 font-normal">
              ({isMetric ? "cm" : "ft / in"})
            </span>
          </label>
          {isMetric ? (
            <Input
              type="number"
              inputMode="decimal"
              min={100}
              max={250}
              placeholder="e.g. 170"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
            />
          ) : (
            <div className="flex gap-3">
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={3}
                  max={8}
                  placeholder="ft"
                  value={heightFt}
                  onChange={(e) => setHeightFt(e.target.value)}
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={11}
                  placeholder="in"
                  value={heightIn}
                  onChange={(e) => setHeightIn(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Activity level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Activity level
          </label>
          <div className="space-y-2">
            {ACTIVITY_LEVELS.map((lvl) => (
              <button
                key={lvl.value}
                onClick={() => setActivityLevel(lvl.value)}
                className={`w-full flex items-center justify-between rounded-xl border-2 px-4 py-3 text-left transition-all duration-200 active:scale-[0.98] ${
                  activityLevel === lvl.value
                    ? "border-primary bg-primary/5 dark:bg-primary/10"
                    : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                }`}
              >
                <div>
                  <p
                    className={`text-sm font-medium ${
                      activityLevel === lvl.value
                        ? "text-primary"
                        : "text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {lvl.label}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{lvl.description}</p>
                </div>
                <RadioDot selected={activityLevel === lvl.value} />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-8 pb-4">
        <Button variant="secondary" size="lg" className="flex-1" onClick={onBack}>
          Back
        </Button>
        <Button
          size="lg"
          className="flex-[2]"
          disabled={!isValid || isSubmitting}
          onClick={onFinish}
        >
          {isSubmitting ? "Saving…" : "Finish setup"}
        </Button>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const setProfile = useStore((s) => s.setProfile);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Step 1
  const [goal, setGoal] = useState<Goal | null>(null);

  // Step 2
  const [restrictions, setRestrictions] = useState<Restriction[]>([]);

  // Step 3 — raw display values (strings so inputs stay controlled)
  const [sex, setSex] = useState<Sex | null>(null);
  const [age, setAge] = useState("");
  const [unitSystem, setUnitSystem] = useState<UnitSystem>("metric");
  const [weightKg, setWeightKg] = useState("");
  const [weightLbs, setWeightLbs] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [heightFt, setHeightFt] = useState("");
  const [heightIn, setHeightIn] = useState("");
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);

  // Convert displayed values when toggling unit system so fields stay populated
  function handleSetUnitSystem(next: UnitSystem) {
    if (next === unitSystem) return;

    if (next === "imperial") {
      // metric -> imperial
      if (weightKg !== "" && Number(weightKg) > 0) {
        setWeightLbs(String(kgToLbs(Number(weightKg))));
      }
      if (heightCm !== "" && Number(heightCm) > 0) {
        const { ft, in: inches } = cmToFtIn(Number(heightCm));
        setHeightFt(String(ft));
        setHeightIn(String(inches));
      }
    } else {
      // imperial -> metric
      if (weightLbs !== "" && Number(weightLbs) > 0) {
        setWeightKg(String(lbsToKg(Number(weightLbs))));
      }
      if (heightFt !== "" && heightIn !== "") {
        setHeightCm(String(ftInToCm(Number(heightFt), Number(heightIn))));
      }
    }

    setUnitSystem(next);
  }

  function toggleRestriction(r: Restriction) {
    setRestrictions((prev) => {
      if (r === "none") {
        return prev.includes("none") ? [] : ["none"];
      }
      const withoutNone = prev.filter((x) => x !== "none");
      return withoutNone.includes(r)
        ? withoutNone.filter((x) => x !== r)
        : [...withoutNone, r];
    });
  }

  function handleFinish() {
    if (!goal || !sex || !activityLevel) return;
    setIsSubmitting(true);

    // Resolve to metric for storage
    const finalWeightKg =
      unitSystem === "metric" ? Number(weightKg) : lbsToKg(Number(weightLbs));
    const finalHeightCm =
      unitSystem === "metric"
        ? Number(heightCm)
        : ftInToCm(Number(heightFt), Number(heightIn));

    const profileBase = {
      sex,
      weight: finalWeightKg,
      height: finalHeightCm,
      age: Number(age),
      activityLevel,
      goal,
    };

    const { tdee, dailyTarget } = calculateProfileNutrition(profileBase);

    setProfile({
      ...profileBase,
      restrictions,
      unitSystem,
      tdee,
      dailyTarget,
      onboardingComplete: true,
    });

    router.push("/scan");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      {/* App bar */}
      <header className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-950 px-5 pt-6 pb-2">
        <div className="max-w-md mx-auto w-full">
          <span className="text-lg font-bold text-primary tracking-tight">eatwise</span>
        </div>
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-5 pb-safe-or-8 pt-4">
        <div className="max-w-md mx-auto w-full">
          <ProgressBar step={step} />

          <Card className="border-0 shadow-none bg-transparent dark:bg-transparent">
            <CardContent className="p-0">
              {step === 1 && (
                <StepGoal
                  selected={goal}
                  onSelect={setGoal}
                  onNext={() => setStep(2)}
                />
              )}

              {step === 2 && (
                <StepRestrictions
                  selected={restrictions}
                  onToggle={toggleRestriction}
                  onNext={() => setStep(3)}
                  onBack={() => setStep(1)}
                />
              )}

              {step === 3 && (
                <StepParams
                  sex={sex}
                  setSex={setSex}
                  age={age}
                  setAge={setAge}
                  weightKg={weightKg}
                  setWeightKg={setWeightKg}
                  weightLbs={weightLbs}
                  setWeightLbs={setWeightLbs}
                  heightCm={heightCm}
                  setHeightCm={setHeightCm}
                  heightFt={heightFt}
                  setHeightFt={setHeightFt}
                  heightIn={heightIn}
                  setHeightIn={setHeightIn}
                  activityLevel={activityLevel}
                  setActivityLevel={setActivityLevel}
                  unitSystem={unitSystem}
                  setUnitSystem={handleSetUnitSystem}
                  onFinish={handleFinish}
                  onBack={() => setStep(2)}
                  isSubmitting={isSubmitting}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
