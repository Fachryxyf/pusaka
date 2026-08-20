// Snapshot API ber-`mirror: true` jadi berkas statis (SPEC §8 lapis 3).
//
// Ditulis ke `public/mirror/` — bukan `data/mirror/` seperti rancangan awal SPEC §4 —
// karena situs disajikan sebagai ekspor statis di GitHub Pages. Mirror harus bisa
// diambil browser lewat URL, dan di ekspor statis hanya isi `public/` yang tersaji.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { ambil } from '@/lib/client'
import { muatSemuaApi } from '@/lib/registry'

const DIR = join(process.cwd(), 'public', 'mirror')

export type BerkasMirror = {
  slug: string
  per: string // ISO
  endpoints: Record<string, unknown>
}

async function main() {
  mkdirSync(DIR, { recursive: true })

  const perluMirror = muatSemuaApi().filter((a) => a.mirror)
  if (perluMirror.length === 0) {
    console.log('Tidak ada API dengan mirror: true.')
    return
  }

  let gagalTotal = 0

  for (const api of perluMirror) {
    const endpoints: Record<string, unknown> = {}
    let gagal = 0

    for (const ep of api.endpoints) {
      // Endpoint berparameter tidak di-mirror: kombinasinya tak terbatas.
      if (ep.params.length > 0) {
        console.log(`  - ${api.slug}/${ep.id}: dilewati (berparameter)`)
        continue
      }

      try {
        const hasil = await ambil(api, ep)

        // Ambang ukuran menangkap scraper mati yang membalas bungkus normal isi
        // kosong (SPEC §9 syarat 5). Snapshot yang kosong lebih buruk dari tidak ada.
        if (hasil.ukuranByte < ep.minUkuranByte) {
          throw new Error(`${hasil.ukuranByte} B di bawah ambang ${ep.minUkuranByte} B`)
        }

        endpoints[ep.id] = hasil.data
        console.log(`  ok ${api.slug}/${ep.id} — ${hasil.ukuranByte} B`)
      } catch (e) {
        gagal++
        console.error(`  GAGAL ${api.slug}/${ep.id}: ${(e as Error).message}`)
      }
    }

    if (Object.keys(endpoints).length === 0) {
      gagalTotal++
      console.error(`  ${api.slug}: tidak ada endpoint yang berhasil — berkas lama dibiarkan`)
      continue
    }

    const isi: BerkasMirror = { slug: api.slug, per: new Date().toISOString(), endpoints }
    writeFileSync(join(DIR, `${api.slug}.json`), `${JSON.stringify(isi)}\n`)
    console.log(`${api.slug}: ${Object.keys(endpoints).length} endpoint tersimpan${gagal ? ` (${gagal} gagal)` : ''}`)
  }

  // Keluar tidak-nol hanya kalau ada API yang gagal seluruhnya, supaya workflow
  // kelihatan merah tanpa menimpa mirror lama dengan data kosong.
  if (gagalTotal > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
