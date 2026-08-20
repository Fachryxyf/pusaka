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
  endpoints: z.array(EndpointSchema).min(1),
})

export type Api = z.infer<typeof ApiSchema>
export type Endpoint = z.infer<typeof EndpointSchema>
export type Param = z.infer<typeof ParamSchema>
