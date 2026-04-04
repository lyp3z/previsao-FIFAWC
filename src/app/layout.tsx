import type { Metadata } from 'next';
import './globals.css';
import { Nav } from '@/ui/Nav';
import { SplashScreen } from '@/ui/SplashScreen';

export const metadata: Metadata = {
  title: 'GoalForge — Copa do Mundo 2026',
  description: 'Acompanhe a Copa do Mundo 2026 em tempo real. Calendário, grupos, mata-mata e simulador de cenários.',
  authors: [{ name: 'lypecs' }],
  keywords: ['copa do mundo 2026', 'fifa', 'futebol', 'simulador', 'bracket', 'classificação'],
  openGraph: {
    title: 'GoalForge — Copa do Mundo 2026',
    description: 'Calendário de jogos, classificação por grupos, bracket do mata-mata e simulador de cenários.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>
        <SplashScreen />
        <Nav />
        <main className="page-main">
          {children}
        </main>
      </body>
    </html>
  );
}
