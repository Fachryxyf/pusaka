import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Catatan, Cors } from '@/lib/probe'

// Dibaca saat build dari public/status.json yang ditulis scripts/probe.ts.
// Berkasnya bisa belum ada (klon baru, atau sebelum probe pertama), jadi seluruh
// muka situs wajib tetap berfungsi tanpanya.
export type RiwayatEndpoint = { endpointId: string; catatan: Catatan[] }
export type StatusApi = {
  slug: string
  nama: string
  kategori: string
  cors: Cors
  endpoints: RiwayatEndpoint[]
}
export type BerkasStatus = {
  versi: 1
  diperbarui: string
  ringkasan: { api: number; endpoint: number; ok: number; gagal: number }
  api: StatusApi[]
}

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

export type RingkasApi = {
  slug: string
  nama: string
  kategori: string
  cors: Cors
  sehat: boolean
  jumlahEndpoint: number
  endpointGagal: string[]
  uptime30: number | null
  latencyRataRata: number | null
  umurDataMaks: number | null
  terakhir: string | null
}

// Ringkasan per API untuk dashboard dan penanda di muka awam.
export function ringkasApi(api: StatusApi): RingkasApi {
  const terakhirTiap = api.endpoints
    .map((e) => e.catatan.at(-1))
    .filter((c): c is Catatan => c !== undefined)

  const gagal = api.endpoints
    .filter((e) => e.catatan.at(-1)?.ok === false)
    .map((e) => e.endpointId)

  const batas30 = Date.now() - 30 * 86_400_000
  const dalam30 = api.endpoints.flatMap((e) =>
    e.catatan.filter((c) => {
      const w = Date.parse(c.waktu)
      return !Number.isNaN(w) && w >= batas30
    }),
  )

  const latency = terakhirTiap.filter((c) => c.status > 0).map((c) => c.latencyMs)
  const umur = terakhirTiap
    .map((c) => c.umurDataHari)
    .filter((u): u is number => typeof u === 'number')

  return {
    slug: api.slug,
    nama: api.nama,
    kategori: api.kategori,
    cors: api.cors,
    sehat: gagal.length === 0 && terakhirTiap.length > 0,
    jumlahEndpoint: api.endpoints.length,
    endpointGagal: gagal,
    uptime30: dalam30.length === 0 ? null : (dalam30.filter((c) => c.ok).length / dalam30.length) * 100,
    latencyRataRata: latency.length === 0 ? null : Math.round(latency.reduce((a, b) => a + b, 0) / latency.length),
    umurDataMaks: umur.length === 0 ? null : Math.max(...umur),
    terakhir: terakhirTiap.length === 0 ? null : (terakhirTiap.map((c) => c.waktu).sort().at(-1) ?? null),
  }
}

// Dipakai muka awam: alat yang API-nya bermasalah diberi penanda, TIDAK
// disembunyikan — jujur lebih berguna daripada rapi (TASKS T3.4).
export function petaKesehatan(): Map<string, RingkasApi> {
  const status = muatStatus()
  if (!status) return new Map()
  return new Map(status.api.map((a) => [a.slug, ringkasApi(a)]))
}
