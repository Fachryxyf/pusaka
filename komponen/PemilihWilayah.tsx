'use client'

import type { Api } from '@/registry/schema'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// Response idn-area dibungkus {statusCode, message, data, meta} (REFERENCE.md).
type Wilayah = { code: string; name: string }
type Balasan = { data?: Wilayah[]; meta?: { pagination?: { total?: number } } }

export const TINGKAT = [
  { kunci: 'provinsi', label: 'Provinsi', endpoint: 'provinsi', param: null },
  { kunci: 'kabupaten', label: 'Kabupaten/Kota', endpoint: 'kabupaten', param: 'kodeProvinsi' },
  { kunci: 'kecamatan', label: 'Kecamatan', endpoint: 'kecamatan', param: 'kodeKabupaten' },
  { kunci: 'kelurahan', label: 'Desa/Kelurahan', endpoint: 'kelurahan', param: 'kodeKecamatan' },
] as const

export type PilihanWilayah = [string, string, string, string]

export const KOSONG: PilihanWilayah = ['', '', '', '']

// Mengganti pilihan di satu tingkat mengosongkan semua tingkat di bawahnya.
export function gantiTingkat(lama: PilihanWilayah, tingkat: number, kode: string): PilihanWilayah {
  return lama.map((v, i) => (i === tingkat ? kode : i > tingkat ? '' : v)) as PilihanWilayah
}

// Kode terdalam yang sudah dipilih. Dipakai alat Cuaca sebagai adm4 — apa adanya,
// tanpa konversi format apa pun (SPEC §6.5).
export function kodeTerdalam(pilihan: PilihanWilayah): string {
  return [...pilihan].reverse().find((k) => k !== '') ?? ''
}

// Dipakai alat Wilayah dan alat Cuaca — jangan ditulis dua kali (UI-SPEC Alat 4).
export function PemilihWilayah({
  api,
  pilihan,
  onPilih,
  sampai = 3,
}: {
  api: Api
  pilihan: PilihanWilayah
  onPilih: (tingkat: number, kode: string) => void
  // Indeks tingkat terakhir yang ditampilkan. Alat Cuaca butuh keempatnya (adm4).
  sampai?: number
}) {
  return (
    <div className="space-y-4">
      {TINGKAT.slice(0, sampai + 1).map((t, i) => (
        <SatuTingkat
          key={t.kunci}
          api={api}
          label={t.label}
          endpointId={t.endpoint}
          params={t.param && pilihan[i - 1] ? { [t.param]: pilihan[i - 1] } : {}}
          aktif={i === 0 || pilihan[i - 1] !== ''}
          nilai={pilihan[i]}
          onPilih={(kode) => onPilih(i, kode)}
        />
      ))}
    </div>
  )
}

function SatuTingkat({
  api,
  label,
  endpointId,
  params,
  aktif,
  nilai,
  onPilih,
}: {
  api: Api
  label: string
  endpointId: string
  params: Record<string, string>
  aktif: boolean
  nilai: string
  onPilih: (kode: string) => void
}) {
  const { data, loading, error, sumber, per, ulangi } = useApi<Balasan>(api, endpointId, params, aktif)
  const daftar = data?.data ?? []
  const total = data?.meta?.pagination?.total

  // API ini berhalaman. Kalau yang datang lebih sedikit dari total, ada yang terpotong —
  // dan itu wajib kelihatan, bukan disembunyikan (REFERENCE.md).
  const terpotong = typeof total === 'number' && daftar.length < total

  return (
    <div className="space-y-1">
      {sumber === 'mirror' && <BannerMirror per={per} />}

      {!aktif ? (
        <Label label={label} redup>
          <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700">
            Pilih tingkat di atasnya dulu.
          </p>
        </Label>
      ) : loading ? (
        <Label label={label}>
          <Kerangka baris={1} />
        </Label>
      ) : error ? (
        <Label label={label}>
          <Galat pesan={error} onUlangi={ulangi} />
        </Label>
      ) : daftar.length === 0 ? (
        <Label label={label}>
          <Kosong pesan={`Tidak ada ${label.toLowerCase()} untuk pilihan ini.`} />
        </Label>
      ) : (
        <>
          <Pilih
            id={`pilih-${endpointId}`}
            label={label}
            nilai={nilai}
            opsi={daftar.map((w) => ({ nilai: w.code, label: w.name }))}
            onPilih={onPilih}
            placeholder={`Pilih ${label.toLowerCase()}`}
          />
          <p className="text-xs text-zinc-500">
            {daftar.length} pilihan
            {terpotong && ` dari ${total} — daftar terpotong oleh paginasi API`}
          </p>
        </>
      )}
    </div>
  )
}

function Label({
  label,
  redup = false,
  children,
}: {
  label: string
  redup?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <span className={`block text-sm font-medium ${redup ? 'text-zinc-500' : ''}`}>{label}</span>
      {children}
    </div>
  )
}
