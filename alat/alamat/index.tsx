'use client'

import { useState, type FormEvent } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// /search?format=jsonv2: array tempat.
type Tempat = {
  place_id: number
  lat: string
  lon: string
  display_name: string
  type?: string
  addresstype?: string
}

export default function AlatAlamat({ api }: PropAlat) {
  const [kueri, setKueri] = useState('')
  // Dipisah dari input: fetch hanya jalan saat form dikirim, bukan tiap ketik —
  // Nominatim membatasi 1 permintaan/detik.
  const [cari, setCari] = useState('')

  const hasil = useApi<Tempat[]>(api, 'cari', { kata: cari }, cari.length > 0)

  function kirim(e: FormEvent) {
    e.preventDefault()
    setCari(kueri.trim())
  }

  return (
    <div className="space-y-6">
      <form onSubmit={kirim} className="flex gap-2">
        <input
          type="search"
          value={kueri}
          onChange={(e) => setKueri(e.target.value)}
          placeholder="mis. Monas Jakarta, atau Jl. Malioboro Yogyakarta"
          aria-label="Nama tempat atau alamat"
          className="fokus-cincin min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={kueri.trim().length === 0}
          className="fokus-cincin shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          Cari
        </button>
      </form>

      <section className="space-y-3">
        {cari.length === 0 && (
          <p className="text-sm text-zinc-500">
            Ketik nama tempat lalu tekan Cari untuk melihat koordinatnya.
          </p>
        )}
        {cari.length > 0 && hasil.loading && <Kerangka baris={5} />}
        {cari.length > 0 && !hasil.loading && hasil.error && (
          <Galat pesan={hasil.error} onUlangi={hasil.ulangi} />
        )}
        {cari.length > 0 && !hasil.loading && !hasil.error && (hasil.data?.length ?? 0) === 0 && (
          <Kosong
            pesan={`Tidak ada hasil untuk “${cari}”.`}
            saran="Coba kata kunci yang lebih umum atau tambahkan nama kota."
          />
        )}
        {(hasil.data?.length ?? 0) > 0 && (
          <ul className="space-y-2">
            {hasil.data!.map((t) => (
              <li
                key={t.place_id}
                className="rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
              >
                <p className="font-medium leading-snug">{t.display_name}</p>
                <p className="teks-mikro mt-1 tabular-nums text-zinc-500">
                  {Number(t.lat).toFixed(5)}, {Number(t.lon).toFixed(5)}
                  {t.addresstype || t.type ? ` · ${t.addresstype ?? t.type}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
