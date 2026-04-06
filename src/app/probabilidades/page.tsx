'use client';

import { useState } from 'react';
import { BarChart3, ShieldCheck, Percent, Trophy, TrendingUp, ChevronRight } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { flagUrl } from '@/lib/flag';
import { MOCK_MATCHES, MOCK_PROJECTIONS, type MatchPrediction } from '@/data/mock';

// ── Probability bar row ───────────────────────────────────────────────────────

function ProbRow({ label, value, color = 'emerald', max = 100 }: { label: string; value: number; color?: 'emerald'|'blue'|'amber'|'red'|'purple'|'cyan'; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-slate-500 w-40 shrink-0">{label}</span>
      <div className="flex-1">
        <ProgressBar value={pct} color={color} size="sm" />
      </div>
      <span className="text-xs font-bold text-slate-200 w-12 text-right">
        {(value * 100).toFixed(1)}%
      </span>
    </div>
  );
}

// ── Match prediction card ─────────────────────────────────────────────────────

function PredictionCard({ pred, match }: { pred: MatchPrediction; match: (typeof MOCK_MATCHES)[0] }) {
  const [expanded, setExpanded] = useState(false);

  const hUrl = flagUrl(match.homeTeam.code, 40);
  const aUrl = flagUrl(match.awayTeam.code, 40);

  return (
    <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-[#1e2d3d]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{match.roundLabel}</span>
          <div className="flex items-center gap-1.5">
            <ShieldCheck size={12} className="text-emerald-400" />
            <span className="text-xs text-emerald-400 font-semibold">{(pred.confidenceScore * 100).toFixed(0)}%</span>
          </div>
        </div>

        {/* Teams */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            {hUrl && <img src={hUrl} alt={match.homeTeam.code} style={{ width: 26, height: 17, objectFit: 'cover', borderRadius: 3 }} />}
            <span className="font-bold text-sm text-white">{match.homeTeam.shortName}</span>
          </div>
          <div className="text-xs font-bold text-slate-600 px-2">vs</div>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-bold text-sm text-white">{match.awayTeam.shortName}</span>
            {aUrl && <img src={aUrl} alt={match.awayTeam.code} style={{ width: 26, height: 17, objectFit: 'cover', borderRadius: 3 }} />}
          </div>
        </div>
      </div>

      {/* 1X2 bar */}
      <div className="p-4">
        <div className="relative h-6 rounded-full overflow-hidden flex mb-2">
          <div className="bg-blue-500/80 flex items-center justify-center text-[10px] font-black text-white transition-all"
            style={{ width: `${pred.homeWin * 100}%` }}>
            {(pred.homeWin * 100).toFixed(0)}%
          </div>
          <div className="bg-slate-700/80 flex items-center justify-center text-[10px] font-black text-slate-300 transition-all"
            style={{ width: `${pred.draw * 100}%` }}>
            {(pred.draw * 100).toFixed(0)}%
          </div>
          <div className="bg-slate-500/60 flex items-center justify-center text-[10px] font-black text-slate-300 transition-all"
            style={{ width: `${pred.awayWin * 100}%` }}>
            {(pred.awayWin * 100).toFixed(0)}%
          </div>
        </div>
        <div className="flex justify-between text-[10px] text-slate-600">
          <span className="text-blue-400 font-semibold">{match.homeTeam.code}</span>
          <span>Empate</span>
          <span>{match.awayTeam.code}</span>
        </div>

        {/* Secondary probs */}
        <button onClick={() => setExpanded(!expanded)}
          className="mt-3 w-full flex items-center justify-between text-[11px] text-slate-500 hover:text-slate-300 transition-colors">
          <span>Mais probabilidades</span>
          <ChevronRight size={12} className={expanded ? 'rotate-90' : ''} style={{ transition: 'transform 0.15s' }} />
        </button>

        {expanded && (
          <div className="mt-3 space-y-2 border-t border-[#1e2d3d] pt-3">
            <ProbRow label="Over 2.5 gols"    value={pred.over25}    color="amber"  />
            <ProbRow label="Under 2.5 gols"   value={pred.under25}   color="blue"   />
            <ProbRow label="Ambas marcam"      value={pred.bttsYes}   color="purple" />
            <ProbRow label="Sem BTTS"          value={pred.bttsNo}    color="cyan"   />
            {pred.toQualifyHome && <ProbRow label={`${match.homeTeam.code} passa`} value={pred.toQualifyHome} color="emerald" />}
            {pred.toQualifyAway && <ProbRow label={`${match.awayTeam.code} passa`} value={pred.toQualifyAway} color="red" />}
            <p className="text-[10px] text-slate-600 pt-1 border-t border-[#1e2d3d]">
              {pred.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tournament projection chart ───────────────────────────────────────────────

function ProjectionRow({ proj }: { proj: (typeof MOCK_PROJECTIONS)[0] }) {
  const url = flagUrl(proj.team.code, 40);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#111827] last:border-0">
      <div className="flex items-center gap-2.5 w-32 shrink-0">
        {url && <img src={url} alt={proj.team.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
        <span className="text-sm font-bold text-white">{proj.team.shortName}</span>
      </div>
      <div className="flex-1 grid grid-cols-5 gap-2 text-center">
        {[
          { label: 'R16',   value: proj.reachRoundOf16,    color: 'text-slate-400' },
          { label: 'QF',    value: proj.reachQuarterFinal, color: 'text-blue-400'  },
          { label: 'SF',    value: proj.reachSemiFinal,    color: 'text-purple-400'},
          { label: 'Final', value: proj.reachFinal,        color: 'text-amber-400' },
          { label: '🏆',    value: proj.winTournament,     color: 'text-emerald-400 font-black' },
        ].map(s => (
          <div key={s.label}>
            <div className={`text-xs font-bold ${s.color}`}>{(s.value * 100).toFixed(1)}%</div>
            <div className="text-[9px] text-slate-600">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ProbabilidadesPage() {
  const [tab, setTab] = useState<'matches'|'tournament'>('matches');
  const matchesWithPreds = MOCK_MATCHES.filter(m => m.prediction);

  const radarData = MOCK_PROJECTIONS.slice(0, 6).map(p => ({
    team: p.team.code,
    'Fase de Grupos': p.reachRoundOf32 * 100,
    'Oitavas': p.reachRoundOf16 * 100,
    'Quartas': p.reachQuarterFinal * 100,
    'Semis': p.reachSemiFinal * 100,
    'Final': p.reachFinal * 100,
    'Título': p.winTournament * 100,
  }));

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
            <p className="text-xs text-slate-500">Motor Poisson v1 · 5.000 simulações Monte Carlo</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Badge variant="blue"><ShieldCheck size={11} /> poisson-v1</Badge>
          <Badge variant="default"><Percent size={11} /> Modelo ativo</Badge>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-[#0d1117] border border-[#1e2d3d] rounded-xl w-fit">
        {(['matches','tournament'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              tab === t
                ? 'bg-blue-500/15 text-blue-400 border border-blue-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {t === 'matches' ? '⚽ Por Partida' : '🏆 Torneio'}
          </button>
        ))}
      </div>

      {/* Match predictions */}
      {tab === 'matches' && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {matchesWithPreds.map(m => (
            <PredictionCard key={m.id} pred={m.prediction!} match={m} />
          ))}
        </div>
      )}

      {/* Tournament projections */}
      {tab === 'tournament' && (
        <div className="grid gap-6 lg:grid-cols-5">

          {/* Projections table (col 3/5) */}
          <div className="lg:col-span-3 bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#1e2d3d] flex items-center gap-2">
              <Trophy size={15} className="text-amber-400" />
              <span className="text-sm font-bold text-white">Projeções por Seleção</span>
              <Badge variant="amber" className="ml-auto">Monte Carlo</Badge>
            </div>
            <div className="px-5">
              {MOCK_PROJECTIONS.map(p => <ProjectionRow key={p.teamId} proj={p} />)}
            </div>
          </div>

          {/* Radar chart (col 2/5) */}
          <div className="lg:col-span-2 bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-5">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={15} className="text-purple-400" />
              <span className="text-sm font-bold text-white">Perfil de Progresso</span>
              <span className="text-xs text-slate-600 ml-auto">Brasil</span>
            </div>
            <ResponsiveContainer width="100%" height={260}>
              <RadarChart data={[
                { fase: 'R16',   value: 78 },
                { fase: 'QF',    value: 62 },
                { fase: 'SF',    value: 46 },
                { fase: 'Final', value: 32 },
                { fase: 'Título',value: 16 },
                { fase: 'Grupo', value: 96 },
              ]}>
                <PolarGrid stroke="#1e2d3d" />
                <PolarAngleAxis dataKey="fase" tick={{ fill: '#64748b', fontSize: 11 }} />
                <Radar dataKey="value" stroke="#10b981" fill="#10b981" fillOpacity={0.2} strokeWidth={2} />
                <Tooltip
                  contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => [`${v}%`, 'Probabilidade']}
                />
              </RadarChart>
            </ResponsiveContainer>

            {/* Legend for top 4 */}
            <div className="space-y-2 mt-2">
              {MOCK_PROJECTIONS.slice(0, 4).map(p => (
                <div key={p.teamId} className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 w-20">{p.team.shortName}</span>
                  <div className="flex-1 h-1 rounded-full bg-white/5">
                    <div className="h-full rounded-full bg-amber-500" style={{ width: `${p.winTournament * 100 * 6.25}%` }} />
                  </div>
                  <span className="text-[11px] font-bold text-amber-400">{(p.winTournament * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
