import { prisma } from '@/lib/prisma';
import { flagUrl } from '@/lib/flag';

function statusLabel(status: string, isLive: boolean, minute: number | null) {
  if (isLive) return { text: `AO VIVO${minute ? ` • ${minute}'` : ''}`, color: '#ef4444', live: true };
  if (status === 'FINISHED') return { text: 'ENCERRADO', color: '#4b5563', live: false };
  return { text: 'AGENDADO', color: '#374151', live: false };
}

function formatTime(dt: Date) {
  return dt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
}

function formatDate(dt: Date) {
  return dt.toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short', timeZone: 'America/Sao_Paulo' });
}

function groupByDate(matches: Awaited<ReturnType<typeof loadMatches>>) {
  const map = new Map<string, typeof matches>();
  for (const m of matches) {
    const key = m.datetimeUtc.toISOString().slice(0, 10);
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(m);
  }
  return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
}

async function loadMatches() {
  return prisma.match.findMany({
    orderBy: { datetimeUtc: 'asc' },
    include: { homeTeam: true, awayTeam: true, group: true, stage: true },
    take: 120,
  });
}

export default async function CalendarioPage() {
  const matches = await loadMatches();
  const liveCount = matches.filter((m) => m.isLive).length;
  const todayKey = new Date().toISOString().slice(0, 10);
  const todayMatches = matches.filter((m) => m.datetimeUtc.toISOString().slice(0, 10) === todayKey);
  const nextMatch = matches.find((m) => m.status === 'SCHEDULED');
  const grouped = groupByDate(matches);

  return (
    <div>
      {/* Stats bar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        {[
          {
            icon: '⚡', label: 'Ao Vivo', value: `${liveCount} Partida${liveCount !== 1 ? 's' : ''}`,
            accent: liveCount > 0 ? '#ef4444' : '#374151', bg: liveCount > 0 ? 'rgba(239,68,68,0.08)' : '#0f172a',
          },
          {
            icon: '📅', label: 'Hoje', value: `${todayMatches.length} Jogo${todayMatches.length !== 1 ? 's' : ''}`,
            accent: '#22c55e', bg: 'rgba(34,197,94,0.06)',
          },
          {
            icon: '⏱', label: 'Próximo',
            value: nextMatch ? formatTime(nextMatch.datetimeUtc) : '—',
            accent: '#f59e0b', bg: 'rgba(245,158,11,0.06)',
          },
          {
            icon: '🏆', label: 'Total', value: `${matches.length} Jogos`,
            accent: '#3b82f6', bg: 'rgba(59,130,246,0.06)',
          },
        ].map((s) => (
          <div key={s.label} style={{
            flex: '1 1 160px', background: s.bg, border: `1px solid ${s.accent}22`,
            borderRadius: 14, padding: '1rem 1.25rem',
            display: 'flex', alignItems: 'center', gap: '0.85rem',
          }}>
            <span style={{ fontSize: '1.4rem' }}>{s.icon}</span>
            <div>
              <div style={{ fontSize: '0.7rem', color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{s.label}</div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1.2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Matches by date */}
      {grouped.map(([dateKey, dayMatches]) => (
        <section key={dateKey} style={{ marginBottom: '2.5rem' }}>
          <div style={{
            fontSize: '0.75rem', fontWeight: 700, color: '#6b7280',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            marginBottom: '0.85rem', paddingBottom: '0.5rem',
            borderBottom: '1px solid #1a1a1a',
          }}>
            {formatDate(dayMatches[0].datetimeUtc)}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '0.75rem',
          }}>
            {dayMatches.map((match) => {
              const s = statusLabel(match.status, match.isLive, match.minute);
              const finished = match.status === 'FINISHED';
              return (
                <div key={match.id} style={{
                  background: match.isLive ? 'rgba(239,68,68,0.05)' : '#0d1117',
                  border: match.isLive ? '1px solid rgba(239,68,68,0.25)' : '1px solid #1e293b',
                  borderRadius: 14, padding: '1rem 1.25rem',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}>
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.65rem', color: '#4b5563', fontWeight: 600, letterSpacing: '0.05em' }}>
                      {match.stage.name.toUpperCase()}{match.group ? ` • GRUPO ${match.group.code}` : ''}
                    </span>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, color: s.color,
                      display: 'flex', alignItems: 'center', gap: '0.3rem',
                    }}>
                      {s.live && (
                        <span style={{
                          width: 6, height: 6, borderRadius: '50%', background: '#ef4444',
                          display: 'inline-block', animation: 'pulse 1.5s infinite',
                        }} />
                      )}
                      {s.text}
                    </span>
                  </div>

                  {/* Teams & Score */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    {/* Home */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {(() => {
                        const url = flagUrl(match.homeTeam.code, 80);
                        return url ? (
                          <img src={url} alt={match.homeTeam.code} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4, marginBottom: '0.3rem', border: '1px solid rgba(255,255,255,0.08)' }} />
                        ) : (
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.15rem' }}>{match.homeTeam.emoji}</div>
                        );
                      })()}
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em' }}>
                        {match.homeTeam.code}
                      </div>
                    </div>

                    {/* Score */}
                    <div style={{ textAlign: 'center', minWidth: 80 }}>
                      {finished || match.isLive ? (
                        <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.05em' }}>
                          {match.homeScore} <span style={{ color: '#374151' }}>×</span> {match.awayScore}
                        </div>
                      ) : (
                        <div style={{ color: '#374151', fontSize: '0.9rem', fontWeight: 700 }}>
                          {formatTime(match.datetimeUtc)}
                        </div>
                      )}
                    </div>

                    {/* Away */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                      {(() => {
                        const url = flagUrl(match.awayTeam.code, 80);
                        return url ? (
                          <img src={url} alt={match.awayTeam.code} style={{ width: 44, height: 30, objectFit: 'cover', borderRadius: 4, marginBottom: '0.3rem', border: '1px solid rgba(255,255,255,0.08)' }} />
                        ) : (
                          <div style={{ fontSize: '1.5rem', marginBottom: '0.15rem' }}>{match.awayTeam.emoji}</div>
                        );
                      })()}
                      <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em' }}>
                        {match.awayTeam.code}
                      </div>
                    </div>
                  </div>

                  {/* Venue */}
                  <div style={{ fontSize: '0.65rem', color: '#374151', textAlign: 'center' }}>
                    📍 {match.venue !== 'TBD' ? match.venue : match.city}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
