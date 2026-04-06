'use client';

import { useState } from 'react';
import { BadgeDollarSign, Star, TrendingDown, Scale, ChevronDown, ChevronUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Badge } from '@/components/ui/badge';
import { flagUrl } from '@/lib/flag';
import { MOCK_MATCHES, MOCK_ODDS, type BookmakerOdds } from '@/data/mock';

type MarketTab = '1X2' | 'OU_25' | 'BTTS';

// ── Bookmaker row ─────────────────────────────────────────────────────────────

function BookmakerRow({
  bk, market, best,
}: { bk: BookmakerOdds; market: MarketTab; best: Record<string, number> }) {
  const getOdds = () => {
    if (market === '1X2')  return [
      { key: 'home',  label: 'Casa',    val: bk.home  },
      { key: 'draw',  label: 'Empate',  val: bk.draw  },
      { key: 'away',  label: 'Fora',    val: bk.away  },
    ];
    if (market === 'OU_25') return [
      { key: 'over25',  label: 'Over 2.5',  val: bk.over25  },
      { key: 'under25', label: 'Under 2.5', val: bk.under25 },
    ];
    return [
      { key: 'bttsYes', label: 'Sim', val: bk.bttsYes },
      { key: 'bttsNo',  label: 'Não', val: bk.bttsNo  },
    ];
  };

  const odds = getOdds();
  const implied = odds.map(o => ({ ...o, impl: +(100 / o.val).toFixed(1) }));

  return (
    <div className="flex items-center gap-4 py-3.5 border-b border-[#111827] last:border-0">
      <div className="flex items-center gap-2 w-28 shrink-0">
        {bk.isSharp && <Star size={11} className="text-amber-400 shrink-0" />}
        <span className={`text-sm font-bold ${bk.isSharp ? 'text-amber-300' : 'text-slate-300'}`}>
          {bk.bookmaker}
        </span>
        {bk.isSharp && <Badge variant="amber" className="text-[9px] px-1 py-0">Sharp</Badge>}
      </div>
      <div className="flex-1 flex gap-3 flex-wrap">
        {implied.map(o => {
          const isBest = best[o.key] === o.val;
          return (
            <div key={o.key} className={`rounded-lg px-3 py-2 border text-center min-w-[72px] transition-all ${
              isBest
                ? 'bg-emerald-500/10 border-emerald-500/25 shadow-[0_0_8px_rgba(16,185,129,0.12)]'
                : 'bg-white/3 border-white/6'
            }`}>
              <div className={`text-base font-black ${isBest ? 'text-emerald-300' : 'text-slate-200'}`}>
                {o.val.toFixed(2)}
                {isBest && <span className="text-[9px] font-semibold text-emerald-500 ml-1">BEST</span>}
              </div>
              <div className="text-[9px] text-slate-600 mt-0.5">{o.impl}% impl.</div>
              <div className="text-[9px] text-slate-500">{o.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Match odds card ───────────────────────────────────────────────────────────

function MatchOddsCard({ matchId, market }: { matchId: string; market: MarketTab }) {
  const [expanded, setExpanded] = useState(false);
  const match  = MOCK_MATCHES.find(m => m.id === matchId);
  const oddsData = MOCK_ODDS.find(o => o.matchId === matchId);
  if (!match || !oddsData) return null;

  const hUrl = flagUrl(match.homeTeam.code, 40);
  const aUrl = flagUrl(match.awayTeam.code, 40);

  const best = {
    home:    oddsData.best.home,
    draw:    oddsData.best.draw,
    away:    oddsData.best.away,
    over25:  oddsData.best.over25,
    under25: oddsData.best.under25,
    bttsYes: oddsData.best.bttsYes,
  };

  // Implied probability disparity = potential value
  const homeDiff  = (100/oddsData.best.home - oddsData.averageImplied.home*100);
  const hasDisparity = Math.abs(homeDiff) > 1;

  return (
    <div className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl overflow-hidden hover:border-slate-700 transition-colors">
      {/* Match header */}
      <div className="p-4 border-b border-[#1e2d3d]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest">{match.roundLabel}</span>
          <div className="flex items-center gap-2">
            {hasDisparity && <Badge variant="value"><TrendingDown size={9} /> Dispersão detectada</Badge>}
            <span className="text-[10px] text-slate-600">{oddsData.capturedAt.slice(0, 10)}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 flex-1">
            {hUrl && <img src={hUrl} alt={match.homeTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
            <span className="font-bold text-white text-sm">{match.homeTeam.shortName}</span>
          </div>
          <span className="text-slate-600 text-sm font-light">vs</span>
          <div className="flex items-center gap-2 flex-1 justify-end">
            <span className="font-bold text-white text-sm">{match.awayTeam.shortName}</span>
            {aUrl && <img src={aUrl} alt={match.awayTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2 }} />}
          </div>
        </div>

        {/* Best odds summary */}
        {market === '1X2' && (
          <div className="mt-3 flex gap-2">
            {[
              { label: match.homeTeam.code, val: best.home  },
              { label: 'X',                val: best.draw  },
              { label: match.awayTeam.code,val: best.away  },
            ].map(o => (
              <div key={o.label} className="flex-1 bg-white/4 border border-white/6 rounded-lg p-2 text-center">
                <div className="text-xs font-black text-white">{o.val.toFixed(2)}</div>
                <div className="text-[9px] text-slate-600">{o.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bookmakers */}
      <div className="px-4">
        {expanded
          ? oddsData.bookmakers.map(bk => (
              <BookmakerRow key={bk.bookmaker} bk={bk} market={market} best={best} />
            ))
          : oddsData.bookmakers.slice(0, 2).map(bk => (
              <BookmakerRow key={bk.bookmaker} bk={bk} market={market} best={best} />
            ))
        }
      </div>
      {oddsData.bookmakers.length > 2 && (
        <button onClick={() => setExpanded(!expanded)}
          className="w-full p-3 text-xs text-slate-500 hover:text-slate-300 flex items-center justify-center gap-1 border-t border-[#111827] transition-colors">
          {expanded ? <><ChevronUp size={12} /> Mostrar menos</> : <><ChevronDown size={12} /> Ver todas as casas</>}
        </button>
      )}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function OddsPage() {
  const [market, setMarket] = useState<MarketTab>('1X2');

  const matchIds = MOCK_ODDS.map(o => o.matchId);

  // Market average data for chart
  const avgData = MOCK_ODDS.map(o => {
    const m = MOCK_MATCHES.find(x => x.id === o.matchId);
    return {
      name: m ? `${m.homeTeam.code} vs ${m.awayTeam.code}` : o.matchId,
      Casa: +(100/o.best.home).toFixed(1),
      Empate: +(100/o.best.draw).toFixed(1),
      Fora: +(100/o.best.away).toFixed(1),
    };
  });

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
            <p className="text-xs text-slate-500">Comparação entre Bet365, Pinnacle e Unibet</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <Badge variant="purple"><Scale size={11} /> 3 casas</Badge>
          <Badge variant="amber"><Star size={11} /> Pinnacle sharp</Badge>
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
              formatter={(v: number, name: string) => [`${v}%`, name]}
            />
            <Line type="monotone" dataKey="Casa"   stroke="#3b82f6"  strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
            <Line type="monotone" dataKey="Empate" stroke="#64748b"  strokeWidth={2} dot={{ fill: '#64748b', r: 4 }} />
            <Line type="monotone" dataKey="Fora"   stroke="#a855f7"  strokeWidth={2} dot={{ fill: '#a855f7', r: 4 }} />
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
        {matchIds.map(id => <MatchOddsCard key={id} matchId={id} market={market} />)}
      </div>
    </div>
  );
}
