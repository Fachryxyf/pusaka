'use client'

import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import type { Api } from '@/registry/schema'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// Semua response myQuran dibungkus {status, request, data} — status WAJIB dicek
// sebelum data dibaca, karena galat pun membalas bungkus normal (REFERENCE.md).
type BalasanKota = { status?: boolean; data?: { id: string; lokasi: string }[] }

type Jadwal = {
  tanggal: string
  imsak: string
  subuh: string
  terbit: string
  dhuha: string
  dzuhur: string
  ashar: string
  maghrib: string
  isya: string
  date: string
}
type BalasanJadwal = {
  status?: boolean
  data?: { id: number; lokasi: string; daerah: string; jadwal: Jadwal }
}

const JAKARTA = '1301'

// terbit & dhuha bukan waktu sholat wajib — ditandai berbeda (UI-SPEC Alat 3).
const WAKTU = [
  { kunci: 'imsak', label: 'Imsak', wajib: false },
  { kunci: 'subuh', label: 'Subuh', wajib: true },
  { kunci: 'terbit', label: 'Terbit', wajib: false },
  { kunci: 'dhuha', label: 'Dhuha', wajib: false },
  { kunci: 'dzuhur', label: 'Dzuhur', wajib: true },
  { kunci: 'ashar', label: 'Ashar', wajib: true },
  { kunci: 'maghrib', label: 'Maghrib', wajib: true },
  { kunci: 'isya', label: 'Isya', wajib: true },
] as const

export default function AlatSholat({ api }: { api: Api }) {
  const [idKota, setIdKota] = useState(JAKARTA)

  const kota = useApi<BalasanKota>(api, 'daftarKota')

  // Tanggal diambil dari perangkat pengguna, lalu diformat dua digit karena itu
  // bentuk yang dijamin bekerja (REFERENCE.md).
  const hariIni = useMemo(() => {
    const d = new Date()
    return {
      tahun: String(d.getFullYear()),
      bulan: String(d.getMonth() + 1).padStart(2, '0'),
      tanggal: String(d.getDate()).padStart(2, '0'),
    }
  }, [])

  // Dimuat setelah daftar kota selesai: dua permintaan serentak ke myQuran dijamin
  // kena 429 (REFERENCE.md — batas permintaan).
  const jadwal = useApi<BalasanJadwal>(
    api,
    'jadwal',
    { idKota, ...hariIni },
    !kota.loading,
  )

  const daftarKota = kota.data?.status === true ? (kota.data.data ?? []) : []
  const isi = jadwal.data?.status === true ? jadwal.data.data : undefined

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        {kota.sumber === 'mirror' && <BannerMirror per={kota.per} />}

        {kota.loading ? (
          <>
            <span className="block text-sm font-medium">Kota</span>
            <Kerangka baris={1} />
          </>
        ) : kota.error ? (
          <>
            <span className="block text-sm font-medium">Kota</span>
            <Galat pesan={kota.error} onUlangi={kota.ulangi} />
          </>
        ) : daftarKota.length === 0 ? (
          <>
            <span className="block text-sm font-medium">Kota</span>
            <Kosong pesan="Daftar kota tidak bisa dimuat." saran="Coba muat ulang halaman." />
          </>
        ) : (
          <>
            <Pilih
              id="pilih-kota"
              label="Kota"
              nilai={idKota}
              opsi={daftarKota.map((k) => ({ nilai: k.id, label: k.lokasi }))}
              onPilih={setIdKota}
              placeholder="Pilih kota"
            />
            <p className="text-xs text-zinc-500">{daftarKota.length} kota tersedia</p>
          </>
        )}
      </section>

      <section className="space-y-3">
        {jadwal.sumber === 'mirror' && <BannerMirror per={jadwal.per} />}

        {jadwal.loading && <Kerangka baris={6} />}
        {!jadwal.loading && jadwal.error && <Galat pesan={jadwal.error} onUlangi={jadwal.ulangi} />}
        {!jadwal.loading && !jadwal.error && !isi && (
          <Kosong
            pesan="Jadwal untuk kota ini tidak tersedia."
            saran="Coba pilih kota lain yang terdekat."
          />
        )}

        {isi && <Kartu isi={isi} />}
      </section>
    </div>
  )
}

