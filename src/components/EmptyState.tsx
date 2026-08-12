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
