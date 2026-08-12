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
  if (dow === 6) return addDaysIso(iso, 2);
  if (dow === 0) return addDaysIso(iso, 1);
  return iso;
}

export function nextDayAfter(iso: string): string {
  const dow = dayOfWeekIso(iso);
  if (dow === 5) return addDaysIso(iso, 3);
  if (dow === 6) return addDaysIso(iso, 3);
  if (dow === 0) return addDaysIso(iso, 2);
  return addDaysIso(iso, 1);
}

function mondayOfCurrentOrNextWeek(iso: string): string {
  const dow = dayOfWeekIso(iso);
  if (dow === 0) return addDaysIso(iso, 1);
  if (dow === 6) return addDaysIso(iso, 2);
  const offsetToMon = dow - 1;
  return addDaysIso(iso, -offsetToMon);
}

export function weekMonToFri(iso: string, offset: 0 | 1): string[] {
  const mon = mondayOfCurrentOrNextWeek(iso);
  const start = addDaysIso(mon, offset * 7);
  return [0, 1, 2, 3, 4].map((i) => addDaysIso(start, i));
}

export function formatFiWeekday(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12));
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
