import { DAFTAR_META } from '@/alat/daftar'
import PencarianAlat from '@/komponen/PencarianAlat'
import { muatSemuaApi } from '@/lib/registry'
import { petaKesehatan } from '@/lib/status'

export default function Home() {
  // Dihitung saat build dari registry, bukan ditulis tangan — angka di halaman
  // tidak boleh menyimpang dari isi registry.
  const api = muatSemuaApi()
  const jumlahEndpoint = api.reduce((n, a) => n + a.endpoints.length, 0)

  // Alat yang API-nya bermasalah diberi penanda, TIDAK disembunyikan — jujur lebih
  // berguna daripada rapi (TASKS T3.4). Kosong kalau probe belum pernah jalan.
  const kesehatan = petaKesehatan()
  const bermasalah = DAFTAR_META.filter((a) => kesehatan.get(a.apiSlug)?.sehat === false).map(
    (a) => a.slug,
  )

  return (
    <div className="space-y-10">
      <section className="space-y-4 pt-2">
        <h1 className="max-w-2xl text-3xl font-semibold tracking-tight sm:text-4xl">
          Alat harian dari data publik Indonesia
        </h1>
        <p className="max-w-2xl text-zinc-600 dark:text-zinc-400">
          Gempa, wilayah, jadwal sholat, cuaca, Al-Qur&apos;an. Semuanya menarik data langsung
          dari sumber resminya, dan tetap jalan saat sumbernya bermasalah. Tidak perlu ngerti
          API.
        </p>
        <dl className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <Angka jumlah={DAFTAR_META.length} label="alat siap pakai" />
          <Angka jumlah={api.length} label="API terdaftar" />
          <Angka jumlah={jumlahEndpoint} label="endpoint tervalidasi" />
        </dl>
      </section>

      <PencarianAlat alat={DAFTAR_META} bermasalah={bermasalah} />
    </div>
  )
}

function Angka({ jumlah, label }: { jumlah: number; label: string }) {
  return (
    <div>
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="text-2xl font-semibold tabular-nums">{jumlah}</span>{' '}
        <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
      </dd>
    </div>
  )
}
