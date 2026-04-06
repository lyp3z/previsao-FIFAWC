'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { CalendarDays, Search, Radio, Filter, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { flagUrl } from '@/lib/flag';

type DbMatch = {
  id: string;
  homeTeam: { code: string; shortName: string; emoji: string };
  awayTeam: { code: string; shortName: string; emoji: string };
  homeScore: number; awayScore: number;
  status: string; isLive: boolean; minute: number | null;
  datetimeUtc: Date;
  roundLabel: string | null;
  venue: string; city: string;
  group: { code: string } | null;
  stage: { name: string; code: string };
  prediction: {
    homeWinProbability: number;
    drawProbability: number;
    awayWinProbability: number;
  } | null;
};

function MatchCard({ m }: { m: DbMatch }) {
  const isLive = m.status === 'LIVE';
  const isFinished = m.status === 'FINISHED';
  const hUrl = flagUrl(m.homeTeam.code, 40);
  const aUrl = flagUrl(m.awayTeam.code, 40);

  const label = m.roundLabel
    ?? (m.group ? `Grupo ${m.group.code}` : m.stage.name);

  return (
    <div className={`rounded-xl border transition-all ${
      isLive ? 'bg-[#0d1117] border-red-500/25 shadow-[0_0_12px_rgba(239,68,68,0.06)]'
             : 'bg-[#0d1117] border-[#1e2d3d] hover:border-slate-700'
    }`}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest truncate max-w-[160px]">{label}</span>
          <div className="flex items-center gap-2 shrink-0">
            {isLive    && <Badge variant="live">● {m.minute ?? 'AO VIVO'}</Badge>}
            {isFinished && <Badge variant="finished">Encerrado</Badge>}
            {!isLive && !isFinished && (
              <span className="text-xs text-slate-500">{m.datetimeUtc.toISOString().slice(11, 16)}</span>
            )}
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {hUrl && <img src={hUrl} alt={m.homeTeam.code} style={{ width: 26, height: 17, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />}
            <span className={`font-bold text-sm truncate ${isFinished && m.homeScore > m.awayScore ? 'text-white' : 'text-slate-300'}`}>
              {m.homeTeam.shortName}
            </span>
          </div>

          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg min-w-[60px] justify-center ${isLive ? 'bg-red-500/10' : 'bg-white/5'}`}>
            <span className={`text-lg font-black ${isLive ? 'text-red-300' : 'text-slate-100'}`}>{m.homeScore}</span>
            <span className="text-slate-700 text-sm font-light">:</span>
            <span className={`text-lg font-black ${isLive ? 'text-red-300' : 'text-slate-100'}`}>{m.awayScore}</span>
          </div>

          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className={`font-bold text-sm truncate text-right ${isFinished && m.awayScore > m.homeScore ? 'text-white' : 'text-slate-300'}`}>
              {m.awayTeam.shortName}
            </span>
            {aUrl && <img src={aUrl} alt={m.awayTeam.code} style={{ width: 26, height: 17, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />}
          </div>
        </div>

        {/* Prediction bar */}
        {m.prediction && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex rounded-full overflow-hidden h-1.5">
              <div className="bg-blue-500" style={{ width: `${m.prediction.homeWinProbability * 100}%` }} />
              <div className="bg-slate-600" style={{ width: `${m.prediction.drawProbability * 100}%` }} />
              <div className="bg-slate-500" style={{ width: `${m.prediction.awayWinProbability * 100}%` }} />
            </div>
            <div className="flex justify-between mt-1 text-[9px] text-slate-600">
              <span className="text-blue-400">{(m.prediction.homeWinProbability * 100).toFixed(0)}%</span>
              <span>{(m.prediction.drawProbability * 100).toFixed(0)}%</span>
              <span>{(m.prediction.awayWinProbability * 100).toFixed(0)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-slate-700">
        <MapPin size={9} /> {m.venue}, {m.city}
      </div>
    </div>
  );
}

interface Props { matches: DbMatch[] }

export function JogosClient({ matches }: Props) {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<'ALL'|'LIVE'|'SCHEDULED'|'FINISHED'>('ALL');
  const [group,  setGroup]  = useState('ALL');

  const groups = useMemo(() => {
    const codes = new Set(matches.map(m => m.group?.code).filter(Boolean) as string[]);
    return ['ALL', ...Array.from(codes).sort()];
  }, [matches]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return matches.filter(m => {
      const matchSearch = !q ||
        m.homeTeam.shortName.toLowerCase().includes(q) ||
        m.awayTeam.shortName.toLowerCase().includes(q) ||
        m.homeTeam.code.toLowerCase().includes(q) ||
        m.awayTeam.code.toLowerCase().includes(q);
      const matchStatus = status === 'ALL' || m.status === status;
      const matchGroup  = group  === 'ALL' || m.group?.code === group;
      return matchSearch && matchStatus && matchGroup;
    });
  }, [matches, search, status, group]);

  const live = matches.filter(m => m.status === 'LIVE').length;

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
          <CalendarDays size={20} className="text-blue-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Jogos</h1>
          <p className="text-xs text-slate-500">{matches.length} partidas · {live} ao vivo</p>
        </div>
        {live > 0 && <Badge variant="live" className="ml-auto"><Radio size={10} />{live} ao vivo</Badge>}
      </div>

      {/* Filters */}
      <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4 space-y-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Buscar seleção..."
            className="w-full pl-9 pr-3 py-2.5 text-sm bg-white/5 border border-white/8 rounded-lg placeholder:text-slate-600 text-slate-200 outline-none focus:border-blue-500/40 transition-all" />
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Filter size={13} className="text-slate-600" />
          {(['ALL','LIVE','SCHEDULED','FINISHED'] as const).map(s => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                status === s
                  ? s === 'LIVE'      ? 'bg-red-500/15 text-red-400 border-red-500/25'
                  : s === 'SCHEDULED' ? 'bg-blue-500/15 text-blue-400 border-blue-500/25'
                  : s === 'FINISHED'  ? 'bg-slate-700 text-slate-400 border-slate-600'
                  :                    'bg-white/8 text-slate-200 border-white/12'
                  : 'bg-transparent text-slate-500 border-transparent hover:text-slate-300'
              }`}>
              {s === 'ALL' ? 'Todos' : s === 'LIVE' ? '● Ao vivo' : s === 'SCHEDULED' ? 'Agendados' : 'Encerrados'}
            </button>
          ))}

          <span className="text-slate-700 hidden sm:inline">·</span>

          <select value={group} onChange={e => setGroup(e.target.value)}
            className="bg-white/5 border border-white/8 rounded-lg px-3 py-1.5 text-xs text-slate-300 outline-none focus:border-blue-500/40">
            {groups.map(g => <option key={g} value={g}>{g === 'ALL' ? 'Todos os grupos' : `Grupo ${g}`}</option>)}
          </select>
        </div>
      </div>

      <div className="text-xs text-slate-600">{filtered.length} {filtered.length === 1 ? 'jogo encontrado' : 'jogos encontrados'}</div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <CalendarDays size={36} className="mx-auto mb-3 opacity-30" />
          <p>Nenhum jogo encontrado com estes filtros.</p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(m => <MatchCard key={m.id} m={m} />)}
        </div>
      )}
    </div>
  );
}
