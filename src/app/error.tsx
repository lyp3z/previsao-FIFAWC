'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '1rem', padding: '2rem',
    }}>
      <span style={{ fontSize: '2.5rem' }}>⚠️</span>
      <h2 style={{ color: '#f8fafc', fontSize: '1.1rem', fontWeight: 700 }}>
        Algo deu errado
      </h2>
      <p style={{ color: '#4b5563', fontSize: '0.85rem', maxWidth: 400, textAlign: 'center' }}>
        {error.message || 'Erro inesperado. Tente recarregar a página.'}
      </p>
      <button
        onClick={reset}
        style={{
          background: '#22c55e', color: '#000', fontWeight: 700,
          border: 'none', borderRadius: 8, padding: '0.6rem 1.5rem', cursor: 'pointer',
        }}
      >
        Tentar novamente
      </button>
    </div>
  );
}
