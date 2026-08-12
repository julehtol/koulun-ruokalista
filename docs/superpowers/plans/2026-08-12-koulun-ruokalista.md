# Koulun ruokalista Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Julkaista Vercelissä pieni Next.js-sovellus, joka näyttää Pieksämäen peruskoulujen/lukion/EsEDU:n ruokalistan mobile-ystävällisesti (Tänään · Huomenna · Tällä viikolla · Ensi viikolla).

**Architecture:** Client-renderöity yksisivuinen sovellus, joka importoi `src/data/menu.json`in staattisesti build-aikana. Kaikki päivämäärälogiikka Helsingin ajassa selaimessa. Ei backendia, ei API-reittejä, ei tietokantaa.

**Tech Stack:** Next.js 15 (App Router) + TypeScript + React 18/19, pnpm, vitest, vanilla CSS, Vercel-hosting.

## Global Constraints

- **Package manager:** pnpm (ei npm/yarn).
- **Kielet:** UI suomeksi; koodi (tunnisteet, kommentit, commit-viestit) englanniksi paitsi ruokalistan sisältö.
- **Node:** 20.x (Vercelin default).
- **Ei Tailwindia** — vanilla CSS.
- **Ei date-fns / moment** — natiivi `Intl` + `Date`.
- **Aikavyöhyke:** kaikki päivämääräpäättelyt Europe/Helsinki.
- **Aksenttiväri:** `#e0b93d` (kaupungin sivun keltainen painike).
- **Puuttuvan datan viesti:** tarkalleen `"Valitsemaasi ruokalistaa ei ole vielä saatavilla"`.
- **Koulu V1:** vain "Peruskoulut, lukio ja EsEDU (Keskuskatu)".
- **Deploy target:** `julehtol/koulun-ruokalista` (public) → Vercel, auto-deploy `main`-pushista.

## Files Overview

```
koulun-ruokalista/
├── package.json                          # Task 1
├── tsconfig.json                          # Task 1
├── next.config.mjs                        # Task 1
├── vitest.config.ts                       # Task 1
├── .gitignore                             # (jo olemassa)
├── README.md                              # Task 6
├── src/
│   ├── app/
│   │   ├── layout.tsx                     # Task 5
│   │   ├── page.tsx                       # Task 5
│   │   └── globals.css                    # Task 5
│   ├── components/
│   │   ├── Ruokalista.tsx                 # Task 4 (client)
│   │   ├── TabBar.tsx                     # Task 4
│   │   ├── DayCard.tsx                    # Task 4
│   │   ├── WeekList.tsx                   # Task 4
│   │   └── EmptyState.tsx                 # Task 4
│   ├── lib/
│   │   ├── dates.ts                       # Task 3
│   │   ├── dates.test.ts                  # Task 3
│   │   └── menu.ts                        # Task 2
│   └── data/
│       └── menu.json                      # Task 2
```

---

### Task 1: Scaffold Next.js + pnpm + vitest

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.mjs`, `vitest.config.ts`
- Modify: `.gitignore` (jo olemassa, ei muutoksia)

**Interfaces:**
- Consumes: —
- Produces: toimiva `pnpm dev` -komento (blank Next.js), `pnpm test` (vitest ajaa, tyhjä), `pnpm build` (Vercel-yhteensopiva build).

- [ ] **Step 1: Luo `package.json`**

```json
{
  "name": "koulun-ruokalista",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "test:watch": "vitest"
  },
  "dependencies": {
    "next": "^15.1.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.1.0",
    "typescript": "^5.6.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0"
  },
  "packageManager": "pnpm@9.12.0"
}
```

- [ ] **Step 2: Luo `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

