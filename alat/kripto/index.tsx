'use client'

import { useMemo } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// /api/v3/coins/markets: array koin dengan data pasar.
type Koin = {
  id: string
  symbol: string
  name: string
  current_price: number
  market_cap_rank: number | null
  price_change_percentage_24h: number | null
}

export default function AlatKripto({ api }: PropAlat) {
  const pasar = useApi<Koin[]>(api, 'top')

  const baris = useMemo(
    () =>
      [...(pasar.data ?? [])].sort(
        (a, b) => (a.market_cap_rank ?? 999) - (b.market_cap_rank ?? 999),
      ),
    [pasar.data],
  )

  if (pasar.loading) return <Kerangka baris={10} />
  if (pasar.error) return <Galat pesan={pasar.error} onUlangi={pasar.ulangi} />
  if (baris.length === 0) {
    return (
      <Kosong
        pesan="Data harga kripto tidak bisa dimuat."
        saran="CoinGecko membatasi permintaan tanpa API key; coba lagi sebentar."
      />
    )
  }

  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {baris.map((k) => (
        <li key={k.id} className="flex items-center gap-3 py-3">
          <span className="w-6 shrink-0 text-sm tabular-nums text-zinc-400">
            {k.market_cap_rank ?? '–'}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-medium leading-snug">{k.name}</p>
            <p className="teks-mikro uppercase text-zinc-500">{k.symbol}</p>
          </div>
          <div className="text-right">
            <p className="tabular-nums">{RUPIAH.format(k.current_price)}</p>
            <Perubahan nilai={k.price_change_percentage_24h} />
          </div>
        </li>
      ))}
    </ul>
  )
}

const RUPIAH = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

function Perubahan({ nilai }: { nilai: number | null }) {
  if (nilai === null) return <p className="teks-mikro text-zinc-400">–</p>
  const naik = nilai >= 0
  return (
    <p
      className={`teks-mikro tabular-nums ${
        naik ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
      }`}
    >
      {naik ? '▲' : '▼'} {Math.abs(nilai).toFixed(2)}%
    </p>
  )
}
