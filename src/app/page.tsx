const sections = [
  {
    label: 'Health',
    color: '#10b981',
    routes: [
      { method: 'GET', path: '/api/healthz', desc: 'Database & Redis status' },
    ],
  },
  {
    label: 'Competition',
    color: '#3b82f6',
    routes: [
      { method: 'GET', path: '/api/competitions', desc: 'List all competitions' },
      { method: 'GET', path: '/api/competitions/current', desc: 'Current competition' },
      { method: 'GET', path: '/api/competitions/:id', desc: 'Competition by ID' },
      { method: 'GET', path: '/api/competition/current-stage', desc: 'Active stage' },
    ],
  },
  {
    label: 'Groups',
    color: '#8b5cf6',
    routes: [
      { method: 'GET', path: '/api/groups', desc: 'All 12 groups' },
      { method: 'GET', path: '/api/groups/:code', desc: 'Group + teams' },
      { method: 'GET', path: '/api/groups/:code/standings', desc: 'Group standings' },
    ],
  },
  {
    label: 'Teams',
    color: '#f59e0b',
    routes: [
      { method: 'GET', path: '/api/teams', desc: 'All 48 teams' },
      { method: 'GET', path: '/api/teams/:id', desc: 'Team detail' },
      { method: 'GET', path: '/api/teams/:id/matches', desc: 'Team schedule' },
      { method: 'GET', path: '/api/teams/:id/path', desc: 'Knockout path' },
    ],
  },
  {
    label: 'Matches',
    color: '#06b6d4',
    routes: [
      { method: 'GET', path: '/api/matches', desc: 'All matches (filterable)' },
      { method: 'GET', path: '/api/matches/live', desc: 'Live right now' },
      { method: 'GET', path: '/api/matches/today', desc: "Today's matches" },
      { method: 'GET', path: '/api/matches/upcoming', desc: 'Next scheduled' },
      { method: 'GET', path: '/api/matches/results', desc: 'Finished matches' },
      { method: 'GET', path: '/api/matches/:id', desc: 'Match detail' },
    ],
  },
  {
    label: 'Standings',
    color: '#ec4899',
    routes: [
      { method: 'GET', path: '/api/standings', desc: 'All group standings' },
      { method: 'GET', path: '/api/standings/:code', desc: 'Standings by group' },
    ],
  },
  {
    label: 'Knockout',
    color: '#f97316',
    routes: [
      { method: 'GET', path: '/api/knockout', desc: 'All knockout slots' },
      { method: 'GET', path: '/api/knockout/bracket', desc: 'Full bracket by stage' },
      { method: 'GET', path: '/api/knockout/path/:teamId', desc: 'Team bracket path' },
    ],
  },
  {
    label: 'Simulator',
    color: '#a78bfa',
    routes: [
      { method: 'POST', path: '/api/simulator/standings', desc: 'Simulate standings' },
      { method: 'POST', path: '/api/simulator/knockout', desc: 'Simulate bracket' },
      { method: 'POST', path: '/api/simulator/full', desc: 'Full simulation' },
      { method: 'POST', path: '/api/simulator/team-path', desc: 'Team scenario path' },
    ],
  },
  {
    label: 'Sync',
    color: '#64748b',
    badge: 'CRON_SECRET required',
    routes: [
      { method: 'POST', path: '/api/sync/competitions', desc: 'Sync competition status' },
      { method: 'POST', path: '/api/sync/teams', desc: 'Sync teams' },
      { method: 'POST', path: '/api/sync/matches', desc: 'Sync all matches' },
      { method: 'POST', path: '/api/sync/live', desc: 'Sync live matches' },
      { method: 'POST', path: '/api/sync/standings', desc: 'Recompute standings' },
      { method: 'POST', path: '/api/sync/knockout', desc: 'Rebuild bracket' },
      { method: 'POST', path: '/api/sync/current-stage', desc: 'Update active stage' },
    ],
  },
] as const;

