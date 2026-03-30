# EATWISE — Project Brief for Lead Agent

> **Формат:** Ночной спринт, ~8 часов
> **Команда:** 10 агентов (Lead + Architect + Designer + 5 Dev + 2 QA)
> **Цель:** Полноценный MVP, готовый к деплою
> **Дата:** 2026-03-31

---

## 1. PRODUCT VISION

**Eatwise** — ИИ-советчик для осознанного питания вне дома. Не трекер калорий. Не дневник еды. Один конкретный use case: ты сидишь в ресторане, сканируешь меню → получаешь персональные рекомендации что заказать, исходя из своих целей и ограничений.

### Ключевое позиционирование

Все конкуренты — это дневники (фиксируют то, что уже съел). Eatwise помогает принять лучшее решение ДО заказа. Это advisor, не tracker.

### Главный принцип: честность

Не показываем ложную точность. Вместо «487 ккал» → диапазон «400–650 ккал» + светофор + actionable-совет. Калорийность блюда в ресторане зависит от рецепта, порции, повара — и может отличаться в 2+ раза от средних значений. Мы это признаём и работаем с диапазонами.

---

## 2. TARGET USERS

**Primary:** Люди 25–45, которые следят за питанием (дефицит калорий, набор массы, ПП) и регулярно едят вне дома (3+ раз в неделю).

**Secondary:** Люди с пищевыми аллергиями / непереносимостями (глютен, лактоза, орехи) — для них это вопрос безопасности.

**Tertiary:** Путешественники, которые сталкиваются с незнакомыми меню на чужом языке.

---

## 3. FEATURE SPECIFICATION (MVP scope)

### 3.1 Landing Page

Одностраничный лендинг, который объясняет продукт и ведёт к действию.

- Hero-секция с value proposition: «Scan any menu. Eat smarter.»
- Демо-видео/GIF: как работает сканирование (можно мокап)
- 3 ключевые фичи (иконки + короткое описание)
- Social proof (заглушки для будущих отзывов)
- CTA → «Try now» (ведёт в приложение)
- Footer: links, legal

**Язык лендинга:** Английский (primary market — US/EU)
**Тон:** Дружелюбный, уверенный, без хайпа. НЕ используем слова «революционный», «game-changer» и т.п.

### 3.2 Onboarding (3 шага, без регистрации)

Приложение работает БЕЗ аккаунта. Аккаунт — опционально, для сохранения данных между устройствами.

**Step 1 — Goal (одиночный выбор):**
- Lose weight (calorie deficit)
- Gain muscle (high protein)
- Eat balanced (general health)
- Manage condition (diabetes, cholesterol)

**Step 2 — Restrictions (множественный выбор):**
- Vegetarian
- Vegan
- Gluten-free
- Lactose-free
- Nut allergy
- Seafood allergy
- Halal
- Kosher
- None

**Step 3 — Basic params:**
- Sex (M/F/Other)
- Age (number input)
- Weight (kg or lbs, toggle)
- Height (cm or ft/in, toggle)
- Activity level (Sedentary / Moderate / Active / Very Active)

Система рассчитывает примерную дневную норму (TDEE) по формуле Mifflin-St Jeor и корректирует по цели:
- Lose weight: TDEE − 500 kcal
- Gain muscle: TDEE + 300 kcal
- Balanced: TDEE
- Manage condition: TDEE (с фокусом на макросы)

Данные сохраняются в localStorage. Можно редактировать позже в Settings.

### 3.3 Menu Scanner (CORE FEATURE)

**Input:** Фото меню (камера или загрузка из галереи)

**Processing pipeline:**
1. Загрузка изображения
2. Отправка в Claude API (vision) с промптом для OCR + анализа
3. Claude извлекает: названия блюд, описания, цены (если есть)
4. Claude для каждого блюда оценивает: калорийность (диапазон min-max), белки/жиры/углеводы (диапазон), ключевые аллергены, возможные модификации
5. Система ранжирует блюда по соответствию профилю пользователя
6. Рендер результатов

