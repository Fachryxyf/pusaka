import type { RingkasApi } from '@/lib/status'

// Lencana status yang dipakai katalog dan halaman detail. Teks selalu menyertai
// warnanya — warna tidak boleh jadi satu-satunya penanda (UI-SPEC §1.5).
export function LencanaStatus({ ringkas }: { ringkas: RingkasApi | undefined }) {
  if (!ringkas) {
    return (
      <span className="shrink-0 rounded-full border border-zinc-300 px-2.5 py-0.5 text-xs text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
        Belum diperiksa
      </span>
    )
  }

  if (!ringkas.sehat) {
    return (
      <span className="shrink-0 rounded-full border border-red-300 bg-red-50 px-2.5 py-0.5 text-xs font-medium text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200">
        {ringkas.endpointGagal.length} bermasalah
      </span>
    )
  }

  // Sehat tapi datanya tua: keadaan tersendiri, bukan sehat biasa dan bukan galat.
  if (ringkas.umurDataMaks !== null && ringkas.umurDataMaks > 7) {
    return (
      <span className="shrink-0 rounded-full border border-amber-300 bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-800 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-200">
        Data {ringkas.umurDataMaks} hari
      </span>
    )
  }

  return (
    <span className="shrink-0 rounded-full border border-emerald-300 bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200">
      Sehat
    </span>
  )
}
