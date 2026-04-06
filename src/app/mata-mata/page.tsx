import { getBracket } from '@/modules/knockout/service';

const stageOrder = ['R32', 'R16', 'QF', 'SF', 'THIRD', 'FINAL'];
const stageLabels: Record<string, string> = {
  R32: 'Round of 32',
  R16: 'Oitavas de Final',
  QF: 'Quartas de Final',
  SF: 'Semifinais',
  THIRD: 'Terceiro Lugar',
  FINAL: 'Final',
};

type SlotWithTeams = {
  id: string;
  slotCode: string;
  label: string;
  sourceRule: string;
  homeTeam: { code: string; emoji: string; name: string } | null;
  awayTeam: { code: string; emoji: string; name: string } | null;
  winnerTeam: { code: string; emoji: string; name: string } | null;
};

function SlotCard({ slot }: { slot: SlotWithTeams }) {
  const hasTeams = slot.homeTeam || slot.awayTeam;
  return (
    <div style={{
      background: '#0d1117', border: '1px solid #1e293b', borderRadius: 12,
      padding: '0.75rem', minWidth: 200, flex: '0 0 auto',
    }}>
      <div style={{ fontSize: '0.6rem', color: '#374151', marginBottom: '0.5rem', fontWeight: 600 }}>
        {slot.slotCode}
      </div>
      {hasTeams ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
          {[slot.homeTeam, slot.awayTeam].map((team, i) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.5rem', borderRadius: 8,
              background: slot.winnerTeam?.code === team?.code ? 'rgba(34,197,94,0.08)' : 'transparent',
              border: slot.winnerTeam?.code === team?.code ? '1px solid rgba(34,197,94,0.2)' : '1px solid transparent',
            }}>
              <span style={{ fontSize: '1rem' }}>{team?.emoji ?? '🏳️'}</span>
              <span style={{
                fontSize: '0.8rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '0.05em',
              }}>
                {team?.code ?? '?'}
              </span>
              {slot.winnerTeam?.code === team?.code && (
                <span style={{ marginLeft: 'auto', fontSize: '0.6rem', color: '#22c55e', fontWeight: 700 }}>✓</span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.65rem', color: '#1e293b', fontStyle: 'italic' }}>
            {slot.sourceRule}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', marginTop: '0.5rem' }}>
            {[0, 1].map((i) => (
              <div key={i} style={{
                padding: '0.35rem 0.5rem', borderRadius: 8,
                background: '#0a0f1a', border: '1px dashed #1e293b',
                display: 'flex', alignItems: 'center', gap: '0.5rem',
              }}>
                <span style={{ fontSize: '0.9rem' }}>🏳</span>
                <span style={{ fontSize: '0.75rem', color: '#1e293b', fontWeight: 700 }}>TBD</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default async function MataMataPage() {
  const bracket = await getBracket('wc_2026') as Record<string, SlotWithTeams[]>;

  return (
    <div className="p-5 lg:p-7 max-w-[1280px] mx-auto">
      <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f8fafc', marginBottom: '0.25rem' }}>
        Mata-Mata
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.85rem', marginBottom: '2rem' }}>
        Round of 32 → Final · Bracket completo do torneio
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
        {stageOrder.map((code) => {
          const slots = bracket[code];
          if (!slots || slots.length === 0) return null;
          return (
            <section key={code}>
              <div style={{
                fontSize: '0.7rem', fontWeight: 700, color: '#4b5563',
                textTransform: 'uppercase', letterSpacing: '0.1em',
                marginBottom: '1rem', paddingBottom: '0.5rem',
                borderBottom: '1px solid #1a1a1a',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <span>{stageLabels[code] ?? code}</span>
                <span style={{
                  fontSize: '0.6rem', background: '#0f172a', border: '1px solid #1e293b',
                  borderRadius: 99, padding: '0.1rem 0.5rem', color: '#374151',
                }}>
                  {slots.length} confronto{slots.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '0.75rem',
              }}>
                {slots.map((slot) => (
                  <SlotCard key={slot.id} slot={slot} />
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <div style={{
        marginTop: '2rem', padding: '1rem', background: '#0a0f1a',
        border: '1px solid #1e293b', borderRadius: 12,
        fontSize: '0.75rem', color: '#4b5563', textAlign: 'center',
      }}>
        O bracket é preenchido automaticamente após a fase de grupos.
        Os times marcados como <strong style={{ color: '#22c55e' }}>TBD</strong> aguardam a classificação.
      </div>
    </div>
  );
}
