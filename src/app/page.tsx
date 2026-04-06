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
          {m.roundLabel ?? m.group?.code ? `Grupo ${m.group?.code}` : m.stage?.name}
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
    <div className="p-5 lg:p-7 space-y-7 max-w-[1280px] mx-auto">

      {/* ── Hero ───────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e2d3d] bg-gradient-to-br from-[#0d1117] to-[#0a1520]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.08),transparent)]" />
        <div className="relative px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="value"><Zap size={10} /> Fase de Grupos</Badge>
              {live > 0 && <Badge variant="live"><Radio size={10} /> {live} ao vivo</Badge>}
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
              Copa do Mundo 2026
            </h1>
            <p className="text-slate-400 text-sm max-w-md">
              Probabilidades, odds e value bets em tempo real para todos os jogos da competição.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Jogos',    value: total,   icon: CalendarDays, color: 'text-blue-400'   },
              { label: 'Jogados',  value: played,  icon: Trophy,       color: 'text-amber-400'  },
              { label: 'Ao vivo',  value: live,    icon: Radio,        color: 'text-red-400'    },
            ].map(s => (
              <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center">
                <s.icon size={18} className={`mx-auto mb-1 ${s.color}`} />
                <div className="text-xl font-black text-white">{s.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Live matches ────────────────────────── */}
      {liveMatches.length > 0 && (
        <section>
          <SectionHeader title="Ao Vivo Agora" icon={<Radio size={15} className="text-red-400" />} badge={<Badge variant="live">● {liveMatches.length}</Badge>} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {(liveMatches as DbMatch[]).map(m => <MatchRow key={m.id} m={m} />)}
          </div>
        </section>
      )}

      {/* ── Main grid ───────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming */}
        <div className="lg:col-span-2 space-y-3">
          <SectionHeader
            title={played > 0 ? 'Próximos Jogos' : 'Todos os Jogos'}
            icon={<CalendarDays size={15} className="text-blue-400" />}
            action={<Link href="/jogos" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver todos <ArrowRight size={12} /></Link>}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {(upcomingMatches.slice(0, 4) as DbMatch[]).map(m => <MatchRow key={m.id} m={m} />)}
          </div>
        </div>

        {/* Right col: value bets or projections */}
        <div className="space-y-4">
          {topInsights.length > 0 ? (
            <>
              <SectionHeader
                title="Top Value Bets"
                icon={<Gem size={15} className="text-emerald-400" />}
                action={<Link href="/value-bets" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver todos <ArrowRight size={12} /></Link>}
              />
              <div className="space-y-2">
                {topInsights.map(i => {
                  const hUrl = flagUrl(i.match.homeTeam.code, 40);
                  const aUrl = flagUrl(i.match.awayTeam.code, 40);
                  return (
                    <Link key={i.id} href="/value-bets"
                      className="block bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4 hover:border-emerald-500/25 transition-all">
                      <div className="flex items-center gap-2 mb-2">
                        {hUrl && <img src={hUrl} alt="" style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 2 }} />}
                        <span className="text-xs text-slate-300 font-semibold">{i.match.homeTeam.code}</span>
                        <span className="text-slate-600 text-xs">vs</span>
                        <span className="text-xs text-slate-300 font-semibold">{i.match.awayTeam.code}</span>
                        {aUrl && <img src={aUrl} alt="" style={{ width: 20, height: 13, objectFit: 'cover', borderRadius: 2 }} />}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">{i.market.name} · {i.bookmaker.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white">{i.offeredOdd.toFixed(2)}</span>
                          <Badge variant="strong-value">EV +{(i.expectedValue * 100).toFixed(1)}%</Badge>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </>
          ) : (
            <div className="bg-[#0d1117] border border-dashed border-[#1e2d3d] rounded-xl p-5 text-center">
              <Gem size={28} className="mx-auto mb-2 text-emerald-500/30" />
              <p className="text-xs text-slate-600 mb-3">Value bets aparecerão aqui após o sync analítico</p>
              <Link href="/value-bets" className="text-xs text-emerald-500 hover:text-emerald-400 flex items-center justify-center gap-1">
                Ver página de Value Bets <ArrowRight size={11} />
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── Tournament projections ───────────────── */}
      {projections.length > 0 && (
        <section>
          <SectionHeader
            title="Projeções de Título"
            icon={<Trophy size={15} className="text-amber-400" />}
            badge={<Badge variant="amber">Monte Carlo</Badge>}
            action={<Link href="/probabilidades" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver detalhes <ArrowRight size={12} /></Link>}
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {projections.map(p => {
              const url = flagUrl(p.team.code, 40);
              return (
                <div key={p.id} className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4">
                  <div className="flex items-center gap-2.5 mb-3">
                    {url && <img src={url} alt={p.team.code} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }} />}
                    <div>
                      <div className="text-sm font-bold text-white">{p.team.shortName}</div>
                      <div className="text-[10px] text-slate-500">Grupo {p.team.groupId?.split('_')[1]?.toUpperCase()}</div>
                    </div>
                  </div>
                  <ProgressBar value={p.winTournamentProbability * 100} color="amber" size="sm" />
                  <div className="flex justify-between mt-1.5 text-[10px]">
                    <span className="text-slate-600">Chance de título</span>
                    <span className="font-bold text-amber-400">{(p.winTournamentProbability * 100).toFixed(1)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── Quick access ─────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/probabilidades', label: 'Probabilidades', desc: 'Modelo Poisson', icon: BarChart3,  color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400'     },
            { href: '/odds',           label: 'Odds',           desc: '3 casas',        icon: Activity,   color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400' },
            { href: '/value-bets',     label: 'Value Bets',     desc: 'Oportunidades',  icon: Gem,        color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
            { href: '/simulador',      label: 'Simulador',      desc: 'Projetar cenários', icon: Zap,     color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400'  },
          ].map(item => (
            <Link key={item.href} href={item.href}
              className={`bg-gradient-to-br ${item.color} border rounded-xl p-4 hover:scale-[1.02] transition-transform`}>
              <item.icon size={22} className="mb-2" />
              <div className="text-sm font-bold text-white">{item.label}</div>
              <div className="text-[11px] text-slate-500 mt-0.5">{item.desc}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
