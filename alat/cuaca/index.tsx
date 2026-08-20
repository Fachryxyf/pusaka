'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import {
  KOSONG,
  PemilihWilayah,
  gantiTingkat,
  type PilihanWilayah,
} from '@/komponen/PemilihWilayah'

// Bentuk diambil dari REFERENCE.md. Perhatikan: cuaca adalah array BERSARANG DUA
// TINGKAT, dan tiap sub-array adalah satu hari kalender di zona lokasinya.
type Butir = {
  local_datetime: string
  utc_datetime: string
  t: number
  hu: number
  ws: number
  wd: string
  weather_desc: string
  vs_text: string
  image: string
}

type Balasan = {
  lokasi?: {
    provinsi: string
    kotkab: string
    kecamatan: string
    desa: string
    adm4: string
    timezone: string
  }
  data?: { cuaca?: Butir[][] }[]
}

export default function AlatCuaca({ api, pendukung }: PropAlat) {
  const wilayah = pendukung['wilayah-idn-area']
  const [pilihan, setPilihan] = useState<PilihanWilayah>(KOSONG)

  // adm4 = kode desa, dipakai APA ADANYA. Tidak ada konversi format di project ini;
  // kode wilayah-emsifa dijawab 404 oleh BMKG (SPEC §6.5, diuji ulang 2026-08-21).
  const adm4 = pilihan[3]

  const { data, loading, error, sumber, per, ulangi } = useApi<Balasan>(
    api,
    'prakiraan',
    { kodeDesa: adm4 },
    adm4 !== '',
  )

  return (
    <div className="space-y-6">
      <section className="space-y-2">
        <PemilihWilayah
          api={wilayah}
          pilihan={pilihan}
          onPilih={(tingkat, kode) => setPilihan((lama) => gantiTingkat(lama, tingkat, kode))}
          sampai={3}
        />
      </section>

      <section className="space-y-3">
        {sumber === 'mirror' && <BannerMirror per={per} />}

        {adm4 === '' && (
          <Kosong
            pesan="Pilih desa atau kelurahan dulu."
            saran="BMKG menyediakan prakiraan sampai tingkat desa, jadi keempat tingkat perlu dipilih."
          />
        )}

        {adm4 !== '' && loading && <Kerangka baris={6} />}
        {adm4 !== '' && !loading && error && <Galat pesan={error} onUlangi={ulangi} />}
        {adm4 !== '' && !loading && !error && !data?.lokasi && (
          <Kosong
            pesan="BMKG tidak punya prakiraan untuk desa ini."
            saran="Coba desa lain di kecamatan yang sama."
          />
        )}

        {data?.lokasi && <Prakiraan balasan={data} />}
      </section>
    </div>
  )
}

function Prakiraan({ balasan }: { balasan: Balasan }) {
  const lokasi = balasan.lokasi!
  const hari = balasan.data?.[0]?.cuaca ?? []

  // Label hari dihitung dari tanggal di local_datetime, BUKAN dari indeks array —
  // jumlah kelompok dan urutannya tidak dijamin (REFERENCE.md).
  const hariIniLokal = useMemo(() => tanggalDiZona(new Date(), lokasi.timezone), [lokasi.timezone])

  if (hari.length === 0) {
    return <Kosong pesan="Prakiraannya kosong untuk desa ini." />
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold">{lokasi.desa}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {lokasi.kecamatan}, {lokasi.kotkab}, {lokasi.provinsi}
        </p>
        <p className="text-xs text-zinc-500">
          <code className="font-mono">{lokasi.adm4}</code> · waktu {lokasi.timezone}
        </p>
      </div>

      {hari.map((butirHari, i) => {
        if (butirHari.length === 0) return null
        const tanggal = butirHari[0].local_datetime.slice(0, 10)
        return (
          <section key={tanggal || i} className="space-y-2">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
              {labelHari(tanggal, hariIniLokal)}
            </h3>
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {butirHari.map((b) => (
                <li key={b.utc_datetime} className="flex items-center gap-3 px-4 py-3">
                  <span className="w-12 shrink-0 text-sm tabular-nums text-zinc-600 dark:text-zinc-400">
                    {b.local_datetime.slice(11, 16)}
                  </span>
                  <IkonCuaca url={b.image} keterangan={b.weather_desc} />
                  <span className="w-12 shrink-0 text-lg font-medium tabular-nums">{b.t}°</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm">{b.weather_desc}</span>
                    <span className="block text-xs text-zinc-500">
                      Lembap {b.hu}% · angin {b.ws} km/jam {b.wd} · pandang {b.vs_text}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <p className="text-xs text-zinc-500">
        Jam yang ditampilkan adalah waktu setempat di {lokasi.desa} ({lokasi.timezone}), bukan
        waktu di perangkatmu. Sumber data: BMKG.
      </p>
    </div>
  )
}

function IkonCuaca({ url, keterangan }: { url: string; keterangan: string }) {
  const [gagal, setGagal] = useState(false)
  // Ikon BMKG kadang gagal dimuat; ruangnya tetap dipesan supaya barisnya tidak bergeser.
  if (gagal || !url) return <span className="h-8 w-8 shrink-0" aria-hidden="true" />

  return (
    <Image
      src={url}
      alt={keterangan}
      width={32}
      height={32}
      unoptimized
      onError={() => setGagal(true)}
      className="h-8 w-8 shrink-0"
    />
  )
}

// local_datetime adalah waktu dinding di lokasi prakiraan, tanpa penanda zona.
// Menyerahkannya ke new Date() ditafsirkan berbeda antar mesin JS, jadi tanggal
// pembanding dihitung lewat Intl dengan timeZone dari response (REFERENCE.md).
function tanggalDiZona(waktu: Date, zona: string): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: zona,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(waktu)
  } catch {
    // Zona tidak dikenali mesin ini: label hari dilewati, jam tetap ditampilkan.
    return ''
  }
}

function labelHari(tanggal: string, hariIniLokal: string): string {
  if (!tanggal) return 'Prakiraan'
  if (!hariIniLokal) return formatTanggal(tanggal)

  const selisih = selisihHari(hariIniLokal, tanggal)
  if (selisih === 0) return 'Hari ini'
  if (selisih === 1) return 'Besok'
  if (selisih === 2) return 'Lusa'
  return formatTanggal(tanggal)
}

function selisihHari(dari: string, ke: string): number {
  // Keduanya YYYY-MM-DD. Dibandingkan sebagai UTC tengah malam supaya pergeseran
  // musim panas di zona mana pun tidak ikut terhitung.
  const a = Date.parse(`${dari}T00:00:00Z`)
  const b = Date.parse(`${ke}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return -1
  return Math.round((b - a) / 86_400_000)
}

function formatTanggal(tanggal: string): string {
  const waktu = Date.parse(`${tanggal}T00:00:00Z`)
  if (Number.isNaN(waktu)) return tanggal
  return new Intl.DateTimeFormat('id-ID', {
    timeZone: 'UTC',
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  }).format(waktu)
}
