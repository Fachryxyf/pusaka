'use client'

import Image from 'next/image'
import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { Pilih } from '@/komponen/Pilih'

// Bentuk data BERBEDA di tiap sumber (REFERENCE.md): ringkasan bisa di
// contentSnippet, description, atau content; gambar bisa objek, string, atau tidak
// ada sama sekali. Semuanya dinormalkan ke bentuk ini sebelum dirender.
type Mentah = {
  title?: string
  link?: string
  isoDate?: string
  contentSnippet?: string
  description?: string
  content?: string
  image?: { small?: string; medium?: string; large?: string; extraLarge?: string } | string
}
type Balasan = { total?: number; data?: Mentah[] }

type Berita = {
  judul: string
  tautan: string
  ringkasan: string
  waktu: string
  // Milidetik epoch, atau null kalau isoDate tidak sah. Dipakai untuk menghitung
  // umur berita terbaru.
  epoch: number | null
  gambar: string | null
}

// Hanya sumber yang TERBUKTI mengembalikan data. Lima dari 14 yang didaftarkan root
// API membalas 500 (Liputan6, Tribun, Jawa Pos, Vice, Suara) — jangan disalin dari
// root, dan jangan ditawarkan sebagai pilihan yang error (REFERENCE.md).
const SUMBER = [
  { nilai: 'cnnSemua', label: 'CNN Indonesia' },
  { nilai: 'cnbcSemua', label: 'CNBC Indonesia' },
  { nilai: 'antaraTipe', label: 'Antara' },
  { nilai: 'tempoSemua', label: 'Tempo' },
  { nilai: 'okezoneSemua', label: 'Okezone' },
  { nilai: 'kumparanSemua', label: 'Kumparan' },
  { nilai: 'republikaSemua', label: 'Republika' },
  { nilai: 'bbcSemua', label: 'BBC Indonesia' },
  { nilai: 'voaSemua', label: 'VOA Indonesia' },
] as const

// Rubrik hanya ditawarkan untuk sumber yang penyaringannya sudah dibuktikan.
// BBC punya listType di root tapi hasilnya identik dengan tanpa rubrik.
const RUBRIK: Record<string, { nilai: string; label: string }[]> = {
  cnnSemua: [
    { nilai: '', label: 'Semua rubrik' },
    { nilai: 'nasional', label: 'Nasional' },
    { nilai: 'internasional', label: 'Internasional' },
    { nilai: 'ekonomi', label: 'Ekonomi' },
    { nilai: 'olahraga', label: 'Olahraga' },
    { nilai: 'teknologi', label: 'Teknologi' },
    { nilai: 'hiburan', label: 'Hiburan' },
    { nilai: 'gaya-hidup', label: 'Gaya hidup' },
  ],
  antaraTipe: [
    { nilai: 'terkini', label: 'Terkini' },
    { nilai: 'politik', label: 'Politik' },
    { nilai: 'hukum', label: 'Hukum' },
    { nilai: 'ekonomi', label: 'Ekonomi' },
    { nilai: 'bola', label: 'Bola' },
    { nilai: 'olahraga', label: 'Olahraga' },
    { nilai: 'humaniora', label: 'Humaniora' },
    { nilai: 'lifestyle', label: 'Gaya hidup' },
    { nilai: 'tekno', label: 'Teknologi' },
    { nilai: 'otomotif', label: 'Otomotif' },
  ],
}

// Sumber dianggap basi kalau berita terbarunya lebih tua dari ini. VOA lolos semua
// syarat probe tapi datanya beku 17 bulan — mode kematian yang tidak tertangkap
// minUkuranByte, jadi harus dikatakan ke pembaca.
const BATAS_BASI_HARI = 7

