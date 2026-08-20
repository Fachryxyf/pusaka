// T5.4 kriteria yang selama ini BELUM diuji: paksa baseUrl ke host mati, pastikan
// ambil() jatuh ke mirror dan menandai sumbernya.
//
// Ini demo inti platform — "alat tetap hidup walau API sumbernya mati" — jadi tidak
// boleh cuma diklaim. Lapis 3 dijalankan di browser lewat fetch('/mirror/...'),
// yang di Node tidak ada, maka fetch dipasangi bidak sementara yang membaca
// public/mirror/ dari disk. Yang diuji tetap lib/client.ts yang sungguhan.
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { GagalAmbil, ambil, ambilMirror } from '@/lib/client'
import { muatApi } from '@/lib/registry'
import { ApiSchema, type Api } from '@/registry/schema'

let lolos = 0
function tes(nama: string) {
  lolos++
  console.log(`  ok  ${nama}`)
}

const fetchAsli = globalThis.fetch

// Tiru browser: window ada, dan /mirror/... dilayani dari disk.
function pasangBidak() {
  ;(globalThis as { window?: unknown }).window = {}
  globalThis.fetch = (async (masukan: RequestInfo | URL, opsi?: RequestInit) => {
    const url = String(masukan)
    if (url.startsWith('/mirror/')) {
      const berkas = join(process.cwd(), 'public', url.replace(/^\//, ''))
      try {
        return new Response(readFileSync(berkas, 'utf8'), {
          status: 200,
          headers: { 'content-type': 'application/json' },
        })
      } catch {
        return new Response('tidak ada', { status: 404 })
      }
    }
    return fetchAsli(masukan, opsi)
  }) as typeof fetch
}

function lepasBidak() {
  globalThis.fetch = fetchAsli
  delete (globalThis as { window?: unknown }).window
}

// baseUrl diarahkan ke host yang sudah tercatat mati di SPEC §7.
function keHostMati(api: Api): Api {
  return ApiSchema.parse({ ...api, baseUrl: 'https://alamat.thecloudalert.com' })
}

async function main() {
  const wilayah = muatApi('wilayah-idn-area')!
  const provinsi = wilayah.endpoints.find((e) => e.id === 'provinsi')!
  const kelurahan = wilayah.endpoints.find((e) => e.id === 'kelurahan')!

  assert.equal(wilayah.mirror, true, 'wilayah-idn-area seharusnya ber-mirror: true')

  pasangBidak()
  try {
    // Inti T5.4: sumber mati, alat tetap dapat data.
    const mati = keHostMati(wilayah)
    const hasil = await ambil<{ data?: unknown[] }>(mati, provinsi)
    assert.equal(hasil.sumber, 'mirror', `sumber '${hasil.sumber}', bukan mirror`)
    assert.ok(hasil.per && !Number.isNaN(Date.parse(hasil.per)), `per tidak sah: ${hasil.per}`)
    assert.ok((hasil.data.data ?? []).length >= 38, 'isi mirror tidak lengkap')
    tes(`host mati -> jatuh ke mirror, sumber='mirror', per=${hasil.per?.slice(0, 10)}`)

    // Banner di UI bergantung pada dua nilai ini. Kalau `per` null, bannernya
    // menulis "sebelumnya" alih-alih tanggal — jadi keduanya diperiksa.
    assert.notEqual(hasil.per, null, 'per null: banner tidak bisa menampilkan tanggal')
    tes('sumber + per terisi, jadi banner UI bisa menampilkan tanggalnya')

    // Sumber hidup TIDAK boleh diam-diam memakai mirror.
    const langsung = await ambil<{ data?: unknown[] }>(wilayah, provinsi)
    assert.equal(langsung.sumber, 'langsung', `sumber '${langsung.sumber}' padahal API hidup`)
    assert.equal(langsung.per, null, 'per terisi padahal bukan dari mirror')
    tes('API hidup tetap sumber=langsung, bukan mirror')

    // Endpoint berparameter tidak ada di mirror. Yang benar: gagal jujur, bukan
    // mengembalikan data tingkat lain yang kebetulan ada di berkas.
    await assert.rejects(
      () => ambil(keHostMati(wilayah), kelurahan, { kodeKecamatan: '32.04.15' }),
      (e: unknown) => e instanceof GagalAmbil,
      'endpoint berparameter seharusnya gagal, bukan mengembalikan data lain',
    )
    tes('endpoint berparameter + host mati -> gagal jujur, tidak mengarang data')

    // API tanpa mirror tidak boleh menjanjikan apa pun.
    const sholat = muatApi('sholat-myquran')!
    assert.equal(sholat.mirror, false)
    await assert.rejects(
      () => ambilMirror(sholat, sholat.endpoints[0]),
      /tidak punya mirror/,
      'API tanpa mirror seharusnya menolak',
    )
    tes('API tanpa mirror menolak permintaan mirror dengan jelas')

    // jpl-ssd cors: none — di browser ia LANGSUNG ke mirror tanpa membuang
    // putaran gagal, dan itu yang membuat alat Objek Dekat Bumi bisa jalan.
    const jpl = muatApi('jpl-ssd')!
    const pendekatan = jpl.endpoints.find((e) => e.id === 'pendekatan')!
    const mulai = Date.now()
    const hasilJpl = await ambil<{ count?: number }>(jpl, pendekatan)
    const lama = Date.now() - mulai
    assert.equal(hasilJpl.sumber, 'mirror', 'jpl-ssd tidak lewat mirror di browser')
    assert.ok(lama < 2_000, `${lama} ms — sepertinya sempat mencoba jaringan dulu`)
    tes(`jpl-ssd (cors: none) langsung ke mirror dalam ${lama} ms, tanpa putaran gagal`)
  } finally {
    lepasBidak()
  }

  // Di luar browser, mirror tidak dipakai: probe dan skrip harus melihat kenyataan
  // sumber aslinya, bukan salinan.
  await assert.rejects(
    () => ambil(keHostMati(wilayah), provinsi),
    (e: unknown) => e instanceof GagalAmbil,
    'di Node seharusnya gagal, bukan diam-diam pakai mirror',
  )
  tes('di luar browser, host mati tetap gagal — probe melihat kenyataan')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
