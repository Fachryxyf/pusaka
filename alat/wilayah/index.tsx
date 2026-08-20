'use client'

import { useEffect, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import {
  KOSONG,
  PemilihWilayah,
  gantiTingkat,
  kodeTerdalam,
  type PilihanWilayah,
} from '@/komponen/PemilihWilayah'

export default function AlatWilayah({ api }: PropAlat) {
  // Kode dipakai apa adanya — tidak ada konversi format di project ini (SPEC §6.5).
  const [pilihan, setPilihan] = useState<PilihanWilayah>(KOSONG)

  return (
    <div className="space-y-6">
      <PemilihWilayah
        api={api}
        pilihan={pilihan}
        onPilih={(tingkat, kode) => setPilihan((lama) => gantiTingkat(lama, tingkat, kode))}
      />
      <HasilKode kode={kodeTerdalam(pilihan)} />
    </div>
  )
}

function HasilKode({ kode }: { kode: string }) {
  const [status, setStatus] = useState<'diam' | 'tersalin' | 'gagal'>('diam')

  useEffect(() => {
    if (status === 'diam') return
    const t = setTimeout(() => setStatus('diam'), 2500)
    return () => clearTimeout(t)
  }, [status])

  const salin = async () => {
    try {
      await navigator.clipboard.writeText(kode)
      setStatus('tersalin')
    } catch {
      // Clipboard bisa ditolak (izin, atau konteks tak aman seperti http://).
      // Statusnya ditampilkan di halaman, bukan lewat alert() bawaan browser.
      setStatus('gagal')
    }
  }

  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <p className="text-sm font-medium">Kode wilayah</p>
      {kode ? (
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <code className="font-mono text-xl tabular-nums">{kode}</code>
          <button
            type="button"
            onClick={salin}
            className="fokus-cincin rounded-md border border-zinc-300 px-3 py-1.5 text-sm font-medium transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
          >
            {status === 'tersalin' ? 'Tersalin' : 'Salin'}
          </button>
          {/* Status diumumkan ke pembaca layar tanpa memindahkan fokus. */}
          <span role="status" aria-live="polite" className="text-sm text-zinc-600 dark:text-zinc-400">
            {status === 'gagal' ? 'Tidak bisa menyalin otomatis — salin manual saja.' : ''}
          </span>
        </div>
      ) : (
        <p className="mt-1 text-sm text-zinc-500">Pilih minimal satu tingkat.</p>
      )}
      <p className="mt-3 text-xs text-zinc-500">
        Format Kemendagri bertitik, sama dengan yang dipakai BMKG untuk prakiraan cuaca
        per desa.
      </p>
    </div>
  )
}
