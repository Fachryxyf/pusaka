'use client'

import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// /v1/currencies: objek datar kode->nama ("IDR": "Indonesian Rupiah").
type DaftarMataUang = Record<string, string>

// /v1/latest?base=&symbols=: amount selalu 1, rates berisi satu kurs tujuan.
type BalasanKurs = {
  amount: number
  base: string
  date: string
  rates: Record<string, number>
}

const DARI_BAWAAN = 'USD'
const KE_BAWAAN = 'IDR'

export default function AlatKurs({ api }: PropAlat) {
  const [jumlah, setJumlah] = useState('1')
  const [dari, setDari] = useState(DARI_BAWAAN)
  const [ke, setKe] = useState(KE_BAWAAN)

  const mataUang = useApi<DaftarMataUang>(api, 'mataUang')

  // Mata uang yang sama tidak perlu memanggil jaringan: kursnya pasti 1.
  const sama = dari === ke
  const kurs = useApi<BalasanKurs>(
    api,
    'konversi',
    { dari, ke },
    !mataUang.loading && !mataUang.error && !sama,
  )

  const opsi = useMemo(
    () =>
      Object.entries(mataUang.data ?? {})
        .map(([kode, nama]) => ({ nilai: kode, label: `${kode} — ${nama}` }))
        .sort((a, b) => a.nilai.localeCompare(b.nilai)),
    [mataUang.data],
  )

  const angka = Number.parseFloat(jumlah.replace(',', '.'))
  const jumlahSah = Number.isFinite(angka) && angka >= 0

  const nilaiKurs = sama ? 1 : (kurs.data?.rates?.[ke] ?? null)
  const hasil = jumlahSah && nilaiKurs !== null ? angka * nilaiKurs : null
  const tanggal = sama ? null : kurs.data?.date ?? null

  function tukar() {
    setDari(ke)
    setKe(dari)
  }

  if (mataUang.loading) {
    return <Kerangka baris={5} />
  }
  if (mataUang.error) {
    return <Galat pesan={mataUang.error} onUlangi={mataUang.ulangi} />
  }
  if (opsi.length === 0) {
    return (
      <Kosong
        pesan="Daftar mata uang tidak bisa dimuat."
        saran="Coba muat ulang halaman ini sebentar lagi."
      />
    )
  }

  return (
    <div className="space-y-6">
      <section className="space-y-1.5">
        <label htmlFor="jumlah-kurs" className="block text-sm font-medium">
          Jumlah
        </label>
        <input
          id="jumlah-kurs"
          type="text"
          inputMode="decimal"
          value={jumlah}
          onChange={(e) => setJumlah(e.target.value)}
          aria-invalid={!jumlahSah}
          className="fokus-cincin w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base tabular-nums dark:border-zinc-700 dark:bg-zinc-900"
        />
        {!jumlahSah && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            Masukkan angka yang sah, mis. 1500 atau 2,5.
          </p>
        )}
      </section>

      <section className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <Pilih id="kurs-dari" label="Dari" nilai={dari} opsi={opsi} onPilih={setDari} />
        <button
          type="button"
          onClick={tukar}
          aria-label="Tukar mata uang"
          className="fokus-cincin mx-auto rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
        >
          ⇅
        </button>
        <Pilih id="kurs-ke" label="Ke" nilai={ke} opsi={opsi} onPilih={setKe} />
      </section>

      <section className="space-y-3" aria-live="polite">
        {kurs.loading && <Kerangka baris={2} />}
        {!kurs.loading && kurs.error && <Galat pesan={kurs.error} onUlangi={kurs.ulangi} />}
        {!kurs.loading && !kurs.error && hasil !== null && (
          <Hasil
            jumlah={angka}
            dari={dari}
            ke={ke}
            hasil={hasil}
            nilaiKurs={nilaiKurs!}
            tanggal={tanggal}
            sama={sama}
          />
        )}
      </section>
    </div>
  )
}

const RUPIAH = new Intl.NumberFormat('id-ID', { maximumFractionDigits: 2 })

function Hasil({
  jumlah,
  dari,
  ke,
  hasil,
  nilaiKurs,
  tanggal,
  sama,
}: {
  jumlah: number
  dari: string
  ke: string
  hasil: number
  nilaiKurs: number
  tanggal: string | null
  sama: boolean
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/50">
      <p className="text-sm text-zinc-500">
        {RUPIAH.format(jumlah)} {dari} setara dengan
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">
        {RUPIAH.format(hasil)} <span className="text-zinc-500">{ke}</span>
      </p>
      <p className="teks-mikro mt-3 text-zinc-500">
        {sama ? (
          <>Mata uang sama, kurs 1 : 1.</>
        ) : (
          <>
            Kurs 1 {dari} = {RUPIAH.format(nilaiKurs)} {ke}
            {tanggal ? ` · acuan ${tanggal}` : ''}
          </>
        )}
      </p>
    </div>
  )
}
