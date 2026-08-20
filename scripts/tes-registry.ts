// Tes registry tanpa framework: assert bawaan Node. Jalankan: `npx tsx scripts/tes-registry.ts`.
// YAML rusak sengaja ditulis ke registry/apis/ lalu dihapus, supaya yang diuji adalah
// jalur muat yang sungguhan dipakai build — bukan tiruan.
import assert from 'node:assert/strict'
import { unlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { ApiSchema } from '@/registry/schema'
import { cekPlaceholder, daftarBerkasApi, muatApi, muatBerkas, muatSemuaApi } from '@/lib/registry'

const SLUG_UJI = 'zz-tes-palsu'
const DIR_APIS = join(process.cwd(), 'registry', 'apis')

let lolos = 0
function tes(nama: string, f: () => void) {
  f()
  lolos++
  console.log(`  ok  ${nama}`)
}

// Tulis YAML ke registry/apis, pastikan muatSemuaApi() melempar error yang menyebut potonganPesan.
function tolak(nama: string, yaml: string, potonganPesan: string, namaBerkas = `${SLUG_UJI}.yml`) {
  const berkas = join(DIR_APIS, namaBerkas)
  writeFileSync(berkas, yaml)
  try {
    let pesan: string | null = null
    try {
      muatSemuaApi()
    } catch (e) {
      pesan = (e as Error).message
    }
    assert.ok(pesan !== null, `${nama}: YAML rusak malah lolos muatSemuaApi()`)
    assert.ok(
      pesan.includes(namaBerkas) || pesan.includes(potonganPesan),
      `${nama}: pesan error tidak menyebut nama berkas — dapat: ${pesan}`,
    )
    assert.ok(
      pesan.toLowerCase().includes(potonganPesan.toLowerCase()),
      `${nama}: pesan error tidak menyebut '${potonganPesan}' — dapat: ${pesan}`,
    )
    lolos++
    console.log(`  ok  ${nama}`)
  } finally {
    unlinkSync(berkas)
  }
}

const dasar = `slug: ${SLUG_UJI}
nama: Palsu
kategori: uji
deskripsi: Buat tes.
developer:
  nama: Uji
  profil: 'https://contoh.test'
dokumentasi: 'https://contoh.test/docs'
upstreamName: null
auth: none
cors: open
baseUrl: 'https://contoh.test'
mirror: false
endpoints:
  - id: satu
    method: GET
    path: /a
    deskripsi: Endpoint uji.
    params: []
    contohPath: /a
    minUkuranByte: 10
`

console.log('registry/apis nyata:')

tes('semua berkas .yml lolos ApiSchema', () => {
  for (const nama of daftarBerkasApi()) muatBerkas(nama)
})

tes('muatSemuaApi mengembalikan minimal 5 API', () => {
  assert.ok(muatSemuaApi().length >= 5, 'kurang dari 5 API terbaca')
})

tes('placeholder path cocok dengan params di semua API', () => {
  assert.deepEqual(muatSemuaApi().flatMap(cekPlaceholder), [])
})

tes('muatApi(slug) menemukan gempa-bmkg dan menolak yang tidak ada', () => {
  assert.equal(muatApi('gempa-bmkg')?.slug, 'gempa-bmkg')
  assert.equal(muatApi('tidak-ada-sama-sekali'), null)
})

tes('nilai contoh berkutip tetap string (1301, 08)', () => {
  const bulan = muatApi('sholat-myquran')
    ?.endpoints.find((e) => e.id === 'jadwal')
    ?.params.find((p) => p.nama === 'bulan')
  assert.equal(typeof bulan?.contoh, 'string')
  assert.equal(bulan?.contoh, '08')
})

console.log('YAML yang harus ditolak muatSemuaApi():')

tolak('YAML tidak sah', 'slug: palsu\n  nama: nested\n', 'YAML tidak sah')
tolak('slug beda dengan nama file', dasar.replace(`slug: ${SLUG_UJI}`, 'slug: nama-lain'), 'beda dengan nama file')
tolak('endpoints kosong', dasar.replace(/endpoints:[\s\S]*$/, 'endpoints: []\n'), 'endpoints')
tolak('contohPath hilang', dasar.replace('    contohPath: /a\n', ''), 'contohPath')
tolak('minUkuranByte hilang', dasar.replace('    minUkuranByte: 10\n', ''), 'minUkuranByte')
tolak('slug pakai huruf besar', dasar.replace(`slug: ${SLUG_UJI}`, `slug: ZZ-Tes-Palsu`), 'slug')
tolak(
  'params[].contoh bukan string (1301 jadi integer)',
  dasar
    .replace('    path: /a\n', '    path: /a/{kode}\n')
    .replace('    contohPath: /a\n', '    contohPath: /a/1301\n')
    .replace('    params: []\n', '    params:\n      - nama: kode\n        contoh: 1301\n        wajib: true\n'),
  'contoh',
)

console.log('placeholder yang tidak cocok (di luar jangkauan zod):')

const apiDari = (yaml: string) => ApiSchema.parse(parse(yaml))

tes('placeholder tanpa entry params ditolak', () => {
  const salah = cekPlaceholder(apiDari(dasar.replace('    path: /a\n', '    path: /a/{kode}\n')))
  assert.ok(salah.some((s) => s.includes('{kode}')), `tidak terdeteksi: ${JSON.stringify(salah)}`)
})

tes('params tanpa placeholder di path ditolak', () => {
  const salah = cekPlaceholder(apiDari(dasar.replace(
    '    params: []\n',
    "    params:\n      - nama: kode\n        contoh: '1'\n        wajib: true\n",
  )))
  assert.ok(salah.some((s) => s.includes("params 'kode'")), `tidak terdeteksi: ${JSON.stringify(salah)}`)
})

tes('contohPath yang masih menyisakan {placeholder} ditolak', () => {
  const salah = cekPlaceholder(apiDari(dasar
    .replace('    path: /a\n', '    path: /a/{kode}\n')
    .replace('    contohPath: /a\n', '    contohPath: /a/{kode}\n')
    .replace('    params: []\n', "    params:\n      - nama: kode\n        contoh: '1'\n        wajib: true\n")))
  assert.ok(salah.some((s) => s.includes('contohPath')), `tidak terdeteksi: ${JSON.stringify(salah)}`)
})

console.log(`\n${lolos} tes lolos.`)
