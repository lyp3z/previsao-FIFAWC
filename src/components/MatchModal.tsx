import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar, MapPin, Trophy, Info, Users, Activity } from 'lucide-react';
import { Match } from '../types';
import { cn } from '../lib/utils';

interface MatchModalProps {
  match: Match | null;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ match, onClose }) => {
  if (!match) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl overflow-hidden shadow-2xl"
        >
          {/* Header Image/Pattern */}
          <div className="h-32 bg-gradient-to-br from-zinc-900 to-zinc-950 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-zinc-100 via-transparent to-transparent" />
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/60 text-zinc-400 hover:text-white transition-colors z-10"
            >
              <X size={20} />
            </button>
          </div>

          {/* Main Info */}
          <div className="px-6 pb-8 -mt-16 relative">
            <div className="flex flex-col items-center">
              {/* Teams Header */}
              <div className="flex items-center justify-center gap-8 sm:gap-16 mb-8">
                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-900 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-xl border border-zinc-800">
                    {match.homeTeam?.emoji}
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-xl tracking-tighter">{match.homeTeam?.name}</h3>
                    <span className="text-zinc-500 font-bold text-sm">{match.homeTeam?.code}</span>
                  </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl sm:text-5xl font-black tracking-tighter flex items-center gap-4">
                    <span>{match.score.home}</span>
                    <span className="text-zinc-800 text-2xl">-</span>
                    <span>{match.score.away}</span>
                  </div>
                  {match.isLive && (
                    <span className="px-2 py-0.5 bg-red-500 text-white text-[10px] font-black rounded uppercase animate-pulse">
                      Ao Vivo • {match.minute}'
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-center gap-3">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 bg-zinc-900 rounded-full flex items-center justify-center text-5xl sm:text-6xl shadow-xl border border-zinc-800">
                    {match.awayTeam?.emoji}
                  </div>
                  <div className="text-center">
                    <h3 className="font-black text-xl tracking-tighter">{match.awayTeam?.name}</h3>
                    <span className="text-zinc-500 font-bold text-sm">{match.awayTeam?.code}</span>
                  </div>
                </div>
              </div>

              {/* Details Grid */}
              <div className="w-full grid grid-cols-2 gap-4 mb-8">
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Data e Hora</p>
                    <p className="text-sm font-bold">{match.date} • {match.time}</p>
                  </div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <MapPin size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Estádio</p>
                    <p className="text-sm font-bold truncate">{match.venue}</p>
                  </div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <Trophy size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Fase</p>
                    <p className="text-sm font-bold">{match.stage}</p>
                  </div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50 flex items-center gap-3">
                  <div className="p-2 bg-zinc-800 rounded-lg text-zinc-400">
                    <Info size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Grupo</p>
                    <p className="text-sm font-bold">{match.group}</p>
                  </div>
                </div>
              </div>

              {/* Stats Placeholder */}
              <div className="w-full space-y-4">
                <h4 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                  <Activity size={14} />
                  Estatísticas da Partida
                </h4>
                <div className="space-y-3">
                  {[
                    { label: 'Posse de Bola', home: 54, away: 46 },
                    { label: 'Finalizações', home: 12, away: 8 },
                    { label: 'Escanteios', home: 5, away: 3 },
                  ].map((stat, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-[10px] font-bold uppercase text-zinc-400">
                        <span>{stat.home}{stat.label === 'Posse de Bola' ? '%' : ''}</span>
                        <span>{stat.label}</span>
                        <span>{stat.away}{stat.label === 'Posse de Bola' ? '%' : ''}</span>
                      </div>
                      <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-zinc-100 transition-all duration-500"
                          style={{ width: `${(stat.home / (stat.home + stat.away)) * 100}%` }}
                        />
                        <div
                          className="h-full bg-zinc-700 transition-all duration-500"
                          style={{ width: `${(stat.away / (stat.home + stat.away)) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
