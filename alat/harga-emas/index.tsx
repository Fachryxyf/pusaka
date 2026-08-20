'use client'

import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// /api/prices adalah daftar SUMBER, bentuknya beda dari endpoint harga: kunci akarnya
// cuma `data`, tanpa success/count/timestamp (REFERENCE.md).
type Sumber = { name: string; displayName: string; urlHomepage?: string }
type BalasanSumber = { data?: Sumber[] }

type Harga = {
  source: string
  materialType: string
  // number, bisa desimal: 0.01 sampai 1000.
  weight: number
  // "gr" di sebagian sumber, "gram" di sumber lain — hanya untuk tampilan.
  weightUnit: string
  sellPrice: number
  // Sering null ATAU 0 — 8 dari 18 sumber begitu. Jangan diasumsikan ada.
  buybackPrice: number | null
  currency: string
  recordedDate: string
  displayName: string
  urlHomepage?: string
}
type BalasanHarga = {
  success?: boolean
  data?: Harga[]
  count?: number
  // Waktu API mengambil datanya, BUKAN tanggal harganya.
  timestamp?: string
  cached?: boolean
}

const BAWAAN = 'anekalogam'

export default function AlatHargaEmas({ api }: PropAlat) {
  const [sumber, setSumber] = useState(BAWAAN)

  const daftar = useApi<BalasanSumber>(api, 'daftarSumber')
  // Dimuat setelah daftar sumber selesai, bukan serentak.
  const harga = useApi<BalasanHarga>(api, 'hargaSumber', { sumber }, !daftar.loading)

  const opsiSumber = useMemo(
    () =>
      (daftar.data?.data ?? []).map((s) => ({
        nilai: s.name,
        label: s.displayName || s.name,
      })),
    [daftar.data],
  )

  const isi = harga.data
  // Diurutkan dari berat terkecil supaya harga per gram mudah dibandingkan.
  const baris = useMemo(
    () => [...(isi?.data ?? [])].sort((a, b) => a.weight - b.weight),
    [isi],
  )

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        {daftar.sumber === 'mirror' && <BannerMirror per={daftar.per} />}

        {daftar.loading ? (
          <>
            <span className="block text-sm font-medium">Sumber harga</span>
            <Kerangka baris={1} />
          </>
        ) : daftar.error ? (
          <>
            <span className="block text-sm font-medium">Sumber harga</span>
            <Galat pesan={daftar.error} onUlangi={daftar.ulangi} />
          </>
        ) : opsiSumber.length === 0 ? (
          <>
            <span className="block text-sm font-medium">Sumber harga</span>
            <Kosong pesan="Daftar sumber tidak bisa dimuat." saran="Coba muat ulang halaman." />
          </>
        ) : (
          <>
            <Pilih
              id="pilih-sumber-emas"
              label="Sumber harga"
              nilai={sumber}
              opsi={opsiSumber}
              onPilih={setSumber}
            />
            <p className="text-xs text-zinc-500">{opsiSumber.length} sumber tersedia</p>
          </>
        )}
      </section>

      <section className="space-y-3">
        {harga.sumber === 'mirror' && <BannerMirror per={harga.per} />}

        {harga.loading && <Kerangka baris={6} />}
        {!harga.loading && harga.error && <Galat pesan={harga.error} onUlangi={harga.ulangi} />}
        {!harga.loading && !harga.error && baris.length === 0 && (
          <Kosong
            pesan="Sumber ini tidak mengirimkan harga sekarang."
            saran="Coba sumber lain dari daftar di atas."
          />
        )}

        {baris.length > 0 && <Tabel baris={baris} isi={isi} />}
      </section>
    </div>
  )
}

