import type { Catatan } from '@/lib/probe'

// Riwayat sebagai deret batang. Warna BUKAN satu-satunya penanda: tiap batang
// punya title dan daftarnya punya ringkasan teks (UI-SPEC §1.5).
export function RiwayatBatang({ catatan, jumlah = 24 }: { catatan: Catatan[]; jumlah?: number }) {
  const tampil = catatan.slice(-jumlah)
  if (tampil.length === 0) {
    return <span className="text-xs text-zinc-500">Belum ada riwayat.</span>
  }

  const gagal = tampil.filter((c) => !c.ok).length

  return (
    <div className="space-y-1">
      <div className="flex items-end gap-0.5" role="img" aria-label={ringkas(tampil.length, gagal)}>
        {tampil.map((c) => (
          <span
            key={c.waktu}
            title={`${waktuSingkat(c.waktu)} — ${c.ok ? 'sehat' : (c.sebab ?? 'gagal')} (${c.latencyMs}ms)`}
            className={`h-6 w-1.5 rounded-sm ${
              c.ok ? 'bg-emerald-500/70 dark:bg-emerald-400/60' : 'bg-red-500 dark:bg-red-400'
            }`}
          />
        ))}
      </div>
      <p className="text-xs text-zinc-500">{ringkas(tampil.length, gagal)}</p>
    </div>
  )
}

function ringkas(total: number, gagal: number): string {
  if (gagal === 0) return `${total} pemeriksaan terakhir, semuanya sehat`
  return `${total} pemeriksaan terakhir, ${gagal} gagal`
}

function waktuSingkat(iso: string): string {
  const w = Date.parse(iso)
  if (Number.isNaN(w)) return iso
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'short', timeStyle: 'short' }).format(w)
}
