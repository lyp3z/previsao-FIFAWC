import Link from 'next/link';
import {
  Radio, CalendarDays, BarChart3, Gem, TrendingUp,
  ArrowRight, Zap, Trophy, Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { flagUrl } from '@/lib/flag';
import { prisma } from '@/lib/prisma';
import { MatchStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const revalidate = 60; // revalidate every 60s

async function loadDashboardData() {
  const [liveMatches, upcomingMatches, recentMatches, topInsights, projections, stats] = await Promise.all([
    // Live matches
    prisma.match.findMany({
      where: { competitionId: 'wc_2026', status: MatchStatus.LIVE },
      include: { homeTeam: true, awayTeam: true, group: true, stage: true },
      orderBy: { datetimeUtc: 'asc' },
      take: 6,
    }),
    // Upcoming
    prisma.match.findMany({
      where: { competitionId: 'wc_2026', status: MatchStatus.SCHEDULED },
      include: { homeTeam: true, awayTeam: true, group: true, stage: true, prediction: true },
      orderBy: { datetimeUtc: 'asc' },
      take: 6,
    }),
    // Recent finished
    prisma.match.findMany({
      where: { competitionId: 'wc_2026', status: MatchStatus.FINISHED },
      include: { homeTeam: true, awayTeam: true, group: true },
      orderBy: { datetimeUtc: 'desc' },
      take: 4,
    }),
    // Top value bets
    prisma.bettingInsight.findMany({
      where: { isValueBet: true, match: { competitionId: 'wc_2026' } },
      include: {
        match: { include: { homeTeam: true, awayTeam: true } },
        bookmaker: true,
        market: true,
      },
      orderBy: { expectedValue: 'desc' },
      take: 3,
    }),
    // Tournament projections
    prisma.teamTournamentProjection.findMany({
      where: { competitionId: 'wc_2026' },
      include: { team: true },
      orderBy: { winTournamentProbability: 'desc' },
      take: 8,
    }),
    // Match counts
    prisma.match.groupBy({
      by: ['status'],
      where: { competitionId: 'wc_2026' },
      _count: true,
    }),
  ]);

  const total = stats.reduce((s, r) => s + r._count, 0);
  const played = stats.find(r => r.status === MatchStatus.FINISHED)?._count ?? 0;
  const live   = stats.find(r => r.status === MatchStatus.LIVE)?._count ?? 0;

  return { liveMatches, upcomingMatches, recentMatches, topInsights, projections, total, played, live };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

type DbMatch = Awaited<ReturnType<typeof loadDashboardData>>['upcomingMatches'][0];

function MatchRow({ m }: { m: DbMatch }) {
  const isLive = m.status === 'LIVE';
  const isFinished = m.status === 'FINISHED';
  const hUrl = flagUrl(m.homeTeam.code, 40);
  const aUrl = flagUrl(m.awayTeam.code, 40);
  const pred = (m as { prediction?: { homeWinProbability: number; drawProbability: number; awayWinProbability: number } }).prediction;

  return (
    <Link href={`/jogos`} className={`block rounded-xl border p-4 transition-all hover:border-emerald-500/25 group ${
      isLive ? 'bg-[#0d1117] border-red-500/25' : 'bg-[#0d1117] border-[#1e2d3d]'
    }`}>
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-widest truncate max-w-[140px]">
          {m.roundLabel ?? (m.group ? `Grupo ${m.group.code}` : m.stage?.name)}
        </span>
        <div className="flex items-center gap-2 shrink-0">
          {isLive    && <Badge variant="live">● {m.minute}'</Badge>}
          {isFinished && <Badge variant="finished">FT</Badge>}
          {!isLive && !isFinished && <span className="text-xs text-slate-600">{m.datetimeUtc.toISOString().slice(11,16)}</span>}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {hUrl && <img src={hUrl} alt={m.homeTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }} />}
          <span className="font-bold text-sm text-slate-200 truncate">{m.homeTeam.shortName}</span>
        </div>
        <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg ${isLive ? 'bg-red-500/10' : 'bg-white/5'}`}>
          <span className={`text-base font-black ${isLive ? 'text-red-300' : 'text-slate-200'}`}>{m.homeScore}</span>
          <span className="text-slate-700">:</span>
          <span className={`text-base font-black ${isLive ? 'text-red-300' : 'text-slate-200'}`}>{m.awayScore}</span>
        </div>
        <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
          <span className="font-bold text-sm text-slate-200 truncate text-right">{m.awayTeam.shortName}</span>
          {aUrl && <img src={aUrl} alt={m.awayTeam.code} style={{ width: 24, height: 16, objectFit: 'cover', borderRadius: 2, border: '1px solid rgba(255,255,255,0.08)' }} />}
        </div>
      </div>

      {pred && (
        <div className="mt-2.5 flex rounded-full overflow-hidden h-1">
          <div className="bg-blue-500"  style={{ width: `${pred.homeWinProbability * 100}%` }} />
          <div className="bg-slate-600" style={{ width: `${pred.drawProbability * 100}%` }} />
          <div className="bg-slate-500" style={{ width: `${pred.awayWinProbability * 100}%` }} />
        </div>
      )}
    </Link>
  );
}

function cn(...c: (string | undefined | false)[]) { return c.filter(Boolean).join(' '); }

function SectionHeader({ title, icon, badge, action }: {
  title: string; icon?: React.ReactNode; badge?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}<h2 className="text-sm font-bold text-white">{title}</h2>
      {badge}<div className="flex-1" />{action}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const { liveMatches, upcomingMatches, recentMatches, topInsights, projections, total, played, live } = await loadDashboardData();

  const allMatches = [...liveMatches, ...upcomingMatches.slice(0, 4), ...recentMatches.slice(0, 2)] as DbMatch[];

  return (
    <div className="max-w-7xl mx-auto px-5 lg:px-7 py-6 space-y-6">

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-[#0a1628] to-[#07090f] border border-white/[0.06]"
        style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}>
        {/* Glow accents */}
        <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full bg-emerald-500/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -right-10 w-64 h-64 rounded-full bg-blue-500/[0.06] blur-3xl pointer-events-none" />
        <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gradient-to-b from-emerald-500/0 via-emerald-500/60 to-emerald-500/0" />

        <div className="relative px-6 py-8 lg:px-8 flex flex-col lg:flex-row lg:items-center gap-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-bold text-emerald-400">
                <Zap size={9} /> Fase de Grupos
              </span>
              {live > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-[11px] font-bold text-red-400">
                  <Radio size={9} className="animate-pulse" /> {live} ao vivo
                </span>
              )}
            </div>
            <h1 className="text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight mb-2">
              Copa do Mundo<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">2026</span>
            </h1>
            <p className="text-slate-500 text-sm max-w-sm">
              Probabilidades, odds e value bets em tempo real para todos os jogos da competição.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 shrink-0">
            {[
              { label: 'Total',   value: total,  color: 'text-blue-400',   bg: 'bg-blue-500/8   border-blue-500/15'  },
              { label: 'Jogados', value: played, color: 'text-amber-400',  bg: 'bg-amber-500/8  border-amber-500/15' },
              { label: 'Ao vivo', value: live,   color: 'text-red-400',    bg: 'bg-red-500/8    border-red-500/15'   },
            ].map(s => (
              <div key={s.label} className={`${s.bg} border rounded-xl p-4 text-center min-w-[72px]`}>
                <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
                <div className="text-[10px] text-slate-600 uppercase tracking-wider mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Live matches */}
      {liveMatches.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Radio size={14} className="text-red-400 animate-pulse" />
            <h2 className="text-sm font-bold text-white">Ao Vivo Agora</h2>
            <span className="px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-[10px] font-bold text-red-400 ml-1">● {liveMatches.length}</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(liveMatches as DbMatch[]).map(m => <MatchRow key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {/* Main grid */}
      <div className="grid gap-5 lg:grid-cols-3">
        {/* Upcoming matches */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center gap-2 mb-3">
            <CalendarDays size={14} className="text-blue-400" />
            <h2 className="text-sm font-bold text-white">Próximos Jogos</h2>
            <Link href="/jogos" className="ml-auto text-[11px] text-slate-600 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Ver todos <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {(upcomingMatches.slice(0, 4) as DbMatch[]).map(m => <MatchRow key={m.id} m={m} />)}
          </div>
        </div>

        {/* Right col */}
        <div className="space-y-3">
          {topInsights.length > 0 ? (
            <>
              <div className="flex items-center gap-2 mb-3">
                <Gem size={14} className="text-emerald-400" />
                <h2 className="text-sm font-bold text-white">Top Value Bets</h2>
                <Link href="/value-bets" className="ml-auto text-[11px] text-slate-600 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  Ver <ArrowRight size={11} />
                </Link>
              </div>
              <div className="space-y-2">
                {topInsights.map(i => {
                  const hUrl = flagUrl(i.match.homeTeam.code, 40);
                  const aUrl = flagUrl(i.match.awayTeam.code, 40);
                  return (
                    <Link key={i.id} href="/value-bets"
                      className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.025] border border-white/[0.05] hover:border-emerald-500/20 hover:bg-emerald-500/[0.03] transition-all group">
                      <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        {hUrl && <img src={hUrl} alt="" style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }} />}
                        <span className="text-[11px] text-slate-400 font-medium truncate">{i.match.homeTeam.code} vs {i.match.awayTeam.code}</span>
                        {aUrl && <img src={aUrl} alt="" style={{ width: 18, height: 12, objectFit: 'cover', borderRadius: 2 }} />}
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-sm font-black text-white">{i.offeredOdd.toFixed(2)}</span>
                        <span className="px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                          +{(i.expectedValue * 100).toFixed(1)}%
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-white/[0.07] bg-white/[0.015] p-5 text-center">
              <Gem size={24} className="mx-auto mb-2 text-emerald-500/30" />
              <p className="text-xs text-slate-600 mb-3">Value bets após sync analítico</p>
              <Link href="/value-bets" className="text-xs text-emerald-500/70 hover:text-emerald-400 transition-colors flex items-center justify-center gap-1">
                Ver página <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Tournament projections */}
      {projections.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Trophy size={14} className="text-amber-400" />
            <h2 className="text-sm font-bold text-white">Projeções de Título</h2>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/15 text-[10px] font-bold text-amber-500 ml-1">Monte Carlo</span>
            <Link href="/probabilidades" className="ml-auto text-[11px] text-slate-600 hover:text-emerald-400 transition-colors flex items-center gap-1">
              Ver detalhes <ArrowRight size={11} />
            </Link>
          </div>
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {projections.map(p => {
              const url = flagUrl(p.team.code, 40);
              const pct = (p.winTournamentProbability * 100);
              return (
                <div key={p.id} className="bg-white/[0.025] border border-white/[0.05] rounded-xl p-4 hover:border-amber-500/15 transition-all">
                  <div className="flex items-center gap-2.5 mb-3">
                    {url && <img src={url} alt={p.team.code} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.08)' }} />}
                    <div>
                      <div className="text-sm font-bold text-white">{p.team.shortName}</div>
                    </div>
                    <div className="ml-auto text-sm font-black text-amber-400">{pct.toFixed(1)}%</div>
                  </div>
                  <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden">
                    <div className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-400" style={{ width: `${Math.min(pct * 6.25, 100)}%` }} />
                  </div>
                  <div className="text-[9px] text-slate-700 mt-1.5">Chance de título</div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Quick access */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { href: '/probabilidades', label: 'Probabilidades', desc: 'Modelo Poisson', icon: BarChart3,  from: 'from-blue-500/10',    border: 'border-blue-500/15',    text: 'text-blue-400'    },
          { href: '/odds',           label: 'Odds',           desc: '3 casas',        icon: Activity,   from: 'from-purple-500/10',  border: 'border-purple-500/15',  text: 'text-purple-400'  },
          { href: '/value-bets',     label: 'Value Bets',     desc: 'Oportunidades',  icon: Gem,        from: 'from-emerald-500/10', border: 'border-emerald-500/15', text: 'text-emerald-400' },
          { href: '/simulador',      label: 'Simulador',      desc: 'Projete cenários', icon: Zap,      from: 'from-amber-500/10',   border: 'border-amber-500/15',   text: 'text-amber-400'   },
        ].map(item => (
          <Link key={item.href} href={item.href}
            className={`bg-gradient-to-br ${item.from} to-transparent ${item.border} border rounded-xl p-4 hover:scale-[1.02] active:scale-[0.98] transition-all`}>
            <item.icon size={20} className={`${item.text} mb-2.5`} />
            <div className="text-sm font-bold text-white">{item.label}</div>
            <div className="text-[11px] text-slate-600 mt-0.5">{item.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
