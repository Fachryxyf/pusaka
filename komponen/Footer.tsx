import Link from 'next/link'
import { DAFTAR_META } from '@/alat/daftar'

// Sumber data yang sedang dipakai, beserta atribusi yang diwajibkan penerbitnya.
// Daftar ini disalin dari provenance.atribusi di registry (lihat NOTICE.md §5).
const SUMBER = [
  { nama: 'BMKG', url: 'https://data.bmkg.go.id', wajib: true },
  { nama: 'NASA/JPL SSD', url: 'https://ssd.jpl.nasa.gov', wajib: true },
  { nama: 'idn-area', url: 'https://github.com/fityannugroho/idn-area', wajib: false },
  { nama: 'myQuran', url: 'https://api.myquran.com', wajib: false },
  { nama: 'EQuran.id', url: 'https://equran.id', wajib: false },
] as const

const HALAMAN = [
  { nama: 'Katalog API', href: '/dev' },
  { nama: 'Status API', href: '/dev/status' },
  { nama: 'status.json', href: '/status.json' },
] as const

const DOKUMEN = [
  { nama: 'Spesifikasi teknis', href: 'https://github.com/Fachryxyf/pusaka/blob/xyf/SPEC.md' },
  { nama: 'Bentuk response API', href: 'https://github.com/Fachryxyf/pusaka/blob/xyf/REFERENCE.md' },
  { nama: 'Batas lisensi data', href: 'https://github.com/Fachryxyf/pusaka/blob/xyf/NOTICE.md' },
  { nama: 'Cara berkontribusi', href: 'https://github.com/Fachryxyf/pusaka/blob/xyf/CONTRIBUTING.md' },
] as const

export function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/40">
      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-2 lg:col-span-1">
            <p className="text-sm font-semibold">Pusaka</p>
            <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
              Alat harian dari data publik Indonesia, plus katalog API yang bisa dipanggil
              program.
            </p>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Alat</p>
            <ul className="space-y-1.5">
              {DAFTAR_META.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/alat/${a.slug}`}
                    className="fokus-cincin rounded text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {a.judul}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Dokumen</p>
            <ul className="space-y-1.5">
              {HALAMAN.map((h) => (
                <li key={h.href}>
                  <Link
                    href={h.href}
                    className="fokus-cincin rounded text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {h.nama}
                  </Link>
                </li>
              ))}
              {DOKUMEN.map((d) => (
                <li key={d.href}>
                  <a
                    href={d.href}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="fokus-cincin rounded text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {d.nama}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Sumber data
            </p>
            <ul className="space-y-1.5">
              {SUMBER.map((s) => (
                <li key={s.nama}>
                  <a
                    href={s.url}
                    rel="noopener noreferrer"
                    target="_blank"
                    className="fokus-cincin rounded text-sm text-zinc-600 transition hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                  >
                    {s.nama}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 space-y-3 border-t border-zinc-200 pt-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          {/* Kewajiban lisensi, bukan sopan santun (SPEC §13). */}
          <p>
            Katalog API diturunkan dari{' '}
            <a
              href="https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA"
              className="underline decoration-zinc-300 underline-offset-2 hover:decoration-current dark:decoration-zinc-600"
              rel="noopener noreferrer"
              target="_blank"
            >
              DAFTAR-API-LOKAL-INDONESIA
            </a>{' '}
            oleh farizdotid, dipakai di bawah lisensi{' '}
            <a
              href="https://creativecommons.org/licenses/by/4.0/"
              className="underline decoration-zinc-300 underline-offset-2 hover:decoration-current dark:decoration-zinc-600"
              rel="noopener noreferrer"
              target="_blank"
            >
              CC BY 4.0
            </a>
            . Data tiap alat tetap milik penerbit aslinya; BMKG dan NASA/JPL mewajibkan
            pencantuman sumber.
          </p>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-zinc-500">
            <span>Kode berlisensi MIT</span>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/Fachryxyf/pusaka"
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Kode sumber
            </a>
            <span aria-hidden="true">·</span>
            <a
              href="https://github.com/Fachryxyf/pusaka/issues/new"
              rel="noopener noreferrer"
              target="_blank"
              className="fokus-cincin rounded hover:text-zinc-700 dark:hover:text-zinc-300"
            >
              Lapor masalah
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
