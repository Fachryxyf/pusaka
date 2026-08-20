// Satu-satunya tempat alat didaftarkan. Import statis supaya typecheck-nya nyata.
import type { Alat, MetaAlat } from '@/alat/tipe'
import Gempa from '@/alat/gempa'
import { meta as metaGempa } from '@/alat/gempa/meta'
import ObjekDekatBumi from '@/alat/objek-dekat-bumi'
import { meta as metaObjekDekatBumi } from '@/alat/objek-dekat-bumi/meta'
import Wilayah from '@/alat/wilayah'
import { meta as metaWilayah } from '@/alat/wilayah/meta'

export const DAFTAR_ALAT: Alat[] = [
  { ...metaGempa, Komponen: Gempa },
  { ...metaObjekDekatBumi, Komponen: ObjekDekatBumi },
  { ...metaWilayah, Komponen: Wilayah },
]

// Komponen tidak bisa diserialisasi ke Client Component, jadi metadatanya dipisah.
export const DAFTAR_META: MetaAlat[] = [metaGempa, metaObjekDekatBumi, metaWilayah]

export function cariAlat(slug: string): Alat | undefined {
  return DAFTAR_ALAT.find((a) => a.slug === slug)
}
