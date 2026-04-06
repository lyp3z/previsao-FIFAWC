'use client';

import { useState } from 'react';
import { BarChart3, ShieldCheck, Percent, Trophy, TrendingUp, ChevronRight, AlertCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { flagUrl } from '@/lib/flag';

type Prediction = {
  id: string;
  homeWinProbability: number; drawProbability: number; awayWinProbability: number;
  over25Probability: number | null; under25Probability: number | null;
  bttsYesProbability: number | null; bttsNoProbability: number | null;
  confidenceScore: number; explanation: string | null;
  model: { name: string; version: string };
  match: {
    id: string; roundLabel: string | null;
    homeTeam: { code: string; shortName: string };
    awayTeam: { code: string; shortName: string };
    group: { code: string } | null;
    stage: { name: string };
  };
};

type Projection = {
  id: string;
  teamId: string;
  winTournamentProbability: number;
  reachFinalProbability: number;
  reachSemiFinalProbability: number;
  reachQuarterFinalProbability: number;
  reachRoundOf16Probability: number;
  team: { code: string; shortName: string; groupId: string | null };
};

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
      <AlertCircle size={40} className="opacity-30" />
      <p className="text-sm text-center max-w-xs">
        Probabilidades serão geradas após o primeiro sync analítico.
        <br />Execute <code className="text-emerald-500">/api/sync/team-stats</code> e depois <code className="text-emerald-500">/api/sync/predictions</code>.
      </p>
    </div>
  );
}

