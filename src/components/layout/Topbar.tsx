'use client';

import { useState } from 'react';
import { Radio, Search, Bell } from 'lucide-react';

export function Topbar() {
  const [query, setQuery] = useState('');

  return (
    <header className="fixed top-0 left-0 lg:left-56 right-0 z-30 h-14
      bg-[#07090f]/80 backdrop-blur-xl border-b border-[#1a2235] flex items-center gap-4 px-5">

      {/* Search */}
      <div className="relative flex-1 max-w-xs hidden sm:flex items-center">
        <Search size={14} className="absolute left-3 text-slate-500 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Buscar seleção, jogo..."
          className="w-full pl-9 pr-3 py-2 text-sm bg-white/5 border border-white/8
            rounded-lg placeholder:text-slate-600 text-slate-200 outline-none
            focus:border-emerald-500/40 focus:bg-white/8 transition-all"
        />
      </div>

      <div className="flex-1" />

      {/* Live indicator */}
      <LiveIndicator />

      {/* Competition badge */}
      <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg
        bg-white/5 border border-white/8 text-xs font-medium text-slate-300">
        🏆 <span>Copa 2026</span>
      </div>

      {/* Notifications */}
      <button className="relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors">
        <Bell size={16} />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400" />
      </button>
    </header>
  );
}

function LiveIndicator() {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg
      bg-red-500/10 border border-red-500/20 text-xs font-semibold text-red-400">
      <Radio size={12} className="animate-pulse" />
      <span className="hidden sm:inline">Ao Vivo</span>
    </div>
  );
}
