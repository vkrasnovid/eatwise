"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Clock, Camera, ChevronRight, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";

export default function HistoryPage() {
  const router = useRouter();
  const history = useStore((s) => s.history);
  const loadScanFromHistory = useStore((s) => s.loadScanFromHistory);

  function handleViewScan(id: string) {
    loadScanFromHistory(id);
    router.push("/results");
  }

  if (history.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-2">
          No scans yet
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-[250px]">
          Try scanning your first menu! Your scan history will appear here.
        </p>
        <Button onClick={() => router.push("/scan")}>
          <Camera className="w-4 h-4 mr-2" />
          Scan a menu
        </Button>
      </div>
    );
  }

  return (
    <div className="px-5 pt-6 pb-8">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-50 mb-1">
        History
      </h1>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Your past menu scans
      </p>

      <div className="space-y-2">
        {history.map((scan) => {
          const date = new Date(scan.scanned_at);
          const dateStr = date.toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
            year: "numeric",
          });
          const timeStr = date.toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <button
              key={scan.id}
              onClick={() => handleViewScan(scan.id)}
              className="w-full flex items-center gap-4 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 transition-all hover:shadow-sm active:scale-[0.99] text-left"
            >
              {/* Thumbnail or icon */}
              {scan.image_preview ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100 dark:bg-gray-800">
                  <Image
                    src={scan.image_preview}
                    alt=""
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Utensils className="w-5 h-5 text-primary" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-50 truncate">
                  {scan.restaurant_type}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  {dateStr} at {timeStr}
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {scan.dishes.length} dish{scan.dishes.length !== 1 ? "es" : ""} analyzed
                </p>
              </div>

              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
