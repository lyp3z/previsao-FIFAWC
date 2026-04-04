'use client';

import { useState } from 'react';

type Override = { matchId: string; homeScore: number; awayScore: number };
type Match = {
  id: string; homeTeam: { code: string; emoji: string }; awayTeam: { code: string; emoji: string };
  group: { code: string } | null; homeScore: number; awayScore: number; status: string;
};
type Group = { id: string; code: string; matches: Match[] };
type StandingRow = {
  teamId: string; team: { code: string; emoji: string; shortName: string };
  points: number; played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; position: number;
  qualificationStatus: string;
};
type SimResult = {
  standings: { groups: { groupCode: string; rows: StandingRow[] }[]; bestThird: { groupCode: string; row: StandingRow }[] };
  knockout: { round32: { slotCode: string; homeTeamId?: string; awayTeamId?: string }[] };
  summary: string;
};

const qualColor: Record<string, string> = {
  QUALIFIED: '#22c55e', PLAYOFF: '#f59e0b', ELIMINATED: '#4b5563', TBD: '#374151',
};

export default function SimuladorPage() {
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [result, setResult] = useState<SimResult | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<string>('A');
  const [simLoading, setSimLoading] = useState(false);

  async function loadGroups() {
    setLoading(true);
    const res = await fetch('/api/groups');
    const json = await res.json();
    const groupsWithMatches = await Promise.all(
      json.data.map(async (g: { code: string }) => {
        const r = await fetch(`/api/groups/${g.code}`);
        const d = await r.json();
        return d.data;
      })
    );
    setGroups(groupsWithMatches);
    setLoading(false);
  }

  function setScore(matchId: string, field: 'homeScore' | 'awayScore', value: string) {
    const num = Math.max(0, parseInt(value) || 0);
    setOverrides((prev) => ({
      ...prev,
      [matchId]: { ...prev[matchId], matchId, homeScore: prev[matchId]?.homeScore ?? 0, awayScore: prev[matchId]?.awayScore ?? 0, [field]: num },
    }));
  }

  async function simulate() {
    setSimLoading(true);
    setResult(null);
    const res = await fetch('/api/simulator/full', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ overrides: Object.values(overrides) }),
    });
    const json = await res.json();
    setResult(json.data);
    setSimLoading(false);
  }

  function resetGroup() {
    if (!groups) return;
    const g = groups.find((g) => g.code === selectedGroup);
    if (!g) return;
    const next = { ...overrides };
    g.matches.forEach((m) => delete next[m.id]);
    setOverrides(next);
  }

  const currentGroup = groups?.find((g) => g.code === selectedGroup);

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
        Simulador de Cenários
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Defina placares hipotéticos e veja como a classificação e o mata-mata mudariam.
      </p>

      {!groups ? (
        <button
          onClick={loadGroups}
          disabled={loading}
          style={{
            background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.9rem',
            border: 'none', borderRadius: 10, padding: '0.75rem 2rem', cursor: 'pointer',
          }}
        >
          {loading ? 'Carregando partidas...' : '⚡ Carregar partidas'}
        </button>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Group selector */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {'ABCDEFGHIJKL'.split('').map((c) => (
              <button key={c} onClick={() => setSelectedGroup(c)} style={{
                padding: '0.4rem 0.75rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
                border: selectedGroup === c ? '1px solid #22c55e' : '1px solid #1e293b',
                background: selectedGroup === c ? 'rgba(34,197,94,0.1)' : '#0d1117',
                color: selectedGroup === c ? '#22c55e' : '#6b7280', cursor: 'pointer',
              }}>
                {c}
              </button>
            ))}
          </div>

          {/* Matches for selected group */}
          {currentGroup && (
            <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{
                padding: '0.75rem 1rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.9rem' }}>
                  Grupo {selectedGroup} — defina os placares
                </span>
                <button onClick={resetGroup} style={{
                  fontSize: '0.7rem', color: '#ef4444', background: 'transparent',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer',
                }}>
                  Limpar
                </button>
              </div>

              <div style={{ padding: '0.5rem' }}>
                {currentGroup.matches.map((match: Match) => {
                  const ov = overrides[match.id];
                  const home = ov?.homeScore ?? match.homeScore;
                  const away = ov?.awayScore ?? match.awayScore;
                  return (
                    <div key={match.id} style={{
                      display: 'flex', alignItems: 'center', gap: '0.75rem',
                      padding: '0.6rem 0.75rem', borderRadius: 10,
                      background: ov ? 'rgba(34,197,94,0.04)' : 'transparent',
                      border: ov ? '1px solid rgba(34,197,94,0.1)' : '1px solid transparent',
                      marginBottom: '0.35rem',
                    }}>
                      <span style={{ flex: 1, textAlign: 'right', fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                        {match.homeTeam.emoji} {match.homeTeam.code}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <input type="number" min={0} max={20} value={home}
                          onChange={(e) => setScore(match.id, 'homeScore', e.target.value)}
                          style={{
                            width: 44, height: 36, textAlign: 'center', fontSize: '1.1rem', fontWeight: 800,
                            background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8,
                            color: '#f8fafc', outline: 'none',
                          }}
                        />
                        <span style={{ color: '#374151', fontWeight: 800 }}>×</span>
                        <input type="number" min={0} max={20} value={away}
                          onChange={(e) => setScore(match.id, 'awayScore', e.target.value)}
                          style={{
                            width: 44, height: 36, textAlign: 'center', fontSize: '1.1rem', fontWeight: 800,
                            background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8,
                            color: '#f8fafc', outline: 'none',
                          }}
                        />
                      </div>
                      <span style={{ flex: 1, fontSize: '0.9rem', fontWeight: 700, color: '#e2e8f0' }}>
                        {match.awayTeam.code} {match.awayTeam.emoji}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Simulate button */}
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <button onClick={simulate} disabled={simLoading} style={{
              background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.9rem',
              border: 'none', borderRadius: 10, padding: '0.75rem 2rem', cursor: 'pointer',
              opacity: simLoading ? 0.7 : 1,
            }}>
              {simLoading ? 'Simulando...' : '⚡ Simular cenário'}
            </button>
            <span style={{ fontSize: '0.75rem', color: '#374151' }}>
              {Object.keys(overrides).length} placar{Object.keys(overrides).length !== 1 ? 'es' : ''} alterado{Object.keys(overrides).length !== 1 ? 's' : ''}
            </span>
          </div>

          {/* Results */}
          {result && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div style={{
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                borderRadius: 12, padding: '1rem 1.25rem',
                fontSize: '0.85rem', color: '#86efac',
              }}>
                💬 {result.summary}
              </div>

              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc', marginBottom: '1rem' }}>
                  Classificação simulada
                </h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '0.75rem',
                }}>
                  {result.standings.groups.map((g) => (
                    <div key={g.groupCode} style={{
                      background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12, overflow: 'hidden',
                    }}>
                      <div style={{ padding: '0.5rem 0.75rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b', fontSize: '0.75rem', fontWeight: 800, color: '#f8fafc' }}>
                        Grupo {g.groupCode}
                      </div>
                      {g.rows.map((row) => (
                        <div key={row.teamId} style={{
                          display: 'flex', alignItems: 'center', gap: '0.5rem',
                          padding: '0.45rem 0.75rem', borderBottom: '1px solid #0f172a',
                        }}>
                          <span style={{ width: 3, height: 16, background: qualColor[row.qualificationStatus] ?? '#374151', borderRadius: 2, flexShrink: 0 }} />
                          <span style={{ fontSize: '0.9rem' }}>{row.team.emoji}</span>
                          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{row.team.code}</span>
                          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{row.played}j</span>
                          <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#f8fafc', minWidth: 20, textAlign: 'right' }}>{row.points}pts</span>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
