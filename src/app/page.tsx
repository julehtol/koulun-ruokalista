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
