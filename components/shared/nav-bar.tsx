"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Camera, Clock, Settings, Leaf } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/scan", label: "Scan", icon: Camera },
  { href: "/history", label: "History", icon: Clock },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/80 backdrop-blur-lg dark:border-gray-800 dark:bg-gray-900/80">
      <div className="mx-auto flex max-w-lg items-center justify-around py-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-col items-center gap-1 rounded-lg px-4 py-2 text-xs transition-colors",
                isActive
                  ? "text-primary font-medium"
                  : "text-text-muted hover:text-text dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
