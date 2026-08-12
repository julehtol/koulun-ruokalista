import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Koulun ruokalista',
    short_name: 'Ruokalista',
    description: 'Pieksämäen peruskoulujen, lukion ja EsEDU:n ruokalista.',
    start_url: '/',
    display: 'standalone',
    background_color: '#fafafa',
    theme_color: '#e0b93d',
    icons: [
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' },
      { src: '/apple-icon', sizes: '180x180', type: 'image/png' },
    ],
  };
}
