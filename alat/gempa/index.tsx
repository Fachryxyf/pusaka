'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import type { Api } from '@/registry/schema'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// Bentuk field diambil apa adanya dari REFERENCE.md — semuanya string, termasuk Magnitude.
type Gempa = {
  Tanggal: string
  Jam: string
  DateTime: string
  Coordinates: string
  Lintang: string
  Bujur: string
  Magnitude: string
  Kedalaman: string
  Wilayah: string
  Potensi?: string   // ada di autogempa & terkini, TIDAK ada di dirasakan
  Dirasakan?: string // ada di autogempa & dirasakan, TIDAK ada di terkini
  Shakemap?: string  // hanya autogempa
}

// autogempa → Infogempa.gempa objek tunggal; terkini/dirasakan → array (SPEC §6.1).
type BalasanSatu = { Infogempa?: { gempa?: Gempa } }
type BalasanBanyak = { Infogempa?: { gempa?: Gempa[] } }

const URL_SHAKEMAP = 'https://data.bmkg.go.id/DataMKG/TEWS/'

export default function AlatGempa({ api }: PropAlat) {
  return (
    <div className="space-y-8">
      <GempaTerkini api={api} />
      <DaftarGempa api={api} endpointId="dirasakan" judul="Dirasakan masyarakat" />
      <DaftarGempa api={api} endpointId="terkini" judul="Magnitudo 5,0+" />
    </div>
  )
}

function GempaTerkini({ api }: { api: Api }) {
  const { data, loading, error, sumber, per, ulangi } = useApi<BalasanSatu>(api, 'autogempa')
  const gempa = data?.Infogempa?.gempa

  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Gempa terkini</h2>

      {sumber === 'mirror' && <BannerMirror per={per} />}

      {loading && <Kerangka baris={4} />}
      {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
      {!loading && !error && !gempa && <Kosong pesan="BMKG belum mengirim data gempa terkini." />}

      {gempa && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <div className="flex items-start gap-4">
            <Magnitudo nilai={gempa.Magnitude} />
            <div className="space-y-1">
              <p className="font-medium">{gempa.Wilayah}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {gempa.Tanggal} · {gempa.Jam}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Kedalaman {gempa.Kedalaman}</p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {gempa.Lintang}, {gempa.Bujur}
              </p>
            </div>
          </div>

          {gempa.Potensi && <p className="mt-3 text-sm">{gempa.Potensi}</p>}
          {gempa.Dirasakan && (
            <p className="mt-1 text-sm">
              <span className="font-medium">Dirasakan:</span> {gempa.Dirasakan}
            </p>
          )}

          {gempa.Shakemap && <Shakemap berkas={gempa.Shakemap} wilayah={gempa.Wilayah} />}
        </div>
      )}
    </section>
  )
}

function DaftarGempa({ api, endpointId, judul }: { api: Api; endpointId: string; judul: string }) {
  const { data, loading, error, sumber, per, ulangi } = useApi<BalasanBanyak>(api, endpointId)
  const daftar = data?.Infogempa?.gempa ?? []

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">{judul}</h2>
        {daftar.length > 0 && (
          <span className="text-xs text-zinc-500">{daftar.length} terakhir</span>
        )}
      </div>

      {sumber === 'mirror' && <BannerMirror per={per} />}

      {loading && <Kerangka baris={5} />}
      {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
      {!loading && !error && daftar.length === 0 && (
        <Kosong pesan="Belum ada gempa yang tercatat di daftar ini." />
      )}

      {daftar.length > 0 && (
        <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {daftar.map((g, i) => (
            <li key={`${g.DateTime}-${i}`} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`w-12 shrink-0 text-right font-semibold tabular-nums ${
                  kuat(g.Magnitude) ? 'text-red-600 dark:text-red-400' : ''
                }`}
              >
                {g.Magnitude}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm">{g.Wilayah}</span>
                <span className="block text-xs text-zinc-500">
                  {g.Tanggal} · {g.Jam} · {g.Kedalaman}
                  {g.Dirasakan ? ` · ${g.Dirasakan}` : ''}
                </span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function Magnitudo({ nilai }: { nilai: string }) {
  return (
    <div
      className={`flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl border ${
        kuat(nilai)
          ? 'border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300'
          : 'border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900'
      }`}
    >
      {/* String aslinya ditampilkan supaya presisi BMKG tidak berubah (UI-SPEC Alat 1). */}
      <span className="text-2xl font-bold tabular-nums">{nilai}</span>
      <span className="text-xs uppercase tracking-wide">M</span>
    </div>
  )
}

function Shakemap({ berkas, wilayah }: { berkas: string; wilayah: string }) {
  const [gagal, setGagal] = useState(false)
  if (gagal) return null

  return (
    <Image
      src={URL_SHAKEMAP + berkas}
      alt={`Peta guncangan gempa: ${wilayah}`}
      width={640}
      height={640}
      unoptimized
      onError={() => setGagal(true)}
      className="mt-4 h-auto w-full rounded-lg border border-zinc-200 dark:border-zinc-800"
    />
  )
}

// Magnitude itu string; parseFloat hanya untuk ambang pewarnaan (UI-SPEC §1.3).
function kuat(magnitude: string) {
  return parseFloat(magnitude) >= 5
}
