import type { ComponentType } from 'react'
import type { Api } from '@/registry/schema'
import type { NamaIkon } from '@/komponen/Ikon'

export type MetaAlat = {
  slug: string
  judul: string
  ikon: NamaIkon
  deskripsi: string
  // API utama — dipakai untuk atribusi dan penanda status di halaman alat.
  apiSlug: string
  // API lain yang dibutuhkan alat ini. Alat Cuaca perlu wilayah-idn-area untuk
  // mendapatkan kode adm4 sebelum bisa memanggil BMKG.
  apiPendukung?: string[]
}

// Api dimuat di Server Component lalu diteruskan sebagai prop: loader registry
// memakai `fs`, jadi tidak bisa jalan di browser (SPEC §4).
export type PropAlat = {
  api: Api
  // Berkunci slug. Kosong untuk alat yang cuma butuh satu API.
  pendukung: Record<string, Api>
}

export type Alat = MetaAlat & {
  Komponen: ComponentType<PropAlat>
}
