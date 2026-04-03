import React from 'react';
import { Match } from '../types';
import { cn } from '../lib/utils';
import { Trophy } from 'lucide-react';

interface KnockoutBracketProps {
  matches: Match[];
}

export const KnockoutBracket: React.FC<KnockoutBracketProps> = ({ matches }) => {
  // Simplified bracket for demo
  const rounds = [
    { name: 'Oitavas de Final', matches: [1, 2, 3, 4] },
    { name: 'Quartas de Final', matches: [1, 2] },
    { name: 'Semifinal', matches: [1] },
    { name: 'Final', matches: [1] },
  ];

  return (
    <div className="space-y-8 py-8 overflow-x-auto">
      <div className="flex gap-8 min-w-[800px] justify-center">
        {rounds.map((round, rIndex) => (
          <div key={rIndex} className="flex flex-col gap-8 w-48">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center mb-4">
              {round.name}
            </h3>
            <div className="flex flex-col justify-around flex-1 gap-8">
              {round.matches.map((_, mIndex) => (
                <div key={mIndex} className="relative">
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden shadow-lg">
                    <div className="p-2 flex items-center justify-between border-b border-zinc-800/50">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇧🇷</span>
                        <span className="text-xs font-black">BRA</span>
                      </div>
                      <span className="text-xs font-black">2</span>
                    </div>
                    <div className="p-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">🇩🇪</span>
                        <span className="text-xs font-black">GER</span>
                      </div>
                      <span className="text-xs font-black">1</span>
                    </div>
                  </div>
                  {/* Connector lines (simplified) */}
                  {rIndex < rounds.length - 1 && (
                    <div className="absolute top-1/2 -right-8 w-8 h-[1px] bg-zinc-800" />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center mt-12">
        <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-500 mb-4 border border-amber-500/30">
          <Trophy size={32} />
        </div>
        <h2 className="text-2xl font-black tracking-tighter text-zinc-100">Grande Final</h2>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Lusail Stadium • 12 de Julho</p>
      </div>
    </div>
  );
};
