'use client'

import { useState, type FormEvent } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih, type Opsi } from '@/komponen/Pilih'

// /get: { responseData: { translatedText, match }, ... }
type Terjemahan = {
  responseData: { translatedText: string; match: number }
}

const PASANGAN: Opsi[] = [
  { nilai: 'en|id', label: 'Inggris → Indonesia' },
  { nilai: 'id|en', label: 'Indonesia → Inggris' },
  { nilai: 'ar|id', label: 'Arab → Indonesia' },
  { nilai: 'id|ar', label: 'Indonesia → Arab' },
  { nilai: 'ja|id', label: 'Jepang → Indonesia' },
  { nilai: 'zh|id', label: 'Mandarin → Indonesia' },
]

export default function AlatTerjemahan({ api }: PropAlat) {
  const [teks, setTeks] = useState('')
  const [pasangan, setPasangan] = useState('en|id')
  // Dipisah dari input: fetch hanya saat dikirim, bukan tiap ketik — kuota harian terbatas.
  const [kirimTeks, setKirimTeks] = useState('')
  const [kirimPasangan, setKirimPasangan] = useState('en|id')

  const hasil = useApi<Terjemahan>(
    api,
    'terjemah',
    { teks: kirimTeks, pasangan: kirimPasangan },
    kirimTeks.length > 0,
  )

  function kirim(e: FormEvent) {
    e.preventDefault()
    const bersih = teks.trim()
    if (bersih.length === 0) return
    setKirimPasangan(pasangan)
    setKirimTeks(bersih)
  }

  const terjemahan = hasil.data?.responseData.translatedText ?? ''

  return (
    <div className="space-y-6">
      <form onSubmit={kirim} className="space-y-3">
        <div className="w-full sm:w-72">
          <Pilih label="Arah terjemahan" nilai={pasangan} opsi={PASANGAN} onPilih={setPasangan} />
        </div>
        <textarea
          value={teks}
          onChange={(e) => setTeks(e.target.value)}
          placeholder="Ketik teks yang ingin diterjemahkan…"
          aria-label="Teks sumber"
          rows={3}
          className="fokus-cincin w-full resize-y rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
        />
        <button
          type="submit"
          disabled={teks.trim().length === 0}
          className="fokus-cincin rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition enabled:hover:bg-zinc-700 disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900 dark:enabled:hover:bg-zinc-300"
        >
          Terjemahkan
        </button>
      </form>

      <section className="space-y-3">
        {kirimTeks.length === 0 && (
          <p className="text-sm text-zinc-500">
            Pilih arah, ketik teks, lalu tekan Terjemahkan. Kualitas bisa bervariasi karena
            memakai memori terjemahan komunitas.
          </p>
        )}
        {kirimTeks.length > 0 && hasil.loading && <Kerangka baris={2} />}
        {kirimTeks.length > 0 && !hasil.loading && hasil.error && (
          <Galat pesan={hasil.error} onUlangi={hasil.ulangi} />
        )}
        {kirimTeks.length > 0 && !hasil.loading && !hasil.error && terjemahan.length === 0 && (
          <Kosong pesan="Tidak ada hasil terjemahan." saran="Coba teks yang lebih pendek." />
        )}
        {terjemahan.length > 0 && (
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-lg leading-relaxed">{terjemahan}</p>
            <p className="teks-mikro mt-2 tabular-nums text-zinc-500">
              kecocokan {Math.round((hasil.data?.responseData.match ?? 0) * 100)}%
            </p>
          </div>
        )}
      </section>
    </div>
  )
}
