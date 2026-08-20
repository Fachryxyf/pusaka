'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { MetaAlat } from '@/alat/tipe'

export default function PencarianAlat({ alat }: { alat: MetaAlat[] }) {
  const [kueri, setKueri] = useState('')

  const hasil = useMemo(() => {
    const k = kueri.trim().toLowerCase()
    if (!k) return alat
    return alat.filter((a) => `${a.judul} ${a.deskripsi}`.toLowerCase().includes(k))
  }, [alat, kueri])

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="cari-alat" className="mb-1 block text-sm font-medium">
          Cari alat
        </label>
        <input
          id="cari-alat"
          type="search"
          value={kueri}
          onChange={(e) => setKueri(e.target.value)}
          placeholder="gempa, wilayah, sholat…"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base outline-none focus:border-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:focus:border-zinc-100"
        />
      </div>

      {hasil.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Tidak ada alat untuk “{kueri}”. Coba kata kunci yang lebih umum.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2">
          {hasil.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/alat/${a.slug}`}
                className="flex h-full flex-col gap-1 rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-100"
              >
                <span className="text-2xl" aria-hidden="true">
                  {a.ikon}
                </span>
                <span className="font-medium">{a.judul}</span>
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{a.deskripsi}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