const stats = [
  { value: '48', label: 'Teams' },
  { value: '12', label: 'Groups' },
  { value: '72', label: 'Matches' },
  { value: '30+', label: 'Endpoints' },
];

const tags = ['Next.js 15', 'Prisma', 'PostgreSQL', 'Upstash Redis', 'Vercel'];

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }}>

      {/* Header */}
      <header style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span style={{ fontSize: '2rem' }}>⚽</span>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.03em', color: '#f8fafc' }}>
            GoalForge
          </h1>
        </div>
        <p style={{ color: '#94a3b8', fontSize: '1.05rem', marginBottom: '1.25rem' }}>
          World Cup 2026 Tracker &amp; Simulator — REST API
        </p>

        {/* Tech tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '2rem' }}>
          {tags.map((tag) => (
            <span key={tag} style={{
              fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.6rem',
              borderRadius: 99, border: '1px solid #1e293b', color: '#64748b',
              letterSpacing: '0.03em',
            }}>
              {tag}
            </span>
          ))}
          <span style={{
            fontSize: '0.72rem', fontWeight: 600, padding: '0.25rem 0.6rem',
            borderRadius: 99, border: '1px solid #1e3a2f', color: '#34d399',
            letterSpacing: '0.03em',
          }}>
            by lypecs
          </span>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          {stats.map((s) => (
            <div key={s.label} style={{
              background: '#0f172a', border: '1px solid #1e293b',
              borderRadius: 12, padding: '0.9rem 1.4rem', minWidth: 90, textAlign: 'center',
            }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
                {s.value}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', fontWeight: 500 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </header>

      {/* Endpoint grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
        gap: '1rem',
      }}>
        {sections.map((section) => (
          <div key={section.label} style={{
            background: '#0d1117',
            border: '1px solid #1e293b',
            borderRadius: 16,
            overflow: 'hidden',
          }}>
            {/* Card header */}
            <div style={{
              padding: '0.85rem 1.1rem',
              borderBottom: '1px solid #1e293b',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: section.color, display: 'inline-block', flexShrink: 0,
                }} />
                <span style={{ fontWeight: 700, fontSize: '0.8rem', letterSpacing: '0.08em', color: '#cbd5e1' }}>
                  {section.label.toUpperCase()}
                </span>
              </div>
              {'badge' in section && (
                <span style={{
                  fontSize: '0.65rem', fontWeight: 600, padding: '0.15rem 0.5rem',
                  borderRadius: 99, background: '#1e293b', color: '#64748b',
                }}>
                  {section.badge}
                </span>
              )}
            </div>

            {/* Routes */}
            <div style={{ padding: '0.4rem 0' }}>
              {section.routes.map((route) => (
                <div key={route.path} style={{
                  display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.55rem 1.1rem',
                  transition: 'background 0.15s',
                }}>
                  <span style={{
                    fontSize: '0.65rem', fontWeight: 700,
                    color: route.method === 'GET' ? '#3b82f6' : '#10b981',
                    minWidth: 34, textAlign: 'right', letterSpacing: '0.05em',
                  }}>
                    {route.method}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '0.8rem', fontFamily: 'monospace',
                      color: '#e2e8f0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {route.path}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '0.05rem' }}>
                      {route.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <footer style={{
        marginTop: '3rem', paddingTop: '1.5rem',
        borderTop: '1px solid #1e293b',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '0.5rem',
      }}>
        <span style={{ color: '#334155', fontSize: '0.8rem' }}>
          GoalForge — forged for the beautiful game
        </span>
        <a href="https://github.com/lyp3z/previsao-FIFAWC"
          style={{ color: '#334155', fontSize: '0.8rem' }}
          target="_blank" rel="noopener noreferrer">
          github.com/lyp3z/previsao-FIFAWC
        </a>
      </footer>
    </div>
  );
}
