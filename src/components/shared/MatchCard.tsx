'use client';

import Link from 'next/link';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/cn';
import { flagUrl } from '@/lib/flag';
import type { Match } from '@/data/mock';

interface MatchCardProps {
  match: Match;
  compact?: boolean;
  showPrediction?: boolean;
}

function TeamFlag({ code, size = 28 }: { code: string; size?: number }) {
  const url = flagUrl(code, 40);
  if (url) return <img src={url} alt={code} style={{ width: size, height: size * 0.67, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />;
  return null;
}

export function MatchCard({ match, compact, showPrediction = true }: MatchCardProps) {
  const isLive     = match.status === 'LIVE';
  const isFinished = match.status === 'FINISHED';

  return (
    <Link href={`/jogos/${match.id}`} className={cn(
      'block rounded-xl border transition-all duration-200 hover:border-emerald-500/30 hover:shadow-[0_0_16px_rgba(16,185,129,0.08)] group',
      isLive
        ? 'bg-[#0d1117] border-red-500/30 shadow-[0_0_12px_rgba(239,68,68,0.08)]'
        : 'bg-[#0d1117] border-[#1e2d3d]',
    )}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-widest">{match.roundLabel}</span>
          <div className="flex items-center gap-2">
            {isLive && <Badge variant="live">● {match.minute}'</Badge>}
            {isFinished && <Badge variant="finished">FT</Badge>}
            {!isLive && !isFinished && (
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Clock size={11} /> {match.time}
              </span>
            )}
          </div>
        </div>

        {/* Teams & score */}
        <div className="flex items-center gap-3">
          {/* Home */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <TeamFlag code={match.homeTeam.code} />
            <span className={cn(
              'font-bold text-sm truncate',
              isFinished && match.homeScore > match.awayScore ? 'text-white' : 'text-slate-300',
            )}>
              {match.homeTeam.shortName}
            </span>
          </div>

          {/* Score */}
          <div className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg min-w-[60px] justify-center',
            isLive ? 'bg-red-500/10' : 'bg-white/5',
          )}>
            <span className={cn('text-lg font-black', isLive ? 'text-red-300' : 'text-slate-200')}>
              {match.homeScore}
            </span>
            <span className="text-slate-600 font-light">:</span>
            <span className={cn('text-lg font-black', isLive ? 'text-red-300' : 'text-slate-200')}>
              {match.awayScore}
            </span>
          </div>

          {/* Away */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className={cn(
              'font-bold text-sm truncate text-right',
              isFinished && match.awayScore > match.homeScore ? 'text-white' : 'text-slate-300',
            )}>
              {match.awayTeam.shortName}
            </span>
            <TeamFlag code={match.awayTeam.code} />
          </div>
        </div>

        {/* Prediction mini row */}
        {showPrediction && match.prediction && !compact && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="flex-1 flex rounded-full overflow-hidden h-1.5">
                <div className="bg-blue-500 transition-all" style={{ width: `${match.prediction.homeWin * 100}%` }} />
                <div className="bg-slate-600 transition-all" style={{ width: `${match.prediction.draw * 100}%` }} />
                <div className="bg-slate-500 transition-all" style={{ width: `${match.prediction.awayWin * 100}%` }} />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="text-blue-400 font-bold">{(match.prediction.homeWin * 100).toFixed(0)}%</span>
                <span>{(match.prediction.draw * 100).toFixed(0)}%</span>
                <span>{(match.prediction.awayWin * 100).toFixed(0)}%</span>
              </div>
              {match.hasValueBet && (
                <TrendingUp size={12} className="text-emerald-400 shrink-0" />
              )}
            </div>
          </div>
        )}
      </div>

      {/* Venue */}
      {!compact && (
        <div className="px-4 pb-3 flex items-center gap-1 text-[10px] text-slate-600">
          <MapPin size={10} /> {match.venue}, {match.city}
        </div>
      )}
    </Link>
  );
}
