'use client';

import { useState } from 'react';
import { Gem, TrendingUp, ShieldCheck, ArrowUpDown, Filter, Zap, Target, Lightbulb } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { flagUrl } from '@/lib/flag';
import { MOCK_INSIGHTS, MOCK_STATS, type BettingInsight } from '@/data/mock';

type SortKey = 'ev' | 'edge' | 'confidence' | 'odd';

// ── Edge badge ────────────────────────────────────────────────────────────────

function EdgeBadge({ edge }: { edge: number }) {
  const pct = (edge * 100).toFixed(1);
  if (edge >= 0.05) return <Badge variant="strong-value"><Zap size={9} />+{pct}%</Badge>;
  if (edge >= 0.03) return <Badge variant="value">+{pct}%</Badge>;
  return <Badge variant="default">{pct}%</Badge>;
}

function ConfBadge({ label }: { label: BettingInsight['confidenceLabel'] }) {
  if (label === 'HIGH')   return <Badge variant="strong-value"><ShieldCheck size={9} />Alta</Badge>;
  if (label === 'MEDIUM') return <Badge variant="amber"><ShieldCheck size={9} />Média</Badge>;
  return <Badge variant="default">Baixa</Badge>;
}

// ── Insight row ───────────────────────────────────────────────────────────────

