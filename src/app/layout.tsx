import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'GoalForge — World Cup 2026 API',
  description:
    'Real-time World Cup 2026 tracker and scenario simulator API. Live matches, standings, bracket and full simulation engine.',
  authors: [{ name: 'lypecs' }],
  keywords: ['world cup 2026', 'fifa', 'soccer', 'api', 'simulator', 'bracket', 'standings'],
  openGraph: {
    title: 'GoalForge — World Cup 2026 API',
    description: 'Track live matches, simulate scenarios and explore the knockout bracket for FIFA World Cup 2026.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
