'use client'

import { useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// Bungkusnya {statusCode, code, data}. `code` di AKAR adalah status berupa string
// ("OK"), sedangkan `code` di dalam `data` adalah kode posnya berupa int.
// Penamaan yang menjebak — jangan tertukar (REFERENCE.md).
type Tempat = {
  code: number
  village: string
  district: string
  regency: string
  province: string
  latitude: number
  longitude: number
  elevation: number
  timezone: string
  distance?: number // hanya ada di endpoint deteksi
}

type BalasanCari = { code?: string; data?: Tempat[] }
type BalasanDeteksi = { code?: string; data?: Tempat }

// API membatasi 20 hasil tanpa paginasi dan tanpa total (REFERENCE.md).
const BATAS_HASIL = 20

type Koordinat = { lintang: string; bujur: string }

export default function AlatKodePos({ api }: PropAlat) {
  const [kotak, setKotak] = useState('')
  const [kata, setKata] = useState('')
  const [koordinat, setKoordinat] = useState<Koordinat | null>(null)
  const [galatLokasi, setGalatLokasi] = useState<string | null>(null)
  const [mencariLokasi, setMencariLokasi] = useState(false)

  const cari = useApi<BalasanCari>(api, 'cari', { kata }, kata !== '')
  const deteksi = useApi<BalasanDeteksi>(
    api,
    'deteksi',
    koordinat ? { lintang: koordinat.lintang, bujur: koordinat.bujur } : {},
    koordinat !== null,
  )

  const kirim = (e: React.FormEvent) => {
    e.preventDefault()
    const bersih = kotak.trim()
    if (!bersih) return
    setKoordinat(null)
    setGalatLokasi(null)
    setKata(bersih)
  }

  const pakaiLokasi = () => {
    setGalatLokasi(null)

    if (!('geolocation' in navigator)) {
      setGalatLokasi('Peramban ini tidak mendukung deteksi lokasi. Coba cari dengan nama wilayah.')
      return
    }

    setMencariLokasi(true)
    navigator.geolocation.getCurrentPosition(
      (posisi) => {
        setMencariLokasi(false)
        setKata('')
        // Koordinat 0,0 diterima API dan mengembalikan titik di Aceh, jadi nilai
        // yang tidak masuk akal ditolak di sisi kita (REFERENCE.md).
        const { latitude, longitude } = posisi.coords
        if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || (latitude === 0 && longitude === 0)) {
          setGalatLokasi('Koordinat dari perangkatmu tidak masuk akal. Coba cari dengan nama wilayah.')
          return
        }
        setKoordinat({ lintang: String(latitude), bujur: String(longitude) })
      },
      (galat) => {
        setMencariLokasi(false)
        // Izin ditolak wajib punya pesan yang jelas, bukan diam saja (UI-SPEC Alat 6).
        setGalatLokasi(pesanLokasi(galat))
      },
      { timeout: 10_000, maximumAge: 300_000 },
    )
  }

  const hasilCari = cari.data?.data ?? []
  const hasilDeteksi = deteksi.data?.data

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <form onSubmit={kirim} className="space-y-2">
          <label htmlFor="cari-kodepos" className="block text-sm font-medium">
            Nama kelurahan atau kecamatan
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="cari-kodepos"
              type="search"
              value={kotak}
              onChange={(e) => setKotak(e.target.value)}
              placeholder="danasari, gambir, cisaga…"
              className="fokus-cincin min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            />
            <button
              type="submit"
              disabled={kotak.trim() === ''}
              className="fokus-cincin rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-800"
            >
              Cari
            </button>
          </div>
        </form>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={pakaiLokasi}
            disabled={mencariLokasi}
            className="fokus-cincin rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-800"
          >
            {mencariLokasi ? 'Mencari lokasi…' : 'Pakai lokasi saya'}
          </button>
          <span className="text-xs text-zinc-500">
            Lokasimu hanya dikirim ke API kode pos, tidak disimpan.
          </span>
        </div>

        {galatLokasi && <Galat pesan={galatLokasi} />}
      </section>

      {kata !== '' && (
        <section className="space-y-3">
          {cari.sumber === 'mirror' && <BannerMirror per={cari.per} />}

          {cari.loading && <Kerangka baris={4} />}
          {!cari.loading && cari.error && <Galat pesan={cari.error} onUlangi={cari.ulangi} />}
          {!cari.loading && !cari.error && hasilCari.length === 0 && (
            <Kosong
              pesan={`Tidak ada kode pos untuk “${kata}”.`}
              saran="Coba nama kelurahan atau kecamatannya saja, tanpa kata “desa” atau “kec”."
            />
          )}

          {hasilCari.length > 0 && (
            <>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
                  Hasil untuk “{kata}”
                </h2>
                <span className="text-xs text-zinc-500">{hasilCari.length} ditemukan</span>
              </div>
              <Daftar tempat={hasilCari} />
              {hasilCari.length === BATAS_HASIL && (
                // Tidak ada `total` di response, jadi ini satu-satunya cara jujur:
                // sebutkan batasnya, jangan berpura-pura ini semuanya.
                <p className="text-xs text-zinc-500">
                  API ini mengembalikan paling banyak {BATAS_HASIL} hasil dan tidak
                  memberitahukan jumlah sebenarnya. Kalau yang kamu cari belum ada, persempit
                  kata pencarianmu.
                </p>
              )}
            </>
          )}
        </section>
      )}

      {koordinat && (
        <section className="space-y-3">
          {deteksi.sumber === 'mirror' && <BannerMirror per={deteksi.per} />}

          <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
            Terdekat dari lokasimu
          </h2>

          {deteksi.loading && <Kerangka baris={3} />}
          {!deteksi.loading && deteksi.error && <Galat pesan={deteksi.error} onUlangi={deteksi.ulangi} />}
          {!deteksi.loading && !deteksi.error && !hasilDeteksi && (
            <Kosong pesan="Tidak ada kode pos yang cocok dengan lokasimu." />
          )}

          {hasilDeteksi && <Daftar tempat={[hasilDeteksi]} />}
        </section>
      )}
    </div>
  )
}

