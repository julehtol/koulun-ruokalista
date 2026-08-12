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
