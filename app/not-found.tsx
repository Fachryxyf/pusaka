import Link from 'next/link'
import { DAFTAR_META } from '@/alat/daftar'
import { Ikon } from '@/komponen/Ikon'

export const metadata = { title: 'Halaman tidak ditemukan' }

export default function TidakDitemukan() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-mono text-sm text-zinc-500">404</p>
        <h1 className="text-2xl font-semibold tracking-tight">Halaman ini tidak ada</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Mungkin alamatnya salah ketik, atau alatnya belum dibuat. Semua alat yang sudah
          jalan ada di bawah.
        </p>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {DAFTAR_META.map((a) => (
          <li key={a.slug}>
            <Link
              href={`/alat/${a.slug}`}
              className="flex h-full items-start gap-3 rounded-xl border border-zinc-200 p-4 transition hover:border-zinc-900 dark:border-zinc-800 dark:hover:border-zinc-100"
            >
              <Ikon nama={a.ikon} className="mt-0.5 h-5 w-5 shrink-0 text-zinc-500" />
              <span>
                <span className="block font-medium">{a.judul}</span>
                <span className="block text-sm text-zinc-600 dark:text-zinc-400">{a.deskripsi}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>

      <Link href="/" className="inline-block text-sm underline">
        Kembali ke halaman utama
      </Link>
    </div>
  )
}
