import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { ringkasApi, type BerkasStatus, type RingkasApi } from './ringkas'

// Kompatibilitas: impor lama dari '@/lib/status' tetap jalan. Kode klien WAJIB
// dari '@/lib/ringkas' — berkas ini menarik node:fs yang merusak chunk browser.
export type { BerkasStatus, RingkasApi, RiwayatEndpoint, StatusApi } from './ringkas'
export { rentetanGagal, ringkasApi } from './ringkas'

// Dibaca saat build dari public/status.json yang ditulis scripts/probe.ts.
// Berkasnya bisa belum ada (klon baru, atau sebelum probe pertama), jadi seluruh
// muka situs wajib tetap berfungsi tanpanya.
const BERKAS = join(process.cwd(), 'public', 'status.json')

export function muatStatus(): BerkasStatus | null {
  if (!existsSync(BERKAS)) return null
  try {
    const isi = JSON.parse(readFileSync(BERKAS, 'utf8')) as BerkasStatus
    return isi.versi === 1 && Array.isArray(isi.api) ? isi : null
  } catch {
    // Berkas rusak tidak boleh menggagalkan build seluruh situs.
    return null
  }
}

// Dipakai muka awam: alat yang API-nya bermasalah diberi penanda, TIDAK
// disembunyikan — jujur lebih berguna daripada rapi (TASKS T3.4).
export function petaKesehatan(): Map<string, RingkasApi> {
  const status = muatStatus()
  if (!status) return new Map()
  return new Map(status.api.map((a) => [a.slug, ringkasApi(a)]))
}
