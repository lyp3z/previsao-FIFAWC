import Link from 'next/link';
import {
  Radio, CalendarDays, BarChart3, Gem, TrendingUp,
  ArrowRight, Zap, Trophy, Activity,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ProgressBar } from '@/components/ui/progress';
import { MatchCard } from '@/components/shared/MatchCard';
import { flagUrl } from '@/lib/flag';
import {
  MOCK_MATCHES, MOCK_INSIGHTS, MOCK_PROJECTIONS, MOCK_STATS,
} from '@/data/mock';

export default function DashboardPage() {
  const liveMatches = MOCK_MATCHES.filter(m => m.status === 'LIVE');
  const todayMatches = MOCK_MATCHES.filter(m => m.status === 'SCHEDULED').slice(0, 4);
  const topInsights = MOCK_INSIGHTS.filter(i => i.isValueBet).slice(0, 3);

  return (
    <div className="p-5 lg:p-7 space-y-7 max-w-[1280px] mx-auto">

      {/* ── Hero ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden border border-[#1e2d3d]
        bg-gradient-to-br from-[#0d1117] via-[#0d1117] to-[#0a1520]">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(16,185,129,0.08),transparent)]" />
        <div className="relative px-6 py-8 md:px-8 md:py-10">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <Badge variant="value">
                  <Zap size={10} /> Fase de Grupos
                </Badge>
                <Badge variant="live">
                  <Radio size={10} /> {MOCK_STATS.matchesLive} ao vivo
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                Copa do Mundo 2026
              </h1>
              <p className="text-slate-400 text-sm max-w-md">
                Probabilidades em tempo real, odds comparadas e value bets para cada jogo da competição.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-3 md:grid-cols-3">
              {[
                { label: 'Jogos Hoje', value: MOCK_STATS.matchesToday, icon: CalendarDays, color: 'text-blue-400' },
                { label: 'Value Bets', value: MOCK_STATS.topValueBets, icon: Gem, color: 'text-emerald-400' },
                { label: 'Melhor EV', value: `+${(MOCK_STATS.bestEV * 100).toFixed(0)}%`, icon: TrendingUp, color: 'text-amber-400' },
              ].map(s => (
                <div key={s.label} className="bg-white/4 border border-white/8 rounded-xl p-3 text-center">
                  <s.icon size={18} className={cn('mx-auto mb-1', s.color)} />
                  <div className="text-xl font-black text-white">{s.value}</div>
                  <div className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Live matches ──────────────────────────────────── */}
      {liveMatches.length > 0 && (
        <section>
          <SectionHeader title="Ao Vivo Agora" icon={<Radio size={15} className="text-red-400" />} badge={<Badge variant="live">● {liveMatches.length}</Badge>} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </section>
      )}

      {/* ── Main grid ─────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-3">

        {/* Today matches (col 2/3) */}
        <div className="lg:col-span-2 space-y-4">
          <SectionHeader
            title="Próximos Jogos"
            icon={<CalendarDays size={15} className="text-blue-400" />}
            action={<Link href="/jogos" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver todos <ArrowRight size={12} /></Link>}
          />
          <div className="grid gap-3 sm:grid-cols-2">
            {todayMatches.map(m => <MatchCard key={m.id} match={m} />)}
          </div>
        </div>

        {/* Top value bets (col 1/3) */}
        <div className="space-y-4">
          <SectionHeader
            title="Top Value Bets"
            icon={<Gem size={15} className="text-emerald-400" />}
            action={<Link href="/value-bets" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver todos <ArrowRight size={12} /></Link>}
          />
          <div className="space-y-2">
            {topInsights.map(insight => (
              <Link key={insight.id} href="/value-bets"
                className="block bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4
                  hover:border-emerald-500/30 transition-all group">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                    <Gem size={14} className="text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-slate-200 truncate">
                      {insight.match.homeTeam.code} vs {insight.match.awayTeam.code}
                    </div>
                    <div className="text-[10px] text-slate-500 mt-0.5">
                      {insight.marketLabel} · {insight.selectionLabel}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-sm font-black text-white">{insight.offeredOdd.toFixed(2)}</span>
                      <Badge variant={insight.confidenceLabel === 'HIGH' ? 'strong-value' : 'value'}>
                        EV +{(insight.expectedValue * 100).toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
            <Link href="/value-bets"
              className="flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-[#1e2d3d]
                text-xs text-slate-500 hover:text-emerald-400 hover:border-emerald-500/30 transition-all">
              Ver todas as oportunidades <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Tournament projections ────────────────────────── */}
      <section>
        <SectionHeader
          title="Projeções de Título"
          icon={<Trophy size={15} className="text-amber-400" />}
          badge={<Badge variant="amber">Monte Carlo · 5k sims</Badge>}
          action={<Link href="/probabilidades" className="text-xs text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors">Ver detalhes <ArrowRight size={12} /></Link>}
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {MOCK_PROJECTIONS.slice(0, 8).map(p => {
            const url = flagUrl(p.team.code, 40);
            return (
              <Link key={p.teamId} href={`/times/${p.teamId}`}
                className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4
                  hover:border-slate-600 transition-all group">
                <div className="flex items-center gap-2.5 mb-3">
                  {url && <img src={url} alt={p.team.code} style={{ width: 28, height: 19, objectFit: 'cover', borderRadius: 3, border: '1px solid rgba(255,255,255,0.1)' }} />}
                  <div>
                    <div className="text-sm font-bold text-white">{p.team.shortName}</div>
                    <div className="text-[10px] text-slate-500">Grupo {p.team.group}</div>
                  </div>
                </div>
                <ProgressBar value={p.winTournament * 100} color="amber" size="sm" />
                <div className="flex justify-between items-center mt-1.5">
                  <span className="text-[10px] text-slate-600">Chance de título</span>
                  <span className="text-xs font-bold text-amber-400">{(p.winTournament * 100).toFixed(1)}%</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-1 text-[10px] text-slate-600">
                  <span>Semi: <span className="text-slate-400">{(p.reachSemiFinal * 100).toFixed(0)}%</span></span>
                  <span>Final: <span className="text-slate-400">{(p.reachFinal * 100).toFixed(0)}%</span></span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Quick access bar ──────────────────────────────── */}
      <section>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/probabilidades', label: 'Probabilidades', desc: 'Modelo Poisson', icon: BarChart3, color: 'from-blue-500/10 to-blue-500/5 border-blue-500/20 text-blue-400' },
            { href: '/odds',           label: 'Odds',           desc: '3 casas comparadas', icon: Activity,  color: 'from-purple-500/10 to-purple-500/5 border-purple-500/20 text-purple-400' },
            { href: '/value-bets',     label: 'Value Bets',     desc: 'Oportunidades hoje', icon: Gem,       color: 'from-emerald-500/10 to-emerald-500/5 border-emerald-500/20 text-emerald-400' },
            { href: '/simulador',      label: 'Simulador',      desc: 'Projetar cenários', icon: Zap,       color: 'from-amber-500/10 to-amber-500/5 border-amber-500/20 text-amber-400' },
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

// ── Helper ────────────────────────────────────────────────────────────────────

function cn(...classes: (string | undefined | false)[]) {
  return classes.filter(Boolean).join(' ');
}

function SectionHeader({ title, icon, badge, action }: {
  title: string; icon?: React.ReactNode;
  badge?: React.ReactNode; action?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      {icon}
      <h2 className="text-sm font-bold text-white">{title}</h2>
      {badge}
      <div className="flex-1" />
      {action}
    </div>
  );
}
