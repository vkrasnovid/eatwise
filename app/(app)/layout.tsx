"use client";

import { NavBar } from "@/components/shared/nav-bar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-secondary dark:bg-gray-950">
      <main className="mx-auto max-w-lg pb-20">{children}</main>
      <NavBar />
    </div>
  );
}