- [ ] **Step 3: Luo `next.config.mjs`**

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
```

- [ ] **Step 4: Luo `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
```

- [ ] **Step 5: Asenna riippuvuudet**

Run: `pnpm install`
Expected: `node_modules` luodaan, `pnpm-lock.yaml` syntyy, ei virheitä.

- [ ] **Step 6: Commit**

```bash
git add package.json pnpm-lock.yaml tsconfig.json next.config.mjs vitest.config.ts
git commit -m "chore: scaffold Next.js 15 + pnpm + vitest"
```

---

### Task 2: Data model + menu.json

**Files:**
- Create: `src/lib/menu.ts`, `src/data/menu.json`

**Interfaces:**
- Consumes: —
- Produces:
  - `type MenuData = { school: string; source: { pdfUrl: string; listPageUrl: string; updatedAt: string }; days: MenuDay[] }`
  - `type MenuDay = { date: string; main: string; vegetarian: string }`
  - `menuData: MenuData` (default export from `src/lib/menu.ts`)
  - `findDay(iso: string): MenuDay | null`

- [ ] **Step 1: Luo `src/data/menu.json` PDF:n datalla**

Data on jo tiedossa aiemmasta PDF-luvusta (`/tmp/ruokalista.pdf`). PDF kattaa viikot 27.7. – 6.9.2026 (kuusi viikkoa). Kirjoita:

```json
{
  "school": "Peruskoulut, lukio ja EsEDU (Keskuskatu)",
  "source": {
    "pdfUrl": "https://pieksamaentukipalvelut.fi/wp-content/uploads/2026/07/6.-RUOKALISTA-Koulut-27.7.-30.8.2026.pdf",
    "listPageUrl": "https://pieksamaentukipalvelut.fi/ruokalistat/",
    "updatedAt": "2026-08-12"
  },
  "days": [
    { "date": "2026-07-27", "main": "Aurinkoinen broilerkastike", "vegetarian": "Kookos-kasvispata" },
    { "date": "2026-07-28", "main": "Kalakeitto", "vegetarian": "Värikäs linssikeitto" },
    { "date": "2026-07-29", "main": "Kasvispyörykkä", "vegetarian": "Kasvispyörykkä" },
    { "date": "2026-07-30", "main": "Jauhelihalasagnette", "vegetarian": "Kasvislasagnette" },
    { "date": "2026-07-31", "main": "Riisipuuro", "vegetarian": "Porkkanasosekeitto" },
    { "date": "2026-08-03", "main": "Makkarakeitto", "vegetarian": "Tomaattinen minestronekeitto" },
    { "date": "2026-08-04", "main": "Kalapuikot", "vegetarian": "Vegepuikko" },
    { "date": "2026-08-05", "main": "Ohrapuuro", "vegetarian": "Kookos-bataattikeitto" },
    { "date": "2026-08-06", "main": "Broileririisivuoka", "vegetarian": "Vihannesriisivuoka" },
    { "date": "2026-08-07", "main": "Lihapullat, kastike", "vegetarian": "Kasvispyörykät, kastike" },
    { "date": "2026-08-10", "main": "Butter Chicken", "vegetarian": "Murea Red Curry" },
    { "date": "2026-08-11", "main": "Pinaattiohukaiset", "vegetarian": "Pinaattiohukaiset" },
    { "date": "2026-08-12", "main": "Jauhelihakastike", "vegetarian": "Kasvisbolognese" },
    { "date": "2026-08-13", "main": "Tonnikalapastavuoka", "vegetarian": "Kasviskaalilaatikko" },
    { "date": "2026-08-14", "main": "Hernekeitto", "vegetarian": "Bataattisosekeitto" },
    { "date": "2026-08-17", "main": "Nakkikastike", "vegetarian": "Chili Sin Carne" },
    { "date": "2026-08-18", "main": "Broilerinugetti", "vegetarian": "Kasvisnugetti" },
    { "date": "2026-08-19", "main": "Kahdenkalan keitto", "vegetarian": "Kasvissosekeitto" },
    { "date": "2026-08-20", "main": "Jauhelihakiusaus", "vegetarian": "Intialainen Vegan curry" },
    { "date": "2026-08-21", "main": "Pinaattikeitto", "vegetarian": "Riisipiirakka" },
    { "date": "2026-08-24", "main": "Lempeä kanakeitto", "vegetarian": "Borch-kasviskeitto" },
    { "date": "2026-08-25", "main": "Kasvisbolognese", "vegetarian": "Minispagetti" },
    { "date": "2026-08-26", "main": "Kirjolohipihvit", "vegetarian": "Marokko-kasvispihvi" },
    { "date": "2026-08-27", "main": "Lihamakaronilaatikko", "vegetarian": "Kasvis-makaronilaatikko" },
    { "date": "2026-08-28", "main": "Mannapuuro", "vegetarian": "Kasvissosekeitto" },
    { "date": "2026-08-31", "main": "Lohikastike", "vegetarian": "Kasvistikkamasala" },
    { "date": "2026-09-01", "main": "Uunimakkara", "vegetarian": "Vegenakki" },
    { "date": "2026-09-02", "main": "Broilerikastike", "vegetarian": "Nyhtökaurakastike" },
    { "date": "2026-09-03", "main": "Palermon pasta", "vegetarian": "Palermon pasta" },
    { "date": "2026-09-04", "main": "Jauhelihakeitto", "vegetarian": "Kurpitsa-linssikeitto" }
  ]
}
```

Huom: kolme päivää (29.7., 11.8., 3.9.) ei ole erillistä kasvisruokaa — pääruoka on jo kasvisruoka, joten sama teksti molempiin. Se näkyy UI:ssa OK.

- [ ] **Step 2: Luo `src/lib/menu.ts`**

```ts
import raw from '@/data/menu.json';

