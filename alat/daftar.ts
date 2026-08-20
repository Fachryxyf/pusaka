// Satu-satunya tempat alat didaftarkan. Import statis supaya typecheck-nya nyata.
import type { Alat, MetaAlat } from '@/alat/tipe'
import Gempa from '@/alat/gempa'
import { meta as metaGempa } from '@/alat/gempa/meta'

export const DAFTAR_ALAT: Alat[] = [{ ...metaGempa, Komponen: Gempa }]

// Komponen tidak bisa diserialisasi ke Client Component, jadi metadatanya dipisah.
export const DAFTAR_META: MetaAlat[] = [metaGempa]

export function cariAlat(slug: string): Alat | undefined {
  return DAFTAR_ALAT.find((a) => a.slug === slug)
}
