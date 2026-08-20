'use client'

// Jaring terakhir: dipakai kalau app/layout.tsx sendiri yang gagal render, sehingga
// error.tsx tidak bisa dipakai. Karena itu ia wajib membawa <html> dan <body>
// sendiri, dan tidak boleh bergantung pada apa pun dari layout.
export default function GalatGlobal({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="id">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          fontFamily: 'system-ui, sans-serif',
          background: '#0a0a0a',
          color: '#fafafa',
        }}
      >
        <div style={{ maxWidth: '32rem' }}>
          <p style={{ fontSize: '0.875rem', opacity: 0.6, margin: 0 }}>Galat</p>
          <h1 style={{ fontSize: '1.5rem', margin: '0.5rem 0' }}>Situs ini gagal dimuat</h1>
          <p style={{ opacity: 0.8, lineHeight: 1.6 }}>
            Kerangka halaman gagal dirender, jadi seluruh situs tidak bisa ditampilkan.
            Muat ulang biasanya cukup.
          </p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1rem',
              fontSize: '0.875rem',
              color: 'inherit',
              background: 'transparent',
              border: '1px solid currentColor',
              borderRadius: '0.5rem',
              cursor: 'pointer',
            }}
          >
            Muat ulang
          </button>
          {error.digest && (
            <p style={{ marginTop: '1.5rem', fontSize: '0.75rem', opacity: 0.5 }}>
              Kode galat: {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  )
}
