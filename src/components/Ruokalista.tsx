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
        {tab === 'tanaan' && <DayView iso={todayShown} />}
        {tab === 'huomenna' && <DayView iso={tomorrowShown} />}
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

function DayView({ iso }: { iso: string }) {
  const day = findDay(iso);
  if (!day) return <EmptyState listPageUrl={menuData.source.listPageUrl} />;
  return <DayCard day={day} />;
}

function WeekView({ days, today }: { days: string[]; today: string }) {
  const anyFound = days.some((iso) => findDay(iso) !== null);
  if (!anyFound) return <EmptyState listPageUrl={menuData.source.listPageUrl} />;
  return <WeekList days={days} today={today} />;
}