function Kartu({ isi }: { isi: NonNullable<BalasanJadwal['data']> }) {
  const berikutnya = useBerikutnya(isi.jadwal)

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">{isi.lokasi}</h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isi.daerah} · {isi.jadwal.tanggal}
        </p>
      </div>

      {berikutnya && (
        <p
          role="status"
          aria-live="polite"
          className="rounded-lg border border-zinc-200 px-4 py-3 text-sm dark:border-zinc-800"
        >
          Berikutnya <span className="font-medium">{berikutnya.label}</span> pukul{' '}
          <span className="font-medium tabular-nums">{berikutnya.jam}</span>
          {berikutnya.besok && ' besok'} · {berikutnya.sisa}
        </p>
      )}

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-zinc-200 bg-zinc-200 sm:grid-cols-4 dark:border-zinc-800 dark:bg-zinc-800">
        {WAKTU.map((w) => {
          const aktif = berikutnya?.kunci === w.kunci
          return (
            <div
              key={w.kunci}
              className={`bg-white p-3 dark:bg-zinc-950 ${aktif ? 'ring-2 ring-inset ring-zinc-900 dark:ring-zinc-100' : ''}`}
            >
              <dt
                className={`text-xs uppercase tracking-wide ${
                  w.wajib ? 'text-zinc-500' : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                {w.label}
                {!w.wajib && <span className="sr-only"> (bukan waktu sholat wajib)</span>}
              </dt>
              <dd className="text-lg font-medium tabular-nums">{isi.jadwal[w.kunci]}</dd>
            </div>
          )
        })}
      </dl>

      <p className="text-xs text-zinc-500">
        Terbit dan Dhuha bukan waktu sholat wajib. Jadwal mengikuti zona waktu kota yang
        dipilih; kalau kamu sedang berada di zona berbeda, hitungan “berikutnya”
        tidak ditampilkan.
      </p>
    </div>
  )
}

type Berikutnya = { kunci: string; label: string; jam: string; sisa: string; besok: boolean }

const SEMENIT = 60_000

// Jam dinding sebagai sumber di luar React. Snapshot-nya dibulatkan ke menit supaya
// nilainya stabil antar render — kalau mengembalikan Date baru tiap panggilan,
// useSyncExternalStore akan merender tanpa henti.
function useMenitSekarang(): number | null {
  const langganan = useCallback((ubah: () => void) => {
    const t = setInterval(ubah, 30_000)
    return () => clearInterval(t)
  }, [])

  return useSyncExternalStore(
    langganan,
    () => Math.floor(Date.now() / SEMENIT),
    // Saat prerender tidak ada jam pengguna. null membuat bagian ini tidak dirender
    // di HTML statis, jadi tidak ada selisih hidrasi.
    () => null,
  )
}

// Response tidak memuat zona waktu sama sekali (REFERENCE.md), jadi jam dari API
// hanya boleh dibandingkan dengan jam perangkat kalau keduanya sezona. Kalau tidak
// bisa dipastikan, hitungannya tidak ditampilkan — lebih baik tidak ada daripada salah.
function useBerikutnya(jadwal: Jadwal): Berikutnya | null {
  const menitEpoch = useMenitSekarang()
  if (menitEpoch === null) return null

  const sekarang = new Date(menitEpoch * SEMENIT)

  // Tanggal di response harus sama dengan tanggal perangkat. Kalau beda, berarti
  // kotanya di zona lain (atau jadwalnya bukan hari ini) — jangan menghitung.
  const tanggalPerangkat = [
    sekarang.getFullYear(),
    String(sekarang.getMonth() + 1).padStart(2, '0'),
    String(sekarang.getDate()).padStart(2, '0'),
  ].join('-')
  if (jadwal.date !== tanggalPerangkat) return null

  const menitSekarang = sekarang.getHours() * 60 + sekarang.getMinutes()

  for (const w of WAKTU) {
    const menit = keMenit(jadwal[w.kunci])
    if (menit === null) continue
    if (menit > menitSekarang) {
      return {
        kunci: w.kunci,
        label: w.label,
        jam: jadwal[w.kunci],
        sisa: selisih(menit - menitSekarang),
        besok: false,
      }
    }
  }

  // Sudah lewat Isya: yang berikutnya Imsak besok, bukan hitungan negatif.
  const imsak = keMenit(jadwal.imsak)
  if (imsak === null) return null
  return {
    kunci: '',
    label: 'Imsak',
    jam: jadwal.imsak,
    sisa: selisih(24 * 60 - menitSekarang + imsak),
    besok: true,
  }
}

function keMenit(jam: string): number | null {
  const cocok = /^(\d{1,2}):(\d{2})$/.exec(jam.trim())
  if (!cocok) return null
  return Number(cocok[1]) * 60 + Number(cocok[2])
}

function selisih(menit: number): string {
  if (menit < 1) return 'kurang dari semenit lagi'
  const jam = Math.floor(menit / 60)
  const sisa = menit % 60
  if (jam === 0) return `${sisa} menit lagi`
  if (sisa === 0) return `${jam} jam lagi`
  return `${jam} jam ${sisa} menit lagi`
}
