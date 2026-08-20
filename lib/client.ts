import type { Api, Endpoint } from '@/registry/schema'

// UA jujur & deskriptif. BMKG membalas 403 untuk 'Mozilla/5.0' telanjang (SPEC §12).
export const USER_AGENT = 'PusakaBot/1.0 (+https://github.com/Fachryxyf/pusaka)'

export const TIMEOUT_MS = 10_000

export type Sumber = 'langsung' | 'proxy' | 'mirror'

export type HasilAmbil<T = unknown> = {
  data: T
  sumber: Sumber
  per: string | null // ISO date, hanya terisi kalau sumber === 'mirror'
  status: number
  ukuranByte: number
}

export class GagalAmbil extends Error {
  constructor(
    message: string,
    readonly sebab: 'jaringan' | 'status' | 'bukan-json' | 'timeout',
    readonly status?: number,
  ) {
    super(message)
    this.name = 'GagalAmbil'
  }
}

export function bangunPath(endpoint: Endpoint, params: Record<string, string> = {}): string {
  let path = endpoint.path

  for (const p of endpoint.params) {
    const nilai = params[p.nama]
    if (nilai === undefined || nilai === '') {
      if (p.wajib) throw new GagalAmbil(`param wajib '${p.nama}' belum diisi`, 'status')
      continue
    }
    path = path.replaceAll(`{${p.nama}}`, encodeURIComponent(nilai))
  }

  const sisa = path.match(/\{([^}]+)\}/)
  if (sisa) throw new GagalAmbil(`param '${sisa[1]}' belum diisi`, 'status')

  return path
}

export function bangunUrl(api: Api, endpoint: Endpoint, params: Record<string, string> = {}): string {
  return api.baseUrl.replace(/\/$/, '') + bangunPath(endpoint, params)
}

// Lapis 1: fetch langsung. Lapis 2 (proxy) & 3 (mirror) menyusul di T5.
export async function ambil<T = unknown>(
  api: Api,
  endpoint: Endpoint,
  params: Record<string, string> = {},
): Promise<HasilAmbil<T>> {
  const url = bangunUrl(api, endpoint, params)

  let terakhir: GagalAmbil | null = null

  // Retry 1x hanya untuk error jaringan/timeout — 4xx tidak diulang (SPEC §8).
  for (let coba = 0; coba < 2; coba++) {
    if (coba > 0) await jeda(700)
    try {
      return await sekaliAmbil<T>(url, endpoint)
    } catch (e) {
      const gagal = e instanceof GagalAmbil ? e : new GagalAmbil(String(e), 'jaringan')
      terakhir = gagal
      const bolehUlang = gagal.sebab === 'jaringan' || gagal.sebab === 'timeout' ||
        (gagal.status !== undefined && gagal.status >= 500)
      if (!bolehUlang) break
    }
  }

  throw terakhir ?? new GagalAmbil('gagal tanpa sebab yang tercatat', 'jaringan')
}

async function sekaliAmbil<T>(url: string, endpoint: Endpoint): Promise<HasilAmbil<T>> {
  const putus = AbortSignal.timeout(TIMEOUT_MS)

  let res: Response
  try {
    res = await fetch(url, {
      method: endpoint.method,
      signal: putus,
      headers: { ...endpoint.headers, ...uaKalauBoleh() },
    })
  } catch (e) {
    const namaError = (e as Error).name
    if (namaError === 'TimeoutError' || namaError === 'AbortError') {
      throw new GagalAmbil(`permintaan lewat ${TIMEOUT_MS / 1000} detik`, 'timeout')
    }
    throw new GagalAmbil((e as Error).message, 'jaringan')
  }

  if (res.status >= 400) {
    throw new GagalAmbil(`server membalas ${res.status}`, 'status', res.status)
  }

  // Jebakan Bukuacak: 200 + CORS * tapi isinya HTML. Cek Content-Type wajib (SPEC §7, §8).
  const tipe = res.headers.get('content-type') ?? ''
  if (!tipe.toLowerCase().includes('json')) {
    throw new GagalAmbil(`Content-Type bukan JSON: '${tipe || 'kosong'}'`, 'bukan-json', res.status)
  }

  // Body dibaca sampai habis — jangan pernah dibatasi (SPEC §9).
  const teks = await res.text()

  let data: T
  try {
    data = JSON.parse(teks) as T
  } catch {
    throw new GagalAmbil('body bukan JSON yang sah', 'bukan-json', res.status)
  }

  return {
    data,
    sumber: 'langsung',
    per: null,
    status: res.status,
    ukuranByte: new TextEncoder().encode(teks).length,
  }
}

// Browser melarang menyetel User-Agent; menyetelnya di sana hanya memicu peringatan.
function uaKalauBoleh(): Record<string, string> {
  return typeof window === 'undefined' ? { 'User-Agent': USER_AGENT } : {}
}

function jeda(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}
