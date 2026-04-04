'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/', label: 'Calendário' },
  { href: '/grupos', label: 'Grupos' },
  { href: '/mata-mata', label: 'Mata-Mata' },
  { href: '/simulador', label: 'Simulador' },
];

export function Nav() {
  const path = usePathname();

  return (
    <header style={{
      borderBottom: '1px solid #1a1a1a',
      background: '#050505',
      position: 'sticky', top: 0, zIndex: 50,
    }}>
      <div style={{
        maxWidth: 1200, margin: '0 auto',
        padding: '0 1.5rem',
        display: 'flex', alignItems: 'center', gap: '2rem', height: 56,
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{ fontSize: '1.25rem' }}>⚽</span>
          <span style={{ fontWeight: 800, fontSize: '1rem', color: '#f8fafc', letterSpacing: '-0.02em' }}>
            GoalForge
          </span>
          <span style={{
            fontSize: '0.6rem', fontWeight: 700, background: '#22c55e', color: '#000',
            borderRadius: 4, padding: '0.1rem 0.35rem', letterSpacing: '0.05em',
          }}>
            2026
          </span>
        </Link>

        {/* Nav links */}
        <nav style={{ display: 'flex', gap: '0.25rem' }}>
          {links.map((link) => {
            const active = link.href === '/' ? path === '/' : path.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  fontSize: '0.8rem', fontWeight: 600, padding: '0.4rem 0.75rem',
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
  );
}
