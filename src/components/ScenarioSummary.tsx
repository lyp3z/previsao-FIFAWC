import React from 'react';
import { Match, TeamStanding } from '../types';
import { Trophy, ArrowRight, Swords, Target } from 'lucide-react';
import { cn } from '../lib/utils';

interface ScenarioSummaryProps {
  standings: { group: string; standings: TeamStanding[] }[];
  selectedTeamCode?: string;
}

export const ScenarioSummary: React.FC<ScenarioSummaryProps> = ({ standings, selectedTeamCode }) => {
  const summary = React.useMemo(() => {
    const lines: string[] = [];
    
    standings.forEach(group => {
      const q1 = group.standings[0];
      const q2 = group.standings[1];
      
      if (q1 && q2) {
        lines.push(`${group.group}: ${q1.name} termina em 1º, ${q2.name} em 2º.`);
      }
    });

    return lines;
  }, [standings]);

  return (
    <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-6 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Target size={20} className="text-emerald-500" />
        <h3 className="text-lg font-black tracking-tighter">Resumo do Cenário</h3>
      </div>
      
      <div className="space-y-3">
        {summary.map((line, i) => (
          <div key={i} className="flex items-start gap-3 text-sm text-zinc-400 font-medium leading-relaxed">
            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
            <p>{line}</p>
          </div>
        ))}
      </div>

      {summary.length === 0 && (
        <p className="text-sm text-zinc-500 italic">Simule alguns placares para ver o resumo automático do cenário.</p>
      )}
    </div>
  );
};