export type MenuDay = {
  date: string;
  main: string;
  vegetarian: string;
};

export type MenuData = {
  school: string;
  source: {
    pdfUrl: string;
    listPageUrl: string;
    updatedAt: string;
  };
  days: MenuDay[];
};

export const menuData: MenuData = raw as MenuData;

export function findDay(iso: string): MenuDay | null {
  return menuData.days.find((d) => d.date === iso) ?? null;
}
```

- [ ] **Step 3: Verify types compile**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit**

```bash
git add src/data/menu.json src/lib/menu.ts
git commit -m "feat: add menu data model and initial menu.json"
```

---

### Task 3: Date logic + tests

**Files:**
- Create: `src/lib/dates.ts`, `src/lib/dates.test.ts`

**Interfaces:**
- Consumes: —
- Produces:
  - `todayInHelsinki(now?: Date): string` — palauttaa ISO YYYY-MM-DD Helsingin aikaan.
  - `addDaysIso(iso: string, n: number): string`
  - `dayOfWeekIso(iso: string): 0..6` — 0=sunnuntai, 1=maanantai, ..., 6=lauantai.
  - `nextSchoolDay(iso: string): string` — jos la/su, palauta seuraava maanantai; muuten sama päivä.
  - `nextDayAfter(iso: string): string` — palauta seuraava kouluruokapäivä *tämän* päivän jälkeen (skippaa viikonlopun).
  - `weekMonToFri(iso: string, offset: 0 | 1): string[]` — 5 ISO-päivää alkaen ma:sta. `offset=0` = kuluva viikko (viikonloppuisin alkava viikko), `offset=1` = seuraava.
  - `formatFiWeekday(iso: string): string` — "Maanantai".
  - `formatFiDate(iso: string): string` — "24.8.".

- [ ] **Step 1: Kirjoita testit (TDD)** — Luo `src/lib/dates.test.ts`

```ts
import { describe, it, expect } from 'vitest';
import {
  todayInHelsinki,
  addDaysIso,
  dayOfWeekIso,
  nextSchoolDay,
  nextDayAfter,
  weekMonToFri,
  formatFiWeekday,
  formatFiDate,
} from './dates';

describe('todayInHelsinki', () => {
  it('palauttaa Helsingin päivän kun UTC on 22:30 (klo 01:30 next day Helsinki kesäaika)', () => {
    // 2026-08-12 22:30 UTC = 2026-08-13 01:30 Helsinki (EEST +03)
    expect(todayInHelsinki(new Date('2026-08-12T22:30:00Z'))).toBe('2026-08-13');
  });
  it('palauttaa saman päivän keskellä päivää', () => {
    expect(todayInHelsinki(new Date('2026-08-12T10:00:00Z'))).toBe('2026-08-12');
  });
});

