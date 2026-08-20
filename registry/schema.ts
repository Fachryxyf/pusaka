import { z } from 'zod'

export const ParamSchema = z.object({
  nama: z.string(),
  contoh: z.string(),
  wajib: z.boolean().default(false),
  keterangan: z.string().optional(),
})

export const EndpointSchema = z.object({
  id: z.string(),                                   // unik dalam satu API
  method: z.enum(['GET', 'POST']).default('GET'),
  path: z.string(),                                 // relatif ke baseUrl, boleh punya {placeholder}
  deskripsi: z.string(),
  params: z.array(ParamSchema).default([]),
  headers: z.record(z.string(), z.string()).default({}), // header wajib selain User-Agent
  contohPath: z.string(),                           // path lengkap siap panggil, WAJIB — dipakai probe
  minUkuranByte: z.number().int().positive(),        // ambang bawah; di bawah ini = scraper mati
  contohResponse: z.unknown().optional(),           // dipotong, buat docs
})

// Hak pakai data tidak boleh ditebak — sama seperti nama field (SPEC §12).
// 'unknown' adalah nilai yang jujur dan sah; mengarang lisensi jauh lebih buruk.
export const ProvenanceSchema = z.object({
  lisensi: z.string().default('unknown'),        // SPDX id, nama lisensi, atau 'unknown'
  sumberLisensi: z.url().nullable().default(null), // halaman tempat lisensi itu dibaca
  atribusiWajib: z.boolean().default(false),     // penerbit mensyaratkan pencantuman sumber
  atribusi: z.string().nullable().default(null), // teks atribusi yang diminta penerbit
  syaratUrl: z.url().nullable().default(null),   // halaman syarat & ketentuan
  redistribusi: z.enum(['boleh', 'tidak-boleh', 'unknown']).default('unknown'),
  kebijakanMirror: z.string().default('unknown'), // dasar kenapa mirror boleh/tidak
  batasAkses: z.string().nullable().default(null), // rate limit yang dinyatakan penerbit
  diperiksa: z.string().nullable().default(null), // tanggal ISO pemeriksaan terakhir
})

export const ApiSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  nama: z.string(),
  kategori: z.string(),
  deskripsi: z.string(),
  developer: z.object({ nama: z.string(), profil: z.url().nullable() }),
  dokumentasi: z.url(),
  upstreamName: z.string().nullable(),              // buat pemetaan balik ke data farizdotid
  auth: z.enum(['none', 'apikey', 'oauth']),
  cors: z.enum(['open', 'locked', 'none', 'unknown']).default('unknown'),
  baseUrl: z.url(),
  mirror: z.boolean().default(false),
  // Wajib untuk API mirror: true — menyalin data orang tanpa tahu haknya tidak boleh.
  provenance: ProvenanceSchema.prefault({}),
  endpoints: z.array(EndpointSchema).min(1),
})
  .refine((a) => !a.mirror || a.provenance.kebijakanMirror !== 'unknown', {
    message:
      "API dengan mirror: true wajib mengisi provenance.kebijakanMirror — snapshot data orang tanpa dasar tidak boleh",
    path: ['provenance', 'kebijakanMirror'],
  })

export type Api = z.infer<typeof ApiSchema>
export type Provenance = z.infer<typeof ProvenanceSchema>
export type Endpoint = z.infer<typeof EndpointSchema>
export type Param = z.infer<typeof ParamSchema>
