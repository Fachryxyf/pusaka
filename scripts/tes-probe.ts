// T3.1 kriteria selesai. Butuh jaringan.
//
// Yang diuji bukan cuma "probe jalan", tapi bahwa keenam mode kematian di SPEC §9
// benar-benar tertangkap — termasuk jebakan Bukuacak yang dulu meloloskan probe
// versi awal.
import assert from 'node:assert/strict'
import { probeEndpoint, umurData } from '@/lib/probe'
import { muatApi } from '@/lib/registry'
import { ApiSchema, type Api, type Endpoint } from '@/registry/schema'

let lolos = 0
function tes(nama: string) {
  lolos++
  console.log(`  ok  ${nama}`)
}

// Bikin API tiruan tanpa menulis YAML ke registry: yang diuji lib/probe.ts,
// bukan loadernya.
function apiPalsu(baseUrl: string, contohPath: string, minUkuranByte = 10): { api: Api; ep: Endpoint } {
  const api = ApiSchema.parse({
    slug: 'uji-probe',
    nama: 'Uji Probe',
    kategori: 'uji',
    deskripsi: 'Untuk tes probe.',
    developer: { nama: 'Uji', profil: null },
    dokumentasi: 'https://contoh.test/docs',
    upstreamName: null,
    auth: 'none',
    cors: 'unknown',
    baseUrl,
    mirror: false,
    endpoints: [
      {
        id: 'uji',
        method: 'GET',
        path: contohPath,
        deskripsi: 'Endpoint uji.',
        params: [],
        contohPath,
        minUkuranByte,
      },
    ],
  })
  return { api, ep: api.endpoints[0] }
}

async function main() {
  // Endpoint sehat: kelima syarat lolos, dan cors terbaca dari header asli.
  const gempa = muatApi('gempa-bmkg')!
  const autogempa = gempa.endpoints.find((e) => e.id === 'autogempa')!
  const sehat = await probeEndpoint(gempa, autogempa)
  assert.equal(sehat.ok, true, `gempa-bmkg gagal: ${sehat.sebab}`)
  assert.equal(sehat.status, 200)
  assert.match(sehat.contentType, /json/)
  assert.equal(sehat.cors, 'open')
  assert.ok(sehat.latencyMs > 0 && sehat.ukuranByte >= autogempa.minUkuranByte)
  tes(`endpoint sehat -> ok, cors terukur '${sehat.cors}', ${sehat.latencyMs}ms`)

  // JEBAKAN BUKUACAK: 200 + CORS * tapi Content-Type text/html. Probe versi awal
  // kemakan ini, dan syarat 2 yang menangkapnya (SPEC §7, §9).
  const buku = apiPalsu('https://bukuacak.vercel.app', '/api/v1/book')
  const html = await probeEndpoint(buku.api, buku.ep)
  assert.equal(html.ok, false, 'SPA yang membalas HTML malah dilaporkan sehat')
  assert.ok(
    html.sebab?.includes('bukan JSON') || html.sebab?.includes('status'),
    `sebab tak terduga: ${html.sebab}`,
  )
  tes(`jebakan Bukuacak tertangkap: ${html.sebab}`)

  // Host yang tidak ada: dicatat status 0 dengan sebab, bukan melempar galat.
  const mati = apiPalsu('https://alamat.thecloudalert.com', '/api/daftar/get/')
  const tanpaHost = await probeEndpoint(mati.api, mati.ep)
  assert.equal(tanpaHost.ok, false)
  assert.ok(tanpaHost.status === 0 || tanpaHost.status >= 400, `status ${tanpaHost.status}`)
  tes(`host mati -> ok: false tanpa melempar (status ${tanpaHost.status})`)

  // Syarat 5: ambang ukuran. Endpoint sehat diberi ambang mustahil, harus gagal —
  // ini yang menangkap scraper mati yang membalas bungkus normal isi kosong.
  const ambangMustahil = apiPalsu(
    'https://data.bmkg.go.id',
    '/DataMKG/TEWS/autogempa.json',
    10_000_000,
  )
  const kekecilan = await probeEndpoint(ambangMustahil.api, ambangMustahil.ep)
  assert.equal(kekecilan.ok, false, 'ambang ukuran tidak dipaksakan')
  assert.match(kekecilan.sebab ?? '', /di bawah ambang/)
  tes(`ambang minUkuranByte dipaksakan: ${kekecilan.sebab}`)

  // Status >= 400 pada JSON yang sah tetap gagal (syarat 1 sebelum syarat 3).
  const empatnolempat = apiPalsu('https://equran.id', '/api/v2/surat/115')
  const galat404 = await probeEndpoint(empatnolempat.api, empatnolempat.ep)
  assert.equal(galat404.ok, false)
  assert.equal(galat404.status, 404)
  assert.match(galat404.sebab ?? '', /status 404/)
  tes('404 yang membalas JSON sah tetap ok: false')

  // Mode kematian keenam: data sah tapi beku. TIDAK memengaruhi ok, tapi wajib
  // tercatat supaya bisa dilihat manusia.
  const berita = muatApi('berita-indo')!
  const voa = berita.endpoints.find((e) => e.id === 'voaSemua')!
  const beku = await probeEndpoint(berita, voa)
  assert.equal(beku.ok, true, 'VOA seharusnya tetap ok — endpointnya bekerja')
  assert.ok(
    typeof beku.umurDataHari === 'number' && beku.umurDataHari > 30,
    `umurDataHari ${beku.umurDataHari} — VOA segar lagi? perbarui REFERENCE.md`,
  )
  tes(`data beku tercatat tanpa memvonis mati: umur ${beku.umurDataHari} hari`)

  // umurData: fungsi murni, diuji tanpa jaringan.
  assert.equal(umurData('{"tidak ada tanggal":1}'), null)
  assert.equal(umurData('{"waktu":"2026-12-31T00:00:00Z"}'), 0, 'stempel masa depan = segar')
  const seminggu = new Date(Date.now() - 7 * 86_400_000).toISOString()
  assert.equal(umurData(`{"isoDate":"${seminggu}"}`), 7)
  // Yang diambil harus stempel TERBARU, bukan yang pertama ditemui.
  assert.equal(umurData(`{"a":"2020-01-01T00:00:00Z","b":"${seminggu}"}`), 7)
  tes('umurData mengambil stempel terbaru, dan masa depan dianggap segar')

  console.log(`\n${lolos} tes lolos.`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
