// Logika ringkasan status MURNI (tanpa node:fs) supaya bisa dipakai komponen
// klien. Yang menyentuh berkas tetap di lib/status.ts. Dipisah 2026-10-08 setelah
// Turbopack menolak node:fs di chunk klien (halaman /dev/status).
import type { Catatan, Cors } from '@/lib/probe'

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

export type RingkasApi = {
  slug: string
  nama: string
  kategori: string
  cors: Cors
  sehat: boolean
  jumlahEndpoint: number
  endpointGagal: string[]
  uptime30: number | null
  // Penyebut uptime30: berapa pemeriksaan yang masuk jendela 30 hari. Endpoint
  // baru mulai dari 1 — persentase tanpa angka ini menyesatkan (2026-10-08).
  cek30: number
  gagal30: number
  latencyRataRata: number | null
  umurDataMaks: number | null
  terakhir: string | null
}

// Deretan gagal di ujung riwayat (cek terakhir dan sebelumnya tanpa putus).
// Dipakai halaman status sebagai tanda otomatis API yang terus-terusan mati.
export function rentetanGagal(catatan: Catatan[]): number {
  let n = 0
  for (let i = catatan.length - 1; i >= 0; i--) {
    if (catatan[i].ok) break
    n++
  }
  return n
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
    cek30: dalam30.length,
    gagal30: dalam30.filter((c) => !c.ok).length,
    latencyRataRata: latency.length === 0 ? null : Math.round(latency.reduce((a, b) => a + b, 0) / latency.length),
    umurDataMaks: umur.length === 0 ? null : Math.max(...umur),
    terakhir: terakhirTiap.length === 0 ? null : (terakhirTiap.map((c) => c.waktu).sort().at(-1) ?? null),
  }
}