**CRITICAL: Prompt engineering для Claude API**

Промпт должен инструктировать модель:
- Распознать язык меню и все блюда
- Для каждого блюда дать диапазон калорий (не точное число!), основываясь на типичных ресторанных порциях
- Определить основные макронутриенты (диапазоны)
- Флагнуть потенциальные аллергены
- Предложить модификации для снижения калорийности / увеличения белка
- Вернуть структурированный JSON

Пример структуры ответа от Claude:
```json
{
  "menu_language": "en",
  "restaurant_type": "Italian casual dining",
  "dishes": [
    {
      "name": "Caesar Salad",
      "original_name": "Caesar Salad",
      "description": "Romaine lettuce, parmesan, croutons, Caesar dressing",
      "price": "€12.50",
      "calories": { "min": 350, "max": 650 },
      "protein": { "min": 12, "max": 20 },
      "carbs": { "min": 15, "max": 30 },
      "fat": { "min": 20, "max": 45 },
      "allergens": ["gluten", "dairy", "eggs"],
      "flags": ["high-fat-dressing"],
      "modifications": [
        {
          "suggestion": "Ask for dressing on the side",
          "calorie_impact": "-100 to -200 kcal"
        },
        {
          "suggestion": "Skip croutons",
          "calorie_impact": "-50 to -80 kcal",
          "removes_allergen": "gluten"
        }
      ],
      "score": 0.72
    }
  ]
}
```

**Score** рассчитывается на фронте по формуле, учитывающей:
- Соответствие калорийности оставшемуся бюджету (если пользователь ввёл, что уже ел сегодня — опционально, не обязательно)
- Соответствие макросам цели
- Отсутствие аллергенов из профиля
- Наличие простых модификаций для улучшения

### 3.4 Results Screen

**Layout:**

**Top: Панель «ТОП-3 для тебя»**
- 3 карточки лучших блюд по score
- Каждая карточка: название, светофор (🟢🟡🔴), диапазон ккал, краткий тег («High protein», «Low carb»)
- Тап по карточке → раскрытие с деталями и модификациями

**Middle: Полное меню со светофором**
- Все распознанные блюда
- Каждое с иконкой светофора и диапазоном ккал
- Фильтры сверху: All / Safe for me (без моих аллергенов) / Green only
- Аллергены помечены красными бейджами

**Bottom: Советы по модификации**
- Общие рекомендации для данного типа кухни
- Например: «В итальянской кухне попросите оливковое масло вместо сливочного соуса»

**Allergen Warning:**
Если в меню есть блюда с аллергенами пользователя — показываем ⚠️ плашку: «X dishes contain [allergen]. Always confirm with your waiter.»

### 3.5 Optional: Quick Daily Context

НЕ полноценный трекер. Простое поле на главном экране:

«Already eaten today? (optional)»
→ Текстовое поле, свободный ввод: «oatmeal for breakfast, chicken sandwich for lunch»
→ Claude API оценивает примерное потребление
→ Система корректирует рекомендации: «You have ~800 kcal left for dinner»

Это ОПЦИОНАЛЬНО. Приложение полностью работает без этого.

### 3.6 History

- Список последних сканов (дата, тип кухни, количество блюд)
- Тап → повторный просмотр результатов
- Хранение в localStorage (до 20 последних)

### 3.7 Settings

- Редактирование профиля (цели, ограничения, параметры)
- Единицы измерения (metric/imperial)
- Язык интерфейса (EN по умолчанию, подготовить i18n-структуру)
- Тема (light/dark, следует системной)
- «About» / Privacy Policy ссылки

---

## 4. TECHNICAL ARCHITECTURE

### 4.1 Stack