export default function AlatBerita({ api }: PropAlat) {
  const [sumber, setSumber] = useState<string>('cnnSemua')
  const [rubrik, setRubrik] = useState('')

  const daftarRubrik = RUBRIK[sumber]

  // CNN punya endpoint terpisah untuk rubrik; Antara WAJIB punya rubrik karena
  // /v1/antara-news/ membalas 404 (REFERENCE.md).
  const endpointId = sumber === 'cnnSemua' && rubrik ? 'cnnTipe' : sumber
  const paramsAkhir = useMemo(() => {
    const p: Record<string, string> = {}
    if (sumber === 'antaraTipe') p.tipe = rubrik || 'terkini'
    else if (sumber === 'cnnSemua' && rubrik) p.tipe = rubrik
    return p
  }, [sumber, rubrik])

  const { data, loading, error, sumber: asal, per, ulangi } = useApi<Balasan>(
    api,
    endpointId,
    paramsAkhir,
  )

  const berita = useMemo(() => (data?.data ?? []).map(normalkan).filter((b) => b.judul && b.tautan), [data])
  const umurTerbaru = useMemo(() => umurHari(berita), [berita])

  const gantiSumber = (nilai: string) => {
    setSumber(nilai)
    // Rubrik lama tidak berlaku di sumber baru; Antara wajib punya nilai.
    setRubrik(nilai === 'antaraTipe' ? 'terkini' : '')
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2">
        <Pilih
          id="pilih-sumber"
          label="Sumber"
          nilai={sumber}
          opsi={SUMBER.map((s) => ({ nilai: s.nilai, label: s.label }))}
          onPilih={gantiSumber}
        />
        {daftarRubrik ? (
          <Pilih id="pilih-rubrik" label="Rubrik" nilai={rubrik} opsi={daftarRubrik} onPilih={setRubrik} />
        ) : (
          <div className="space-y-1">
            <span className="block text-sm font-medium text-zinc-500">Rubrik</span>
            <p className="rounded-lg border border-dashed border-zinc-300 px-3 py-2 text-sm text-zinc-500 dark:border-zinc-700">
              Sumber ini tidak menyediakan rubrik.
            </p>
          </div>
        )}
      </section>

      <section className="space-y-3">
        {asal === 'mirror' && <BannerMirror per={per} />}

        {umurTerbaru !== null && umurTerbaru > BATAS_BASI_HARI && (
          <p
            role="status"
            className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
          >
            Berita terbaru dari sumber ini berumur sekitar {umurTerbaru} hari. Kemungkinan
            sumbernya sudah tidak diperbarui, bukan karena tidak ada berita.
          </p>
        )}

        {loading && <Kerangka baris={6} />}
        {!loading && error && <Galat pesan={error} onUlangi={ulangi} />}
        {!loading && !error && berita.length === 0 && (
          <Kosong
            pesan="Tidak ada berita dari sumber ini sekarang."
            saran="Coba sumber atau rubrik lain."
          />
        )}

        {berita.length > 0 && (
          <>
            <p className="text-xs text-zinc-500">{berita.length} berita</p>
            <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
              {berita.map((b) => (
                <li key={b.tautan}>
                  <a
                    href={b.tautan}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="fokus-cincin group flex gap-4 p-4 transition hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                  >
                    {b.gambar && <Gambar url={b.gambar} judul={b.judul} />}
                    <span className="min-w-0 flex-1 space-y-1">
                      <span className="block font-medium leading-snug group-hover:underline">
                        {b.judul}
                      </span>
                      {b.ringkasan && (
                        <span className="block line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                          {b.ringkasan}
                        </span>
                      )}
                      <span className="block text-xs text-zinc-500">{b.waktu}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <p className="text-xs text-zinc-500">
        Berita dikumpulkan berita-indo-api dari RSS medianya masing-masing. Tautan membuka
        situs aslinya. Waktu terbit sudah dikonversi ke zona waktu perangkatmu.
      </p>
    </div>
  )
}

function Gambar({ url, judul }: { url: string; judul: string }) {
  const [gagal, setGagal] = useState(false)
  if (gagal) return null

  return (
    <Image
      src={url}
      alt={judul}
      width={112}
      height={80}
      unoptimized
      onError={() => setGagal(true)}
      className="h-20 w-28 shrink-0 rounded-lg object-cover"
    />
  )
}

function normalkan(m: Mentah): Berita {
  return {
    judul: (m.title ?? '').trim(),
    tautan: m.link ?? '',
    // Tiga nama field berbeda untuk hal yang sama, tergantung sumbernya.
    ringkasan: (m.contentSnippet ?? m.description ?? m.content ?? '').trim(),
    waktu: formatWaktu(m.isoDate),
    epoch: epochDari(m.isoDate),
    gambar: ambilGambar(m.image),
  }
}

// image bisa objek ATAU string URL biasa (Antara). Pada string, `image.small`
// menghasilkan undefined tanpa galat — jebakan senyap (REFERENCE.md).
function ambilGambar(image: Mentah['image']): string | null {
  if (!image) return null
  if (typeof image === 'string') return image.startsWith('http') ? image : null
  return image.small ?? image.medium ?? image.large ?? image.extraLarge ?? null
}

// isoDate selalu UTC berakhiran Z; wajib ditampilkan di zona pembaca.
function formatWaktu(iso: string | undefined): string {
  if (!iso) return 'Waktu terbit tidak tercatat'
  const waktu = Date.parse(iso)
  if (Number.isNaN(waktu)) return 'Waktu terbit tidak tercatat'
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' }).format(waktu)
}

function epochDari(iso: string | undefined): number | null {
  if (!iso) return null
  const waktu = Date.parse(iso)
  return Number.isNaN(waktu) ? null : waktu
}

// Umur berita TERBARU dalam hari. Ini yang menangkap sumber yang hidup tapi datanya
// beku — mode kematian yang lolos semua syarat probe (REFERENCE.md, kasus VOA).
function umurHari(berita: Berita[]): number | null {
  const epoch = berita.map((b) => b.epoch).filter((e): e is number => e !== null)
  if (epoch.length === 0) return null
  const selisih = Date.now() - Math.max(...epoch)
  return Math.floor(selisih / 86_400_000)
}
