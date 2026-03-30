"use client";

import { useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { scoreDish } from "@/lib/scoring";
import { generateId, fileToBase64, createImageThumbnail } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { LoadingSpinner } from "@/components/shared/loading-spinner";
import Image from "next/image";
import { Camera, Upload, X, ChevronRight } from "lucide-react";
import { Dish, ScanResult } from "@/lib/types";

type ScanPhase = "idle" | "preview" | "scanning" | "error";

export default function ScanPage() {
  const router = useRouter();
  const profile = useStore((s) => s.profile);
  const setCurrentScan = useStore((s) => s.setCurrentScan);
  const addToHistory = useStore((s) => s.addToHistory);
  const setTodayIntake = useStore((s) => s.setTodayIntake);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<ScanPhase>("idle");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [intakeText, setIntakeText] = useState<string>("");
  const [isEstimating, setIsEstimating] = useState(false);

  function applyFile(file: File) {
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setPhase("preview");
    setErrorMessage("");
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    applyFile(file);
  }

  function handleClearImage() {
    setSelectedFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setPhase("idle");
    setErrorMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  async function estimateIntakeBackground(text: string) {
    if (!text.trim()) return;
    setIsEstimating(true);
    try {
      const res = await fetch("/api/estimate-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: text.trim() }),
      });
      const data = await res.json();
      if (!data.error) {
        setTodayIntake(data);
      }
    } catch {
      // Non-blocking — intake estimate failure doesn't block the scan
    } finally {
      setIsEstimating(false);
    }
  }

  async function handleAnalyze() {
    if (!selectedFile) return;

    // Fire off intake estimate in the background if text was entered
    if (intakeText.trim()) {
      estimateIntakeBackground(intakeText);
    }

    setPhase("scanning");
    setErrorMessage("");

    let base64: string;
    try {
      base64 = await fileToBase64(selectedFile);
    } catch {
      setPhase("error");
      setErrorMessage(
        "Couldn't read the image file. Please choose a different photo."
      );
      return;
    }

    try {
      const res = await fetch("/api/scan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ image: base64, profile }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        const serverMsg: string = data.error || "";
        if (
          serverMsg.toLowerCase().includes("parse") ||
          serverMsg.toLowerCase().includes("json") ||
          serverMsg.toLowerCase().includes("read")
        ) {
          setErrorMessage(
            "Couldn't read the menu clearly. Try a clearer photo."
          );
        } else if (serverMsg.toLowerCase().includes("connect")) {
          setErrorMessage(
            "Couldn't connect to the analysis service. Check your connection and try again."
          );
        } else {
          setErrorMessage(
            serverMsg ||
              "Couldn't read the menu clearly. Try a clearer photo."
          );
        }
        setPhase("error");
        return;
      }

      // Score dishes client-side
      const remainingCalories =
        profile && profile.dailyTarget
          ? profile.dailyTarget * 0.33
          : undefined;

      const scoredDishes: Dish[] = (data.dishes || []).map((dish: Dish) => ({
        ...dish,
        score: profile
          ? scoreDish(
              dish,
              profile.goal,
              profile.restrictions,
              profile.dailyTarget,
              remainingCalories
            )
          : 0.5,
      }));

      // Build thumbnail (optional — don't fail the scan if it errors)
      let thumbnail: string | undefined;
      try {
        thumbnail = await createImageThumbnail(base64, 200);
      } catch {
        // ignore
      }

      const scan: ScanResult = {
        id: generateId(),
        menu_language: data.menu_language || "en",
        restaurant_type: data.restaurant_type || "Restaurant",
        dishes: scoredDishes,
        scanned_at: new Date().toISOString(),
        image_preview: thumbnail,
      };

      setCurrentScan(scan);
      addToHistory(scan);
      router.push("/results");
    } catch {
      setPhase("error");
      setErrorMessage(
        "Couldn't connect to the analysis service. Check your connection and try again."
      );
    }
  }

  const isLoading = phase === "scanning";

  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-950 pb-24">
      {/* Page header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 px-5 py-4">
        <h1 className="text-xl font-bold text-text dark:text-white">
          Scan Menu
        </h1>
        <p className="text-sm text-text-muted dark:text-gray-400 mt-0.5">
          Take or upload a photo of the menu
        </p>
      </div>

      <div className="px-5 py-6 space-y-5 max-w-lg mx-auto">
        {/* Hidden file inputs */}
        {/* Primary: camera capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Take a photo of the menu"
        />
        {/* Secondary: gallery / upload (no capture attribute) */}
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          aria-label="Upload menu photo from gallery"
        />

        {/* ── Loading state ── */}
        {isLoading && (
          <Card className="border-0 shadow-sm dark:bg-gray-900">
            <CardContent className="py-10">
              <LoadingSpinner message="Analyzing your menu..." />
              <p className="text-xs text-text-muted dark:text-gray-500 text-center mt-2 max-w-[240px] mx-auto">
                Our AI is reading every dish and estimating nutrition info
              </p>
            </CardContent>
          </Card>
        )}

        {/* ── Error state ── */}
        {phase === "error" && !isLoading && (
          <Card className="border border-traffic-red/30 bg-red-50 dark:bg-red-950/30 dark:border-red-800 shadow-sm animate-fade-in">
            <CardContent className="py-5 space-y-3">
              <p className="text-sm font-medium text-traffic-red">
                {errorMessage ||
                  "Couldn't read the menu clearly. Try a clearer photo."}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-traffic-red text-traffic-red hover:bg-red-50 dark:hover:bg-red-950/40"
                  onClick={() =>
                    setPhase(selectedFile ? "preview" : "idle")
                  }
                >
                  {selectedFile ? "Back to preview" : "Try again"}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-text-muted dark:text-gray-400"
                  onClick={() => {
                    handleClearImage();
                    setPhase("idle");
                  }}
                >
                  New photo
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* ── Idle state: no image selected ── */}
        {phase === "idle" && (
          <div className="space-y-4 animate-fade-in">
            {/* Primary CTA: Camera */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-3xl bg-primary hover:bg-primary-600 active:scale-[0.98] transition-all shadow-lg shadow-primary/20 py-12 flex flex-col items-center gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <div className="bg-white/20 rounded-2xl p-4">
                <Camera
                  className="h-12 w-12 text-white"
                  strokeWidth={1.5}
                />
              </div>
              <div className="text-center">
                <p className="text-lg font-bold text-white">
                  Take a photo
                </p>
                <p className="text-sm text-white/75 mt-0.5">
                  Point your camera at the menu
                </p>
              </div>
            </button>

            {/* Secondary: Upload from gallery */}
            <button
              onClick={() => galleryInputRef.current?.click()}
              className="w-full rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-primary hover:bg-primary-50 dark:hover:bg-primary-900/10 active:scale-[0.98] transition-all py-7 flex flex-col items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <Upload className="h-7 w-7 text-text-muted dark:text-gray-400" />
              <p className="text-sm font-medium text-text-muted dark:text-gray-400">
                Upload from gallery
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-600">
                JPG, PNG, WEBP supported
              </p>
            </button>

            {/* Tips card */}
            <Card className="border-0 bg-white dark:bg-gray-900 shadow-sm">
              <CardContent className="py-4 space-y-2.5">
                <p className="text-xs font-semibold text-text-muted dark:text-gray-500 uppercase tracking-wide">
                  Tips for best results
                </p>
                {[
                  "Hold the camera steady directly over the menu",
                  "Ensure good lighting — avoid harsh shadows",
                  "Capture a full page so more dishes are visible",
                  "Both printed and digital menus work great",
                ].map((tip) => (
                  <div key={tip} className="flex items-start gap-2.5">
                    <span className="mt-1 h-4 w-4 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    </span>
                    <p className="text-sm text-text dark:text-gray-300">
                      {tip}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* ── Preview state: image selected, ready to analyze ── */}
        {phase === "preview" && previewUrl && (
          <div className="space-y-4 animate-slide-up">
            {/* Image preview card */}
            <Card className="border-0 shadow-sm dark:bg-gray-900 overflow-hidden">
              <div className="relative bg-gray-100 dark:bg-gray-800">
                <Image
                  src={previewUrl}
                  alt="Selected menu"
                  width={800}
                  height={600}
                  className="w-full object-contain max-h-80"
                  unoptimized
                />
                {/* Clear button */}
                <button
                  onClick={handleClearImage}
                  className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
                  aria-label="Remove image"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <CardContent className="py-3">
                <p className="text-xs text-text-muted dark:text-gray-500 truncate">
                  {selectedFile?.name}
                </p>
              </CardContent>
            </Card>

            {/* Already eaten today — optional intake context */}
            <Card className="border-0 shadow-sm dark:bg-gray-900">
              <CardContent className="py-4 space-y-2">
                <label
                  htmlFor="intake-input"
                  className="block text-sm font-semibold text-text dark:text-white"
                >
                  Already eaten today?{" "}
                  <span className="font-normal text-text-muted dark:text-gray-400">
                    (optional)
                  </span>
                </label>
                <p className="text-xs text-text-muted dark:text-gray-500">
                  Briefly describe what you&apos;ve had — we&apos;ll use this
                  to personalise remaining calorie guidance.
                </p>
                <div className="flex gap-2 items-center">
                  <Input
                    id="intake-input"
                    placeholder="e.g. coffee, banana and a sandwich"
                    value={intakeText}
                    onChange={(e) => setIntakeText(e.target.value)}
                    className="flex-1 dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder:text-gray-600"
                    disabled={isLoading}
                  />
                  {isEstimating && (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent flex-shrink-0" />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Analyze CTA */}
            <Button
              size="lg"
              className="w-full font-semibold gap-2 shadow-sm shadow-primary/20"
              onClick={handleAnalyze}
              disabled={isLoading}
            >
              Analyze Menu
              <ChevronRight className="h-5 w-5" />
            </Button>

            {/* Retake / change photo */}
            <div className="flex gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
              >
                <Camera className="h-4 w-4 mr-1.5" />
                Retake
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => galleryInputRef.current?.click()}
                disabled={isLoading}
              >
                <Upload className="h-4 w-4 mr-1.5" />
                Gallery
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
