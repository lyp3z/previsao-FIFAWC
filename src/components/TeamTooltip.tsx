import React from 'react';
import { Team } from '../types';
import { cn } from '../lib/utils';

interface TeamTooltipProps {
  team: Team;
  children: React.ReactNode;
}

export const TeamTooltip: React.FC<TeamTooltipProps> = ({ team, children }) => {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50 shadow-2xl">
        <div className="flex items-center gap-2">
          <span>{team.emoji}</span>
          <span>{team.name}</span>
        </div>
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-zinc-900" />
      </div>
    </div>
  );
};
