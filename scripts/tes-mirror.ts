// Memeriksa berkas mirror yang sungguh ada di public/mirror terhadap registry.
// Mirror yang bentuknya salah bikin lapis 3 gagal diam-diam saat sumber aslinya mati.
import assert from 'node:assert/strict'
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { muatSemuaApi } from '@/lib/registry'

const DIR = join(process.cwd(), 'public', 'mirror')

let lolos = 0
function tes(nama: string, f: () => void) {
  f()
  lolos++
  console.log(`  ok  ${nama}`)
}

const perluMirror = muatSemuaApi().filter((a) => a.mirror)

tes('ada API yang ditandai mirror: true', () => {
  assert.ok(perluMirror.length > 0)
})

tes('tiap API mirror punya dasar hak salin yang tercatat', () => {
  for (const api of perluMirror) {
    assert.notEqual(
      api.provenance.kebijakanMirror,
      'unknown',
      `${api.slug}: mirror true tanpa provenance.kebijakanMirror`,
    )
    assert.notEqual(
      api.provenance.redistribusi,
      'tidak-boleh',
      `${api.slug}: penerbitnya melarang redistribusi, mirror harus dimatikan`,
    )
  }
})

tes('tidak ada snapshot yatim di public/mirror', () => {
  const bolehAda = new Set(perluMirror.map((a) => `${a.slug}.json`))
  const diDisk = existsSync(DIR) ? readdirSync(DIR).filter((n) => n.endsWith('.json')) : []
  const yatim = diDisk.filter((n) => !bolehAda.has(n))
  assert.deepEqual(yatim, [], `snapshot tanpa dasar di registry: ${yatim.join(', ')}`)
})

for (const api of perluMirror) {
  const berkas = join(DIR, `${api.slug}.json`)

  tes(`${api.slug}: berkas mirror ada`, () => {
    assert.ok(existsSync(berkas), `jalankan \`npm run mirror\` — ${berkas} belum ada`)
  })

  const isi = JSON.parse(readFileSync(berkas, 'utf8')) as {
    slug?: string
    per?: string
    endpoints?: Record<string, unknown>
  }

  tes(`${api.slug}: slug & tanggal 'per' sah`, () => {
    assert.equal(isi.slug, api.slug)
    assert.ok(isi.per && !Number.isNaN(Date.parse(isi.per)), `'per' bukan tanggal ISO: ${isi.per}`)
  })

  tes(`${api.slug}: semua endpoint tanpa param ikut ter-mirror`, () => {
    const wajib = api.endpoints.filter((e) => e.params.length === 0).map((e) => e.id)
    const ada = Object.keys(isi.endpoints ?? {})
    assert.deepEqual(ada.sort(), wajib.sort())
  })

  tes(`${api.slug}: tiap endpoint punya isi, bukan bungkus kosong`, () => {
    for (const [id, nilai] of Object.entries(isi.endpoints ?? {})) {
      const ep = api.endpoints.find((e) => e.id === id)!
      const byte = new TextEncoder().encode(JSON.stringify(nilai)).length
      assert.ok(
        byte >= ep.minUkuranByte,
        `${id}: ${byte} B di bawah ambang ${ep.minUkuranByte} B — scraper sumbernya mungkin mati`,
      )
    }
  })
}

console.log(`\n${lolos} tes lolos.`)