function Daftar({ tempat }: { tempat: Tempat[] }) {
  return (
    <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
      {tempat.map((t) => (
        <li key={`${t.code}-${t.village}-${t.district}`} className="flex items-start gap-4 px-4 py-3">
          {/* `code` DI DALAM data adalah kode posnya. Ditampilkan sebagai teks
              supaya tidak ada pembulatan atau pemformatan angka. */}
          <code className="shrink-0 font-mono text-lg tabular-nums">{t.code}</code>
          <span className="min-w-0 flex-1">
            <span className="block font-medium">{t.village}</span>
            <span className="block text-sm text-zinc-600 dark:text-zinc-400">
              {t.district}, {t.regency}, {t.province}
            </span>
            <span className="block text-xs text-zinc-500">
              {t.timezone} · {t.elevation} mdpl
              {typeof t.distance === 'number' && ` · sekitar ${jarak(t.distance)} dari lokasimu`}
            </span>
          </span>
        </li>
      ))}
    </ul>
  )
}

// Satuan `distance` tidak dinyatakan API; nilainya konsisten dengan kilometer.
// Karena itu ditulis "sekitar", bukan angka pasti (REFERENCE.md).
function jarak(km: number): string {
  if (!Number.isFinite(km)) return '—'
  if (km < 1) return `${Math.round(km * 1000)} m`
  return `${km.toLocaleString('id-ID', { maximumFractionDigits: 1 })} km`
}

function pesanLokasi(galat: GeolocationPositionError): string {
  switch (galat.code) {
    case galat.PERMISSION_DENIED:
      return 'Izin lokasi ditolak. Kamu tetap bisa mencari dengan nama wilayah di atas, atau aktifkan izin lokasi di setelan peramban.'
    case galat.POSITION_UNAVAILABLE:
      return 'Lokasimu tidak bisa ditentukan sekarang. Coba lagi, atau cari dengan nama wilayah.'
    case galat.TIMEOUT:
      return 'Pencarian lokasi terlalu lama. Coba lagi, atau cari dengan nama wilayah.'
    default:
      return 'Lokasi tidak bisa diambil. Coba cari dengan nama wilayah.'
  }
}