| Layer | Technology | Reason |
|-------|-----------|--------|
| Framework | Next.js 14+ (App Router) | SSR, API routes, отличный DX |
| Styling | Tailwind CSS | Быстрая стилизация, responsive |
| UI Components | shadcn/ui | Качественные, кастомизируемые компоненты |
| AI | Claude API (claude-sonnet-4-20250514) | Vision для OCR + анализ, оптимальный баланс качества и скорости |
| State | Zustand | Лёгкий, без бойлерплейта |
| Storage | localStorage + опционально Supabase | MVP без бэкенда, Supabase для будущей авторизации |
| Camera | Native `<input type="file" accept="image/*" capture="environment">` | Надёжнее чем getUserMedia на мобилках |
| Deploy | Vercel | Zero-config для Next.js |

### 4.2 Архитектура

```
┌─────────────────────────────────────────────┐
│                  FRONTEND                    │
│              (Next.js App Router)            │
│                                             │
│  ┌─────────┐ ┌──────────┐ ┌──────────────┐ │
│  │ Landing │ │Onboarding│ │  Scanner     │ │
│  │  Page   │ │  Flow    │ │  + Results   │ │
│  └─────────┘ └──────────┘ └──────┬───────┘ │
│                                  │         │
│  ┌─────────┐ ┌──────────┐       │         │
│  │ History │ │ Settings │       │         │
│  └─────────┘ └──────────┘       │         │
│                                  │         │
│  ┌──────────────────────────────┤         │
│  │  Zustand Store               │         │
│  │  (profile, history, scans)   │         │
│  └──────────────┬───────────────┘         │
│                 │                          │
│        localStorage                        │
└─────────────────┼──────────────────────────┘
                  │ API Route
                  ▼
┌─────────────────────────────────────────────┐
│          NEXT.JS API ROUTES                  │
│                                             │
│  POST /api/scan                             │
│  - Receives image (base64)                  │
│  - Sends to Claude API (vision)             │
│  - Returns structured dish data             │
│                                             │
│  POST /api/estimate-intake                  │
│  - Receives free-text description           │
│  - Claude estimates kcal consumed           │
│  - Returns estimate                         │
│                                             │
└──────────────────┬──────────────────────────┘
                   │
                   ▼
          ┌─────────────────┐
          │   Claude API    │
          │ (Anthropic)     │
          └─────────────────┘
```

### 4.3 Camera Strategy (ВАЖНО)

НЕ используем `getUserMedia()` / WebRTC. Это ломается на iOS PWA и создаёт проблемы с permissions.

Используем стандартный `<input>`:
```html
<input
  type="file"
  accept="image/*"
  capture="environment"
  onChange={handleImageUpload}
/>
```

Это открывает нативную камеру телефона или выбор из галереи. Работает надёжно на всех платформах. UX немного менее «app-like», но зато стабильно.

Дополнительно: стилизуем кнопку как красивый CTA с иконкой камеры, скрывая стандартный input.

### 4.4 Claude API Prompt (основа продукта)

Это САМАЯ ВАЖНАЯ часть приложения. Качество промпта определяет качество продукта.

```
System prompt для /api/scan:

You are a professional nutritionist AI that analyzes restaurant menus.
You receive a photo of a restaurant menu and a user profile.

Your task:
1. OCR: Extract ALL dish names, descriptions, and prices from the menu photo.
2. For EACH dish, estimate:
   - Calorie range (min-max) based on typical restaurant portions
   - Macronutrient ranges (protein, carbs, fat in grams)
   - Potential allergens (from common ingredients in this type of dish)
   - 1-2 modification suggestions to make the dish healthier or better fit the user's goals

CRITICAL RULES:
- Always provide RANGES, never single numbers. Restaurant portions vary wildly.
- Base estimates on RESTAURANT portions (typically 30-50% larger than home-cooked).
- When unsure about ingredients, list them as "possible allergen" not "confirmed".
- If you can't read a menu item clearly, include it with a "low confidence" flag.
- Respond ONLY in valid JSON format.
- Menu may be in ANY language. Always translate dish names to English while keeping originals.

User profile will be provided as:
{goal, restrictions, allergens, daily_target_kcal, remaining_kcal_today (if provided)}

Scoring guidance:
- Score 0.0-1.0 for each dish based on fit to user profile
- Higher score = better fit for their goals + safe from their allergens
- Penalize heavily for allergen matches
- Boost dishes that are easily modifiable to fit better
```

