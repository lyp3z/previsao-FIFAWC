import { prisma } from '@/lib/prisma';
import { computeGroupStandings } from '@/modules/standings/service';
import { flagUrl } from '@/lib/flag';

async function loadGroups() {
  return prisma.group.findMany({
    where: { competitionId: 'wc_2026' },
    orderBy: { order: 'asc' },
    include: {
      teams: true,
      matches: {
        where: { stageId: 'stage_group' },
        include: { homeTeam: true, awayTeam: true },
        orderBy: { datetimeUtc: 'asc' },
      },
    },
  });
}

const qualColor = {
  QUALIFIED: '#22c55e',
  PLAYOFF: '#f59e0b',
  ELIMINATED: '#ef4444',
  TBD: '#374151',
} as const;

export default async function GruposPage() {
  const groups = await loadGroups();

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
        Fase de Grupos
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '2rem' }}>
        48 seleções · 12 grupos · 2 classificados + 8 melhores terceiros
      </p>

      <div className="group-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
        gap: '1.25rem',
      }}>
        {groups.map((group) => {
          const standings = computeGroupStandings(group.teams, group.matches);
          return (
            <div key={group.id} style={{
              background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden',
            }}>
              {/* Group header */}
              <div style={{
                padding: '0.75rem 1rem', background: '#0a0f1a',
                borderBottom: '1px solid #1e293b',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                  Grupo {group.code}
                </span>
                <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: 600 }}>
                  {group.matches.length} jogos
                </span>
              </div>

              {/* Standings table */}
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ fontSize: '0.62rem', color: '#4b5563', fontWeight: 700, letterSpacing: '0.05em' }}>
                    <th style={{ padding: '0.5rem 0.85rem', textAlign: 'left' }}>#</th>
                    <th style={{ padding: '0.5rem 0', textAlign: 'left' }}>Equipe</th>
                    {['PTS', 'PJ'].map((h) => (
                      <th key={h} style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>{h}</th>
                    ))}
                    {['VIT', 'E', 'DER', 'GM', 'GC'].map((h) => (
                      <th key={h} className="col-hide-mobile" style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>{h}</th>
                    ))}
                    <th style={{ padding: '0.5rem 0.5rem', textAlign: 'center' }}>SG</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((row, idx) => {
                    const qColor = qualColor[row.qualificationStatus];
                    return (
                      <tr key={row.teamId} style={{
                        borderTop: '1px solid #0f172a',
                        background: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)',
                      }}>
                        <td style={{ padding: '0.6rem 0.85rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{
                              width: 3, height: 18, background: qColor,
                              borderRadius: 2, display: 'inline-block', flexShrink: 0,
                            }} />
                            <span style={{ fontSize: '0.75rem', color: '#6b7280', fontWeight: 700 }}>
                              {row.position}
                            </span>
                          </div>
                        </td>
                        <td style={{ padding: '0.6rem 0', minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            {(() => {
                              const url = flagUrl(row.team.code, 40);
                              return url ? (
                                <img src={url} alt={row.team.code} style={{ width: 26, height: 18, objectFit: 'cover', borderRadius: 3, flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }} />
                              ) : (
                                <span style={{ fontSize: '1rem' }}>{row.team.emoji}</span>
                              );
                            })()}
                            <div>
                              <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0' }}>
                                {row.team.shortName}
                              </div>
                              <div style={{ fontSize: '0.62rem', color: '#4b5563' }}>
                                {row.team.code}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center' }}>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc' }}>
                            {row.points}
                          </span>
                        </td>
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>{row.played}</td>
                        {[row.wins, row.draws, row.losses, row.goalsFor, row.goalsAgainst].map((v, i) => (
                          <td key={i} className="col-hide-mobile" style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>
                            {v}
                          </td>
                        ))}
                        <td style={{ padding: '0.6rem 0.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#94a3b8' }}>{row.goalDifference}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {/* Legend */}
              <div style={{ padding: '0.5rem 0.85rem', borderTop: '1px solid #0f172a', display: 'flex', gap: '1rem' }}>
                {[
                  { color: '#22c55e', label: 'Classificado' },
                  { color: '#f59e0b', label: '3º lugar' },
                ].map((l) => (
                  <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <span style={{ width: 3, height: 12, background: l.color, borderRadius: 2, display: 'inline-block' }} />
                    <span style={{ fontSize: '0.6rem', color: '#4b5563' }}>{l.label}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
