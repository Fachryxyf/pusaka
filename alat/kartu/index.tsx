'use client'

import { useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih, type Opsi } from '@/komponen/Pilih'

// /api/deck/new/draw/?count=: dek baru langsung ditarik.
type Kartu = {
  code: string
  value: string
  suit: string
  image: string
}
type Tarikan = {
  success: boolean
  cards: Kartu[]
  remaining: number
}

const OPSI_JUMLAH: Opsi[] = Array.from({ length: 10 }, (_, i) => {
  const n = String(i + 1)
  return { nilai: n, label: `${n} kartu` }
})

export default function AlatKartu({ api }: PropAlat) {
  const [jumlah, setJumlah] = useState('5')
  const [mulai, setMulai] = useState(false)

  const hasil = useApi<Tarikan>(api, 'tarik', { jumlah }, mulai)

  // Tombol memulai tarikan pertama, lalu memaksa fetch ulang (ulangi) tiap klik —
  // responsnya acak, jadi "kocok lagi" harus benar-benar memanggil ulang.
  function tarik() {
    if (!mulai) setMulai(true)
    else hasil.ulangi()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2">
        <div className="w-40">
          <Pilih label="Jumlah kartu" nilai={jumlah} opsi={OPSI_JUMLAH} onPilih={setJumlah} />
        </div>
        <button
          type="button"
          onClick={tarik}
          className="fokus-cincin shrink-0 rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-300"
        >
          {mulai ? 'Kocok lagi' : 'Tarik kartu'}
        </button>
      </div>

      <section className="space-y-3">
        {!mulai && (
          <p className="text-sm text-zinc-500">
            Pilih berapa kartu lalu tekan Tarik kartu. Tiap tarikan memakai dek baru yang dikocok.
          </p>
        )}
        {mulai && hasil.loading && <Kerangka baris={3} />}
        {mulai && !hasil.loading && hasil.error && (
          <Galat pesan={hasil.error} onUlangi={hasil.ulangi} />
        )}
        {mulai && !hasil.loading && !hasil.error && (hasil.data?.cards.length ?? 0) === 0 && (
          <Kosong pesan="Tidak ada kartu yang tertarik." saran="Coba tekan Tarik kartu lagi." />
        )}
        {(hasil.data?.cards.length ?? 0) > 0 && (
          <>
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
              {hasil.data!.cards.map((k) => (
                <li
                  key={k.code}
                  className="rounded-lg border border-zinc-200 p-2 dark:border-zinc-800"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={k.image}
                    alt={`${k.value} ${k.suit}`}
                    loading="lazy"
                    className="mx-auto h-auto w-full max-w-[7rem]"
                  />
                </li>
              ))}
            </ul>
            <p className="teks-mikro tabular-nums text-zinc-500">
              {hasil.data!.cards.length} kartu ditarik · {hasil.data!.remaining} tersisa di dek
            </p>
          </>
        )}
      </section>
    </div>
  )
}
