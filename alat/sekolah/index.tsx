'use client'

import { useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'

// Bungkusnya {creator, status, Donate, dataSekolah, total_data, page, per_page}.
// `status` di AKAR bernilai "success"/"failed" — beda arti dari `status` di dalam
// dataSekolah[] yang bernilai "N"/"S" (REFERENCE.md).
//
// Field `Donate` memuat nomor telepon pribadi pengembangnya. Sengaja tidak
// dimasukkan ke tipe ini dan tidak ditampilkan.
type Sekolah = {
  id: string
  npsn: string
  sekolah: string
  bentuk: string
  status: string // "N" negeri, "S" swasta
  alamat_jalan: string
  propinsi: string
  kabupaten_kota: string
  kecamatan: string
  kode_prop: string
  lintang: string // string, bukan number
  bujur: string
}

type Balasan = {
  status?: string
  message?: string
  dataSekolah?: Sekolah[]
  total_data?: number
  page?: number
  per_page?: number
}

const PER_HALAMAN = 20

export default function AlatSekolah({ api }: PropAlat) {
  const [kotak, setKotak] = useState('')
  const [kueri, setKueri] = useState('')
  const [halaman, setHalaman] = useState(1)

  // Dua jalur pencarian yang berbeda endpoint. Filter lain (provinsi, jenjang,
  // negeri/swasta) TIDAK ditawarkan karena server mengabaikannya tanpa galat —
  // menawarkannya berarti berpura-pura menyaring (REFERENCE.md).
  const angkaSaja = /^\d{6,}$/.test(kueri)

  const nama = useApi<Balasan>(api, 'cariNama', { nama: kueri }, kueri !== '' && !angkaSaja)
  const npsn = useApi<Balasan>(api, 'cariNpsn', { npsn: kueri }, kueri !== '' && angkaSaja)
  const daftar = useApi<Balasan>(
    api,
    'daftar',
    { halaman: String(halaman), perHalaman: String(PER_HALAMAN) },
    kueri === '',
  )

  const aktif = kueri === '' ? daftar : angkaSaja ? npsn : nama

  // status: "failed" datang bersama HTTP 200, jadi harus diperiksa sendiri.
  const gagalDiam = aktif.data?.status === 'failed'
  const hasil = aktif.data?.status === 'success' ? (aktif.data.dataSekolah ?? []) : []
  const total = aktif.data?.total_data ?? 0

  const kirim = (e: React.FormEvent) => {
    e.preventDefault()
    setHalaman(1)
    setKueri(kotak.trim())
  }

  const bersihkan = () => {
    setKotak('')
    setKueri('')
    setHalaman(1)
  }

  return (
    <div className="space-y-6">
      <section className="space-y-3">
        <form onSubmit={kirim} className="space-y-2">
          <label htmlFor="cari-sekolah" className="block text-sm font-medium">
            Nama sekolah atau NPSN
          </label>
          <div className="flex flex-wrap gap-2">
            <input
              id="cari-sekolah"
              type="search"
              value={kotak}
              onChange={(e) => setKotak(e.target.value)}
              placeholder="pegangsaan, atau 20104653"
              className="fokus-cincin min-w-0 flex-1 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-base transition hover:border-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:hover:border-zinc-600"
            />
            <button
              type="submit"
              disabled={kotak.trim() === ''}
              className="fokus-cincin rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-800"
            >
              Cari
            </button>
            {kueri !== '' && (
              <button
                type="button"
                onClick={bersihkan}
                className="fokus-cincin rounded-lg px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800"
              >
                Bersihkan
              </button>
            )}
          </div>
          <p className="teks-mikro text-zinc-500">
            Ketik angka saja untuk mencari NPSN. Pencarian hanya berdasarkan nama dan NPSN —
            API ini mengabaikan filter provinsi dan jenjang.
          </p>
        </form>
      </section>

      <section className="space-y-3">
        {aktif.sumber === 'mirror' && <BannerMirror per={aktif.per} />}

        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
            {kueri === '' ? 'Semua sekolah' : `Hasil untuk “${kueri}”`}
          </h2>
          {hasil.length > 0 && (
            <span className="teks-mikro text-zinc-500">
              {kueri === ''
                ? `halaman ${halaman} dari ${total.toLocaleString('id-ID')} data`
                : `${total.toLocaleString('id-ID')} ditemukan`}
            </span>
          )}
        </div>

        {aktif.loading && <Kerangka baris={6} />}
        {!aktif.loading && aktif.error && <Galat pesan={aktif.error} onUlangi={aktif.ulangi} />}

        {/* status: "failed" dengan HTTP 200 — bukan galat jaringan, jadi ditangani
            terpisah dari aktif.error. */}
        {!aktif.loading && !aktif.error && gagalDiam && (
          <Galat
            pesan="Sumber datanya menolak permintaan ini. Coba kata pencarian lain."
            onUlangi={aktif.ulangi}
          />
        )}

        {!aktif.loading && !aktif.error && !gagalDiam && hasil.length === 0 && (
          <Kosong
            pesan={
              kueri === ''
                ? 'Data sekolah tidak bisa dimuat sekarang.'
                : `Tidak ada sekolah yang cocok dengan “${kueri}”.`
            }
            saran={
              angkaSaja
                ? 'Pastikan NPSN-nya delapan digit dan benar.'
                : 'Coba potongan namanya saja, tanpa kata SD, SMP, atau SMA.'
            }
          />
        )}

        {hasil.length > 0 && (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
            {hasil.map((s) => (
              <li key={s.id} className="space-y-1.5 px-4 py-3.5">
                <div className="flex flex-wrap items-baseline gap-2">
                  <span className="font-medium">{s.sekolah}</span>
                  <Lencana>{s.bentuk}</Lencana>
                  <Lencana>{s.status === 'N' ? 'Negeri' : s.status === 'S' ? 'Swasta' : s.status}</Lencana>
                </div>
                <p className="teks-badan text-zinc-600 dark:text-zinc-400">
                  {s.alamat_jalan || 'Alamat tidak tercatat'}
                </p>
                {/* Nama wilayah sudah berawalan "Kec. ", "Kota ", "Prov. " — jangan
                    ditambahi lagi. Kode wilayah berakhiran dua spasi, jadi di-trim. */}
                <p className="teks-mikro text-zinc-500">
                  {[s.kecamatan, s.kabupaten_kota, s.propinsi].filter(Boolean).join(' · ')}
                </p>
                <p className="teks-mikro text-zinc-500">
                  NPSN <code className="font-mono">{s.npsn}</code>
                  {koordinat(s) && ` · ${koordinat(s)}`}
                  {s.kode_prop.trim() && ` · kode wilayah ${s.kode_prop.trim()}`}
                </p>
              </li>
            ))}
          </ul>
        )}

        {/* Paginasi hanya untuk daftar penuh: hasil pencarian tidak berhalaman. */}
        {kueri === '' && hasil.length > 0 && (
          <div className="flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setHalaman((h) => Math.max(1, h - 1))}
              disabled={halaman === 1 || aktif.loading}
              className="fokus-cincin rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-800"
            >
              ← Sebelumnya
            </button>
            <span className="teks-mikro tabular-nums text-zinc-500">
              halaman {halaman.toLocaleString('id-ID')} dari{' '}
              {Math.ceil(total / PER_HALAMAN).toLocaleString('id-ID')}
            </span>
            <button
              type="button"
              onClick={() => setHalaman((h) => h + 1)}
              disabled={halaman >= Math.ceil(total / PER_HALAMAN) || aktif.loading}
              className="fokus-cincin rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium transition enabled:hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:enabled:hover:bg-zinc-800"
            >
              Berikutnya →
            </button>
          </div>
        )}
      </section>

      <p className="teks-mikro text-zinc-500">
        Data dari api-sekolah-indonesia oleh wanrabbae (GPL-3.0), bersumber dari data pokok
        pendidikan. Endpointnya sesekali lambat merespons karena harus membangunkan server
        lebih dulu.
      </p>
    </div>
  )
}

function Lencana({ children }: { children: React.ReactNode }) {
  return (
    <span className="teks-mikro rounded border border-zinc-300 px-1.5 py-0.5 text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
      {children}
    </span>
  )
}

// lintang & bujur berupa STRING; parseFloat dulu, dan 0,0 diperlakukan sebagai
// "tidak tercatat" karena itu di tengah Samudra Atlantik, bukan di Indonesia.
function koordinat(s: Sekolah): string | null {
  const lat = Number.parseFloat(s.lintang)
  const lon = Number.parseFloat(s.bujur)
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null
  if (lat === 0 && lon === 0) return null
  return `${lat.toFixed(4)}, ${lon.toFixed(4)}`
}
