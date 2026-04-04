'use client';

import { useState, useEffect } from 'react';

export function SplashScreen() {
  const [phase, setPhase] = useState<'in' | 'hold' | 'out' | 'done'>('in');

  useEffect(() => {
    const holdTimer  = setTimeout(() => setPhase('hold'), 400);
    const fadeTimer  = setTimeout(() => setPhase('out'),  2400);
    const closeTimer = setTimeout(() => setPhase('done'), 3100);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(fadeTimer);
      clearTimeout(closeTimer);
    };
  }, []);

  if (phase === 'done') return null;

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: '#030608',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        opacity: phase === 'out' ? 0 : 1,
        transition: phase === 'out' ? 'opacity 0.7s ease' : 'none',
        pointerEvents: phase === 'out' ? 'none' : 'all',
        overflow: 'hidden',
      }}
    >
      {/* Background radial glow */}
      <div style={{
        position: 'absolute', inset: 0, zIndex: 0,
        background: 'radial-gradient(ellipse 60% 50% at 50% 50%, rgba(34,197,94,0.07) 0%, transparent 70%)',
      }} />

      {/* Ball */}
      <div style={{
        fontSize: '3.5rem', lineHeight: 1, zIndex: 1,
        animation: 'ballDrop 0.6s cubic-bezier(0.22,1,0.36,1) both',
        marginBottom: '1.75rem',
        filter: 'drop-shadow(0 8px 24px rgba(34,197,94,0.3))',
      }}>
        ⚽
      </div>

      {/* Green divider line */}
      <div style={{
        height: 2,
        background: 'linear-gradient(90deg, transparent, #22c55e, transparent)',
        zIndex: 1, marginBottom: '1.5rem',
        width: phase === 'in' ? 0 : '280px',
        transition: 'width 0.5s ease 0.3s',
      }} />

      {/* Main title */}
      <div style={{
        zIndex: 1, textAlign: 'center',
        opacity: phase === 'in' ? 0 : 1,
        transform: phase === 'in' ? 'translateY(10px)' : 'translateY(0)',
        transition: 'opacity 0.4s ease 0.5s, transform 0.4s ease 0.5s',
        marginBottom: '0.5rem',
      }}>
        <div style={{
          fontSize: '0.62rem', fontWeight: 800, color: '#22c55e',
          letterSpacing: '0.28em', textTransform: 'uppercase', marginBottom: '0.6rem',
        }}>
          Copa do Mundo
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.6rem' }}>
          <span style={{
            fontSize: 'clamp(1.8rem, 6vw, 2.6rem)',
            fontWeight: 900, color: '#f8fafc',
            letterSpacing: '-0.04em', lineHeight: 1,
          }}>
            GoalForge
          </span>
          <span style={{
            fontSize: '0.75rem', fontWeight: 800,
            background: '#22c55e', color: '#000',
            borderRadius: 5, padding: '0.2rem 0.5rem',
            letterSpacing: '0.04em', alignSelf: 'flex-start', marginTop: 4,
          }}>
            2026
          </span>
        </div>
      </div>

      {/* Host nations */}
      <div style={{
        zIndex: 1, marginTop: '1.5rem',
        opacity: phase === 'in' ? 0 : 1,
        transition: 'opacity 0.4s ease 0.75s',
        display: 'flex', gap: '1rem', alignItems: 'center',
      }}>
        {['🇺🇸 EUA', '🇨🇦 Canadá', '🇲🇽 México'].map((host, i) => (
          <span key={i} style={{
            fontSize: '0.68rem', color: '#374151', fontWeight: 600,
            letterSpacing: '0.06em',
          }}>
            {host}
          </span>
        ))}
      </div>

      {/* Progress bar */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
        background: '#0f172a', zIndex: 2,
      }}>
        <div style={{
          height: '100%',
          background: 'linear-gradient(90deg, #16a34a, #22c55e)',
          animation: 'splashProgress 2.4s linear 0.4s both',
        }} />
      </div>

      <style>{`
        @keyframes ballDrop {
          from { transform: translateY(-40px) scale(0.7); opacity: 0; }
          to   { transform: translateY(0)    scale(1);   opacity: 1; }
        }
        @keyframes splashProgress {
          from { width: 0%; }
          to   { width: 100%; }
        }
      `}</style>
    </div>
  );
}