function Tabel({ baris, isi }: { baris: Harga[]; isi: BalasanHarga | null }) {
  const pertama = baris[0]
  // recordedDate = tanggal harga berlaku. timestamp = waktu API mengambilnya.
  // Keduanya bisa beda hari karena timestamp UTC (REFERENCE.md).
  const tanggalHarga = [...new Set(baris.map((b) => b.recordedDate))].filter(Boolean)

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-lg font-semibold">
          {pertama.displayName || pertama.source}
        </h2>
        <span className="text-xs text-zinc-500">{baris.length} pilihan berat</span>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Harga berlaku {tanggalHarga.length === 1 ? tanggalTampil(tanggalHarga[0]) : tanggalHarga.map(tanggalTampil).join(' dan ')}
        {isi?.timestamp && ` · diambil ${waktuTampil(isi.timestamp)}`}
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <thead>
            <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
              <th className="py-2 pr-4 font-medium">Berat</th>
              <th className="py-2 pr-4 font-medium">Harga jual</th>
              <th className="py-2 pr-4 font-medium">Per gram</th>
              <th className="py-2 pr-4 font-medium">Buyback</th>
              <th className="py-2 font-medium">Jenis</th>
            </tr>
          </thead>
          <tbody>
            {baris.map((b, i) => (
              <tr
                key={`${b.weight}-${b.materialType}-${i}`}
                className="border-b border-zinc-100 dark:border-zinc-800/60"
              >
                <td className="py-2 pr-4 tabular-nums">
                  {angka(b.weight)} {b.weightUnit}
                </td>
                <td className="py-2 pr-4 font-medium tabular-nums">{rupiah(b.sellPrice)}</td>
                {/* Harga per gram: satu-satunya cara membandingkan antar sumber, karena
                    beratnya sangat bervariasi (0,01 sampai 1000 gram). */}
                <td className="py-2 pr-4 tabular-nums text-zinc-600 dark:text-zinc-400">
                  {b.weight > 0 ? rupiah(Math.round(b.sellPrice / b.weight)) : '—'}
                </td>
                {/* buybackPrice null ATAU 0 berarti tidak dinyatakan. Menampilkan "Rp 0"
                    akan bikin pembaca menyangka emasnya tidak bisa dijual kembali. */}
                <td className="py-2 pr-4 tabular-nums text-zinc-600 dark:text-zinc-400">
                  {b.buybackPrice ? rupiah(b.buybackPrice) : <span className="text-zinc-400">tidak dinyatakan</span>}
                </td>
                <td className="py-2 text-xs text-zinc-600 dark:text-zinc-400">
                  {b.materialType && b.materialType !== 'unknown' ? b.materialType : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {baris.some((b) => !b.buybackPrice) && (
        <p className="text-xs text-zinc-500">
          Sebagian sumber tidak mengirimkan harga buyback. Yang kosong dibiarkan kosong, bukan
          ditulis nol.
        </p>
      )}

      <p className="text-xs text-zinc-500">
        Harga dikumpulkan logam-mulia-api dari situs penjualnya masing-masing dan bisa berbeda
        dari harga di gerai. Ini bukan penawaran, dan bukan saran investasi — periksa langsung
        ke{' '}
        {pertama.urlHomepage ? (
          <a
            href={pertama.urlHomepage}
            rel="noopener noreferrer"
            target="_blank"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            {pertama.displayName || pertama.source}
          </a>
        ) : (
          'penjualnya'
        )}{' '}
        sebelum bertransaksi.
      </p>
    </div>
  )
}

function rupiah(n: number): string {
  if (!Number.isFinite(n)) return '—'
  return `Rp ${n.toLocaleString('id-ID')}`
}

// weight bisa desimal (0.01) maupun bulat (1000) — jangan dipaksa ke satu bentuk.
function angka(n: number): string {
  return n.toLocaleString('id-ID', { maximumFractionDigits: 2 })
}

function tanggalTampil(iso: string): string {
  const w = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(w)) return iso
  return new Intl.DateTimeFormat('id-ID', { timeZone: 'UTC', dateStyle: 'long' }).format(w)
}

function waktuTampil(iso: string): string {
  const w = Date.parse(iso)
  if (Number.isNaN(w)) return iso
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(w)
}
