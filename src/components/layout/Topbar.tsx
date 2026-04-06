'use client';

import { useState } from 'react';
import { Search, Radio, Bell, ChevronDown } from 'lucide-react';

export function Topbar() {
  const [q, setQ] = useState('');

  return (
    <header className="sticky top-0 z-30 h-14 flex items-center gap-4 px-5 bg-[#07090f]/90 backdrop-blur-xl border-b border-white/[0.06] shrink-0">
      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:block">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 pointer-events-none" />
        <input
          value={q}
          onChange={e => setQ(e.target.value)}
          placeholder="Buscar seleção, jogo..."
          className="w-full pl-9 pr-3 h-8 text-xs bg-white/[0.04] border border-white/[0.07] rounded-lg placeholder:text-slate-700 text-slate-300 outline-none focus:border-emerald-500/30 focus:bg-white/[0.06] transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Live */}
      <div className="flex items-center gap-1.5 px-2.5 h-7 rounded-full bg-red-500/8 border border-red-500/15 text-[11px] font-semibold text-red-400">
        <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
        <span className="hidden sm:inline">Ao Vivo</span>
      </div>

      {/* Competition */}
      <button className="hidden md:flex items-center gap-2 px-3 h-7 rounded-full bg-white/[0.04] border border-white/[0.07] text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-white/[0.07] transition-all gap-1.5">
        🏆 <span>Copa 2026</span>
        <ChevronDown size={11} className="text-slate-600" />
      </button>

      {/* Bell */}
      <button className="relative w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-all">
        <Bell size={15} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </button>
    </header>
  );
}
