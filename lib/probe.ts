// Mesin health check. Dipisah dari scripts/probe.ts supaya bisa diuji tanpa
// menulis berkas dan tanpa menyentuh registry.
//
// Beda dari check.ts upstream: yang dipanggil endpoint ASLINYA (baseUrl + contohPath),
// bukan halaman dokumentasi. Aturan lengkap di SPEC §9.
import { USER_AGENT } from '@/lib/client'
import type { Api, Endpoint } from '@/registry/schema'

export type Cors = 'open' | 'locked' | 'none' | 'unknown'

export type Catatan = {
  waktu: string
  endpointId: string
  status: number
  latencyMs: number
  contentType: string
  cors: Cors
  ukuranByte: number
  ok: boolean
  // Kenapa tidak ok. Diisi hanya saat ok === false, supaya berkas riwayat tidak
  // membengkak oleh field kosong.
  sebab?: string
  // Mode kematian keenam (SPEC §9): data sah tapi beku. null kalau endpoint ini
  // tidak memuat stempel waktu yang bisa dikenali.
  umurDataHari?: number | null
}

const TIMEOUT_MS = 15_000
const HARI_MS = 86_400_000

// Ambil stempel waktu ISO 8601 dari body mentah. Regex, bukan penelusuran objek:
// body terbesar 397 KB, dan bentuk JSON-nya berbeda-beda tiap API.
const POLA_ISO = /\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}(?::\d{2})?/g

export async function probeEndpoint(api: Api, endpoint: Endpoint): Promise<Catatan> {
  const url = api.baseUrl.replace(/\/$/, '') + endpoint.contohPath
  const mulai = Date.now()

  let res: Response
  let teks: string

  try {
    const hasil = await sekaliPanggil(url, endpoint)
    res = hasil.res
    teks = hasil.teks
  } catch (e) {
    return {
      waktu: new Date().toISOString(),
      endpointId: endpoint.id,
      status: 0,
      latencyMs: Date.now() - mulai,
      contentType: '',
      cors: 'unknown',
      ukuranByte: 0,
      ok: false,
      sebab: `tidak bisa dihubungi: ${(e as Error).message}`,
    }
  }

  const latencyMs = Date.now() - mulai
  const contentType = res.headers.get('content-type') ?? ''
  const ukuranByte = new TextEncoder().encode(teks).length

  const dasar = {
    waktu: new Date().toISOString(),
    endpointId: endpoint.id,
    status: res.status,
    latencyMs,
    contentType,
    cors: bacaCors(res),
    ukuranByte,
  }

  // Syarat 1: status < 400.
  if (res.status >= 400) {
    return { ...dasar, ok: false, sebab: `status ${res.status}` }
  }

  // Syarat 2: Content-Type mengandung json. Ini yang menangkap jebakan Bukuacak —
  // 200 + CORS * tapi isinya HTML.
  if (!contentType.toLowerCase().includes('json')) {
    return { ...dasar, ok: false, sebab: `Content-Type '${contentType || 'kosong'}' bukan JSON` }
  }

  // Syarat 3: body ter-parse jadi JSON yang sah.
  let data: unknown
  try {
    data = JSON.parse(teks)
  } catch {
    return { ...dasar, ok: false, sebab: 'body bukan JSON yang sah' }
  }

  // Syarat 4: body bukan array/objek kosong.
  if (kosong(data)) {
    return { ...dasar, ok: false, sebab: 'JSON sah tapi kosong' }
  }

  // Syarat 5: ukuran >= minUkuranByte. Menangkap deployment hidup yang scraper-nya
  // rusak: bungkus normal, isi kosong di dalamnya.
  if (ukuranByte < endpoint.minUkuranByte) {
    return {
      ...dasar,
      ok: false,
      sebab: `${ukuranByte} B di bawah ambang ${endpoint.minUkuranByte} B`,
    }
  }

  // Umur data dicatat tapi TIDAK memengaruhi ok: endpointnya memang bekerja.
  // Yang beku perlu dilihat manusia, bukan divonis mati (SPEC §9).
  return { ...dasar, ok: true, umurDataHari: umurData(teks) }
}

async function sekaliPanggil(
  url: string,
  endpoint: Endpoint,
  percobaan = 0,
): Promise<{ res: Response; teks: string }> {
  const res = await fetch(url, {
    method: endpoint.method,
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: { ...endpoint.headers, 'User-Agent': USER_AGENT },
  })

  // 429 diulang sekali dengan jeda dari Retry-After. Body 429 belum tentu JSON,
  // jadi ini diperiksa sebelum apa pun (SPEC §8, kasus myQuran).
  if (res.status === 429 && percobaan === 0) {
    const minta = Number.parseInt(res.headers.get('retry-after') ?? '', 10)
    const jeda = Number.isFinite(minta) ? Math.min(Math.max(minta * 1000, 500), 5_000) : 1_000
    await new Promise((r) => setTimeout(r, jeda))
    return sekaliPanggil(url, endpoint, 1)
  }

  // Body dibaca SAMPAI HABIS. Jangan pernah pakai batas — response terbesar 397 KB,
  // dan pembacaan terpotong bikin API sehat dilaporkan rusak (SPEC §9).
  const teks = await res.text()
  return { res, teks }
}

function bacaCors(res: Response): Cors {
  const acao = res.headers.get('access-control-allow-origin')
  if (acao === null) return 'none'
  if (acao === '*') return 'open'
  return 'locked'
}

function kosong(data: unknown): boolean {
  if (data === null || data === undefined) return true
  if (Array.isArray(data)) return data.length === 0
  if (typeof data === 'object') return Object.keys(data as object).length === 0
  return false
}

// Umur stempel waktu TERBARU dalam body, dalam hari. Stempel di masa depan berarti
// data prakiraan — itu tanda segar, jadi umurnya 0. null kalau tidak ada stempel
// yang bisa dikenali (mis. daftar wilayah, yang memang tidak punya waktu).
export function umurData(teks: string): number | null {
  const sekarang = Date.now()
  let terbaru = -Infinity

  for (const cocok of teks.matchAll(POLA_ISO)) {
    const waktu = Date.parse(cocok[0].replace(' ', 'T') + (cocok[0].endsWith('Z') ? '' : 'Z'))
    if (Number.isNaN(waktu)) continue
    if (waktu > terbaru) terbaru = waktu
  }

  if (terbaru === -Infinity) return null
  if (terbaru >= sekarang) return 0
  return Math.floor((sekarang - terbaru) / HARI_MS)
}
