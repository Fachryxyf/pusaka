// Lima keadaan wajib tiap alat (UI-SPEC §1.1). Dipakai bersama semua alat
// supaya tidak ada yang bolong.

export function Kerangka({ baris = 3, className = '' }: { baris?: number; className?: string }) {
  return (
    <div className={`animate-pulse space-y-3 ${className}`} aria-busy="true" aria-live="polite">
      <span className="sr-only">Memuat data…</span>
      {Array.from({ length: baris }).map((_, i) => (
        <div key={i} className="h-4 rounded bg-zinc-200 dark:bg-zinc-800" style={{ width: `${90 - i * 12}%` }} />
      ))}
    </div>
  )
}

export function Galat({ pesan, onUlangi }: { pesan: string; onUlangi?: () => void }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
    >
      <p>{pesan}</p>
      {onUlangi && (
        <button
          type="button"
          onClick={onUlangi}
          className="fokus-cincin mt-3 rounded-md border border-amber-400 px-3 py-1.5 font-medium transition hover:bg-amber-100 dark:hover:bg-amber-900"
        >
          Coba lagi
        </button>
      )}
    </div>
  )
}

export function Kosong({ pesan, saran }: { pesan: string; saran?: string }) {
  return (
    <div className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      <p>{pesan}</p>
      {saran && <p className="mt-1">{saran}</p>}
    </div>
  )
}

export function BannerMirror({ per }: { per: string | null }) {
  const tanggal = per ? new Date(per).toLocaleDateString('id-ID', { dateStyle: 'long' }) : 'sebelumnya'
  return (
    <div className="mb-4 rounded-lg border border-sky-300 bg-sky-50 p-3 text-sm text-sky-900 dark:border-sky-700 dark:bg-sky-950 dark:text-sky-100">
      Data per {tanggal} — sumber aslinya sedang bermasalah.
    </div>
  )
}
