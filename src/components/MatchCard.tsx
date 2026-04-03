import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Match } from '../types';
import { cn } from '../lib/utils';
import { Clock, MapPin, Trophy } from 'lucide-react';

interface MatchCardProps {
  match: Match;
  onClick?: (match: Match) => void;
}

export const MatchCard: React.FC<MatchCardProps> = ({ match, onClick }) => {
  const isFinished = match.status === 'finished';
  const isLive = match.status === 'live';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onClick?.(match)}
      className={cn(
        "relative overflow-hidden cursor-pointer group",
        "bg-zinc-900/50 border border-zinc-800 rounded-xl p-4",
        "hover:border-zinc-700 transition-all duration-300 shadow-lg",
        isLive && "border-red-500/30 bg-red-500/5"
      )}
    >
      {/* Header Info */}
      <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-widest font-bold text-zinc-500">
        <div className="flex items-center gap-2">
          <Trophy size={12} className="text-amber-500/70" />
          <span>{match.stage} • {match.group}</span>
        </div>
        <div className="flex items-center gap-2">
          {isLive ? (
            <div className="flex items-center gap-1.5 text-red-500 animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>AO VIVO • {match.minute}'</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{match.time}</span>
            </div>
          )}
        </div>
      </div>

      {/* Teams & Score */}
      <div className="flex items-center justify-between gap-4">
        {/* Home Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <span className="text-3xl sm:text-4xl">{match.homeTeam?.emoji}</span>
          <span className="font-black text-lg tracking-tighter">{match.homeTeam?.code}</span>
        </div>

        {/* Score Display */}
        <div className="flex flex-col items-center gap-1 min-w-[80px]">
          <div className="flex items-center gap-3">
            <span className={cn(
              "text-3xl font-black tracking-tighter",
              !isFinished && !isLive && "text-zinc-700"
            )}>
              {match.score.home}
            </span>
            <span className="text-zinc-700 font-bold">X</span>
            <span className={cn(
              "text-3xl font-black tracking-tighter",
              !isFinished && !isLive && "text-zinc-700"
            )}>
              {match.score.away}
            </span>
          </div>
          {isFinished && (
            <span className="text-[10px] text-zinc-500 font-bold uppercase">Encerrado</span>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex flex-col items-center gap-2">
          <span className="text-3xl sm:text-4xl">{match.awayTeam?.emoji}</span>
          <span className="font-black text-lg tracking-tighter">{match.awayTeam?.code}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-zinc-800/50 flex items-center justify-center gap-2 text-[10px] text-zinc-500 font-medium">
        <MapPin size={10} />
        <span>{match.venue}</span>
      </div>
    </motion.div>
  );
};
