import type { Metadata } from 'next'
import Link from 'next/link'
import { KatalogApi, type BarisApi } from '@/komponen/KatalogApi'
import { muatSemuaApi } from '@/lib/registry'
import { petaKesehatan, type RingkasApi } from '@/lib/status'

export const metadata: Metadata = {
  title: 'Katalog API',
  description:
    'Katalog API publik Indonesia yang bisa dipanggil program: base URL, endpoint, params, dan status hidup/mati yang diperiksa otomatis.',
}

export default function HalamanDev() {
  const api = muatSemuaApi()
  const jumlahEndpoint = api.reduce((n, a) => n + a.endpoints.length, 0)

  // Objek Api penuh tidak diteruskan ke klien — contohResponse bisa besar dan tidak
  // dipakai daftar.
  const baris: BarisApi[] = api.map((a) => ({
    slug: a.slug,
    nama: a.nama,
    kategori: a.kategori,
    deskripsi: a.deskripsi,
    auth: a.auth,
    cors: a.cors,
    jumlahEndpoint: a.endpoints.length,
    mirror: a.mirror,
    lisensi: a.provenance.lisensi,
  }))

  const kesehatan: Record<string, RingkasApi> = Object.fromEntries(petaKesehatan())

  return (
    <div className="space-y-12">
      <section className="space-y-5">
        <h1 className="text-[1.75rem] font-semibold leading-tight tracking-tight sm:text-4xl">Katalog API</h1>
        <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          Katalog API publik Indonesia yang <strong>bisa dipanggil program</strong>. Tiap entri
          memuat base URL, path endpoint, params beserta contoh nilainya, ambang ukuran response,
          dan status hidup/mati yang diperiksa otomatis tiap 6 jam.
        </p>

        <div className="space-y-2 rounded-xl border border-zinc-200 bg-zinc-50 p-5 dark:border-zinc-800 dark:bg-zinc-900/40">
          <p className="teks-badan text-zinc-700 dark:text-zinc-300">
            Katalog aslinya tidak punya field base URL maupun endpoint sama sekali, jadi datanya
            tidak bisa dipanggil program. Field statusnya juga manual — 150 dari 151 entri
            berstatus hidup, padahal 38 di antaranya sudah mati. Lapisan itulah yang ditambahkan
            di sini.
          </p>
          <p className="teks-badan text-zinc-600 dark:text-zinc-400">
            Registry ini masih memuat {api.length} API dari 151 yang ada di inventaris. Sisanya
            dikerjakan bertahap — API baru hanya masuk setelah endpointnya dipanggil sungguhan dan
            bentuk responsnya dicatat.
          </p>
        </div>

        <dl className="flex flex-wrap gap-x-10 gap-y-3">
          <Angka jumlah={api.length} label="API terdaftar" />
          <Angka jumlah={jumlahEndpoint} label="endpoint tervalidasi" />
          <Angka jumlah={api.filter((a) => a.auth === 'none').length} label="tanpa kunci API" />
        </dl>

        <p className="teks-badan text-zinc-600 dark:text-zinc-400">
          Butuh data mentahnya?{' '}
          <a
            href="/status.json"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            status.json
          </a>{' '}
          memuat riwayat pemeriksaan 90 hari dengan CORS terbuka, dan{' '}
          <Link
            href="/dev/status"
            className="underline decoration-zinc-300 underline-offset-2 dark:decoration-zinc-600"
          >
            dashboard status
          </Link>{' '}
          menampilkannya per endpoint.
        </p>
      </section>

      <KatalogApi baris={baris} kesehatan={kesehatan} />
    </div>
  )
}

function Angka({ jumlah, label }: { jumlah: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="text-2xl font-semibold tabular-nums">{jumlah}</span>{' '}
        <span className="teks-badan text-zinc-600 dark:text-zinc-400">{label}</span>
      </dd>
    </div>
  )
}