describe('addDaysIso', () => {
  it('lisää päiviä yli kuukausirajan', () => {
    expect(addDaysIso('2026-08-31', 1)).toBe('2026-09-01');
  });
  it('lisää päiviä yli vuosirajan', () => {
    expect(addDaysIso('2026-12-31', 1)).toBe('2027-01-01');
  });
  it('vähentää päiviä negatiivisella', () => {
    expect(addDaysIso('2026-08-03', -3)).toBe('2026-07-31');
  });
});

describe('dayOfWeekIso', () => {
  it('maanantai on 1', () => {
    expect(dayOfWeekIso('2026-08-03')).toBe(1); // ma
  });
  it('sunnuntai on 0', () => {
    expect(dayOfWeekIso('2026-08-02')).toBe(0); // su
  });
  it('lauantai on 6', () => {
    expect(dayOfWeekIso('2026-08-01')).toBe(6); // la
  });
});

describe('nextSchoolDay', () => {
  it('lauantai → seuraava maanantai', () => {
    expect(nextSchoolDay('2026-08-01')).toBe('2026-08-03');
  });
  it('sunnuntai → seuraava maanantai', () => {
    expect(nextSchoolDay('2026-08-02')).toBe('2026-08-03');
  });
  it('arkipäivä pysyy samana', () => {
    expect(nextSchoolDay('2026-08-05')).toBe('2026-08-05');
  });
});

describe('nextDayAfter', () => {
  it('perjantai → seuraava maanantai', () => {
    expect(nextDayAfter('2026-08-07')).toBe('2026-08-10');
  });
  it('maanantai → tiistai', () => {
    expect(nextDayAfter('2026-08-03')).toBe('2026-08-04');
  });
  it('lauantai → tiistai (skippaa maanantai koska Tänään näyttää jo maanantain)', () => {
    // Erityissääntö: la nextDayAfter = tiistai, koska "tänään" on jo maanantai
    expect(nextDayAfter('2026-08-01')).toBe('2026-08-04');
  });
  it('sunnuntai → tiistai', () => {
    expect(nextDayAfter('2026-08-02')).toBe('2026-08-04');
  });
});

describe('weekMonToFri', () => {
  it('keskiviikosta kuluva viikko = ma-pe', () => {
    expect(weekMonToFri('2026-08-05', 0)).toEqual([
      '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07',
    ]);
  });
  it('lauantaista kuluva viikko = alkava viikko (seuraava ma-pe)', () => {
    expect(weekMonToFri('2026-08-01', 0)).toEqual([
      '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07',
    ]);
  });
  it('sunnuntaista kuluva viikko = alkava viikko', () => {
    expect(weekMonToFri('2026-08-02', 0)).toEqual([
      '2026-08-03', '2026-08-04', '2026-08-05', '2026-08-06', '2026-08-07',
    ]);
  });
  it('keskiviikosta seuraava viikko', () => {
    expect(weekMonToFri('2026-08-05', 1)).toEqual([
      '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14',
    ]);
  });
  it('lauantaista seuraava viikko = seuraavan viikon jälkeinen viikko', () => {
    expect(weekMonToFri('2026-08-01', 1)).toEqual([
      '2026-08-10', '2026-08-11', '2026-08-12', '2026-08-13', '2026-08-14',
    ]);
  });
});

describe('formatFiWeekday', () => {
  it('maanantai', () => {
    expect(formatFiWeekday('2026-08-03')).toBe('Maanantai');
  });
  it('perjantai', () => {
    expect(formatFiWeekday('2026-08-07')).toBe('Perjantai');
  });
});

describe('formatFiDate', () => {
  it('formatoi ilman etunollia', () => {
    expect(formatFiDate('2026-08-03')).toBe('3.8.');
  });
  it('kaksi numeroinen päivä ja kuukausi', () => {
    expect(formatFiDate('2026-12-24')).toBe('24.12.');
  });
});
```

- [ ] **Step 2: Aja testit ja varmista että ne epäonnistuvat**

Run: `pnpm test`
Expected: FAIL — `dates.ts` ei ole olemassa.

- [ ] **Step 3: Kirjoita `src/lib/dates.ts`**

```ts
const HELSINKI = 'Europe/Helsinki';

