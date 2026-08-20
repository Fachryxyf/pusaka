import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { DAFTAR_ALAT, cariAlat } from '@/alat/daftar'
import type { Api } from '@/registry/schema'
import { Ikon } from '@/komponen/Ikon'
import { muatApi } from '@/lib/registry'

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

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-400">
          ← Semua alat
        </Link>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Ikon nama={alat.ikon} className="h-6 w-6 shrink-0 text-zinc-500" />
          {alat.judul}
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">{alat.deskripsi}</p>
      </div>

      <Komponen api={api} pendukung={pendukung} />

      <p className="text-xs text-zinc-500 dark:text-zinc-500">
        Sumber data:{' '}
        <a href={api.dokumentasi} className="underline" rel="noopener noreferrer" target="_blank">
          {api.nama}
        </a>{' '}
        oleh {api.developer.nama}.
      </p>
    </div>
  )
}
