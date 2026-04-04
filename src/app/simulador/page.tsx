'use client';

import { useState, useEffect } from 'react';

type Override = { matchId: string; homeScore: number; awayScore: number };
type Match = {
  id: string;
  homeTeam: { code: string; emoji: string; shortName: string } | null;
  awayTeam: { code: string; emoji: string; shortName: string } | null;
  group: { code: string } | null;
  homeScore: number; awayScore: number; status: string;
};
type Group = { id: string; code: string; matches: Match[] };
type StandingRow = {
  teamId: string;
  team: { code: string; emoji: string; shortName: string };
  points: number; played: number; wins: number; draws: number; losses: number;
  goalsFor: number; goalsAgainst: number; goalDifference: number; position: number;
  qualificationStatus: string;
};
type KnockoutSlot = { slotCode: string; homeTeamId?: string; awayTeamId?: string };
type SimResult = {
  standings: {
    groups: { groupCode: string; rows: StandingRow[] }[];
    bestThird: { groupCode: string; row: StandingRow }[];
  };
  knockout: { round32: KnockoutSlot[] };
  summary: string;
};
type TeamInfo = { code: string; emoji: string; shortName: string };
type Stage = 'grupos' | 'r32' | 'r16' | 'qf' | 'sf' | 'campeão';

const qualColor: Record<string, string> = {
  QUALIFIED: '#22c55e', PLAYOFF: '#f59e0b', ELIMINATED: '#4b5563', TBD: '#374151',
};

const STAGE_TABS: { id: Stage; label: string }[] = [
  { id: 'grupos', label: 'Grupos' },
  { id: 'r32', label: 'Round of 32' },
  { id: 'r16', label: 'Oitavas' },
  { id: 'qf', label: 'Quartas' },
  { id: 'sf', label: 'Semis · Final' },
  { id: 'campeão', label: '🏆 Campeão' },
];

function pairSlots(slots: KnockoutSlot[], winners: Record<string, string>, prefix: string): KnockoutSlot[] {
  const out: KnockoutSlot[] = [];
  for (let i = 0; i < slots.length; i += 2) {
    out.push({
      slotCode: `${prefix}_${Math.floor(i / 2) + 1}`,
      homeTeamId: winners[slots[i]?.slotCode],
      awayTeamId: winners[slots[i + 1]?.slotCode],
    });
  }
  return out;
}

function loserOf(slot: KnockoutSlot, winners: Record<string, string>): string | undefined {
  const w = winners[slot.slotCode];
  if (!w) return undefined;
  return slot.homeTeamId === w ? slot.awayTeamId : slot.homeTeamId;
}