function isoInHelsinki(d: Date): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: HELSINKI,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(d);
  const y = parts.find((p) => p.type === 'year')!.value;
  const m = parts.find((p) => p.type === 'month')!.value;
  const day = parts.find((p) => p.type === 'day')!.value;
  return `${y}-${m}-${day}`;
}

export function todayInHelsinki(now: Date = new Date()): string {
  return isoInHelsinki(now);
}

export function addDaysIso(iso: string, n: number): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + n);
  const yy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yy}-${mm}-${dd}`;
}

export function dayOfWeekIso(iso: string): number {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d)).getUTCDay();
}

export function nextSchoolDay(iso: string): string {
  const dow = dayOfWeekIso(iso);
  if (dow === 6) return addDaysIso(iso, 2); // la → ma
  if (dow === 0) return addDaysIso(iso, 1); // su → ma
  return iso;
}

export function nextDayAfter(iso: string): string {
  const dow = dayOfWeekIso(iso);
  // pe → seuraava ma
  if (dow === 5) return addDaysIso(iso, 3);
  // la → tiistai (koska Tänään näyttää jo ma)
  if (dow === 6) return addDaysIso(iso, 3);
  // su → tiistai (koska Tänään näyttää jo ma)
  if (dow === 0) return addDaysIso(iso, 2);
  return addDaysIso(iso, 1);
}

function mondayOfCurrentOrNextWeek(iso: string): string {
  const dow = dayOfWeekIso(iso);
  if (dow === 0) return addDaysIso(iso, 1); // su → ma
  if (dow === 6) return addDaysIso(iso, 2); // la → ma
  const offsetToMon = dow - 1; // ma=1 → 0, ti=2 → 1, ...
  return addDaysIso(iso, -offsetToMon);
}

export function weekMonToFri(iso: string, offset: 0 | 1): string[] {
  const mon = mondayOfCurrentOrNextWeek(iso);
  const start = addDaysIso(mon, offset * 7);
  return [0, 1, 2, 3, 4].map((i) => addDaysIso(start, i));
}

export function formatFiWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12)); // noon UTC to avoid TZ ambiguity
  const name = new Intl.DateTimeFormat('fi-FI', {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(dt);
  return name.charAt(0).toUpperCase() + name.slice(1);
}

export function formatFiDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number);
  return `${d}.${m}.`;
}
```

- [ ] **Step 4: Aja testit ja varmista että kaikki menee läpi**

Run: `pnpm test`
Expected: PASS — kaikki testit vihreitä.

- [ ] **Step 5: Commit**

```bash
git add src/lib/dates.ts src/lib/dates.test.ts
git commit -m "feat: add Helsinki-timezone date helpers with vitest coverage"
```

---

### Task 4: React components

**Files:**
- Create: `src/components/DayCard.tsx`, `src/components/WeekList.tsx`, `src/components/EmptyState.tsx`, `src/components/TabBar.tsx`, `src/components/Ruokalista.tsx`

**Interfaces:**
- Consumes:
  - `menuData`, `findDay`, `MenuDay` from `@/lib/menu`
  - `todayInHelsinki`, `nextSchoolDay`, `nextDayAfter`, `weekMonToFri`, `formatFiWeekday`, `formatFiDate` from `@/lib/dates`
- Produces:
  - Default export `Ruokalista` (client component, renderöi tab-käyttöliittymän).

- [ ] **Step 1: Luo `src/components/EmptyState.tsx`**

```tsx
export function EmptyState({ listPageUrl }: { listPageUrl: string }) {
  return (
    <div className="empty">
      <p>Valitsemaasi ruokalistaa ei ole vielä saatavilla</p>
      <a href={listPageUrl} target="_blank" rel="noreferrer">
        Katso alkuperäinen sivu
      </a>
    </div>
  );
}
```

- [ ] **Step 2: Luo `src/components/DayCard.tsx`**

