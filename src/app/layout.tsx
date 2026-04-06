import type { Metadata } from 'next';
import './globals.css';
import { Sidebar } from '@/components/layout/Sidebar';
import { Topbar } from '@/components/layout/Topbar';
import { SplashScreen } from '@/ui/SplashScreen';

export const metadata: Metadata = {
  title: 'GoalForge — Copa do Mundo 2026',
  description: 'Plataforma premium de inteligência esportiva para a Copa do Mundo 2026.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body className="flex min-h-screen bg-[#07090f] text-slate-100 antialiased">
        <SplashScreen />
        <Sidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <Topbar />
          <main className="flex-1 overflow-x-hidden pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
