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
