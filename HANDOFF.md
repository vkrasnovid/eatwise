# HANDOFF: Eatwise MVP Build

## Task
Build the complete Eatwise MVP — an AI-powered restaurant menu advisor.
The full specification is in PROJECT_BRIEF.md. Read it FIRST.

## What to Build (in order)

### Phase 1: Project Setup
1. Initialize Next.js 14+ with App Router, TypeScript, Tailwind CSS
2. Install dependencies: shadcn/ui, zustand, @anthropic-ai/sdk, lucide-react
3. Set up tailwind.config.ts with the design system from the brief:
   - Primary: #22C55E (green)
   - Secondary: #FAFAF5 (warm white)
   - Accent: #F59E0B (orange)
   - Text: #1C1917
   - Traffic light colors: green #22C55E, yellow #F59E0B, red #EF4444
4. Set up the project structure as specified in section 4.5 of the brief
5. Create lib/types.ts with all TypeScript interfaces

### Phase 2: Core Infrastructure
1. **lib/nutrition.ts** — TDEE calculator (Mifflin-St Jeor formula), macro targets per goal
2. **lib/scoring.ts** — Dish scoring algorithm (0.0-1.0) based on user profile match
3. **lib/prompts.ts** — Claude API prompts for menu scanning and intake estimation
4. **lib/store.ts** — Zustand store with localStorage persistence (profile, history, scans)
5. **app/api/scan/route.ts** — Menu analysis endpoint (receives base64 image, calls Claude Vision API, returns structured dish data)
6. **app/api/estimate-intake/route.ts** — Quick daily context endpoint (free-text → calorie estimate)

### Phase 3: UI Pages
1. **app/page.tsx** — Landing page (hero, 3 features, social proof, CTA, footer)
2. **app/(app)/onboarding/page.tsx** — 3-step onboarding (goal → restrictions → params)
3. **app/(app)/scan/page.tsx** — Camera/upload UI with styled file input
4. **app/(app)/results/page.tsx** — Results with Top-3 cards, full menu with traffic light, filters, allergen warnings
5. **app/(app)/history/page.tsx** — Past scans list from localStorage
6. **app/(app)/settings/page.tsx** — Profile editing, units toggle, theme toggle

### Phase 4: Polish
1. Dark mode (system default + manual toggle)
2. Mobile-first responsive design (375px primary)
3. Loading states with animations
4. Error states with helpful messages
5. Smooth page transitions

## API Configuration

The Claude API for menu scanning should use the OpenClaw gateway:
- **Base URL:** `http://127.0.0.1:18789/v1` (from the host)  
- **API Key:** `76a615004da286b1e7dc98b977038d4e7f4fc4df6667249f`
- **Model:** `anthropic/claude-sonnet-4-20250514`

In the API route, use the Anthropic SDK configured to point at the gateway:
```typescript
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
});
```

Set these in `.env.local`:
```
ANTHROPIC_API_KEY=76a615004da286b1e7dc98b977038d4e7f4fc4df6667249f
ANTHROPIC_BASE_URL=http://127.0.0.1:18789/v1
```

## Critical Rules
1. RANGES for calories, never single numbers (e.g., "400-650 kcal" not "487 kcal")
2. Use `<input type="file" accept="image/*" capture="environment">` for camera — NO getUserMedia/WebRTC
3. NO registration/auth — everything in localStorage
4. NO database — localStorage only
5. Mobile-first design — large touch targets, minimal text
6. Traffic light system: 🟢 great fit, 🟡 okay, 🔴 not recommended / allergen
7. All UI text in English
8. The Claude prompt in prompts.ts is THE MOST IMPORTANT part — make it thorough

## Done When
- All 6 pages render correctly
- Onboarding saves profile to localStorage
- Menu scan accepts photo, calls Claude API, returns structured results
- Results show Top-3, full menu with traffic light, allergen warnings
- History stores and displays past scans
- Settings allows profile editing
- Dark mode works
- Mobile-responsive (375px+)
- `npm run build` succeeds with zero errors

## Git
After everything works, commit all changes with a meaningful commit message and push to origin/main.