Этот промпт должен быть тщательно протестирован QA на разных типах меню:
- Английское меню с описаниями
- Минималистичное меню (только названия)
- Меню на другом языке (японский, тайский, итальянский)
- Рукописное / на доске (фото с плохим качеством)
- Длинное меню (20+ блюд)

### 4.5 Структура проекта

```
eatwise/
├── app/
│   ├── layout.tsx                # Root layout + providers
│   ├── page.tsx                  # Landing page
│   ├── (app)/
│   │   ├── layout.tsx            # App layout (с nav)
│   │   ├── onboarding/
│   │   │   └── page.tsx          # 3-step onboarding
│   │   ├── scan/
│   │   │   └── page.tsx          # Camera + upload
│   │   ├── results/
│   │   │   └── page.tsx          # Scan results
│   │   ├── history/
│   │   │   └── page.tsx          # Past scans
│   │   └── settings/
│   │       └── page.tsx          # Profile settings
│   └── api/
│       ├── scan/
│       │   └── route.ts          # Menu analysis endpoint
│       └── estimate-intake/
│           └── route.ts          # Quick daily context endpoint
├── components/
│   ├── ui/                       # shadcn components
│   ├── landing/                  # Landing page sections
│   ├── onboarding/               # Step components
│   ├── scanner/                  # Camera, upload, processing
│   ├── results/                  # Dish cards, filters, top picks
│   └── shared/                   # Navigation, layouts, etc.
├── lib/
│   ├── store.ts                  # Zustand store
│   ├── prompts.ts                # Claude API prompts
│   ├── scoring.ts                # Dish scoring algorithm
│   ├── nutrition.ts              # TDEE calculation, macros
│   ├── types.ts                  # TypeScript types
│   └── utils.ts                  # Helpers
├── public/
│   ├── icons/                    # App icons, favicons
│   └── images/                   # Landing page assets
├── tailwind.config.ts
├── next.config.js
├── package.json
└── tsconfig.json
```

---

## 5. DESIGN DIRECTION

### 5.1 Visual Identity

