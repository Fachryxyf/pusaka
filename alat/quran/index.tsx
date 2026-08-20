'use client'

import { useMemo, useState } from 'react'
import type { PropAlat } from '@/alat/tipe'
import { useApi } from '@/lib/useApi'
import { BannerMirror, Galat, Kerangka, Kosong } from '@/komponen/keadaan'
import { PemutarAudio } from '@/komponen/PemutarAudio'
import { Pilih } from '@/komponen/Pilih'
import { TeksBertag } from '@/komponen/TeksBertag'

// /surat -> data ARRAY; /surat/{n} -> data OBJEK. Beda bentuk (REFERENCE.md).
type RingkasSurat = {
  nomor: number
  nama: string
  namaLatin: string
  jumlahAyat: number
  tempatTurun: string
  arti: string
}
type BalasanDaftar = { data?: RingkasSurat[] }

type Ayat = {
  nomorAyat: number
  teksArab: string
  teksLatin: string
  teksIndonesia: string
  // Kunci audio adalah string berangka "01"-"06", BUKAN indeks array.
  audio?: Record<string, string>
}
type DetailSurat = RingkasSurat & {
  deskripsi: string
  audioFull?: Record<string, string>
  ayat?: Ayat[]
}
type BalasanDetail = { data?: DetailSurat }

// Nama qari tidak ada di response — hanya di dalam URL-nya (REFERENCE.md).
const QARI = [
  { kunci: '01', nama: 'Abdullah Al-Juhany' },
  { kunci: '02', nama: 'Abdul Muhsin Al-Qasim' },
  { kunci: '03', nama: 'Abdurrahman as-Sudais' },
  { kunci: '04', nama: 'Ibrahim Al-Dossari' },
  { kunci: '05', nama: 'Misyari Rasyid Al-Afasi' },
  { kunci: '06', nama: 'Yasser Al-Dosari' },
] as const

const QARI_BAWAAN = '05'

export default function AlatQuran({ api }: PropAlat) {
  const [nomor, setNomor] = useState('1')
  const [qari, setQari] = useState<string>(QARI_BAWAAN)

  const daftar = useApi<BalasanDaftar>(api, 'daftarSurat')

  // Dimuat setelah daftar selesai: response /surat 123 KB dan /surat/2 397 KB,
  // jadi tidak perlu keduanya berebut jalur sekaligus.
  const detail = useApi<BalasanDetail>(api, 'detailSurat', { nomor }, !daftar.loading)

  const surat = daftar.data?.data
  const isi = detail.data?.data

  const opsiSurat = useMemo(
    () =>
      (surat ?? []).map((s) => ({
        nilai: String(s.nomor),
        label: `${s.nomor}. ${s.namaLatin} — ${s.arti} (${s.jumlahAyat} ayat)`,
      })),
    [surat],
  )

  return (
    <div className="space-y-6">
      <section className="space-y-1">
        {daftar.sumber === 'mirror' && <BannerMirror per={daftar.per} />}

        {daftar.loading ? (
          <>
            <span className="block text-sm font-medium">Surat</span>
            <Kerangka baris={1} />
          </>
        ) : daftar.error ? (
          <>
            <span className="block text-sm font-medium">Surat</span>
            <Galat pesan={daftar.error} onUlangi={daftar.ulangi} />
          </>
        ) : opsiSurat.length === 0 ? (
          <>
            <span className="block text-sm font-medium">Surat</span>
            <Kosong pesan="Daftar surat tidak bisa dimuat." saran="Coba muat ulang halaman." />
          </>
        ) : (
          <>
            <Pilih
              id="pilih-surat"
              label="Surat"
              nilai={nomor}
              opsi={opsiSurat}
              onPilih={setNomor}
              placeholder="Pilih surat"
            />
            <p className="text-xs text-zinc-500">{opsiSurat.length} surat</p>
          </>
        )}
      </section>

      <section className="space-y-4">
        {detail.sumber === 'mirror' && <BannerMirror per={detail.per} />}

        {detail.loading && <Kerangka baris={8} />}
        {!detail.loading && detail.error && <Galat pesan={detail.error} onUlangi={detail.ulangi} />}
        {!detail.loading && !detail.error && !isi && (
          <Kosong pesan="Surat ini tidak bisa dimuat." saran="Coba pilih surat lain." />
        )}

        {isi && <Surat isi={isi} qari={qari} onGantiQari={setQari} />}
      </section>
    </div>
  )
}

