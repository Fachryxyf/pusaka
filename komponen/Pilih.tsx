'use client'

import { useEffect, useId, useMemo, useRef, useState } from 'react'

export type Opsi = { nilai: string; label: string }

// Pengganti <select> bawaan browser: tampilannya sama di semua platform dan bisa
// ditata. Bawaan browser dirender oleh OS, jadi tidak mungkin diseragamkan.
//
// Karena menggantikan kontrol bawaan berarti mengambil alih aksesibilitasnya, pola
// ARIA combobox diikuti utuh: peran, keterkaitan label, dan seluruh papan tombol
// (panah, Home/End, Enter, Escape, Tab, dan pencarian ketik-huruf).
export function Pilih({
  id,
  label,
  nilai,
  opsi,
  onPilih,
  placeholder = 'Pilih…',
  nonaktif = false,
  cariBila = 8,
}: {
  id?: string
  label: string
  nilai: string
  opsi: Opsi[]
  onPilih: (nilai: string) => void
  placeholder?: string
  nonaktif?: boolean
  // Kotak pencarian muncul otomatis kalau daftarnya panjang (mis. 38 provinsi).
  cariBila?: number
}) {
  const idOtomatis = useId()
  const idTombol = id ?? idOtomatis
  const idDaftar = `${idTombol}-daftar`

  const [terbuka, setTerbuka] = useState(false)
  const [sorot, setSorot] = useState(-1)
  const [kueri, setKueri] = useState('')

  const wadah = useRef<HTMLDivElement>(null)
  const daftarRef = useRef<HTMLUListElement>(null)
  const cariRef = useRef<HTMLInputElement>(null)

  const pakaiCari = opsi.length >= cariBila
  const terpilih = opsi.find((o) => o.nilai === nilai) ?? null

  const tersaring = useMemo(() => {
    const k = kueri.trim().toLowerCase()
    if (!k) return opsi
    return opsi.filter((o) => o.label.toLowerCase().includes(k))
  }, [opsi, kueri])

  // Klik di luar menutup daftar. Ini yang membuat perilakunya terasa seperti
  // kontrol bawaan meski dirender sendiri.
  useEffect(() => {
    if (!terbuka) return
    const keLuar = (e: MouseEvent) => {
      if (!wadah.current?.contains(e.target as Node)) setTerbuka(false)
    }
    document.addEventListener('mousedown', keLuar)
    return () => document.removeEventListener('mousedown', keLuar)
  }, [terbuka])

  useEffect(() => {
    if (terbuka && pakaiCari) cariRef.current?.focus()
  }, [terbuka, pakaiCari])

  // Item yang disorot digulirkan ke dalam pandangan, seperti <select> asli.
  useEffect(() => {
    if (!terbuka || sorot < 0) return
    daftarRef.current?.children[sorot]?.scrollIntoView({ block: 'nearest' })
  }, [terbuka, sorot])

  const buka = () => {
    if (nonaktif) return
    setKueri('')
    setSorot(Math.max(0, tersaring.findIndex((o) => o.nilai === nilai)))
    setTerbuka(true)
  }

  const tutup = (fokusBalik = true) => {
    setTerbuka(false)
    setSorot(-1)
    if (fokusBalik) wadah.current?.querySelector<HTMLButtonElement>('button')?.focus()
  }

  const ambil = (o: Opsi) => {
    onPilih(o.nilai)
    tutup()
  }

  const papanTombol = (e: React.KeyboardEvent) => {
    if (nonaktif) return

    if (!terbuka) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        buka()
      }
      return
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        tutup()
        break
      case 'Tab':
        // Tab tetap memindahkan fokus seperti biasa, daftarnya cukup ditutup.
        tutup(false)
        break
      case 'ArrowDown':
        e.preventDefault()
        setSorot((i) => (i + 1) % Math.max(1, tersaring.length))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSorot((i) => (i <= 0 ? tersaring.length - 1 : i - 1))
        break
      case 'Home':
        e.preventDefault()
        setSorot(0)
        break
      case 'End':
        e.preventDefault()
        setSorot(tersaring.length - 1)
        break
      case 'Enter':
        e.preventDefault()
        if (tersaring[sorot]) ambil(tersaring[sorot])
        break
    }
  }

  return (
    <div className="space-y-1" ref={wadah}>
      <label htmlFor={idTombol} className="block text-sm font-medium">
        {label}
      </label>

      <div className="relative">
        <button
          type="button"
          id={idTombol}
          role="combobox"
          aria-expanded={terbuka}
          aria-controls={terbuka ? idDaftar : undefined}
          aria-haspopup="listbox"
          disabled={nonaktif}
          onClick={() => (terbuka ? tutup() : buka())}
          onKeyDown={papanTombol}
          className="fokus-cincin flex w-full items-center justify-between gap-2 rounded-lg border border-zinc-300 bg-white px-3 py-2 text-left text-base transition enabled:hover:border-zinc-400 disabled:cursor-not-allowed disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:enabled:hover:border-zinc-600"
        >
          <span className={terpilih ? '' : 'text-zinc-500'}>{terpilih?.label ?? placeholder}</span>
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            aria-hidden="true"
            className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${terbuka ? 'rotate-180' : ''}`}
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </button>

        {terbuka && (
          <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-lg dark:border-zinc-700 dark:bg-zinc-900">
            {pakaiCari && (
              <div className="border-b border-zinc-200 p-2 dark:border-zinc-700">
                <input
                  ref={cariRef}
                  type="text"
                  value={kueri}
                  onChange={(e) => {
                    setKueri(e.target.value)
                    setSorot(0)
                  }}
                  onKeyDown={papanTombol}
                  placeholder={`Cari ${label.toLowerCase()}…`}
                  aria-label={`Cari ${label.toLowerCase()}`}
                  className="fokus-cincin w-full rounded-md border border-zinc-300 bg-transparent px-2 py-1.5 text-sm dark:border-zinc-700"
                />
              </div>
            )}

            <ul
              ref={daftarRef}
              id={idDaftar}
              role="listbox"
              aria-label={label}
              className="gulir-halus max-h-60 overflow-y-auto py-1"
            >
              {tersaring.length === 0 ? (
                <li className="px-3 py-2 text-sm text-zinc-500">Tidak ada yang cocok.</li>
              ) : (
                tersaring.map((o, i) => (
                  <li
                    key={o.nilai}
                    role="option"
                    aria-selected={o.nilai === nilai}
                    onClick={() => ambil(o)}
                    onMouseEnter={() => setSorot(i)}
                    className={`cursor-pointer px-3 py-2 text-sm ${
                      i === sorot ? 'bg-zinc-100 dark:bg-zinc-800' : ''
                    } ${o.nilai === nilai ? 'font-medium' : ''}`}
                  >
                    {o.label}
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