function MatchCard({
  slot, teamMap, winners, onPick,
}: {
  slot: KnockoutSlot;
  teamMap: Record<string, TeamInfo>;
  winners: Record<string, string>;
  onPick: (slotCode: string, teamId: string) => void;
}) {
  const winner = winners[slot.slotCode];
  const sides = [
    { id: slot.homeTeamId },
    { id: slot.awayTeamId },
  ];

  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12,
      overflow: 'hidden', minWidth: 190,
    }}>
      <div style={{
        padding: '0.25rem 0.65rem', background: '#070b14',
        borderBottom: '1px solid #1e293b', fontSize: '0.58rem', fontWeight: 700, color: '#374151',
      }}>
        {slot.slotCode}
      </div>
      {sides.map(({ id }, i) => {
        const team = id ? teamMap[id] : null;
        const isWinner = !!winner && winner === id;
        const isLoser = !!winner && winner !== id && !!id;
        return (
          <div
            key={i}
            onClick={() => { if (id && team) onPick(slot.slotCode, id); }}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.55rem 0.65rem',
              borderLeft: isWinner ? '3px solid #22c55e' : '3px solid transparent',
              borderBottom: i === 0 ? '1px solid #0f172a' : 'none',
              background: isWinner ? 'rgba(34,197,94,0.08)' : 'transparent',
              opacity: isLoser ? 0.35 : 1,
              cursor: id && team ? 'pointer' : 'default',
              transition: 'background 0.12s, opacity 0.12s',
            }}
          >
            {team ? (
              <>
                <span style={{ fontSize: '1rem' }}>{team.emoji}</span>
                <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', flex: 1 }}>
                  {team.code}
                </span>
                {isWinner && <span style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 800 }}>✓</span>}
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.85rem', opacity: 0.4 }}>🏳</span>
                <span style={{ fontSize: '0.68rem', color: '#1e293b', fontWeight: 600 }}>TBD</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function SimuladorPage() {
  const [activeStage, setActiveStage] = useState<Stage>('grupos');
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [groupResult, setGroupResult] = useState<SimResult | null>(null);
  const [teamMap, setTeamMap] = useState<Record<string, TeamInfo>>({});
  const [kw, setKw] = useState<Record<string, string>>({}); // knockoutWinners

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    setLoading(true);
    setLoadError(null);
    try {
      const [gr, mr] = await Promise.all([fetch('/api/groups'), fetch('/api/matches?stage=GROUP')]);
      if (!gr.ok || !mr.ok) throw new Error('Falha ao buscar dados');
      const gj = await gr.json();
      const mj = await mr.json();
      const allMatches: Match[] = mj.data ?? [];
      setGroups(
        (gj.data ?? []).map((g: { id: string; code: string }) => ({
          ...g,
          matches: allMatches.filter((m) => m.group?.code === g.code),
        })),
      );
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Erro ao carregar');
    }
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
    setSimError(null);
    setKw({});
    try {
      const res = await fetch('/api/simulator/full', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: Object.values(overrides) }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const json = await res.json();
      const result: SimResult = json.data;
      setGroupResult(result);
      const map: Record<string, TeamInfo> = {};
      for (const g of result.standings.groups) for (const row of g.rows) map[row.teamId] = row.team;
      for (const e of result.standings.bestThird ?? []) map[e.row.teamId] = e.row.team;
      setTeamMap(map);
      setActiveStage('r32');
    } catch (err) {
      setSimError(err instanceof Error ? err.message : 'Erro ao simular');
    }
    setSimLoading(false);
  }

  function pick(slotCode: string, teamId: string) {
    setKw((prev) => ({ ...prev, [slotCode]: teamId }));
  }

  // Derive bracket
  const r32 = groupResult?.knockout.round32 ?? [];
  const r16 = r32.length > 0 && r32.every((s) => kw[s.slotCode]) ? pairSlots(r32, kw, 'R16') : [];
  const qf = r16.length > 0 && r16.every((s) => kw[s.slotCode]) ? pairSlots(r16, kw, 'QF') : [];
  const sf = qf.length > 0 && qf.every((s) => kw[s.slotCode]) ? pairSlots(qf, kw, 'SF') : [];
  const sfDone = sf.length > 0 && sf.every((s) => kw[s.slotCode]);

  const finalSlot: KnockoutSlot = { slotCode: 'FINAL', homeTeamId: kw.SF_1, awayTeamId: kw.SF_2 };
  const thirdSlot: KnockoutSlot = {
    slotCode: 'THIRD',
    homeTeamId: sfDone ? loserOf(sf[0], kw) : undefined,
    awayTeamId: sfDone ? loserOf(sf[1], kw) : undefined,
  };

  const champion = kw.FINAL;
  const runnerUp = finalSlot.homeTeamId === champion ? finalSlot.awayTeamId : finalSlot.homeTeamId;
  const thirdPlace = kw.THIRD;
  const fourthPlace = thirdSlot.homeTeamId === thirdPlace ? thirdSlot.awayTeamId : thirdSlot.homeTeamId;

  const stageEnabled: Record<Stage, boolean> = {
    grupos: true,
    r32: !!groupResult,
    r16: r16.length > 0,
    qf: qf.length > 0,
    sf: sf.length > 0,
    campeão: !!kw.FINAL,
  };

  const currentGroup = groups?.find((g) => g.code === selectedGroup);

  const knockoutStages: { id: Stage; label: string; slots: KnockoutSlot[]; next: Stage; nextLabel: string }[] = [
    { id: 'r32', label: 'Round of 32', slots: r32, next: 'r16', nextLabel: 'Oitavas de Final' },
    { id: 'r16', label: 'Oitavas de Final', slots: r16, next: 'qf', nextLabel: 'Quartas de Final' },
    { id: 'qf', label: 'Quartas de Final', slots: qf, next: 'sf', nextLabel: 'Semifinais' },
  ];

  return (
    <div>
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem' }}>
        Simulador de Cenários
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
        Defina placares, avance o bracket e descubra seu campeão.
      </p>

      {/* Stage tabs */}
      <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '2rem', flexWrap: 'wrap', borderBottom: '1px solid #1e293b', paddingBottom: '0.75rem' }}>
        {STAGE_TABS.map((tab) => {
          const enabled = stageEnabled[tab.id];
          const active = activeStage === tab.id;
          return (
            <button
              key={tab.id}
              disabled={!enabled}
              onClick={() => enabled && setActiveStage(tab.id)}
              style={{
                padding: '0.45rem 1rem', borderRadius: 8, fontSize: '0.78rem', fontWeight: 700,
                border: active ? '1px solid #22c55e' : '1px solid transparent',
                background: active ? 'rgba(34,197,94,0.1)' : 'transparent',
                color: active ? '#22c55e' : enabled ? '#6b7280' : '#1e293b',
                cursor: enabled ? 'pointer' : 'not-allowed',
                transition: 'all 0.12s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── GRUPOS ── */}
      {activeStage === 'grupos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ color: '#374151', fontSize: '0.85rem' }}>Carregando partidas...</div>
          ) : loadError ? (
            <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {loadError}</div>
          ) : (
            <>
              {/* Group selector */}
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                {'ABCDEFGHIJKL'.split('').map((c) => (
                  <button key={c} onClick={() => setSelectedGroup(c)} style={{
                    padding: '0.35rem 0.7rem', borderRadius: 7, fontSize: '0.78rem', fontWeight: 700,
                    border: selectedGroup === c ? '1px solid #22c55e' : '1px solid #1e293b',
                    background: selectedGroup === c ? 'rgba(34,197,94,0.1)' : '#0d1117',
                    color: selectedGroup === c ? '#22c55e' : '#6b7280', cursor: 'pointer',
                  }}>
                    {c}
                  </button>
                ))}
              </div>

              {currentGroup && (
                <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 16, overflow: 'hidden' }}>
                  <div style={{ padding: '0.65rem 1rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.88rem' }}>Grupo {selectedGroup}</span>
                    <button
                      onClick={() => { const n = { ...overrides }; currentGroup.matches.forEach((m) => delete n[m.id]); setOverrides(n); }}
                      style={{ fontSize: '0.68rem', color: '#ef4444', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '0.2rem 0.5rem', cursor: 'pointer' }}
                    >
                      Limpar
                    </button>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    {currentGroup.matches.map((match) => {
                      const ov = overrides[match.id];
                      const home = ov?.homeScore ?? match.homeScore;
                      const away = ov?.awayScore ?? match.awayScore;
                      return (
                        <div key={match.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.75rem',
                          padding: '0.55rem 0.75rem', borderRadius: 10, marginBottom: '0.3rem',
                          background: ov ? 'rgba(34,197,94,0.04)' : 'transparent',
                          border: ov ? '1px solid rgba(34,197,94,0.1)' : '1px solid transparent',
                        }}>
                          <span style={{ flex: 1, textAlign: 'right', fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>
                            {match.homeTeam?.emoji ?? '🏳️'} {match.homeTeam?.code ?? '?'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <input type="number" min={0} max={20} value={home}
                              onChange={(e) => setScore(match.id, 'homeScore', e.target.value)}
                              style={{ width: 42, height: 34, textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f8fafc', outline: 'none' }}
                            />
                            <span style={{ color: '#374151', fontWeight: 800, fontSize: '0.9rem' }}>×</span>
                            <input type="number" min={0} max={20} value={away}
                              onChange={(e) => setScore(match.id, 'awayScore', e.target.value)}
                              style={{ width: 42, height: 34, textAlign: 'center', fontSize: '1.05rem', fontWeight: 800, background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 8, color: '#f8fafc', outline: 'none' }}
                            />
                          </div>
                          <span style={{ flex: 1, fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>
                            {match.awayTeam?.code ?? '?'} {match.awayTeam?.emoji ?? '🏳️'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                <button onClick={simulate} disabled={simLoading} style={{
                  background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.88rem',
                  border: 'none', borderRadius: 10, padding: '0.7rem 2rem', cursor: 'pointer', opacity: simLoading ? 0.7 : 1,
                }}>
                  {simLoading ? 'Simulando...' : '⚡ Simular fase de grupos'}
                </button>
                {groupResult && (
                  <button onClick={() => setActiveStage('r32')} style={{
                    background: 'transparent', color: '#22c55e', fontWeight: 700, fontSize: '0.82rem',
                    border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '0.7rem 1.5rem', cursor: 'pointer',
                  }}>
                    Ver Round of 32 →
                  </button>
                )}
              </div>

              {simError && (
                <div style={{ fontSize: '0.8rem', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>
                  ⚠️ {simError}
                </div>
              )}

              {/* Mini standings preview */}
              {groupResult && (
                <div>
                  <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.65rem' }}>
                    Classificação simulada
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '0.5rem' }}>
                    {groupResult.standings.groups.map((g) => (
                      <div key={g.groupCode} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 10, overflow: 'hidden' }}>
                        <div style={{ padding: '0.35rem 0.6rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b', fontSize: '0.65rem', fontWeight: 800, color: '#6b7280' }}>
                          Grupo {g.groupCode}
                        </div>
                        {g.rows.map((row) => (
                          <div key={row.teamId} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', padding: '0.35rem 0.6rem', borderBottom: '1px solid #0a0f1a' }}>
                            <span style={{ width: 3, height: 12, background: qualColor[row.qualificationStatus] ?? '#374151', borderRadius: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.82rem' }}>{row.team.emoji}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{row.team.shortName}</span>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, color: '#f8fafc' }}>{row.points}pts</span>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── R32 / R16 / QF ── */}
      {knockoutStages.map(({ id, label, slots, next, nextLabel }) =>
        activeStage === id && groupResult ? (
          <KnockoutStage
            key={id}
            label={label}
            slots={slots}
            teamMap={teamMap}
            winners={kw}
            onPick={pick}
            onAdvance={() => setActiveStage(next)}
            nextLabel={nextLabel}
          />
        ) : null,
      )}

      {/* ── SF + FINAL ── */}
      {activeStage === 'sf' && groupResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <KnockoutStage
            label="Semifinais"
            slots={sf}
            teamMap={teamMap}
            winners={kw}
            onPick={pick}
          />
          {sfDone && (
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #1a1a1a' }}>
                Final · 3º Lugar
              </div>
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <MatchCard slot={finalSlot} teamMap={teamMap} winners={kw} onPick={pick} />
                <MatchCard slot={thirdSlot} teamMap={teamMap} winners={kw} onPick={pick} />
              </div>
              {kw.FINAL && (
                <button
                  onClick={() => setActiveStage('campeão')}
                  style={{
                    marginTop: '1.25rem', background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.85rem',
                    border: 'none', borderRadius: 10, padding: '0.65rem 1.5rem', cursor: 'pointer',
                  }}
                >
                  🏆 Ver Campeão →
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CAMPEÃO ── */}
      {activeStage === 'campeão' && champion && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.1) 0%, rgba(34,197,94,0.02) 100%)',
            border: '1px solid rgba(34,197,94,0.25)', borderRadius: 20, padding: '2.5rem',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🏆</div>
            <div style={{ fontSize: '3.5rem', marginBottom: '0.4rem' }}>{teamMap[champion]?.emoji}</div>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#f8fafc', letterSpacing: '0.04em' }}>
              {teamMap[champion]?.shortName}
            </div>
            <div style={{ fontSize: '0.72rem', color: '#22c55e', fontWeight: 700, marginTop: '0.3rem', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Campeão do Mundo 2026
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem' }}>
            {[
              { icon: '🥇', label: 'Campeão', id: champion, accent: '#f59e0b' },
              { icon: '🥈', label: 'Vice-campeão', id: runnerUp, accent: '#94a3b8' },
              { icon: '🥉', label: '3º Lugar', id: thirdPlace, accent: '#cd7c2f' },
              { icon: '4', label: '4º Lugar', id: fourthPlace, accent: '#374151' },
            ].filter((e) => e.id).map((e) => (
              <div key={e.label} style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12,
                padding: '0.75rem 1rem',
              }}>
                <span style={{ fontSize: '1.1rem', minWidth: 22, textAlign: 'center' }}>{e.icon}</span>
                <span style={{ fontSize: '1.4rem' }}>{teamMap[e.id!]?.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>{teamMap[e.id!]?.shortName}</div>
                  <div style={{ fontSize: '0.62rem', color: '#4b5563' }}>{e.label}</div>
                </div>
                <span style={{ fontSize: '0.72rem', color: e.accent, fontWeight: 700 }}>{teamMap[e.id!]?.code}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => { setGroupResult(null); setKw({}); setOverrides({}); setActiveStage('grupos'); }}
            style={{
              alignSelf: 'flex-start', background: 'transparent', color: '#6b7280', fontWeight: 600, fontSize: '0.78rem',
              border: '1px solid #1e293b', borderRadius: 10, padding: '0.55rem 1.25rem', cursor: 'pointer',
            }}
          >
            ↺ Nova simulação
          </button>
        </div>
      )}
    </div>
  );
}

function KnockoutStage({
  label, slots, teamMap, winners, onPick, onAdvance, nextLabel,
}: {
  label: string;
  slots: KnockoutSlot[];
  teamMap: Record<string, TeamInfo>;
  winners: Record<string, string>;
  onPick: (slotCode: string, teamId: string) => void;
  onAdvance?: () => void;
  nextLabel?: string;
}) {
  const playable = slots.filter((s) => s.homeTeamId && s.awayTeamId);
  const done = playable.filter((s) => winners[s.slotCode]).length;
  const allDone = playable.length > 0 && done === playable.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#f8fafc' }}>{label}</div>
          <div style={{ fontSize: '0.7rem', color: '#374151', marginTop: '0.15rem' }}>
            Clique em um time para avançá-lo
          </div>
        </div>
        <div style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: allDone ? '#22c55e' : '#374151',
          background: allDone ? 'rgba(34,197,94,0.08)' : '#0d1117',
          border: `1px solid ${allDone ? 'rgba(34,197,94,0.2)' : '#1e293b'}`,
          borderRadius: 99, padding: '0.25rem 0.75rem',
        }}>
          {done}/{playable.length} definidos
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem' }}>
        {slots.map((slot) => (
          <MatchCard key={slot.slotCode} slot={slot} teamMap={teamMap} winners={winners} onPick={onPick} />
        ))}
      </div>

      {allDone && onAdvance && nextLabel && (
        <button onClick={onAdvance} style={{
          alignSelf: 'flex-start', background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.82rem',
          border: 'none', borderRadius: 10, padding: '0.6rem 1.4rem', cursor: 'pointer',
        }}>
          Ver {nextLabel} →
        </button>
      )}
    </div>
  );
}
