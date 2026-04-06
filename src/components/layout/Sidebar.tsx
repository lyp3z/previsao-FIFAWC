'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/cn';
import {
  LayoutDashboard, CalendarDays, Grid2x2, GitBranch,
  FlaskConical, BarChart3, BadgeDollarSign, Gem,
  Users, Settings, Trophy, Zap,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/',               label: 'Visão Geral',   icon: LayoutDashboard },
  { href: '/jogos',          label: 'Jogos',          icon: CalendarDays    },
  { href: '/grupos',         label: 'Grupos',         icon: Grid2x2         },
  { href: '/mata-mata',      label: 'Mata-mata',      icon: GitBranch       },
  { href: '/simulador',      label: 'Simulador',      icon: FlaskConical    },
  null, // divider
  { href: '/probabilidades', label: 'Probabilidades', icon: BarChart3       },
  { href: '/odds',           label: 'Odds',           icon: BadgeDollarSign },
  { href: '/value-bets',     label: 'Value Bets',     icon: Gem             },
  null,
  { href: '/times',          label: 'Seleções',       icon: Users           },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-screen w-56 z-40
      bg-[#0a0e18] border-r border-[#1a2235]">

      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1a2235]">
        <div className="flex items-center justify-center w-8 h-8 rounded-lg
          bg-gradient-to-br from-emerald-500 to-emerald-700 shadow-[0_0_12px_rgba(16,185,129,0.4)]">
          <Trophy size={16} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-white leading-tight tracking-tight">GoalForge</div>
          <div className="text-[10px] text-emerald-500 font-semibold tracking-wider uppercase">2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item, idx) => {
          if (item === null) {
            return <div key={`div-${idx}`} className="my-2 border-t border-[#1a2235]" />;
          }
          const Icon = item.icon;
          const isActive = item.href === '/'
            ? pathname === '/'
            : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150',
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5',
              )}
            >
              <Icon size={16} className={isActive ? 'text-emerald-400' : ''} />
              {item.label}
              {item.href === '/value-bets' && (
                <span className="ml-auto flex items-center gap-0.5 text-[9px] font-bold text-amber-400 bg-amber-500/15 border border-amber-500/25 px-1.5 py-0.5 rounded-md">
                  <Zap size={8} />HOT
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 pb-4 border-t border-[#1a2235] pt-3">
        <Link href="/configuracoes"
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
          <Settings size={16} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────

const MOBILE_NAV = [
  { href: '/',          label: 'Início',    icon: LayoutDashboard },
  { href: '/jogos',     label: 'Jogos',     icon: CalendarDays    },
  { href: '/grupos',    label: 'Grupos',    icon: Grid2x2         },
  { href: '/simulador', label: 'Simular',   icon: FlaskConical    },
  { href: '/value-bets',label: 'Bets',      icon: Gem             },
];

export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around
      bg-[#0a0e18]/90 backdrop-blur-xl border-t border-[#1a2235]
      px-2 pb-[env(safe-area-inset-bottom)]">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const isActive = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-3 rounded-xl min-w-[56px] text-center transition-colors',
              isActive ? 'text-emerald-400' : 'text-slate-500',
            )}>
            <Icon size={20} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
