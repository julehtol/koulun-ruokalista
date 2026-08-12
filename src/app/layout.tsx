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
