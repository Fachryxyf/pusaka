import type { Metadata } from 'next'
import './globals.css'
import { Footer } from '@/komponen/Footer'
import { Header } from '@/komponen/Header'

export const metadata: Metadata = {
  title: {
    default: 'Pusaka — alat & API lokal Indonesia',
    template: '%s · Pusaka',
  },
  description:
    'Alat harian berbasis data publik Indonesia — gempa, wilayah, jadwal sholat, cuaca, Al-Quran — plus katalog API yang statusnya dipantau otomatis.',
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="flex min-h-full flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
        {/* Pintasan wajib: header sticky berarti pengguna papan tombol perlu jalan
            cepat melewati navigasi. */}
        <a
          href="#isi"
          className="fokus-cincin sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow dark:focus:bg-zinc-900"
        >
          Lompat ke isi
        </a>

        <Header />

        {/* px-5/sm:px-8 sama dengan header & footer: padding yang berbeda antar
            bagian membuat tepi kiri isi tidak sejajar dengan logo di atasnya. */}
        <main id="isi" className="mx-auto w-full max-w-6xl flex-1 px-5 py-10 sm:px-8">
          {children}
        </main>

        <Footer />
      </body>
    </html>
  )
}
