/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Trophy,
  Calendar,
  LayoutGrid,
  GitBranch,
  Settings2,
  Search,
  Filter,
  ChevronRight,
  TrendingUp,
  Clock,
  Zap
} from 'lucide-react';
import { Match, GroupStanding, TabType, TeamStanding } from './types';
import { MOCK_MATCHES, MOCK_STANDINGS, TEAMS } from './mockData';
import { cn } from './lib/utils';
import { MatchCard } from './components/MatchCard';
import { MatchModal } from './components/MatchModal';
import { StandingsTable } from './components/StandingsTable';
import { SimulatorPanel } from './components/SimulatorPanel';
import { KnockoutBracket } from './components/KnockoutBracket';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('calendar');
  const [matches, setMatches] = useState<Match[]>(MOCK_MATCHES);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterGroup, setFilterGroup] = useState('Todos');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  // Simulator Logic
  const handleScoreChange = (matchId: string, side: 'home' | 'away', value: number) => {
    setMatches(prev => prev.map(m => {
      if (m.id === matchId) {
        return {
          ...m,
          score: { ...m.score, [side]: value },
          isSimulated: true,
          status: 'finished' // Treat simulated as finished for standings
        };
      }
      return m;
    }));
  };

  const handleResetSimulation = () => {
    setMatches(MOCK_MATCHES);
  };

  // Recalculate Standings based on matches
  const calculatedStandings = useMemo(() => {
    const groups = Array.from(new Set(matches.map(m => m.group)));
    return groups.map(groupName => {
      const groupMatches = matches.filter(m => m.group === groupName);
      const teamsInGroup = Array.from(new Set([
        ...groupMatches.map(m => m.homeTeam?.code).filter(Boolean),
        ...groupMatches.map(m => m.awayTeam?.code).filter(Boolean)
      ]));

      const standings: TeamStanding[] = teamsInGroup.map(teamCode => {
        const team = Object.values(TEAMS).find(t => t.code === teamCode);
        if (!team) return null;
        
        let played = 0, wins = 0, draws = 0, losses = 0, gf = 0, ga = 0, pts = 0;

        groupMatches.forEach(m => {
          if (m.status === 'finished' || m.status === 'live') {
            if (m.homeTeam?.code === teamCode) {
              played++;
              gf += m.score.home;
              ga += m.score.away;
              if (m.score.home > m.score.away) { wins++; pts += 3; }
              else if (m.score.home === m.score.away) { draws++; pts += 1; }
              else losses++;
            } else if (m.awayTeam?.code === teamCode) {
              played++;
              gf += m.score.away;
              ga += m.score.home;
              if (m.score.away > m.score.home) { wins++; pts += 3; }
              else if (m.score.away === m.score.home) { draws++; pts += 1; }
              else losses++;
            }
          }
        });

        return {
          ...team,
          played,
          wins,
          draws,
          losses,
          goalsFor: gf,
          goalsAgainst: ga,
          goalDifference: gf - ga,
          points: pts,
          status: 'contention',
          rank: 0
        };
      }).filter((s): s is TeamStanding => s !== null);

      // Sort by points, then GD, then GF
      standings.sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDifference !== a.goalDifference) return b.goalDifference - a.goalDifference;
        return b.goalsFor - a.goalsFor;
      });

      // Update status and rank
      return {
        group: groupName,
        standings: standings.map((s, i) => {
          const isQualified = i < 2 && s.played >= 3; // Simplified logic
          const isEliminated = i >= 2 && s.played >= 3;
          return {
            ...s,
            rank: i + 1,
            status: isQualified ? 'qualified' : isEliminated ? 'eliminated' : 'contention'
          };
        })
      };
    });
  }, [matches]);

  // Persistence
  useEffect(() => {
    const saved = localStorage.getItem('wc2026_simulation');
    if (saved) {
      try {
        setMatches(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load simulation', e);
      }
    }
  }, []);

  useEffect(() => {
    if (matches !== MOCK_MATCHES) {
      localStorage.setItem('wc2026_simulation', JSON.stringify(matches));
    }
  }, [matches]);

  // Filtered Matches
  const filteredMatches = useMemo(() => {
    return matches.filter(m => {
      const matchesSearch =
        m.homeTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.awayTeam?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.homeTeam?.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.awayTeam?.code?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesGroup = filterGroup === 'Todos' || m.group === filterGroup;

      return matchesSearch && matchesGroup;
    });
  }, [matches, searchQuery, filterGroup]);

  const liveMatches = matches.filter(m => m.isLive);
  const todayMatches = matches.filter(m => m.date === '2026-06-18');

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-emerald-500/30">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-black">
              <Trophy size={20} strokeWidth={3} />
            </div>
            <h1 className="text-xl font-black tracking-tighter hidden sm:block">WC2026</h1>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={16} />
            <input
              type="text"
              placeholder="Buscar seleção..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 bg-zinc-900 border border-zinc-800 rounded-full pl-10 pr-4 text-sm focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <button className="p-2 text-zinc-400 hover:text-white transition-colors hidden sm:block">
              <Settings2 size={20} />
            </button>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 border border-white/10" />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {[
              { id: 'calendar', label: 'Calendário', icon: Calendar },
              { id: 'standings', label: 'Grupos', icon: LayoutGrid },
              { id: 'knockout', label: 'Mata-mata', icon: GitBranch },
              { id: 'simulator', label: 'Simulador', icon: Settings2 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 text-xs font-black uppercase tracking-widest transition-all relative shrink-0",
                  activeTab === tab.id ? "text-emerald-500" : "text-zinc-500 hover:text-zinc-300"
                )}
              >
                <tab.icon size={14} />
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-emerald-500" />
                )}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-32 gap-4"
            >
              <div className="relative">
                <div className="w-12 h-12 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin" />
                <Trophy className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-emerald-500" size={20} />
              </div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500 animate-pulse">Carregando dados...</p>
            </motion.div>
          ) : (
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Tab Content */}
              {activeTab === 'calendar' && (
                <div className="space-y-8">
                  {/* Quick Stats */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-500/10 rounded-xl flex items-center justify-center text-red-500">
                        <Zap size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Ao Vivo</p>
                        <p className="text-xl font-black">{liveMatches.length} Partidas</p>
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Hoje</p>
                        <p className="text-xl font-black">{todayMatches.length} Jogos</p>
                      </div>
                    </div>
                    <div className="bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800 flex items-center gap-4">
                      <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500">
                        <TrendingUp size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Próximo</p>
                        <p className="text-xl font-black">Em 2h 15m</p>
                      </div>
                    </div>
                  </div>

                  {/* Filters */}
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-bold">
                      <Filter size={14} className="text-zinc-500" />
                      <span className="text-zinc-500">Grupo:</span>
                      <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="bg-transparent focus:outline-none text-zinc-100"
                      >
                        <option value="Todos">Todos</option>
                        <option value="Grupo G">Grupo G</option>
                        <option value="Grupo C">Grupo C</option>
                        <option value="Grupo D">Grupo D</option>
                        <option value="Grupo E">Grupo E</option>
                      </select>
                    </div>
                  </div>

                  {/* Match Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredMatches.map((match) => (
                      <MatchCard
                        key={match.id}
                        match={match}
                        onClick={setSelectedMatch}
                      />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'standings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {calculatedStandings.map((group) => (
                    <StandingsTable key={group.group} groupData={group} />
                  ))}
                </div>
              )}

              {activeTab === 'knockout' && (
                <KnockoutBracket matches={matches} />
              )}

              {activeTab === 'simulator' && (
                <SimulatorPanel
                  matches={matches}
                  standings={calculatedStandings}
                  onScoreChange={handleScoreChange}
                  onReset={handleResetSimulation}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Match Details Modal */}
      <MatchModal
        match={selectedMatch}
        onClose={() => setSelectedMatch(null)}
      />

      {/* Footer */}
      <footer className="mt-20 border-t border-zinc-900 py-12 bg-zinc-950">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-emerald-500 rounded flex items-center justify-center text-black">
                <Trophy size={14} strokeWidth={3} />
              </div>
              <span className="font-black tracking-tighter text-lg">WC2026 Tracker</span>
            </div>
            <p className="text-zinc-500 text-xs max-w-xs text-center md:text-left leading-relaxed">
              Acompanhe cada momento da maior competição do planeta. Dados atualizados em tempo real e simulador exclusivo.
            </p>
          </div>

          <div className="flex gap-12">
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Plataforma</h4>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">Calendário</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">Simulador</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">Estatísticas</a>
            </div>
            <div className="flex flex-col gap-3">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Suporte</h4>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">FAQ</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">Contato</a>
              <a href="#" className="text-xs text-zinc-500 hover:text-emerald-500 transition-colors">Privacidade</a>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-zinc-900 text-center">
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">
            © 2026 World Cup Tracker • Desenvolvido para fãs de futebol
          </p>
        </div>
      </footer>
    </div>
  );
}
