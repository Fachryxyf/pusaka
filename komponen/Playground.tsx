'use client'

import { useState } from 'react'
import { GagalAmbil, ambil, bangunUrl } from '@/lib/client'
import type { Api, Endpoint } from '@/registry/schema'

type Hasil = {
  status: number
  latencyMs: number
  ukuranByte: number
  sumber: string
  teks: string
}

// Playground memakai lib/client.ts yang SAMA dengan alat — tidak ada jalur fetch
// kedua di project ini (SPEC §8, TASKS T4.3).
export function Playground({ api, endpoint }: { api: Api; endpoint: Endpoint }) {
  const [nilai, setNilai] = useState<Record<string, string>>(() =>
    Object.fromEntries(endpoint.params.map((p) => [p.nama, p.contoh])),
  )
  const [hasil, setHasil] = useState<Hasil | null>(null)
  const [galat, setGalat] = useState<string | null>(null)
  const [jalan, setJalan] = useState(false)
  const [tersalin, setTersalin] = useState<string | null>(null)

  // API tanpa CORS tidak mungkin dipanggil dari browser, dan proxy ditunda sampai
  // hosting punya sisi server (SPEC §3.1). Tombolnya dinonaktifkan dengan alasan
  // yang disebutkan, bukan dibiarkan gagal misterius.
  const tanpaCors = api.cors === 'none' || api.cors === 'locked'

  const url = amanBangunUrl(api, endpoint, nilai)

  const kirim = async () => {
    setJalan(true)
    setGalat(null)
    setHasil(null)
    const mulai = Date.now()

    try {
      const res = await ambil<unknown>(api, endpoint, nilai)
      setHasil({
        status: res.status,
        latencyMs: Date.now() - mulai,
        ukuranByte: res.ukuranByte,
        sumber: res.sumber,
        teks: JSON.stringify(res.data, null, 2),
      })
    } catch (e) {
      setGalat(
        e instanceof GagalAmbil
          ? `${e.sebab}${e.status ? ` (${e.status})` : ''}: ${e.message}`
          : 'Permintaan gagal.',
      )
    } finally {
      setJalan(false)
    }
  }

  const salin = async (jenis: 'curl' | 'fetch') => {
    const teks = jenis === 'curl' ? sebagaiCurl(url, endpoint) : sebagaiFetch(url, endpoint)
    try {
      await navigator.clipboard.writeText(teks)
      setTersalin(jenis)
      setTimeout(() => setTersalin(null), 2500)
    } catch {
      // Clipboard bisa ditolak; perintahnya tetap terlihat di bawah untuk disalin manual.
      setTersalin(null)
    }
  }

  return (
    <div className="space-y-4">
      {endpoint.params.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-2">
          {endpoint.params.map((p) => (
            <div key={p.nama} className="space-y-1">
              <label htmlFor={`${endpoint.id}-${p.nama}`} className="block text-sm font-medium">
                {p.nama}
                {p.wajib && <span className="ml-1 text-xs text-zinc-500">wajib</span>}
              </label>
              <input
                id={`${endpoint.id}-${p.nama}`}
                type="text"
                value={nilai[p.nama] ?? ''}
                onChange={(e) => setNilai((v) => ({ ...v, [p.nama]: e.target.value }))}
                className="fokus-cincin w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 font-mono text-sm transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
              />
              {p.keterangan && <p className="text-xs text-zinc-500">{p.keterangan}</p>}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-1">
        <span className="block text-xs uppercase tracking-wide text-zinc-500">URL</span>
        <code className="block overflow-x-auto whitespace-nowrap rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900">
          {endpoint.method} {url}
        </code>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={kirim}
          disabled={jalan || tanpaCors}
          className="fokus-cincin rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-zinc-50 transition enabled:hover:bg-zinc-700 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          {jalan ? 'Mengirim…' : 'Kirim'}
        </button>
        <button
          type="button"
          onClick={() => salin('curl')}
          className="fokus-cincin rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {tersalin === 'curl' ? 'Tersalin' : 'Salin sebagai curl'}
        </button>
        <button
          type="button"
          onClick={() => salin('fetch')}
          className="fokus-cincin rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          {tersalin === 'fetch' ? 'Tersalin' : 'Salin sebagai fetch'}
        </button>
      </div>

      {tanpaCors && (
        <p className="teks-badan rounded-lg border border-zinc-300 bg-zinc-50 p-3 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
          API ini tidak mengirim header <code className="font-mono">Access-Control-Allow-Origin</code>,
          jadi peramban memblokir panggilan langsung dari halaman ini — bukan karena APInya
          rusak. Situs ini diekspor statis tanpa sisi server, jadi tidak ada proxy yang bisa
          meneruskannya. Salin perintah <code className="font-mono">curl</code> di atas dan
          jalankan di terminal; di sana tidak ada batasan CORS.
        </p>
      )}

      {galat && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100"
        >
          <p className="font-medium">Permintaan gagal</p>
          <p className="mt-1 font-mono text-xs">{galat}</p>
        </div>
      )}

      {hasil && (
        <div className="space-y-2">
          <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
            <Butir label="Status" nilai={String(hasil.status)} />
            <Butir label="Latency" nilai={`${hasil.latencyMs} ms`} />
            <Butir label="Ukuran" nilai={`${hasil.ukuranByte.toLocaleString('id-ID')} B`} />
            <Butir label="Sumber" nilai={hasil.sumber} />
          </dl>
          <pre className="max-h-96 overflow-auto rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs leading-relaxed dark:border-zinc-800 dark:bg-zinc-900">
            {potong(hasil.teks)}
          </pre>
        </div>
      )}
    </div>
  )
}

function Butir({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{nilai}</dd>
    </div>
  )
}

// Response terbesar di katalog 397 KB. Menaruh seluruhnya di DOM membuat halaman
// tersendat, jadi tampilannya dipotong — dan potongnya DIKATAKAN, bukan disamarkan.
function potong(teks: string, batas = 40_000): string {
  if (teks.length <= batas) return teks
  return `${teks.slice(0, batas)}\n\n… dipotong. Response utuh ${teks.length.toLocaleString('id-ID')} karakter; pakai curl untuk melihat semuanya.`
}

function amanBangunUrl(api: Api, endpoint: Endpoint, nilai: Record<string, string>): string {
  try {
    return bangunUrl(api, endpoint, nilai)
  } catch {
    // Param wajib masih kosong: tampilkan bentuk mentahnya supaya pengguna tahu
    // placeholder mana yang belum terisi.
    return api.baseUrl.replace(/\/$/, '') + endpoint.path
  }
}

function sebagaiCurl(url: string, endpoint: Endpoint): string {
  const bagian = ['curl', '-sS']
  if (endpoint.method !== 'GET') bagian.push('-X', endpoint.method)
  // User-Agent deskriptif ikut disertakan: BMKG membalas 403 untuk UA telanjang
  // (REFERENCE.md), jadi perintah tanpa ini bisa gagal dan bikin orang bingung.
  bagian.push('-H', "'User-Agent: PusakaBot/1.0 (+https://github.com/Fachryxyf/pusaka)'")
  for (const [k, v] of Object.entries(endpoint.headers)) {
    bagian.push('-H', `'${k}: ${v}'`)
  }
  bagian.push(`'${url}'`)
  return bagian.join(' ')
}

function sebagaiFetch(url: string, endpoint: Endpoint): string {
  const headers = Object.entries(endpoint.headers)
  const opsi =
    endpoint.method === 'GET' && headers.length === 0
      ? ''
      : `, {\n  method: '${endpoint.method}',${
          headers.length > 0
            ? `\n  headers: {\n${headers.map(([k, v]) => `    '${k}': '${v}',`).join('\n')}\n  },`
            : ''
        }\n}`
  return `const res = await fetch('${url}'${opsi})\nconst data = await res.json()`
}