function PredictionCard({ pred }: { pred: Prediction }) {
  const [expanded, setExpanded] = useState(false);
  const hUrl = flagUrl(pred.match.homeTeam.code, 40);
  const aUrl = flagUrl(pred.match.awayTeam.code, 40);
  const label = pred.match.roundLabel ?? (pred.match.group ? `Grupo ${pred.match.group.code}` : pred.match.stage.name);

  return (
    <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      <div className="p-4 border-b border-[#1e2d3d]">
        <div className="flex justify-between mb-3">
          <span className="text-[10px] text-slate-600 uppercase tracking-widest font-semibold">{label}</span>
          <div className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-emerald-400" />
            <span className="text-xs font-semibold text-emerald-400">{(pred.confidenceScore * 100).toFixed(0)}%</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {hUrl && <img src={hUrl} alt={pred.match.homeTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
            <span className="font-bold text-sm text-white">{pred.match.homeTeam.shortName}</span>
          </div>
          <span className="text-slate-600 text-xs px-2">vs</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-bold text-sm text-white">{pred.match.awayTeam.shortName}</span>
            {aUrl && <img src={aUrl} alt={pred.match.awayTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* 1X2 tricolor bar */}
        <div className="h-6 rounded-full overflow-hidden flex mb-1.5">
          <div className="bg-blue-500/80 flex items-center justify-center text-[10px] font-black text-white"
            style={{ width: `${pred.homeWinProbability * 100}%` }}>
            {(pred.homeWinProbability * 100).toFixed(0)}%
          </div>
          <div className="bg-slate-700/80 flex items-center justify-center text-[10px] font-black text-slate-300"
            style={{ width: `${pred.drawProbability * 100}%` }}>
            {(pred.drawProbability * 100).toFixed(0)}%
          </div>
          <div className="bg-slate-500/60 flex items-center justify-center text-[10px] font-black text-slate-300"
            style={{ width: `${pred.awayWinProbability * 100}%` }}>
            {(pred.awayWinProbability * 100).toFixed(0)}%
          </div>
        </div>
        <div className="flex justify-between text-[9px] text-slate-600">
          <span className="text-blue-400">{pred.match.homeTeam.code}</span>
          <span>Empate</span>
          <span>{pred.match.awayTeam.code}</span>
        </div>

        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          <span>Mais probabilidades</span>
          <ChevronRight size={12} className={expanded ? 'rotate-90' : ''} style={{ transition: 'transform 0.15s' }} />
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 border-t border-[#1e2d3d] pt-3">
            {pred.over25Probability != null && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-36 shrink-0">Over 2.5 gols</span>
                <ProgressBar value={pred.over25Probability * 100} color="amber" size="sm" className="flex-1" />
                <span className="text-xs font-bold text-slate-200 w-12 text-right">{(pred.over25Probability * 100).toFixed(1)}%</span>
              </div>
            )}
            {pred.bttsYesProbability != null && (
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-500 w-36 shrink-0">Ambas marcam</span>
                <ProgressBar value={pred.bttsYesProbability * 100} color="purple" size="sm" className="flex-1" />
                <span className="text-xs font-bold text-slate-200 w-12 text-right">{(pred.bttsYesProbability * 100).toFixed(1)}%</span>
              </div>
            )}
            {pred.explanation && (
              <p className="text-[10px] text-slate-600 border-t border-[#1e2d3d] pt-2">{pred.explanation}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

interface Props { predictions: Prediction[]; projections: Projection[] }

export function ProbabilidadesClient({ predictions, projections }: Props) {
  const [tab, setTab] = useState<'matches'|'tournament'>('matches');

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <BarChart3 size={20} className="text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Probabilidades</h1>
            <p className="text-xs text-slate-500">Motor Poisson v1 · Monte Carlo 5k simulações</p>
          </div>
        </div>
        <div className="sm:ml-auto flex gap-2">
          <Badge variant="blue"><ShieldCheck size={11} /> poisson-v1</Badge>
          <Badge variant="default"><Percent size={11} /> {predictions.length} predições</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0d1117] border border-[#1e2d3d] rounded-xl w-fit">
        {(['matches','tournament'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25' : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t === 'matches' ? '⚽ Por Partida' : '🏆 Torneio'}
          </button>
        ))}
      </div>

      {/* Match predictions */}
      {tab === 'matches' && (
        predictions.length === 0
          ? <EmptyState />
          : <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {predictions.map(p => <PredictionCard key={p.id} pred={p} />)}
            </div>
      )}

      {/* Tournament projections */}
      {tab === 'tournament' && (
        projections.length === 0
          ? <EmptyState />
          : <div className="grid gap-6 lg:grid-cols-5">
              {/* Table col 3/5 */}
              <div className="lg:col-span-3 bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-[#1e2d3d] flex items-center gap-2">
                  <Trophy size={14} className="text-amber-400" />
                  <span className="text-sm font-bold text-white">Projeções por Seleção</span>
                  <Badge variant="amber" className="ml-auto">Monte Carlo</Badge>
                </div>
                <div className="px-5">
                  {projections.map(p => {
                    const url = flagUrl(p.team.code, 40);
                    return (
                      <div key={p.id} className="flex items-center gap-3 py-3 border-b border-[#111827] last:border-0">
                        <div className="flex items-center gap-2 w-32 shrink-0">
                          {url && <img src={url} alt={p.team.code} style={{ width: 22, height: 14, objectFit: 'cover', borderRadius: 2 }} />}
                          <span className="text-sm font-bold text-white">{p.team.shortName}</span>
                        </div>
                        <div className="flex-1 grid grid-cols-5 gap-2 text-center">
                          {[
                            { label: 'R16',   val: p.reachRoundOf16Probability,    c: 'text-slate-400'  },
                            { label: 'QF',    val: p.reachQuarterFinalProbability, c: 'text-blue-400'   },
                            { label: 'SF',    val: p.reachSemiFinalProbability,    c: 'text-purple-400' },
                            { label: 'Final', val: p.reachFinalProbability,        c: 'text-amber-400'  },
                            { label: '🏆',   val: p.winTournamentProbability,     c: 'text-emerald-400 font-black' },
                          ].map(s => (
                            <div key={s.label}>
                              <div className={`text-xs font-bold ${s.c}`}>{(s.val * 100).toFixed(1)}%</div>
                              <div className="text-[9px] text-slate-600">{s.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Radar col 2/5 */}
              <div className="lg:col-span-2 bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp size={14} className="text-purple-400" />
                  <span className="text-sm font-bold text-white">Perfil — {projections[0]?.team.shortName}</span>
                </div>
                {projections[0] && (
                  <ResponsiveContainer width="100%" height={240}>
                    <RadarChart data={[
                      { fase: 'Grupo',  value: projections[0].reachRoundOf16Probability * 100 },
                      { fase: 'R16',    value: projections[0].reachRoundOf16Probability * 100 },
                      { fase: 'QF',     value: projections[0].reachQuarterFinalProbability * 100 },
                      { fase: 'SF',     value: projections[0].reachSemiFinalProbability * 100 },
                      { fase: 'Final',  value: projections[0].reachFinalProbability * 100 },
                      { fase: '🏆',    value: projections[0].winTournamentProbability * 100 },
                    ]}>
                      <PolarGrid stroke="#1e2d3d" />
                      <PolarAngleAxis dataKey="fase" tick={{ fill: '#64748b', fontSize: 11 }} />
                      <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                      <Tooltip contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
                        formatter={(v) => [`${Number(v).toFixed(1)}%`, 'Prob.']} />
                    </RadarChart>
                  </ResponsiveContainer>
                )}
                <div className="space-y-2 mt-1">
                  {projections.slice(0, 5).map(p => (
                    <div key={p.id} className="flex items-center gap-2">
                      <span className="text-xs text-slate-400 w-20">{p.team.shortName}</span>
                      <div className="flex-1 h-1 rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-amber-500" style={{ width: `${p.winTournamentProbability * 100 * 6.25}%`, maxWidth: '100%' }} />
                      </div>
                      <span className="text-[11px] font-bold text-amber-400">{(p.winTournamentProbability * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
      )}
    </div>
  );
}