function Surat({
  isi,
  qari,
  onGantiQari,
}: {
  isi: DetailSurat
  qari: string
  onGantiQari: (kunci: string) => void
}) {
  const [deskripsiTerbuka, setDeskripsiTerbuka] = useState(false)

  // audioFull["05"], bukan audioFull[5] — kuncinya string berangka.
  const audioSurat = isi.audioFull?.[qari]
  const namaQari = QARI.find((q) => q.kunci === qari)?.nama ?? qari
  const ayat = isi.ayat ?? []

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold">
            {isi.nomor}. {isi.namaLatin}
          </h2>
          <p className="text-lg" dir="rtl" lang="ar">
            {isi.nama}
          </p>
        </div>
        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {isi.arti} · {isi.tempatTurun} · {isi.jumlahAyat} ayat
        </p>

        <div className="space-y-2 pt-1">
          <Pilih
            id="pilih-qari"
            label="Qari"
            nilai={qari}
            opsi={QARI.map((q) => ({ nilai: q.kunci, label: q.nama }))}
            onPilih={onGantiQari}
          />
          {audioSurat ? (
            <PemutarAudio src={audioSurat} judul={`murottal ${isi.namaLatin} oleh ${namaQari}`} />
          ) : (
            <p className="text-sm text-zinc-500">Audio surat penuh tidak tersedia untuk qari ini.</p>
          )}
        </div>
      </div>

      {isi.deskripsi && (
        <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setDeskripsiTerbuka((v) => !v)}
            aria-expanded={deskripsiTerbuka}
            className="fokus-cincin flex w-full items-center justify-between gap-2 text-left text-sm font-medium"
          >
            Tentang surat ini
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
              className={`h-4 w-4 shrink-0 text-zinc-500 transition-transform ${deskripsiTerbuka ? 'rotate-180' : ''}`}
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
          {deskripsiTerbuka && (
            // deskripsi memuat <i>, <br>, dan satu <a> ke berkas yang tidak ada.
            // TeksBertag mengurainya tanpa dangerouslySetInnerHTML (REFERENCE.md).
            <TeksBertag
              teks={isi.deskripsi}
              className="mt-3 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300"
            />
          )}
        </div>
      )}

      {ayat.length === 0 ? (
        <Kosong pesan="Ayat untuk surat ini tidak tersedia." />
      ) : (
        <ol className="divide-y divide-zinc-200 rounded-xl border border-zinc-200 dark:divide-zinc-800 dark:border-zinc-800">
          {ayat.map((a) => (
            <li key={a.nomorAyat} className="space-y-3 p-4">
              <div className="flex items-start justify-between gap-4">
                <span className="mt-1 shrink-0 rounded-full border border-zinc-300 px-2 py-0.5 text-xs tabular-nums text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
                  {isi.nomor}:{a.nomorAyat}
                </span>
                <p
                  dir="rtl"
                  lang="ar"
                  className="min-w-0 flex-1 text-right text-2xl leading-loose"
                >
                  {a.teksArab}
                </p>
              </div>
              <p className="text-sm italic text-zinc-600 dark:text-zinc-400">{a.teksLatin.trim()}</p>
              <p className="text-sm leading-relaxed">{a.teksIndonesia}</p>
              {a.audio?.[qari] && (
                <PemutarAudio
                  src={a.audio[qari]}
                  judul={`ayat ${isi.nomor}:${a.nomorAyat} oleh ${namaQari}`}
                />
              )}
            </li>
          ))}
        </ol>
      )}

      <p className="text-xs text-zinc-500">
        Teks, terjemahan, dan audio dari EQuran.id. Terjemahan dan audio dilindungi hak cipta
        penerbitnya, jadi tidak disalin ke mirror.
      </p>
    </div>
  )
}
