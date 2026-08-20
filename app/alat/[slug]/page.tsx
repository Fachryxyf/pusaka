import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DAFTAR_ALAT, cariAlat } from '@/alat/daftar'
import type { Api } from '@/registry/schema'
import { Ikon } from '@/komponen/Ikon'
import { muatApi } from '@/lib/registry'
import { petaKesehatan } from '@/lib/status'

export function generateStaticParams() {
  return DAFTAR_ALAT.map((a) => ({ slug: a.slug }))
}

export async function generateMetadata({ params }: PageProps<'/alat/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const alat = cariAlat(slug)
  if (!alat) return { title: 'Alat tidak ditemukan' }
  return { title: alat.judul, description: alat.deskripsi }
}

export default async function HalamanAlat({ params }: PageProps<'/alat/[slug]'>) {
  const { slug } = await params
  const alat = cariAlat(slug)
  if (!alat) notFound()

  // Registry dimuat di server (pakai fs), lalu diteruskan sebagai prop ke komponen alat.
  const api = muatApi(alat.apiSlug)
  if (!api) notFound()

  // Slug pendukung yang tidak ada di registry adalah kesalahan pemrograman, bukan
  // halaman yang salah alamat — jadi dilempar, bukan di-notFound.
  const pendukung: Record<string, Api> = {}
  for (const slugPendukung of alat.apiPendukung ?? []) {
    const tambahan = muatApi(slugPendukung)
    if (!tambahan) {
      throw new Error(`alat '${alat.slug}' butuh API '${slugPendukung}' yang tidak ada di registry`)
    }
    pendukung[slugPendukung] = tambahan
  }

  const { Komponen } = alat

  // Banner jujur kalau API-nya sedang gagal probe. Alatnya TIDAK disembunyikan —
  // pengguna berhak mencoba sendiri (TASKS T3.4).
  const kesehatan = petaKesehatan().get(alat.apiSlug)
  const bermasalah = kesehatan?.sehat === false

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Link
          href="/"
          className="fokus-cincin teks-kecil inline-block rounded text-zinc-500 transition hover:text-zinc-900 dark:hover:text-zinc-100"
        >
          ← Semua alat
        </Link>
        <h1 className="flex items-center gap-2.5 text-[1.625rem] font-semibold leading-tight tracking-tight">
          <Ikon nama={alat.ikon} className="h-6 w-6 shrink-0 text-zinc-500" />
          {alat.judul}
        </h1>
        <p className="max-w-2xl leading-relaxed text-zinc-600 dark:text-zinc-400">
          {alat.deskripsi}
        </p>
      </div>

      {bermasalah && (
        <p
          role="status"
          className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-950 dark:text-amber-100"
        >
          Pemeriksaan terakhir menemukan {kesehatan.endpointGagal.length} dari{' '}
          {kesehatan.jumlahEndpoint} endpoint {api.nama} sedang bermasalah, jadi alat ini
          mungkin tidak menampilkan data dengan benar.{' '}
          <Link href="/dev/status" className="underline">
            Lihat status lengkapnya
          </Link>
          .
        </p>
      )}

      <Komponen api={api} pendukung={pendukung} />

      <p className="teks-mikro text-zinc-500">
        Sumber data:{' '}
        <a href={api.dokumentasi} className="underline" rel="noopener noreferrer" target="_blank">
          {api.nama}
        </a>{' '}
        oleh {api.developer.nama}.
      </p>
    </div>
  )
}