**Palette:**
- Primary: Тёплый зелёный (#22C55E → хелси, натуральный)
- Secondary: Тёплый белый / кремовый (#FAFAF5)
- Accent: Мягкий оранжевый (#F59E0B) для CTA
- Text: Тёмно-серый (#1C1917), не чёрный
- Surfaces: Белый с лёгкими тенями

**Светофор:**
- 🟢 Green: #22C55E — отличный выбор для целей
- 🟡 Yellow: #F59E0B — нормально, но не идеально
- 🔴 Red: #EF4444 — не рекомендуется (аллерген или сильно не вписывается)

**Typography:**
- Headings: Inter (bold, semi-bold)
- Body: Inter (regular)
- Numbers/data: Monospace или tabular nums

**Mood:** Чистый, тёплый, не медицинский. Больше «friendly food advisor» чем «clinical nutrition tool». Никаких stock-фото с улыбающимися людьми и салатами.

### 5.2 Mobile-First

Всё проектируется в первую очередь под мобилку (375px). Desktop — адаптация, не наоборот. Основной use case — человек в ресторане со смартфоном.

### 5.3 Dark Mode

Обязательно. Рестораны часто с приглушённым светом — яркий белый экран бьёт в глаза. Dark mode по системным настройкам + ручной переключатель.

### 5.4 Ключевые UI-состояния

- **Empty state** (первый запуск): мотивирующее сообщение + CTA к сканированию
- **Scanning/loading**: анимация с текстом «Analyzing your menu...» (5-15 секунд)
- **Results**: карточки с раскрытием деталей
- **Error states**: «Couldn't read the menu clearly. Try a clearer photo.» / «Something went wrong. Try again.»

---

## 6. AGENT ROLES & TASK ALLOCATION

### Architect
- Развернуть структуру проекта (Next.js init, конфиги, структура папок)
- Определить и задокументировать TypeScript типы (types.ts)
- Реализовать API routes (scan, estimate-intake)
- Написать и оттюнить Claude API промпты
- Реализовать scoring алгоритм
- Реализовать TDEE калькулятор и nutrition утилиты
- Code review критических компонентов

### Designer (Frontend Agent #1)
- Дизайн-система: цвета, типографика, spacing (tailwind config)
- Landing page (полная реализация)
- Компоненты shared UI: навигация, кнопки, карточки, модалы
- Иконки, иллюстрации (можно SVG/Lucide)
- Dark mode implementation
- Анимации и transitions

### Frontend Agent #2 — Onboarding
- 3-step onboarding flow
- Form validation
- Сохранение в Zustand store + localStorage
- Settings page (переиспользование onboarding-компонентов)

### Frontend Agent #3 — Scanner
- Camera/upload UI (стилизованный input)
- Image preview и crop (если нужно)
- Upload flow → API call → loading state
- Error handling (плохое фото, таймаут API, и т.д.)

### Frontend Agent #4 — Results
- Results page layout
- Top-3 recommendation cards
- Full menu list с светофором
- Filters (All / Safe / Green)
- Dish detail expansion (макросы, аллергены, модификации)
- Allergen warning banner
- «Quick daily context» опциональный блок

### Frontend Agent #5 — History & State
- Zustand store (вся бизнес-логика состояния)
- localStorage persistence middleware
- History page (список сканов, повторный просмотр)
- Навигационные переходы между страницами
- State hydration при загрузке

### QA Agent #1 — Functional Testing
- E2E тесты основного флоу: onboarding → scan → results
- Тестирование разных типов меню (подготовить 5+ тестовых фото)
- Тестирование edge cases: пустое меню, нечитаемое фото, очень длинное меню
- Проверка localStorage persistence
- Проверка allergen filtering

### QA Agent #2 — Visual & Cross-Platform
- Responsive тестирование (375px, 414px, 768px, 1024px, 1440px)
- Dark mode проверка всех экранов
- Accessibility: контраст, aria-labels, keyboard navigation
- Performance: Lighthouse audit, image optimization
- Проверка loading states и error states

---

## 7. EXECUTION ORDER & DEPENDENCIES

```
PHASE 1: Foundation (час 1-2)
├── Architect: project setup, types, API routes, prompts
├── Designer: tailwind config, design system, landing page start
└── Block: ничто другое не начинается без types.ts и store structure

PHASE 2: Core Features (час 2-5)
├── Architect: API routes finalized, scoring algorithm, prompt testing
├── Designer: landing page complete → shared components → results cards design
├── Agent #2: onboarding flow (зависит от types.ts и store)
├── Agent #3: scanner UI (зависит от shared components)
├── Agent #4: results page (зависит от types.ts, shared components, scoring)
├── Agent #5: Zustand store, localStorage (зависит от types.ts)
└── Block: Results page ждёт готовый API route + scoring

PHASE 3: Integration (час 5-7)
├── Agent #3 + Architect: интеграция scanner → API → results
├── Agent #5: history page, навигация
├── Designer: polish, анимации, dark mode
├── QA #1: начинает функциональное тестирование
└── QA #2: начинает visual тестирование

PHASE 4: Polish & Fix (час 7-8)
├── Все devs: bugfixes по результатам QA
├── Designer: финальный polish
├── Architect: prompt tuning по результатам тестов
├── QA #1 + #2: regression testing
└── Deploy to Vercel
```

---

## 8. QUALITY CRITERIA (Definition of Done)

### Must Have (блокирует релиз)
- [ ] Лендинг загружается < 3 сек (LCP)
- [ ] Onboarding проходится за < 60 сек
- [ ] Сканирование меню возвращает результаты за < 20 сек
- [ ] Все блюда показываются с диапазоном калорий и светофором
- [ ] Аллергены из профиля корректно фильтруются
- [ ] Работает на iPhone Safari и Android Chrome
- [ ] Dark mode работает корректно
- [ ] Нет JS ошибок в консоли
- [ ] localStorage сохраняет данные между сессиями

### Should Have (важно, но не блокирует)
- [ ] Lighthouse Performance > 85
- [ ] Lighthouse Accessibility > 90
- [ ] Красивые loading и error states
- [ ] Smooth анимации переходов
- [ ] History page работает
- [ ] Quick daily context работает

### Nice to Have (если останется время)
- [ ] PWA manifest (add to home screen)
- [ ] Share results feature
- [ ] Onboarding skip для returning users
- [ ] Парсинг цен из меню

---

## 9. WHAT NOT TO DO

Это критически важно. Lead должен БЛОКИРОВАТЬ любые попытки:

- ❌ Добавлять полноценный трекер еды / дневник
- ❌ Добавлять групповой режим
- ❌ Строить B2B дашборд для ресторанов
- ❌ Использовать getUserMedia() для камеры (использовать <input type="file">)
- ❌ Добавлять регистрацию/авторизацию (MVP работает без аккаунта)
- ❌ Добавлять базу данных (всё в localStorage)
- ❌ Показывать точные числа калорий (ТОЛЬКО диапазоны)
- ❌ Тратить время на email-сборник или waitlist на лендинге
- ❌ Использовать WebRTC, WebSockets или другие сложные API
- ❌ Строить свой OCR — Claude Vision делает всё
- ❌ Добавлять monetization/paywall в MVP

---

## 10. ENV VARIABLES

```env
ANTHROPIC_API_KEY=<key>
NEXT_PUBLIC_APP_URL=https://eatwise.app  # или Vercel URL
```

Это единственный внешний API. Никаких других ключей не нужно для MVP.

---

## 11. TEST MENU PHOTOS

QA должен подготовить или найти тестовые фото меню:

1. **English casual dining** — типичное американское/европейское кафе с описаниями блюд
2. **Minimalist menu** — только названия, без описаний (итальянский ресторан)
3. **Asian menu with photos** — японское/тайское меню с картинками блюд
4. **Foreign language only** — меню полностью на не-английском языке
5. **Handwritten / chalkboard** — рукописное меню (сложный OCR кейс)
6. **Long menu** — 25+ позиций (проверка производительности)
7. **Menu with allergen marks** — меню где ресторан сам маркирует аллергены

Для каждого фото QA проверяет:
- Все ли блюда распознаны?
- Адекватны ли диапазоны калорий?
- Корректно ли определены аллергены?
- Работают ли модификации?
- Адекватен ли скоринг/светофор?

---

## 12. SUCCESS METRICS (post-launch)

Когда продукт будет задеплоен, вот что будем отслеживать для валидации:

- **Scan completion rate**: % пользователей, дошедших от фото до результатов (цель: >80%)
- **Result interaction**: % пользователей, тапнувших хотя бы 1 блюдо (цель: >60%)
- **Return usage**: % пользователей, вернувшихся в течение 7 дней (цель: >20%)
- **Time to value**: время от первого открытия до первого скана (цель: <90 сек)

---

## 13. FINAL NOTES FOR LEAD

1. **Приоритет #1 — работающий scan → results flow.** Если через 4 часа это работает — проект будет успешным, даже если лендинг простой.

2. **Приоритет #2 — качество промпта.** Промпт для Claude API определяет 80% ценности продукта. Architect должен потратить на это непропорционально много времени, тестируя на разных меню.

3. **Приоритет #3 — мобильный UX.** Человек стоит в ресторане с телефоном. Всё должно быть удобно одной рукой. Большие кнопки, мало текста, быстрые переходы.

4. **Не переусложняй.** Лучше 5 экранов, которые работают идеально, чем 15, которые работают посредственно.

5. **При конфликте между фичей и стабильностью — выбирай стабильность.**
