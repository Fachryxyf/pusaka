'use client'

// Paginasi daftar panjang (katalog, status): 10 item per halaman.
export function Pager({
  halaman,
  total,
  onPilih,
}: {
  halaman: number
  total: number
  onPilih: (halaman: number) => void
}) {
  if (total <= 1) return null
  const nomor: number[] = []
  for (let i = 1; i <= total; i++) nomor.push(i)

  const tombol =
    'fokus-cincin min-w-9 rounded-lg border border-zinc-300 px-2.5 py-1.5 text-sm tabular-nums transition enabled:hover:border-zinc-400 disabled:opacity-40 dark:border-zinc-700 dark:enabled:hover:border-zinc-600'
  const aktif =
    'border-zinc-900 bg-zinc-900 font-medium text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900'

  return (
    <nav aria-label="Halaman" className="flex flex-wrap items-center gap-1.5">
      <button type="button" disabled={halaman <= 1} onClick={() => onPilih(halaman - 1)} className={tombol}>
        ‹ Sebelumnya
      </button>
      {nomor.map((n) => (
        <button
          key={n}
          type="button"
          aria-current={n === halaman ? 'page' : undefined}
          onClick={() => onPilih(n)}
          className={`${tombol} ${n === halaman ? aktif : ''}`}
        >
          {n}
        </button>
      ))}
      <button
        type="button"
        disabled={halaman >= total}
        onClick={() => onPilih(halaman + 1)}
        className={tombol}
      >
        Berikutnya ›
      </button>
      <span className="ml-1 text-xs text-zinc-500">
        Halaman {halaman} dari {total}
      </span>
    </nav>
  )
}
