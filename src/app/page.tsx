const endpoints = [
  { group: 'Health', routes: [{ method: 'GET', path: '/api/healthz' }] },
  {
    group: 'Competitions',
    routes: [
      { method: 'GET', path: '/api/competitions' },
      { method: 'GET', path: '/api/competitions/current' },
      { method: 'GET', path: '/api/competitions/:id' },
      { method: 'GET', path: '/api/competition/current-stage' },
    ],
  },
  {
    group: 'Groups',
    routes: [
      { method: 'GET', path: '/api/groups' },
      { method: 'GET', path: '/api/groups/:groupCode' },
      { method: 'GET', path: '/api/groups/:groupCode/standings' },
    ],
  },
  {
    group: 'Teams',
    routes: [
      { method: 'GET', path: '/api/teams' },
      { method: 'GET', path: '/api/teams/:id' },
      { method: 'GET', path: '/api/teams/:id/matches' },
      { method: 'GET', path: '/api/teams/:id/path' },
    ],
  },
  {
    group: 'Matches',
    routes: [
      { method: 'GET', path: '/api/matches' },
      { method: 'GET', path: '/api/matches/live' },
      { method: 'GET', path: '/api/matches/today' },
      { method: 'GET', path: '/api/matches/upcoming' },
      { method: 'GET', path: '/api/matches/results' },
      { method: 'GET', path: '/api/matches/:id' },
    ],
  },
  {
    group: 'Standings',
    routes: [
      { method: 'GET', path: '/api/standings' },
      { method: 'GET', path: '/api/standings/:groupCode' },
    ],
  },
  {
    group: 'Knockout',
    routes: [
      { method: 'GET', path: '/api/knockout' },
      { method: 'GET', path: '/api/knockout/bracket' },
      { method: 'GET', path: '/api/knockout/path/:teamId' },
    ],
  },
  {
    group: 'Simulator',
    routes: [
      { method: 'POST', path: '/api/simulator/standings' },
      { method: 'POST', path: '/api/simulator/knockout' },
      { method: 'POST', path: '/api/simulator/full' },
      { method: 'POST', path: '/api/simulator/team-path' },
    ],
  },
  {
    group: 'Sync (CRON_SECRET required)',
    routes: [
      { method: 'POST', path: '/api/sync/competitions' },
      { method: 'POST', path: '/api/sync/groups' },
      { method: 'POST', path: '/api/sync/teams' },
      { method: 'POST', path: '/api/sync/matches' },
      { method: 'POST', path: '/api/sync/live' },
      { method: 'POST', path: '/api/sync/standings' },
      { method: 'POST', path: '/api/sync/knockout' },
      { method: 'POST', path: '/api/sync/current-stage' },
    ],
  },
] as const;

export default function HomePage() {
  return (
    <main style={{ fontFamily: 'monospace', padding: '2rem', maxWidth: 720 }}>
      <h1 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>⚽ GoalForge</h1>
      <p style={{ color: '#666', marginBottom: '0.25rem' }}>World Cup 2026 Tracker &amp; Simulator API</p>
      <p style={{ color: '#999', fontSize: '0.8rem', marginBottom: '2rem' }}>
        Next.js · Prisma · PostgreSQL · Upstash Redis · Vercel &mdash; by{' '}
        <a href="https://github.com/lypecs" style={{ color: '#2563eb' }}>lypecs</a>
      </p>
      {endpoints.map((section) => (
        <section key={section.group} style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#999', marginBottom: '0.5rem' }}>
            {section.group}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {section.routes.map((r) => (
              <li key={r.path} style={{ display: 'flex', gap: '1rem', padding: '0.2rem 0', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', color: r.method === 'GET' ? '#2563eb' : '#16a34a', fontWeight: 700, minWidth: 36 }}>
                  {r.method}
                </span>
                <span style={{ fontSize: '0.875rem' }}>{r.path}</span>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
