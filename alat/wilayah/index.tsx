'use client'

import { useEffect, useState } from 'react'
import type { Api } from '@/registry/schema'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// Response dibungkus {statusCode, message, data, meta} — isinya di data (REFERENCE.md).
type Wilayah = { code: string; name: string }
type Balasan = {
  data?: Wilayah[]
  meta?: { pagination?: { total?: number } }
}

const TINGKAT = [
  { kunci: 'provinsi', label: 'Provinsi', endpoint: 'provinsi', param: null },
  { kunci: 'kabupaten', label: 'Kabupaten/Kota', endpoint: 'kabupaten', param: 'kodeProvinsi' },
  { kunci: 'kecamatan', label: 'Kecamatan', endpoint: 'kecamatan', param: 'kodeKabupaten' },
  { kunci: 'kelurahan', label: 'Desa/Kelurahan', endpoint: 'kelurahan', param: 'kodeKecamatan' },
] as const

export default function AlatWilayah({ api }: { api: Api }) {
  // Kode dipakai apa adanya — tidak ada konversi format di project ini (SPEC §6.5).
  const [pilihan, setPilihan] = useState<string[]>(['', '', '', ''])

  const pilih = (tingkat: number, kode: string) => {
    // Mengganti tingkat atas mengosongkan semua tingkat di bawahnya.
    setPilihan((lama) => lama.map((v, i) => (i === tingkat ? kode : i > tingkat ? '' : v)))
  }

  const kodeTerpilih = [...pilihan].reverse().find((k) => k !== '') ?? ''

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {TINGKAT.map((t, i) => (
          <Pemilih
            key={t.kunci}
            api={api}
            label={t.label}
            endpointId={t.endpoint}
            params={t.param && pilihan[i - 1] ? { [t.param]: pilihan[i - 1] } : {}}
            aktif={i === 0 || pilihan[i - 1] !== ''}
            nilai={pilihan[i]}
            onPilih={(kode) => pilih(i, kode)}
          />
        ))}
      </div>

      <HasilKode kode={kodeTerpilih} />
    </div>
  )
}

function Pemilih({
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

  // API ini berhalaman. Kalau jumlah yang datang lebih sedikit dari total, ada yang
  // terpotong — dan itu wajib kelihatan, bukan disembunyikan (REFERENCE.md).
  const terpotong = typeof total === 'number' && daftar.length < total

  const id = `pilih-${endpointId}`

  return (
    <div className="space-y-1">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
      </label>

      {sumber === 'mirror' && <BannerMirror per={per} />}

      {!aktif ? (
        <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700">
          Pilih tingkat di atasnya dulu.
        </p>
      ) : loading ? (
        <Kerangka baris={1} />
      ) : error ? (
        <Galat pesan={error} onUlangi={ulangi} />
      ) : daftar.length === 0 ? (
        <Kosong pesan={`Tidak ada ${label.toLowerCase()} untuk pilihan ini.`} />
      ) : (
        <>
          <select
            id={id}
            value={nilai}
            onChange={(e) => onPilih(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base dark:border-zinc-700 dark:bg-zinc-900"
          >
            <option value="">— pilih {label.toLowerCase()} —</option>
            {daftar.map((w) => (
              <option key={w.code} value={w.code}>
                {w.name}
              </option>
            ))}
          </select>
          <p className="text-xs text-zinc-500">
            {daftar.length} pilihan
            {terpotong && ` dari ${total} — daftar terpotong oleh paginasi API`}
          </p>
        </>
      )}
    </div>
  )
}

function HasilKode({ kode }: { kode: string }) {
  const [tersalin, setTersalin] = useState(false)

  useEffect(() => {
    if (!tersalin) return
    const t = setTimeout(() => setTersalin(false), 2000)
    return () => clearTimeout(t)
  }, [tersalin])

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(kode)
      setTersalin(true)
    } catch {
      // Clipboard ditolak (izin atau konteks tak aman) — kodenya tetap terlihat
      // dan bisa disalin manual, jadi tidak perlu galat yang mengagetkan.
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium">Kode wilayah</p>
      {kode ? (
        <div className="mt-2 flex items-center gap-3">
          <code className="font-mono text-xl tabular-nums">{kode}</code>
          <button
            type="button"
            onClick={salin}
            className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {tersalin ? 'Tersalin' : 'Salin'}
          </button>
        </div>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">Pilih minimal satu tingkat.</p>
      )}
      <p className="mt-3 text-xs text-zinc-500">
        Format Kemendagri bertitik, sama dengan yang dipakai BMKG untuk prakiraan cuaca
        per desa.
      </p>
    </div>
  )
}
