'use client'

import { useEffect, useMemo, useState } from 'react'
import { RiwayatBatang } from '@/komponen/RiwayatBatang'
import { Pager } from '@/komponen/Pager'
import { Pilih } from '@/komponen/Pilih'
import { rentetanGagal, type RingkasApi, type RiwayatEndpoint } from '@/lib/ringkas'

export type ItemStatus = {
  ringkas: RingkasApi
  asal: 'indonesia' | 'global'
  dokumentasi?: string
  endpoints: RiwayatEndpoint[]
}

const PER_HALAMAN = 10

export function DaftarStatus({ item }: { item: ItemStatus[] }) {
  // Default Semua (2026-10-08): sama seperti katalog.
  const [asal, setAsal] = useState('semua')
  const [halaman, setHalaman] = useState(1)

  useEffect(() => {
    setHalaman(1)
  }, [asal])

  const saring = useMemo(
    () => (asal === 'semua' ? item : item.filter((i) => i.asal === asal)),
    [item, asal],
  )
  const bermasalah = saring.filter((i) => !i.ringkas.sehat)
  const beku = saring.filter(
    (i) => i.ringkas.umurDataMaks !== null && i.ringkas.umurDataMaks > 7,
  )

  const totalHalaman = Math.max(1, Math.ceil(saring.length / PER_HALAMAN))
  const halamanAktif = Math.min(halaman, totalHalaman)
  const tampil = saring.slice((halamanAktif - 1) * PER_HALAMAN, halamanAktif * PER_HALAMAN)

  return (
    <>
      <div className="w-full sm:w-72">
        <Pilih
          id="filter-asal-status"
          label="Asal katalog"
          nilai={asal}
          onPilih={setAsal}
          opsi={[
            { nilai: 'indonesia', label: 'Indonesia' },
            { nilai: 'global', label: 'Global' },
            { nilai: 'semua', label: 'Semua' },
          ]}
        />
      </div>

      {bermasalah.length > 0 && (
        <section className="space-y-2">
          <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
            Sedang bermasalah
          </h2>
          <ul className="space-y-1 text-sm">
            {bermasalah.map((i) => (
              <li key={i.ringkas.slug}>
                <span className="font-medium">{i.ringkas.nama}</span>{' '}
                <span className="text-zinc-600 dark:text-zinc-400">
                  — {i.ringkas.endpointGagal.join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {beku.length > 0 && (
        <section className="space-y-2">
          <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
            Hidup tapi datanya tua
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Endpoint di bawah lolos semua pemeriksaan, tapi stempel waktu terbaru di dalam
            datanya sudah lama. Ini bukan galat — hanya sesuatu yang perlu dilihat manusia.
          </p>
          <ul className="space-y-1 text-sm">
            {beku.map((i) => (
              <li key={i.ringkas.slug}>
                <span className="font-medium">{i.ringkas.nama}</span>{' '}
                <span className="text-zinc-600 dark:text-zinc-400">
                  — data terbaru sekitar {i.ringkas.umurDataMaks} hari
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="teks-mikro font-semibold uppercase text-zinc-500">
          Semua API
        </h2>

        <p className="text-sm text-zinc-600 dark:text-zinc-400">
          {saring.length} dari {item.length} API
        </p>

        {tampil.map((i) => {
          const r = i.ringkas
          return (
            <article
              key={r.slug}
              className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-medium">
                    {i.dokumentasi ? (
                      <a
                        href={i.dokumentasi}
                        rel="noopener noreferrer"
                        target="_blank"
                        className="fokus-cincin rounded hover:underline"
                      >
                        {r.nama}
                      </a>
                    ) : (
                      r.nama
                    )}
                  </h3>
                  <p className="text-xs text-zinc-500">
                    <code className="font-mono">{r.slug}</code> · {r.kategori} · CORS {r.cors} ·{' '}
                    {r.jumlahEndpoint} endpoint
                  </p>
                </div>
                <Lencana sehat={r.sehat} gagal={r.endpointGagal.length} />
              </div>

              <dl className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-zinc-600 dark:text-zinc-400">
                <Angka
                  label="Uptime 30 hari"
                  nilai={r.uptime30 === null ? '—' : `${r.uptime30.toFixed(1)}% · ${r.cek30} cek`}
                />
                <Angka
                  label="Latency rata-rata"
                  nilai={r.latencyRataRata === null ? '—' : `${r.latencyRataRata} ms`}
                />
                {r.umurDataMaks !== null && (
                  <Angka label="Umur data" nilai={`${r.umurDataMaks} hari`} />
                )}
              </dl>

              <ul className="space-y-2">
                {i.endpoints.map((e) => {
                  const akhir = e.catatan.at(-1)
                  const beruntun = rentetanGagal(e.catatan)
                  return (
                    <li
                      key={e.endpointId}
                      className="flex flex-wrap items-center justify-between gap-3 border-t border-zinc-100 pt-2 dark:border-zinc-800/60"
                    >
                      <div className="min-w-0">
                        <code className="font-mono text-sm">{e.endpointId}</code>
                        <p className="text-xs text-zinc-500">
                          {akhir
                            ? `${akhir.status} · ${akhir.latencyMs} ms · ${akhir.ukuranByte} B${
                                akhir.ok ? '' : ` · ${akhir.sebab ?? 'gagal'}`
                              }`
                            : 'belum diperiksa'}
                          {beruntun >= 2 && (
                            <span className="font-medium text-red-600 dark:text-red-400">
                              {' '}· gagal {beruntun} cek beruntun
                            </span>
                          )}
                        </p>
                      </div>
                      <RiwayatBatang catatan={e.catatan} />
                    </li>
                  )
                })}
              </ul>
            </article>
          )
        })}

        <Pager halaman={halamanAktif} total={totalHalaman} onPilih={setHalaman} />
      </section>
    </>
  )
}

function Angka({ label, nilai }: { label: string; nilai: string }) {
  return (
    <div>
      <dt className="inline">{label}: </dt>
      <dd className="inline font-medium tabular-nums text-zinc-900 dark:text-zinc-100">{nilai}</dd>
    </div>
  )
}

function Lencana({ sehat, gagal }: { sehat: boolean; gagal: number }) {
  return (
    <span
      className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${
        sehat
          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-200'
          : 'border-red-300 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950 dark:text-red-200'
      }`}
    >
      {sehat ? 'Sehat' : `${gagal} endpoint bermasalah`}
    </span>
  )
}
