import { findDay } from '@/lib/menu';
import { formatFiDate, formatFiWeekday } from '@/lib/dates';

export function WeekList({ days, today }: { days: string[]; today: string }) {
  return (
    <ul className="week">
      {days.map((iso) => {
        const day = findDay(iso);
        return (
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
                  {day.sides && day.sides.length > 0 && (
                    <span className="sides">{day.sides.join(', ')}</span>
                  )}
                </>
              ) : (
                <span className="missing">Ei tietoa</span>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
