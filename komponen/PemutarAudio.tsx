'use client'

import { useRef, useState } from 'react'

// Pemutar audio sendiri: `<audio controls>` dirender oleh browser/OS, jadi
// tampilannya berbeda di setiap platform dan tidak bisa ditata (UI-SPEC §1.4).
// Elemen <audio> tetap dipakai sebagai mesinnya, hanya kontrolnya yang diganti.
export function PemutarAudio({ src, judul }: { src: string; judul: string }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [main, setMain] = useState(false)
  const [posisi, setPosisi] = useState(0)
  const [durasi, setDurasi] = useState(0)
  const [gagal, setGagal] = useState(false)

  // Ganti sumber berarti mulai dari awal — pemutaran tidak dilanjutkan diam-diam.
  // Penyetelan ulang dilakukan saat render, bukan di dalam efek: efek yang memanggil
  // setState memicu render berantai, dan React memang menyarankan pola ini untuk
  // state yang diturunkan dari prop.
  const [srcLama, setSrcLama] = useState(src)
  if (srcLama !== src) {
    setSrcLama(src)
    setMain(false)
    setPosisi(0)
    setDurasi(0)
    setGagal(false)
  }

  if (gagal) {
    return (
      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Audio tidak bisa dimuat.{' '}
        <a href={src} className="underline" rel="noopener noreferrer" target="_blank">
          Buka langsung
        </a>
      </p>
    )
  }

  const togel = () => {
    const el = audio.current
    if (!el) return
    if (el.paused) {
      void el.play().catch(() => setGagal(true))
    } else {
      el.pause()
    }
  }

  const geser = (nilai: number) => {
    const el = audio.current
    if (!el || !Number.isFinite(el.duration)) return
    el.currentTime = nilai
    setPosisi(nilai)
  }

  return (
    <div className="flex items-center gap-3">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => setMain(true)}
        onPause={() => setMain(false)}
        onEnded={() => {
          setMain(false)
          setPosisi(0)
        }}
        onTimeUpdate={(e) => setPosisi(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDurasi(e.currentTarget.duration)}
        onError={() => setGagal(true)}
      />

      <button
        type="button"
        onClick={togel}
        aria-label={main ? `Jeda ${judul}` : `Putar ${judul}`}
        className="fokus-cincin flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-zinc-300 transition hover:bg-zinc-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
      >
        {main ? (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
            <rect x="7" y="5" width="3.5" height="14" rx="1" />
            <rect x="13.5" y="5" width="3.5" height="14" rx="1" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
            <path d="M8 5.5v13l11-6.5z" />
          </svg>
        )}
      </button>

      <input
        type="range"
        min={0}
        max={durasi || 0}
        step={1}
        value={posisi}
        onChange={(e) => geser(Number(e.target.value))}
        disabled={!durasi}
        aria-label={`Posisi ${judul}`}
        className="fokus-cincin h-1 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-200 accent-zinc-900 disabled:cursor-not-allowed dark:bg-zinc-800 dark:accent-zinc-100"
      />

      <span className="shrink-0 text-xs tabular-nums text-zinc-500">
        {jam(posisi)}
        {durasi ? ` / ${jam(durasi)}` : ''}
      </span>
    </div>
  )
}

function jam(detik: number): string {
  if (!Number.isFinite(detik)) return '0:00'
  const m = Math.floor(detik / 60)
  const s = Math.floor(detik % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}
