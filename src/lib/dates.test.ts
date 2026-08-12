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
    expect(dayOfWeekIso('2026-08-03')).toBe(1);
  });
  it('sunnuntai on 0', () => {
    expect(dayOfWeekIso('2026-08-02')).toBe(0);
  });
  it('lauantai on 6', () => {
    expect(dayOfWeekIso('2026-08-01')).toBe(6);
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
