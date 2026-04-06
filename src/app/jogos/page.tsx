'use client';

import { useState } from 'react';
import { CalendarDays, Search, Radio, Filter } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { MatchCard } from '@/components/shared/MatchCard';
import { MOCK_MATCHES } from '@/data/mock';

export default function JogosPage() {
  const [search,    setSearch]    = useState('');
  const [status,    setStatus]    = useState<'ALL'|'LIVE'|'SCHEDULED'|'FINISHED'>('ALL');
  const [stage,     setStage]     = useState('ALL');

  const filtered = MOCK_MATCHES.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.homeTeam.name.toLowerCase().includes(q) || m.awayTeam.name.toLowerCase().includes(q) || m.homeTeam.code.toLowerCase().includes(q) || m.awayTeam.code.toLowerCase().includes(q);
    const matchStatus = status === 'ALL' || m.status === status;
    const matchStage  = stage  === 'ALL' || m.stage === stage;
    return matchSearch && matchStatus && matchStage;
  });

  const liveCount = MOCK_MATCHES.filter(m => m.status === 'LIVE').length;

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <CalendarDays size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Jogos</h1>
          <p className="text-xs text-slate-500">{MOCK_MATCHES.length} partidas · {liveCount} ao vivo</p>
        </div>
        {liveCount > 0 && (
          <Badge variant="live" className="ml-auto"><Radio size={10} />{liveCount} ao vivo</Badge>
        )}
      </div>

      {/* Filters */}
      <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4 space-y-3">
        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar seleção..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/5 border border-white/8 rounded-lg
              placeholder:text-slate-600 text-slate-200 outline-none focus:border-blue-500/40 transition-all"
          />
        </div>

        {/* Status filters */}
        <div className="flex flex-wrap gap-2">
          <Filter size={14} className="text-slate-600 self-center" />
          {(['ALL','LIVE','SCHEDULED','FINISHED'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                status === s
                  ? s === 'LIVE'      ? 'bg-red-500/15 text-red-400 border-red-500/25'
                  : s === 'SCHEDULED' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                  : s === 'FINISHED'  ? 'bg-slate-700/80 text-slate-400 border-slate-600/50'
                  :                    'bg-white/8 text-slate-200 border-white/12'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
              }`}>
              {s === 'ALL' ? 'Todos' : s === 'LIVE' ? '● Ao vivo' : s === 'SCHEDULED' ? 'Agendados' : 'Encerrados'}
            </button>
          ))}
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-xs text-slate-600">
        <span>{filtered.length} {filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}</span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-600">
          <CalendarDays size={40} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum jogo encontrado com estes filtros.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(m => <MatchCard key={m.id} match={m} showPrediction />)}
        </div>
      )}
    </div>
  );
}
