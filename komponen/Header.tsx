'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { DAFTAR_META } from '@/alat/daftar'
import { Ikon } from '@/komponen/Ikon'

const NAV = [
  { href: '/', label: 'Alat' },
  { href: '/dev', label: 'Katalog API' },
  { href: '/dev/status', label: 'Status' },
] as const

export function Header() {
  const jalur = usePathname()
  const [menuTerbuka, setMenuTerbuka] = useState(false)

  // Menu ditutup saat pindah halaman, kalau tidak ia menggantung terbuka.
  // Disetel saat render, bukan di dalam efek: setState di efek memicu render
  // berantai, dan ini memang state yang diturunkan dari jalur.
  const [jalurLama, setJalurLama] = useState(jalur)
  if (jalurLama !== jalur) {
    setJalurLama(jalur)
    setMenuTerbuka(false)
  }

  const aktif = (href: string) => {
    if (href === '/') return jalur === '/' || jalur.startsWith('/alat')
    // /dev jangan ikut menyala saat sedang di /dev/status.
    if (href === '/dev') return jalur === '/dev' || jalur.startsWith('/dev/api')
    return jalur.startsWith(href)
  }

  return (
    // sticky, bukan fixed: tidak perlu memberi padding kompensasi pada isi halaman.
    // Latar semitransparan + blur supaya isi yang lewat di bawahnya tidak menabrak teks.
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/85 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/85">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        {/* h-16, bukan h-14: dengan nama situs 17px dan subjudul di bawahnya,
            56px membuat keduanya terasa mepet ke garis bawah. */}
        <div className="flex h-16 items-center justify-between gap-6">
          <Link
            href="/"
            className="fokus-cincin flex items-center gap-3 rounded-md"
            aria-label="Pusaka, halaman utama"
          >
            <Tanda />
            {/* leading-tight, bukan leading-none: dua baris yang benar-benar
                berhimpit terbaca sebagai satu blok gelap. */}
            <span className="flex flex-col leading-tight">
              <span className="text-[1.0625rem] font-semibold tracking-tight">Pusaka</span>
              <span className="teks-mikro hidden text-zinc-500 sm:block">
                data publik Indonesia
              </span>
            </span>
          </Link>

          <nav aria-label="Navigasi utama" className="hidden items-center gap-1 sm:flex">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                aria-current={aktif(n.href) ? 'page' : undefined}
                className={`fokus-cincin teks-nav rounded-md px-3 py-2 transition ${
                  aktif(n.href)
                    ? 'bg-zinc-100 font-medium text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100'
                }`}
              >
                {n.label}
              </Link>
            ))}
            <span className="mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />
            <a
              href="https://github.com/Fachryxyf/pusaka"
              rel="noopener noreferrer"
              target="_blank"
              aria-label="Kode sumber di GitHub"
              className="fokus-cincin flex h-9 w-9 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <LogoGithub />
            </a>
          </nav>

          <button
            type="button"
            onClick={() => setMenuTerbuka((v) => !v)}
            aria-expanded={menuTerbuka}
            aria-controls="menu-ponsel"
            className="fokus-cincin -mr-1.5 flex h-10 w-10 items-center justify-center rounded-md text-zinc-600 transition hover:bg-zinc-100 sm:hidden dark:text-zinc-400 dark:hover:bg-zinc-800"
          >
            <span className="sr-only">{menuTerbuka ? 'Tutup menu' : 'Buka menu'}</span>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              className="h-5 w-5"
            >
              {menuTerbuka ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>

        {menuTerbuka && (
          <div id="menu-ponsel" className="border-t border-zinc-200 py-3 sm:hidden dark:border-zinc-800">
            <nav aria-label="Navigasi utama ponsel" className="flex flex-col gap-0.5">
              <p className="teks-mikro px-2 pb-1.5 font-semibold uppercase text-zinc-500">Alat</p>
              {DAFTAR_META.map((a) => (
                <Link
                  key={a.slug}
                  href={`/alat/${a.slug}`}
                  className="fokus-cincin teks-nav flex items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Ikon nama={a.ikon} className="h-4 w-4 shrink-0 text-zinc-500" />
                  {a.judul}
                </Link>
              ))}

              <span className="my-2 h-px bg-zinc-200 dark:bg-zinc-800" aria-hidden="true" />

              <p className="teks-mikro px-2 pb-1.5 font-semibold uppercase text-zinc-500">
                Developer
              </p>
              <Link
                href="/dev"
                className="fokus-cincin teks-nav rounded-md px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Katalog API
              </Link>
              <Link
                href="/dev/status"
                className="fokus-cincin teks-nav rounded-md px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Status API
              </Link>
              <a
                href="https://github.com/Fachryxyf/pusaka"
                rel="noopener noreferrer"
                target="_blank"
                className="fokus-cincin teks-nav flex items-center gap-3 rounded-md px-2 py-2.5 transition hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <LogoGithub />
                GitHub
              </a>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

// Monogram yang sama dengan app/icon.svg, supaya tab peramban dan header sejalan.
function Tanda() {
  return (
    <svg viewBox="0 0 512 512" aria-hidden="true" className="h-8 w-8 shrink-0">
      <rect width="512" height="512" rx="112" className="fill-zinc-900 dark:fill-zinc-100" />
      <g className="fill-zinc-50 dark:fill-zinc-900">
        <rect x="128" y="112" width="58" height="288" rx="8" />
        <path d="M244 112a96 96 0 1 1 0 192H150v-58h94a38 38 0 0 0 0-76h-94v-58z" />
      </g>
    </svg>
  )
}

function LogoGithub() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="h-[1.05rem] w-[1.05rem] shrink-0">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-2.64-.89-2.64-2.5 0-.7.25-1.29.66-1.74-.06-.15-.29-.77.06-1.6 0 0 .61-.19 2 .74a4.7 4.7 0 0 1 2.54 0c1.39-.94 2-.74 2-.74.35.83.12 1.45.06 1.6.41.45.66 1.03.66 1.74 0 1.62-.87 2.3-2.65 2.5.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A7.99 7.99 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
    </svg>
  )
}