function InsightRow({ insight, rank }: { insight: BettingInsight; rank: number }) {
  const [open, setOpen] = useState(false);
  const hUrl = flagUrl(insight.match.homeTeam.code, 40);
  const aUrl = flagUrl(insight.match.awayTeam.code, 40);

  return (
    <div className={`rounded-xl border transition-all duration-200 ${
      insight.isValueBet && insight.confidenceLabel === 'HIGH'
        ? 'border-emerald-500/30 bg-[#0d1117] shadow-[0_0_20px_rgba(16,185,129,0.06)]'
        : 'border-[#1e2d3d] bg-[#0d1117] hover:border-slate-700'
    }`}>
      {/* Main row */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3">

          {/* Rank + teams */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className={`text-lg font-black w-7 text-center ${rank <= 3 ? 'text-amber-400' : 'text-slate-600'}`}>
              {rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : rank}
            </span>
            <div className="flex items-center gap-1.5 flex-1 min-w-0">
              {hUrl && <img src={hUrl} alt={insight.match.homeTeam.code} style={{ width: 22, height: 14, objectFit: 'cover', borderRadius: 2 }} />}
              <span className="text-xs font-bold text-slate-300">{insight.match.homeTeam.code}</span>
              <span className="text-slate-600 text-xs">vs</span>
              <span className="text-xs font-bold text-slate-300">{insight.match.awayTeam.code}</span>
              {aUrl && <img src={aUrl} alt={insight.match.awayTeam.code} style={{ width: 22, height: 14, objectFit: 'cover', borderRadius: 2 }} />}
            </div>
          </div>

          {/* Market + selection */}
          <div className="flex flex-col sm:items-end gap-0.5 shrink-0">
            <span className="text-xs font-semibold text-slate-200">{insight.selectionLabel}</span>
            <span className="text-[10px] text-slate-500">{insight.marketLabel} · {insight.bookmaker}</span>
          </div>

          {/* Key metrics */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-center">
              <div className="text-xl font-black text-white">{insight.offeredOdd.toFixed(2)}</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">Odd</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-black text-emerald-400">+{(insight.expectedValue * 100).toFixed(1)}%</div>
              <div className="text-[9px] text-slate-600 uppercase tracking-wider">EV</div>
            </div>
            <div className="flex flex-col gap-1">
              <EdgeBadge edge={insight.edge} />
              <ConfBadge label={insight.confidenceLabel} />
            </div>
          </div>
        </div>

        {/* Probability comparison bar */}
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>Modelo</span>
              <span className="font-bold text-blue-400">{(insight.modelProbability * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar value={insight.modelProbability * 100} color="blue" size="sm" />
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-slate-600 mb-1">
              <span>Implícita (mercado)</span>
              <span className="font-bold text-slate-400">{(insight.impliedProbability * 100).toFixed(1)}%</span>
            </div>
            <ProgressBar value={insight.impliedProbability * 100} color="amber" size="sm" />
          </div>
        </div>

        <button onClick={() => setOpen(!open)}
          className="mt-3 flex items-center gap-1 text-[10px] text-slate-500 hover:text-slate-300 transition-colors">
          <Lightbulb size={10} className="text-amber-400" /> {open ? 'Ocultar' : 'Ver análise'}
        </button>

        {open && (
          <div className="mt-2 p-3 rounded-lg bg-white/3 border border-white/6 text-xs text-slate-400">
            {insight.explanation}
            <div className="mt-2 flex flex-wrap gap-3 text-[10px] text-slate-600">
              <span>Fair Odd: <span className="font-bold text-slate-300">{insight.fairOdd.toFixed(2)}</span></span>
              <span>Edge: <span className="font-bold text-emerald-400">+{(insight.edge*100).toFixed(1)}%</span></span>
              <span>Confiança: <span className="font-bold text-slate-300">{(insight.confidenceScore*100).toFixed(0)}%</span></span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ValueBetsPage() {
  const [sortBy, setSortBy] = useState<SortKey>('ev');
  const [filterConf, setFilterConf] = useState<'ALL'|'HIGH'|'MEDIUM'>('ALL');
  const [showValueOnly, setShowValueOnly] = useState(true);

  let insights = [...MOCK_INSIGHTS];
  if (showValueOnly) insights = insights.filter(i => i.isValueBet);
  if (filterConf !== 'ALL') insights = insights.filter(i => i.confidenceLabel === filterConf);

  insights.sort((a, b) => {
    if (sortBy === 'ev')         return b.expectedValue  - a.expectedValue;
    if (sortBy === 'edge')       return b.edge           - a.edge;
    if (sortBy === 'confidence') return b.confidenceScore - a.confidenceScore;
    return b.offeredOdd - a.offeredOdd;
  });

  const chartData = insights.slice(0, 6).map(i => ({
    name: `${i.match.homeTeam.code} vs ${i.match.awayTeam.code}`,
    EV:   +(i.expectedValue * 100).toFixed(1),
    Edge: +(i.edge * 100).toFixed(1),
  }));

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Gem size={20} className="text-emerald-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white flex items-center gap-2">
              Value Bets
              <Badge variant="strong-value"><Zap size={10} />HOT</Badge>
            </h1>
            <p className="text-xs text-slate-500">Oportunidades detectadas pelo modelo Poisson v1</p>
          </div>
        </div>
        <div className="sm:ml-auto flex flex-wrap gap-2">
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2 text-center">
            <div className="text-lg font-black text-emerald-400">{insights.filter(i=>i.isValueBet).length}</div>
            <div className="text-[10px] text-slate-500">Value Bets</div>
          </div>
          <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-2 text-center">
            <div className="text-lg font-black text-amber-400">+{(MOCK_STATS.bestEV * 100).toFixed(0)}%</div>
            <div className="text-[10px] text-slate-500">Melhor EV</div>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-2 text-center">
            <div className="text-lg font-black text-blue-400">{(MOCK_STATS.avgEdge * 100).toFixed(1)}%</div>
            <div className="text-[10px] text-slate-500">Edge Médio</div>
          </div>
        </div>
      </div>

      {/* EV chart */}
      <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={15} className="text-emerald-400" />
          <span className="text-sm font-bold text-white">Expected Value por Aposta</span>
          <Badge variant="value" className="ml-auto">Acima de 0%</Badge>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={chartData} margin={{ left: -20 }}>
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number, name: string) => [`${v}%`, name]}
            />
            <Bar dataKey="EV" radius={[4,4,0,0]}>
              {chartData.map((entry, i) => (
                <Cell key={i} fill={entry.EV > 0.1 ? '#10b981' : '#3b82f6'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Filter size={14} className="text-slate-500" />
        <div className="flex gap-1 p-1 bg-[#0d1117] border border-[#1e2d3d] rounded-lg">
          {(['ALL','HIGH','MEDIUM'] as const).map(cf => (
            <button key={cf} onClick={() => setFilterConf(cf)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                filterConf === cf
                  ? 'bg-white/8 text-slate-200'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>
              {cf === 'ALL' ? 'Todas' : cf === 'HIGH' ? 'Alta confiança' : 'Média confiança'}
            </button>
          ))}
        </div>

        <div className="flex gap-1 p-1 bg-[#0d1117] border border-[#1e2d3d] rounded-lg">
          {(['ev','edge','confidence','odd'] as SortKey[]).map(sk => (
            <button key={sk} onClick={() => setSortBy(sk)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                sortBy === sk
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/25'
                  : 'text-slate-500 hover:text-slate-300'
              }`}>
              {sk.toUpperCase()}
            </button>
          ))}
        </div>

        <button onClick={() => setShowValueOnly(!showValueOnly)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
            showValueOnly
              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
              : 'bg-transparent text-slate-500 border-[#1e2d3d] hover:text-slate-300'
          }`}>
          <Target size={12} /> Só value bets
        </button>

        <span className="ml-auto text-xs text-slate-600 flex items-center gap-1">
          <ArrowUpDown size={11} /> {insights.length} resultados
        </span>
      </div>

      {/* Insights list */}
      <div className="space-y-3">
        {insights.length === 0 && (
          <div className="text-center py-16 text-slate-600">
            <Gem size={40} className="mx-auto mb-3 opacity-30" />
            <p>Nenhuma oportunidade encontrada com estes filtros.</p>
          </div>
        )}
        {insights.map((insight, i) => (
          <InsightRow key={insight.id} insight={insight} rank={i + 1} />
        ))}
      </div>
    </div>
  );
}
