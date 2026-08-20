import type { ComponentType } from 'react'
import type { Api } from '@/registry/schema'
import type { NamaIkon } from '@/komponen/Ikon'

export type MetaAlat = {
  slug: string
  judul: string
  ikon: NamaIkon
  deskripsi: string
  apiSlug: string
}

// Api dimuat di Server Component lalu diteruskan sebagai prop: loader registry
// memakai `fs`, jadi tidak bisa jalan di browser (SPEC §4).
export type Alat = MetaAlat & {
  Komponen: ComponentType<{ api: Api }>
}
