"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Moon, Sun, Monitor, Trash2, User, Info, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { calculateProfileNutrition } from "@/lib/nutrition";
import {
  kgToLbs,
  lbsToKg,
  cmToFtIn,
  ftInToCm,
} from "@/lib/utils";
import type {
  Goal,
  Restriction,
  Sex,
  ActivityLevel,
  UnitSystem,
  Theme,
} from "@/lib/types";

const GOALS: { value: Goal; label: string }[] = [
  { value: "lose_weight", label: "Lose weight" },
  { value: "gain_muscle", label: "Gain muscle" },
  { value: "eat_balanced", label: "Eat balanced" },
  { value: "manage_condition", label: "Manage condition" },
];

const RESTRICTIONS: { value: Restriction; label: string }[] = [
  { value: "vegetarian", label: "Vegetarian" },
  { value: "vegan", label: "Vegan" },
  { value: "gluten_free", label: "Gluten-free" },
  { value: "lactose_free", label: "Lactose-free" },
  { value: "nut_allergy", label: "Nut allergy" },
  { value: "seafood_allergy", label: "Seafood allergy" },
  { value: "halal", label: "Halal" },
  { value: "kosher", label: "Kosher" },
  { value: "none", label: "None" },
];

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
];

const ACTIVITY_LEVELS: { value: ActivityLevel; label: string }[] = [
  { value: "sedentary", label: "Sedentary" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very Active" },
];

const THEME_OPTIONS: { value: Theme; label: string; icon: typeof Sun }[] = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
];

