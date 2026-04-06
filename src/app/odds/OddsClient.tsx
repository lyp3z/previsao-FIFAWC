'use client';

import { useState } from 'react';
import { BadgeDollarSign, Star, TrendingDown, Scale, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { flagUrl } from '@/lib/flag';

type OddEntry = { odd: number; impliedProbability: number; label: string };

type BookmakerRow = {
  bookmakerName: string;
  isSharp: boolean;
  odds: Record<string, OddEntry>;
};

type MatchOddsData = {
  matchId: string;
  match: {
    homeTeam: { code: string; shortName: string };
    awayTeam: { code: string; shortName: string };
    roundLabel: string | null;
    group: { code: string } | null;
    stage: { name: string };
  };
  capturedAt: string;
  bookmakers: BookmakerRow[];
  best: Record<string, number>;
  avgImplied: { home: number; draw: number; away: number };
};

type MarketTab = '1X2' | 'OU_25' | 'BTTS';

const MARKET_SELECTIONS: Record<MarketTab, { code: string; label: string }[]> = {
  '1X2':   [{ code: 'HOME', label: 'Casa' }, { code: 'DRAW', label: 'Empate' }, { code: 'AWAY', label: 'Fora' }],
  'OU_25': [{ code: 'OVER_25', label: 'Over 2.5' }, { code: 'UNDER_25', label: 'Under 2.5' }],
  'BTTS':  [{ code: 'BTTS_YES', label: 'Sim' }, { code: 'BTTS_NO', label: 'Não' }],
};

function BookmakerRowView({
  bk, market, best,
}: { bk: BookmakerRow; market: MarketTab; best: Record<string, number> }) {
  const sels = MARKET_SELECTIONS[market];
  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-[#111827] last:border-0">
      <div className="flex items-center gap-2 w-28 shrink-0">
        {bk.isSharp && <Star size={11} className="text-amber-400 shrink-0" />}
        <span className={`text-sm font-bold ${bk.isSharp ? 'text-amber-300' : 'text-slate-300'}`}>
          {bk.bookmakerName}
        </span>
        {bk.isSharp && <Badge variant="amber" className="text-[9px] px-1 py-0">Sharp</Badge>}
      </div>
      <div className="flex-1 flex gap-3 flex-wrap">
        {sels.map(({ code, label }) => {
          const entry = bk.odds[code];
          if (!entry) return null;
          const isBest = best[code] === entry.odd;
          return (
            <div key={code} className={`rounded-lg px-3 py-2 border text-center min-w-[72px] transition-all ${
              isBest
                ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.12)]'
                : 'bg-white/3 border-white/6'
            }`}>
              <div className={`text-base font-black ${isBest ? 'text-emerald-300' : 'text-slate-200'}`}>
                {entry.odd.toFixed(2)}
                {isBest && <span className="text-[9px] font-semibold text-emerald-500 ml-1">BEST</span>}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">{(entry.impliedProbability * 100).toFixed(1)}% impl.</div>
              <div className="text-[9px] text-slate-500">{label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchOddsCard({ data, market }: { data: MatchOddsData; market: MarketTab }) {
  const [expanded, setExpanded] = useState(false);
  const hUrl = flagUrl(data.match.homeTeam.code, 40);
  const aUrl = flagUrl(data.match.awayTeam.code, 40);
  const label = data.match.roundLabel ?? (data.match.group ? `Grupo ${data.match.group.code}` : data.match.stage.name);

  const homeBestImpl = data.best['HOME'] ? (1 / data.best['HOME']) : null;
  const hasDisparity = homeBestImpl != null && Math.abs(homeBestImpl - data.avgImplied.home) > 0.01;

  const visibleBks = expanded ? data.bookmakers : data.bookmakers.slice(0, 2);

  return (
    <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      <div className="p-4 border-b border-[#1e2d3d]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{label}</span>
          <div className="flex items-center gap-2">
            {hasDisparity && <Badge variant="value"><TrendingDown size={9} /> Dispersão detectada</Badge>}
            <span className="text-[10px] text-slate-600">{data.capturedAt}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {hUrl && <img src={hUrl} alt={data.match.homeTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
            <span className="font-bold text-white text-sm">{data.match.homeTeam.shortName}</span>
          </div>
          <span className="text-slate-600 text-sm font-light">vs</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-bold text-white text-sm">{data.match.awayTeam.shortName}</span>
            {aUrl && <img src={aUrl} alt={data.match.awayTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
          </div>
        </div>

        {market === '1X2' && data.best['HOME'] && (
          <div className="mt-3 flex gap-2">
            {[
              { label: data.match.homeTeam.code, val: data.best['HOME'] },
              { label: 'X',                      val: data.best['DRAW'] },
              { label: data.match.awayTeam.code, val: data.best['AWAY'] },
            ].map(o => o.val ? (
              <div key={o.label} className="flex-1 bg-white/4 border border-white/6 rounded-lg p-2 text-center">
                <div className="text-xs font-black text-white">{o.val.toFixed(2)}</div>
                <div className="text-[9px] text-slate-600">{o.label}</div>
              </div>
            ) : null)}
          </div>
        )}
      </div>

      <div className="px-4">
        {visibleBks.map(bk => (
          <BookmakerRowView key={bk.bookmakerName} bk={bk} market={market} best={data.best} />
        ))}
      </div>

      {data.bookmakers.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full p-3 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 border-t border-[#111827] transition-colors">
          {expanded
            ? <><ChevronUp size={12} /> Mostrar menos</>
            : <><ChevronDown size={12} /> Ver todas as casas ({data.bookmakers.length})</>}
        </button>
      )}
    </div>
  );
}

interface Props { matchOddsData: MatchOddsData[] }

export function OddsClient({ matchOddsData }: Props) {
  const [market, setMarket] = useState<MarketTab>('1X2');

  if (matchOddsData.length === 0) {
    return (
      <div className="p-5 lg:p-7 max-w-[1280px] mx-auto">
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-600">
          <AlertCircle size={40} className="opacity-30" />
          <p className="text-sm text-center max-w-xs">
            Odds serão importadas após o sync.
            <br />Execute <code className="text-emerald-500">/api/sync/odds</code> para popular os dados.
          </p>
        </div>
      </div>
    );
  }

  const avgData = matchOddsData.map(m => ({
    name: `${m.match.homeTeam.code} vs ${m.match.awayTeam.code}`,
    Casa:   +(m.avgImplied.home * 100).toFixed(1),
    Empate: +(m.avgImplied.draw * 100).toFixed(1),
    Fora:   +(m.avgImplied.away * 100).toFixed(1),
  }));

  const bookmakerNames = [...new Set(matchOddsData.flatMap(m => m.bookmakers.map(b => b.bookmakerName)))];
  const sharpNames = matchOddsData
    .flatMap(m => m.bookmakers.filter(b => b.isSharp).map(b => b.bookmakerName));

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
            <BadgeDollarSign size={20} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-xl font-black text-white">Odds</h1>
            <p className="text-xs text-slate-500">Comparação entre {bookmakerNames.join(', ')}</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Badge variant="purple"><Scale size={11} /> {bookmakerNames.length} casas</Badge>
          {sharpNames.length > 0 && (
            <Badge variant="amber"><Star size={11} /> {sharpNames[0]} sharp</Badge>
          )}
        </div>
      </div>

      {/* Market average chart */}
      <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <Scale size={15} className="text-purple-400" />
          <span className="text-sm font-bold text-white">Probabilidade Implícita — Média de Mercado</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <LineChart data={avgData}>
            <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: '#475569', fontSize: 10 }} tickLine={false} axisLine={false} unit="%" />
            <Tooltip
              contentStyle={{ background: '#0d1117', border: '1px solid #1e2d3d', borderRadius: 8, fontSize: 12 }}
              formatter={(v) => [`${v}%`]}
            />
            <Line type="monotone" dataKey="Casa"   stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            <Line type="monotone" dataKey="Empate" stroke="#64748b" strokeWidth={2} dot={{ fill: '#64748b', r: 4 }} />
            <Line type="monotone" dataKey="Fora"   stroke="#a855f7" strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2 justify-center text-[11px] text-slate-500">
          {[['Casa','#3b82f6'],['Empate','#64748b'],['Fora','#a855f7']].map(([l,c]) => (
            <span key={l} className="flex items-center gap-1.5">
              <span style={{ background: c, width: 10, height: 2, display: 'inline-block', borderRadius: 2 }} />
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* Market tabs */}
      <div className="flex gap-1 p-1 bg-[#0d1117] border border-[#1e2d3d] rounded-xl w-fit">
        {(['1X2','OU_25','BTTS'] as MarketTab[]).map(m => (
          <button key={m} onClick={() => setMarket(m)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
              market === m
                ? 'bg-purple-500/15 text-purple-400 border border-purple-500/25'
                : 'text-slate-500 hover:text-slate-300'
            }`}>
            {m === '1X2' ? '1X2' : m === 'OU_25' ? 'Over/Under' : 'BTTS'}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="grid gap-5 lg:grid-cols-2">
        {matchOddsData.map(data => (
          <MatchOddsCard key={data.matchId} data={data} market={market} />
        ))}
      </div>
    </div>
  );
}
