import type { Metadata } from 'next'
import { RiwayatBatang } from '@/komponen/RiwayatBatang'
import { muatSemuaApi } from '@/lib/registry'
import { muatStatus, ringkasApi } from '@/lib/status'

export const metadata: Metadata = {
  title: 'Status API',
  description:
    'Status hidup/mati tiap endpoint di katalog Pusaka, diperiksa otomatis tiap 6 jam langsung ke endpoint aslinya.',
}

export default function HalamanStatus() {
  const status = muatStatus()
  const registry = muatSemuaApi()

  if (!status) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Status API</h1>
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Belum ada data pemeriksaan. Jalankan <code className="font-mono">npm run probe</code>{' '}
          untuk menghasilkan <code className="font-mono">public/status.json</code>.
        </p>
      </div>
    )
  }

  const ringkasan = status.api.map(ringkasApi)
  const bermasalah = ringkasan.filter((r) => !r.sehat)
  const beku = ringkasan.filter((r) => r.umurDataMaks !== null && r.umurDataMaks > 7)

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Status API</h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Tiap endpoint dipanggil langsung ke alamat aslinya, bukan ke halaman
          dokumentasinya. Sebuah endpoint hanya dinyatakan sehat kalau statusnya di bawah 400,
          Content-Type-nya JSON, body-nya terurai, isinya tidak kosong, dan ukurannya di atas
          ambang yang tercatat.
        </p>
        <p className="text-sm text-zinc-500">
          Pemeriksaan terakhir {waktuPanjang(status.diperbarui)} ·{' '}
          <a href="/status.json" className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600">
            status.json
          </a>
        </p>
      </div>

      <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Kotak label="API" nilai={String(status.ringkasan.api)} />
        <Kotak label="Endpoint" nilai={String(status.ringkasan.endpoint)} />
        <Kotak label="Sehat" nilai={String(status.ringkasan.ok)} />
        <Kotak
          label="Bermasalah"
          nilai={String(status.ringkasan.gagal)}
          tekan={status.ringkasan.gagal > 0}
        />
      </dl>

      {bermasalah.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Sedang bermasalah
          </h2>
          <ul className="space-y-1 text-sm">
            {bermasalah.map((r) => (
              <li key={r.slug}>
                <span className="font-medium">{r.nama}</span>{' '}
                <span className="text-zinc-600 dark:text-zinc-400">
                  — {r.endpointGagal.join(', ')}
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {beku.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Hidup tapi datanya tua
          </h2>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Endpoint di bawah lolos semua pemeriksaan, tapi stempel waktu terbaru di dalam
            datanya sudah lama. Ini bukan galat — hanya sesuatu yang perlu dilihat manusia.
          </p>
          <ul className="space-y-1 text-sm">
            {beku.map((r) => (
              <li key={r.slug}>
                <span className="font-medium">{r.nama}</span>{' '}
                <span className="text-zinc-600 dark:text-zinc-400">
                  — data terbaru sekitar {r.umurDataMaks} hari
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Semua API
        </h2>

        {ringkasan.map((r) => {
          const api = status.api.find((a) => a.slug === r.slug)!
          const dokumentasi = registry.find((a) => a.slug === r.slug)?.dokumentasi
          return (
            <article
              key={r.slug}
              className="space-y-3 rounded-xl border border-zinc-200 p-4 dark:border-zinc-800"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-0.5">
                  <h3 className="font-medium">
                    {dokumentasi ? (
                      <a
                        href={dokumentasi}
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
                <Angka label="Uptime 30 hari" nilai={r.uptime30 === null ? '—' : `${r.uptime30.toFixed(1)}%`} />
                <Angka label="Latency rata-rata" nilai={r.latencyRataRata === null ? '—' : `${r.latencyRataRata} ms`} />
                {r.umurDataMaks !== null && <Angka label="Umur data" nilai={`${r.umurDataMaks} hari`} />}
              </dl>

              <ul className="space-y-2">
                {api.endpoints.map((e) => {
                  const akhir = e.catatan.at(-1)
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
      </section>

      <p className="text-xs text-zinc-500">
        Pemeriksaan berjalan tiap 6 jam. Tidak lebih sering — sebagian API di katalog ini
        dibiayai pengembangnya sendiri.
      </p>
    </div>
  )
}

function Kotak({ label, nilai, tekan = false }: { label: string; nilai: string; tekan?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <dt className="text-xs uppercase tracking-wide text-zinc-500">{label}</dt>
      <dd
        className={`text-2xl font-semibold tabular-nums ${
          tekan ? 'text-red-600 dark:text-red-400' : ''
        }`}
      >
        {nilai}
      </dd>
    </div>
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

function waktuPanjang(iso: string): string {
  const w = Date.parse(iso)
  if (Number.isNaN(w)) return iso
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(w)
}
