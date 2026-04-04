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
  standings: { groups: { groupCode: string; rows: StandingRow[] }[]; bestThird: { groupCode: string; row: StandingRow }[] };
  knockout: { round32: KnockoutSlot[] };
};
type TeamInfo = { code: string; emoji: string; shortName: string };

const qualColor: Record<string, string> = {
  QUALIFIED: '#22c55e', PLAYOFF: '#f59e0b', ELIMINATED: '#4b5563', TBD: '#374151',
};

function pairInto(slots: KnockoutSlot[], winners: Record<string, string>, prefix: string): KnockoutSlot[] {
  return Array.from({ length: slots.length / 2 }, (_, i) => ({
    slotCode: `${prefix}_${i + 1}`,
    homeTeamId: winners[slots[i * 2]?.slotCode],
    awayTeamId: winners[slots[i * 2 + 1]?.slotCode],
  }));
}

function loserOf(slot: KnockoutSlot, winners: Record<string, string>) {
  const w = winners[slot.slotCode];
  if (!w) return undefined;
  return slot.homeTeamId === w ? slot.awayTeamId : slot.homeTeamId;
}

// ── Bracket match card ────────────────────────────────────────────────────────
function BracketCard({
  slot, teamMap, winners, onPick, compact = false,
}: {
  slot: KnockoutSlot;
  teamMap: Record<string, TeamInfo>;
  winners: Record<string, string>;
  onPick: (slotCode: string, teamId: string) => void;
  compact?: boolean;
}) {
  const winner = winners[slot.slotCode];
  const sides = [slot.homeTeamId, slot.awayTeamId];

  return (
    <div style={{
      background: '#0d1117',
      border: `1px solid ${winner ? 'rgba(34,197,94,0.25)' : '#1e293b'}`,
      borderRadius: 10,
      overflow: 'hidden',
      width: compact ? 160 : 185,
      boxShadow: winner ? '0 0 12px rgba(34,197,94,0.06)' : 'none',
      transition: 'border-color 0.2s, box-shadow 0.2s',
    }}>
      <div style={{ padding: '0.18rem 0.55rem', background: '#070b14', borderBottom: '1px solid #0f172a', fontSize: '0.52rem', fontWeight: 700, color: '#1e293b', letterSpacing: '0.05em' }}>
        {slot.slotCode}
      </div>
      {sides.map((id, i) => {
        const team = id ? teamMap[id] : null;
        const isWinner = !!winner && winner === id;
        const isLoser = !!winner && winner !== id && !!id;
        return (
          <div
            key={i}
            onClick={() => { if (id && team) onPick(slot.slotCode, id); }}
            title={team?.shortName}
            style={{
              display: 'flex', alignItems: 'center', gap: '0.4rem',
              padding: compact ? '0.42rem 0.55rem' : '0.48rem 0.6rem',
              borderLeft: isWinner ? '3px solid #22c55e' : '3px solid transparent',
              borderBottom: i === 0 ? '1px solid #0f172a' : 'none',
              background: isWinner ? 'rgba(34,197,94,0.07)' : 'transparent',
              opacity: isLoser ? 0.28 : 1,
              cursor: id && team ? 'pointer' : 'default',
              transition: 'all 0.12s',
              userSelect: 'none',
            }}
          >
            {team ? (
              <>
                <span style={{ fontSize: compact ? '0.85rem' : '0.95rem', lineHeight: 1 }}>{team.emoji}</span>
                <span style={{ fontSize: compact ? '0.68rem' : '0.75rem', fontWeight: 800, color: isWinner ? '#e2e8f0' : '#94a3b8', flex: 1, letterSpacing: '0.03em' }}>
                  {team.code}
                </span>
                {isWinner && <span style={{ fontSize: '0.55rem', color: '#22c55e' }}>✓</span>}
              </>
            ) : (
              <>
                <span style={{ fontSize: '0.82rem', opacity: 0.2 }}>🏳</span>
                <span style={{ fontSize: '0.62rem', color: '#1e293b', fontWeight: 600 }}>TBD</span>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Bracket column ────────────────────────────────────────────────────────────
function BracketColumn({
  label, slots, teamMap, winners, onPick, compact,
}: {
  label: string;
  slots: KnockoutSlot[];
  teamMap: Record<string, TeamInfo>;
  winners: Record<string, string>;
  onPick: (s: string, t: string) => void;
  compact?: boolean;
}) {
  const done = slots.filter((s) => winners[s.slotCode]).length;
  const playable = slots.filter((s) => s.homeTeamId && s.awayTeamId).length;
  const allDone = playable > 0 && done === playable;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: compact ? 175 : 200 }}>
      {/* Column header */}
      <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>{label}</div>
        <div style={{
          fontSize: '0.55rem', fontWeight: 700, marginTop: '0.2rem',
          color: allDone ? '#22c55e' : playable === 0 ? '#1e293b' : '#374151',
          letterSpacing: '0.06em', textTransform: 'uppercase',
        }}>
          {playable === 0 ? 'aguardando' : allDone ? `${done}/${playable} ✓` : `${done}/${playable} definidos`}
        </div>
      </div>

      {/* Slots distributed evenly */}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: 0 }}>
        {slots.map((slot, idx) => (
          <div
            key={slot.slotCode}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderTop: idx > 0 ? '1px solid transparent' : 'none',
              paddingTop: compact ? '0.3rem' : '0.4rem',
              paddingBottom: compact ? '0.3rem' : '0.4rem',
            }}
          >
            <BracketCard slot={slot} teamMap={teamMap} winners={winners} onPick={onPick} compact={compact} />
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Champion column ───────────────────────────────────────────────────────────
function ChampionColumn({ champion, runnerUp, third, fourth, teamMap }: {
  champion?: string; runnerUp?: string; third?: string; fourth?: string;
  teamMap: Record<string, TeamInfo>;
}) {
  const t = (id?: string) => id ? teamMap[id] : null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: 220, alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>Campeão</div>
      </div>
      <div style={{
        background: 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(34,197,94,0.03))',
        border: '1px solid rgba(34,197,94,0.25)', borderRadius: 16,
        padding: '1.5rem 1rem', textAlign: 'center', width: '100%',
        boxShadow: '0 0 40px rgba(34,197,94,0.08)',
      }}>
        {champion ? (
          <>
            <div style={{ fontSize: '2rem' }}>🏆</div>
            <div style={{ fontSize: '2.5rem', margin: '0.3rem 0' }}>{t(champion)?.emoji}</div>
            <div style={{ fontSize: '1rem', fontWeight: 900, color: '#f8fafc' }}>{t(champion)?.shortName}</div>
            <div style={{ fontSize: '0.6rem', color: '#22c55e', fontWeight: 700, marginTop: '0.25rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Campeão 2026
            </div>
            <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              {[
                { icon: '🥈', id: runnerUp, label: 'Vice' },
                { icon: '🥉', id: third, label: '3º' },
                { icon: '4️⃣', id: fourth, label: '4º' },
              ].filter(e => e.id).map(e => (
                <div key={e.label} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.5rem', background: 'rgba(255,255,255,0.03)', borderRadius: 8 }}>
                  <span style={{ fontSize: '0.85rem' }}>{e.icon}</span>
                  <span style={{ fontSize: '0.85rem' }}>{t(e.id)?.emoji}</span>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#94a3b8', flex: 1, textAlign: 'left' }}>{t(e.id)?.shortName}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div style={{ color: '#1e293b', fontSize: '0.7rem' }}>Complete o torneio</div>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function SimuladorPage() {
  const [view, setView] = useState<'grupos' | 'bracket'>('grupos');
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedGroup, setSelectedGroup] = useState('A');
  const [overrides, setOverrides] = useState<Record<string, Override>>({});
  const [simLoading, setSimLoading] = useState(false);
  const [simError, setSimError] = useState<string | null>(null);
  const [groupResult, setGroupResult] = useState<SimResult | null>(null);
  const [teamMap, setTeamMap] = useState<Record<string, TeamInfo>>({});
  const [kw, setKw] = useState<Record<string, string>>({});

  useEffect(() => { loadGroups(); }, []);

  async function loadGroups() {
    setLoading(true); setLoadError(null);
    try {
      const [gr, mr] = await Promise.all([fetch('/api/groups'), fetch('/api/matches?stage=GROUP')]);
      if (!gr.ok || !mr.ok) throw new Error('Falha ao buscar dados');
      const gj = await gr.json(); const mj = await mr.json();
      const allMatches: Match[] = mj.data ?? [];
      setGroups((gj.data ?? []).map((g: { id: string; code: string }) => ({
        ...g, matches: allMatches.filter((m) => m.group?.code === g.code),
      })));
    } catch (err) { setLoadError(err instanceof Error ? err.message : 'Erro'); }
    setLoading(false);
  }

  function setScore(matchId: string, field: 'homeScore' | 'awayScore', value: string) {
    const num = Math.max(0, parseInt(value) || 0);
    setOverrides((p) => ({ ...p, [matchId]: { ...p[matchId], matchId, homeScore: p[matchId]?.homeScore ?? 0, awayScore: p[matchId]?.awayScore ?? 0, [field]: num } }));
  }

  async function simulate() {
    setSimLoading(true); setSimError(null); setKw({});
    try {
      const res = await fetch('/api/simulator/full', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ overrides: Object.values(overrides) }),
      });
      if (!res.ok) throw new Error(`Erro ${res.status}`);
      const json = await res.json();
      const result: SimResult = json.data;
      setGroupResult(result);
      const map: Record<string, TeamInfo> = {};
      for (const g of result.standings.groups) for (const r of g.rows) map[r.teamId] = r.team;
      for (const e of result.standings.bestThird ?? []) map[e.row.teamId] = e.row.team;
      setTeamMap(map);
      setView('bracket');
    } catch (err) { setSimError(err instanceof Error ? err.message : 'Erro ao simular'); }
    setSimLoading(false);
  }

  const pick = (slotCode: string, teamId: string) => setKw((p) => ({ ...p, [slotCode]: teamId }));

  // Derive bracket rounds
  const r32 = groupResult?.knockout.round32 ?? [];
  const r16 = r32.length && r32.every(s => kw[s.slotCode]) ? pairInto(r32, kw, 'R16') : Array.from({ length: 8 }, (_, i) => ({ slotCode: `R16_${i+1}` }));
  const qf  = r16.every(s => kw[s.slotCode]) && r16[0]?.homeTeamId !== undefined ? pairInto(r16, kw, 'QF') : Array.from({ length: 4 }, (_, i) => ({ slotCode: `QF_${i+1}` }));
  const sf  = qf.every(s => kw[s.slotCode]) && qf[0]?.homeTeamId !== undefined ? pairInto(qf, kw, 'SF') : Array.from({ length: 2 }, (_, i) => ({ slotCode: `SF_${i+1}` }));
  const sfDone = sf.length > 0 && sf.every(s => kw[s.slotCode]) && sf[0].homeTeamId !== undefined;

  const finalSlot: KnockoutSlot = { slotCode: 'FINAL', homeTeamId: kw.SF_1, awayTeamId: kw.SF_2 };
  const thirdSlot: KnockoutSlot = { slotCode: 'THIRD', homeTeamId: sfDone ? loserOf(sf[0], kw) : undefined, awayTeamId: sfDone ? loserOf(sf[1], kw) : undefined };

  const champion = kw.FINAL;
  const runnerUp = champion ? (finalSlot.homeTeamId === champion ? finalSlot.awayTeamId : finalSlot.homeTeamId) : undefined;
  const thirdPlace = kw.THIRD;
  const fourthPlace = thirdPlace ? (thirdSlot.homeTeamId === thirdPlace ? thirdSlot.awayTeamId : thirdSlot.homeTeamId) : undefined;

  const currentGroup = groups?.find((g) => g.code === selectedGroup);

  return (
    <div>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.2rem' }}>
          Simulador de Cenários
        </h2>
        <p style={{ color: '#4b5563', fontSize: '0.82rem' }}>
          Defina placares na fase de grupos e simule o bracket completo até o campeão.
        </p>
      </div>

      {/* View toggle */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.75rem', borderBottom: '1px solid #1e293b', paddingBottom: '1rem' }}>
        {[
          { id: 'grupos' as const, label: '🏟 Fase de Grupos', enabled: true },
          { id: 'bracket' as const, label: '⚔ Bracket', enabled: true },
        ].map(({ id, label, enabled }) => {
          const active = view === id;
          return (
            <button key={id} onClick={() => setView(id)} disabled={!enabled} style={{
              padding: '0.5rem 1.25rem', borderRadius: 8, fontSize: '0.8rem', fontWeight: 700,
              border: active ? '1px solid #22c55e' : '1px solid #1e293b',
              background: active ? 'rgba(34,197,94,0.1)' : '#0d1117',
              color: active ? '#22c55e' : '#6b7280',
              cursor: 'pointer', transition: 'all 0.12s',
            }}>
              {label}
            </button>
          );
        })}
        {groupResult && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.72rem', color: '#22c55e' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
            Grupos simulados
          </div>
        )}
      </div>

      {/* ── GRUPOS VIEW ── */}
      {view === 'grupos' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {loading ? (
            <div style={{ color: '#374151', fontSize: '0.85rem' }}>Carregando partidas...</div>
          ) : loadError ? (
            <div style={{ color: '#ef4444', fontSize: '0.8rem' }}>⚠️ {loadError}</div>
          ) : (
            <>
              {/* Group selector */}
              <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                {'ABCDEFGHIJKL'.split('').map((c) => {
                  const active = selectedGroup === c;
                  return (
                    <button key={c} onClick={() => setSelectedGroup(c)} style={{
                      padding: '0.35rem 0.65rem', borderRadius: 7, fontSize: '0.75rem', fontWeight: 800,
                      border: active ? '1px solid #22c55e' : '1px solid #1e293b',
                      background: active ? 'rgba(34,197,94,0.1)' : '#0d1117',
                      color: active ? '#22c55e' : '#4b5563', cursor: 'pointer',
                    }}>
                      {c}
                    </button>
                  );
                })}
              </div>

              {currentGroup && (
                <div style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 14, overflow: 'hidden', maxWidth: 520 }}>
                  <div style={{ padding: '0.65rem 1rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 800, color: '#f8fafc', fontSize: '0.85rem' }}>Grupo {selectedGroup}</span>
                    <button onClick={() => { const n = { ...overrides }; currentGroup.matches.forEach(m => delete n[m.id]); setOverrides(n); }} style={{ fontSize: '0.65rem', color: '#ef4444', background: 'transparent', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 6, padding: '0.18rem 0.45rem', cursor: 'pointer' }}>
                      Limpar
                    </button>
                  </div>
                  <div style={{ padding: '0.4rem' }}>
                    {currentGroup.matches.map((match) => {
                      const ov = overrides[match.id];
                      const home = ov?.homeScore ?? match.homeScore;
                      const away = ov?.awayScore ?? match.awayScore;
                      return (
                        <div key={match.id} style={{
                          display: 'flex', alignItems: 'center', gap: '0.65rem',
                          padding: '0.5rem 0.65rem', borderRadius: 9, marginBottom: '0.25rem',
                          background: ov ? 'rgba(34,197,94,0.04)' : 'transparent',
                          border: ov ? '1px solid rgba(34,197,94,0.12)' : '1px solid transparent',
                        }}>
                          <span style={{ flex: 1, textAlign: 'right', fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
                            {match.homeTeam?.emoji ?? '🏳️'} {match.homeTeam?.code ?? '?'}
                          </span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                            <input type="number" min={0} max={20} value={home} onChange={(e) => setScore(match.id, 'homeScore', e.target.value)} style={{ width: 40, height: 32, textAlign: 'center', fontSize: '1rem', fontWeight: 800, background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 7, color: '#f8fafc', outline: 'none' }} />
                            <span style={{ color: '#374151', fontWeight: 800, fontSize: '0.85rem' }}>×</span>
                            <input type="number" min={0} max={20} value={away} onChange={(e) => setScore(match.id, 'awayScore', e.target.value)} style={{ width: 40, height: 32, textAlign: 'center', fontSize: '1rem', fontWeight: 800, background: '#0a0f1a', border: '1px solid #1e293b', borderRadius: 7, color: '#f8fafc', outline: 'none' }} />
                          </div>
                          <span style={{ flex: 1, fontSize: '0.85rem', fontWeight: 700, color: '#e2e8f0' }}>
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
                  <button onClick={() => setView('bracket')} style={{
                    background: 'transparent', color: '#22c55e', fontWeight: 700, fontSize: '0.82rem',
                    border: '1px solid rgba(34,197,94,0.3)', borderRadius: 10, padding: '0.7rem 1.5rem', cursor: 'pointer',
                  }}>
                    Ver Bracket →
                  </button>
                )}
              </div>

              {simError && <div style={{ fontSize: '0.78rem', color: '#ef4444', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '0.5rem 0.75rem' }}>⚠️ {simError}</div>}

              {/* Mini standings after simulation */}
              {groupResult && (
                <div>
                  <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#374151', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.6rem' }}>Classificação simulada</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '0.45rem' }}>
                    {groupResult.standings.groups.map((g) => (
                      <div key={g.groupCode} style={{ background: '#0d1117', border: '1px solid #1e293b', borderRadius: 9, overflow: 'hidden' }}>
                        <div style={{ padding: '0.3rem 0.55rem', background: '#0a0f1a', borderBottom: '1px solid #1e293b', fontSize: '0.6rem', fontWeight: 800, color: '#6b7280' }}>Grupo {g.groupCode}</div>
                        {g.rows.map((row) => (
                          <div key={row.teamId} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.3rem 0.55rem', borderBottom: '1px solid #0a0f1a' }}>
                            <span style={{ width: 3, height: 11, background: qualColor[row.qualificationStatus] ?? '#374151', borderRadius: 2, flexShrink: 0 }} />
                            <span style={{ fontSize: '0.8rem' }}>{row.team.emoji}</span>
                            <span style={{ fontSize: '0.68rem', fontWeight: 700, color: '#e2e8f0', flex: 1 }}>{row.team.shortName}</span>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f8fafc' }}>{row.points}pts</span>
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

      {/* ── BRACKET VIEW ── */}
      {view === 'bracket' && !groupResult && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 300, gap: '1rem', color: '#374151' }}>
          <span style={{ fontSize: '2rem' }}>⚽</span>
          <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#4b5563' }}>Simule a fase de grupos primeiro</div>
          <button onClick={() => setView('grupos')} style={{ background: '#22c55e', color: '#000', fontWeight: 800, fontSize: '0.82rem', border: 'none', borderRadius: 10, padding: '0.6rem 1.5rem', cursor: 'pointer' }}>
            Ir para Grupos →
          </button>
        </div>
      )}

      {view === 'bracket' && groupResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {/* Instruction */}
          <div style={{ fontSize: '0.72rem', color: '#374151', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '0.2rem 0.5rem', color: '#22c55e', fontWeight: 700, fontSize: '0.65rem' }}>
              Clique em um time para avançá-lo
            </span>
            <span>Os times avançam automaticamente para a próxima fase</span>
          </div>

          {/* Horizontal bracket */}
          <div style={{
            display: 'flex', gap: '1.25rem', overflowX: 'auto', overflowY: 'auto',
            maxHeight: 'calc(100vh - 220px)',
            paddingBottom: '1rem', paddingTop: '0.5rem',
            alignItems: 'stretch',
          }}>
            {/* Round of 32 */}
            <BracketColumn label="Round of 32" slots={r32} teamMap={teamMap} winners={kw} onPick={pick} compact />

            {/* Separator */}
            <div style={{ width: 1, background: 'linear-gradient(to bottom, transparent, #1e293b, transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* Oitavas */}
            <BracketColumn label="Oitavas de Final" slots={r16} teamMap={teamMap} winners={kw} onPick={pick} compact />

            <div style={{ width: 1, background: 'linear-gradient(to bottom, transparent, #1e293b, transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* Quartas */}
            <BracketColumn label="Quartas de Final" slots={qf} teamMap={teamMap} winners={kw} onPick={pick} />

            <div style={{ width: 1, background: 'linear-gradient(to bottom, transparent, #1e293b, transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* Semifinais */}
            <BracketColumn label="Semifinais" slots={sf} teamMap={teamMap} winners={kw} onPick={pick} />

            <div style={{ width: 1, background: 'linear-gradient(to bottom, transparent, #1e293b, transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* Final + 3º Lugar */}
            <div style={{ display: 'flex', flexDirection: 'column', flexShrink: 0, width: 200 }}>
              <div style={{ marginBottom: '0.75rem', textAlign: 'center' }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.04em' }}>Final · 3º Lugar</div>
                <div style={{ fontSize: '0.55rem', fontWeight: 700, marginTop: '0.2rem', color: sfDone ? '#374151' : '#1e293b', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  {sfDone ? 'clique para definir' : 'aguardando semis'}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '1rem', justifyContent: 'center' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Final</div>
                  <BracketCard slot={finalSlot} teamMap={teamMap} winners={kw} onPick={pick} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.58rem', color: '#374151', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>3º Lugar</div>
                  <BracketCard slot={thirdSlot} teamMap={teamMap} winners={kw} onPick={pick} />
                </div>
              </div>
            </div>

            <div style={{ width: 1, background: 'linear-gradient(to bottom, transparent, rgba(34,197,94,0.2), transparent)', flexShrink: 0, alignSelf: 'stretch' }} />

            {/* Champion */}
            <ChampionColumn
              champion={champion}
              runnerUp={runnerUp}
              third={thirdPlace}
              fourth={fourthPlace}
              teamMap={teamMap}
            />
          </div>

          {/* Reset */}
          {champion && (
            <button
              onClick={() => { setGroupResult(null); setKw({}); setOverrides({}); setView('grupos'); }}
              style={{ alignSelf: 'flex-start', marginTop: '0.5rem', background: 'transparent', color: '#4b5563', fontWeight: 600, fontSize: '0.75rem', border: '1px solid #1e293b', borderRadius: 8, padding: '0.4rem 1rem', cursor: 'pointer' }}
            >
              ↺ Nova simulação
            </button>
          )}
        </div>
      )}
    </div>
  );
}
