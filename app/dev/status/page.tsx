import type { Metadata } from 'next'
import { DaftarStatus, type ItemStatus } from '@/komponen/DaftarStatus'
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
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">Status API</h1>
        <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-sm text-zinc-600 dark:border-zinc-700 dark:text-zinc-400">
          Belum ada data pemeriksaan. Jalankan <code className="font-mono">npm run probe</code>{' '}
          untuk menghasilkan <code className="font-mono">public/status.json</code>.
        </p>
      </div>
    )
  }

  const ringkasan = status.api.map(ringkasApi)
  const items: ItemStatus[] = ringkasan.map((r) => ({
    ringkas: r,
    asal: registry.find((a) => a.slug === r.slug)?.asal ?? 'global',
    dokumentasi: registry.find((a) => a.slug === r.slug)?.dokumentasi,
    endpoints: status.api.find((a) => a.slug === r.slug)?.endpoints ?? [],
  }))

  return (
    <div className="space-y-10">
      <div className="space-y-2">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">Status API</h1>
        <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          Tiap endpoint dipanggil langsung ke alamat aslinya, bukan ke halaman
          dokumentasinya. Sebuah endpoint hanya dinyatakan sehat kalau statusnya di bawah 400,
          Content-Type-nya JSON, body-nya terurai, isinya tidak kosong, dan ukurannya di atas
          ambang yang tercatat.
        </p>
        <p className="teks-badan text-zinc-500">
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


      <DaftarStatus item={items} />

      <p className="text-xs text-zinc-500">
        Pemeriksaan berjalan tiap 6 jam. Tidak lebih sering — sebagian API di katalog ini
        dibiayai pengembangnya sendiri. Persentase uptime dihitung dari pemeriksaan 30
        hari terakhir; endpoint yang baru ditambahkan memulai riwayatnya dari sedikit cek,
        jadi angkanya menguat seiring waktu.
      </p>
    </div>
  )
}

function Kotak({ label, nilai, tekan = false }: { label: string; nilai: string; tekan?: boolean }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4 dark:border-zinc-800">
      <dt className="teks-mikro uppercase text-zinc-500">{label}</dt>
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

function waktuPanjang(iso: string): string {
  const w = Date.parse(iso)
  if (Number.isNaN(w)) return iso
  return new Intl.DateTimeFormat('id-ID', { dateStyle: 'long', timeStyle: 'short' }).format(w)
}
