'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { LencanaStatus } from '@/komponen/LencanaStatus'
import { Pilih } from '@/komponen/Pilih'
import type { RingkasApi } from '@/lib/status'

// Bentuk yang bisa diserialisasi dari Server Component ke klien: objek Api penuh
// memuat contohResponse yang bisa besar, jadi hanya yang dipakai daftar yang dikirim.
export type BarisApi = {
  slug: string
  nama: string
  kategori: string
  deskripsi: string
  auth: 'none' | 'apikey' | 'oauth'
  cors: 'open' | 'locked' | 'none' | 'unknown'
  jumlahEndpoint: number
  mirror: boolean
  lisensi: string
}

const AUTH_LABEL: Record<string, string> = {
  none: 'Tanpa kunci',
  apikey: 'Perlu API key',
  oauth: 'OAuth',
}

const CORS_LABEL: Record<string, string> = {
  open: 'CORS terbuka',
  locked: 'CORS terbatas',
  none: 'Tanpa CORS',
  unknown: 'CORS belum diketahui',
}

export function KatalogApi({
  baris,
  kesehatan,
}: {
  baris: BarisApi[]
  // Berkunci slug; kosong kalau probe belum pernah jalan.
  kesehatan: Record<string, RingkasApi>
}) {
  const [kueri, setKueri] = useState('')
  const [kategori, setKategori] = useState('')
  const [auth, setAuth] = useState('')
  const [status, setStatus] = useState('')

  const kategoriTersedia = useMemo(
    () => [...new Set(baris.map((b) => b.kategori))].sort(),
    [baris],
  )

  const hasil = useMemo(() => {
    const k = kueri.trim().toLowerCase()
    return baris.filter((b) => {
      if (k && !`${b.nama} ${b.slug} ${b.deskripsi} ${b.kategori}`.toLowerCase().includes(k)) {
        return false
      }
      if (kategori && b.kategori !== kategori) return false
      if (auth && b.auth !== auth) return false
      if (status) {
        const r = kesehatan[b.slug]
        if (status === 'sehat' && !(r && r.sehat)) return false
        if (status === 'bermasalah' && !(r && !r.sehat)) return false
        if (status === 'belum' && r) return false
      }
      return true
    })
  }, [baris, kueri, kategori, auth, status, kesehatan])

  return (
    <div className="space-y-5">
      <div className="space-y-4">
        <div>
          <label htmlFor="cari-api" className="mb-1 block text-sm font-medium">
            Cari API
          </label>
          <input
            id="cari-api"
            type="search"
            value={kueri}
            onChange={(e) => setKueri(e.target.value)}
            placeholder="gempa, wilayah, quran…"
            className="fokus-cincin w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Pilih
            id="filter-kategori"
            label="Kategori"
            nilai={kategori}
            onPilih={setKategori}
            opsi={[
              { nilai: '', label: 'Semua kategori' },
              ...kategoriTersedia.map((k) => ({ nilai: k, label: k })),
            ]}
          />
          <Pilih
            id="filter-auth"
            label="Autentikasi"
            nilai={auth}
            onPilih={setAuth}
            opsi={[
              { nilai: '', label: 'Semua' },
              { nilai: 'none', label: 'Tanpa kunci' },
              { nilai: 'apikey', label: 'Perlu API key' },
              { nilai: 'oauth', label: 'OAuth' },
            ]}
          />
          <Pilih
            id="filter-status"
            label="Status"
            nilai={status}
            onPilih={setStatus}
            opsi={[
              { nilai: '', label: 'Semua' },
              { nilai: 'sehat', label: 'Sehat' },
              { nilai: 'bermasalah', label: 'Bermasalah' },
              { nilai: 'belum', label: 'Belum diperiksa' },
            ]}
          />
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        {hasil.length} dari {baris.length} API
      </p>

      {hasil.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Tidak ada API yang cocok. Longgarkan filternya atau ubah kata pencarian.
        </p>
      ) : (
        <ul className="space-y-3">
          {hasil.map((b) => (
            <li key={b.slug}>
              <Link
                href={`/dev/api/${b.slug}`}
                className="fokus-cincin group flex flex-col gap-2 rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/60"
              >
                <span className="flex flex-wrap items-start justify-between gap-3">
                  <span className="space-y-0.5">
                    <span className="block font-medium group-hover:underline">{b.nama}</span>
                    <span className="block font-mono text-xs text-zinc-500">{b.slug}</span>
                  </span>
                  <LencanaStatus ringkas={kesehatan[b.slug]} />
                </span>

                <span className="block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {b.deskripsi}
                </span>

                <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
                  <span>{b.kategori}</span>
                  <span>{b.jumlahEndpoint} endpoint</span>
                  <span>{AUTH_LABEL[b.auth]}</span>
                  <span>{CORS_LABEL[b.cors]}</span>
                  <span>Lisensi {b.lisensi}</span>
                  {b.mirror && <span>Punya mirror</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
