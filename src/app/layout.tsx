import type { Metadata } from 'next';
import './globals.css';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { SplashScreen } from '@/ui/SplashScreen';

export const metadata: Metadata = {
  title: 'GoalForge — Copa do Mundo 2026',
  description: 'Plataforma premium de inteligência esportiva para a Copa do Mundo 2026.',
  authors: [{ name: 'lypecs' }],
  keywords: ['copa do mundo 2026', 'fifa', 'futebol', 'simulador', 'probabilidades', 'odds', 'value bets'],
  openGraph: {
    title: 'GoalForge — Copa do Mundo 2026',
    description: 'Calendário, grupos, mata-mata, simulador, probabilidades, odds e value bets.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <SplashScreen />

        {/* Sidebar — desktop only */}
        <Sidebar />

        {/* Main content area — offset by sidebar width on desktop */}
        <div className="lg:ml-56 min-h-screen flex flex-col overflow-x-hidden">
          {/* Topbar */}
          <Topbar />

          {/* Page content — below topbar */}
          <main className="pt-14 pb-20 lg:pb-0 flex-1">
            {children}
          </main>
        </div>

        {/* Mobile bottom nav */}
        <MobileNav />
      </body>
    </html>
  );
}
