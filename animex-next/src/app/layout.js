import './globals.css';

export const metadata = {
  title: 'AnimeX — Nonton Anime Sub Indo',
  description: 'Streaming anime sub indo gratis, update harian, tanpa iklan.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
