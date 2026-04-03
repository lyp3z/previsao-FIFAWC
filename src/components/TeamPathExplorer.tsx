import React from 'react';
import { Team, TeamStanding } from '../types';
import { cn } from '../lib/utils';
import { Search, Trophy, GitBranch, Shield, Target, ArrowRight } from 'lucide-react';
import { TeamTooltip } from './TeamTooltip';

interface TeamPathExplorerProps {
  teams: Team[];
  standings: { group: string; standings: TeamStanding[] }[];
}

export const TeamPathExplorer: React.FC<TeamPathExplorerProps> = ({ teams, standings }) => {
  const [selectedTeamCode, setSelectedTeamCode] = React.useState<string>('BRA');

  const selectedTeam = React.useMemo(() => 
    teams.find(t => t.code === selectedTeamCode), 
  [teams, selectedTeamCode]);

  const teamStanding = React.useMemo(() => {
    for (const group of standings) {
      const s = group.standings.find(st => st.code === selectedTeamCode);
      if (s) return { group: group.group, ...s };
    }
    return null;
  }, [standings, selectedTeamCode]);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <Target size={24} />
          </div>
          <div>
            <h3 className="text-xl font-black tracking-tighter">Caminho da Seleção</h3>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Explore as possibilidades do seu time</p>
          </div>
        </div>

        <div className="relative w-full sm:w-64">
          <select
            value={selectedTeamCode}
            onChange={(e) => setSelectedTeamCode(e.target.value)}
            className="w-full h-12 bg-zinc-950 border border-zinc-800 rounded-xl px-4 font-black text-sm appearance-none focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
          >
            {teams.map(t => (
              <option key={t.code} value={t.code}>{t.emoji} {t.name}</option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
            <Search size={16} />
          </div>
        </div>
      </div>

      {teamStanding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Current Status */}
          <div className="bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <Shield size={14} />
              Situação Atual
            </h4>
            
            <div className="flex items-center gap-4">
              <div className="text-5xl">{teamStanding.emoji}</div>
              <div>
                <div className="text-2xl font-black tracking-tighter">{teamStanding.name}</div>
                <div className="text-zinc-500 font-bold text-sm">{teamStanding.group} • {teamStanding.rank}º Lugar</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Pontos</p>
                <p className="text-xl font-black">{teamStanding.points}</p>
              </div>
              <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                <p className="text-[10px] text-zinc-500 font-black uppercase mb-1">Saldo</p>
                <p className="text-xl font-black">{teamStanding.goalDifference}</p>
              </div>
            </div>
          </div>

          {/* Potential Matchups */}
          <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-6 space-y-6">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-2">
              <GitBranch size={14} />
              Projeção de Cruzamentos
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-400">Se terminar em 1º</span>
                  <div className="px-2 py-1 bg-emerald-500/10 text-emerald-500 rounded text-[10px] font-black uppercase">Oitavas</div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{teamStanding.emoji}</span>
                    <span className="font-black">1º {teamStanding.group[teamStanding.group.length - 1]}</span>
                  </div>
                  <ArrowRight size={16} className="text-zinc-700" />
                  <div className="flex items-center gap-3">
                    <span className="font-black text-zinc-500">2º H</span>
                    <span className="text-2xl opacity-20">❓</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase text-zinc-400">Se terminar em 2º</span>
                  <div className="px-2 py-1 bg-amber-500/10 text-amber-500 rounded text-[10px] font-black uppercase">Oitavas</div>
                </div>
                <div className="bg-zinc-900/50 p-4 rounded-xl border border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{teamStanding.emoji}</span>
                    <span className="font-black">2º {teamStanding.group[teamStanding.group.length - 1]}</span>
                  </div>
                  <ArrowRight size={16} className="text-zinc-700" />
                  <div className="flex items-center gap-3">
                    <span className="font-black text-zinc-500">1º H</span>
                    <span className="text-2xl opacity-20">❓</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/50">
              <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                <Trophy size={14} className="text-amber-500" />
                <span>Caminho projetado até a final inclui possíveis confrontos contra Argentina ou França.</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
