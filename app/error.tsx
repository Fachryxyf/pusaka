'use client'

import Link from 'next/link'
import { useEffect } from 'react'

// Menangkap galat render yang tidak tertangani di dalam layout ini.
// Kegagalan pengambilan data TIDAK sampai ke sini — itu ditangani per alat lewat
// useApi (UI-SPEC §1.1), dan itu memang tempat yang benar untuk menanganinya.
export default function Galat({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Belum ada layanan pelaporan galat. Console adalah satu-satunya jejak yang
    // tersedia di ekspor statis, dan lebih baik daripada galatnya hilang tanpa bekas.
    console.error(error)
  }, [error])

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p className="font-mono text-sm text-zinc-500">Galat</p>
        <h1 className="text-2xl font-semibold tracking-tight">Ada yang rusak di halaman ini</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Bukan karena internetmu — ini kesalahan di sisi kami. Coba muat ulang bagian ini
          dulu; kalau masih rusak, halaman lain kemungkinan besar tetap jalan.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
        >
          Coba muat ulang
        </button>
        <Link
          href="/"
          className="rounded-lg border border-transparent px-4 py-2 text-sm font-medium underline"
        >
          Kembali ke halaman utama
        </Link>
      </div>

      {/* digest adalah satu-satunya pengenal yang tersedia di produksi; pesan aslinya
          sengaja tidak ditampilkan karena bisa membocorkan detail internal. */}
      {error.digest && (
        <p className="font-mono text-xs text-zinc-500">Kode galat: {error.digest}</p>
      )}

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Kalau ini terus terjadi,{' '}
        <a
          href="https://github.com/Fachryxyf/pusaka/issues/new"
          className="underline"
          rel="noopener noreferrer"
          target="_blank"
        >
          laporkan sebagai issue
        </a>
        .
      </p>
    </div>
  )
}
