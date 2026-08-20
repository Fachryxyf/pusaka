import Link from 'next/link'
import { DAFTAR_META } from '@/alat/daftar'

// Sumber data yang sedang dipakai, beserta atribusi yang diwajibkan penerbitnya.
// Daftar ini disalin dari provenance.atribusi di registry (lihat NOTICE.md §5).
const SUMBER = [
  { nama: 'BMKG', url: 'https://data.bmkg.go.id' },
  { nama: 'NASA/JPL SSD', url: 'https://ssd.jpl.nasa.gov' },
  { nama: 'idn-area', url: 'https://github.com/fityannugroho/idn-area' },
  { nama: 'myQuran', url: 'https://api.myquran.com' },
  { nama: 'EQuran.id', url: 'https://equran.id' },
  { nama: 'logam-mulia-api', url: 'https://github.com/cacing69/logam-mulia-api' },
] as const

const HALAMAN = [
  { nama: 'Katalog API', href: '/dev' },
  { nama: 'Status API', href: '/dev/status' },
  { nama: 'status.json', href: '/status.json' },
] as const

const REPO = 'https://github.com/Fachryxyf/pusaka/blob/xyf'

const DOKUMEN = [
  { nama: 'Spesifikasi teknis', href: `${REPO}/SPEC.md` },
  { nama: 'Bentuk response API', href: `${REPO}/REFERENCE.md` },
  { nama: 'Batas lisensi data', href: `${REPO}/NOTICE.md` },
  { nama: 'Cara berkontribusi', href: `${REPO}/CONTRIBUTING.md` },
] as const

export function Footer() {
  return (
    <footer className="mt-20 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8">
        {/* Kolom pertama diberi porsi lebih lebar: isinya paragraf, sementara tiga
            kolom lain cuma daftar tautan pendek. Grid 4 kolom sama rata membuat
            paragrafnya terpaksa membungkus tiap dua kata. */}
        <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1fr]">
          <div className="space-y-2.5">
            <div className="flex items-center gap-2.5">
              <Tanda />
              <span className="text-[0.9375rem] font-semibold tracking-tight">Pusaka</span>
            </div>
            <p className="teks-kecil max-w-xs text-zinc-600 dark:text-zinc-400">
              Alat harian dari data publik Indonesia, plus katalog API yang bisa dipanggil
              program dan statusnya dipantau otomatis.
            </p>
          </div>

          <Kolom judul="Alat">
            {DAFTAR_META.map((a) => (
              <Baris key={a.slug} href={`/alat/${a.slug}`} internal>
                {a.judul}
              </Baris>
            ))}
          </Kolom>

          <Kolom judul="Developer">
            {HALAMAN.map((h) => (
              <Baris key={h.href} href={h.href} internal={!h.href.endsWith('.json')}>
                {h.nama}
              </Baris>
            ))}
            {DOKUMEN.map((d) => (
              <Baris key={d.href} href={d.href}>
                {d.nama}
              </Baris>
            ))}
          </Kolom>

          <Kolom judul="Sumber data">
            {SUMBER.map((s) => (
              <Baris key={s.nama} href={s.url}>
                {s.nama}
              </Baris>
            ))}
          </Kolom>
        </div>

        <div className="mt-12 space-y-4 border-t border-zinc-200 pt-7 dark:border-zinc-800">
          {/* Kewajiban lisensi, bukan sopan santun (SPEC §13). Ukurannya sengaja
              teks-kecil: ini catatan hukum, bukan isi utama halaman. */}
          <p className="teks-kecil max-w-3xl text-zinc-600 dark:text-zinc-400">
            Katalog API diturunkan dari{' '}
            <Tautan href="https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA">
              DAFTAR-API-LOKAL-INDONESIA
            </Tautan>{' '}
            oleh farizdotid, dipakai di bawah lisensi{' '}
            <Tautan href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</Tautan>. Data
            tiap alat tetap milik penerbit aslinya; BMKG dan NASA/JPL mewajibkan pencantuman
            sumber.
          </p>

          <div className="teks-mikro flex flex-wrap items-center gap-x-3 gap-y-2 text-zinc-500">
            <span>Kode berlisensi MIT</span>
            <Titik />
            <a
              href="https://github.com/Fachryxyf/pusaka"
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded transition hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Kode sumber
            </a>
            <Titik />
            <a
              href="https://github.com/Fachryxyf/pusaka/issues/new"
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded transition hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Lapor masalah
            </a>
            <Titik />
            <a
              href={`${REPO}/SECURITY.md`}
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded transition hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Keamanan
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function Kolom({ judul, children }: { judul: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <p className="teks-mikro font-semibold uppercase text-zinc-500">{judul}</p>
      <ul className="space-y-2">{children}</ul>
    </div>
  )
}

function Baris({
  href,
  internal = false,
  children,
}: {
  href: string
  internal?: boolean
  children: React.ReactNode
}) {
  const kelas =
    'fokus-cincin teks-kecil rounded text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100'
  return (
    <li>
      {internal ? (
        <Link href={href} className={kelas}>
          {children}
        </Link>
      ) : (
        <a href={href} rel="noopener noreferrer" target={href.startsWith('/') ? undefined : '_blank'} className={kelas}>
          {children}
        </a>
      )}
    </li>
  )
}

function Tautan({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      className="fokus-cincin rounded underline decoration-zinc-300 underline-offset-2 transition hover:decoration-current dark:decoration-zinc-600"
    >
      {children}
    </a>
  )
}

function Titik() {
  return <span aria-hidden="true">·</span>
}

function Tanda() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="h-5 w-5 shrink-0">
      <rect width="512" height="512" rx="112" className="fill-zinc-900 dark:fill-zinc-100" />
      <g className="fill-zinc-50 dark:fill-zinc-900">
        <rect x="128" y="112" width="58" height="288" rx="8" />
        <path d="M244 112a96 96 0 1 1 0 192H150v-58h94a38 38 0 0 0 0-76h-94v-58z" />
      </g>
    </svg>
  )
}
