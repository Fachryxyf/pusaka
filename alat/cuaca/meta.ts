import type { MetaAlat } from '@/alat/tipe'

export const meta: MetaAlat = {
  slug: 'cuaca',
  judul: 'Prakiraan Cuaca',
  ikon: 'cuaca',
  deskripsi: 'Prakiraan cuaca resmi BMKG sampai tingkat desa, per tiga jam untuk tiga hari.',
  apiSlug: 'cuaca-bmkg',
  // Kode adm4 harus diambil dari idn-area dulu; kodenya tidak bisa dikarang.
  apiPendukung: ['wilayah-idn-area'],
}
