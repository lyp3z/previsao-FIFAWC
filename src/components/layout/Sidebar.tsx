'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard, CalendarDays, Grid2x2, GitBranch,
  FlaskConical, BarChart3, BadgeDollarSign, Gem,
  Shield, Settings, Trophy, Zap, TrendingUp,
} from 'lucide-react';

const NAV = [
  { href: '/',               label: 'Visão Geral',   icon: LayoutDashboard },
  { href: '/jogos',          label: 'Jogos',          icon: CalendarDays    },
  { href: '/grupos',         label: 'Grupos',         icon: Grid2x2         },
  { href: '/mata-mata',      label: 'Mata-mata',      icon: GitBranch       },
  { href: '/simulador',      label: 'Simulador',      icon: FlaskConical    },
  null,
  { href: '/probabilidades', label: 'Probabilidades', icon: BarChart3       },
  { href: '/odds',           label: 'Odds',           icon: BadgeDollarSign },
  { href: '/value-bets',     label: 'Value Bets',     icon: Gem, hot: true  },
  null,
  { href: '/times',          label: 'Seleções',       icon: Shield          },
];

const MOBILE_NAV = [
  { href: '/',          label: 'Início',   icon: LayoutDashboard },
  { href: '/jogos',     label: 'Jogos',    icon: CalendarDays    },
  { href: '/grupos',    label: 'Grupos',   icon: Grid2x2         },
  { href: '/simulador', label: 'Simular',  icon: FlaskConical    },
  { href: '/value-bets',label: 'Bets',     icon: Gem             },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex flex-col w-56 shrink-0 sticky top-0 h-screen bg-[#080c14] border-r border-white/[0.06] overflow-y-auto">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 h-14 border-b border-white/[0.06] shrink-0">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-[0_0_12px_rgba(16,185,129,0.5)]">
          <Trophy size={14} className="text-white" />
        </div>
        <div className="flex flex-col">
          <span className="text-[13px] font-black text-white tracking-tight leading-none">GoalForge</span>
          <span className="text-[9px] text-emerald-500 font-bold tracking-widest uppercase leading-none mt-0.5">2026</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2 py-3 space-y-px">
        {NAV.map((item, i) => {
          if (!item) return <div key={i} className="my-2 mx-2 border-t border-white/[0.05]" />;
          const Icon = item.icon;
          const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 group ${
                active
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15'
                  : 'text-slate-500 hover:text-slate-200 hover:bg-white/[0.04] border border-transparent'
              }`}>
              <Icon size={15} className={active ? 'text-emerald-400' : 'text-slate-600 group-hover:text-slate-400'} />
              <span className="flex-1 truncate">{item.label}</span>
              {(item as { hot?: boolean }).hot && (
                <span className="flex items-center gap-0.5 text-[9px] font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded-full">
                  <Zap size={7} />HOT
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-2 pb-3 border-t border-white/[0.06] pt-2 shrink-0">
        <Link href="/configuracoes"
          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] font-medium text-slate-600 hover:text-slate-300 hover:bg-white/[0.04] transition-all border border-transparent">
          <Settings size={15} />
          Configurações
        </Link>
      </div>
    </aside>
  );
}

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-[#080c14]/95 backdrop-blur-xl border-t border-white/[0.06] safe-pb">
      {MOBILE_NAV.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-1 px-4 py-3 transition-colors ${active ? 'text-emerald-400' : 'text-slate-600'}`}>
            <Icon size={20} />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
