import Link from 'next/link';
import { Users } from 'lucide-react';
import { ProgressBar } from '@/components/ui/progress';
import { flagUrl } from '@/lib/flag';
import { prisma } from '@/lib/prisma';

export const runtime = 'nodejs';
export const revalidate = 300;

export default async function TimesPage() {
  const [teams, projections] = await Promise.all([
    prisma.team.findMany({
      include: { group: true },
      orderBy: { shortName: 'asc' },
    }),
    prisma.teamTournamentProjection.findMany({
      where: { competitionId: 'wc_2026' },
      orderBy: { winTournamentProbability: 'desc' },
    }),
  ]);

  const projMap = new Map(projections.map(p => [p.teamId, p]));

  // Sort: teams with projections first (by win probability), then alphabetical
  const sorted = [...teams].sort((a, b) => {
    const pa = projMap.get(a.id)?.winTournamentProbability ?? -1;
    const pb = projMap.get(b.id)?.winTournamentProbability ?? -1;
    return pb - pa;
  });

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
          <Users size={20} className="text-cyan-400" />
        </div>
        <div>
          <h1 className="text-xl font-black text-white">Seleções</h1>
          <p className="text-xs text-slate-500">{teams.length} seleções · Copa do Mundo 2026</p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((team) => {
          const proj = projMap.get(team.id);
          const url = flagUrl(team.code, 80);
          const groupCode = team.group?.code;

          return (
            <Link key={team.id} href={`/times/${team.id}`}
              className="bg-[#0d1117] border border-[#1e2d3d] rounded-xl p-4
                hover:border-emerald-500/25 hover:shadow-[0_0_16px_rgba(16,185,129,0.06)] transition-all group">

              <div className="flex items-center gap-3 mb-3">
                {url
                  ? <img src={url} alt={team.code} style={{ width: 36, height: 24, objectFit: 'cover', borderRadius: 4, border: '1px solid rgba(255,255,255,0.1)' }} />
                  : <span className="text-2xl">{team.emoji}</span>
                }
                <div>
                  <div className="font-bold text-sm text-white group-hover:text-emerald-300 transition-colors">
                    {team.shortName}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {groupCode ? `Grupo ${groupCode} · ` : ''}{team.code}
                  </div>
                </div>
              </div>

              {proj ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600">Chance de título</span>
                    <span className="text-xs font-black text-amber-400">{(proj.winTournamentProbability * 100).toFixed(1)}%</span>
                  </div>
                  <ProgressBar value={proj.winTournamentProbability * 100} color="amber" size="sm" />
                  <div className="grid grid-cols-3 gap-1 text-[9px] text-slate-600 pt-1">
                    <span>R16: <span className="text-slate-400">{(proj.reachRoundOf16Probability * 100).toFixed(0)}%</span></span>
                    <span>SF: <span className="text-slate-400">{(proj.reachSemiFinalProbability * 100).toFixed(0)}%</span></span>
                    <span>🏆: <span className="text-amber-400">{(proj.winTournamentProbability * 100).toFixed(0)}%</span></span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-600 mt-1">Sem projeção disponível</div>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
