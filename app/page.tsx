import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Shield,
  Zap,
  ChevronRight,
  Leaf,
  Star,
  ArrowRight,
} from "lucide-react";

const features = [
  {
    icon: Camera,
    title: "Scan any menu",
    description:
      "Point your camera at a printed or digital menu. Eatwise reads it instantly — no manual typing required.",
    color: "text-[#22C55E]",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
  {
    icon: Shield,
    title: "Allergen alerts",
    description:
      "Tell us your dietary restrictions once. We flag every dish that could be a problem, so you can order with confidence.",
    color: "text-[#F59E0B]",
    bg: "bg-amber-50 dark:bg-amber-950/30",
  },
  {
    icon: Zap,
    title: "Smart recommendations",
    description:
      "Get a personalised top-3 based on your goals — whether you're watching calories, building muscle, or eating plant-based.",
    color: "text-[#22C55E]",
    bg: "bg-green-50 dark:bg-green-950/30",
  },
];

const testimonials = [
  {
    quote:
      "I used to spend five minutes Googling every dish. Now I just scan and go. It's made eating out so much less stressful.",
    name: "Priya M.",
    detail: "Managing coeliac disease",
  },
  {
    quote:
      "As someone tracking macros, Eatwise is the only tool that actually understands restaurant portions. The calorie ranges are honest.",
    name: "Daniel K.",
    detail: "Fitness enthusiast",
  },
  {
    quote:
      "My kids have multiple allergies. Having everything flagged in one glance before we even sit down is genuinely life-changing.",
    name: "Sarah L.",
    detail: "Parent of two",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAFAF5] dark:bg-[#0C0A09] text-[#1C1917] dark:text-[#FAFAF5]">
      {/* Nav */}
      <header className="sticky top-0 z-50 bg-[#FAFAF5]/90 dark:bg-[#0C0A09]/90 backdrop-blur-sm border-b border-stone-100 dark:border-stone-800">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Leaf className="w-5 h-5 text-[#22C55E]" aria-hidden="true" />
            <span className="font-semibold text-base tracking-tight">
              Eatwise
            </span>
          </div>
          <Link href="/onboarding">
            <Button
              size="sm"
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-4 text-sm font-medium transition-colors"
            >
              Get started
            </Button>
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden px-4 pt-16 pb-20 sm:pt-24 sm:pb-28">
          {/* Decorative blobs */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
          >
            <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-[#22C55E]/10 blur-3xl" />
            <div className="absolute top-16 -right-24 w-64 h-64 rounded-full bg-[#F59E0B]/10 blur-3xl" />
          </div>

          <div className="relative max-w-5xl mx-auto text-center">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/40 text-[#22C55E] text-xs font-medium mb-6 select-none">
              <Leaf className="w-3 h-3" aria-hidden="true" />
              <span>AI-powered menu advice</span>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-[1.1] mb-6">
              Scan any menu.{" "}
              <span className="text-[#22C55E]">Eat smarter.</span>
            </h1>

            <p className="max-w-xl mx-auto text-base sm:text-lg text-stone-500 dark:text-stone-400 leading-relaxed mb-10">
              Eatwise reads restaurant menus and recommends the dishes that
              match your health goals — while flagging anything that doesn&apos;t
              suit your diet.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
              <Link href="/onboarding" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-green-200 dark:shadow-green-900/30 transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Start for free
                  <ArrowRight className="ml-2 w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
              <p className="text-xs text-stone-400 dark:text-stone-500 sm:ml-1">
                No account needed &middot; Works on any menu
              </p>
            </div>

            {/* Hero illustration placeholder */}
            <div className="mt-14 mx-auto max-w-sm sm:max-w-md">
              <div className="relative rounded-3xl bg-white dark:bg-stone-900 shadow-2xl shadow-stone-200/60 dark:shadow-stone-900/60 border border-stone-100 dark:border-stone-800 overflow-hidden aspect-[9/7]">
                {/* Simulated app UI */}
                <div className="absolute inset-0 p-4 flex flex-col gap-3">
                  <div className="h-2 w-24 rounded bg-stone-100 dark:bg-stone-800" />
                  <div className="flex-1 grid grid-cols-1 gap-2">
                    {[
                      { label: "Grilled salmon", color: "#22C55E", width: "w-16" },
                      { label: "Caesar salad", color: "#22C55E", width: "w-20" },
                      { label: "Margherita pizza", color: "#F59E0B", width: "w-24" },
                      { label: "Beef burger", color: "#EF4444", width: "w-14" },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-stone-50 dark:bg-stone-800/60"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span className="text-xs text-stone-600 dark:text-stone-300 font-medium">
                          {item.label}
                        </span>
                        <div className="ml-auto flex gap-1 items-center">
                          <div
                            className={`h-1.5 ${item.width} rounded-full opacity-30`}
                            style={{ backgroundColor: item.color }}
                            aria-hidden="true"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl bg-[#22C55E]">
                    <Camera className="w-3.5 h-3.5 text-white" aria-hidden="true" />
                    <span className="text-xs text-white font-semibold">
                      Scan menu
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section
          id="features"
          className="px-4 py-16 sm:py-20 bg-white dark:bg-stone-900/50"
        >
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Everything you need at the table
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base max-w-md mx-auto">
                Three features that make every meal out a little easier.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {features.map((feat) => {
                const Icon = feat.icon;
                return (
                  <div
                    key={feat.title}
                    className="group rounded-2xl p-6 border border-stone-100 dark:border-stone-800 bg-white dark:bg-stone-900 hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`inline-flex items-center justify-center w-11 h-11 rounded-xl ${feat.bg} mb-5`}
                    >
                      <Icon
                        className={`w-5 h-5 ${feat.color}`}
                        aria-hidden="true"
                      />
                    </div>
                    <h3 className="font-semibold text-base mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section className="px-4 py-16 sm:py-20">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Three steps, done
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base max-w-md mx-auto">
                From menu to recommendation in under 30 seconds.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
              {/* Connector line — desktop only */}
              <div
                aria-hidden="true"
                className="hidden sm:block absolute top-7 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-gradient-to-r from-stone-200 via-[#22C55E]/40 to-stone-200 dark:from-stone-700 dark:via-[#22C55E]/30 dark:to-stone-700"
              />

              {[
                {
                  step: "1",
                  title: "Set your profile",
                  body: "Tell us your goal (lose weight, maintain, gain), any allergies, and a few body stats. Takes about a minute.",
                },
                {
                  step: "2",
                  title: "Scan the menu",
                  body: "Tap the camera button and photograph the menu. Eatwise uses AI to read and analyse every dish.",
                },
                {
                  step: "3",
                  title: "Order with confidence",
                  body: "See your top picks highlighted in green, cautions in yellow, and anything to avoid in red.",
                },
              ].map((item) => (
                <div key={item.step} className="flex flex-col items-center text-center gap-3">
                  <div className="relative z-10 w-14 h-14 rounded-full bg-[#22C55E] text-white flex items-center justify-center text-lg font-bold shadow-md shadow-green-200 dark:shadow-green-900/40">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-base">{item.title}</h3>
                  <p className="text-sm text-stone-500 dark:text-stone-400 leading-relaxed max-w-[220px]">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Social proof */}
        <section className="px-4 py-16 sm:py-20 bg-white dark:bg-stone-900/50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                People are eating better
              </h2>
              <p className="text-stone-500 dark:text-stone-400 text-sm sm:text-base max-w-md mx-auto">
                Real stories from people who use Eatwise every time they eat
                out.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {testimonials.map((t) => (
                <div
                  key={t.name}
                  className="rounded-2xl p-6 border border-stone-100 dark:border-stone-800 bg-[#FAFAF5] dark:bg-stone-900 flex flex-col gap-4"
                >
                  <div className="flex gap-0.5" aria-label="5 out of 5 stars">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]"
                        aria-hidden="true"
                      />
                    ))}
                  </div>
                  <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed flex-1">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-stone-400 dark:text-stone-500">
                      {t.detail}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA banner */}
        <section className="px-4 py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="rounded-3xl bg-gradient-to-br from-[#22C55E] to-[#16A34A] p-10 sm:p-14 shadow-xl shadow-green-200/50 dark:shadow-green-900/30">
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4 tracking-tight">
                Ready to order smarter?
              </h2>
              <p className="text-green-100 text-sm sm:text-base mb-8 leading-relaxed max-w-sm mx-auto">
                Set up your profile in a minute. No account, no subscription —
                just better meal decisions every time you eat out.
              </p>
              <Link href="/onboarding">
                <Button className="bg-white text-[#16A34A] hover:bg-green-50 rounded-full px-8 py-6 text-base font-semibold shadow-md transition-all hover:scale-[1.02] active:scale-[0.98]">
                  Set up my profile
                  <ChevronRight className="ml-1 w-4 h-4" aria-hidden="true" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-stone-100 dark:border-stone-800 px-4 py-10">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4 text-[#22C55E]" aria-hidden="true" />
            <span className="font-semibold text-sm">Eatwise</span>
          </div>

          <nav aria-label="Footer navigation">
            <ul className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {[
                { label: "About", href: "#" },
                { label: "How it works", href: "#features" },
                { label: "Privacy", href: "#" },
                { label: "Terms", href: "#" },
              ].map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-stone-400 dark:text-stone-500 hover:text-[#22C55E] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <p className="text-xs text-stone-400 dark:text-stone-500 text-center sm:text-right">
            &copy; {new Date().getFullYear()} Eatwise. Not medical advice.
          </p>
        </div>
      </footer>
    </div>
  );
}
