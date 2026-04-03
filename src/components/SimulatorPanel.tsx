import React from 'react';
import { Match, TeamStanding, Team } from '../types';
import { cn } from '../lib/utils';
import { 
  RotateCcw, 
  Save, 
  Info, 
  Calculator, 
  Table2, 
  GitBranch, 
  Target, 
  Sparkles,
  Pencil,
  Trash2
} from 'lucide-react';
import { StandingsTable } from './StandingsTable';
import { ScenarioSummary } from './ScenarioSummary';
import { TeamPathExplorer } from './TeamPathExplorer';
import { KnockoutBracket } from './KnockoutBracket';

interface SimulatorPanelProps {
  matches: Match[];
  standings: { group: string; standings: TeamStanding[] }[];
  onScoreChange: (matchId: string, side: 'home' | 'away', value: number) => void;
  onReset: () => void;
}

type SimulatorTab = 'results' | 'standings' | 'knockout' | 'path';

export const SimulatorPanel: React.FC<SimulatorPanelProps> = ({ 
  matches, 
  standings,
  onScoreChange, 
  onReset 
}) => {
  const [activeSubTab, setActiveSubTab] = React.useState<SimulatorTab>('results');

  const allTeams = React.useMemo(() => {
    const teams = new Map<string, Team>();
    matches.forEach(m => {
      if (m.homeTeam?.code) teams.set(m.homeTeam.code, m.homeTeam);
      if (m.awayTeam?.code) teams.set(m.awayTeam.code, m.awayTeam);
    });
    return Array.from(teams.values());
  }, [matches]);

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 shadow-2xl">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
            <Calculator size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black tracking-tighter flex items-center gap-2">
              Laboratório de Cenários
              <Sparkles size={16} className="text-amber-500" />
            </h2>
            <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">
              Simule resultados e projete o futuro do torneio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 lg:pb-0">
          {[
            { id: 'results', label: 'Placares', icon: Pencil },
            { id: 'standings', label: 'Classificação', icon: Table2 },
            { id: 'knockout', label: 'Mata-mata', icon: GitBranch },
            { id: 'path', label: 'Caminho', icon: Target },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id as SimulatorTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0",
                activeSubTab === tab.id 
                  ? "bg-emerald-500 text-black shadow-lg shadow-emerald-500/20" 
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              )}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
          <div className="w-[1px] h-8 bg-zinc-800 mx-2 hidden lg:block" />
          <button
            onClick={onReset}
            className="flex items-center gap-2 px-4 py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-red-500 hover:border-red-500/30 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shrink-0"
          >
            <RotateCcw size={14} />
            Resetar
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="min-h-[400px]">
        {activeSubTab === 'results' && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((match) => (
                  <div
                    key={match.id}
                    className={cn(
                      "p-5 rounded-2xl border transition-all duration-500 group",
                      match.isSimulated
                        ? "bg-emerald-500/[0.03] border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                        : "bg-zinc-900/30 border-zinc-800 hover:border-zinc-700"
                    )}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-zinc-800 rounded text-[9px] font-black uppercase tracking-widest text-zinc-500">
                          {match.group}
                        </span>
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-600">
                          {match.venue}
                        </span>
                      </div>
                      {match.isSimulated && (
                        <div className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-500">
                          <Sparkles size={10} />
                          Simulado
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 flex items-center gap-3">
                        <span className="text-3xl drop-shadow-md">{match.homeTeam?.emoji}</span>
                        <span className="font-black text-sm tracking-tighter">{match.homeTeam?.code}</span>
                        <input
                          type="number"
                          min="0"
                          value={match.score.home}
                          onChange={(e) => onScoreChange(match.id, 'home', parseInt(e.target.value) || 0)}
                          className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl text-center font-black text-xl focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                        />
                      </div>

                      <div className="flex flex-col items-center gap-1">
                        <span className="text-zinc-800 font-black text-lg">VS</span>
                      </div>

                      <div className="flex-1 flex items-center justify-end gap-3">
                        <input
                          type="number"
                          min="0"
                          value={match.score.away}
                          onChange={(e) => onScoreChange(match.id, 'away', parseInt(e.target.value) || 0)}
                          className="w-12 h-12 bg-zinc-950 border border-zinc-800 rounded-xl text-center font-black text-xl focus:outline-none focus:border-emerald-500 transition-all shadow-inner"
                        />
                        <span className="font-black text-sm tracking-tighter">{match.awayTeam?.code}</span>
                        <span className="text-3xl drop-shadow-md">{match.awayTeam?.emoji}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <ScenarioSummary standings={standings} />
              <div className="bg-zinc-900/50 p-6 rounded-2xl border border-zinc-800 space-y-4">
                <div className="flex items-center gap-2">
                  <Info size={18} className="text-amber-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-zinc-400">Legenda</h4>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold">
                    <div className="w-3 h-3 rounded bg-emerald-500/20 border border-emerald-500/40" />
                    <span>Resultado Simulado</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-zinc-500 font-bold">
                    <div className="w-3 h-3 rounded bg-zinc-800 border border-zinc-700" />
                    <span>Resultado Real</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'standings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {standings.map((group) => (
              <StandingsTable key={group.group} groupData={group} />
            ))}
          </div>
        )}

        {activeSubTab === 'knockout' && (
          <KnockoutBracket matches={matches} />
        )}

        {activeSubTab === 'path' && (
          <TeamPathExplorer teams={allTeams} standings={standings} />
        )}
      </div>
    </div>
  );
};