```tsx
import type { MenuDay } from '@/lib/menu';
import { formatFiDate, formatFiWeekday } from '@/lib/dates';

export function DayCard({ day }: { day: MenuDay }) {
  return (
    <article className="card">
      <header className="card-head">
        <h2>{formatFiWeekday(day.date)}</h2>
        <span className="date">{formatFiDate(day.date)}</span>
      </header>
      <p className="main">{day.main}</p>
      {day.vegetarian !== day.main && (
        <p className="veg">{day.vegetarian}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Luo `src/components/WeekList.tsx`**

```tsx
import type { MenuDay } from '@/lib/menu';
import { findDay } from '@/lib/menu';
import { formatFiDate, formatFiWeekday } from '@/lib/dates';

export function WeekList({ days, today }: { days: string[]; today: string }) {
  const rows = days.map((iso) => ({ iso, day: findDay(iso) }));
  const anyFound = rows.some((r) => r.day !== null);
  if (!anyFound) return null;

  return (
    <ul className="week">
      {rows.map(({ iso, day }) => (
        <li key={iso} className={iso === today ? 'row today' : 'row'}>
          <div className="row-left">
            <span className="weekday">{formatFiWeekday(iso)}</span>
            <span className="date">{formatFiDate(iso)}</span>
          </div>
          <div className="row-right">
            {day ? (
              <>
                <span className="main">{day.main}</span>
                {day.vegetarian !== day.main && (
                  <span className="veg">{day.vegetarian}</span>
                )}
              </>
            ) : (
              <span className="missing">Ei tietoa</span>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **Step 4: Luo `src/components/TabBar.tsx`**

```tsx
export type TabId = 'tanaan' | 'huomenna' | 'talla-viikolla' | 'ensi-viikolla';

const TABS: { id: TabId; label: string }[] = [
  { id: 'tanaan', label: 'Tänään' },
  { id: 'huomenna', label: 'Huomenna' },
  { id: 'talla-viikolla', label: 'Tällä viikolla' },
  { id: 'ensi-viikolla', label: 'Ensi viikolla' },
];

export function TabBar({
  active,
  onChange,
}: {
  active: TabId;
  onChange: (id: TabId) => void;
}) {
  return (
    <nav className="tabs" role="tablist">
      {TABS.map((t) => (
        <button
          key={t.id}
          role="tab"
          aria-selected={active === t.id}
          className={active === t.id ? 'tab active' : 'tab'}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </button>
      ))}
    </nav>
  );
}
```

- [ ] **Step 5: Luo `src/components/Ruokalista.tsx`**

```tsx
'use client';

import { useMemo, useState } from 'react';
import { menuData, findDay } from '@/lib/menu';
import {
  todayInHelsinki,
  nextSchoolDay,
  nextDayAfter,
  weekMonToFri,
} from '@/lib/dates';
import { DayCard } from './DayCard';
import { WeekList } from './WeekList';
import { EmptyState } from './EmptyState';
import { TabBar, type TabId } from './TabBar';

export default function Ruokalista() {
  const [tab, setTab] = useState<TabId>('tanaan');
  const today = useMemo(() => todayInHelsinki(), []);
  const todayShown = nextSchoolDay(today);
  const tomorrowShown = nextDayAfter(today);

  return (
    <div className="ruokalista">
      <TabBar active={tab} onChange={setTab} />
      <div className="content">
        {tab === 'tanaan' && renderDay(todayShown)}
        {tab === 'huomenna' && renderDay(tomorrowShown)}
        {tab === 'talla-viikolla' && (
          <WeekView days={weekMonToFri(today, 0)} today={today} />
        )}
        {tab === 'ensi-viikolla' && (
          <WeekView days={weekMonToFri(today, 1)} today={today} />
        )}
      </div>
    </div>
  );
}

function renderDay(iso: string) {
  const day = findDay(iso);
  if (!day) return <EmptyState listPageUrl={menuData.source.listPageUrl} />;
  return <DayCard day={day} />;
}

function WeekView({ days, today }: { days: string[]; today: string }) {
  const anyFound = days.some((iso) => findDay(iso) !== null);
  if (!anyFound) return <EmptyState listPageUrl={menuData.source.listPageUrl} />;
  return <WeekList days={days} today={today} />;
}
```

- [ ] **Step 6: Verify types compile**

Run: `pnpm exec tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit**

```bash
git add src/components/
git commit -m "feat: add Ruokalista component tree (tabs, day card, week list, empty state)"
```

---

### Task 5: App shell (layout, page, globals)

**Files:**
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

**Interfaces:**
- Consumes: `Ruokalista` default export, `menuData`
- Produces: renderöity `/` -reitti joka näyttää koko sovelluksen.

- [ ] **Step 1: Luo `src/app/globals.css`**

```css
:root {
  --bg: #fafafa;
  --fg: #1a1a1a;
  --muted: #666;
  --accent: #e0b93d;
  --border: #e5e5e5;
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  padding: 0;
  background: var(--bg);
  color: var(--fg);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
  font-size: 16px;
  line-height: 1.4;
}

.container {
  max-width: 640px;
  margin: 0 auto;
  padding: 1.5rem 1rem 3rem;
}

header.app-head h1 {
  font-size: 1.75rem;
  margin: 0 0 0.25rem;
}

header.app-head .school {
  color: var(--muted);
  font-size: 0.95rem;
  margin: 0 0 1.5rem;
}

.tabs {
  display: flex;
  gap: 0.25rem;
  flex-wrap: wrap;
  margin-bottom: 1.25rem;
}

.tab {
  flex: 1 1 auto;
  min-width: 0;
  padding: 0.6rem 0.75rem;
  border: 1px solid var(--border);
  background: white;
  color: var(--fg);
  font-size: 0.95rem;
  border-radius: 8px;
  cursor: pointer;
}

.tab.active {
  background: var(--accent);
  border-color: var(--accent);
  font-weight: 600;
}

.card {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
}

.card-head {
  display: flex;
  align-items: baseline;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-head h2 {
  margin: 0;
  font-size: 1.5rem;
}

.card-head .date {
  color: var(--muted);
  font-size: 1rem;
}

.card .main {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.card .veg {
  color: var(--muted);
  font-size: 1.125rem;
  margin: 0;
}

.week {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.week .row {
  display: grid;
  grid-template-columns: 110px 1fr;
  gap: 0.75rem;
  padding: 0.9rem 1rem;
  background: white;
  border: 1px solid var(--border);
  border-radius: 10px;
}

.week .row.today {
  background: var(--accent);
  border-color: var(--accent);
}

.week .row-left {
  display: flex;
  flex-direction: column;
}

.week .weekday { font-weight: 600; }
.week .date { color: var(--muted); font-size: 0.9rem; }
.week .row.today .date { color: var(--fg); }

.week .row-right {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.week .row-right .main { font-weight: 500; }
.week .row-right .veg { color: var(--muted); font-size: 0.95rem; }
.week .row.today .row-right .veg { color: rgba(0,0,0,0.65); }

.empty {
  background: white;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
}
.empty p { margin: 0 0 0.75rem; font-size: 1.05rem; }
.empty a { color: var(--fg); }

footer.app-foot {
  margin-top: 2rem;
  color: var(--muted);
  font-size: 0.85rem;
  text-align: center;
}

footer.app-foot a { color: var(--muted); }
```

- [ ] **Step 2: Luo `src/app/layout.tsx`**

```tsx
import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Koulun ruokalista',
  description: 'Pieksämäen peruskoulujen, lukion ja EsEDU:n ruokalista.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fi">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Luo `src/app/page.tsx`**

```tsx
import Ruokalista from '@/components/Ruokalista';
import { menuData } from '@/lib/menu';

export default function Page() {
  return (
    <main className="container">
      <header className="app-head">
        <h1>Koulun ruokalista</h1>
        <p className="school">{menuData.school}</p>
      </header>
      <Ruokalista />
      <footer className="app-foot">
        Lähde:{' '}
        <a href={menuData.source.pdfUrl} target="_blank" rel="noreferrer">
          pieksamaentukipalvelut.fi
        </a>{' '}
        · päivitetty {menuData.source.updatedAt}
      </footer>
    </main>
  );
}
```

- [ ] **Step 4: Aja dev-serveri smoke-testinä**

Run in background: `pnpm dev`
Odota kunnes näet "Ready in".
Käy `curl -s http://localhost:3000` — tarkista ettei tule 500-vastausta.
Tapa dev-serveri.

- [ ] **Step 5: Aja tuotantobuild**

Run: `pnpm build`
Expected: build onnistuu, ei TypeScript- tai lint-virheitä.

- [ ] **Step 6: Commit**

```bash
git add src/app/
git commit -m "feat: add app shell (layout, page, globals) rendering Ruokalista"
```

---

### Task 6: README + päivitys-ohje

**Files:**
- Create: `README.md`

**Interfaces:**
- Consumes: —
- Produces: — (dokumentointi)

- [ ] **Step 1: Luo `README.md`**

```markdown
# Koulun ruokalista

Pieni sovellus, joka näyttää Pieksämäen peruskoulujen, lukion ja EsEDU:n ruokalistan mobile-ystävällisesti.

Alkuperäinen lähde: [pieksamaentukipalvelut.fi/ruokalistat](https://pieksamaentukipalvelut.fi/ruokalistat/)

## Kehitys

```bash
pnpm install
pnpm dev        # http://localhost:3000
pnpm test       # vitest
pnpm build      # tuotantobuild
```

## Miten päivitän ruokalistan?

Kun uusi PDF ilmestyy `pieksamaentukipalvelut.fi/ruokalistat/`iin:

1. Kopioi uusi PDF-URL sivun "PERUSKOULUT, LUKIO, ESEDU (KESKUSKATU)" -painikkeesta.
2. Avaa tämä repo Claude Codessa.
3. Sano: **"Päivitä ruokalista tästä PDF:stä: `<url>`"**
4. Claude lataa PDF:n, parsii sen, päivittää `src/data/menu.json`in (mukaan lukien `updatedAt` ja `pdfUrl`), committaa ja pushaa.
5. Vercel deployaa automaattisesti `main`-pushista.

Jos haluat päivittää manuaalisesti, muokkaa suoraan `src/data/menu.json`ia:

- `days`-taulukkoon vain arkipäivät (ma–pe), muodossa `{ "date": "YYYY-MM-DD", "main": "…", "vegetarian": "…" }`.
- Jos päivällä ei ole erillistä kasvisruokaa, käytä samaa tekstiä molempiin.
- Päivitä `source.pdfUrl` ja `source.updatedAt`.

## Stack

- Next.js 15 (App Router) + TypeScript + React 19
- pnpm, vitest, vanilla CSS
- Hosting: Vercel (`main`-branch auto-deploy)
```

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: add README with dev instructions and update workflow"
```

---

### Task 7: GitHub repo + Vercel deploy

**Files:** —

**Interfaces:**
- Consumes: local `main` branch with kaikki edelliset committit
- Produces: julkinen `julehtol/koulun-ruokalista` -repo GitHubissa; Vercel-projekti joka deployaa `main`in.

Tämä tehtävä vaatii verkkotoimintoja ja ihmisen approve (Vercel). Jaettu askeliin.

- [ ] **Step 1: Luo GitHub-repo**

Run: `gh repo create julehtol/koulun-ruokalista --public --source=/Users/juholehtola/devaus/koulun-ruokalista --push --description "Pieksämäen koulujen ruokalista mobile-ystävällisesti"`

Expected: repo luotu, push onnistui.

- [ ] **Step 2: Verifioi repo**

Run: `gh repo view julehtol/koulun-ruokalista --json url,visibility -q '. | "\(.visibility) \(.url)"'`
Expected: `PUBLIC https://github.com/julehtol/koulun-ruokalista`.

- [ ] **Step 3: Deployaa Vercelille**

Käytä Vercel MCP -työkalua `mcp__claude_ai_Vercel__deploy_to_vercel` GitHub-repolla. Anna projektinimi `koulun-ruokalista`.

Odota deployn valmistumista (`mcp__claude_ai_Vercel__get_deployment` READY-tilaan).

- [ ] **Step 4: Verifioi live-URL**

Curl deployn preview-URL:iin. Tarkista että `<title>Koulun ruokalista</title>` löytyy vastauksesta.

- [ ] **Step 5: Raportoi käyttäjälle**

Kerro repo-URL, Vercel-preview-URL, ja seuraavat askeleet (esim. oman domainin liittäminen Vercelissä jos halutaan).
