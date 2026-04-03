import React from 'react';
import { GroupStanding } from '../types';
import { cn } from '../lib/utils';
import { QualificationBadge } from './QualificationBadge';
import { TeamTooltip } from './TeamTooltip';

interface StandingsTableProps {
  groupData: GroupStanding;
  compact?: boolean;
}

export const StandingsTable: React.FC<StandingsTableProps> = ({ groupData, compact }) => {
  return (
    <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl overflow-hidden shadow-xl">
      <div className="px-5 py-4 border-b border-zinc-800 bg-zinc-900/50 flex justify-between items-center">
        <h3 className="font-black text-sm uppercase tracking-[0.2em] text-zinc-100">{groupData.group}</h3>
        <div className="flex gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500" />
          <div className="w-2 h-2 rounded-full bg-emerald-500/30" />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-zinc-500 uppercase font-black border-b border-zinc-800/50">
              <th className="px-5 py-4 w-12">#</th>
              <th className="px-5 py-4">Seleção</th>
              <th className="px-3 py-4 text-center">P</th>
              <th className="px-3 py-4 text-center">J</th>
              <th className="px-3 py-4 text-center">SG</th>
              {!compact && (
                <>
                  <th className="px-3 py-4 text-center">V</th>
                  <th className="px-3 py-4 text-center">E</th>
                  <th className="px-3 py-4 text-center">D</th>
                  <th className="px-3 py-4 text-center">GP</th>
                </>
              )}
              <th className="px-5 py-4 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/30">
            {groupData.standings.map((standing, index) => (
              <tr
                key={standing.code}
                className={cn(
                  "hover:bg-zinc-800/30 transition-all duration-300 group",
                  index < 2 ? "bg-emerald-500/[0.02]" : ""
                )}
              >
                <td className="px-5 py-4 font-black text-zinc-600 group-hover:text-zinc-400 transition-colors">
                  {index + 1}
                </td>
                <td className="px-5 py-4">
                  <TeamTooltip team={standing}>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl drop-shadow-md">{standing.emoji}</span>
                      <span className="font-black tracking-tighter text-sm group-hover:text-emerald-400 transition-colors">
                        {standing.code}
                      </span>
                    </div>
                  </TeamTooltip>
                </td>
                <td className="px-3 py-4 text-center font-black text-zinc-100 text-sm">{standing.points}</td>
                <td className="px-3 py-4 text-center text-zinc-500 font-bold">{standing.played}</td>
                <td className="px-3 py-4 text-center font-bold text-zinc-300">{standing.goalDifference}</td>
                {!compact && (
                  <>
                    <td className="px-3 py-4 text-center text-zinc-500">{standing.wins}</td>
                    <td className="px-3 py-4 text-center text-zinc-500">{standing.draws}</td>
                    <td className="px-3 py-4 text-center text-zinc-500">{standing.losses}</td>
                    <td className="px-3 py-4 text-center text-zinc-500">{standing.goalsFor}</td>
                  </>
                )}
                <td className="px-5 py-4 text-right">
                  <QualificationBadge 
                    status={standing.status} 
                    rank={index + 1} 
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
