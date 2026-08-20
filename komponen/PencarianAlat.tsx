'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { MetaAlat } from '@/alat/tipe'
import { Ikon } from '@/komponen/Ikon'

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
          className="fokus-cincin w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
        />
      </div>

      {hasil.length === 0 ? (
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Tidak ada alat untuk “{kueri}”. Coba kata kunci yang lebih umum.
        </p>
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {hasil.map((a) => (
            <li key={a.slug}>
              <Link
                href={`/alat/${a.slug}`}
                className="fokus-cincin group flex h-full flex-col gap-3 rounded-xl border border-zinc-200 p-5 transition hover:border-zinc-400 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-600 dark:hover:bg-zinc-900/60"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-lg border border-zinc-200 bg-zinc-50 transition group-hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900 dark:group-hover:border-zinc-700">
                  <Ikon nama={a.ikon} className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                </span>
                <span className="space-y-1">
                  <span className="block font-medium">{a.judul}</span>
                  <span className="block text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                    {a.deskripsi}
                  </span>
                </span>
                <span className="mt-auto flex items-center gap-1 pt-1 text-sm text-zinc-500 transition group-hover:text-zinc-900 dark:group-hover:text-zinc-100">
                  Buka
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                    className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                  >
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
