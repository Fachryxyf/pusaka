'use client'

import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// /api/v3/PublicHolidays/{tahun}/{kode}: array hari libur.
type Libur = {
  date: string // YYYY-MM-DD
  localName: string
  name: string
  types: string[]
}

const SEKARANG = new Date().getFullYear()
// Nager menyediakan tahun lampau sampai beberapa tahun ke depan.
const TAHUN = Array.from({ length: 7 }, (_, i) => String(SEKARANG - 1 + i))

export default function AlatHariLibur({ api }: PropAlat) {
  const [tahun, setTahun] = useState(String(SEKARANG))

  const libur = useApi<Libur[]>(api, 'liburTahun', { tahun, kode: 'ID' })

  const opsiTahun = useMemo(() => TAHUN.map((t) => ({ nilai: t, label: t })), [])
  const baris = useMemo(
    () => [...(libur.data ?? [])].sort((a, b) => a.date.localeCompare(b.date)),
    [libur.data],
  )

  return (
    <div className="space-y-6">
      <section className="max-w-xs space-y-1">
        <Pilih
          id="pilih-tahun-libur"
          label="Tahun"
          nilai={tahun}
          opsi={opsiTahun}
          onPilih={setTahun}
        />
      </section>

      <section className="space-y-3">
        {libur.loading && <Kerangka baris={8} />}
        {!libur.loading && libur.error && <Galat pesan={libur.error} onUlangi={libur.ulangi} />}
        {!libur.loading && !libur.error && baris.length === 0 && (
          <Kosong
            pesan={`Tidak ada data hari libur untuk tahun ${tahun}.`}
            saran="Coba pilih tahun lain."
          />
        )}
        {baris.length > 0 && <Daftar baris={baris} />}
      </section>
    </div>
  )
}

const TANGGAL = new Intl.DateTimeFormat('id-ID', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

function Daftar({ baris }: { baris: Libur[] }) {
  return (
    <ul className="divide-y divide-zinc-200 dark:divide-zinc-800">
      {baris.map((h) => (
        <li key={`${h.date}-${h.name}`} className="flex items-baseline gap-4 py-3">
          <time
            dateTime={h.date}
            className="w-40 shrink-0 text-sm tabular-nums text-zinc-500"
          >
            {TANGGAL.format(new Date(`${h.date}T00:00:00`))}
          </time>
          <div className="min-w-0">
            <p className="font-medium leading-snug">{h.localName}</p>
            {h.name !== h.localName && (
              <p className="teks-mikro text-zinc-500">{h.name}</p>
            )}
          </div>
        </li>
      ))}
    </ul>
  )
}
