import type { Metadata } from 'next'
import Link from 'next/link'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Pusaka — alat & API lokal Indonesia',
    template: '%s · Pusaka',
  },
  description:
    'Alat harian berbasis data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca — plus katalog API yang statusnya dipantau otomatis.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        <header className="border-b border-zinc-200 dark:border-zinc-800">
          <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-4 py-4">
            <Link href="/" className="text-lg font-semibold tracking-tight">
              Pusaka
            </Link>
            <nav className="flex items-center gap-4 text-sm">
              <Link href="/" className="hover:underline">
                Alat
              </Link>
              <Link href="/dev" className="hover:underline">
                Developer
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">{children}</main>

        <footer className="border-t border-zinc-200 px-4 py-6 text-sm text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
          <div className="mx-auto w-full max-w-4xl space-y-2">
            <p>
              Katalog API diturunkan dari{' '}
              <a
                href="https://github.com/farizdotid/DAFTAR-API-LOKAL-INDONESIA"
                className="underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                DAFTAR-API-LOKAL-INDONESIA
              </a>{' '}
              oleh farizdotid, dipakai di bawah lisensi{' '}
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                className="underline"
                rel="noopener noreferrer"
                target="_blank"
              >
                CC BY 4.0
              </a>
              .
            </p>
            <p>Data tiap alat milik penerbit aslinya masing-masing (BMKG, myQuran, equran.id, dan lain-lain).</p>
          </div>
        </footer>
      </body>
    </html>
  )
}