export default function SettingsPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const updateProfile = useStore((s) => s.updateProfile);
  const setProfile = useStore((s) => s.setProfile);
  const theme = useStore((s) => s.theme);
  const setTheme = useStore((s) => s.setTheme);
  const clearHistory = useStore((s) => s.clearHistory);

  const [editing, setEditing] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Edit form state
  const [goal, setGoal] = useState<Goal>(profile?.goal || "eat_balanced");
  const [restrictions, setRestrictions] = useState<Restriction[]>(
    profile?.restrictions || []
  );
  const [sex, setSex] = useState<Sex>(profile?.sex || "other");
  const [age, setAge] = useState(String(profile?.age || ""));
  const [unitSystem, setUnitSystem] = useState<UnitSystem>(
    profile?.unitSystem || "metric"
  );
  const [weight, setWeight] = useState(String(profile?.weight || ""));
  const [weightLbs, setWeightLbs] = useState(
    profile ? String(kgToLbs(profile.weight)) : ""
  );
  const [heightCm, setHeightCm] = useState(String(profile?.height || ""));
  const [heightFt, setHeightFt] = useState(
    profile ? String(cmToFtIn(profile.height).ft) : ""
  );
  const [heightIn, setHeightIn] = useState(
    profile ? String(cmToFtIn(profile.height).in) : ""
  );
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>(
    profile?.activityLevel || "moderate"
  );

  function toggleRestriction(r: Restriction) {
    setRestrictions((prev) => {
      if (r === "none") return prev.includes("none") ? [] : ["none"];
      const withoutNone = prev.filter((x) => x !== "none");
      return withoutNone.includes(r)
        ? withoutNone.filter((x) => x !== r)
        : [...withoutNone, r];
    });
  }

  function handleSave() {
    const weightKg =
      unitSystem === "metric" ? Number(weight) : lbsToKg(Number(weightLbs));
    const heightInCm =
      unitSystem === "metric"
        ? Number(heightCm)
        : ftInToCm(Number(heightFt), Number(heightIn));

    const { tdee, dailyTarget } = calculateProfileNutrition({
      sex,
      weight: weightKg,
      height: heightInCm,
      age: Number(age),
      activityLevel,
      goal,
    });

    const newProfile = {
      goal,
      restrictions,
      sex,
      age: Number(age),
      weight: weightKg,
      height: heightInCm,
      activityLevel,
      unitSystem,
      tdee,
      dailyTarget,
      onboardingComplete: true,
    };

    if (profile) {
      updateProfile(newProfile);
    } else {
      setProfile(newProfile);
    }

    setEditing(false);
  }

  function handleClearData() {
    clearHistory();
    setShowClearConfirm(false);
  }

  const isMetric = unitSystem === "metric";

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-6">
        Settings
      </h1>

      {/* Profile section */}
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <User className="w-4 h-4" />
            Profile
          </CardTitle>
          {profile && !editing && (
            <button
              onClick={() => setEditing(true)}
              className="text-sm text-primary font-medium"
            >
              Edit
            </button>
          )}
        </CardHeader>
        <CardContent>
          {!profile && !editing ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                No profile set up yet.
              </p>
              <Button size="sm" onClick={() => router.push("/onboarding")}>
                Set up profile
              </Button>
            </div>
          ) : editing ? (
            <div className="space-y-4">
              {/* Goal */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Goal
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button
                      key={g.value}
                      onClick={() => setGoal(g.value)}
                      className={`rounded-xl border-2 py-2.5 text-xs font-medium transition-all active:scale-[0.98] ${
                        goal === g.value
                          ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {g.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Restrictions */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Dietary restrictions
                </label>
                <div className="flex flex-wrap gap-2">
                  {RESTRICTIONS.map((r) => (
                    <button
                      key={r.value}
                      onClick={() => toggleRestriction(r.value)}
                      className={`rounded-full px-3 py-1.5 text-xs font-medium transition-all active:scale-[0.98] ${
                        restrictions.includes(r.value)
                          ? "bg-primary text-white"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sex */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Sex
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {SEX_OPTIONS.map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setSex(s.value)}
                      className={`rounded-xl border-2 py-2 text-xs font-medium transition-all active:scale-[0.98] ${
                        sex === s.value
                          ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Age
                </label>
                <Input
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="e.g. 28"
                />
              </div>

              {/* Units */}
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">
                  Units
                </label>
                <div className="flex rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  {(["metric", "imperial"] as UnitSystem[]).map((u) => (
                    <button
                      key={u}
                      onClick={() => setUnitSystem(u)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        unitSystem === u
                          ? "bg-primary text-white"
                          : "bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400"
                      }`}
                    >
                      {u === "metric" ? "kg/cm" : "lbs/ft"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Weight ({isMetric ? "kg" : "lbs"})
                </label>
                <Input
                  type="number"
                  inputMode="decimal"
                  value={isMetric ? weight : weightLbs}
                  onChange={(e) =>
                    isMetric
                      ? setWeight(e.target.value)
                      : setWeightLbs(e.target.value)
                  }
                  placeholder={isMetric ? "e.g. 70" : "e.g. 154"}
                />
              </div>

              {/* Height */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Height ({isMetric ? "cm" : "ft/in"})
                </label>
                {isMetric ? (
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={heightCm}
                    onChange={(e) => setHeightCm(e.target.value)}
                    placeholder="e.g. 170"
                  />
                ) : (
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightFt}
                      onChange={(e) => setHeightFt(e.target.value)}
                      placeholder="ft"
                    />
                    <Input
                      type="number"
                      inputMode="numeric"
                      value={heightIn}
                      onChange={(e) => setHeightIn(e.target.value)}
                      placeholder="in"
                    />
                  </div>
                )}
              </div>

              {/* Activity level */}
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">
                  Activity level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIVITY_LEVELS.map((l) => (
                    <button
                      key={l.value}
                      onClick={() => setActivityLevel(l.value)}
                      className={`rounded-xl border-2 py-2.5 text-xs font-medium transition-all active:scale-[0.98] ${
                        activityLevel === l.value
                          ? "border-primary bg-primary/5 dark:bg-primary/10 text-primary"
                          : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="secondary"
                  className="flex-1"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
                <Button className="flex-[2]" onClick={handleSave}>
                  Save changes
                </Button>
              </div>
            </div>
          ) : (
            /* Profile summary (read-only) */
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Goal</span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {GOALS.find((g) => g.value === profile!.goal)?.label}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Restrictions</span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {profile!.restrictions
                    .map(
                      (r) =>
                        RESTRICTIONS.find((x) => x.value === r)?.label || r
                    )
                    .join(", ") || "None"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Daily target</span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {profile!.dailyTarget} kcal
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">TDEE</span>
                <span className="font-medium text-gray-900 dark:text-gray-50">
                  {profile!.tdee} kcal
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Theme */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-2">
            {THEME_OPTIONS.map((opt) => {
              const Icon = opt.icon;
              return (
                <button
                  key={opt.value}
                  onClick={() => setTheme(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 py-3 transition-all active:scale-[0.98] ${
                    theme === opt.value
                      ? "border-primary bg-primary/5 dark:bg-primary/10"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <Icon
                    className={`w-5 h-5 ${
                      theme === opt.value
                        ? "text-primary"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-medium ${
                      theme === opt.value
                        ? "text-primary"
                        : "text-gray-600 dark:text-gray-400"
                    }`}
                  >
                    {opt.label}
                  </span>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Data */}
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="text-base">Data</CardTitle>
        </CardHeader>
        <CardContent>
          {showClearConfirm ? (
            <div className="rounded-xl bg-red-50 dark:bg-red-950/30 p-4">
              <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                This will permanently delete your scan history. Your profile
                will be kept.
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowClearConfirm(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={handleClearData}
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                  Delete history
                </Button>
              </div>
            </div>
          ) : (
            <Button
              variant="secondary"
              className="w-full justify-between"
              onClick={() => setShowClearConfirm(true)}
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-red-500" />
                Clear scan history
              </span>
              <ChevronRight className="w-4 h-4 text-gray-400" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Info className="w-4 h-4" />
            About
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
            <p>
              <span className="font-medium text-gray-900 dark:text-gray-50">
                Eatwise
              </span>{" "}
              — AI Menu Advisor
            </p>
            <p>
              Scan restaurant menus and get personalised meal recommendations
              based on your health goals and dietary restrictions.
            </p>
            <p className="text-xs pt-2 text-gray-400 dark:text-gray-500">
              Nutritional estimates are approximate. Always confirm allergens
              with restaurant staff. Not medical advice.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
