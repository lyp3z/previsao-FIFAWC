'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/',          label: 'Calendário', icon: '📅' },
  { href: '/grupos',    label: 'Grupos',     icon: '🏟' },
  { href: '/mata-mata', label: 'Mata-Mata',  icon: '⚔️' },
  { href: '/simulador', label: 'Simulador',  icon: '⚡' },
];

export function Nav() {
  const path = usePathname();

  const isActive = (href: string) =>
    href === '/' ? path === '/' : path.startsWith(href);

  return (
    <>
      {/* ── Top header ── */}
      <header style={{
        borderBottom: '1px solid #1a1a1a',
        background: '#050505',
        position: 'sticky', top: 0, zIndex: 50,
      }}>
        <div style={{
          maxWidth: 1200, margin: '0 auto',
          padding: '0 1.25rem',
          display: 'flex', alignItems: 'center', gap: '1.5rem', height: 52,
        }}>
          {/* Logo */}
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', flexShrink: 0 }}>
            <span style={{ fontSize: '1.1rem' }}>⚽</span>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              GoalForge
            </span>
            <span style={{
              fontSize: '0.58rem', fontWeight: 700, background: '#22c55e', color: '#000',
              borderRadius: 4, padding: '0.1rem 0.35rem', letterSpacing: '0.05em',
            }}>
              2026
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="nav-desktop" style={{ gap: '0.2rem' }}>
            {links.map((link) => {
              const active = isActive(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '0.4rem 0.7rem',
                    borderRadius: 8, letterSpacing: '0.02em',
                    color: active ? '#22c55e' : '#6b7280',
                    background: active ? 'rgba(34,197,94,0.08)' : 'transparent',
                    transition: 'all 0.15s',
                    textDecoration: 'none',
                  }}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      {/* ── Mobile bottom tab bar ── */}
      <nav
        className="nav-mobile"
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
          background: 'rgba(5,5,5,0.97)',
          borderTop: '1px solid #1a1a1a',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {links.map((link) => {
          const active = isActive(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                flex: 1, display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                padding: '0.55rem 0.25rem',
                gap: '0.2rem',
                color: active ? '#22c55e' : '#374151',
                transition: 'color 0.15s',
                textDecoration: 'none',
                minWidth: 0,
              }}
            >
              <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{link.icon}</span>
              <span style={{
                fontSize: '0.6rem', fontWeight: active ? 700 : 500,
                letterSpacing: '0.03em', lineHeight: 1,
                whiteSpace: 'nowrap',
              }}>
                {link.label}
              </span>
              {active && (
                <span style={{
                  position: 'absolute', bottom: 0,
                  width: 24, height: 2, background: '#22c55e', borderRadius: 2,
                }} />
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
